// Etapa 2: animações completas (mirar, disparar, esquiva, comemorar).
// Etapa 1 usa animação procedural simples dentro de Player.js (swing de braços/pernas).
export class Animator {
  constructor() { this.phase = 0; }
  update(dt, moving, running) {
    this.phase += dt * (running ? 14 : 8) * (moving ? 1 : 0);
    return Math.sin(this.phase) * (moving ? 0.55 : 0);
  }
}
