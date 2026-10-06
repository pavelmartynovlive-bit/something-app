// Любой тап по canvas — прыжок. Жесты и удержание не управляют бегом.
export class TouchControls {
  private jumpPending = false;
  constructor(canvas: HTMLCanvasElement, interact: () => void) {
    canvas.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse') return;
      event.preventDefault();
      interact();
      this.jumpPending = true;
    });
    canvas.addEventListener('pointercancel', () => this.reset());
    canvas.addEventListener('contextmenu', event => event.preventDefault());
    window.addEventListener('blur', () => this.reset());
    window.addEventListener('resize', () => this.reset());
    document.addEventListener('visibilitychange', () => this.reset());
    for (const name of ['gesturestart', 'gesturechange', 'gestureend']) {
      document.addEventListener(name, event => event.preventDefault(), { passive: false });
    }
    canvas.addEventListener('touchmove', event => event.preventDefault(), { passive: false });
  }
  consumeJump() {
    const requested = this.jumpPending;
    this.jumpPending = false;
    return requested;
  }
  reset() { this.jumpPending = false; }
}
