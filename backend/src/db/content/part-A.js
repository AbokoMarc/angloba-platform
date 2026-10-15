// Angloba course content, part A (weeks 1-8). Grammar for weeks 5-8 only.
// q(question, correct, wrongA, wrongB, correctIndex) builds a 3-option question.
const q = (question, correct, a, b, idx) => {
  const options = [a, b];
  options.splice(idx, 0, correct);
  return { question, options, correctIndex: idx };
};

export const GRAMMAR_HTML = {
  5: `<p>We use the <b>Present Simple</b> for habits, routines and facts. <i>(Le présent simple : habitudes, routines et vérités générales.)</i></p>
<p><b>Formula:</b> I/You/We/They + verb | He/She/It + verb + <b>s/es</b></p>
<p><b>Negative:</b> don't / doesn't + base verb. <b>Question:</b> Do / Does + subject + base verb?</p>
<ul>
<li>I get up at 5:30. <i>(Je me lève à 5h30.)</i></li>
<li>She works in Douala. <i>(Elle travaille à Douala.)</i></li>
<li>He studies at night. <i>(Il étudie la nuit.)</i></li>
<li>We don't eat meat on Fridays. <i>(Nous ne mangeons pas de viande le vendredi.)</i></li>
<li>Does your brother take a mototaxi? <i>(Ton frère prend-il une mototaxi ?)</i></li>
<li>The market opens at 6 a.m. <i>(Le marché ouvre à 6 h.)</i></li>
</ul>
<p><b>Spelling:</b> go → goes, watch → watches, study → studies, have → has.</p>
<p><b>Attention:</b> French speakers often say "She don't work" or "Does she works?". After <i>does/doesn't</i>, the verb has NO -s: She doesn't work. Does she work?</p>
<p><b>Remember:</b> the -s goes on the verb only in affirmative sentences with he/she/it.</p>`,
  6: `<p>We use <b>There is</b> (singular) and <b>There are</b> (plural) to say that something exists or is in a place. <i>(« Il y a » en anglais.)</i></p>
<p><b>Formula:</b> There is + a/an + singular noun | There are + plural noun / numbers</p>
<p><b>Negative:</b> There isn't / There aren't. <b>Question:</b> Is there...? / Are there...?</p>
<ul>
<li>There is a bank near my house. <i>(Il y a une banque près de chez moi.)</i></li>
<li>There are three bedrooms in the flat. <i>(Il y a trois chambres dans l'appartement.)</i></li>
<li>Is there a pharmacy here? <i>(Y a-t-il une pharmacie ici ?)</i></li>
<li>There aren't any shops in my street. <i>(Il n'y a pas de boutiques dans ma rue.)</i></li>
</ul>
<table><tr><th>Preposition</th><th>Example</th></tr>
<tr><td>in</td><td>in the kitchen, in Yaoundé</td></tr>
<tr><td>on</td><td>on the table, on the wall</td></tr>
<tr><td>next to / near</td><td>next to the school</td></tr>
<tr><td>between / opposite</td><td>between the bank and the church</td></tr>
<tr><td>in front of / behind</td><td>behind the house</td></tr></table>
<p><b>Attention:</b> do not say "It has a market near here" or "Is a market". Say: <b>There is</b> a market near here.</p>
<p><b>Remember:</b> there is + singular, there are + plural.</p>
<p><b>British vs American:</b> flat (GB) = apartment (US)</p>`,
  7: `<p>Nouns can be <b>countable</b> (we can count them) or <b>uncountable</b> (we cannot). <i>(Dénombrables et indénombrables.)</i></p>
<table><tr><th>Countable</th><th>Uncountable</th></tr>
<tr><td>an egg, two eggs, a bottle</td><td>rice, water, sugar, oil, bread, money</td></tr>
<tr><td>How <b>many</b> eggs?</td><td>How <b>much</b> rice?</td></tr>
<tr><td>a few / many</td><td>a little / much</td></tr></table>
<p><b>some</b> = affirmative sentences and offers. <b>any</b> = negatives and questions.</p>
<ul>
<li>I need some oil. <i>(J'ai besoin d'huile.)</i></li>
<li>We don't have any tomatoes. <i>(Nous n'avons pas de tomates.)</i></li>
<li>Do you have any onions? <i>(Avez-vous des oignons ?)</i></li>
<li>Would you like some tea? <i>(Voulez-vous du thé ?)</i></li>
<li>How much is the fish? <i>(Combien coûte le poisson ?)</i></li>
<li>I'd like a kilo of rice. <i>(Je voudrais un kilo de riz.)</i></li>
</ul>
<p><b>Attention:</b> uncountable nouns have no plural and no "a". Do NOT say "a bread", "advices" or "informations". Say: a loaf of bread, some advice, some information.</p>
<p><b>Remember:</b> many + countable, much + uncountable; some in "yes" sentences, any in "no" and "?" sentences.</p>`,
  8: `<p>Adverbs of frequency say <b>how often</b> we do something. <b>Can</b> says what we are able to do. <i>(Fréquence et capacité.)</i></p>
<p>always (100%) &gt; usually &gt; often &gt; sometimes &gt; rarely &gt; never (0%)</p>
<p><b>Position:</b> BEFORE the main verb, but AFTER the verb BE. <i>I often work late. She is always on time.</i></p>
<p><b>CAN:</b> Subject + can + base verb. Negative: can't / cannot. Question: Can + subject + verb? The form never changes (no -s).</p>
<ul>
<li>I usually take a mototaxi to work. <i>(Je prends généralement une mototaxi pour aller travailler.)</i></li>
<li>My boss is never late. <i>(Mon patron n'est jamais en retard.)</i></li>
<li>We sometimes dance on Saturdays. <i>(Nous dansons parfois le samedi.)</i></li>
<li>She can cook very well. <i>(Elle sait très bien cuisiner.)</i></li>
<li>He can't drive a lorry. <i>(Il ne sait pas conduire un camion.)</i></li>
<li>Can you help me, please? <i>(Pouvez-vous m'aider, s'il vous plaît ?)</i></li>
</ul>
<p><b>Attention:</b> French speakers say "I go always to the market" or "She cans swim". Correct: I always go to the market. She can swim.</p>
<p><b>Remember:</b> frequency adverb before the verb, after BE; CAN + base verb.</p>`,
};

