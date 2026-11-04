import { Game } from './core/Game.js';

async function boot() {
  try {
    const game = new Game();
    await game.start();
  } catch (err) {
    console.error(err);
    const msg = document.getElementById('loading-msg');
    if (msg) msg.textContent = 'Falha ao iniciar: ' + err.message;
  }
}

boot();
