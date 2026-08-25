// backend/src/services/ai.service.js
//
// Toute la logique IA de la plateforme passe par ici :
//  - callLLM()              : routeur — appelle Claude OU Gemini selon AI_PROVIDER
//  - speakingReply()       : fait parler le personnage du scenario (Speaking Lab)
//  - speakingScore()       : note une session de speaking terminee
//  - correctionAssist()    : aide le prof a corriger une composition (facultatif, prof reste decisionnaire)
//
// PROVIDER SWAPPABLE : mets AI_PROVIDER=anthropic ou AI_PROVIDER=gemini dans
// .env pour choisir. Gemini a un vrai palier gratuit (aistudio.google.com,
// sans carte bancaire) — ideal pour demarrer sans frais ; Claude est plus
// cher mais generalement plus fiable sur les reponses JSON strictes. Aucune
// autre partie du code n'a besoin de changer pour basculer de l'un a l'autre.
//
// Sans cle API du provider choisi, ces fonctions renvoient une erreur
// explicite — le reste de la plateforme continue de fonctionner normalement.

import https from "node:https";

function provider() {
  return (process.env.AI_PROVIDER || "anthropic").toLowerCase();
}

function callLLM(opts) {
  return provider() === "gemini" ? callGemini(opts) : callClaude(opts);
}

const CLAUDE_MODEL = () => process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

function callClaude({ system, messages, maxTokens = 700 }) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      reject(new Error("ANTHROPIC_API_KEY absent - le Speaking Lab / assistant IA est desactive."));
      return;
    }

    const body = JSON.stringify({
      model: CLAUDE_MODEL(),
      max_tokens: maxTokens,
      system,
      messages,
    });

    const req = https.request(
      {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) return reject(new Error(parsed.error.message || "Erreur API Anthropic"));
            const text = (parsed.content || [])
              .filter((b) => b.type === "text")
              .map((b) => b.text)
              .join("\n");
            resolve(text);
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Gemini utilise "model" au lieu de "assistant" pour le role, et un objet
// systemInstruction separe plutot qu'un champ "system" au meme niveau.
const GEMINI_MODEL = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

function callGemini({ system, messages, maxTokens = 700 }) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      reject(new Error("GEMINI_API_KEY absent - le Speaking Lab / assistant IA est desactive."));
      return;
    }

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: maxTokens },
    });

    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/${GEMINI_MODEL()}:generateContent?key=${apiKey}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) return reject(new Error(parsed.error.message || "Erreur API Gemini"));
            const text = (parsed.candidates?.[0]?.content?.parts || [])
              .map((p) => p.text || "")
              .join("\n");
            resolve(text);
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/**
 * Genere la reponse du personnage IA dans un scenario de Speaking Lab.
 * Le prompt systeme est calibre sur le NIVEAU de l'eleve pour eviter de
 * lui envoyer un anglais trop complexe (principe demande explicitement :
 * un debutant ne doit pas recevoir de phrases avancees).
 */
export async function speakingReply({ scenario, level, history, studentMessage }) {
  const levelGuidance = {
    Beginner: "Use very short, simple sentences (A1-A2). Simple present/past only. Common everyday words. Speak slowly and clearly, one idea per sentence.",
    Intermediate: "Use natural but accessible sentences (A2-B1). You may use a few linking words (because, but, so). Avoid rare vocabulary or complex idioms.",
    Advanced: "Use natural, fluent English (B1-B2), closer to how a native speaker would really talk, but stay clear and avoid obscure slang.",
  }[level] || "Use simple, clear English suitable for a learner.";

  const system = `You are role-playing as: ${scenario.ai_persona}.
Scenario: ${scenario.title}.
Pedagogical goal for the student: ${scenario.goal}.
Learner level: ${level}. ${levelGuidance}
Stay strictly in character. Keep every reply to 1-2 short sentences maximum.
Ask a natural follow-up question when appropriate, to keep the conversation going.
Never break character to explain grammar mid-conversation — this is a real-time roleplay, not a lesson.
If the student's message is unclear or contains errors, respond naturally the way a kind native speaker would (you may gently rephrase what you understood), without explicitly correcting them.`;

  const messages = [
    ...history.map((m) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: studentMessage },
  ];

  const reply = await callLLM({ system, messages, maxTokens: 200 });
  return reply.trim();
}

/**
 * Note une conversation de Speaking Lab terminee (transcript complet)
 * sur 4 sous-competences + un score global, avec un court feedback.
 * Retourne un JSON structure (le modele est instruit de repondre en JSON strict).
 */
export async function speakingScore({ scenario, level, transcript }) {
  const conversationText = transcript
    .map((m) => `${m.from === "ai" ? scenario.ai_persona : "Student"}: ${m.text}`)
    .join("\n");

  const system = `You are an English teacher assessing a learner's SPOKEN English from a role-play transcript (the student's turns only should be scored; the AI/other-character turns are context).
Learner level: ${level}.
Score generously but honestly for a learner at this level — do not expect native fluency.
Respond ONLY with strict JSON, no markdown, no preamble, in this exact shape:
{"pronunciation": <0-100>, "fluency": <0-100>, "grammar": <0-100>, "vocabulary": <0-100>, "overall": <0-100>, "feedback": "<2-3 short encouraging sentences in English, mentioning one specific strength and one specific thing to improve>"}`;

  const messages = [
    { role: "user", content: `Transcript:\n${conversationText}\n\nScore the student's performance now.` },
  ];

  const raw = await callLLM({ system, messages, maxTokens: 400 });
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Reponse IA non structuree (scoring).");
  return JSON.parse(jsonMatch[0]);
}

/**
 * Aide (facultative) le professeur a corriger une composition : releve les
 * erreurs et propose un score indicatif. Le professeur reste TOUJOURS
 * decisionnaire — ceci ne remplace jamais sa correction, seulement une
 * premiere passe pour lui faire gagner du temps.
 */
export async function correctionAssist({ prompt, minWords, studentText }) {
  const system = `You are helping an English teacher pre-correct a student's written composition.
The assignment was: "${prompt}" (minimum ${minWords} words).
Identify grammar/vocabulary/spelling issues. Respond ONLY with strict JSON:
{"suggestedScore": <0-100>, "strengths": "<1-2 sentences>", "improvements": "<1-2 sentences>", "annotatedIssues": [{"original": "...", "suggestion": "...", "type": "grammar|vocabulary|spelling"}]}
Keep annotatedIssues to at most 6 of the most important issues. This is a DRAFT for the teacher — do not address the student directly.`;

  const messages = [{ role: "user", content: studentText }];
  const raw = await callLLM({ system, messages, maxTokens: 600 });
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Reponse IA non structuree (correction).");
  return JSON.parse(jsonMatch[0]);
}
