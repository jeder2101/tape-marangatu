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
    this.walkPhase = 0;
    this.legRoots = [];
    this.wingRoots = [];
    this.bodySegments = [];
    this.tail = null;

    this._build();
  }

  _build() {
    const g = new THREE.Group();
    const s = this.config.size;
    const c = this.config.color;

    if (this.config.kind === 'cobra') this._buildCobra(g, s, c);
    else if (this.config.kind === 'onca') this._buildOnca(g, s, c);
    else if (this.config.kind === 'aranha') this._buildAranha(g, s, c);
    else if (this.config.kind === 'morcego') this._buildMorcego(g, s, c);
    else if (this.config.kind === 'abelha') this._buildAbelha(g, s, c);
    else this._buildGeneric(g, s, c);

    this.group = g;
    this.object = g;
    this.hpBar = this._makeHpBar();
    g.add(this.hpBar);
    this.scene.add(g);
  }

  _buildCobra(g, s, c) {
    const matBody = new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 });
    const matHead = new THREE.MeshStandardMaterial({ color: 0x2e5d1a, roughness: 0.6 });

    const segCount = 5;
    let prev = g;
    const offsets = [-0.18, -0.09, 0, 0.09, 0.18];
    for (let i = 0; i < segCount; i++) {
      const seg = new THREE.Mesh(
        new THREE.BoxGeometry(s * (0.9 - i * 0.08), s * 0.45, s * 0.55),
        matBody
      );
      seg.castShadow = true;
      seg.position.set(0, s * 0.25, s * 0.55 + i * s * 0.5);
      prev.add(seg);
      this.bodySegments.push({ mesh: seg, baseZ: seg.position.z, phase: i * 0.6 });
      prev = seg;
    }
    const head = new THREE.Mesh(new THREE.BoxGeometry(s * 0.85, s * 0.5, s * 0.7), matHead);
    head.position.set(0, s * 0.28, s * 0.75 + segCount * s * 0.5);
    head.castShadow = true;
    g.add(head);
  }

  _buildOnca(g, s, c) {
    const matBody = new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 });
    const matSpot = new THREE.MeshStandardMaterial({ color: 0x3b2a12, roughness: 0.9 });
    const matDark = new THREE.MeshStandardMaterial({ color: 0x2a1e12, roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(s * 1.15, s * 0.7, s * 1.9), matBody);
    body.position.y = s * 0.75;
    body.castShadow = true;
    g.add(body);

    for (let i = 0; i < 9; i++) {
      const spot = new THREE.Mesh(new THREE.BoxGeometry(s * 0.12, s * 0.12, s * 0.12), matSpot);
      spot.position.set(
        (Math.random() - 0.5) * s * 0.9,
        s * 0.75 + (Math.random() - 0.5) * s * 0.5,
        (Math.random() - 0.5) * s * 1.7
      );
      g.add(spot);
    }

    const head = new THREE.Mesh(new THREE.BoxGeometry(s * 0.85, s * 0.7, s * 0.85), matBody);
    head.position.set(0, s * 0.95, s * 1.05);
    head.castShadow = true;
    g.add(head);

    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(s * 0.5, s * 0.35, s * 0.35), matBody);
    muzzle.position.set(0, s * 0.82, s * 1.5);
    g.add(muzzle);

    const earL = new THREE.Mesh(new THREE.BoxGeometry(s * 0.22, s * 0.22, s * 0.18), matBody);
    earL.position.set(-s * 0.28, s * 1.4, s * 1.0);
    g.add(earL);
    const earR = earL.clone();
    earR.position.x = s * 0.28;
    g.add(earR);

    const legGeo = new THREE.BoxGeometry(s * 0.2, s * 0.65, s * 0.22);
    const legPos = [
      [-s * 0.35, s * 0.35, s * 0.7],
      [ s * 0.35, s * 0.35, s * 0.7],
      [-s * 0.35, s * 0.35, -s * 0.7],
      [ s * 0.35, s * 0.35, -s * 0.7],
    ];
    for (const [x, y, z] of legPos) {
      const pivot = new THREE.Group();
      pivot.position.set(x, y + s * 0.325, z);
      const leg = new THREE.Mesh(legGeo, matBody);
      leg.position.y = -s * 0.325;
      leg.castShadow = true;
      pivot.add(leg);
      g.add(pivot);
      this.legRoots.push(pivot);
    }

    const tailMat = matBody;
    const tail = new THREE.Mesh(new THREE.BoxGeometry(s * 0.14, s * 0.14, s * 0.9), tailMat);
    tail.position.set(0, s * 0.95, -s * 1.35);
    tail.castShadow = true;
    g.add(tail);
    this.tail = tail;
  }

  _buildAranha(g, s, c) {
    const matBody = new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
    const matEye = new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0x440000 });

    const abdomen = new THREE.Mesh(new THREE.SphereGeometry(s * 0.65, 10, 8), matBody);
    abdomen.position.set(0, s * 0.65, -s * 0.2);
    abdomen.castShadow = true;
    g.add(abdomen);

    const cephalo = new THREE.Mesh(new THREE.SphereGeometry(s * 0.42, 10, 8), matBody);
    cephalo.position.set(0, s * 0.65, s * 0.4);
    cephalo.castShadow = true;
    g.add(cephalo);

    for (const dx of [-s * 0.15, s * 0.05]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(s * 0.07, 6, 4), matEye);
      eye.position.set(dx, s * 0.85, s * 0.65);
      g.add(eye);
    }

    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? -1 : 1;
      const idx = i % 4;
      const pivot = new THREE.Group();
      pivot.position.set(side * s * 0.35, s * 0.6, (idx - 1.5) * s * 0.3);
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(s * 0.6, s * 0.1, s * 0.1),
        matBody
      );
      leg.position.x = side * s * 0.3;
      leg.castShadow = true;
      pivot.add(leg);
      g.add(pivot);
      this.legRoots.push(pivot);
    }
  }

  _buildMorcego(g, s, c) {
    const matBody = new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
    const matWing = new THREE.MeshStandardMaterial({ color: 0x1a0a1a, side: THREE.DoubleSide });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(s * 0.28, s * 0.5, 4, 8), matBody);
    body.position.y = s * 1.2;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(s * 0.35, 8, 6), matBody);
    head.position.set(0, s * 1.85, s * 0.15);
    g.add(head);

    const earGeo = new THREE.ConeGeometry(s * 0.15, s * 0.35, 4);
    for (const dx of [-s * 0.2, s * 0.2]) {
      const ear = new THREE.Mesh(earGeo, matBody);
      ear.position.set(dx, s * 2.15, s * 0.05);
      g.add(ear);
    }

    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * s * 0.2, s * 1.4, 0);
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.8, s * 0.9), matWing);
      wing.rotation.z = Math.PI / 2;
      wing.position.set(side * s * 0.9, 0, 0);
      wing.castShadow = true;
      pivot.add(wing);
      g.add(pivot);
      this.wingRoots.push(pivot);
    }
  }

  _buildAbelha(g, s, c) {
    const matYellow = new THREE.MeshStandardMaterial({ color: 0xffe14d, roughness: 0.7 });
    const matBlack = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.8 });
    const matWing = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });

    const body = new THREE.Mesh(new THREE.SphereGeometry(s * 0.55, 10, 8), matYellow);
    body.scale.set(1.4, 0.85, 1.0);
    body.position.y = s * 0.9;
    body.castShadow = true;
    g.add(body);

    for (const dz of [-s * 0.25, s * 0.2]) {
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.05, s * 0.05, s * 1.1, 6), matBlack);
      stripe.rotation.z = Math.PI / 2;
      stripe.rotation.y = Math.PI / 2;
      stripe.scale.set(0.55 / 1.1, 1, 0.55 / 0.05);
      stripe.position.set(0, s * 0.9, dz);
      g.add(stripe);
    }

    const stinger = new THREE.Mesh(new THREE.ConeGeometry(s * 0.1, s * 0.3, 5), matBlack);
    stinger.position.set(0, s * 0.9, -s * 0.8);
    stinger.rotation.x = Math.PI / 2;
    g.add(stinger);

    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * s * 0.15, s * 1.25, 0);
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(s * 0.9, s * 0.55), matWing);
      wing.rotation.x = -Math.PI / 2;
      wing.position.set(side * s * 0.55, 0, 0);
      pivot.add(wing);
      g.add(pivot);
      this.wingRoots.push(pivot);
    }
  }

  _buildGeneric(g, s, c) {
    const mat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.7, s * 1.4), mat);
    body.position.y = s * 0.35;
    body.castShadow = true;
    g.add(body);
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
    m.position.y = this.config.size * 2.2;
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

    let moving = false;
    if (this.behavior === BEHAVIOR.PATROL) {
      this.patrolAngle += dt * 0.6;
      const dx = Math.cos(this.patrolAngle) * this.config.patrolRadius * 0.15;
      const dz = Math.sin(this.patrolAngle) * this.config.patrolRadius * 0.15;
      const nx = this.object.position.x + dx;
      const nz = this.object.position.z + dz;
      const ny = this.world.terrain.heightAt(nx, nz);
      this.object.position.set(nx, ny, nz);
      this.object.rotation.y = this.patrolAngle;
      moving = true;
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
      moving = true;

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
      const wingAngle = Math.sin(performance.now() * 0.02) * 0.7;
      for (const w of this.wingRoots) w.rotation.y = wingAngle;
    } else if (this.config.kind === 'abelha') {
      this.object.position.y = baseY + 1.4 + Math.sin(performance.now() * 0.006) * 0.15;
      const wingAngle = Math.sin(performance.now() * 0.06) * 0.8;
      for (const w of this.wingRoots) w.rotation.y = wingAngle;
    } else {
      this.object.position.y = baseY;
    }

    if (moving) this.walkPhase += dt * 6;

    if (this.config.kind === 'cobra') {
      for (const seg of this.bodySegments) {
        seg.mesh.rotation.y = Math.sin(this.walkPhase * 1.2 + seg.phase) * 0.35;
        seg.mesh.position.x = Math.sin(this.walkPhase * 1.2 + seg.phase) * this.config.size * 0.15;
      }
    } else if (this.config.kind === 'onca') {
      const swing = Math.sin(this.walkPhase * 2) * 0.6;
      for (let i = 0; i < this.legRoots.length; i++) {
        this.legRoots[i].rotation.x = (i % 2 === 0 ? swing : -swing);
      }
      if (this.tail) this.tail.rotation.y = Math.sin(this.walkPhase * 1.4) * 0.4;
    } else if (this.config.kind === 'aranha') {
      const swing = Math.sin(this.walkPhase * 3) * 0.25;
      for (let i = 0; i < this.legRoots.length; i++) {
        this.legRoots[i].rotation.y = (i % 2 === 0 ? swing : -swing);
      }
    }

    this.hpBar.position.y = this.config.size * 2.2;
    const hpWorld = new THREE.Vector3();
    this.hpBar.getWorldPosition(hpWorld);
    this.hpBar.lookAt(player.object.position.x, hpWorld.y, player.object.position.z);
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
