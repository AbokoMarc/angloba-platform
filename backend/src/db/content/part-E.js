// Part E — semaines 33 à 36 (Debate, Problem Solving, Simulation, Final Assessment)
let qCount = 0;
// Place la bonne réponse à une position qui tourne (0,1,2) pour équilibrer correctIndex.
const q = (question, options, correctIndex) => {
  const right = options[correctIndex];
  const others = options.filter((_, i) => i !== correctIndex);
  const target = qCount++ % 3;
  others.splice(target, 0, right);
  return { question, options: others, correctIndex: target };
};

export const GRAMMAR_HTML = {
  33: `<p>Use <b>modals</b> and <b>conditionals</b> to give opinions, agree, disagree and discuss possibilities.</p>
<table>
<tr><th>Form</th><th>Use</th><th>Example</th></tr>
<tr><td>must / have to</td><td>obligation</td><td>We <b>have to</b> decide today. <i>(Nous devons décider aujourd'hui.)</i></td></tr>
<tr><td>mustn't</td><td>prohibition</td><td>You <b>mustn't</b> copy answers. <i>(Il est interdit de copier.)</i></td></tr>
<tr><td>might / could</td><td>possibility</td><td>It <b>might</b> rain. <i>(Il se pourrait qu'il pleuve.)</i></td></tr>
<tr><td>1st conditional</td><td>real future</td><td>If prices rise, people <b>will</b> complain. <i>(Si les prix montent, les gens se plaindront.)</i></td></tr>
<tr><td>2nd conditional</td><td>unreal / imagined</td><td>If I <b>were</b> president, I <b>would</b> build schools. <i>(Si j'étais président, je construirais des écoles.)</i></td></tr>
</table>
<p><b>Debate phrases:</b></p>
<ul>
<li>In my opinion, ... / I strongly believe that ... <i>(À mon avis... / Je crois fermement que...)</i></li>
<li>I see your point, but ... <i>(Je comprends, mais...)</i></li>
<li>I completely agree / I'm afraid I disagree. <i>(Je suis tout à fait d'accord / Je ne suis pas d'accord.)</i></li>
</ul>
<p><b>Attention:</b> after <i>if</i>, never use <i>will</i> or <i>would</i>. Say "If it rains, we will stay", not "If it will rain". Also, <i>I am agree</i> is wrong: say <b>I agree</b>.</p>
<p><b>Remember:</b> 1st conditional = if + present, will + verb. 2nd conditional = if + past, would + verb.</p>`,
  34: `<p>To solve problems in English, choose the right <b>tense</b>, ask clear <b>questions</b> and link your ideas.</p>
<table>
<tr><th>Tense</th><th>Example</th></tr>
<tr><td>Present simple</td><td>The printer <b>doesn't work</b>. <i>(L'imprimante ne marche pas.)</i></td></tr>
<tr><td>Present continuous</td><td>I <b>am trying</b> to fix it. <i>(J'essaie de la réparer.)</i></td></tr>
<tr><td>Past simple</td><td>It <b>stopped</b> yesterday. <i>(Elle s'est arrêtée hier.)</i></td></tr>
<tr><td>Present perfect</td><td>I <b>have tried</b> everything. <i>(J'ai tout essayé.)</i></td></tr>
<tr><td>Future (will / going to)</td><td>I <b>will call</b> a technician. <i>(J'appellerai un technicien.)</i></td></tr>
</table>
<p><b>Question forms:</b> What happened? When did it start? Have you checked the cable? Could you tell me what you did?</p>
<p><b>Linking words:</b> <i>first, then, however, so, because, as a result, although</i>.</p>
<ul>
<li>I called the shop <b>because</b> the screen was broken. <i>(J'ai appelé la boutique parce que l'écran était cassé.)</i></li>
<li>It is old, <b>so</b> we should replace it. <i>(Il est vieux, donc nous devrions le remplacer.)</i></li>
</ul>
<p><b>Attention:</b> French speakers often say "I have lost it yesterday". With a finished time (yesterday, last week) use the past simple: <b>I lost it yesterday</b>.</p>
<p><b>Remember:</b> state the problem, explain the cause, suggest a solution, agree on the next step.</p>`,
  35: `<p>This week we revise the key structures of the whole course and use them in a full day in English.</p>
<table>
<tr><th>Structure</th><th>Example</th></tr>
<tr><td>to be / have got</td><td>I <b>am</b> a student. I <b>have got</b> two brothers. <i>(Je suis étudiant. J'ai deux frères.)</i></td></tr>
<tr><td>Present simple</td><td>She <b>starts</b> work at eight. <i>(Elle commence à huit heures.)</i></td></tr>
<tr><td>Past simple</td><td>We <b>visited</b> Douala last year. <i>(Nous avons visité Douala l'an dernier.)</i></td></tr>
<tr><td>Present perfect</td><td>I <b>have lived</b> here for five years. <i>(J'habite ici depuis cinq ans.)</i></td></tr>
<tr><td>Comparatives</td><td>Buses are <b>cheaper than</b> taxis. <i>(Les bus sont moins chers que les taxis.)</i></td></tr>
<tr><td>Modals</td><td>You <b>should</b> sleep more. <i>(Tu devrais dormir plus.)</i></td></tr>
<tr><td>Conditionals</td><td>If I <b>have</b> time, I <b>will</b> call you. <i>(Si j'ai le temps, je t'appellerai.)</i></td></tr>
<tr><td>Passive</td><td>English <b>is spoken</b> worldwide. <i>(L'anglais est parlé dans le monde entier.)</i></td></tr>
</table>
<p><b>A day in English:</b> <i>"I get up at six, then I take a taxi to work. At nine we have a meeting. I'm going to present my project. After work, I'll buy some food and cook dinner."</i></p>
<p><b>Attention:</b> do not say "I am agree" or "I have 25 years". Say <b>I agree</b> and <b>I am 25 years old</b>.</p>
<p><b>Remember:</b> good English is clear and simple. Use the right tense, link your ideas and ask when you do not understand.</p>`,
  36: `<p>You are at the end of the course. This week you consolidate everything and take the final assessment.</p>
<p><b>Checklist: I can now ...</b></p>
<ul>
<li>introduce myself and talk about my daily life. <i>(me présenter et parler de ma vie quotidienne)</i></li>
<li>tell a story in the past. <i>(raconter une histoire au passé)</i></li>
<li>make plans and predictions. <i>(faire des projets et des prévisions)</i></li>
<li>give and defend an opinion politely. <i>(donner et défendre une opinion poliment)</i></li>
<li>write an email and a short composition. <i>(écrire un e-mail et une courte rédaction)</i></li>
<li>solve a problem in a conversation. <i>(résoudre un problème lors d'une conversation)</i></li>
</ul>
<table>
<tr><th>Test part</th><th>Tip</th></tr>
<tr><td>Presentation</td><td>Plan: introduction, three points, conclusion. <i>(Plan : introduction, trois points, conclusion.)</i></td></tr>
<tr><td>Conversation</td><td>Answer with a reason: "I like it because ...". <i>(Réponds avec une raison.)</i></td></tr>
<tr><td>Writing</td><td>Check tenses, spelling and linking words. <i>(Vérifie les temps, l'orthographe et les connecteurs.)</i></td></tr>
</table>
<p><b>Attention:</b> French speakers often say "I will call you when I will arrive". After <i>when</i> use the present: <b>I will call you when I arrive</b>.</p>
<p><b>Remember:</b> read each question twice, speak slowly, and if you do not know a word, explain it with other words. Good luck!</p>`,
};

