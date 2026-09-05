// backend/src/routes.js — table de routage (dans l'esprit "Node natif" du projet)

import * as authCtrl from "./controllers/auth.controller.js";
import * as studentsCtrl from "./controllers/students.controller.js";
import * as teachersCtrl from "./controllers/teachers.controller.js";
import * as adminsCtrl from "./controllers/admins.controller.js";
import * as coursesCtrl from "./controllers/courses.controller.js";
import * as compositionsCtrl from "./controllers/compositions.controller.js";
import * as speakingCtrl from "./controllers/speaking.controller.js";
import * as mediaCtrl from "./controllers/media.controller.js";
import * as appearanceCtrl from "./controllers/appearance.controller.js";
import * as paymentsCtrl from "./controllers/payments.controller.js";
import * as pushCtrl from "./controllers/push.controller.js";
import * as eventsCtrl from "./controllers/events.controller.js";
import * as engagementCtrl from "./controllers/engagement.controller.js";
import * as dailyQuizCtrl from "./controllers/daily-quiz.controller.js";

// Chaque route : [METHOD, regex-avec-groupes-nommes, handler]
// params est extrait automatiquement des groupes nommes (?<id>...) etc.
export const routes = [
  // --- Auth ---
  ["POST", /^\/api\/auth\/register$/, authCtrl.register],
  ["POST", /^\/api\/auth\/login$/, authCtrl.login],
  ["GET", /^\/api\/auth\/me$/, authCtrl.me],

  // --- Appearance (GET public, PUT protege) ---
  ["GET", /^\/api\/appearance$/, appearanceCtrl.getAppearance],
  ["PUT", /^\/api\/appearance$/, appearanceCtrl.updateAppearance],

  // --- Students ---
  ["GET", /^\/api\/students$/, studentsCtrl.listStudents],
  ["PATCH", /^\/api\/students\/(?<id>[^/]+)$/, studentsCtrl.updateStudent],
  ["GET", /^\/api\/students\/me\/dashboard$/, studentsCtrl.myDashboard],
  ["POST", /^\/api\/students\/me\/advance-week$/, studentsCtrl.advanceMyWeek],
  ["GET", /^\/api\/students\/leaderboard$/, studentsCtrl.leaderboard],

  // --- Teachers ---
  ["GET", /^\/api\/teachers$/, teachersCtrl.listTeachers],
  ["POST", /^\/api\/teachers$/, teachersCtrl.createTeacher],
  ["PATCH", /^\/api\/teachers\/(?<id>[^/]+)$/, teachersCtrl.updateTeacherStatus],

  // --- Admins (super admin only) ---
  ["GET", /^\/api\/admins$/, adminsCtrl.listAdmins],
  ["POST", /^\/api\/admins$/, adminsCtrl.createAdmin],
  ["PATCH", /^\/api\/admins\/(?<id>[^/]+)\/permissions$/, adminsCtrl.updateAdminPermissions],
  ["PATCH", /^\/api\/admins\/(?<id>[^/]+)\/status$/, adminsCtrl.updateAdminStatus],

  // --- Courses / curriculum ---
  ["GET", /^\/api\/courses\/months$/, coursesCtrl.getFullProgram],
  ["GET", /^\/api\/courses\/weeks\/(?<number>\d+)$/, coursesCtrl.getWeekDetail],
  ["PUT", /^\/api\/courses\/weeks\/(?<number>\d+)$/, coursesCtrl.updateWeek],
  ["POST", /^\/api\/courses\/weeks\/(?<number>\d+)\/vocabulary$/, coursesCtrl.addVocabularyWord],
  ["POST", /^\/api\/courses\/weeks\/(?<number>\d+)\/exercises$/, coursesCtrl.addExercise],
  ["GET", /^\/api\/courses\/speaking-scenarios$/, coursesCtrl.listSpeakingScenarios],
  ["POST", /^\/api\/courses\/speaking-scenarios$/, coursesCtrl.createSpeakingScenario],
  ["POST", /^\/api\/courses\/weeks\/(?<number>\d+)\/submit-exercises$/, coursesCtrl.submitExercises],

  // --- Compositions ---
  ["GET", /^\/api\/compositions$/, compositionsCtrl.listCompositions],
  ["GET", /^\/api\/compositions\/me$/, compositionsCtrl.mySubmissions],
  ["POST", /^\/api\/compositions\/(?<id>[^/]+)\/submit$/, compositionsCtrl.submitComposition],
  ["GET", /^\/api\/compositions\/pending$/, compositionsCtrl.pendingCorrections],
  ["POST", /^\/api\/compositions\/submissions\/(?<id>[^/]+)\/ai-assist$/, compositionsCtrl.aiAssistCorrection],
  ["POST", /^\/api\/compositions\/submissions\/(?<id>[^/]+)\/ai-review$/, compositionsCtrl.studentAiReview],
  ["PATCH", /^\/api\/compositions\/submissions\/(?<id>[^/]+)\/correct$/, compositionsCtrl.correctSubmission],

  // --- Speaking Lab (IA) ---
  ["POST", /^\/api\/speaking\/turn$/, speakingCtrl.speakingTurn],
  ["POST", /^\/api\/speaking\/finish$/, speakingCtrl.speakingFinish],
  ["GET", /^\/api\/speaking\/history$/, speakingCtrl.speakingHistory],
  ["GET", /^\/api\/speaking\/student\/(?<id>[^/]+)$/, speakingCtrl.speakingForStudent],

  // --- Media / audio upload ---
  ["POST", /^\/api\/media\/upload$/, mediaCtrl.uploadAudio],
  ["GET", /^\/api\/media$/, mediaCtrl.listAudio],
  ["POST", /^\/api\/media\/images$/, mediaCtrl.uploadImage],
  ["GET", /^\/api\/media\/images$/, mediaCtrl.listImages],
  ["POST", /^\/api\/media\/videos$/, mediaCtrl.uploadVideo],
  ["GET", /^\/api\/media\/videos$/, mediaCtrl.listVideos],

  // --- Paiements (NotchPay : Mobile Money + Visa/Mastercard) ---
  ["GET", /^\/api\/payments\/me$/, paymentsCtrl.myPayments],
  ["POST", /^\/api\/payments\/initiate$/, paymentsCtrl.initiate],
  ["GET", /^\/api\/payments\/status\/(?<transactionId>[^/]+)$/, paymentsCtrl.status],
  ["POST", /^\/api\/payments\/notify$/, paymentsCtrl.notify],

  // --- Notifications push (double sens eleve <-> admin/systeme) ---
  ["GET", /^\/api\/push\/vapid-public-key$/, pushCtrl.vapidPublicKey],
  ["POST", /^\/api\/push\/subscribe$/, pushCtrl.subscribe],
  ["POST", /^\/api\/events$/, eventsCtrl.createEvent],
  ["POST", /^\/api\/admin\/notify$/, engagementCtrl.notifyStudent],
  ["GET", /^\/api\/cron\/check-inactifs$/, engagementCtrl.checkInactive],
  ["GET", /^\/api\/cron\/auto-correct-compositions$/, engagementCtrl.autoCorrectCompositions],

  // --- Quiz quotidien (20 questions, difficulte croissante) ---
  ["GET", /^\/api\/daily-quiz$/, dailyQuizCtrl.getDailyQuiz],
  ["POST", /^\/api\/daily-quiz\/submit$/, dailyQuizCtrl.submitDailyQuiz],
];
