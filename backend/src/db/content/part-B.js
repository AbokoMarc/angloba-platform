// Angloba - contenu des semaines 9 a 16 (part B)

// Helper: Q(question, bonneReponse, fausse1, fausse2) -> position de la bonne reponse repartie 0/1/2
const build = (rows) =>
  rows.map(([question, right, w1, w2], i) => {
    const pos = i % 3;
    const wrong = [w1, w2];
    const options = [];
    let k = 0;
    for (let j = 0; j < 3; j++) options.push(j === pos ? right : wrong[k++]);
    return { question, options, correctIndex: pos };
  });

export const GRAMMAR_HTML = {
  9: `<p>We use the <b>Present Simple</b> for habits and facts. We use the <b>Present Continuous</b> for actions happening now or around now.</p>
<p><b>Present Simple:</b> Subject + base verb (+ s for he/she/it). <b>Present Continuous:</b> Subject + am/is/are + verb-ing.</p>
<p><b>Examples:</b></p>
<ul>
<li>I sell fruit every day. <i>(Je vends des fruits tous les jours.)</i></li>
<li>Look! I am selling mangoes now. <i>(Regarde ! Je vends des mangues en ce moment.)</i></li>
<li>She works in Douala. <i>(Elle travaille à Douala.)</i></li>
<li>She is working today. <i>(Elle travaille aujourd'hui.)</i></li>
<li>They aren't sleeping. <i>(Ils ne dorment pas.)</i></li>
<li>Does he speak English? <i>(Parle-t-il anglais ?)</i></li>
</ul>
<p><b>Signal words:</b> every day, usually, always (simple); now, at the moment, look!, listen! (continuous).</p>
<p><b>Attention:</b> in French, "je mange" is used for both. In English, you must choose: "I eat" (habit) or "I am eating" (now). Also: "I know", not "I am knowing".</p>
<p><b>Remember:</b> habit = simple, now = am/is/are + -ing.</p>`,

  10: `<p>We use the <b>Past Simple</b> to talk about finished actions in the past (yesterday, last week, in 2020).</p>
<p><b>Affirmative:</b> Subject + verb + <b>-ed</b>. <b>Negative:</b> Subject + <b>didn't</b> + base verb. <b>Question:</b> <b>Did</b> + subject + base verb?</p>
<p><b>Spelling:</b> work → worked; live → lived; study → studied; stop → stopped.</p>
<p><b>Examples:</b></p>
<ul>
<li>I called my mother yesterday. <i>(J'ai appelé ma mère hier.)</i></li>
<li>She studied at the University of Yaoundé. <i>(Elle a étudié à l'Université de Yaoundé.)</i></li>
<li>We didn't walk to school. <i>(Nous ne sommes pas allés à l'école à pied.)</i></li>
<li>Did you cook last night? <i>(As-tu cuisiné hier soir ?)</i></li>
<li>They stopped the taxi. <i>(Ils ont arrêté le taxi.)</i></li>
</ul>
<p><b>Pronunciation:</b> -ed sounds /t/ (worked), /d/ (called) or /ɪd/ (wanted).</p>
<p><b>Attention:</b> after <i>did/didn't</i>, the verb stays in the base form. Say "Did you work?", not "Did you worked?".</p>
<p><b>Remember:</b> finished time = verb-ed; negative and question = did + base verb.</p>`,

  11: `<p>Many common verbs are <b>irregular</b>: they do not take -ed in the Past Simple. You must learn them by heart.</p>
<table>
<tr><td><b>Base</b></td><td><b>Past</b></td></tr>
<tr><td>go</td><td>went</td></tr>
<tr><td>see</td><td>saw</td></tr>
<tr><td>eat</td><td>ate</td></tr>
<tr><td>buy</td><td>bought</td></tr>
<tr><td>have</td><td>had</td></tr>
<tr><td>take</td><td>took</td></tr>
</table>
<p><b>Examples:</b></p>
<ul>
<li>I went to Douala last week. <i>(Je suis allé à Douala la semaine dernière.)</i></li>
<li>She bought a phone for 50,000 FCFA. <i>(Elle a acheté un téléphone à 50 000 FCFA.)</i></li>
<li>We ate ndolé yesterday. <i>(Nous avons mangé du ndolé hier.)</i></li>
<li>He didn't see the bus. <i>(Il n'a pas vu le bus.)</i></li>
<li>Did they take a mototaxi? <i>(Ont-ils pris une moto-taxi ?)</i></li>
</ul>
<p><b>Attention:</b> "went" is the past of "go" (not "goed"). In negatives and questions, use the base form: "I didn't go", not "I didn't went".</p>
<p><b>Remember:</b> irregular verbs change form in affirmative sentences only; after did/didn't, use the base verb.</p>`,

  12: `<p>We use <b>questions</b> to ask for information and <b>imperatives</b> to give orders, instructions or directions.</p>
<p><b>Question words:</b> what (quoi), where (où), when (quand), who (qui), why (pourquoi), how (comment), how much / how many (combien).</p>
<p><b>Structure of questions:</b> Question word + do/does/did (or am/is/are) + subject + verb?</p>
<p><b>Imperative:</b> base verb, without a subject. Negative: <b>Don't</b> + base verb.</p>
<p><b>Examples:</b></p>
<ul>
<li>Where do you live? <i>(Où habites-tu ?)</i></li>
<li>How much is this? <i>(C'est combien ?)</i></li>
<li>Go straight, then turn left. <i>(Allez tout droit, puis tournez à gauche.)</i></li>
<li>Turn right at the roundabout. <i>(Tournez à droite au rond-point.)</i></li>
<li>Don't stop here. <i>(Ne vous arrêtez pas ici.)</i></li>
<li>Excuse me, where is the station? <i>(Excusez-moi, où est la gare ?)</i></li>
</ul>
<p><b>Attention:</b> French speakers say "Where you live?" Always add the auxiliary: "Where <b>do</b> you live?".</p>
<p><b>Remember:</b> question word + auxiliary + subject + verb; the imperative has no subject.</p>`,

  13: `<p>We use <b>going to</b> for plans and intentions, and for predictions based on evidence we can see now.</p>
<p><b>Structure:</b> Subject + am/is/are + <b>going to</b> + base verb.</p>
<p><b>Negative:</b> Subject + am/is/are + <b>not</b> + going to + base verb. <b>Question:</b> Am/Is/Are + subject + going to + base verb?</p>
<p><b>Examples:</b></p>
<ul>
<li>I am going to visit Kribi next month. <i>(Je vais visiter Kribi le mois prochain.)</i></li>
<li>She is going to open a small shop. <i>(Elle va ouvrir une petite boutique.)</i></li>
<li>We aren't going to travel in August. <i>(Nous n'allons pas voyager en août.)</i></li>
<li>Are you going to join the njangi? <i>(Vas-tu rejoindre la tontine ?)</i></li>
<li>Look at those clouds! It is going to rain. <i>(Regarde ces nuages ! Il va pleuvoir.)</i></li>
</ul>
<p><b>Time words:</b> tomorrow, next week, next month, next year, soon, this weekend.</p>
<p><b>Attention:</b> do not forget "be". Say "I am going to study", not "I going to study". After "to", the verb never takes -s or -ing.</p>
<p><b>Remember:</b> plan = be + going to + base verb.</p>`,

  14: `<p>We use <b>will</b> for predictions, quick decisions made at the moment of speaking, promises and offers.</p>
<p><b>Structure:</b> Subject + <b>will</b> + base verb. Negative: <b>will not</b> (<b>won't</b>). Question: <b>Will</b> + subject + base verb?</p>
<p>The short form is 'll: I'll, you'll, she'll, we'll.</p>
<p><b>Examples:</b></p>
<ul>
<li>I think it will rain tomorrow. <i>(Je pense qu'il pleuvra demain.)</i></li>
<li>The phone rings. I'll answer it! <i>(Le téléphone sonne. Je vais répondre !)</i></li>
<li>I promise I won't be late. <i>(Je promets que je ne serai pas en retard.)</i></li>
<li>Will you help me with this bag? <i>(Peux-tu m'aider avec ce sac ?)</i></li>
<li>She'll probably pass the exam. <i>(Elle réussira probablement l'examen.)</i></li>
</ul>
<p><b>Useful words:</b> I think, I hope, probably, maybe, perhaps.</p>
<p><b>Attention:</b> will is the same for all persons: "she will go", not "she wills go". After will, use the base verb: "I will go", not "I will to go".</p>
<p><b>Remember:</b> will = prediction, quick decision, promise. Going to = plan or evidence.</p>`,

  16: `<p>We use the <b>Present Perfect</b> to talk about life experiences and past actions with a result now, when the exact time is not important.</p>
<p><b>Structure:</b> Subject + have/has + <b>past participle</b>. Negative: haven't/hasn't + past participle. Question: Have/Has + subject + past participle?</p>
<p>Regular participle: -ed (visited). Irregular: been, seen, eaten, gone, done...</p>
<p><b>Examples:</b></p>
<ul>
<li>I have visited Douala many times. <i>(J'ai visité Douala plusieurs fois.)</i></li>
<li>She has never eaten sushi. <i>(Elle n'a jamais mangé de sushi.)</i></li>
<li>Have you ever been to Yaoundé? <i>(Es-tu déjà allé à Yaoundé ?)</i></li>
<li>We haven't seen that film yet. <i>(Nous n'avons pas encore vu ce film.)</i></li>
<li>He has already finished his work. <i>(Il a déjà terminé son travail.)</i></li>
</ul>
<p><b>Signal words:</b> ever, never, already, yet, just.</p>
<p><b>Attention:</b> with a finished time (yesterday, in 2020), use the Past Simple: "I went there yesterday", not "I have gone there yesterday".</p>
<p><b>Remember:</b> experience, time not stated = have/has + past participle.</p>`,
};

