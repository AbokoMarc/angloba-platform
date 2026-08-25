// backend/src/db/curriculum-data.js
//
// Donnees d'amorcage du programme, construites a partir des documents
// fournis (Programme_Anglais_9_Mois_Adultes.pdf pour la structure des
// 36 semaines, English_Bootcamp_9_Mois_Complete_Workbook.pdf pour le
// contenu detaille des premieres semaines).
//
// Tout ceci n'est qu'un POINT DE DEPART inject en base au premier
// demarrage : l'admin/superadmin peut ensuite tout modifier ou completer
// depuis le Course Builder (espace Admin > Courses), sans toucher au code.

export const MONTHS = [
  { number: 1, title: "Foundations", objective: "Can introduce yourself, ask and answer basic questions." },
  { number: 2, title: "Everyday English", objective: "Can describe daily life and handle simple interactions." },
  { number: 3, title: "Building Conversations", objective: "Can maintain a short everyday conversation." },
  { number: 4, title: "Experiences and Plans", objective: "Can describe experiences and future intentions." },
  { number: 5, title: "Real-life English", objective: "Can manage common real-world situations." },
  { number: 6, title: "Professional English", objective: "Can operate in common professional situations." },
  { number: 7, title: "Fluency", objective: "Can speak longer and with less translation." },
  { number: 8, title: "Advanced Interaction", objective: "Can participate in extended conversations." },
  { number: 9, title: "Autonomy", objective: "Can communicate independently on familiar and professional topics." },
];

// number, month, title, grammarTitle, speakingTask, isTest
export const WEEKS = [
  { number: 1, month: 1, title: "Greetings & Introductions", grammarTitle: "I am / You are — subject pronouns", speakingTask: "Introduce yourself" },
  { number: 2, month: 1, title: "Personal Information", grammarTitle: "Questions with BE; possessives", speakingTask: "Interview a partner" },
  { number: 3, month: 1, title: "Numbers, Time & Dates", grammarTitle: "Have/has; plurals", speakingTask: "Make an appointment" },
  { number: 4, month: 1, title: "Family & People", grammarTitle: "Possessive 's; adjectives", speakingTask: "Describe a person" },

  { number: 5, month: 2, title: "Daily Routines", grammarTitle: "Present Simple", speakingTask: "Talk about your day" },
  { number: 6, month: 2, title: "Home & Neighbourhood", grammarTitle: "There is / There are; prepositions", speakingTask: "Describe your area" },
  { number: 7, month: 2, title: "Food & Shopping", grammarTitle: "Countable/uncountable; some/any", speakingTask: "Shop and order food" },
  { number: 8, month: 2, title: "Work & Free Time", grammarTitle: "Adverbs of frequency; can", speakingTask: "Talk about work and hobbies" },

  { number: 9, month: 3, title: "Present Continuous", grammarTitle: "Present Simple vs Continuous", speakingTask: "Describe a scene" },
  { number: 10, month: 3, title: "Past Events", grammarTitle: "Past Simple — regular verbs", speakingTask: "Tell a short story" },
  { number: 11, month: 3, title: "Irregular Past", grammarTitle: "Common irregular verbs", speakingTask: "Interview about yesterday" },
  { number: 12, month: 3, title: "Travel & Directions", grammarTitle: "Questions and imperatives", speakingTask: "Ask for and give directions" },

  { number: 13, month: 4, title: "Future Plans", grammarTitle: "going to", speakingTask: "Talk about next month" },
  { number: 14, month: 4, title: "Predictions & Decisions", grammarTitle: "will", speakingTask: "Make predictions" },
  { number: 15, month: 4, title: "Health", grammarTitle: "SHOULD / SHOULDN'T", speakingTask: "Doctor-patient role play" },
  { number: 16, month: 4, title: "Experiences", grammarTitle: "Present Perfect introduction", speakingTask: "Talk about experiences" },

  { number: 17, month: 5, title: "Comparisons", grammarTitle: "Comparative / superlative", speakingTask: "Compare products/places" },
  { number: 18, month: 5, title: "Requests & Politeness", grammarTitle: "could / would / can", speakingTask: "Service interaction" },
  { number: 19, month: 5, title: "Hotel & Restaurant", grammarTitle: "would like", speakingTask: "Role play: booking & ordering" },
  { number: 20, month: 5, title: "Complaints", grammarTitle: "Polite forms + past review", speakingTask: "Make a complaint" },

  { number: 21, month: 6, title: "Phone English", grammarTitle: "Can I speak to...?", speakingTask: "Telephone role play" },
  { number: 22, month: 6, title: "Bank & Administration", grammarTitle: "Question forms review", speakingTask: "Solve an admin task" },
  { number: 23, month: 6, title: "CV & Career", grammarTitle: "Present perfect / past review", speakingTask: "Describe experience" },
  { number: 24, month: 6, title: "Job Interview", grammarTitle: "Past and present review", speakingTask: "Mock interview" },

  { number: 25, month: 7, title: "Meetings", grammarTitle: "Agree / disagree; should", speakingTask: "Participate in a meeting" },
  { number: 26, month: 7, title: "Presentations", grammarTitle: "Signposting (first, next, finally)", speakingTask: "3-minute presentation" },
  { number: 27, month: 7, title: "Emails", grammarTitle: "Formal / informal register", speakingTask: "Write a professional email" },
  { number: 28, month: 7, title: "Negotiation", grammarTitle: "Conditionals — introduction", speakingTask: "Negotiate a solution" },

  { number: 29, month: 8, title: "Fluency & Connectors", grammarTitle: "because, although, however, therefore", speakingTask: "Speak for 3 minutes" },
  { number: 30, month: 8, title: "Phrasal Verbs & Collocations", grammarTitle: "Common patterns", speakingTask: "Use them in context" },
  { number: 31, month: 8, title: "British & American English", grammarTitle: "Selected vocabulary/pronunciation", speakingTask: "Identify and use both" },
  { number: 32, month: 8, title: "Listening to Accents", grammarTitle: "Listening strategies", speakingTask: "Summarise what you heard" },

  { number: 33, month: 9, title: "Debate & Opinions", grammarTitle: "Modals/conditionals review", speakingTask: "Mini-debate" },
  { number: 34, month: 9, title: "Problem Solving", grammarTitle: "Mixed grammar", speakingTask: "Solve a realistic problem" },
  { number: 35, month: 9, title: "Integrated Simulation", grammarTitle: "Revision", speakingTask: "Full-day scenario" },
  { number: 36, month: 9, title: "Final Assessment", grammarTitle: "Consolidation", speakingTask: "Presentation + conversation + writing", isTest: true },
];