export const VOCABULARY = {
  1: [
    { word: "Goodbye", wordType: "interjection", fr: "Au revoir" },
    { word: "Welcome", wordType: "interjection", fr: "Bienvenue" },
    { word: "Please", wordType: "adverb", fr: "S'il vous plaît" },
    { word: "Thank you", wordType: "phrase", fr: "Merci" },
    { word: "Sorry", wordType: "adjective", fr: "Désolé" },
    { word: "Nice to meet you", wordType: "phrase", fr: "Enchanté" },
    { word: "Fine", wordType: "adjective", fr: "Bien (en forme)" },
    { word: "Meet", wordType: "verb", fr: "Rencontrer" },
    { word: "Introduce", wordType: "verb", fr: "Présenter" },
    { word: "Nurse", wordType: "noun", fr: "Infirmier / infirmière" },
    { word: "Driver", wordType: "noun", fr: "Chauffeur" },
    { word: "Engineer", wordType: "noun", fr: "Ingénieur" },
    { word: "Cameroonian", wordType: "adjective", fr: "Camerounais(e)" },
    { word: "See you later", wordType: "phrase", fr: "À plus tard" },
  ],
  2: [
    { word: "Age", wordType: "noun", fr: "Âge" },
    { word: "Surname", wordType: "noun", fr: "Nom de famille" },
    { word: "Address", wordType: "noun", fr: "Adresse" },
    { word: "Phone number", wordType: "noun", fr: "Numéro de téléphone" },
    { word: "Email", wordType: "noun", fr: "Adresse e-mail" },
    { word: "Date of birth", wordType: "noun", fr: "Date de naissance" },
    { word: "Job", wordType: "noun", fr: "Emploi, métier" },
    { word: "Married", wordType: "adjective", fr: "Marié(e)" },
    { word: "Single", wordType: "adjective", fr: "Célibataire" },
    { word: "Nationality", wordType: "noun", fr: "Nationalité" },
    { word: "Spell", wordType: "verb", fr: "Épeler" },
    { word: "Language", wordType: "noun", fr: "Langue" },
    { word: "Hometown", wordType: "noun", fr: "Ville d'origine" },
    { word: "Born", wordType: "adjective", fr: "Né(e)" },
  ],
  3: [
    { word: "Week", wordType: "noun", fr: "Semaine" },
    { word: "Weekend", wordType: "noun", fr: "Week-end" },
    { word: "Month", wordType: "noun", fr: "Mois" },
    { word: "Year", wordType: "noun", fr: "Année" },
    { word: "Tomorrow", wordType: "adverb", fr: "Demain" },
    { word: "Yesterday", wordType: "adverb", fr: "Hier" },
    { word: "Hour", wordType: "noun", fr: "Heure (durée)" },
    { word: "Minute", wordType: "noun", fr: "Minute" },
    { word: "Quarter past", wordType: "phrase", fr: "Et quart" },
    { word: "Early", wordType: "adjective", fr: "Tôt, en avance" },
    { word: "Late", wordType: "adjective", fr: "Tard, en retard" },
    { word: "Birthday", wordType: "noun", fr: "Anniversaire" },
    { word: "Hundred", wordType: "noun", fr: "Cent" },
    { word: "Thousand", wordType: "noun", fr: "Mille" },
  ],
  4: [
    { word: "Grandfather", wordType: "noun", fr: "Grand-père" },
    { word: "Grandmother", wordType: "noun", fr: "Grand-mère" },
    { word: "Husband", wordType: "noun", fr: "Mari" },
    { word: "Wife", wordType: "noun", fr: "Épouse" },
    { word: "Parents", wordType: "noun", fr: "Parents (père et mère)" },
    { word: "Nephew", wordType: "noun", fr: "Neveu" },
    { word: "Niece", wordType: "noun", fr: "Nièce" },
    { word: "Twin", wordType: "noun", fr: "Jumeau / jumelle" },
    { word: "Tall", wordType: "adjective", fr: "Grand (de taille)" },
    { word: "Short", wordType: "adjective", fr: "Petit (de taille)" },
    { word: "Slim", wordType: "adjective", fr: "Mince" },
    { word: "Young", wordType: "adjective", fr: "Jeune" },
    { word: "Kind", wordType: "adjective", fr: "Gentil" },
    { word: "Funny", wordType: "adjective", fr: "Drôle" },
  ],
  5: [
    { word: "Get up", wordType: "verb", fr: "Se lever" },
    { word: "Shower", wordType: "noun", fr: "Douche" },
    { word: "Commute", wordType: "verb", fr: "Faire le trajet domicile-travail" },
    { word: "Lunch", wordType: "noun", fr: "Déjeuner" },
    { word: "Dinner", wordType: "noun", fr: "Dîner" },
    { word: "Cook", wordType: "verb", fr: "Cuisiner" },
    { word: "Clean", wordType: "verb", fr: "Nettoyer" },
    { word: "Wash", wordType: "verb", fr: "Laver" },
    { word: "Study", wordType: "verb", fr: "Étudier" },
    { word: "Leave", wordType: "verb", fr: "Partir, quitter" },
    { word: "Arrive", wordType: "verb", fr: "Arriver" },
    { word: "Relax", wordType: "verb", fr: "Se détendre" },
    { word: "Go to bed", wordType: "phrase", fr: "Aller se coucher" },
    { word: "Mototaxi", wordType: "noun", fr: "Moto-taxi" },
  ],
  6: [
    { word: "Neighbourhood", wordType: "noun", fr: "Quartier" },
    { word: "Street", wordType: "noun", fr: "Rue" },
    { word: "Building", wordType: "noun", fr: "Bâtiment, immeuble" },
    { word: "Bedroom", wordType: "noun", fr: "Chambre" },
    { word: "Kitchen", wordType: "noun", fr: "Cuisine" },
    { word: "Bathroom", wordType: "noun", fr: "Salle de bain" },
    { word: "Living room", wordType: "noun", fr: "Salon" },
    { word: "Garden", wordType: "noun", fr: "Jardin" },
    { word: "Next to", wordType: "preposition", fr: "À côté de" },
    { word: "Opposite", wordType: "preposition", fr: "En face de" },
    { word: "Between", wordType: "preposition", fr: "Entre" },
    { word: "Behind", wordType: "preposition", fr: "Derrière" },
    { word: "In front of", wordType: "preposition", fr: "Devant" },
    { word: "Near", wordType: "preposition", fr: "Près de" },
  ],
  7: [
    { word: "Bread", wordType: "noun", fr: "Pain" },
    { word: "Plantain", wordType: "noun", fr: "Banane plantain" },
    { word: "Fish", wordType: "noun", fr: "Poisson" },
    { word: "Tomato", wordType: "noun", fr: "Tomate" },
    { word: "Onion", wordType: "noun", fr: "Oignon" },
    { word: "Oil", wordType: "noun", fr: "Huile" },
    { word: "Sugar", wordType: "noun", fr: "Sucre" },
    { word: "Salt", wordType: "noun", fr: "Sel" },
    { word: "Cheap", wordType: "adjective", fr: "Bon marché" },
    { word: "Expensive", wordType: "adjective", fr: "Cher" },
    { word: "Change", wordType: "noun", fr: "Monnaie (rendue)" },
    { word: "Kilo", wordType: "noun", fr: "Kilo" },
    { word: "Bottle", wordType: "noun", fr: "Bouteille" },
    { word: "Customer", wordType: "noun", fr: "Client(e)" },
  ],
  8: [
    { word: "Colleague", wordType: "noun", fr: "Collègue" },
    { word: "Boss", wordType: "noun", fr: "Patron, chef" },
    { word: "Salary", wordType: "noun", fr: "Salaire" },
    { word: "Office", wordType: "noun", fr: "Bureau" },
    { word: "Hobby", wordType: "noun", fr: "Passe-temps" },
    { word: "Free time", wordType: "noun", fr: "Temps libre" },
    { word: "Dance", wordType: "verb", fr: "Danser" },
    { word: "Sing", wordType: "verb", fr: "Chanter" },
    { word: "Draw", wordType: "verb", fr: "Dessiner" },
    { word: "Drive", wordType: "verb", fr: "Conduire" },
    { word: "Sometimes", wordType: "adverb", fr: "Parfois" },
    { word: "Rarely", wordType: "adverb", fr: "Rarement" },
    { word: "Often", wordType: "adverb", fr: "Souvent" },
    { word: "Hardly ever", wordType: "phrase", fr: "Presque jamais" },
  ],
};

