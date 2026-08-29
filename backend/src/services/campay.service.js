// backend/src/services/campay.service.js
//
// CamPay est une fintech camerounaise specialisee Mobile Money (MTN + Orange).
// Contrairement a CinetPay, il n'y a PAS de page de paiement externe : on
// envoie le numero de telephone de l'eleve, et CamPay declenche un push USSD
// direct sur son telephone (il tape juste son code PIN MoMo/Orange Money).
// Le frontend doit ensuite interroger le statut jusqu'a confirmation.
//
// Limite connue : CamPay ne couvre QUE le Mobile Money, pas les cartes
// Visa/Mastercard. Si les cartes deviennent necessaires plus tard, il faudra
// ajouter un second prestataire (Flutterwave, Stripe...) en parallele.
//
// Sans CAMPAY_PERMANENT_TOKEN, les fonctions renvoient une erreur claire —
// le reste de la plateforme continue de fonctionner.

import https from "node:https";

function baseHost() {
  return process.env.CAMPAY_ENV === "DEV" ? "demo.campay.net" : "www.campay.net";
}

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const token = process.env.CAMPAY_PERMANENT_TOKEN;
    if (!token) {
      reject(new Error("CAMPAY_PERMANENT_TOKEN absent - les paiements sont desactives."));
      return;
    }

    const payload = body ? JSON.stringify(body) : undefined;
    const req = https.request(
      {
        hostname: baseHost(),
        path: `/api${path}`,
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try { resolve(JSON.parse(raw)); } catch (err) { reject(err); }
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

/**
 * Declenche un push Mobile Money direct sur le telephone de l'eleve.
 * phone doit inclure l'indicatif pays sans "+" : ex "2376XXXXXXXX".
 */
export async function collectPayment({ amount, currency, phone, description, externalReference }) {
  const result = await request("POST", "/collect/", {
    amount: String(amount),
    currency,
    from: phone,
    description,
    external_reference: externalReference,
  });

  if (result.reference) {
    return { reference: result.reference, status: normalizeStatus(result.status) };
  }
  throw new Error(result.message || result.detail || JSON.stringify(result).slice(0, 200) || "Erreur CamPay lors de l'initiation du paiement.");
}

/**
 * Verifie le statut reel d'une transaction aupres de CamPay (ne jamais se
 * fier uniquement au webhook — toujours re-verifier ici).
 */
export async function checkStatus(reference) {
  const result = await request("POST", "/transaction/status/", { reference });
  return { status: normalizeStatus(result.status), raw: result };
}

function normalizeStatus(campayStatus) {
  if (campayStatus === "SUCCESSFUL") return "success";
  if (campayStatus === "FAILED" || campayStatus === "DECLINED") return "failed";
  return "pending";
}
