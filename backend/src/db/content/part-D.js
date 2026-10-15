// Angloba - contenu des semaines 25 a 32 (partie D)

// Helper : q(question, option0, option1, option2, indexDeLaBonneReponse)
function q(question, a, b, c, idx) {
  return { question, options: [a, b, c], correctIndex: idx };
}

export const GRAMMAR_HTML = {
  25: `<p>In meetings we <b>agree</b>, <b>disagree</b> and give advice with <b>SHOULD</b>. Use polite, softer language to disagree.</p>
<p><b>Pattern:</b> I (completely) agree / I see your point, but... / I'm not sure I agree. / We should + base verb.</p>
<ul>
<li>I totally agree with you. <i>(Je suis tout à fait d'accord avec vous.)</i></li>
<li>I'm afraid I don't agree. <i>(Je crains de ne pas être d'accord.)</i></li>
<li>That's a good point, but it is too expensive. <i>(C'est un bon argument, mais c'est trop cher.)</i></li>
<li>We should start the project in May. <i>(Nous devrions commencer le projet en mai.)</i></li>
<li>We shouldn't wait any longer. <i>(Nous ne devrions pas attendre plus longtemps.)</i></li>
<li>Should we invite the client? <i>(Devrions-nous inviter le client ?)</i></li>
</ul>
<p><b>Attention:</b> say "I agree", NOT "I am agree" (French: je suis d'accord). Also, "should" is followed by the base verb: "We should go", not "We should to go".</p>
<p><b>Remember:</b> agree = verb, never "be agree"; soften disagreement with "I see your point, but...".</p>`,

  26: `<p>Signposting means using short words to guide your audience through your presentation. It makes your talk clear and easy to follow.</p>
<table>
<tr><td><b>Start</b></td><td>First, / To begin with, / Let me start by...</td></tr>
<tr><td><b>Continue</b></td><td>Next, / Then, / After that, / Secondly,</td></tr>
<tr><td><b>Finish</b></td><td>Finally, / Lastly, / To sum up,</td></tr>
</table>
<ul>
<li>First, I'll talk about our sales. <i>(D'abord, je parlerai de nos ventes.)</i></li>
<li>Next, let's look at the costs. <i>(Ensuite, regardons les coûts.)</i></li>
<li>After that, I'll show you the results. <i>(Après cela, je vous montrerai les résultats.)</i></li>
<li>Finally, I'd like to thank you. <i>(Enfin, je voudrais vous remercier.)</i></li>
<li>To sum up, the plan works. <i>(Pour résumer, le plan fonctionne.)</i></li>
</ul>
<p><b>Attention:</b> French speakers say "at the end" for "finally" and "in conclusion" too often. Say "Finally," for the last point and "To sum up," for the conclusion. Do not say "At first" for "d'abord"; say "First".</p>
<p><b>Remember:</b> a comma follows the signpost word, and every presentation needs a beginning, a middle and an end.</p>`,

  27: `<p>Register is the level of formality. In emails, choose <b>formal</b> language for clients and managers, and <b>informal</b> language for friends and close colleagues.</p>
<table>
<tr><td><b>Formal</b></td><td><b>Informal</b></td></tr>
<tr><td>Dear Mr Smith,</td><td>Hi John,</td></tr>
<tr><td>I would like to inquire about...</td><td>I wanted to ask about...</td></tr>
<tr><td>Please find attached...</td><td>Here's the file.</td></tr>
<tr><td>I look forward to hearing from you.</td><td>Talk soon!</td></tr>
<tr><td>Yours sincerely,</td><td>Cheers,</td></tr>
</table>
<ul>
<li>I am writing to confirm our meeting. <i>(Je vous écris pour confirmer notre réunion.)</i></li>
<li>Could you send me the report? <i>(Pourriez-vous m'envoyer le rapport ?)</i></li>
<li>Thanks for your help! <i>(Merci pour ton aide !)</i></li>
</ul>
<p><b>Attention:</b> do not translate "Cordialement" as "Cordially". Use "Kind regards" or "Best regards". In formal English avoid contractions (I'm, don't).</p>
<p><b>Remember:</b> know your reader, then choose your greeting, your verbs and your ending to match.</p>`,

  28: `<p>The <b>first conditional</b> talks about real, possible situations in the future. We use <b>if + present simple</b>, then <b>will + base verb</b>.</p>
<p><b>Pattern:</b> If + present simple, ... will + base verb.</p>
<ul>
<li>If you lower the price, we will sign today. <i>(Si vous baissez le prix, nous signerons aujourd'hui.)</i></li>
<li>If they accept, we will start on Monday. <i>(S'ils acceptent, nous commencerons lundi.)</i></li>
<li>We will give a discount if you order ten units. <i>(Nous ferons une remise si vous commandez dix unités.)</i></li>
<li>If you don't pay on time, we won't deliver. <i>(Si vous ne payez pas à temps, nous ne livrerons pas.)</i></li>
<li>What will you do if they refuse? <i>(Que ferez-vous s'ils refusent ?)</i></li>
</ul>
<p><b>Attention:</b> never use "will" after "if" in this structure. Say "If it rains, we will stay", NOT "If it will rain". In French you use the present too, so keep the same logic in English.</p>
<p><b>Remember:</b> if + present, will + verb. The if-clause can come first (with a comma) or second (no comma).</p>`,

  29: `<p>Connectors link ideas and make your speech fluent and logical. Each one has a precise job.</p>
<table>
<tr><td><b>because</b></td><td>reason (parce que)</td></tr>
<tr><td><b>although</b></td><td>contrast in one sentence (bien que)</td></tr>
<tr><td><b>however</b></td><td>contrast between sentences (cependant)</td></tr>
<tr><td><b>therefore</b></td><td>result (donc, par conséquent)</td></tr>
</table>
<ul>
<li>I was late because the bus broke down. <i>(J'étais en retard parce que le bus est tombé en panne.)</i></li>
<li>Although it was raining, we went out. <i>(Bien qu'il pleuve, nous sommes sortis.)</i></li>
<li>The job is hard. However, it pays well. <i>(Le travail est dur. Cependant, il paie bien.)</i></li>
<li>He studied a lot; therefore, he passed. <i>(Il a beaucoup étudié ; donc il a réussi.)</i></li>
</ul>
<p><b>Attention:</b> do not use "but" together with "although". Say "Although he is tired, he works", NOT "Although he is tired, but he works". "However" needs a comma after it.</p>
<p><b>Remember:</b> because = reason, although/however = contrast, therefore = result.</p>`,

  30: `<p>A <b>phrasal verb</b> is a verb + particle (up, out, off...) with a special meaning. A <b>collocation</b> is a pair of words that naturally go together. Learn them in chunks, not one word at a time.</p>
<p><b>Pattern:</b> verb + particle (give up) | make/do/take/have + noun.</p>
<ul>
<li>Don't give up! <i>(N'abandonne pas !)</i></li>
<li>Please turn off your phone. <i>(Veuillez éteindre votre téléphone.)</i></li>
<li>I'm looking for my keys. <i>(Je cherche mes clés.)</i></li>
<li>We need to make a decision. <i>(Nous devons prendre une décision.)</i></li>
<li>She does her homework every night. <i>(Elle fait ses devoirs chaque soir.)</i></li>
<li>Let's take a break. <i>(Faisons une pause.)</i></li>
</ul>
<p>Separable verbs accept an object in the middle: <i>turn the light off</i> / <i>turn off the light</i>. With a pronoun, it must go in the middle: <i>turn it off</i>.</p>
<p><b>Attention:</b> French says "faire une erreur", but English says <b>make</b> a mistake, and "faire une pause" is <b>take</b> a break.</p>
<p><b>Remember:</b> learn the whole expression and its meaning, never translate word for word.</p>`,

  31: `<p>British and American English are both correct. The differences are mainly in <b>vocabulary</b>, <b>spelling</b> and <b>pronunciation</b>.</p>
<table>
<tr><td><b>British</b></td><td><b>American</b></td></tr>
<tr><td>flat</td><td>apartment</td></tr>
<tr><td>biscuit</td><td>cookie</td></tr>
<tr><td>petrol</td><td>gas</td></tr>
<tr><td>rubbish</td><td>garbage / trash</td></tr>
<tr><td>colour, centre</td><td>color, center</td></tr>
</table>
<ul>
<li>I'll take the lift. <i>(Je prends l'ascenseur.)</i></li>
<li>Where is the nearest petrol station? / ...gas station? <i>(Où est la station-service la plus proche ?)</i></li>
<li>Put it in the bin. / ...in the trash can. <i>(Mets-le à la poubelle.)</i></li>
</ul>
<p><b>Pronunciation:</b> Americans pronounce the "r" in "car" and say "water" like "wader"; the British say "cah".</p>
<p><b>Attention:</b> "football" is soccer in the US, and "pants" means trousers in the US but underwear in the UK.</p>
<p><b>Remember:</b> choose one variety and stay consistent in a text.</p>`,

  32: `<p>Understanding different accents (Cameroonian, British, American, Indian, Australian...) takes strategy, not only vocabulary.</p>
<p><b>Strategies:</b></p>
<ul>
<li>Listen first for the <b>main idea</b>, not every word. <i>(Écoutez d'abord l'idée générale.)</i></li>
<li>Focus on <b>stressed words</b>: nouns, verbs and numbers carry the meaning. <i>(Les mots accentués portent le sens.)</i></li>
<li>Expect <b>weak forms</b>: "going to" sounds like "gonna", "want to" like "wanna". <i>(Les formes faibles.)</i></li>
<li>Use <b>context</b> to guess unknown words. <i>(Le contexte aide à deviner.)</i></li>
<li>Ask politely: "Could you repeat that, please?" <i>(Pourriez-vous répéter ?)</i></li>
<li>Listen to the same audio several times, with and without subtitles. <i>(Réécoutez plusieurs fois.)</i></li>
</ul>
<p><b>Attention:</b> French speakers try to understand every word and get lost. English is stress-timed: some words are said very quickly and that is normal.</p>
<p><b>Remember:</b> exposure is the key. Listen to many accents every day, then summarise what you heard in your own words.</p>`,
};

