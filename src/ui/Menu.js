import { Save } from '../core/Save.js';

export class Menu {
  constructor(game) {
    this.game = game;
    this.el = document.getElementById('menu');
    this.mainPanel = document.getElementById('menu-main');
    this.charPanel = document.getElementById('menu-personagens');
    this.toastEl = document.getElementById('menu-toast');
    this.onStart = null;
    this._toastTimer = null;

    document.getElementById('btn-jogar').addEventListener('click', () => this._openCharSelect());
    document.getElementById('btn-konomi').addEventListener('click', () => this._start('konomi'));
    document.getElementById('btn-kunhatai').addEventListener('click', () => this._start('kunhatai'));
    document.getElementById('btn-voltar-personagens').addEventListener('click', () => this._backToMain());

    document.getElementById('btn-continuar').addEventListener('click', () => {
      const data = Save.load();
      if (!data || !data.personagem) { this._toast('Nenhum progresso salvo. Comece um novo jogo.'); return; }
      this._start(data.personagem);
    });

    document.getElementById('btn-mapa').addEventListener('click', () =>
      this._toast('O mapa dos 21 caminhos será liberado a partir da Etapa 5 (Expansão).'));
    document.getElementById('btn-medalhas').addEventListener('click', () =>
      this._toast('A galeria de medalhas será entregue na Etapa 3 (Fase AWATI).'));
    document.getElementById('btn-config').addEventListener('click', () =>
      this._toast('Configurações de áudio e idioma virão na Etapa 2 (Aventura).'));
  }

  _openCharSelect() { this.mainPanel.classList.add('hidden'); this.charPanel.classList.remove('hidden'); }
  _backToMain() { this.charPanel.classList.add('hidden'); this.mainPanel.classList.remove('hidden'); }
  _start(charKey) { this.hide(); if (this.onStart) this.onStart(charKey); }
  show() { this.el.style.display = 'flex'; this._backToMain(); }
  hide() { this.el.style.display = 'none'; }

  _toast(msg) {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toastEl.classList.remove('visible'), 3200);
  }
}