export const VOCABULARY = {
  9: [
    { word: "crowd", wordType: "noun", fr: "foule" },
    { word: "street", wordType: "noun", fr: "rue" },
    { word: "busy", wordType: "adjective", fr: "occupé, animé" },
    { word: "noisy", wordType: "adjective", fr: "bruyant" },
    { word: "wear", wordType: "verb", fr: "porter (un vêtement)" },
    { word: "carry", wordType: "verb", fr: "porter (un objet), transporter" },
    { word: "smile", wordType: "verb", fr: "sourire" },
    { word: "laugh", wordType: "verb", fr: "rire" },
    { word: "wait", wordType: "verb", fr: "attendre" },
    { word: "sell", wordType: "verb", fr: "vendre" },
    { word: "right now", wordType: "phrase", fr: "en ce moment même" },
    { word: "at the moment", wordType: "phrase", fr: "en ce moment" },
    { word: "usually", wordType: "adverb", fr: "d'habitude" },
    { word: "umbrella", wordType: "noun", fr: "parapluie" },
  ],
  10: [
    { word: "yesterday", wordType: "adverb", fr: "hier" },
    { word: "ago", wordType: "adverb", fr: "il y a (dans le temps)" },
    { word: "last night", wordType: "phrase", fr: "hier soir" },
    { word: "story", wordType: "noun", fr: "histoire, récit" },
    { word: "happen", wordType: "verb", fr: "arriver, se passer" },
    { word: "start", wordType: "verb", fr: "commencer" },
    { word: "finish", wordType: "verb", fr: "terminer" },
    { word: "arrive", wordType: "verb", fr: "arriver" },
    { word: "decide", wordType: "verb", fr: "décider" },
    { word: "invite", wordType: "verb", fr: "inviter" },
    { word: "suddenly", wordType: "adverb", fr: "soudain" },
    { word: "finally", wordType: "adverb", fr: "finalement, enfin" },
    { word: "then", wordType: "adverb", fr: "puis, ensuite" },
    { word: "village", wordType: "noun", fr: "village" },
  ],
  11: [
    { word: "went", wordType: "verb", fr: "allé (passé de go)" },
    { word: "saw", wordType: "verb", fr: "vu (passé de see)" },
    { word: "ate", wordType: "verb", fr: "mangé (passé de eat)" },
    { word: "bought", wordType: "verb", fr: "acheté (passé de buy)" },
    { word: "took", wordType: "verb", fr: "pris (passé de take)" },
    { word: "came", wordType: "verb", fr: "venu (passé de come)" },
    { word: "wrote", wordType: "verb", fr: "écrit (passé de write)" },
    { word: "drank", wordType: "verb", fr: "bu (passé de drink)" },
    { word: "met", wordType: "verb", fr: "rencontré (passé de meet)" },
    { word: "slept", wordType: "verb", fr: "dormi (passé de sleep)" },
    { word: "gave", wordType: "verb", fr: "donné (passé de give)" },
    { word: "lost", wordType: "verb", fr: "perdu (passé de lose)" },
    { word: "weekend", wordType: "noun", fr: "week-end" },
    { word: "last week", wordType: "phrase", fr: "la semaine dernière" },
  ],
  12: [
    { word: "direction", wordType: "noun", fr: "direction, indication" },
    { word: "corner", wordType: "noun", fr: "coin, angle de rue" },
    { word: "roundabout", wordType: "noun", fr: "rond-point" },
    { word: "bridge", wordType: "noun", fr: "pont" },
    { word: "station", wordType: "noun", fr: "gare, station" },
    { word: "straight", wordType: "adverb", fr: "tout droit" },
    { word: "turn", wordType: "verb", fr: "tourner" },
    { word: "cross", wordType: "verb", fr: "traverser" },
    { word: "opposite", wordType: "preposition", fr: "en face de" },
    { word: "next to", wordType: "preposition", fr: "à côté de" },
    { word: "behind", wordType: "preposition", fr: "derrière" },
    { word: "far", wordType: "adjective", fr: "loin" },
    { word: "near", wordType: "adjective", fr: "proche" },
    { word: "lost", wordType: "adjective", fr: "perdu (égaré)" },
    { word: "Excuse me", wordType: "phrase", fr: "excusez-moi" },
  ],
  13: [
    { word: "plan", wordType: "noun", fr: "projet, plan" },
    { word: "intend", wordType: "verb", fr: "avoir l'intention de" },
    { word: "visit", wordType: "verb", fr: "visiter, rendre visite" },
    { word: "travel", wordType: "verb", fr: "voyager" },
    { word: "save", wordType: "verb", fr: "économiser, épargner" },
    { word: "open", wordType: "verb", fr: "ouvrir" },
    { word: "tomorrow", wordType: "adverb", fr: "demain" },
    { word: "next month", wordType: "phrase", fr: "le mois prochain" },
    { word: "soon", wordType: "adverb", fr: "bientôt" },
    { word: "someday", wordType: "adverb", fr: "un jour (dans le futur)" },
    { word: "dream", wordType: "noun", fr: "rêve" },
    { word: "goal", wordType: "noun", fr: "objectif" },
    { word: "business", wordType: "noun", fr: "entreprise, commerce" },
    { word: "holiday", wordType: "noun", fr: "vacances, jour férié" },
  ],
  14: [
    { word: "predict", wordType: "verb", fr: "prédire" },
    { word: "promise", wordType: "verb", fr: "promettre" },
    { word: "hope", wordType: "verb", fr: "espérer" },
    { word: "probably", wordType: "adverb", fr: "probablement" },
    { word: "maybe", wordType: "adverb", fr: "peut-être" },
    { word: "perhaps", wordType: "adverb", fr: "peut-être (plus formel)" },
    { word: "future", wordType: "noun", fr: "avenir, futur" },
    { word: "weather", wordType: "noun", fr: "temps (météo)" },
    { word: "sunny", wordType: "adjective", fr: "ensoleillé" },
    { word: "cloudy", wordType: "adjective", fr: "nuageux" },
    { word: "certain", wordType: "adjective", fr: "certain, sûr" },
    { word: "offer", wordType: "verb", fr: "proposer, offrir" },
    { word: "I'll", wordType: "phrase", fr: "je vais / je veux bien (I will)" },
    { word: "decision", wordType: "noun", fr: "décision" },
  ],
  15: [
    { word: "headache", wordType: "noun", fr: "mal de tête" },
    { word: "fever", wordType: "noun", fr: "fièvre" },
    { word: "cough", wordType: "noun", fr: "toux" },
    { word: "medicine", wordType: "noun", fr: "médicament" },
    { word: "pharmacy", wordType: "noun", fr: "pharmacie" },
    { word: "hospital", wordType: "noun", fr: "hôpital" },
    { word: "pain", wordType: "noun", fr: "douleur" },
    { word: "sick", wordType: "adjective", fr: "malade" },
    { word: "healthy", wordType: "adjective", fr: "en bonne santé, sain" },
    { word: "rest", wordType: "verb", fr: "se reposer" },
    { word: "hurt", wordType: "verb", fr: "faire mal" },
    { word: "malaria", wordType: "noun", fr: "paludisme" },
    { word: "exercise", wordType: "noun", fr: "exercice physique" },
    { word: "take care", wordType: "phrase", fr: "prends soin de toi" },
  ],
  16: [
    { word: "experience", wordType: "noun", fr: "expérience" },
    { word: "ever", wordType: "adverb", fr: "déjà (dans une question)" },
    { word: "never", wordType: "adverb", fr: "jamais" },
    { word: "already", wordType: "adverb", fr: "déjà" },
    { word: "yet", wordType: "adverb", fr: "encore, déjà (question/négation)" },
    { word: "just", wordType: "adverb", fr: "venir de, juste" },
    { word: "been", wordType: "verb", fr: "été, allé (participe de be)" },
    { word: "tried", wordType: "verb", fr: "essayé (participe de try)" },
    { word: "country", wordType: "noun", fr: "pays" },
    { word: "abroad", wordType: "adverb", fr: "à l'étranger" },
    { word: "adventure", wordType: "noun", fr: "aventure" },
    { word: "once", wordType: "adverb", fr: "une fois" },
    { word: "twice", wordType: "adverb", fr: "deux fois" },
    { word: "several times", wordType: "phrase", fr: "plusieurs fois" },
  ],
};

