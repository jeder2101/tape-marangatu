export class MobileControls {
  constructor(input) {
    this.input = input;
    this.el = document.getElementById('mobile');
    this.joy = document.getElementById('mobile-joy');
    this.nub = document.getElementById('mobile-joy-nub');
    this._activeJoyId = null;
    this._joyCenter = { x: 0, y: 0 };
    this._joyRadius = 55;

    this.joy.addEventListener('touchstart', (e) => this._joyStart(e), { passive: false });
    this.joy.addEventListener('touchmove', (e) => this._joyMove(e), { passive: false });
    this.joy.addEventListener('touchend', (e) => this._joyEnd(e), { passive: false });
    this.joy.addEventListener('touchcancel', (e) => this._joyEnd(e), { passive: false });

    const jumpBtn = document.getElementById('mobile-jump');
    jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.input.queueJump(); }, { passive: false });
  }

  _joyStart(e) {
    e.preventDefault();
    const rect = this.joy.getBoundingClientRect();
    this._joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const t = e.changedTouches[0];
    this._activeJoyId = t.identifier;
    this._updateJoy(t.clientX, t.clientY);
  }

  _joyMove(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === this._activeJoyId) this._updateJoy(t.clientX, t.clientY);
    }
  }

  _joyEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === this._activeJoyId) {
        this._activeJoyId = null;
        this.input.joystick.x = 0;
        this.input.joystick.z = 0;
        this.nub.style.transform = 'translate(0, 0)';
      }
    }
  }

  _updateJoy(x, y) {
    const dx = x - this._joyCenter.x;
    const dy = y - this._joyCenter.y;
    const len = Math.hypot(dx, dy);
    const clamped = Math.min(len, this._joyRadius);
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle) * clamped;
    const ny = Math.sin(angle) * clamped;
    this.nub.style.transform = `translate(${nx}px, ${ny}px)`;
    this.input.joystick.x = nx / this._joyRadius;
    this.input.joystick.z = ny / this._joyRadius;
  }

  show() { this.el.classList.add('visible'); }
  hide() { this.el.classList.remove('visible'); }
}
