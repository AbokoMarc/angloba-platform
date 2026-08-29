// backend/src/controllers/payments.controller.js

import { db } from "../db/client.js";
import { requireRole } from "../middleware/auth.js";
import { sendJson, readJsonBody } from "../utils/http.js";
import { newId } from "../utils/ids.js";
import { initiatePayment, checkPaymentStatus } from "../services/cinetpay.service.js";

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

// POST /api/payments/initiate — cree une transaction et renvoie l'URL de paiement CinetPay
export async function initiate(req, res) {
  const user = requireRole(req, res, "student");
  if (!user) return;

  const nameParts = user.name.trim().split(" ");
  const transactionId = newId("txn");

  try {
    const { paymentUrl } = await initiatePayment({
      transactionId,
      amount: PLAN_PRICE(),
      currency: PLAN_CURRENCY(),
      customerName: nameParts[0] || user.name,
      customerSurname: nameParts.slice(1).join(" ") || ".",
      description: "Abonnement mensuel English Academy",
    });

    await db.execute({
      sql: `INSERT INTO payments (id, student_id, transaction_id, amount, currency, status)
            VALUES (?, ?, ?, ?, ?, 'pending')`,
      args: [newId("pay"), user.id, transactionId, PLAN_PRICE(), PLAN_CURRENCY()],
    });

    sendJson(res, 200, { paymentUrl, transactionId });
  } catch (err) {
    sendJson(res, 503, { error: err.message });
  }
}

// GET /api/payments/status/:transactionId — l'eleve (page de retour) verifie l'issue
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

// POST /api/payments/notify — webhook serveur-a-serveur CinetPay (PUBLIC, pas de JWT).
// On ne fait JAMAIS confiance au contenu du webhook : on re-verifie toujours
// aupres de l'API CinetPay avant d'activer quoi que ce soit.
export async function notify(req, res) {
  const body = await readJsonBody(req);
  const transactionId = body.cpm_trans_id || body.transaction_id;
  if (transactionId) {
    await reconcileTransaction(transactionId).catch((err) => console.error("[payments/notify]", err.message));
  }
  sendJson(res, 200, { ok: true }); // CinetPay attend juste un 200 rapide
}

async function reconcileTransaction(transactionId) {
  const payment = (await db.execute({
    sql: "SELECT * FROM payments WHERE transaction_id = ?",
    args: [transactionId],
  })).rows[0];
  if (!payment || payment.status !== "pending") return; // deja traite ou inconnu

  const result = await checkPaymentStatus(transactionId);
  if (result.status === "pending") return;

  await db.execute({
    sql: "UPDATE payments SET status = ?, payment_method = ?, confirmed_at = datetime('now') WHERE transaction_id = ?",
    args: [result.status, result.method, transactionId],
  });

  if (result.status === "success") {
    // Prolonge depuis la date d'expiration actuelle si elle est encore future
    // (renouvellement anticipe), sinon depuis maintenant.
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