export const EXERCISES = {
  9: build([
    ["My brother ___ (play) football every Saturday.", "plays", "is playing", "play"],
    ["Be quiet! The baby ___ (sleep).", "is sleeping", "sleeps", "sleep"],
    ["Listen! Someone ___ (knock) at the door.", "is knocking", "knocks", "knock"],
    ["She ___ (not/like) spicy food.", "doesn't like", "don't like", "isn't like"],
    ["What ___ right now?", "are you doing", "do you do", "you are doing"],
    ["Water ___ (boil) at 100 degrees.", "boils", "is boiling", "boil"],
    ["It's 8 a.m. The mototaxi drivers ___ (wait) outside.", "are waiting", "waits", "waiting"],
    ["Which expression usually goes with the Present Continuous?", "right now", "every day", "always"],
    ["Choose the correct sentence.", "He is eating rice now.", "He eating rice now.", "He are eating rice now."],
    ["Translate: « Je travaille à Douala en ce moment. »", "I am working in Douala at the moment.", "I work in Douala every moment.", "I am work in Douala at the moment."],
    ["___ you speak French? — Yes, I do.", "Do", "Are", "Does"],
    ["Look at the sky! It ___ (rain).", "is raining", "rains", "rain"],
    ["My mother ___ (cook) every evening.", "cooks", "is cooking", "cook"],
    ["Odd one out (frequency words).", "now", "always", "never"],
    ["They ___ (not/watch) TV now. They are studying.", "aren't watching", "don't watch", "isn't watching"],
    ["How often ___ she go to church?", "does", "is", "do"],
    ["I ___ (know) the answer.", "know", "am knowing", "knowing"],
  ]),
  10: build([
    ["I ___ (call) my mother yesterday.", "called", "call", "calling"],
    ["She ___ (study) in Yaoundé last year.", "studied", "studyed", "studies"],
    ["We didn't ___ (walk) to school.", "walk", "walked", "walks"],
    ["___ you cook last night?", "Did", "Do", "Are"],
    ["They ___ (stop) the taxi.", "stopped", "stoped", "stoping"],
    ["Which word goes with the Past Simple?", "yesterday", "tomorrow", "next week"],
    ["Choose the correct sentence.", "Did he work on Monday?", "Did he worked on Monday?", "Does he worked on Monday?"],
    ["The past of « live » is ___.", "lived", "lifed", "livd"],
    ["The -ed in « wanted » sounds like ___.", "/ɪd/", "/t/", "/s/"],
    ["Translate: « Il a fini son travail. »", "He finished his work.", "He finish his work.", "He is finished his work."],
    ["He ___ (not/arrive) on time.", "didn't arrive", "didn't arrived", "not arrived"],
    ["We ___ (invite) ten people to the party.", "invited", "invite", "inviting"],
    ["Two years ___, I started English classes.", "ago", "before ago", "last"],
    ["Suddenly, the lights ___ (turn) off.", "turned", "turn", "turns"],
    ["Odd one out.", "tomorrow", "yesterday", "last night"],
    ["___ she play football as a child? — Yes, she did.", "Did", "Does", "Was"],
    ["Yesterday I ___ (ask) a question in class.", "asked", "asks", "ask"],
  ]),
  11: build([
    ["Last week I ___ (go) to Kribi.", "went", "goed", "gone"],
    ["She ___ (buy) a phone yesterday.", "bought", "buyed", "buys"],
    ["He didn't ___ (see) the bus.", "see", "saw", "seen"],
    ["Did they ___ (take) a mototaxi?", "take", "took", "taken"],
    ["We ___ (have) a big lunch on Sunday.", "had", "haved", "has"],
    ["The past of « write » is ___.", "wrote", "writed", "written"],
    ["The past of « drink » is ___.", "drank", "drinked", "drunk"],
    ["The past of « meet » is ___.", "met", "meeted", "meat"],
    ["I ___ (sleep) for ten hours last night.", "slept", "sleeped", "sleep"],
    ["Translate: « Nous avons mangé du riz hier. »", "We ate rice yesterday.", "We eated rice yesterday.", "We eat rice yesterday."],
    ["Odd one out (past forms).", "go", "went", "took"],
    ["She ___ me a gift for my birthday.", "gave", "gived", "give"],
    ["I ___ my keys in the market.", "lost", "losed", "lose"],
    ["___ you come to school yesterday?", "Did", "Do", "Were"],
    ["Choose the correct sentence.", "I didn't go to work.", "I didn't went to work.", "I no went to work."],
    ["My friends ___ (come) to my house last Saturday.", "came", "comed", "come"],
    ["Which verb is regular?", "visited", "went", "saw"],
  ]),
  12: build([
    ["___ do you live? — In Douala.", "Where", "When", "Who"],
    ["___ is your birthday? — On 5 May.", "When", "Where", "Why"],
    ["___ is that man? — He is my uncle.", "Who", "What", "How"],
    ["___ much is this bag? — 5,000 FCFA.", "How", "What", "Who"],
    ["Go ___, then turn left at the bridge.", "straight", "straightly", "street"],
    ["The bank is ___ the pharmacy. They are face to face.", "opposite", "behind", "between"],
    ["___ the road carefully, please.", "Cross", "Crossing", "To cross"],
    ["Choose the correct question.", "Where do you work?", "Where you work?", "Where does you work?"],
    ["Which sentence is an imperative?", "Turn right here.", "I turn right here.", "She turns right here."],
    ["Negative imperative: « ___ park here. »", "Don't", "Not", "No"],
    ["Translate: « Excusez-moi, où est la gare ? »", "Excuse me, where is the station?", "Excuse me, where the station is?", "Excuse me, where are station?"],
    ["The market is not near. It is ___.", "far", "next", "opposite"],
    ["___ do you go to school? — By bus.", "How", "Who", "Where"],
    ["Odd one out.", "bridge", "turn", "cross"],
    ["The shop is ___ the school. They are side by side.", "next to", "opposite to far", "between of"],
    ["___ are you late? — Because of the traffic.", "Why", "Who", "Where"],
    ["___ does your sister do? — She is a nurse.", "What", "Who", "Where"],
  ]),
  13: build([
    ["I ___ visit my family next week.", "am going to", "going to", "am go to"],
    ["She ___ open a small shop soon.", "is going to", "are going to", "going to"],
    ["We aren't going to ___ in August.", "travel", "travelling", "travels"],
    ["___ you going to join the njangi?", "Are", "Do", "Will to"],
    ["Look at those black clouds! It ___ rain.", "is going to", "was going to", "goes to"],
    ["Which expression goes with « going to »?", "next month", "last month", "two days ago"],
    ["Choose the correct sentence.", "He is going to study.", "He is going to studies.", "He going to study."],
    ["Translate: « Je vais acheter une moto. »", "I am going to buy a motorbike.", "I go to buy a motorbike.", "I am going buy a motorbike."],
    ["They ___ (not/sell) the house.", "aren't going to sell", "isn't going to sell", "don't going to sell"],
    ["___ she going to cook tonight? — Yes, she is.", "Is", "Does", "Are"],
    ["Odd one out.", "yesterday", "tomorrow", "next year"],
    ["I want to save money. I ___ open a bank account.", "am going to", "am go to", "going to"],
    ["What ___ you going to do this weekend?", "are", "do", "is"],
    ["The negative of « I am going to cry » is ___.", "I am not going to cry.", "I don't going to cry.", "I not am going to cry."],
    ["In « He is going to travel », the verb « travel » is in the ___ form.", "base", "-ing", "past"],
    ["My dream is to ___ a doctor someday.", "become", "becoming", "became"],
    ["The match starts at 4 p.m. We ___ watch it together.", "are going to", "are go to", "is going to"],
  ]),
  14: build([
    ["I think it ___ be sunny tomorrow.", "will", "is", "going"],
    ["The phone is ringing. I ___ answer it!", "'ll", "am going", "will to"],
    ["I promise I ___ be late.", "won't", "don't", "not will"],
    ["___ you help me with this bag, please?", "Will", "Are", "Do to"],
    ["She ___ probably pass the exam.", "will", "wills", "will to"],
    ["The short form of « will not » is ___.", "won't", "willn't", "wouldn't"],
    ["Which word often goes with « will » for predictions?", "probably", "yesterday", "ago"],
    ["Choose the correct sentence.", "He will go to Douala.", "He will goes to Douala.", "He wills go to Douala."],
    ["Translate: « Il pleuvra demain. »", "It will rain tomorrow.", "It rains will tomorrow.", "It will to rain tomorrow."],
    ["I'm hungry. I ___ make some rice.", "will", "am going", "making"],
    ["Odd one out.", "maybe", "perhaps", "yesterday"],
    ["I hope you ___ well soon.", "will feel", "will to feel", "feeling"],
    ["The negative of « They will win » is ___.", "They won't win.", "They don't will win.", "They will not to win."],
    ["___ it rain tomorrow? — I don't think so.", "Will", "Does", "Is"],
    ["Look, she has a ticket in her hand. She ___ travel today. (evidence)", "is going to", "will to", "wills"],
    ["I'm sure the exam ___ difficult. (prediction)", "will be", "will is", "will to be"],
    ["Don't worry! I ___ help you.", "'ll", "am", "going"],
  ]),
  15: build([
    ["I have a headache. I need some ___.", "medicine", "ticket", "market"],
    ["The doctor says: « You ___ drink more water. »", "should", "shoulds", "should to"],
    ["She has a ___. Her temperature is 39 degrees.", "fever", "cough", "pain"],
    ["You ___ smoke. It's bad for your health.", "shouldn't", "should", "shouldn"],
    ["Where do you buy medicine?", "At the pharmacy", "At the bakery", "At the station"],
    ["My head ___. I want to lie down.", "hurts", "hurt is", "hurting is"],
    ["Odd one out.", "pharmacy", "hospital", "cough"],
    ["Translate: « Tu devrais te reposer. »", "You should rest.", "You should to rest.", "You should resting."],
    ["Malaria is a serious ___.", "disease", "weather", "journey"],
    ["He is ___. He can't go to work today.", "sick", "healthy", "hungry"],
    ["___ I take this medicine twice a day?", "Should", "Do should", "Am"],
    ["A person who eats well and exercises is ___.", "healthy", "sick", "tired"],
    ["Choose the correct sentence.", "She should see a doctor.", "She should sees a doctor.", "She shoulds see a doctor."],
    ["I have a bad ___. I can't stop coughing.", "cough", "pain", "fever"],
    ["You ___ eat so much sugar.", "shouldn't", "should", "not should"],
    ["After the illness, he needs time to ___.", "recover", "visit", "travel"],
    ["What do you say to a sick friend?", "Take care!", "Good luck!", "Happy birthday!"],
  ]),
  16: build([
    ["I ___ visited Douala many times.", "have", "has", "am"],
    ["She ___ never eaten sushi.", "has", "have", "is"],
    ["Have you ever ___ to Yaoundé?", "been", "be", "was"],
    ["We haven't seen that film ___.", "yet", "already", "ever"],
    ["He has ___ finished his work. It's done.", "already", "yet", "ago"],
    ["The past participle of « eat » is ___.", "eaten", "ate", "eated"],
    ["The past participle of « see » is ___.", "seen", "saw", "seed"],
    ["The past participle of « do » is ___.", "done", "did", "doed"],
    ["Choose the correct sentence.", "I have lost my phone.", "I have lose my phone.", "I has lost my phone."],
    ["Translate: « Je n'ai jamais voyagé à l'étranger. »", "I have never travelled abroad.", "I never have travel abroad.", "I am never travelled abroad."],
    ["Which sentence is correct?", "I went there yesterday.", "I have gone there yesterday.", "I have went there yesterday."],
    ["___ she ever tried ndolé? — Yes, she has.", "Has", "Have", "Did has"],
    ["They have ___ arrived. They are here now.", "just", "ago", "yesterday"],
    ["Odd one out.", "yesterday", "ever", "never"],
    ["I have been to Kribi ___. It was great both times.", "twice", "twenty", "second"],
    ["My brother ___ (not/finish) his homework yet.", "hasn't finished", "haven't finished", "hasn't finish"],
    ["The negative of « I have seen him » is ___.", "I haven't seen him.", "I don't have seen him.", "I have not see him."],
  ]),
};

