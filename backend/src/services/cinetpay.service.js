// backend/src/services/cinetpay.service.js
//
// CinetPay est l'agregateur de paiement le plus utilise en Afrique
// francophone (dont le Cameroun) : une seule integration donne acces a
// Orange Money, MTN Mobile Money ET Visa/Mastercard (channels: "ALL").
// L'utilisateur choisit sa methode sur la page de paiement hebergee par
// CinetPay elle-meme — on n'a jamais a gerer les identifiants bancaires.
//
// Sans CINETPAY_API_KEY / CINETPAY_SITE_ID, les fonctions renvoient une
// erreur claire — le reste de la plateforme continue de fonctionner.

import https from "node:https";

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request(
      {
        hostname: "api-checkout.cinetpay.com",
        path,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
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
    req.write(payload);
    req.end();
  });
}

function credentials() {
  const apikey = process.env.CINETPAY_API_KEY;
  const site_id = process.env.CINETPAY_SITE_ID;
  if (!apikey || !site_id) {
    throw new Error("CINETPAY_API_KEY / CINETPAY_SITE_ID absents - les paiements sont desactives.");
  }
  return { apikey, site_id };
}

/**
 * Cree une transaction de paiement et renvoie l'URL de la page de paiement
 * hebergee CinetPay (Orange Money / MoMo / carte au choix de l'utilisateur).
 */
export async function initiatePayment({ transactionId, amount, currency, customerName, customerSurname, description }) {
  const { apikey, site_id } = credentials();

  const body = {
    apikey,
    site_id,
    transaction_id: transactionId,
    amount,
    currency,
    description,
    customer_name: customerName,
    customer_surname: customerSurname || ".",
    notify_url: `${process.env.PUBLIC_API_BASE_URL}/api/payments/notify`,
    return_url: `${process.env.PUBLIC_APP_URL}/student/subscribe.html?status=return`,
    channels: "ALL", // Orange Money + MTN MoMo + Visa/Mastercard, choix laisse a l'utilisateur
  };

  const result = await postJson("/v2/payment", body);
  if (result.code !== "201") {
    throw new Error(result.message || result.description || "Erreur lors de la creation du paiement CinetPay.");
  }
  return { paymentUrl: result.data.payment_url, paymentToken: result.data.payment_token };
}

/**
 * Verifie le vrai statut d'une transaction aupres de CinetPay (ne JAMAIS se
 * fier uniquement au webhook "notify" — toujours re-verifier ici).
 * Retourne un statut normalise : 'success' | 'failed' | 'pending'.
 */
export async function checkPaymentStatus(transactionId) {
  const { apikey, site_id } = credentials();
  const result = await postJson("/v2/payment/check", { apikey, site_id, transaction_id: transactionId });

  const status = result?.data?.status;
  if (status === "ACCEPTED") return { status: "success", method: result.data.payment_method || null, raw: result.data };
  if (status === "REFUSED" || status === "CANCELLED") return { status: "failed", method: null, raw: result.data };
  return { status: "pending", method: null, raw: result.data };
}
