// api/paypal-confirm.js
// Временная простая заглушка, чтобы проверить маршрут

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    const body = req.body || {};
    const orderID = body.orderID || null;

    return res.status(200).json({
      ok: true,
      echo: true,
      orderID: orderID
    });
  } catch (err) {
    console.error('[paypal-confirm] simple handler error:', err);
    return res.status(500).json({
      ok: false,
      error: 'EXCEPTION',
      message: err && err.message ? err.message : String(err)
    });
  }
}
