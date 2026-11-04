import * as THREE from 'three';
import { Input } from './Input.js';
import { Save } from './Save.js';
import { Audio } from './Audio.js';
import { Loader } from './Loader.js';
import { Menu } from '../ui/Menu.js';
import { HUD } from '../ui/HUD.js';
import { MobileControls } from '../ui/MobileControls.js';
import { ThirdPersonCam } from '../camera/ThirdPersonCam.js';
import { Player } from '../characters/Player.js';
import { World } from '../world/World.js';

export const STATES = { MENU: 'MENU', JOGANDO: 'JOGANDO', PERGUNTA: 'PERGUNTA', BOSS: 'BOSS', VITORIA: 'VITORIA' };

export class Game {
  constructor() {
    this.state = STATES.MENU;
    this.scene = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.input = new Input();
    this.audio = new Audio();
    this.hud = new HUD(this);
    this.menu = new Menu(this);
    this.mobile = new MobileControls(this.input);
    this.world = null;
    this.player = null;
    this.cam = null;
    this.menuCam = null;
    this.menuBackdrop = null;
    this.fasesData = null;
    this.palavrasData = null;
    this.perguntasData = null;
    this.medalhasData = null;
  }

  async start() {
    this._setLoading(10, 'Carregando dados…');
    this.fasesData     = await Loader.tryJson('data/fases.json', { fases: [] });
    this.palavrasData  = await Loader.tryJson('data/palavras.json', { palavras: [] });
    this.perguntasData = await Loader.tryJson('data/perguntas.json', { perguntas: [] });
    this.medalhasData  = await Loader.tryJson('data/medalhas.json', { medalhas: [] });

    const canvas = document.getElementById('game-canvas');
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa7d3f0);
    this.scene.fog = new THREE.Fog(0xa7d3f0, 70, 220);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this._buildLights();
    this._setLoading(40, 'Preparando a câmera…');

    this.menuCam = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
    this.menuCam.position.set(0, 14, 22);
    this.menuCam.lookAt(0, 3, 0);

    this._setLoading(60, 'Reservando o mundo…');
    this._buildMenuBackdrop();

    this.menu.onStart = (charKey) => this.startGame(charKey);
    this.menu.show();

    window.addEventListener('resize', () => this.onResize());
    this.renderer.setAnimationLoop(() => this.tick());

    this._setLoading(100, 'Pronto!');
    setTimeout(() => document.getElementById('loading')?.classList.add('hidden'), 300);
  }

  _buildLights() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x556635, 0.9);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2c2, 1.15);
    sun.position.set(40, 70, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
    sun.shadow.camera.far = 220;
    this.scene.add(sun);
  }

  _buildMenuBackdrop() {
    const g = new THREE.Group();
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x3e7a2b })
    );
    ground.rotation.x = -Math.PI / 2;
    g.add(ground);
    for (let i = 0; i < 12; i++) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 3.2),
        new THREE.MeshStandardMaterial({ color: 0x5b3a1f })
      );
      const crown = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.6, 0),
        new THREE.MeshStandardMaterial({ color: 0x2e7d32, flatShading: true })
      );
      const angle = (i / 12) * Math.PI * 2;
      const r = 12 + Math.random() * 10;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      trunk.position.set(x, 1.6, z);
      crown.position.set(x, 3.8, z);
      g.add(trunk, crown);
    }
    this.menuBackdrop = g;
    this.scene.add(g);
  }

  startGame(charKey) {
    this.state = STATES.JOGANDO;
    if (this.menuBackdrop) {
      this.scene.remove(this.menuBackdrop);
      this.menuBackdrop = null;
    }
    this.disposeWorld();

    this.world = new World(this.scene);
    this.player = new Player(this.scene, this.world, charKey, this.audio);
    this.cam = new ThirdPersonCam(this.scene, this.world);
    this.cam.setTarget(this.player.object);

    this.menu.hide();
    this.hud.show('Fase 01 — AWATI   |   Objetivo: atravessar o milharal e encontrar o Guardião.');
    this.mobile.show();

    Save.save({
      personagem: charKey,
      faseAtual: 1,
      fases: { 1: { concluida: false } },
      pontos: 0,
      medalhas: [],
      timestamp: Date.now(),
    });
    this.audio.beep(660, 0.12, 0.12);
  }

  disposeWorld() {
    if (this.world?.group) this.scene.remove(this.world.group);
    if (this.player?.object) this.scene.remove(this.player.object);
    this.world = null;
    this.player = null;
    this.cam = null;
  }

  voltarAoMenu() {
    if (document.pointerLockElement) document.exitPointerLock();
    this.disposeWorld();
    this.state = STATES.MENU;
    this.hud.hide();
    this.mobile.hide();
    if (!this.menuBackdrop) this._buildMenuBackdrop();
    this.menu.show();
  }

  tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (this.state === STATES.JOGANDO && this.player && this.cam) {
      this.player.update(dt, this.input);
      this.cam.update(dt, this.input);
      this.hud.update(this.player);
    }
    const cam = this.state === STATES.JOGANDO && this.cam ? this.cam.camera : this.menuCam;
    this.renderer.render(this.scene, cam);
  }

  onResize() {
    if (!this.renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    if (this.menuCam) { this.menuCam.aspect = w / h; this.menuCam.updateProjectionMatrix(); }
    if (this.cam) { this.cam.camera.aspect = w / h; this.cam.camera.updateProjectionMatrix(); }
  }

  _setLoading(pct, msg) {
    const fill = document.getElementById('loading-fill');
    const m = document.getElementById('loading-msg');
    if (fill) fill.style.width = pct + '%';
    if (m && msg) m.textContent = msg;
  }
}
