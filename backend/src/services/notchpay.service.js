// backend/src/services/notchpay.service.js
//
// NotchPay est une fintech camerounaise qui couvre EN UNE SEULE integration :
// Orange Money, MTN Mobile Money ET Visa/Mastercard. L'utilisateur choisit sa
// methode sur une page de paiement hebergee par NotchPay (redirection),
// contrairement a CamPay qui ne fait que du push direct Mobile Money.
//
// Sans NOTCHPAY_PUBLIC_KEY, ces fonctions renvoient une erreur claire — le
// reste de la plateforme continue de fonctionner.

import https from "node:https";

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.NOTCHPAY_PUBLIC_KEY;
    if (!apiKey) {
      reject(new Error("NOTCHPAY_PUBLIC_KEY absent - les paiements sont desactives."));
      return;
    }

    const payload = body ? JSON.stringify(body) : undefined;
    const req = https.request(
      {
        hostname: "api.notchpay.co",
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: apiKey,
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
 * Cree une transaction et renvoie l'URL de paiement hebergee NotchPay
 * (l'utilisateur y choisit Orange Money / MoMo / carte bancaire).
 */
export async function initializePayment({ amount, currency, email, phone, reference, description, callbackUrl }) {
  const result = await request("POST", "/payments/initialize", {
    amount,
    currency,
    email,
    phone,
    reference,
    description,
    callback: callbackUrl,
  });

  const authUrl = result?.authorization_url || result?.data?.authorization_url;
  const txReference = result?.transaction?.reference || result?.data?.transaction?.reference || reference;

  if (!authUrl) {
    throw new Error(result.message || "Erreur NotchPay lors de la creation du paiement.");
  }
  return { authorizationUrl: authUrl, reference: txReference };
}

/**
 * Verifie le vrai statut d'une transaction aupres de NotchPay (ne JAMAIS se
 * fier uniquement au webhook — toujours re-verifier ici avant d'activer quoi
 * que ce soit).
 */
export async function verifyPayment(reference) {
  const result = await request("GET", `/payments/${reference}`, null);
  const status = result?.transaction?.status || result?.data?.status || result?.status;
  return { status: normalizeStatus(status), raw: result };
}

function normalizeStatus(s) {
  if (!s) return "pending";
  const v = String(s).toLowerCase();
  if (v.includes("complete") || v === "success" || v === "successful") return "success";
  if (v.includes("fail") || v.includes("cancel") || v.includes("decline")) return "failed";
  return "pending";
}
