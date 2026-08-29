// backend/src/controllers/payments.controller.js

import { db } from "../db/client.js";
import { requireRole } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { newId } from "../utils/ids.js";
import { collectPayment, checkStatus } from "../services/campay.service.js";

const PLAN_PRICE = () => Number(process.env.PAYMENT_MONTHLY_PRICE || 5000);
const PLAN_CURRENCY = () => process.env.PAYMENT_CURRENCY || "XAF";
const PLAN_DURATION_DAYS = 30;

// GET /api/payments/me — etat de mon abonnement + historique de paiements
export async function myPayments(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const profile = (await db.execute({
    sql: "SELECT subscription_status, trial_ends_at, subscription_expires_at FROM student_profiles WHERE user_id = ?",
    args: [user.id],
  })).rows[0];

  const payments = (await db.execute({
    sql: "SELECT transaction_id, amount, currency, status, payment_method, created_at, confirmed_at FROM payments WHERE student_id = ? ORDER BY created_at DESC",
    args: [user.id],
  })).rows;

  sendJson(res, 200, {
    subscription: profile,
    payments,
    plan: { price: PLAN_PRICE(), currency: PLAN_CURRENCY(), durationDays: PLAN_DURATION_DAYS },
  });
}

// POST /api/payments/initiate — body: { phone: "2376XXXXXXXX" }
// Declenche le push Mobile Money direct sur le telephone de l'eleve.
export async function initiate(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const body = await readJsonBody(req);
  const phone = (body.phone || "").replace(/\s|\+/g, "");
  if (!/^237[62]\d{8}$/.test(phone)) {
    return sendJson(res, 400, { error: "Numero invalide. Format attendu : 2376XXXXXXXX ou 2372XXXXXXXX (MTN ou Orange)." });
  }

  const transactionId = newId("txn");

  try {
    const { reference, status } = await collectPayment({
      amount: PLAN_PRICE(),
      currency: PLAN_CURRENCY(),
      phone,
      description: "Abonnement mensuel English Academy",
      externalReference: transactionId,
    });

    await db.execute({
      sql: `INSERT INTO payments (id, student_id, transaction_id, campay_reference, amount, currency, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [newId("pay"), user.id, transactionId, reference, PLAN_PRICE(), PLAN_CURRENCY(), status],
    });

    sendJson(res, 200, { transactionId, status });
  } catch (err) {
    sendJson(res, 503, { error: err.message });
  }
}

// GET /api/payments/status/:transactionId — l'eleve (page d'abonnement) sonde
// le statut toutes les quelques secondes jusqu'a confirmation ou echec.
export async function status(req, res, params) {
  const user = requireRole(req, res, "student");
  if (!user) return;
  await reconcileTransaction(params.transactionId);

  const payment = (await db.execute({
    sql: "SELECT status FROM payments WHERE transaction_id = ? AND student_id = ?",
    args: [params.transactionId, user.id],
  })).rows[0];

  sendJson(res, 200, { status: payment?.status || "unknown" });
}

// POST /api/payments/notify — webhook CamPay (PUBLIC, pas de JWT). Configure
// cette URL dans le dashboard CamPay (Settings de l'application), pas passee
// par requete comme CinetPay. On ne fait jamais confiance au webhook seul :
// on re-verifie toujours aupres de l'API CamPay avant d'activer quoi que ce soit.
export async function notify(req, res) {
  const body = await readJsonBody(req);
  const reference = body.reference;
  if (reference) {
    const payment = (await db.execute({ sql: "SELECT transaction_id FROM payments WHERE campay_reference = ?", args: [reference] })).rows[0];
    if (payment) {
      await reconcileTransaction(payment.transaction_id).catch((err) => console.error("[payments/notify]", err.message));
    }
  }
  sendJson(res, 200, { ok: true });
}

async function reconcileTransaction(transactionId) {
  const payment = (await db.execute({
    sql: "SELECT * FROM payments WHERE transaction_id = ?",
    args: [transactionId],
  })).rows[0];
  if (!payment || payment.status !== "pending") return; // deja traite ou inconnu

  const result = await checkStatus(payment.campay_reference);
  if (result.status === "pending") return;

  await db.execute({
    sql: "UPDATE payments SET status = ?, payment_method = ?, confirmed_at = datetime('now') WHERE transaction_id = ?",
    args: [result.status, result.raw?.operator || null, transactionId],
  });

  if (result.status === "success") {
    const profile = (await db.execute({
      sql: "SELECT subscription_expires_at FROM student_profiles WHERE user_id = ?",
      args: [payment.student_id],
    })).rows[0];

    const base = profile?.subscription_expires_at && new Date(profile.subscription_expires_at + "Z") > new Date()
      ? new Date(profile.subscription_expires_at + "Z")
      : new Date();
    base.setDate(base.getDate() + PLAN_DURATION_DAYS);

    await db.execute({
      sql: "UPDATE student_profiles SET subscription_status = 'active', subscription_expires_at = ? WHERE user_id = ?",
      args: [base.toISOString().slice(0, 19).replace("T", " "), payment.student_id],
    });
  }
}