export const VOCABULARY = {
  25: [
    { word: "agenda", wordType: "noun", fr: "ordre du jour" },
    { word: "minutes", wordType: "noun", fr: "compte rendu (de réunion)" },
    { word: "chair", wordType: "verb", fr: "présider (une réunion)" },
    { word: "attendee", wordType: "noun", fr: "participant" },
    { word: "propose", wordType: "verb", fr: "proposer" },
    { word: "objection", wordType: "noun", fr: "objection" },
    { word: "deadline", wordType: "noun", fr: "date limite" },
    { word: "postpone", wordType: "verb", fr: "reporter" },
    { word: "unanimous", wordType: "adjective", fr: "unanime" },
    { word: "follow up", wordType: "verb", fr: "assurer le suivi" },
    { word: "on the same page", wordType: "phrase", fr: "sur la même longueur d'onde" },
    { word: "budget", wordType: "noun", fr: "budget" },
    { word: "schedule", wordType: "verb", fr: "planifier" },
    { word: "reluctant", wordType: "adjective", fr: "réticent" },
  ],
  26: [
    { word: "audience", wordType: "noun", fr: "public, auditoire" },
    { word: "slide", wordType: "noun", fr: "diapositive" },
    { word: "outline", wordType: "verb", fr: "présenter les grandes lignes" },
    { word: "highlight", wordType: "verb", fr: "mettre en évidence" },
    { word: "overview", wordType: "noun", fr: "aperçu, vue d'ensemble" },
    { word: "handout", wordType: "noun", fr: "document distribué" },
    { word: "rehearse", wordType: "verb", fr: "répéter (avant le jour J)" },
    { word: "eye contact", wordType: "noun", fr: "contact visuel" },
    { word: "confident", wordType: "adjective", fr: "confiant, sûr de soi" },
    { word: "briefly", wordType: "adverb", fr: "brièvement" },
    { word: "key point", wordType: "noun", fr: "point essentiel" },
    { word: "conclude", wordType: "verb", fr: "conclure" },
    { word: "Any questions?", wordType: "phrase", fr: "Des questions ?" },
    { word: "clearly", wordType: "adverb", fr: "clairement" },
  ],
  27: [
    { word: "attachment", wordType: "noun", fr: "pièce jointe" },
    { word: "recipient", wordType: "noun", fr: "destinataire" },
    { word: "subject line", wordType: "noun", fr: "objet (du courriel)" },
    { word: "forward", wordType: "verb", fr: "transférer" },
    { word: "reply", wordType: "verb", fr: "répondre" },
    { word: "enclose", wordType: "verb", fr: "joindre" },
    { word: "regarding", wordType: "preposition", fr: "concernant" },
    { word: "inquire", wordType: "verb", fr: "se renseigner" },
    { word: "apologise", wordType: "verb", fr: "s'excuser" },
    { word: "urgent", wordType: "adjective", fr: "urgent" },
    { word: "Kind regards", wordType: "phrase", fr: "Cordialement" },
    { word: "attached", wordType: "adjective", fr: "ci-joint" },
    { word: "polite", wordType: "adjective", fr: "poli" },
    { word: "draft", wordType: "noun", fr: "brouillon" },
  ],
  28: [
    { word: "offer", wordType: "noun", fr: "offre, proposition" },
    { word: "discount", wordType: "noun", fr: "remise, réduction" },
    { word: "compromise", wordType: "noun", fr: "compromis" },
    { word: "bargain", wordType: "verb", fr: "marchander" },
    { word: "counteroffer", wordType: "noun", fr: "contre-proposition" },
    { word: "concession", wordType: "noun", fr: "concession" },
    { word: "mutually beneficial", wordType: "phrase", fr: "avantageux pour les deux parties" },
    { word: "firm", wordType: "adjective", fr: "ferme" },
    { word: "flexible", wordType: "adjective", fr: "flexible" },
    { word: "settle", wordType: "verb", fr: "régler, conclure un accord" },
    { word: "terms", wordType: "noun", fr: "conditions" },
    { word: "reject", wordType: "verb", fr: "rejeter" },
    { word: "deal", wordType: "noun", fr: "accord, marché" },
    { word: "meet halfway", wordType: "phrase", fr: "couper la poire en deux" },
  ],
  29: [
    { word: "fluent", wordType: "adjective", fr: "courant, aisé (langue)" },
    { word: "moreover", wordType: "adverb", fr: "de plus" },
    { word: "nevertheless", wordType: "adverb", fr: "néanmoins" },
    { word: "consequently", wordType: "adverb", fr: "par conséquent" },
    { word: "whereas", wordType: "preposition", fr: "alors que" },
    { word: "in addition", wordType: "phrase", fr: "en outre" },
    { word: "for instance", wordType: "phrase", fr: "par exemple" },
    { word: "on the other hand", wordType: "phrase", fr: "d'un autre côté" },
    { word: "hesitate", wordType: "verb", fr: "hésiter" },
    { word: "pause", wordType: "noun", fr: "pause" },
    { word: "filler", wordType: "noun", fr: "mot de remplissage" },
    { word: "rephrase", wordType: "verb", fr: "reformuler" },
    { word: "in other words", wordType: "phrase", fr: "autrement dit" },
    { word: "smoothly", wordType: "adverb", fr: "avec fluidité" },
  ],
  30: [
    { word: "give up", wordType: "verb", fr: "abandonner" },
    { word: "carry on", wordType: "verb", fr: "continuer" },
    { word: "find out", wordType: "verb", fr: "découvrir, se renseigner" },
    { word: "look after", wordType: "verb", fr: "s'occuper de" },
    { word: "set up", wordType: "verb", fr: "mettre en place, créer" },
    { word: "turn down", wordType: "verb", fr: "refuser, baisser" },
    { word: "put off", wordType: "verb", fr: "repousser, reporter" },
    { word: "run out of", wordType: "verb", fr: "être à court de" },
    { word: "come up with", wordType: "verb", fr: "trouver (une idée)" },
    { word: "take part in", wordType: "verb", fr: "participer à" },
    { word: "make a decision", wordType: "phrase", fr: "prendre une décision" },
    { word: "do business", wordType: "phrase", fr: "faire des affaires" },
    { word: "take a break", wordType: "phrase", fr: "faire une pause" },
    { word: "keep in touch", wordType: "phrase", fr: "rester en contact" },
  ],
  31: [
    { word: "Flat", wordType: "noun", fr: "Appartement" },
    { word: "Biscuit", wordType: "noun", fr: "Biscuit" },
    { word: "Petrol", wordType: "noun", fr: "Essence" },
    { word: "Rubbish", wordType: "noun", fr: "Déchets, ordures" },
    { word: "Pavement", wordType: "noun", fr: "Trottoir" },
    { word: "Queue", wordType: "noun", fr: "File d'attente" },
    { word: "Mobile phone", wordType: "noun", fr: "Téléphone portable" },
    { word: "Boot", wordType: "noun", fr: "Coffre (de voiture)" },
    { word: "Chemist", wordType: "noun", fr: "Pharmacie" },
    { word: "Crisps", wordType: "noun", fr: "Chips" },
    { word: "Colour", wordType: "noun", fr: "Couleur" },
    { word: "Autumn", wordType: "noun", fr: "Automne" },
    { word: "Cinema", wordType: "noun", fr: "Cinéma" },
    { word: "Football", wordType: "noun", fr: "Football" },
  ],
  32: [
    { word: "accent", wordType: "noun", fr: "accent" },
    { word: "pronunciation", wordType: "noun", fr: "prononciation" },
    { word: "stress", wordType: "noun", fr: "accent tonique" },
    { word: "intonation", wordType: "noun", fr: "intonation" },
    { word: "main idea", wordType: "noun", fr: "idée principale" },
    { word: "detail", wordType: "noun", fr: "détail" },
    { word: "guess", wordType: "verb", fr: "deviner" },
    { word: "catch", wordType: "verb", fr: "saisir, comprendre (ce qui est dit)" },
    { word: "summarise", wordType: "verb", fr: "résumer" },
    { word: "mumble", wordType: "verb", fr: "marmonner" },
    { word: "speak up", wordType: "verb", fr: "parler plus fort" },
    { word: "slow down", wordType: "verb", fr: "ralentir" },
    { word: "context", wordType: "noun", fr: "contexte" },
    { word: "native speaker", wordType: "noun", fr: "locuteur natif" },
    { word: "Could you repeat that?", wordType: "phrase", fr: "Pourriez-vous répéter ?" },
  ],
};

