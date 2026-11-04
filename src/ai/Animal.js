import * as THREE from 'three';
import { BEHAVIOR, distanceXZ } from './Behaviors.js';

export class Animal {
  constructor(scene, world, config) {
    this.scene = scene;
    this.world = world;
    this.config = Object.assign({
      kind: 'generic',
      speed: 2.5,
      detectRadius: 8,
      attackRadius: 1.4,
      damagePerHit: 12,
      hp: 30,
      color: 0x884400,
      size: 0.5,
      patrolRadius: 6,
    }, config);

    this.hp = this.config.hp;
    this.behavior = BEHAVIOR.PATROL;
    this.homeOrigin = new THREE.Vector3();
    this.target = null;
    this.cooldown = 0;
    this.patrolAngle = Math.random() * Math.PI * 2;

    this._build();
  }

  _build() {
    const g = new THREE.Group();
    const c = this.config.color;
    const s = this.config.size;
    const main = new THREE.Mesh(
      new THREE.BoxGeometry(s, s * 0.7, s * 1.4),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })
    );
    main.castShadow = true;
    main.position.y = s * 0.5;
    g.add(main);

    if (this.config.kind === 'cobra') {
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(s * 0.7, s * 0.5, s * 0.7),
        new THREE.MeshStandardMaterial({ color: 0x2e5d1a })
      );
      head.position.set(0, s * 0.6, s * 0.9);
      g.add(head);
    } else if (this.config.kind === 'onca') {
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(s * 1.1, s * 0.9, s * 0.9),
        new THREE.MeshStandardMaterial({ color: 0xdab64a })
      );
      head.position.set(0, s * 1.1, s * 1.0);
      g.add(head);
      const spots = new THREE.MeshStandardMaterial({ color: 0x3b2a12 });
      for (let i = 0; i < 4; i++) {
        const spot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), spots);
        spot.position.set((Math.random() - 0.5) * s * 0.6, s * 0.9, (Math.random() - 0.5) * s * 1.2);
        g.add(spot);
      }
    } else if (this.config.kind === 'aranha') {
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(s * 0.6, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      body.position.y = s * 0.5;
      g.add(body);
    } else if (this.config.kind === 'morcego') {
      g.position.y = s * 2;
    } else if (this.config.kind === 'abelha') {
      const leg = new THREE.MeshStandardMaterial({ color: 0xffe14d });
      const b = new THREE.Mesh(new THREE.SphereGeometry(s * 0.4, 8, 6), leg);
      b.position.y = s * 0.5;
      g.add(b);
    }

    this.group = g;
    this.object = g;
    this.hpBar = this._makeHpBar();
    g.add(this.hpBar);
    this.scene.add(g);
  }

  _makeHpBar() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 8;
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: tex, depthTest: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.12), mat);
    m.position.y = this.config.size * 1.8;
    this.position0 = m.position.y;
    this._texture = tex;
    this._drawHpBar();
    return m;
  }

  _drawHpBar() {
    const ctx = this._ctx;
    const w = this._canvas.width;
    const h = this._canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#440000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff4040';
    ctx.fillRect(0, 0, w * (this.hp / this.config.hp), h);
    this._texture.needsUpdate = true;
  }

  update(dt, player) {
    if (this.behavior === BEHAVIOR.DEAD) return;
    this.cooldown = Math.max(0, this.cooldown - dt);

    if (!this.homeOrigin.lengthSq()) this.homeOrigin.copy(this.object.position);

    const dist = distanceXZ(this.object.position, player.object.position);

    if (dist < this.config.detectRadius && this.behavior !== BEHAVIOR.ATTACK) {
      this.behavior = BEHAVIOR.CHASE;
    } else if (dist > this.config.detectRadius * 1.4 && this.behavior === BEHAVIOR.CHASE) {
      this.behavior = BEHAVIOR.PATROL;
    }

    if (this.behavior === BEHAVIOR.PATROL) {
      this.patrolAngle += dt * 0.6;
      const dx = Math.cos(this.patrolAngle) * this.config.patrolRadius * 0.15;
      const dz = Math.sin(this.patrolAngle) * this.config.patrolRadius * 0.15;
      const nx = this.object.position.x + dx;
      const nz = this.object.position.z + dz;
      const ny = this.world.terrain.heightAt(nx, nz);
      this.object.position.set(nx, ny, nz);
      this.object.rotation.y = this.patrolAngle;
    } else if (this.behavior === BEHAVIOR.CHASE) {
      const dx = player.object.position.x - this.object.position.x;
      const dz = player.object.position.z - this.object.position.z;
      const len = Math.hypot(dx, dz) || 1;
      const stepX = (dx / len) * this.config.speed * dt;
      const stepZ = (dz / len) * this.config.speed * dt;
      const nx = this.object.position.x + stepX;
      const nz = this.object.position.z + stepZ;
      const ny = this.world.terrain.heightAt(nx, nz);
      this.object.position.set(nx, ny, nz);
      this.object.rotation.y = Math.atan2(dx, dz);

      if (dist < this.config.attackRadius && this.cooldown === 0) {
        player.takeDamage(this.config.damagePerHit);
        this.cooldown = 1.2;
        this.behavior = BEHAVIOR.ATTACK;
      }
    } else if (this.behavior === BEHAVIOR.ATTACK) {
      if (dist > this.config.attackRadius * 1.2) this.behavior = BEHAVIOR.CHASE;
    }

    const baseY = this.world.terrain.heightAt(this.object.position.x, this.object.position.z);
    if (this.config.kind === 'morcego') {
      this.object.position.y = baseY + 2 + Math.sin(performance.now() * 0.003) * 0.3;
    } else {
      this.object.position.y = baseY;
    }

    this.hpBar.position.y = this.config.size * 1.8;
    this.hpBar.lookAt(player.object.position.x, this.hpBar.getWorldPosition(new THREE.Vector3()).y, player.object.position.z);
  }

  takeDamage(amount) {
    this.hp -= amount;
    this._drawHpBar();
    if (this.hp <= 0) {
      this.hp = 0;
      this.behavior = BEHAVIOR.DEAD;
      this.hpBar.visible = false;
      setTimeout(() => this.dispose(), 800);
    }
  }

  dispose() {
    this.scene.remove(this.group);
  }
}