export const EXERCISES = {
  1: [
    q("Hello! I ___ Joseph.", "am", "is", "are", 0),
    q("Mr and Mrs Ndi ___ from Bamenda.", "are", "is", "am", 1),
    q("It ___ a nice day.", "is", "am", "are", 2),
    q("She ___ a nurse. (negative)", "isn't", "aren't", "amn't", 0),
    q("How ___ you? — I'm fine, thank you.", "are", "is", "am", 1),
    q("You meet a friend at 8 p.m. You say:", "Good evening", "Good morning", "Good afternoon", 2),
    q("Translate: « Enchanté. »", "Nice to meet you.", "See you later.", "How are you?", 0),
    q("Translate: « Au revoir. »", "Goodbye.", "Welcome.", "Sorry.", 1),
    q("Odd one out:", "happy", "nurse", "driver", 2),
    q("I'm from Cameroon. I'm ___.", "Cameroonian", "Cameroon", "Cameroons", 0),
    q("\"Where are you from?\" asks about:", "your country", "your age", "your job", 1),
    q("Short form of \"They are\":", "They're", "Theyre", "They'is", 2),
    q("We ___ not late.", "are", "is", "am", 0),
    q("___ your name Alice?", "Is", "Are", "Am", 1),
    q("Choose the correct sentence:", "He is a mechanic.", "He are a mechanic.", "He am a mechanic.", 2),
    q("Translate: « Comment ça va ? »", "How are you?", "How old are you?", "Where are you?", 0),
    q("\"Pleased to meet you\" means:", "Enchanté", "Désolé", "Merci beaucoup", 0),
    q("Someone helps you. You say:", "Thank you.", "Goodbye.", "Welcome.", 1),
  ],
  2: [
    q("How old ___ your brother?", "is", "are", "am", 0),
    q("Where ___ your parents from?", "are", "is", "am", 1),
    q("___ is your phone number? — It's 681 02 18 87.", "What", "Who", "Where", 0),
    q("I am Eric. ___ surname is Tabi.", "My", "Me", "Mine", 1),
    q("This is Rita and ___ husband.", "her", "she", "hers", 0),
    q("They live in Douala. ___ house is big.", "Their", "They", "Them", 2),
    q("Are you married? — No, I'm ___.", "single", "alone", "one", 0),
    q("Possessive adjective for \"we\":", "our", "us", "we", 1),
    q("___ are you from? — I'm from Garoua.", "Where", "When", "Who", 2),
    q("Is he your brother? Short answer \"yes\":", "Yes, he is.", "Yes, he does.", "Yes, he are.", 0),
    q("Are you a student? Short answer \"no\":", "No, I'm not.", "No, I amn't.", "No, I don't.", 0),
    q("___ old are you?", "How", "What", "Which", 1),
    q("Translate: « Quelle est votre adresse ? »", "What's your address?", "Where is your address?", "Who is your address?", 2),
    q("\"How do you spell your name?\" asks for:", "the letters", "your job", "your age", 0),
    q("This book is mine. = This is ___ book.", "my", "me", "mine", 0),
    q("Who ___ your teacher?", "is", "are", "am", 0),
    q("Choose the correct question:", "What is her name?", "What her name is?", "What is name her?", 1),
    q("Your mother's name is Mary. ___ name is Mary.", "Her", "His", "Their", 2),
  ],
  3: [
    q("Plural of \"box\":", "boxes", "boxs", "boxen", 0),
    q("Plural of \"man\":", "men", "mans", "manes", 1),
    q("Plural of \"woman\":", "women", "womans", "womens", 0),
    q("Plural of \"bus\":", "buses", "buss", "busies", 2),
    q("Plural of \"tooth\":", "teeth", "tooths", "teeths", 0),
    q("How many days are there in a week?", "Seven", "Five", "Ten", 0),
    q("What comes after nineteen?", "Twenty", "Twelve", "Ninety", 1),
    q("2:30 is:", "half past two", "half to two", "two past half", 0),
    q("3:15 is:", "quarter past three", "quarter to three", "half past three", 2),
    q("5:45 is:", "quarter to six", "quarter past five", "half past five", 0),
    q("The day after Monday is:", "Tuesday", "Sunday", "Wednesday", 0),
    q("Sandra ___ a meeting at 10.", "has", "have", "having", 1),
    q("My parents ___ a shop in Douala.", "have", "has", "haves", 0),
    q("The bank ___ two ATMs.", "has", "have", "having", 2),
    q("20 + 30 = ?", "fifty", "forty", "sixty", 0),
    q("The meeting is ___ Friday.", "on", "in", "at", 1),
    q("The appointment is ___ 9 o'clock.", "at", "on", "in", 0),
    q("Translate: « Demain »", "Tomorrow", "Yesterday", "Today", 0),
    q("Plural of \"family\":", "families", "familys", "familyes", 2),
  ],
  4: [
    q("My father's brother is my ___.", "uncle", "cousin", "nephew", 0),
    q("My mother's mother is my ___.", "grandmother", "aunt", "sister", 0),
    q("My brother's son is my ___.", "nephew", "niece", "cousin", 1),
    q("My uncle's daughter is my ___.", "cousin", "sister", "niece", 0),
    q("This is the ___ room.", "children's", "childrens", "childrens'", 2),
    q("The house of my two parents is:", "my parents' house", "my parent's house", "my parents house's", 0),
    q("Opposite of \"tall\":", "short", "long", "thin", 1),
    q("Opposite of \"young\":", "old", "slim", "kind", 0),
    q("She has two ___ sisters.", "tall", "talls", "tallest", 2),
    q("Odd one out:", "tall", "aunt", "uncle", 0),
    q("Odd one out:", "nephew", "kind", "funny", 1),
    q("Choose the correct sentence:", "She is a kind woman.", "She is a woman kind.", "She is a kinds woman.", 2),
    q("My sister's husband is my ___.", "brother-in-law", "uncle", "cousin", 0),
    q("Whose car is it? It's ___.", "Marc's car", "Marc car", "car Marc's", 0),
    q("He has short ___ hair.", "black", "blacks", "blacked", 1),
    q("Two babies born on the same day to the same mother are ___.", "twins", "cousins", "nephews", 0),
    q("Translate: « mari »", "husband", "wife", "uncle", 2),
    q("Translate: « drôle »", "funny", "kind", "slim", 0),
    q("Translate: « gentil »", "kind", "tall", "short", 1),
  ],
  5: [
    q("She ___ English at university.", "studies", "studys", "study", 0),
    q("My father ___ a taxi in Douala.", "drives", "drive", "driving", 0),
    q("He ___ breakfast at 7.", "has", "haves", "have", 0),
    q("The market ___ at 6 a.m.", "opens", "open", "opening", 0),
    q("Do they ___ in Yaoundé?", "live", "lives", "living", 0),
    q("She ___ like fish.", "doesn't", "don't", "isn't", 0),
    q("I ___ not watch TV in the morning.", "do", "does", "am", 0),
    q("Does your brother ___ football?", "play", "plays", "playing", 0),
    q("Third person of \"watch\":", "watches", "watchs", "watchies", 0),
    q("Third person of \"try\":", "tries", "trys", "tryes", 0),
    q("Third person of \"go\":", "goes", "gos", "goies", 0),
    q("Water ___ at 100 degrees.", "boils", "boil", "boiling", 0),
    q("What time ___ you get up?", "do", "does", "are", 0),
    q("The bus ___ at 7:30 every morning.", "arrives", "arrive", "arriving", 0),
    q("We ___ to church on Sundays.", "go", "goes", "going", 0),
    q("Negative of \"He works on Sunday\":", "He doesn't work on Sunday.", "He doesn't works on Sunday.", "He not work on Sunday.", 0),
    q("\"Does she cook?\" Short answer \"yes\":", "Yes, she does.", "Yes, she cooks.", "Yes, she do.", 0),
    q("Translate: « Je ne fume pas. »", "I don't smoke.", "I am not smoke.", "I doesn't smoke.", 0),
  ],
  6: [
    q("___ a bank near my house.", "There is", "There are", "They are", 0),
    q("___ two hospitals in our town.", "There are", "There is", "It has", 0),
    q("___ any water in the bottle?", "Is there", "Are there", "There is", 0),
    q("___ any students in the classroom?", "Are there", "Is there", "There is", 0),
    q("There ___ a mototaxi in front of the shop.", "is", "are", "be", 0),
    q("There ___ not any chairs.", "are", "is", "am", 0),
    q("The pharmacy is ___ the bank and the school.", "between", "at", "on", 0),
    q("The shop is across the street from the school. It is ___ the school.", "opposite", "between", "under", 0),
    q("The ball is below the chair. It is ___ the chair.", "under", "over", "in", 0),
    q("The picture is ___ the wall.", "on", "in", "at", 0),
    q("I live ___ Yaoundé.", "in", "on", "at", 0),
    q("She is ___ home.", "at", "in", "on", 0),
    q("The school is ___ my house; I walk two minutes.", "near", "inside", "under", 0),
    q("Choose the correct sentence:", "There are three rooms.", "There is three rooms.", "It has three rooms there.", 0),
    q("Negative of \"There is a park\":", "There isn't a park.", "There not is a park.", "There doesn't a park.", 0),
    q("Translate: « Il y a un marché près d'ici. »", "There is a market near here.", "It has a market near here.", "He is a market near here.", 0),
    q("You cook in the ___.", "kitchen", "bathroom", "bedroom", 0),
    q("You sleep in the ___.", "bedroom", "kitchen", "garden", 0),
    q("\"Are there any shops?\" Short answer \"yes\":", "Yes, there are.", "Yes, there is.", "Yes, they are.", 0),
  ],
  7: [
    q("How ___ is this bread?", "much", "many", "few", 0),
    q("How ___ tomatoes do you want?", "many", "much", "little", 0),
    q("I'd like ___ oil, please.", "some", "a", "many", 0),
    q("Do you have ___ onions?", "any", "a", "much", 0),
    q("There aren't ___ eggs.", "any", "some", "much", 0),
    q("Which word is uncountable?", "sugar", "tomato", "bottle", 0),
    q("Which word is countable?", "egg", "rice", "milk", 0),
    q("Plural of \"tomato\":", "tomatoes", "tomatos", "tomatoeses", 0),
    q("Odd one out:", "banana", "bread", "rice", 0),
    q("Odd one out:", "onion", "cheap", "expensive", 0),
    q("Would you like ___ tea? (an offer)", "some", "many", "few", 0),
    q("I need ___ kilo of rice.", "a", "some", "any", 0),
    q("Is there any fish? — Yes, there's ___.", "some", "many", "any", 0),
    q("I don't have ___ money.", "any", "some", "a", 0),
    q("It costs 50,000 FCFA. It's very ___.", "expensive", "cheap", "free", 0),
    q("Translate: « C'est trop cher. »", "It's too expensive.", "It's cheap enough.", "It's free.", 0),
    q("Can I have a ___ of water?", "bottle", "slice", "pair", 0),
    q("Choose the correct sentence:", "I don't have any rice.", "I don't have some rice.", "I haven't no rice.", 0),
    q("Do we have ___ sugar?", "any", "a", "many", 0),
  ],
  8: [
    q("I ___ drink coffee; I hate it. (0%)", "never", "always", "usually", 0),
    q("She is on time every day. She is ___ late.", "never", "always", "often", 0),
    q("He ___ goes to church on Sundays. (every Sunday)", "always", "never", "rarely", 0),
    q("Choose the correct sentence:", "She is always happy.", "She always is happy.", "Always she is happy.", 0),
    q("Choose the correct sentence:", "They never eat meat.", "They eat never meat.", "Never they eat meat.", 0),
    q("Can I ___ your phone?", "use", "to use", "using", 0),
    q("He can ___ a motorbike.", "ride", "rides", "to ride", 0),
    q("She ___ drive a car.", "can't", "doesn't can", "isn't can", 0),
    q("I ___ play the guitar, but I'd like to learn.", "can't", "can", "don't can", 0),
    q("Negative of \"can\":", "can't", "don't can", "not can", 0),
    q("How often do you go to the market? — ___.", "Twice a week.", "Two kilometres.", "At six.", 0),
    q("\"What do you do?\" asks about:", "your job", "your hobby", "your name", 0),
    q("Translate: « Je peux nager. »", "I can swim.", "I can to swim.", "I am can swim.", 0),
    q("Odd one out:", "salary", "boss", "colleague", 0),
    q("Odd one out:", "office", "dance", "sing", 0),
    q("\"She rarely eats out\" means she eats out:", "almost never", "every day", "often", 0),
    q("A hobby is:", "something you enjoy in your free time", "a job", "a salary", 0),
    q("Translate: « Parfois »", "Sometimes", "Always", "Never", 0),
    q("___ you swim? — Yes, I can.", "Can", "Do", "Are", 0),
  ],
};