export const VOCABULARY = {
  33: [
    { word: "argument", wordType: "noun", fr: "argument" },
    { word: "opponent", wordType: "noun", fr: "adversaire" },
    { word: "evidence", wordType: "noun", fr: "preuve, éléments probants" },
    { word: "claim", wordType: "verb", fr: "affirmer, prétendre" },
    { word: "convince", wordType: "verb", fr: "convaincre" },
    { word: "oppose", wordType: "verb", fr: "s'opposer à" },
    { word: "controversial", wordType: "adjective", fr: "controversé" },
    { word: "biased", wordType: "adjective", fr: "partial" },
    { word: "reasonable", wordType: "adjective", fr: "raisonnable" },
    { word: "drawback", wordType: "noun", fr: "inconvénient" },
    { word: "advantage", wordType: "noun", fr: "avantage" },
    { word: "on the other hand", wordType: "phrase", fr: "d'autre part" },
    { word: "I see your point", wordType: "phrase", fr: "je comprends votre point de vue" },
    { word: "debate", wordType: "noun", fr: "débat" },
    { word: "persuade", wordType: "verb", fr: "persuader" },
    { word: "strongly", wordType: "adverb", fr: "fermement, fortement" },
  ],
  34: [
    { word: "issue", wordType: "noun", fr: "problème, question" },
    { word: "solution", wordType: "noun", fr: "solution" },
    { word: "cause", wordType: "noun", fr: "cause" },
    { word: "solve", wordType: "verb", fr: "résoudre" },
    { word: "cope with", wordType: "phrase", fr: "faire face à" },
    { word: "figure out", wordType: "phrase", fr: "comprendre, trouver la solution" },
    { word: "deal with", wordType: "phrase", fr: "s'occuper de, gérer" },
    { word: "obstacle", wordType: "noun", fr: "obstacle" },
    { word: "urgent", wordType: "adjective", fr: "urgent" },
    { word: "available", wordType: "adjective", fr: "disponible" },
    { word: "alternative", wordType: "noun", fr: "alternative, solution de rechange" },
    { word: "improve", wordType: "verb", fr: "améliorer" },
    { word: "suggest", wordType: "verb", fr: "suggérer, proposer" },
    { word: "budget", wordType: "noun", fr: "budget" },
    { word: "deadline", wordType: "noun", fr: "date limite" },
    { word: "unfortunately", wordType: "adverb", fr: "malheureusement" },
    { word: "by the way", wordType: "phrase", fr: "au fait, à propos" },
  ],
  35: [
    { word: "schedule", wordType: "noun", fr: "emploi du temps, programme" },
    { word: "appointment", wordType: "noun", fr: "rendez-vous" },
    { word: "commute", wordType: "verb", fr: "faire le trajet domicile-travail" },
    { word: "agenda", wordType: "noun", fr: "ordre du jour" },
    { word: "colleague", wordType: "noun", fr: "collègue" },
    { word: "reservation", wordType: "noun", fr: "réservation" },
    { word: "receipt", wordType: "noun", fr: "reçu, ticket de caisse" },
    { word: "refund", wordType: "noun", fr: "remboursement" },
    { word: "cancel", wordType: "verb", fr: "annuler" },
    { word: "postpone", wordType: "verb", fr: "reporter" },
    { word: "reliable", wordType: "adjective", fr: "fiable" },
    { word: "take care of", wordType: "phrase", fr: "s'occuper de" },
    { word: "run out of", wordType: "phrase", fr: "être à court de" },
    { word: "meanwhile", wordType: "adverb", fr: "pendant ce temps" },
    { word: "afterwards", wordType: "adverb", fr: "ensuite, après" },
    { word: "pick up", wordType: "phrase", fr: "récupérer, aller chercher" },
  ],
  36: [
    { word: "achievement", wordType: "noun", fr: "réussite, accomplissement" },
    { word: "progress", wordType: "noun", fr: "progrès" },
    { word: "improvement", wordType: "noun", fr: "amélioration" },
    { word: "confidence", wordType: "noun", fr: "confiance en soi" },
    { word: "fluent", wordType: "adjective", fr: "courant, aisé" },
    { word: "accurate", wordType: "adjective", fr: "précis, correct" },
    { word: "assess", wordType: "verb", fr: "évaluer" },
    { word: "review", wordType: "verb", fr: "réviser, revoir" },
    { word: "overcome", wordType: "verb", fr: "surmonter" },
    { word: "challenge", wordType: "noun", fr: "défi" },
    { word: "goal", wordType: "noun", fr: "objectif" },
    { word: "keep up", wordType: "phrase", fr: "continuer, maintenir le rythme" },
    { word: "look forward to", wordType: "phrase", fr: "avoir hâte de" },
    { word: "proud", wordType: "adjective", fr: "fier" },
    { word: "eventually", wordType: "adverb", fr: "finalement, à la longue" },
    { word: "congratulations", wordType: "interjection", fr: "félicitations" },
  ],
};

