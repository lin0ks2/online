// api/paypal-webhook.js
// Обработка PayPal webhooks (SANDBOX) с проверкой подписи

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const event = req.body; // PayPal шлёт JSON, Vercel его уже распарсит
    const headers = req.headers || {};

    const transmissionId   = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl          = headers['paypal-cert-url'];
    const authAlgo         = headers['paypal-auth-algo'];
    const transmissionSig  = headers['paypal-transmission-sig'];

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const client    = process.env.PAYPAL_CLIENT;
    const secret    = process.env.PAYPAL_SECRET;

    if (!webhookId || !client || !secret) {
      console.error('[paypal-webhook] Missing env vars');
      return res.status(500).json({ ok: false, error: 'CONFIG_MISSING' });
    }

    // 1) Берём access token (SANDBOX)
    const basicAuth = Buffer.from(client + ':' + secret).toString('base64');

    const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + basicAuth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      console.error('[paypal-webhook] Token error:', tokenRes.status, txt);
      return res.status(502).json({ ok: false, error: 'TOKEN_REQUEST_FAILED' });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('[paypal-webhook] No access_token');
      return res.status(502).json({ ok: false, error: 'NO_ACCESS_TOKEN' });
    }

    // 2) Проверяем подпись вебхука
    const verifyRes = await fetch(
      'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auth_algo:        authAlgo,
          cert_url:         certUrl,
          transmission_id:  transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id:       webhookId,
          webhook_event:    event
        })
      }
    );

    const verifyData = await verifyRes.json();
    const status = verifyData && verifyData.verification_status;

    if (status !== 'SUCCESS') {
      console.error('[paypal-webhook] Signature verify failed:', status, verifyData);
      return res.status(400).json({ ok: false, error: 'SIGNATURE_INVALID', status });
    }

    // 3) Подпись валидна — можно обрабатывать событие
    const eventType = event.event_type;
    console.log('[paypal-webhook] Event received:', eventType, 'id:', event.id);

    // Простейший пример обработки
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource || {};
      const captureId = resource.id;
      const amount = resource.amount && resource.amount.value;
      const currency = resource.amount && resource.amount.currency_code;

      console.log('[paypal-webhook] Capture completed:', {
        captureId,
        amount,
        currency
      });

      // TODO: здесь можно:
      // - записать платёж в лог/БД
      // - привязать к пользователю/устройству (если появится учётка)
    }

    // PayPal ждёт 200 OK, чтобы не ретраить
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[paypal-webhook] Exception:', err);
    return res.status(500).json({
      ok: false,
      error: 'EXCEPTION',
      message: err && err.message ? err.message : String(err)
    });
  }
}
