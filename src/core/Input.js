export class Input {
  constructor() {
    this.keys = new Set();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.mouseButtons = new Set();
    this._clickQueued = false;
    this.cameraYaw = 0;
    this.joystick = { x: 0, z: 0 };
    this.pointers = new Map();
    this._jumpQueued = false;

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (!this.keys.has('Space')) this._jumpQueued = true;
        e.preventDefault();
      }
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));

    const canvas = document.getElementById('game-canvas');

    canvas.addEventListener('mousedown', (e) => {
      this.mouseButtons.add(e.button);
      if (e.button === 0) {
        this._clickQueued = true;
        if (canvas.requestPointerLock) canvas.requestPointerLock();
      }
    });
    window.addEventListener('mouseup', (e) => this.mouseButtons.delete(e.button));
    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === canvas) {
        this.mouseDX += e.movementX;
        this.mouseDY += e.movementY;
      }
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('touchstart', (e) => {
      for (const t of e.changedTouches) this.pointers.set(t.identifier, { x: t.clientX, y: t.clientY });
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        const p = this.pointers.get(t.identifier);
        if (p && typeof p === 'object') {
          this.mouseDX += (t.clientX - p.x) * 1.5;
          this.mouseDY += (t.clientY - p.y) * 1.5;
          p.x = t.clientX;
          p.y = t.clientY;
        }
      }
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      for (const t of e.changedTouches) this.pointers.delete(t.identifier);
    }, { passive: true });
  }

  getMoveVector() {
    let x = 0, z = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) z -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) z += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    x += this.joystick.x;
    z += this.joystick.z;
    const len = Math.hypot(x, z);
    if (len > 1) { x /= len; z /= len; }
    return { x, z };
  }

  isRunning() {
    return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  consumeJump() {
    const v = this._jumpQueued;
    this._jumpQueued = false;
    return v;
  }

  queueJump() {
    this._jumpQueued = true;
  }

  consumeClick() {
    const v = this._clickQueued;
    this._clickQueued = false;
    return v;
  }
}
