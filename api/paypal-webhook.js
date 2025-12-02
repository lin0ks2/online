/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: paypal-webhook.js
 * Назначение: Обработка PayPal webhooks (sandbox + live)
 * Версия: 1.2
 * Обновлено: 2025-12-02
 * ========================================================== */

/* ==========================================================
 * Эндпоинт: POST /api/paypal-webhook
 *
 * Важно:
 *   В PayPal настроены ДВА вебхука (sandbox и live),
 *   оба бьют в один и тот же URL.
 *
 *   Поэтому:
 *   - мы определяем, откуда пришло событие,
 *     по полю event.webhook_id;
 *   - если оно равно PAYPAL_WEBHOOK_ID        → sandbox;
 *   - если равно PAYPAL_WEBHOOK_ID_LIVE      → live;
 *   - если ни одно не совпало                → логируем и возвращаем 400.
 * ========================================================== */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const event   = req.body || {};
    const headers = req.headers || {};

    const incomingWebhookId = event.webhook_id;

    const sandboxWebhookId = process.env.PAYPAL_WEBHOOK_ID;
    const liveWebhookId    = process.env.PAYPAL_WEBHOOK_ID_LIVE;

    let mode   = null;   // 'sandbox' | 'live'
    let client = null;
    let secret = null;
    let PAYPAL_API_BASE = null;

    if (incomingWebhookId && incomingWebhookId === liveWebhookId) {
      mode   = 'live';
      client = process.env.PAYPAL_CLIENT_LIVE;
      secret = process.env.PAYPAL_SECRET_LIVE;
      PAYPAL_API_BASE = 'https://api-m.paypal.com';
    } else if (incomingWebhookId && incomingWebhookId === sandboxWebhookId) {
      mode   = 'sandbox';
      client = process.env.PAYPAL_CLIENT;
      secret = process.env.PAYPAL_SECRET;
      PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';
    } else {
      console.error('[paypal-webhook] Unknown webhook_id:', incomingWebhookId);

      console.log('[PAYMENT_LOG]', {
        type:      'WEBHOOK_UNKNOWN_ID',
        source:    'paypal',
        webhookId: incomingWebhookId || null,
        time:      new Date().toISOString()
      });

      return res.status(400).json({
        ok:    false,
        error: 'UNKNOWN_WEBHOOK_ID'
      });
    }

    if (!client || !secret) {
      console.error('[paypal-webhook] Missing credentials for mode:', mode);
      return res.status(500).json({ ok: false, error: 'PAYPAL_CONFIG_MISSING' });
    }

    const transmissionId   = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl          = headers['paypal-cert-url'];
    const authAlgo         = headers['paypal-auth-algo'];
    const transmissionSig  = headers['paypal-transmission-sig'];

    const basicAuth = Buffer.from(client + ':' + secret).toString('base64');

    // 1) Берём access token
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

    // 2) Проверяем подпись вебхука
    const verifyRes = await fetch(
      PAYPAL_API_BASE + '/v1/notifications/verify-webhook-signature',
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
          webhook_id:       incomingWebhookId,
          webhook_event:    event
        })
      }
    );

    const verifyData = await verifyRes.json();
    const status = verifyData && verifyData.verification_status;

    if (status !== 'SUCCESS') {
      console.error('[paypal-webhook] Signature verify failed:', status, verifyData);

      console.log('[PAYMENT_LOG]', {
        type:    'WEBHOOK_VERIFY_FAIL',
        source:  'paypal',
        env:     mode,
        status:  status || null,
        eventId: event && event.id ? event.id : null,
        time:    new Date().toISOString()
      });

      return res.status(400).json({ ok: false, error: 'SIGNATURE_INVALID', status });
    }

    // 3) Подпись валидна — можно обрабатывать событие
    const eventType = event.event_type;
    console.log('[paypal-webhook] Event received:', eventType, 'id:', event.id, 'env:', mode);

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource  = event.resource || {};
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
        eventId:   event.id,
        time:      new Date().toISOString()
      });

      // TODO: сюда позже добавим запись в постоянное хранилище
    }

    // PayPal ждёт 200 OK, чтобы не ретраить событие
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[paypal-webhook] Exception:', err);

    console.log('[PAYMENT_LOG]', {
      type:    'WEBHOOK_EXCEPTION',
      source:  'paypal',
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
