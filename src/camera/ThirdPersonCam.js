import * as THREE from 'three';
import { buildCharacter, PALETTES } from './CharacterModel.js';

const WORLD_LIMIT = 92;

export class Player {
  constructor(scene, world, characterKey, audio) {
    this.scene = scene;
    this.world = world;
    this.audio = audio;

    this.object = buildCharacter(PALETTES[characterKey] || PALETTES.konomi);
    this.object.position.set(0, world.terrain.heightAt(0, 0), 20);
    scene.add(this.object);

    this.velocity = new THREE.Vector3();
    this.onGround = true;
    this.walkPhase = 0;
    this.speedWalk = 4.2;
    this.speedRun = 8.2;
    this.jumpSpeed = 8.2;
    this.gravity = -24;
    this.yaw = 0;

    this.vida = 100;
    this.energia = 100;
    this.flechas = 10;
    this.pontos = 0;
  }

  update(dt, input) {
    const move = input.getMoveVector();
    const running = input.isRunning();
    const speed = running ? this.speedRun : this.speedWalk;
    const yaw = input.cameraYaw || 0;

    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

    const dir = new THREE.Vector3()
      .addScaledVector(forward, -move.z)
      .addScaledVector(right, move.x);
    if (dir.lengthSq() > 0) dir.normalize();

    this.object.position.x += dir.x * speed * dt;
    this.object.position.z += dir.z * speed * dt;
    this.object.position.x = Math.max(-WORLD_LIMIT, Math.min(WORLD_LIMIT, this.object.position.x));
    this.object.position.z = Math.max(-WORLD_LIMIT, Math.min(WORLD_LIMIT, this.object.position.z));

    this._resolveCollisions();

    if (input.consumeJump() && this.onGround) {
      this.velocity.y = this.jumpSpeed;
      this.onGround = false;
      this.audio.beep(340, 0.08, 0.1);
    }
    this.velocity.y += this.gravity * dt;
    this.object.position.y += this.velocity.y * dt;

    const groundY = this.world.terrain.heightAt(this.object.position.x, this.object.position.z);
    if (this.object.position.y <= groundY) {
      this.object.position.y = groundY;
      this.velocity.y = 0;
      this.onGround = true;
    }

    if (dir.lengthSq() > 0) this.yaw = Math.atan2(dir.x, dir.z);
    this.object.rotation.y = this.yaw;

    const moving = dir.lengthSq() > 0;
    this.walkPhase += dt * (running ? 14 : 8) * (moving ? 1 : 0);
    const swing = Math.sin(this.walkPhase) * (moving ? 0.55 : 0);
    const armL = this.object.getObjectByName('armL');
    const armR = this.object.getObjectByName('armR');
    const legL = this.object.getObjectByName('legL');
    const legR = this.object.getObjectByName('legR');
    if (armL) armL.rotation.x = swing;
    if (armR) armR.rotation.x = -swing;
    if (legL) legL.rotation.x = -swing;
    if (legR) legR.rotation.x = swing;

    this.energia = Math.max(0, Math.min(100, this.energia + (moving ? (running ? -6 : 1) : 4) * dt));
  }

  _resolveCollisions() {
    const r = 0.35;
    for (const box of this.world.colliders) {
      const dx = this.object.position.x - box.cx;
      const dz = this.object.position.z - box.cz;
      const px = box.hx + r - Math.abs(dx);
      const pz = box.hz + r - Math.abs(dz);
      if (px > 0 && pz > 0) {
        if (px < pz) this.object.position.x += Math.sign(dx || 1) * px;
        else this.object.position.z += Math.sign(dz || 1) * pz;
      }
    }
  }
}
