import * as THREE from 'three';

export class ThirdPersonCam {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 500);
    this.target = null;
    this.yaw = 0;
    this.pitch = -0.32;
    this.distance = 7.2;
    this.height = 1.6;
    this.camera.position.set(0, 8, 12);
  }

  setTarget(obj) { this.target = obj; }

  update(dt, input) {
    if (!this.target) return;
    this.yaw -= input.mouseDX * 0.0028;
    this.pitch -= input.mouseDY * 0.0028;
    this.pitch = Math.max(-1.1, Math.min(0.5, this.pitch));
    input.mouseDX = 0; input.mouseDY = 0;
    input.cameraYaw = this.yaw;

    const cosP = Math.cos(this.pitch);
    let dist = this.distance;
    for (const box of this.world.colliders) {
      const px = this.target.position.x + Math.sin(this.yaw) * cosP * dist - box.cx;
      const pz = this.target.position.z + Math.cos(this.yaw) * cosP * dist - box.cz;
      if (Math.abs(px) < box.hx + 0.4 && Math.abs(pz) < box.hz + 0.4) dist = Math.max(2.5, dist - 1.5);
    }
    const cosP2 = Math.cos(this.pitch);
    this.camera.position.set(
      this.target.position.x + Math.sin(this.yaw) * cosP2 * dist,
      this.target.position.y + Math.sin(-this.pitch) * dist + this.height,
      this.target.position.z + Math.cos(this.yaw) * cosP2 * dist
    );
    const groundY = this.world.terrain.heightAt(this.camera.position.x, this.camera.position.z) + 0.6;
    if (this.camera.position.y < groundY) this.camera.position.y = groundY;
    this.camera.lookAt(this.target.position.x, this.target.position.y + this.height, this.target.position.z);
  }
}
