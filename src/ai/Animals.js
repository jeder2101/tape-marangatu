import * as THREE from 'three';
import { Animal } from './Animal.js';

export class Animals {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.list = [];
  }

  spawn(kind, x, z) {
    const preset = PRESETS[kind];
    if (!preset) return null;
    const a = new Animal(this.scene, this.world, preset);
    a.homeOrigin.set(x, this.world.terrain.heightAt(x, z), z);
    a.object.position.set(x, this.world.terrain.heightAt(x, z), z);
    this.list.push(a);
    return a;
  }

  spawnFase1() {
    this.spawn('cobra', 10, 15);
    this.spawn('cobra', -20, 5);
    this.spawn('aranha', 30, 40);
    this.spawn('morcego', -30, -20);
    this.spawn('abelha', 20, -30);
    this.spawn('onca', 55, 0);
    this.spawn('onca', -50, 55);
  }

  update(dt, player) {
    for (const a of this.list) a.update(dt, player);
    this.list = this.list.filter(a => a.behavior !== 'dead');
  }
}

const PRESETS = {
  cobra:   { kind: 'cobra',   size: 0.5, color: 0x2e5d1a, hp: 20, speed: 3.0, damagePerHit: 8,  detectRadius: 6,  attackRadius: 0.9 },
  onca:    { kind: 'onca',    size: 0.8, color: 0xdab64a, hp: 60, speed: 5.5, damagePerHit: 18, detectRadius: 14, attackRadius: 1.8 },
  aranha:  { kind: 'aranha',  size: 0.6, color: 0x111111, hp: 25, speed: 2.0, damagePerHit: 10, detectRadius: 7,  attackRadius: 1.1 },
  morcego: { kind: 'morcego', size: 0.4, color: 0x220022, hp: 15, speed: 4.0, damagePerHit: 6,  detectRadius: 10, attackRadius: 1.0 },
  abelha:  { kind: 'abelha',  size: 0.3, color: 0xffe14d, hp: 10, speed: 3.5, damagePerHit: 5,  detectRadius: 5,  attackRadius: 0.8 },
};