// Contenu enrichi (grammaire complete, exemples) pour les semaines de
// demonstration — extrait fidelement du workbook fourni.
export const GRAMMAR_HTML = {
  1: `<p>We use <b>BE</b> to talk about identity, job, origin, age and feelings.</p>
<table><tr><th></th><th>Affirmative</th><th>Negative</th><th>Question</th></tr>
<tr><td>I</td><td>I am Paul</td><td>I am not tired</td><td>Am I late?</td></tr>
<tr><td>You/We/They</td><td>You are my friend</td><td>You are not right</td><td>Are you ok?</td></tr>
<tr><td>He/She/It</td><td>She is a doctor</td><td>He is not here</td><td>Is he French?</td></tr></table>
<p><b>Contractions:</b> I am = I'm | is not = isn't | are not = aren't</p>
<p><b>5 uses of BE:</b> Identity (I am Paul) · Job (She is a teacher) · Origin (We are from Cameroon) · Age (He is 25) · Feeling (I am happy/tired/busy)</p>
<p><b>British vs American:</b> flat = apartment</p>`,
  2: `<p>We use <b>Present Simple</b> for habits, routines and facts.</p>
<p><b>Formula:</b> I/You/We/They + verb → I work · He/She/It + verb+s → She works</p>
<p><b>Negative:</b> don't/doesn't + verb → I don't work / She doesn't work</p>
<p><b>Question:</b> Do/Does + subject + verb? → Do you work? Does she work?</p>
<p><b>Adverbs of frequency:</b> always &gt; usually &gt; often &gt; sometimes &gt; rarely &gt; never</p>
<p>Position: <i>I always wake up early.</i></p>`,
  3: `<p><b>Possessive adjectives:</b> my, your, his, her, our, their — This is my book. That is her car.</p>
<p><b>Possessive 's</b> (for people): John's brother | My mother's name</p>
<p><b>Wh- questions:</b> Whose is this? → It's my book. Who is she? → She is my sister.</p>`,
  4: `<p><b>Possessive 's</b> continued, plus descriptive adjectives for people.</p>
<p>Family vocabulary: mother, father, brother, sister, son, daughter, husband, wife, uncle, aunt, cousin, grandfather, grandmother.</p>
<p>Describe someone: <i>She has long hair. He is tall and friendly.</i></p>`,
  15: `<p>We use <b>SHOULD</b> to give advice or make a recommendation. It means something is the right thing to do.</p>
<p><b>Structure:</b> Subject + SHOULD + base verb — SHOULD never changes form (no -s, no -ed, no -ing).</p>
<p><b>Examples:</b></p>
<ul>
<li>You should rest. <i>(Tu devrais te reposer.)</i></li>
<li>You shouldn't work so much. <i>(Tu ne devrais pas autant travailler.)</i></li>
<li>Should I see a doctor? <i>(Est-ce que je devrais voir un medecin ?)</i></li>
</ul>
<p><b>Important note:</b> SHOULD expresses a weaker obligation than MUST. If a doctor says "You should rest", it's strong advice. If they say "You must rest", it's a direct order. In everyday English, SHOULD is the most common way to give polite advice.</p>`,
};

