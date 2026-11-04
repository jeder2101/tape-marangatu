export class HUD {
  constructor(game) {
    this.game = game;
    this.el = document.getElementById('hud');
    this.vidaFill = document.getElementById('hud-vida-fill');
    this.energiaFill = document.getElementById('hud-energia-fill');
    this.flechasEl = document.getElementById('hud-flechas');
    this.pontosEl = document.getElementById('hud-pontos');
    this.objectiveEl = document.getElementById('hud-objective');

    document.getElementById('btn-menu').addEventListener('click', () => this.game.voltarAoMenu());
  }

  show(objective) { this.el.classList.add('visible'); this.setObjective(objective); }
  hide() { this.el.classList.remove('visible'); }
  setObjective(msg) { this.objectiveEl.textContent = msg || ''; }

  update(player) {
    this.vidaFill.style.width = Math.max(0, Math.min(100, player.vida)) + '%';
    this.energiaFill.style.width = Math.max(0, Math.min(100, player.energia)) + '%';
    this.flechasEl.textContent = String(player.flechas);
    this.pontosEl.textContent = String(player.pontos);
  }
}
