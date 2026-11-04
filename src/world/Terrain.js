import * as THREE from 'three';

export class Terrain {
  constructor(size = 200, segments = 120) {
    this.size = size;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, this.heightAt(x, z));
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: 0x4c8f34, roughness: 0.95, metalness: 0 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = true;
  }

  heightAt(x, z) {
    const h1 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2.6;
    const h2 = Math.sin(x * 0.15 + 1.2) * 0.6;
    const h3 = Math.cos(z * 0.12 - 0.6) * 0.4;
    return h1 + h2 + h3;
  }
}