// week -> [{ word, wordType, fr, gb, us }]
export const VOCABULARY = {
  1: [
    { word: "Hello", wordType: "interjection", fr: "Bonjour" },
    { word: "Good morning", wordType: "phrase", fr: "Bonjour (matin)" },
    { word: "Name", wordType: "noun", fr: "Nom" },
    { word: "Teacher", wordType: "noun", fr: "Professeur" },
    { word: "Student", wordType: "noun", fr: "Etudiant" },
    { word: "Country", wordType: "noun", fr: "Pays" },
    { word: "Happy", wordType: "adjective", fr: "Heureux" },
    { word: "Tired", wordType: "adjective", fr: "Fatigue" },
    { word: "Busy", wordType: "adjective", fr: "Occupe" },
    { word: "Friend", wordType: "noun", fr: "Ami" },
  ],
  2: [
    { word: "Wake up", wordType: "verb", fr: "Se reveiller" },
    { word: "Breakfast", wordType: "noun", fr: "Petit dejeuner" },
    { word: "Go to work", wordType: "phrase", fr: "Aller au travail" },
    { word: "Finish", wordType: "verb", fr: "Finir" },
    { word: "Usually", wordType: "adverb", fr: "Habituellement" },
    { word: "Never", wordType: "adverb", fr: "Jamais" },
    { word: "O'clock", wordType: "phrase", fr: "Heure pile" },
    { word: "Half past", wordType: "phrase", fr: "Et demi" },
  ],
  3: [
    { word: "Appointment", wordType: "noun", fr: "Rendez-vous" },
    { word: "Date", wordType: "noun", fr: "Date" },
    { word: "Calendar", wordType: "noun", fr: "Calendrier" },
    { word: "Schedule", wordType: "noun", fr: "Emploi du temps" },
  ],
  4: [
    { word: "Mother", wordType: "noun", fr: "Mere" },
    { word: "Father", wordType: "noun", fr: "Pere" },
    { word: "Brother", wordType: "noun", fr: "Frere" },
    { word: "Sister", wordType: "noun", fr: "Soeur" },
    { word: "Son", wordType: "noun", fr: "Fils" },
    { word: "Daughter", wordType: "noun", fr: "Fille" },
    { word: "Uncle", wordType: "noun", fr: "Oncle" },
    { word: "Aunt", wordType: "noun", fr: "Tante" },
    { word: "Cousin", wordType: "noun", fr: "Cousin(e)" },
  ],
  15: [
    { word: "Appointment", wordType: "noun", fr: "Rendez-vous" },
    { word: "Prescription", wordType: "noun", fr: "Ordonnance" },
    { word: "Symptom", wordType: "noun", fr: "Symptome" },
    { word: "Recover", wordType: "verb", fr: "Se retablir" },
    { word: "Advice", wordType: "noun", fr: "Conseil" },
    { word: "Recommend", wordType: "verb", fr: "Recommander" },
    { word: "Flat", wordType: "noun", fr: "Appartement", gb: "flat", us: "apartment" },
    { word: "Queue", wordType: "noun", fr: "File d'attente", gb: "queue", us: "line" },
  ],
  31: [
    { word: "Lift", wordType: "noun", fr: "Ascenseur", gb: "lift", us: "elevator" },
    { word: "Holiday", wordType: "noun", fr: "Vacances", gb: "holiday", us: "vacation" },
    { word: "Lorry", wordType: "noun", fr: "Camion", gb: "lorry", us: "truck" },
    { word: "Trainers", wordType: "noun", fr: "Baskets", gb: "trainers", us: "sneakers" },
    { word: "CV", wordType: "noun", fr: "CV", gb: "CV", us: "resume" },
    { word: "Postcode", wordType: "noun", fr: "Code postal", gb: "postcode", us: "ZIP code" },
  ],
};

