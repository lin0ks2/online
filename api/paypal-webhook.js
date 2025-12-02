/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: paypal-webhook.js
 * Назначение: Обработка PayPal Webhooks (sandbox/live)
 * Версия: 1.1
 * Обновлено: 2025-12-02
 * ========================================================== */

/* ==========================================================
 * Эндпоинт: POST /api/paypal-webhook
 *
 * Используется PayPal Webhooks:
 *   - CHECKOUT.ORDER.APPROVED
 *   - PAYMENT.CAPTURE.COMPLETED
 *
 * Логика:
 *   1) Определяем режим (sandbox/live) по PAYPAL_MODE.
 *   2) Берём соответствующие:
 *        - PAYPAL_CLIENT / PAYPAL_SECRET
 *        - PAYPAL_WEBHOOK_ID
 *   3) Получаем access token у PayPal.
 *   4) Проверяем подпись webhook'а через
 *      /v1/notifications/verify-webhook-signature.
 *   5) Если подпись валидна:
 *        - логируем событие в [PAYMENT_LOG] (WEBHOOK_CAPTURE и т.п.).
 *   6) Отвечаем 200 OK, чтобы PayPal не ретраил.
 * ========================================================== */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const event   = req.body || {};
    const headers = req.headers || {};

    const mode   = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';
    const isLive = mode === 'live';

    const client = isLive
      ? process.env.PAYPAL_CLIENT_LIVE
      : process.env.PAYPAL_CLIENT;

    const secret = isLive
      ? process.env.PAYPAL_SECRET_LIVE
      : process.env.PAYPAL_SECRET;

    const webhookId = isLive
      ? process.env.PAYPAL_WEBHOOK_ID_LIVE
      : process.env.PAYPAL_WEBHOOK_ID;

    const PAYPAL_API_BASE = isLive
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    if (!client || !secret || !webhookId) {
      console.error('[paypal-webhook] Missing config for mode:', mode);
      return res.status(500).json({ ok: false, error: 'PAYPAL_CONFIG_MISSING' });
    }

    const transmissionId   = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl          = headers['paypal-cert-url'];
    const authAlgo         = headers['paypal-auth-algo'];
    const transmissionSig  = headers['paypal-transmission-sig'];

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      console.error('[paypal-webhook] Missing required PayPal headers');
      return res.status(400).json({ ok: false, error: 'HEADERS_MISSING' });
    }

    // 1) Берём access token
    const basicAuth = Buffer.from(client + ':' + secret).toString('base64');

    const tokenRes = await fetch(PAYPAL_API_BASE + '/v1/oauth2/token', {
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

    // 2) Проверяем подпись webhook'а
    const verifyRes = await fetch(
      PAYPAL_API_BASE + '/v1/notifications/verify-webhook-signature',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auth_algo:         authAlgo,
          cert_url:          certUrl,
          transmission_id:  transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id:        webhookId,
          webhook_event:     event
        })
      }
    );

    const verifyData = await verifyRes.json();
    const status = verifyData && verifyData.verification_status;

    if (status !== 'SUCCESS') {
      console.error('[paypal-webhook] Signature verify failed:', status, verifyData);
      return res.status(400).json({ ok: false, error: 'SIGNATURE_INVALID', status });
    }

    // 3) Подпись валидна — обрабатываем событие
    const eventType = event.event_type;
    console.log('[paypal-webhook] Event received:', eventType, 'id:', event.id, 'mode:', mode);

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource || {};
      const captureId = resource.id;
      const amount    = resource.amount && resource.amount.value;
      const currency  = resource.amount && resource.amount.currency_code;

      console.log('[PAYMENT_LOG]', {
        type:      'WEBHOOK_CAPTURE',
        source:    'paypal',
        env:       mode,
        captureId: captureId,
        amount:    amount,
        currency:  currency,
        rawStatus: resource.status,
        time:      new Date().toISOString()
      });

      // TODO: тут можно будет привязать оплату к пользователю/устройству,
      //       когда появится аккаунт/идентификатор.
    }

    // Можно добавить обработку других типов, если понадобится
    // if (eventType === 'CHECKOUT.ORDER.APPROVED') { ... }

    // PayPal ждёт 200 OK, если всё ок
    return res.status(200).json({ ok: true });
  } catch (err) {
    const mode = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';
    console.error('[paypal-webhook] Exception:', err);

    console.log('[PAYMENT_LOG]', {
      type:    'WEBHOOK_ERROR',
      source:  'paypal',
      env:     mode,
      reason:  'EXCEPTION',
      message: (err && err.message) ? err.message : String(err),
      time:    new Date().toISOString()
    });

    return res.status(500).json({
      ok:    false,
      error: 'EXCEPTION',
      message: (err && err.message) ? err.message : String(err)
    });
  }
}

/* ==================== Конец файла: paypal-webhook.js ==================== */
