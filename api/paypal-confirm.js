// api/paypal-confirm.js
// Проверка PayPal-оплаты в SANDBOX через Orders API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const body = req.body || {};
    const orderID = body.orderID;

    if (!orderID) {
      return res.status(400).json({ ok: false, error: 'ORDER_ID_MISSING' });
    }

    const client = process.env.PAYPAL_CLIENT;
    const secret = process.env.PAYPAL_SECRET;

    if (!client || !secret) {
      console.error('[paypal-confirm] Missing PAYPAL_CLIENT or PAYPAL_SECRET');
      return res.status(500).json({ ok: false, error: 'PAYPAL_CONFIG_MISSING' });
    }

    const basicAuth = Buffer.from(client + ':' + secret).toString('base64');

    // 1) Берём access token (SANDBOX!)
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
      console.error('[paypal-confirm] Token error:', tokenRes.status, txt);
      return res.status(502).json({ ok: false, error: 'TOKEN_REQUEST_FAILED' });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('[paypal-confirm] No access_token in response');
      return res.status(502).json({ ok: false, error: 'NO_ACCESS_TOKEN' });
    }

    // 2) Проверяем заказ по orderID
    const orderRes = await fetch(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders/' + encodeURIComponent(orderID),
      {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      }
    );

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      console.error('[paypal-confirm] Order lookup failed:', orderRes.status, orderData);
      return res.status(400).json({
        ok: false,
        error: 'ORDER_LOOKUP_FAILED',
        status: orderRes.status,
        details: orderData
      });
    }

    const status = orderData.status;
    let amountOk = false;
    let amountInfo = null;

    try {
      const pu = orderData.purchase_units && orderData.purchase_units[0];
      if (pu && pu.amount) {
        amountInfo = {
          value: pu.amount.value,
          currency: pu.amount.currency_code
        };
        // ожидаем 5.00 EUR — как в pro.js
        amountOk = (pu.amount.value === '5.00' && pu.amount.currency_code === 'EUR');
      }
    } catch (e) {
      console.warn('[paypal-confirm] Cannot parse amount:', e);
    }

    const isCompleted = (status === 'COMPLETED');

    if (isCompleted && amountOk) {
      // всё ок — платёж прошёл и сумма совпала
      return res.status(200).json({
        ok: true,
        status: status,
        amount: amountInfo,
        id: orderData.id
      });
    } else {
      // статус не COMPLETED или сумма не та — не считаем валидным
      return res.status(200).json({
        ok: false,
        status: status,
        amountOk: amountOk,
        amount: amountInfo,
        id: orderData.id
      });
    }
  } catch (err) {
    console.error('[paypal-confirm] Exception:', err);
    return res.status(500).json({
      ok: false,
      error: 'EXCEPTION',
      message: err && err.message ? err.message : String(err)
    });
  }
}