export const EXERCISES = {
  33: [
    q("You ___ wear a seat belt. It is the law.", ["might", "have to", "could"], 1),
    q("You ___ smoke in the hospital. It is forbidden.", ["mustn't", "don't have to", "might not"], 0),
    q("If it rains tomorrow, we ___ at home.", ["would stay", "will stay", "stayed"], 1),
    q("If I ___ rich, I would travel the world.", ["am", "will be", "were"], 2),
    q("Choose the correct sentence.", ["I am agree with you.", "I agree with you.", "I agree to you."], 1),
    q("She ___ come to the debate, but she is not sure.", ["might", "must", "has to"], 0),
    q("If you ___ harder, you will pass the exam.", ["will study", "studied", "study"], 2),
    q("Which phrase shows disagreement politely?", ["I'm afraid I disagree.", "You are completely stupid.", "I totally agree."], 0),
    q("\"Tomorrow is a holiday, so you ___ come to work.\" (not necessary)", ["mustn't", "don't have to", "can't to"], 1),
    q("What would you do if you ___ a million dollars?", ["win", "will win", "won"], 2),
    q("The word \"drawback\" means:", ["an advantage", "a disadvantage", "a drawing"], 1),
    q("\"I see your point, ___ I think you are wrong.\"", ["but", "so", "because"], 0),
    q("Which is the best connector: \"The plan is cheap. ___, it is not very safe.\"", ["Moreover", "However", "Therefore"], 1),
    q("If he ___ earlier, he would not miss the bus.", ["leaves", "will leave", "left"], 2),
    q("\"It ___ be true.\" (I am sure it is impossible)", ["can't", "mustn't", "needn't"], 0),
    q("Which sentence is a first conditional?", ["If I see him, I will tell him.", "If I saw him, I would tell him.", "If I had seen him, I would have told him."], 0),
    q("\"Evidence\" means:", ["an opinion", "a proof", "an opponent"], 1),
    q("In a debate, \"On the other hand\" introduces:", ["a different point of view", "a thank you", "a final goodbye"], 0),
    q("Choose the correct form: \"If I ___ you, I would accept the offer.\"", ["was", "am", "were"], 2),
    q("\"You ___ shout. We can hear you very well.\" (it is not necessary)", ["don't have to", "mustn't", "can't"], 0),
  ],
  34: [
    q("I ___ my keys yesterday, so I could not open the door.", ["have lost", "lost", "lose"], 1),
    q("Look! The printer ___ smoke.", ["makes", "is making", "made"], 1),
    q("Choose the correct question: ___ the problem start?", ["When did", "When does", "When has"], 0),
    q("I have ___ called the technician three times.", ["yet", "already", "ago"], 1),
    q("\"Figure out\" means:", ["to draw a number", "to find a solution", "to forget"], 1),
    q("We missed the train ___ we left home late.", ["because", "so", "although"], 0),
    q("The shop was closed, ___ we went to another one.", ["because", "so", "but"], 1),
    q("___ it was raining, they played football.", ["Because", "So", "Although"], 2),
    q("Which sentence is correct?", ["I am living here since 2020.", "I have lived here since 2020.", "I live here since 2020."], 1),
    q("Could you tell me ___ the station is?", ["where is", "where the station", "where"], 1),
    q("Which verb means \"to manage a difficult situation\"?", ["cope with", "look for", "give up"], 0),
    q("The deadline is tomorrow, so the work is ___.", ["urgent", "available", "reasonable"], 0),
    q("\"I'm going to call him now\" expresses:", ["a past habit", "a plan or intention", "an obligation"], 1),
    q("What ___ you do when the power went out?", ["did", "have", "do"], 0),
    q("I can't come tonight. ___, I will join you tomorrow.", ["However", "Because", "Unless"], 0),
    q("Choose the best suggestion.", ["Why don't we ask the manager?", "Why we don't ask the manager?", "Why not we ask the manager?"], 0),
    q("If we ___ the budget, we can buy more computers.", ["increase", "increased", "would increase"], 0),
    q("The opposite of \"available\" is:", ["unavailable", "unreasonable", "unlikely"], 0),
    q("I have been waiting ___ two hours.", ["since", "for", "during"], 1),
    q("\"Deal with\" a problem means:", ["to ignore it", "to handle it", "to create it"], 1),
  ],
  35: [
    q("I ___ to the market every Saturday.", ["go", "am going", "went"], 0),
    q("She ___ at the bank for six years.", ["works", "worked", "has worked"], 2),
    q("This phone is ___ than that one.", ["more cheap", "cheaper", "cheapest"], 1),
    q("The meeting is ___ Monday ___ 10 o'clock.", ["in / on", "on / at", "at / on"], 1),
    q("Choose the passive: \"They built this bridge in 1990.\"", ["This bridge built in 1990.", "This bridge was built in 1990.", "This bridge has built in 1990."], 1),
    q("\"Run out of\" means:", ["to have no more of something", "to run quickly", "to leave a place"], 0),
    q("I'd like to ___ my reservation for Friday. I cannot come.", ["cancel", "commute", "assess"], 0),
    q("Which is the most polite request?", ["Give me the menu.", "Could I have the menu, please?", "I want the menu."], 1),
    q("What time ___ the shop open on Sundays?", ["do", "does", "is"], 1),
    q("I am 25 ___ old.", ["years", "year", "ages"], 0),
    q("She is the ___ student in our class.", ["more intelligent", "most intelligent", "intelligentest"], 1),
    q("\"Postpone\" means:", ["to cancel forever", "to move to a later time", "to arrive early"], 1),
    q("We ___ lunch when the phone rang.", ["had", "were having", "have"], 1),
    q("You ___ see a doctor. You look very ill.", ["should", "might", "can"], 0),
    q("Please keep the ___ if you want a refund.", ["receipt", "agenda", "colleague"], 0),
    q("\"Pick up\" the children means:", ["to carry them in the air", "to collect them", "to teach them"], 1),
    q("Which sentence is correct?", ["There is many people here.", "There are many people here.", "There are much people here."], 1),
    q("I have ___ money left. I can't buy it.", ["a few", "little", "many"], 1),
    q("He asked me ___ I lived.", ["where", "where did", "where do"], 0),
    q("I will call you as soon as I ___.", ["will arrive", "arrive", "arrived"], 1),
  ],
  36: [
    q("Yesterday I ___ a very interesting film.", ["see", "have seen", "saw"], 2),
    q("If I ___ more time, I would study every day.", ["have", "had", "will have"], 1),
    q("She has lived in Yaoundé ___ 2018.", ["since", "for", "ago"], 0),
    q("Choose the correct sentence.", ["I have 30 years.", "I am 30 years old.", "I have 30 years old."], 1),
    q("I look forward ___ you.", ["to see", "to seeing", "seeing"], 1),
    q("\"Fluent\" means:", ["able to speak easily and smoothly", "very quiet", "afraid to speak"], 0),
    q("You ___ cheat in the exam. It is not allowed.", ["don't have to", "mustn't", "might not"], 1),
    q("My English is ___ than last year.", ["better", "more good", "best"], 0),
    q("\"Congratulations!\" is said when someone:", ["fails", "succeeds", "leaves"], 1),
    q("I will phone you when I ___ home.", ["get", "will get", "got"], 0),
    q("He is interested ___ music.", ["on", "in", "at"], 1),
    q("\"Overcome a challenge\" means:", ["to avoid it", "to succeed against it", "to create it"], 1),
    q("This is the book ___ I told you about.", ["who", "which", "where"], 1),
    q("By next year, I ___ the course.", ["will finish", "will have finished", "have finished"], 1),
    q("Which linking word shows contrast?", ["although", "because", "so"], 0),
    q("The report ___ by the manager yesterday.", ["was written", "wrote", "is writing"], 0),
    q("\"Keep up\" the good work means:", ["stop working", "continue at the same level", "start again"], 1),
    q("Which is the most formal?", ["Hey, what's up?", "Dear Sir or Madam,", "Yo, listen!"], 1),
    q("She suggested ___ to the cinema.", ["to go", "going", "go"], 1),
    q("\"Assess\" means:", ["to evaluate", "to forget", "to repeat"], 0),
  ],
};

