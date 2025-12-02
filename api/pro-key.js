/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: pro-key.js
 * Назначение: Активация PRO по мастер-коду (без оплаты)
 * Версия: 1.0
 * Обновлено: 2025-12-02
 * ========================================================== */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    // для простоты отдаём 405 (это не PayPal, ретраев не будет)
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const body = req.body || {};
    const keyRaw = body.key;

    const key = String(keyRaw || '').trim();

    if (!key) {
      return res.status(400).json({ ok: false, error: 'KEY_MISSING' });
    }

    // Список мастер-ключей задаётся в ENV:
    // PRO_MASTER_KEYS="ABC123,TEST-KEY-1,VIP-OLYA"
    const envKeys = process.env.PRO_MASTER_KEYS || '';
    const list = envKeys
      .split(',')
      .map(s => String(s || '').trim())
      .filter(Boolean);

    if (!list.length) {
      console.error('[pro-key] No PRO_MASTER_KEYS configured');
      return res.status(500).json({ ok: false, error: 'NO_KEYS_CONFIGURED' });
    }

    const idx = list.findIndex(stored => stored === key);

    if (idx === -1) {
      console.log('[PRO_KEY]', {
        type: 'FAIL',
        keyMasked: key.length > 4
          ? key.slice(0, 2) + '***' + key.slice(-2)
          : '***',
        time: new Date().toISOString()
      });

      return res.status(200).json({ ok: false, error: 'INVALID_KEY' });
    }

    console.log('[PRO_KEY]', {
      type: 'OK',
      index: idx,
      time: new Date().toISOString()
    });

    // Здесь можно потом добавить одноразовые ключи, лимиты и т.п.
    return res.status(200).json({
      ok: true,
      mode: 'master-key',
      index: idx
    });
  } catch (err) {
    console.error('[pro-key] Exception:', err);
    return res.status(500).json({
      ok: false,
      error: 'EXCEPTION',
      message: (err && err.message) ? err.message : String(err)
    });
  }
}

/* ======================= Конец файла: pro-key.js ======================= */