export const KEY_PHRASES = {
  9: [
    { en: "What are you doing right now?", fr: "Qu'est-ce que tu fais en ce moment ?" },
    { en: "I'm waiting for a taxi at the moment.", fr: "J'attends un taxi en ce moment." },
    { en: "Look! The street is very busy today.", fr: "Regarde ! La rue est très animée aujourd'hui." },
    { en: "She is wearing a beautiful blue dress.", fr: "Elle porte une belle robe bleue." },
    { en: "The children are laughing and playing.", fr: "Les enfants rient et jouent." },
    { en: "I usually walk to work, but today I'm taking a mototaxi.", fr: "D'habitude je vais au travail à pied, mais aujourd'hui je prends une moto-taxi." },
  ],
  10: [
    { en: "What did you do yesterday?", fr: "Qu'as-tu fait hier ?" },
    { en: "I visited my grandmother last weekend.", fr: "J'ai rendu visite à ma grand-mère le week-end dernier." },
    { en: "We started the journey at six o'clock.", fr: "Nous avons commencé le voyage à six heures." },
    { en: "Suddenly, the car stopped.", fr: "Soudain, la voiture s'est arrêtée." },
    { en: "I didn't watch TV last night.", fr: "Je n'ai pas regardé la télé hier soir." },
    { en: "Finally, we arrived in Douala.", fr: "Finalement, nous sommes arrivés à Douala." },
  ],
  11: [
    { en: "Where did you go last weekend?", fr: "Où es-tu allé le week-end dernier ?" },
    { en: "I went to the market and bought some fish.", fr: "Je suis allé au marché et j'ai acheté du poisson." },
    { en: "I saw an old friend yesterday.", fr: "J'ai vu un vieil ami hier." },
    { en: "We ate ndolé and plantains for lunch.", fr: "Nous avons mangé du ndolé et des plantains au déjeuner." },
    { en: "I didn't sleep well last night.", fr: "Je n'ai pas bien dormi la nuit dernière." },
    { en: "She took a bus from Yaoundé to Douala.", fr: "Elle a pris un bus de Yaoundé à Douala." },
  ],
  12: [
    { en: "Excuse me, where is the bank?", fr: "Excusez-moi, où est la banque ?" },
    { en: "Go straight and turn left at the roundabout.", fr: "Allez tout droit et tournez à gauche au rond-point." },
    { en: "It's next to the pharmacy.", fr: "C'est à côté de la pharmacie." },
    { en: "Is it far from here?", fr: "Est-ce loin d'ici ?" },
    { en: "Cross the bridge and turn right.", fr: "Traversez le pont et tournez à droite." },
    { en: "How much is the taxi to the station?", fr: "Combien coûte le taxi jusqu'à la gare ?" },
  ],
  13: [
    { en: "What are you going to do next weekend?", fr: "Qu'est-ce que tu vas faire le week-end prochain ?" },
    { en: "I'm going to visit my family in Bafoussam.", fr: "Je vais rendre visite à ma famille à Bafoussam." },
    { en: "She is going to open a small shop next year.", fr: "Elle va ouvrir une petite boutique l'année prochaine." },
    { en: "We aren't going to travel in August.", fr: "Nous n'allons pas voyager en août." },
    { en: "I'm going to save 10,000 FCFA every month.", fr: "Je vais économiser 10 000 FCFA chaque mois." },
    { en: "Are you going to join the njangi?", fr: "Vas-tu rejoindre la tontine ?" },
  ],
  14: [
    { en: "I think it will rain tomorrow.", fr: "Je pense qu'il va pleuvoir demain." },
    { en: "I hope you will pass the exam.", fr: "J'espère que tu réussiras l'examen." },
    { en: "Don't worry, I'll help you.", fr: "Ne t'inquiète pas, je vais t'aider." },
    { en: "I promise I won't be late.", fr: "Je promets que je ne serai pas en retard." },
    { en: "Maybe we will win the match.", fr: "Peut-être que nous gagnerons le match." },
    { en: "Will you call me tonight?", fr: "Est-ce que tu m'appelleras ce soir ?" },
  ],
  15: [
    { en: "I don't feel well today.", fr: "Je ne me sens pas bien aujourd'hui." },
    { en: "I have a headache and a fever.", fr: "J'ai mal à la tête et de la fièvre." },
    { en: "You should see a doctor.", fr: "Tu devrais voir un médecin." },
    { en: "You shouldn't work so hard.", fr: "Tu ne devrais pas travailler autant." },
    { en: "Should I take this medicine twice a day?", fr: "Dois-je prendre ce médicament deux fois par jour ?" },
    { en: "Take care and get well soon!", fr: "Prends soin de toi et rétablis-toi vite !" },
  ],
  16: [
    { en: "Have you ever been to Douala?", fr: "As-tu déjà été à Douala ?" },
    { en: "Yes, I have been there three times.", fr: "Oui, j'y suis allé trois fois." },
    { en: "I have never travelled abroad.", fr: "Je n'ai jamais voyagé à l'étranger." },
    { en: "I have already eaten, thank you.", fr: "J'ai déjà mangé, merci." },
    { en: "She hasn't finished her homework yet.", fr: "Elle n'a pas encore fini ses devoirs." },
    { en: "That was the best experience of my life.", fr: "C'était la meilleure expérience de ma vie." },
  ],
};

export const WRITING_PROMPTS = {
  9: { prompt: "Describe a busy street or market in your town (for example in Douala or Yaoundé). What are people doing right now? Use the Present Continuous.", minWords: 40 },
  10: { prompt: "Write about your last weekend. Where did you go? Who did you meet? What did you do? Use regular verbs in the Past Simple.", minWords: 40 },
  11: { prompt: "Write about a trip or a day out you took recently. What did you see, eat and buy? Use irregular verbs in the Past Simple.", minWords: 45 },
  12: { prompt: "Write directions from your home to the nearest market or school. Use imperatives and words like straight, turn, next to and opposite.", minWords: 40 },
  13: { prompt: "Write about your plans for next month. What are you going to do? Where are you going to go? Use going to.", minWords: 40 },
  14: { prompt: "Write five predictions about your city, your country or your life in ten years. Use will and words like probably and maybe.", minWords: 40 },
  15: { prompt: "A friend is sick. Write a short message giving him or her advice. Use should and shouldn't.", minWords: 35 },
  16: { prompt: "Write about three things you have done in your life and one thing you have never done. Use the Present Perfect.", minWords: 45 },
};
