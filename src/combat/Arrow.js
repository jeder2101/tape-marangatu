import * as THREE from 'three';

export class Arrow {
  constructor(scene, world, origin, direction, speed = 38) {
    this.world = world;
    this.scene = scene;
    this.velocity = direction.clone().multiplyScalar(speed);
    this.gravity = -14;
    this.life = 3.5;
    this.hit = false;

    const geo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6);
    const mat = new THREE.MeshStandardMaterial({ color: 0xd9c9a3, emissive: 0x2a1c00 });
    this.object = new THREE.Mesh(geo, mat);
    this.object.rotation.x = Math.PI / 2;
    const wrap = new THREE.Group();
    wrap.add(this.object);
    wrap.position.copy(origin);
    wrap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.clone().normalize());
    this.group = wrap;
    scene.add(this.group);
  }

  update(dt) {
    if (this.hit) return;
    this.velocity.y += this.gravity * dt;
    this.group.position.addScaledVector(this.velocity, dt);
    this.group.lookAt(
      this.group.position.x - this.velocity.x,
      this.group.position.y - this.velocity.y,
      this.group.position.z - this.velocity.z
    );
    this.life -= dt;

    const gy = this.world.terrain.heightAt(this.group.position.x, this.group.position.z);
    if (this.group.position.y <= gy) {
      this.group.position.y = gy;
      this.hit = true;
    }
    if (this.life <= 0) this.hit = true;
  }

  isAlive() { return this.life > 0 && !this.hit; }

  dispose() { this.scene.remove(this.group); }
}