// week -> [{ question, options: [...], correctIndex }]
export const EXERCISES = {
  1: [
    { question: "I ___ a student.", options: ["am", "is", "are"], correctIndex: 0 },
    { question: "She ___ from Douala.", options: ["am", "is", "are"], correctIndex: 1 },
    { question: "They ___ teachers.", options: ["am", "is", "are"], correctIndex: 2 },
    { question: "We ___ busy today.", options: ["am", "is", "are"], correctIndex: 2 },
  ],
  2: [
    { question: "I work → She ___", options: ["work", "works", "working"], correctIndex: 1 },
    { question: "They play → He ___", options: ["play", "plays", "playing"], correctIndex: 1 },
    { question: "Do you speak English? is the question form of:", options: ["You speak English.", "You are speaking English.", "You spoke English."], correctIndex: 0 },
  ],
  15: [
    { question: "She ___ to the doctor yesterday.", options: ["should go", "should went", "went", "should to go"], correctIndex: 2 },
    { question: "You ___ rest if you are tired.", options: ["should", "shoulds", "shoulding"], correctIndex: 0 },
    { question: "___ I see a doctor?", options: ["Should", "Shoulds", "Do should"], correctIndex: 0 },
  ],
};

// 9 compositions (une toutes les 2 semaines), avec le sujet exact du programme.
export const COMPOSITIONS = [
  { number: 1, week: 2, title: "Myself", prompt: "Write 100-120 words introducing yourself: name, country, work/studies, family and interests.", minWords: 100 },
  { number: 2, week: 4, title: "My Daily Life", prompt: "Write 120-150 words about a normal day and what you are doing this week.", minWords: 120 },
  { number: 3, week: 8, title: "A Memorable Day", prompt: "Write 150 words about something that happened in the past.", minWords: 150 },
  { number: 4, week: 12, title: "My Plans", prompt: "Write 150-180 words about your plans for the next year.", minWords: 150 },
  { number: 5, week: 16, title: "Travel Situation", prompt: "Write 180 words: describe a trip, booking or travel problem and how you solved it.", minWords: 180 },
  { number: 6, week: 20, title: "Professional Profile", prompt: "Write 200 words presenting your skills, experience and professional goals.", minWords: 200 },
  { number: 7, week: 24, title: "A Problem and a Solution", prompt: "Write 220 words explaining a problem and proposing solutions.", minWords: 220 },
  { number: 8, week: 28, title: "Opinion Essay", prompt: "Write 250 words: Is technology making communication better?", minWords: 250 },
  { number: 9, week: 36, title: "Final Composition", prompt: "Write 300 words: How has your English changed and how will you use it?", minWords: 300 },
];

// Scenarios du Speaking Lab — l'IA joue le personnage, calibree sur le niveau de l'eleve.
export const SPEAKING_SCENARIOS = [
  {
    key: "doctor", title: "At the Doctor", emoji: "🧑‍⚕️", level: "Beginner",
    aiPersona: "Dr. Johnson, a friendly and patient doctor",
    aiOpening: "Good morning! I'm Dr. Johnson. Please sit down. What seems to be the problem today?",
    goal: "Practice describing symptoms and understanding advice with SHOULD/SHOULDN'T (Week 15: Health).",
  },
  {
    key: "restaurant", title: "At the Restaurant", emoji: "🍔", level: "Beginner",
    aiPersona: "a polite waiter/waitress at a busy restaurant",
    aiOpening: "Good evening! Welcome. Can I take your order, or would you like a few more minutes?",
    goal: "Practice ordering food and polite requests (Can I have...? I would like...).",
  },
  {
    key: "interview", title: "Job Interview", emoji: "💼", level: "Intermediate",
    aiPersona: "a professional hiring manager conducting a job interview",
    aiOpening: "Thanks for coming in today. So, tell me a little about yourself.",
    goal: "Practice answering common interview questions using Past + Present + Future structure.",
  },
  {
    key: "hotel", title: "At the Hotel", emoji: "🏨", level: "Beginner",
    aiPersona: "a hotel receptionist",
    aiOpening: "Good afternoon, welcome to our hotel. Do you have a reservation?",
    goal: "Practice booking a room and using 'would like' politely.",
  },
  {
    key: "phone", title: "Phone Call", emoji: "📞", level: "Intermediate",
    aiPersona: "an office assistant answering the phone",
    aiOpening: "Hello, thank you for calling. How can I help you today?",
    goal: "Practice phone English: Can I speak to...? Can I leave a message?",
  },
  {
    key: "airport", title: "At the Airport", emoji: "✈️", level: "Beginner",
    aiPersona: "an airline check-in agent",
    aiOpening: "Good morning, may I see your passport and ticket, please?",
    goal: "Practice travel vocabulary and answering simple direct questions.",
  },
];