export const EXERCISES = {
  25: [
    q("I ___ with you. You are right.", "agree", "am agree", "agreeing", 0),
    q("We ___ send the report today. It is late.", "should", "should to", "shoulds", 1),
    q("Which phrase is a polite way to disagree?", "I see your point, but I'm not sure.", "You are wrong.", "That is stupid.", 2),
    q("The list of topics for a meeting is the ___.", "agenda", "minutes", "budget", 0),
    q("The written record of what was said in a meeting is the ___.", "deadline", "minutes", "agenda", 1),
    q("Choose the correct sentence.", "We should call the client.", "We should to call the client.", "We should calling the client.", 0),
    q("To move a meeting to a later date is to ___ it.", "chair", "follow up", "postpone", 2),
    q("\"Je suis d'accord\" in English is ___.", "I am agree", "I agree", "I am according", 1),
    q("Everybody says yes. The decision is ___.", "reluctant", "unanimous", "urgent", 1),
    q("\"We shouldn't spend more than the ___.\"", "budget", "attendee", "chair", 0),
    q("A: \"We should hire two more people.\" B: \"___, we don't have enough money.\"", "Therefore", "I'm afraid I disagree", "I totally agree", 1),
    q("\"Devrions-nous reporter ?\" = ___ we postpone it?", "Do", "Should", "Are", 1),
    q("The person who leads a meeting ___ it.", "chairs", "attends", "agrees", 0),
    q("Which sentence expresses advice?", "You should speak to the manager.", "You spoke to the manager.", "You are speaking to the manager.", 0),
    q("\"I'm not sure I ___ with that idea.\"", "agree", "agrees", "am agree", 0),
    q("The last date to finish a task is the ___.", "agenda", "deadline", "attachment", 1),
    q("After the meeting, Anna will ___ with the clients by email.", "chair", "follow up", "agree to", 1),
    q("\"Let's make sure we are on the same page\" means ___.", "we understand each other", "we sit together", "we read a book", 0),
  ],
  26: [
    q("___, I'll talk about our history. (the first point)", "First", "Finally", "Therefore", 0),
    q("___, I'd like to thank you for listening. (the last point)", "Finally", "First", "Next", 0),
    q("Which word signals the second point?", "Next", "Finally", "To begin with", 0),
    q("\"To sum up\" is used to ___.", "start the talk", "conclude the talk", "ask a question", 1),
    q("The pages you show on the screen are ___.", "handouts", "slides", "minutes", 1),
    q("A paper you give to the audience is a ___.", "slide", "handout", "deadline", 1),
    q("To practise your talk before the day is to ___.", "rehearse", "reject", "settle", 0),
    q("Looking at your audience is called ___.", "eye contact", "overview", "outline", 0),
    q("\"D'abord\" at the start of a presentation = ___.", "At the end", "To begin with", "Finally", 1),
    q("\"Ensuite, regardons les chiffres\" = ___, let's look at the figures.", "Next", "First", "Lastly", 0),
    q("The people who listen to a presentation are the ___.", "audience", "agenda", "attachment", 0),
    q("\"Let me ___ the main points.\" (give the main lines)", "outline", "reject", "forward", 0),
    q("Choose the correct sentence.", "First, I will explain the plan.", "At first, I will explain the plan.", "First I will to explain the plan.", 0),
    q("\"Any questions?\" is used ___.", "at the end", "before the title", "in an email", 0),
    q("To make an important point more visible is to ___ it.", "highlight", "postpone", "bargain", 0),
    q("A short general description of a topic is an ___.", "overview", "objection", "attendee", 0),
    q("\"I will speak ___\" means for a short time.", "briefly", "clearly", "nevertheless", 0),
    q("Which is the best order?", "First, next, finally", "Finally, first, next", "Next, finally, first", 0),
  ],
  27: [
    q("Which greeting is formal?", "Hi John,", "Dear Mr Smith,", "Hey!", 1),
    q("Which ending is formal?", "Cheers,", "See ya!", "Yours sincerely,", 2),
    q("Which sentence is more formal?", "I would like to inquire about your prices.", "I wanna know your prices.", "Tell me your prices.", 0),
    q("\"Please find ___ the report.\" (ci-joint)", "attached", "attach", "attaching", 0),
    q("\"Cordialement\" in a business email = ___.", "Cordially", "Kind regards", "Cheerfully", 1),
    q("The person who receives an email is the ___.", "recipient", "draft", "attachment", 0),
    q("A file sent with an email is an ___.", "agenda", "attachment", "subject line", 1),
    q("The short title of an email is the ___.", "subject line", "recipient", "draft", 0),
    q("To send an email you received to another person is to ___ it.", "reply", "forward", "enclose", 1),
    q("Which opening is informal?", "I am writing to confirm...", "Dear Sir or Madam,", "Hi Sam, hope you're well!", 2),
    q("\"Could you send me the file?\" is ___.", "polite", "rude", "an order", 0),
    q("In a formal email, which is better?", "I don't know.", "I do not know.", "No idea!", 1),
    q("\"___ your last email, I have a question.\" (Concernant)", "Regarding", "Between", "During", 0),
    q("\"I am writing to ___ for the delay.\"", "apologise", "reject", "chair", 0),
    q("An early version of a text, not final, is a ___.", "draft", "recipient", "budget", 0),
    q("To write to a friend you can say ___.", "Yours faithfully,", "Talk soon!", "I look forward to hearing from you formally.", 1),
    q("\"Dear Sir or Madam\" is followed by ___ at the end.", "Yours faithfully,", "Cheers,", "Bye!", 0),
    q("\"Please reply as soon as possible. It is ___.\"", "urgent", "polite", "formal", 0),
  ],
  28: [
    q("If you ___ the price, we will buy.", "lower", "will lower", "lowering", 0),
    q("If they accept, we ___ tomorrow.", "start", "will start", "would starting", 1),
    q("If it ___ tomorrow, we will cancel the visit.", "will rain", "rains", "rained", 1),
    q("We ___ you a discount if you order today.", "will give", "give if", "gave", 0),
    q("If you ___ on time, we won't deliver.", "don't pay", "won't pay", "not pay", 0),
    q("What ___ you do if they refuse?", "do", "would to", "will", 2),
    q("A lower price offered to a customer is a ___.", "discount", "deadline", "chair", 0),
    q("When each side gives something to reach agreement, it is a ___.", "objection", "compromise", "draft", 1),
    q("A new proposal that answers an offer is a ___.", "counteroffer", "attachment", "handout", 0),
    q("\"Couper la poire en deux\" in negotiation = ___.", "meet halfway", "give up", "run out", 0),
    q("Choose the correct sentence.", "If we sign, we will save money.", "If we will sign, we will save money.", "If we signing, we save money.", 0),
    q("The conditions of a contract are the ___.", "terms", "slides", "pauses", 0),
    q("Someone who does not change their position is ___.", "firm", "flexible", "unanimous", 0),
    q("Someone who can adapt easily is ___.", "firm", "flexible", "reluctant", 1),
    q("To ask for a lower price in a market is to ___.", "bargain", "forward", "outline", 0),
    q("A deal good for both sides is ___.", "mutually beneficial", "one-sided", "urgent", 0),
    q("\"Si vous commandez dix pièces, nous livrerons gratuitement.\"", "If you order ten, we will deliver for free.", "If you will order ten, we deliver for free.", "If you ordered ten, we will deliver for free.", 0),
    q("To refuse an offer is to ___ it.", "settle", "accept", "reject", 2),
  ],
  29: [
    q("I stayed at home ___ I was ill.", "because", "although", "however", 0),
    q("___ he is rich, he is not happy.", "Because", "Although", "Therefore", 1),
    q("It was cheap. ___, the quality was bad.", "However", "Because", "Although", 0),
    q("She worked hard; ___, she got a promotion.", "although", "because", "therefore", 2),
    q("Choose the correct sentence.", "Although it was late, we continued.", "Although it was late, but we continued.", "Because it was late, but we continued.", 0),
    q("\"Cependant\" = ___.", "however", "therefore", "because", 0),
    q("\"Donc\" (result) = ___.", "although", "therefore", "whereas", 1),
    q("\"Bien que\" = ___.", "although", "consequently", "moreover", 0),
    q("\"De plus\" = ___.", "moreover", "nevertheless", "whereas", 0),
    q("\"Par exemple\" = ___.", "in other words", "for instance", "on the other hand", 1),
    q("\"Autrement dit\" = ___.", "in other words", "for instance", "in addition", 0),
    q("The roads were flooded. ___, many people were late.", "Consequently", "Although", "Whereas", 0),
    q("\"Néanmoins\" = ___.", "moreover", "nevertheless", "therefore", 1),
    q("Words like \"um\" and \"er\" are called ___.", "fillers", "connectors", "handouts", 0),
    q("To say the same thing in different words is to ___.", "rephrase", "hesitate", "postpone", 0),
    q("I like tea, ___ my brother prefers coffee.", "whereas", "therefore", "because", 0),
    q("Which connector shows a reason?", "because", "however", "therefore", 0),
    q("Which sentence needs a comma after the connector?", "However, I disagree.", "Because I disagree.", "Although I disagree.", 0),
  ],
  30: [
    q("\"Give up\" means ___.", "abandonner", "donner", "se lever", 0),
    q("I'm ___ my keys. I can't find them.", "looking for", "looking at", "looking after", 0),
    q("Please ___ the lights when you leave.", "turn off", "turn on", "turn into", 0),
    q("\"Find out\" means ___.", "perdre", "découvrir", "trouver par hasard un objet", 1),
    q("We need to ___ a decision today.", "do", "make", "take part", 1),
    q("Let's ___ a break for ten minutes.", "do", "make", "take", 2),
    q("She ___ her mother, who is ill.", "looks after", "looks for", "looks up", 0),
    q("We ran ___ coffee this morning.", "out of", "off", "away", 0),
    q("\"Put off\" a meeting means ___.", "to cancel it forever", "to postpone it", "to start it", 1),
    q("Don't ___! You are nearly there. (abandonner)", "give up", "give in a", "put off", 0),
    q("I always ___ my homework in the evening.", "do", "make", "take", 0),
    q("He ___ a good idea in the meeting.", "came up with", "came from to", "came off", 0),
    q("Choose the correct sentence.", "Turn it off.", "Turn off it.", "Off turn it.", 0),
    q("\"Set up a company\" means ___.", "fermer une entreprise", "créer une entreprise", "vendre une entreprise", 1),
    q("\"Carry on\" means ___.", "porter un sac", "continuer", "arrêter", 1),
    q("They ___ the offer because it was too low.", "turned down", "turned on", "turned up", 0),
    q("Which collocation is correct?", "make a mistake", "do a mistake", "take a mistake", 0),
    q("\"Keep in touch\" means ___.", "rester en contact", "toucher quelqu'un", "garder un secret", 0),
  ],
  31: [
    q("British 'petrol' = American ___.", "gas", "oil", "diesel", 0),
    q("British 'biscuit' = American ___.", "cake", "cookie", "bread", 1),
    q("British 'rubbish' = American ___.", "garbage", "garden", "grass", 0),
    q("British 'pavement' = American ___.", "road", "street", "sidewalk", 2),
    q("British 'queue' = American ___.", "line", "row", "list", 0),
    q("British 'mobile phone' = American ___.", "cell phone", "mobile house", "pocket call", 0),
    q("British 'boot' (of a car) = American ___.", "shoe", "trunk", "door", 1),
    q("British 'crisps' = American ___.", "fries", "chips", "nuts", 1),
    q("British 'autumn' = American ___.", "fall", "spring", "winter", 0),
    q("British 'chemist' = American ___.", "pharmacy", "laboratory", "hospital", 0),
    q("Which is the American spelling?", "color", "colour", "colur", 0),
    q("Which is the British spelling?", "center", "centre", "centar", 1),
    q("An American says 'soccer'. A British person says ___.", "rugby", "tennis", "football", 2),
    q("In the US, 'pants' means ___.", "underwear", "trousers", "socks", 1),
    q("British 'cinema' = American ___.", "movie theater", "theatre play", "television", 0),
    q("British 'trousers' = American ___.", "pants", "shorts", "skirts", 0),
    q("In American English the 'r' in 'car' is ___.", "pronounced", "silent", "like an 'h'", 0),
    q("British 'bin' = American ___.", "trash can", "box", "bag", 0),
  ],
  32: [
    q("When you listen to an accent, first look for the ___.", "main idea", "every small word", "spelling", 0),
    q("Stressed words are usually ___.", "nouns and verbs", "articles", "prepositions", 0),
    q("\"Gonna\" is a fast form of ___.", "going to", "go not", "gone to", 0),
    q("\"Wanna\" is a fast form of ___.", "want to", "was not", "will not", 0),
    q("You don't understand. You say: ___", "Could you repeat that, please?", "Be quiet.", "I don't care.", 0),
    q("To ask someone to talk more quietly/loudly: \"Could you ___, please?\" (plus fort)", "speak up", "speak out of", "speak down", 0),
    q("To ask someone to talk more slowly: \"Could you ___?\"", "slow down", "speed up", "give up", 0),
    q("A speaker who talks unclearly and quietly ___.", "mumbles", "summarises", "guesses", 0),
    q("The words around an unknown word help you guess its meaning: this is ___.", "context", "accent", "stress", 0),
    q("To give the main points in a few words is to ___.", "summarise", "hesitate", "forward", 0),
    q("The music of the voice (rising or falling) is ___.", "intonation", "agenda", "deadline", 0),
    q("A person who speaks English as their first language is a ___.", "native speaker", "recipient", "chair", 0),
    q("Choose the best strategy for a difficult audio.", "Listen several times.", "Stop after ten seconds.", "Translate every word.", 0),
    q("\"Deviner\" = ___.", "guess", "catch", "stress", 0),
    q("English is a ___ language: some words are said very fast.", "stress-timed", "syllable-timed only", "silent", 0),
    q("Choose the correct sentence.", "I didn't catch what he said.", "I didn't catch what he saying.", "I not catch what he said.", 0),
    q("A different way of pronouncing English (British, American...) is an ___.", "accent", "attachment", "objection", 0),
    q("Which is NOT a good listening strategy?", "Panic when you miss one word.", "Use the context.", "Focus on the main idea.", 0),
  ],
};