export const KEY_PHRASES = {
  33: [
    { en: "In my opinion, English should be taught in every primary school.", fr: "À mon avis, l'anglais devrait être enseigné dans toutes les écoles primaires." },
    { en: "I see your point, but I don't completely agree.", fr: "Je comprends votre point de vue, mais je ne suis pas tout à fait d'accord." },
    { en: "On the other hand, there are some drawbacks.", fr: "D'autre part, il y a quelques inconvénients." },
    { en: "If I were the mayor, I would improve public transport.", fr: "Si j'étais le maire, j'améliorerais les transports en commun." },
    { en: "Could you give me some evidence for that?", fr: "Pourriez-vous me donner des preuves de cela ?" },
    { en: "I strongly believe that we have to act now.", fr: "Je crois fermement que nous devons agir maintenant." },
  ],
  34: [
    { en: "We have a problem with the internet connection.", fr: "Nous avons un problème avec la connexion internet." },
    { en: "What do you think is the cause of the problem?", fr: "À ton avis, quelle est la cause du problème ?" },
    { en: "Why don't we ask the manager for help?", fr: "Pourquoi ne pas demander de l'aide au directeur ?" },
    { en: "I've already tried restarting the computer, but it didn't work.", fr: "J'ai déjà essayé de redémarrer l'ordinateur, mais ça n'a pas marché." },
    { en: "Unfortunately, we don't have enough budget for that option.", fr: "Malheureusement, nous n'avons pas assez de budget pour cette option." },
    { en: "Let's try the second solution and see what happens.", fr: "Essayons la deuxième solution et voyons ce qui se passe." },
  ],
  35: [
    { en: "I get up at six and take a taxi to work.", fr: "Je me lève à six heures et je prends un taxi pour aller au travail." },
    { en: "Excuse me, could I make a reservation for tonight?", fr: "Excusez-moi, pourrais-je faire une réservation pour ce soir ?" },
    { en: "I'm sorry, I have to postpone our appointment until Friday.", fr: "Je suis désolé, je dois reporter notre rendez-vous à vendredi." },
    { en: "Could I have a receipt, please?", fr: "Pourrais-je avoir un reçu, s'il vous plaît ?" },
    { en: "I'd like a refund because the product doesn't work.", fr: "Je voudrais un remboursement parce que le produit ne fonctionne pas." },
    { en: "After work, I'll pick up my sister and cook dinner.", fr: "Après le travail, j'irai chercher ma sœur et je préparerai le dîner." },
  ],
  36: [
    { en: "Hello, everyone. Today I'm going to talk about my English journey.", fr: "Bonjour à tous. Aujourd'hui, je vais parler de mon parcours en anglais." },
    { en: "Thirty-six weeks ago, I could hardly speak English.", fr: "Il y a trente-six semaines, je pouvais à peine parler anglais." },
    { en: "I'm proud of my progress and I feel more confident now.", fr: "Je suis fier de mes progrès et je me sens plus confiant maintenant." },
    { en: "Could you repeat the question, please?", fr: "Pourriez-vous répéter la question, s'il vous plaît ?" },
    { en: "My goal is to speak fluently and use English at work.", fr: "Mon objectif est de parler couramment et d'utiliser l'anglais au travail." },
    { en: "Thank you for listening. I'm happy to answer your questions.", fr: "Merci de m'avoir écouté. Je suis heureux de répondre à vos questions." },
  ],
};

export const WRITING_PROMPTS = {
  33: { prompt: "Some people think that students should use phones in class; others disagree. Give your opinion. Use at least two debate phrases (In my opinion, On the other hand...) and one conditional sentence.", minWords: 80 },
  34: { prompt: "Describe a real problem you had (for example, a broken phone, a transport delay or no electricity). Explain what happened, what the cause was and how you solved it. Use past tenses and linking words.", minWords: 80 },
  35: { prompt: "Describe your ideal day in English, from morning to night. Include your plans, the places you go to and the people you meet. Use different tenses and time expressions (first, then, afterwards, meanwhile).", minWords: 90 },
  36: { prompt: "Write about your progress in English over the last 36 weeks. What can you do now that you could not do before? What are your goals for the future?", minWords: 100 },
};