export const KEY_PHRASES = {
  1: [
    { en: "Hello, my name is Marc. Nice to meet you.", fr: "Bonjour, je m'appelle Marc. Enchanté." },
    { en: "I'm from Yaoundé, in Cameroon.", fr: "Je viens de Yaoundé, au Cameroun." },
    { en: "I'm a student and I'm very happy to be here.", fr: "Je suis étudiant et je suis très heureux d'être ici." },
    { en: "How are you today?", fr: "Comment allez-vous aujourd'hui ?" },
    { en: "I'm fine, thank you. And you?", fr: "Je vais bien, merci. Et vous ?" },
    { en: "Goodbye, see you tomorrow.", fr: "Au revoir, à demain." },
  ],
  2: [
    { en: "What's your surname, please?", fr: "Quel est votre nom de famille, s'il vous plaît ?" },
    { en: "How do you spell that?", fr: "Comment l'épelez-vous ?" },
    { en: "How old are you?", fr: "Quel âge avez-vous ?" },
    { en: "My phone number is six eight one, zero two, one eight, eight seven.", fr: "Mon numéro de téléphone est le 681 02 18 87." },
    { en: "Where are you from?", fr: "D'où venez-vous ?" },
    { en: "I'm not married. I'm single.", fr: "Je ne suis pas marié. Je suis célibataire." },
  ],
  3: [
    { en: "I have an appointment at half past nine.", fr: "J'ai un rendez-vous à neuf heures et demie." },
    { en: "What time is it, please?", fr: "Quelle heure est-il, s'il vous plaît ?" },
    { en: "What's the date today?", fr: "Quelle est la date aujourd'hui ?" },
    { en: "Can we meet on Friday at ten o'clock?", fr: "Pouvons-nous nous voir vendredi à dix heures ?" },
    { en: "My birthday is in June.", fr: "Mon anniversaire est en juin." },
    { en: "The ticket is five thousand FCFA.", fr: "Le billet coûte cinq mille FCFA." },
  ],
  4: [
    { en: "This is my family. I have two brothers and one sister.", fr: "Voici ma famille. J'ai deux frères et une sœur." },
    { en: "My mother's name is Grace.", fr: "Ma mère s'appelle Grace." },
    { en: "My father is tall and very kind.", fr: "Mon père est grand et très gentil." },
    { en: "She has long black hair and brown eyes.", fr: "Elle a de longs cheveux noirs et des yeux marron." },
    { en: "My cousin is funny and he's twenty years old.", fr: "Mon cousin est drôle et il a vingt ans." },
    { en: "I live with my grandmother in Douala.", fr: "J'habite avec ma grand-mère à Douala." },
  ],
  5: [
    { en: "I get up at five thirty every morning.", fr: "Je me lève à cinq heures trente tous les matins." },
    { en: "I take a mototaxi to work.", fr: "Je prends une moto-taxi pour aller au travail." },
    { en: "She doesn't eat breakfast at home.", fr: "Elle ne prend pas son petit déjeuner à la maison." },
    { en: "What time do you finish work?", fr: "À quelle heure finissez-vous le travail ?" },
    { en: "In the evening, I cook dinner and study English.", fr: "Le soir, je prépare le dîner et j'étudie l'anglais." },
    { en: "I usually go to bed at ten.", fr: "Je me couche généralement à dix heures." },
  ],
  6: [
    { en: "I live in a small house in Bonamoussadi.", fr: "J'habite dans une petite maison à Bonamoussadi." },
    { en: "There are three bedrooms and a big kitchen.", fr: "Il y a trois chambres et une grande cuisine." },
    { en: "There is a market near my house.", fr: "Il y a un marché près de chez moi." },
    { en: "The pharmacy is next to the bank.", fr: "La pharmacie est à côté de la banque." },
    { en: "Is there a hospital in your neighbourhood?", fr: "Y a-t-il un hôpital dans votre quartier ?" },
    { en: "The school is opposite the church.", fr: "L'école est en face de l'église." },
  ],
  7: [
    { en: "How much is a kilo of tomatoes?", fr: "Combien coûte un kilo de tomates ?" },
    { en: "I'd like some rice and some fish, please.", fr: "Je voudrais du riz et du poisson, s'il vous plaît." },
    { en: "Do you have any plantains today?", fr: "Avez-vous des plantains aujourd'hui ?" },
    { en: "That's too expensive. Can you make it cheaper?", fr: "C'est trop cher. Pouvez-vous baisser le prix ?" },
    { en: "Here is ten thousand FCFA. Do you have change?", fr: "Voici dix mille FCFA. Avez-vous la monnaie ?" },
    { en: "I don't need any onions, thank you.", fr: "Je n'ai pas besoin d'oignons, merci." },
  ],
  8: [
    { en: "I work in an office in Douala.", fr: "Je travaille dans un bureau à Douala." },
    { en: "My boss is never late.", fr: "Mon patron n'est jamais en retard." },
    { en: "I often play football with my colleagues.", fr: "Je joue souvent au football avec mes collègues." },
    { en: "In my free time, I sometimes dance and sing.", fr: "Pendant mon temps libre, je danse et je chante parfois." },
    { en: "I can cook very well, but I can't drive.", fr: "Je sais très bien cuisiner, mais je ne sais pas conduire." },
    { en: "Can you help me with this, please?", fr: "Pouvez-vous m'aider avec ça, s'il vous plaît ?" },
  ],
};