export const KEY_PHRASES = {
  25: [
    { en: "I totally agree with you.", fr: "Je suis tout à fait d'accord avec vous." },
    { en: "I see your point, but I'm not sure.", fr: "Je comprends votre point de vue, mais je n'en suis pas sûr." },
    { en: "I'm afraid I don't agree.", fr: "Je crains de ne pas être d'accord." },
    { en: "We should postpone the launch.", fr: "Nous devrions reporter le lancement." },
    { en: "Can we move on to the next item?", fr: "Pouvons-nous passer au point suivant ?" },
    { en: "Let's make sure we are on the same page.", fr: "Assurons-nous d'être sur la même longueur d'onde." },
  ],
  26: [
    { en: "Good morning, everyone. Thank you for coming.", fr: "Bonjour à tous. Merci d'être venus." },
    { en: "First, I'll talk about our results.", fr: "D'abord, je parlerai de nos résultats." },
    { en: "Next, let's look at the figures.", fr: "Ensuite, regardons les chiffres." },
    { en: "As you can see on this slide, sales are up.", fr: "Comme vous pouvez le voir sur cette diapositive, les ventes augmentent." },
    { en: "To sum up, our plan is working.", fr: "Pour résumer, notre plan fonctionne." },
    { en: "Thank you for listening. Any questions?", fr: "Merci de votre écoute. Des questions ?" },
  ],
  27: [
    { en: "I am writing to confirm our meeting on Monday.", fr: "Je vous écris pour confirmer notre réunion de lundi." },
    { en: "Please find the report attached.", fr: "Veuillez trouver le rapport ci-joint." },
    { en: "Could you send me the details, please?", fr: "Pourriez-vous m'envoyer les détails, s'il vous plaît ?" },
    { en: "I apologise for the delay.", fr: "Je m'excuse pour le retard." },
    { en: "I look forward to hearing from you.", fr: "J'attends votre réponse avec impatience." },
    { en: "Kind regards, Marc.", fr: "Cordialement, Marc." },
  ],
  28: [
    { en: "If you lower the price, we will sign today.", fr: "Si vous baissez le prix, nous signerons aujourd'hui." },
    { en: "What if we meet halfway?", fr: "Et si nous coupions la poire en deux ?" },
    { en: "That is our best offer.", fr: "C'est notre meilleure offre." },
    { en: "We can give you a ten percent discount.", fr: "Nous pouvons vous accorder dix pour cent de remise." },
    { en: "I'm afraid we can't accept those terms.", fr: "Je crains que nous ne puissions pas accepter ces conditions." },
    { en: "Let's find a solution that works for both of us.", fr: "Trouvons une solution qui convienne à nous deux." },
  ],
  29: [
    { en: "I was late because the traffic was terrible.", fr: "J'étais en retard parce que la circulation était terrible." },
    { en: "Although it was difficult, I enjoyed it.", fr: "Bien que ce soit difficile, j'ai apprécié." },
    { en: "The idea is good. However, it is expensive.", fr: "L'idée est bonne. Cependant, elle est chère." },
    { en: "We missed the deadline; therefore, we must work faster.", fr: "Nous avons raté la date limite ; nous devons donc travailler plus vite." },
    { en: "In other words, we need more time.", fr: "Autrement dit, nous avons besoin de plus de temps." },
    { en: "Let me think for a moment.", fr: "Laissez-moi réfléchir un instant." },
  ],
  30: [
    { en: "Don't give up, you're doing great.", fr: "N'abandonne pas, tu te débrouilles très bien." },
    { en: "I'm looking for a new job.", fr: "Je cherche un nouvel emploi." },
    { en: "We ran out of time.", fr: "Nous avons manqué de temps." },
    { en: "Let's take a short break.", fr: "Faisons une courte pause." },
    { en: "I need to make an important decision.", fr: "Je dois prendre une décision importante." },
    { en: "Let's keep in touch.", fr: "Restons en contact." },
  ],
  31: [
    { en: "Where is the nearest petrol station?", fr: "Où est la station-service la plus proche ?" },
    { en: "In American English we say elevator, not lift.", fr: "En anglais américain, on dit elevator et non lift." },
    { en: "I live in a small flat in the city centre.", fr: "J'habite dans un petit appartement au centre-ville." },
    { en: "Could you put the rubbish in the bin?", fr: "Pourriez-vous mettre les ordures à la poubelle ?" },
    { en: "Do you say autumn or fall?", fr: "Dites-vous autumn ou fall ?" },
    { en: "Both accents are correct and easy to understand.", fr: "Les deux accents sont corrects et faciles à comprendre." },
  ],
  32: [
    { en: "Could you repeat that, please?", fr: "Pourriez-vous répéter, s'il vous plaît ?" },
    { en: "Could you speak a little more slowly?", fr: "Pourriez-vous parler un peu plus lentement ?" },
    { en: "Sorry, I didn't catch that.", fr: "Désolé, je n'ai pas compris." },
    { en: "Do you mean that the meeting is on Friday?", fr: "Voulez-vous dire que la réunion a lieu vendredi ?" },
    { en: "If I understand correctly, you said the price is going up.", fr: "Si je comprends bien, vous avez dit que le prix augmente." },
    { en: "So, the main idea is that we need more time.", fr: "Donc, l'idée principale est que nous avons besoin de plus de temps." },
  ],
};

export const WRITING_PROMPTS = {
  25: { prompt: "You attended a team meeting. Write a short summary: say what was discussed, one point you agreed with and one point you disagreed with, and what the team should do next.", minWords: 60 },
  26: { prompt: "Write the script of a one-minute presentation about your job, your studies or your town. Use signposting words: first, next, after that, finally, to sum up.", minWords: 70 },
  27: { prompt: "Write a formal email to a company asking about a product or a service. Then write two sentences of the same message in an informal style for a friend.", minWords: 70 },
  28: { prompt: "Your supplier is late and your customer is angry. Write a short dialogue or message of negotiation using at least three first conditional sentences (If..., we will...).", minWords: 70 },
  29: { prompt: "Describe a difficult day at work or at school. Use because, although, however and therefore at least once each.", minWords: 70 },
  30: { prompt: "Write about your daily routine or a project using at least five phrasal verbs or collocations from this week (for example give up, find out, take a break, make a decision).", minWords: 60 },
  31: { prompt: "Write a short text about your home or your favourite food. Use at least five British or American words from this week and say which variety you chose.", minWords: 60 },
  32: { prompt: "Listen to a short news report or video in English from any country. Summarise what you heard: the main idea, two details and one word you did not understand.", minWords: 60 },
};
