/// <reference types="vite/client" />

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const button = document.querySelector<HTMLButtonElement>('#install')!;
const dialog = document.querySelector<HTMLDialogElement>('#install-dialog')!;
const instructions = document.querySelector<HTMLElement>('#install-instructions')!;
const status = document.querySelector<HTMLElement>('#offline-status')!;
const standalone = window.matchMedia('(display-mode: standalone)');
const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let prompt: InstallPrompt | null = null;

function updateButton() {
  button.hidden = standalone.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}
updateButton();
standalone.addEventListener('change', updateButton);
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  prompt = event as InstallPrompt;
});
window.addEventListener('appinstalled', () => { prompt = null; button.hidden = true; });
button.addEventListener('click', async () => {
  if (prompt) {
    const request = prompt;
    prompt = null;
    await request.prompt();
    const result = await request.userChoice;
    if (result.outcome === 'accepted') button.hidden = true;
    return;
  }
  instructions.textContent = ios
    ? 'Открой ссылку в Safari. Нажми «Поделиться» → «На экран Домой» → «Добавить». Затем запускай игру с появившейся иконки.'
    : 'Открой ссылку в Chrome. В меню ⋮ выбери «Установить приложение» или «Добавить на главный экран». Если пункта нет, дождись загрузки и попробуй ещё раз. Во встроенном браузере мессенджера сначала выбери «Открыть в браузере».';
  dialog.showModal();
});
document.querySelector('#install-close')!.addEventListener('click', () => dialog.close());

// В режиме разработки worker не регистрируется, чтобы не кешировать исходники Vite.
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext) {
  status.textContent = 'Готовим игру для запуска без интернета…';
  window.addEventListener('load', async () => {
    try {
      const base = new URL(import.meta.env.BASE_URL, document.baseURI);
      await navigator.serviceWorker.register(new URL('sw.js', base), { scope: base.pathname });
      await navigator.serviceWorker.ready;
      status.textContent = 'Игра сохранена. После установки её можно открывать без интернета.';
    } catch {
      status.textContent = 'Офлайн-режим не загрузился. Проверь интернет и открой игру ещё раз.';
    }
  });
} else if (import.meta.env.DEV) {
  status.textContent = 'Для установки открой опубликованную HTTPS-ссылку на игру.';
}
