/* ==========================================================================
 * Проект: MOYAMOVA
 * Файл: ui.legal.modal.js
 * Назначение: Модалка "Условия использования"
 * Версия: 1.0
 * Обновлено: 2025-11-23
 * ========================================================================== */

(function () {
  "use strict";

  const A = (window.App = window.App || {});

  /** Определяем язык интерфейса */
  function getUiLang() {
    const s = (A.settings && (A.settings.lang || A.settings.uiLang)) || null;
    const attr = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    const v = (s || attr || "ru").toLowerCase();
    return v === "uk" ? "uk" : "ru";
  }

  /** Тексты условий */
  const TERMS = {
    ru: `
<h2>Условия использования</h2>
<p>Используя приложение MOYAMOVA, вы соглашаетесь с тем, что учебные материалы,
прогресс и сохраняемые данные используются исключительно в личных образовательных целях.</p>

<p>Мы не гарантируем абсолютную точность переводов, примеров и языковых данных,
но постоянно работаем над их улучшением.</p>

<p>Продолжая использование приложения, вы подтверждаете,
что понимаете и принимаете данные условия.</p>
    `,
    uk: `
<h2>Умови використання</h2>
<p>Використовуючи застосунок MOYAMOVA, ви погоджуєтесь, що навчальні матеріали,
прогрес та збережені дані використовуються виключно в особистих освітніх цілях.</p>

<p>Ми не гарантуємо абсолютну точність перекладів, прикладів і мовних даних,
але постійно працюємо над їх покращенням.</p>

<p>Продовжуючи використання застосунку, ви підтверджуєте,
що розумієте та приймаєте ці умови.</p>
    `
  };

  /** Создание модалки (только 1 раз) */
  function ensureModalExists() {
    if (document.getElementById("legalModal")) return;

    const div = document.createElement("div");
    div.id = "legalModal";
    div.className = "legal-modal-overlay";
    div.innerHTML = `
      <div class="legal-modal">
        <button class="legal-modal-close" aria-label="Close"></button>
        <div class="legal-modal-body"></div>
      </div>
    `;
    document.body.appendChild(div);

    // Закрытие по фону
    div.addEventListener("click", (e) => {
      if (e.target === div) closeModal();
    });

    // Закрытие по крестику
    div.querySelector(".legal-modal-close").addEventListener("click", closeModal);
  }

  function openModal() {
    ensureModalExists();
    const modal = document.getElementById("legalModal");
    const body = modal.querySelector(".legal-modal-body");
    body.innerHTML = TERMS[getUiLang()] || TERMS.ru;
    modal.classList.add("is-visible");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    const modal = document.getElementById("legalModal");
    if (!modal) return;
    modal.classList.remove("is-visible");
    document.body.classList.remove("no-scroll");
  }

  /** Делаем ссылкой фразу в мастере */
  function enhanceTermsLink() {
    const root = document.querySelector(".onboarding-step");
    if (!root) return;

    const lang = getUiLang();
    const phrase = lang === "uk" ? "умови використання" : "условия использования";

    const el = root.querySelector(".onboarding-terms-text");
    if (!el) return;

    // Уже заменено → выходим
    if (el.dataset.enhanced) return;

    el.innerHTML = el.textContent.replace(
      phrase,
      `<button type="button" class="legal-inline-link">${phrase}</button>`
    );

    el.dataset.enhanced = "1";

    el.querySelector(".legal-inline-link").addEventListener("click", openModal);
  }

  /** Наблюдатель — перезапуск при показе мастера */
  function setupObserver() {
    const obs = new MutationObserver(() => enhanceTermsLink());
    obs.observe(document.body, { childList: true, subtree: true });
    enhanceTermsLink();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupObserver();
  });
})();
