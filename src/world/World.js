import * as THREE from 'three';
import { Terrain } from './Terrain.js';

export class World {
  constructor(scene, fase = 1) {
    this.group = new THREE.Group();
    this.scene = scene;
    this.fase = fase;
    this.colliders = [];

    this.terrain = new Terrain(200, 120);
    this.group.add(this.terrain.mesh);

    this._buildMilharal();
    this._buildTrees();
    this._buildRocks();
    this._buildFences();
    this._buildHouses();

    scene.add(this.group);
  }

  _buildMilharal() {
    const stalkCount = 260;
    const stalkGeo = new THREE.CylinderGeometry(0.06, 0.09, 2.4, 6);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x2f8f2a, roughness: 0.8 });
    const stalks = new THREE.InstancedMesh(stalkGeo, stalkMat, stalkCount);
    const earGeo = new THREE.ConeGeometry(0.12, 0.5, 6);
    const earMat = new THREE.MeshStandardMaterial({ color: 0xffcc33, roughness: 0.7 });
    const ears = new THREE.InstancedMesh(earGeo, earMat, stalkCount);
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let row = 0; row < 10 && i < stalkCount; row++) {
      for (let col = 0; col < 26 && i < stalkCount; col++) {
        const x = -35 + row * 7 + (Math.random() - 0.5) * 1.2;
        const z = -20 + col * 2.2 + (Math.random() - 0.5) * 0.8;
        const y = this.terrain.heightAt(x, z);
        dummy.position.set(x, y + 1.2, z);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.updateMatrix();
        stalks.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x + 0.15, y + 1.6, z);
        dummy.updateMatrix();
        ears.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    stalks.castShadow = true;
    ears.castShadow = true;
    stalks.instanceMatrix.needsUpdate = true;
    ears.instanceMatrix.needsUpdate = true;
    this.group.add(stalks, ears);
  }

  _buildTrees() {
    const count = 60;
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 4.5, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3a1f, roughness: 1 });
    const crownGeo = new THREE.IcosahedronGeometry(2.2, 0);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, flatShading: true });
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    const crowns = new THREE.InstancedMesh(crownGeo, crownMat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 40 + Math.random() * 50;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = this.terrain.heightAt(x, z);
      dummy.position.set(x, y + 2.25, z);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, y + 5.2, z);
      dummy.scale.setScalar(0.8 + Math.random() * 0.6);
      dummy.updateMatrix();
      crowns.setMatrixAt(i, dummy.matrix);
      dummy.scale.setScalar(1);
      this.colliders.push({ cx: x, cz: z, hx: 0.6, hz: 0.6 });
    }
    trunks.castShadow = true;
    crowns.castShadow = true;
    trunks.instanceMatrix.needsUpdate = true;
    crowns.instanceMatrix.needsUpdate = true;
    this.group.add(trunks, crowns);
  }

  _buildRocks() {
    const count = 22;
    const geo = new THREE.DodecahedronGeometry(0.9, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 1, flatShading: true });
    const rocks = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 90;
      const z = (Math.random() - 0.5) * 90;
      const y = this.terrain.heightAt(x, z);
      const scale = 0.7 + Math.random() * 1.4;
      dummy.position.set(x, y + scale * 0.5, z);
      dummy.scale.setScalar(scale);
      dummy.rotation.set(Math.random(), Math.random(), Math.random());
      dummy.updateMatrix();
      rocks.setMatrixAt(i, dummy.matrix);
      if (scale > 1.1) this.colliders.push({ cx: x, cz: z, hx: scale * 0.7, hz: scale * 0.7 });
      dummy.scale.setScalar(1);
    }
    rocks.castShadow = true;
    rocks.receiveShadow = true;
    rocks.instanceMatrix.needsUpdate = true;
    this.group.add(rocks);
  }

  _buildFences() {
    const postMat = new THREE.MeshStandardMaterial({ color: 0x8a5a20, roughness: 0.9 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0xa8742d, roughness: 0.9 });
    const startZ = -24;
    for (let i = 0; i <= 16; i++) {
      const z = startZ + i * 2.4;
      const x = -42;
      const y = this.terrain.heightAt(x, z);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.2), postMat);
      post.position.set(x, y + 0.7, z);
      post.castShadow = true;
      this.group.add(post);
      if (i < 16) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 2.4), railMat);
        rail.position.set(x, y + 1.0, z + 1.2);
        this.group.add(rail);
      }
      this.colliders.push({ cx: x, cz: z, hx: 0.3, hz: 0.3 });
    }
  }

  _buildHouses() {
    const housePos = [
      { x: 55, z: 15, rot: -Math.PI / 3 },
      { x: 62, z: -18, rot: Math.PI / 4 },
      { x: 48, z: 42, rot: 0 },
    ];
    for (const hp of housePos) {
      const y = this.terrain.heightAt(hp.x, hp.z);
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(5, 3, 5),
        new THREE.MeshStandardMaterial({ color: 0xb58a5c, roughness: 0.9 })
      );
      base.position.set(hp.x, y + 1.5, hp.z);
      base.rotation.y = hp.rot;
      base.castShadow = true;
      base.receiveShadow = true;
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(4.2, 2.2, 4),
        new THREE.MeshStandardMaterial({ color: 0x9a5f2e, flatShading: true })
      );
      roof.position.set(hp.x, y + 4.1, hp.z);
      roof.rotation.y = hp.rot + Math.PI / 4;
      roof.castShadow = true;
      this.group.add(base, roof);
      this.colliders.push({ cx: hp.x, cz: hp.z, hx: 2.6, hz: 2.6 });
    }
  }
}
