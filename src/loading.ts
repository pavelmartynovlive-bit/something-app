import type Phaser from 'phaser';

const screen = document.querySelector<HTMLElement>('#loading')!;
const title = document.querySelector<HTMLElement>('#loading-title')!;
const detail = document.querySelector<HTMLElement>('#loading-detail')!;
const retry = document.querySelector<HTMLButtonElement>('#loading-retry')!;
let failed = false;

function progressChanged(progress: number) {
  if (!failed) detail.textContent = `${Math.round(progress * 100)}% — загружаем зимний двор`;
}
function assetFailed(file: Phaser.Loader.File) {
  failed = true;
  title.textContent = 'Не удалось загрузить игру';
  const name = file?.src?.split('/').pop()?.split('?')[0];
  detail.textContent = `Не загрузился ресурс${name ? ` ${name}` : ''}. Проверь интернет и попробуй ещё раз.`;
  retry.hidden = false;
}
export function trackLoading(loader: Phaser.Loader.LoaderPlugin) {
  loader.off('progress', progressChanged).on('progress', progressChanged);
  loader.off('loaderror', assetFailed).on('loaderror', assetFailed);
}

export function loadingFailed() { return failed; }
export function gameReady() {
  screen.hidden = true;
  // The hint's lifetime starts with the playable scene, not the asset download.
  document.dispatchEvent(new Event('game:ready'));
}

// Chrome on iPhone also uses WebKit. Canvas avoids depending on a mobile GPU
// context while leaving all Arcade bodies, timings and controls unchanged.
export const useCanvasRenderer = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
