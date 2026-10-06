import { settings } from './settings';

// У каждого пальца свой id: отпускание правого не сбрасывает стик.
export class TouchControls {
  axis = 0;
  private moveId: number | null = null;
  private originX = 0;
  private originY = 0;
  private jumpPending = false;
  private stick = document.querySelector<HTMLElement>('#stick')!;
  private knob = document.querySelector<HTMLElement>('#stick-knob')!;

  constructor(canvas: HTMLCanvasElement, interact: () => void) {
    canvas.addEventListener('pointerdown', event => {
      event.preventDefault();
      interact();
      canvas.setPointerCapture(event.pointerId);
      const x = event.clientX / window.innerWidth;
      if (x <= settings.leftTouchZone && this.moveId === null) {
        this.moveId = event.pointerId;
        this.originX = event.clientX;
        this.originY = event.clientY;
        this.stick.hidden = false;
        this.stick.style.left = `${this.originX - 52}px`;
        this.stick.style.top = `${this.originY - 52}px`;
        this.move(event);
      } else if (x >= 1 - settings.rightTouchZone) this.jumpPending = true;
    });
    canvas.addEventListener('pointermove', event => { event.preventDefault(); this.move(event); });
    const release = (event: PointerEvent) => {
      if (event.pointerId === this.moveId) this.clearMovement();
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('lostpointercapture', release);
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
  reset() { this.clearMovement(); this.jumpPending = false; }
  private clearMovement() {
    this.moveId = null;
    this.axis = 0;
    this.stick.hidden = true;
    this.knob.style.transform = '';
  }
  private move(event: PointerEvent) {
    if (event.pointerId !== this.moveId) return;
    const dx = event.clientX - this.originX;
    const dy = event.clientY - this.originY;
    this.axis = Math.abs(dx) < settings.stickDeadZone ? 0 : Math.max(-1, Math.min(1, dx / settings.stickSensitivity));
    this.knob.style.transform = `translate(${Math.max(-34, Math.min(34, dx))}px, ${Math.max(-24, Math.min(24, dy))}px)`;
  }
}
