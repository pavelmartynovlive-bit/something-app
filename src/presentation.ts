// Presentation only. No world data, actor sizes, physics or gameplay clocks.
export type Presentation = 'a' | 'b' | 'c';
const requested = new URLSearchParams(location.search).get('view')?.toLowerCase();
export const presentation: Presentation = requested === 'a' || requested === 'b' ? requested : 'c';
document.body.dataset.view = presentation;

if (presentation === 'c') {
  document.querySelector<HTMLLinkElement>('link[rel="manifest"]')!.href =
    new URL('manifest-portrait.webmanifest', document.baseURI).href;
  document.querySelector('#portrait')!.innerHTML = '<span>↻</span>Вариант C — вертикально<small>Поверни телефон</small>';
}

export function cameraFrame(width: number, height: number, baselineHeight: number, floor: number) {
  if (presentation === 'a') {
    return { zoom: height / baselineHeight, baseY: 0, anchorX: .35, followX: 5 };
  }
  if (presentation === 'b') {
    const zoom = height / baselineHeight * 1.4;
    // A leftward anchor recovers most baseline look-ahead despite the closer crop.
    return { zoom, baseY: floor - height / zoom * .84, anchorX: .12, followX: 5 };
  }
  const zoom = width / 340;
  const worldHeight = height / zoom;
  // The current solid terrain ends at y=660. Keep its lower edge outside the
  // frame without extending or otherwise changing any world geometry.
  return { zoom, baseY: Math.min(floor - worldHeight * .70, 660 - worldHeight), anchorX: .05, followX: 12 };
}