export const WRITING_PROMPTS = {
  1: { prompt: "Introduce yourself in a short message. Say your name, where you are from, your job or studies, and how you feel today.", minWords: 30 },
  2: { prompt: "Fill in a profile for a new friend: write your name, surname, age, nationality, address (city), job, and say if you are married or single. Write full sentences.", minWords: 35 },
  3: { prompt: "Write an email to a clinic or office to make an appointment. Give the day, the date and the time you prefer, and say how many people are coming.", minWords: 40 },
  4: { prompt: "Describe your family. Say who is in it, how old they are and what they look like (tall, short, kind, funny...). Use possessive 's at least twice.", minWords: 45 },
  5: { prompt: "Describe your typical weekday from morning to night. Use the Present Simple and at least three times (for example: I get up at 6:00).", minWords: 50 },
  6: { prompt: "Describe your house and your neighbourhood. Use There is / There are and at least four prepositions (next to, opposite, near, between...).", minWords: 50 },
  7: { prompt: "Write a shopping list and a short dialogue at the market in Douala or Yaoundé. Use much, many, some and any, and ask about prices in FCFA.", minWords: 55 },
  8: { prompt: "Write about your work or studies and your hobbies. Use at least three adverbs of frequency and say what you can and can't do.", minWords: 60 },
};
