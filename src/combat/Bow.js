import * as THREE from 'three';
import { Arrow } from './Arrow.js';

export class Bow {
  constructor(scene, world, player, audio) {
    this.scene = scene;
    this.world = world;
    this.player = player;
    this.audio = audio;
    this.arrows = [];
    this.aiming = false;
    this.cooldown = 0;
    this.rechargeTimer = 0;
  }

  update(dt, input) {
    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.player.flechas < 10 && this.player.energia > 20) {
      this.rechargeTimer += dt;
      if (this.rechargeTimer >= 2.0) {
        this.player.flechas = Math.min(10, this.player.flechas + 1);
        this.rechargeTimer = 0;
      }
    } else {
      this.rechargeTimer = 0;
    }

    if (input.keys.has('KeyR') && this.cooldown === 0) {
      this.player.flechas = 10;
      this.cooldown = 1.2;
      this.audio.beep(520, 0.08, 0.08);
    }

    this.aiming = input.mouseButtons && input.mouseButtons.has(2);
    if (this.aiming) {
      const rate = 0.0032;
      const dir = this._directionFromPlayer();
      this._aimIndicator(dir);
    }

    const firePressed = input.mouseButtons && input.mouseButtons.has(0) && input.consumeClick();
    if (firePressed && this.cooldown === 0 && this.player.flechas > 0) this.fire();

    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];
      a.update(dt);
      if (!a.isAlive()) {
        a.dispose();
        this.arrows.splice(i, 1);
      }
    }
  }

  _directionFromPlayer() {
    const yaw = this.player.yaw;
    return new THREE.Vector3(Math.sin(yaw), 0.05, Math.cos(yaw)).normalize();
  }

  _aimIndicator(dir) {
    if (!this._indicator) {
      const geo = new THREE.ConeGeometry(0.06, 0.4, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffdf6e });
      this._indicator = new THREE.Mesh(geo, mat);
      this.scene.add(this._indicator);
    }
    const p = this.player.object.position;
    this._indicator.position.set(
      p.x + dir.x * 6,
      p.y + 1.3 + dir.y * 6,
      p.z + dir.z * 6
    );
    this._indicator.lookAt(p.x + dir.x * 10, p.y + 1.3, p.z + dir.z * 10);
    this._indicator.visible = this.aiming;
  }

  fire() {
    this.player.flechas--;
    this.cooldown = 0.35;
    this.audio.beep(880, 0.05, 0.1);
    const p = this.player.object.position;
    const origin = new THREE.Vector3(p.x, p.y + 1.4, p.z);
    const dir = this._directionFromPlayer();
    this.arrows.push(new Arrow(this.scene, this.world, origin, dir));
  }

  dispose() {
    for (const a of this.arrows) a.dispose();
    this.arrows = [];
    if (this._indicator) this.scene.remove(this._indicator);
  }
}
