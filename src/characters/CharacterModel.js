import * as THREE from 'three';

export const PALETTES = {
  konomi: {
    skin: 0x9c6b3f,
    shirt: 0x8a3b1a,
    pants: 0x3d2a1a,
    hair: 0x0e0e0e,
    adorno: 0xd97b1a,
  },
  kunhatai: {
    skin: 0x9c6b3f,
    shirt: 0xb8671d,
    pants: 0x2a1c10,
    hair: 0x1a120a,
    adorno: 0xe8b400,
  },
};

export function buildCharacter(palette) {
  const g = new THREE.Group();

  const matSkin = new THREE.MeshStandardMaterial({ color: palette.skin, roughness: 0.85 });
  const matShirt = new THREE.MeshStandardMaterial({ color: palette.shirt, roughness: 0.8 });
  const matPants = new THREE.MeshStandardMaterial({ color: palette.pants, roughness: 0.9 });
  const matHair = new THREE.MeshStandardMaterial({ color: palette.hair, roughness: 0.7 });
  const matAdorno = new THREE.MeshStandardMaterial({ color: palette.adorno, roughness: 0.6 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.4), matShirt);
  torso.position.y = 1.05;
  torso.castShadow = true;
  g.add(torso);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.5), matSkin);
  head.position.y = 1.83;
  head.castShadow = true;
  g.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.16, 0.54), matHair);
  hair.position.y = 2.08;
  g.add(hair);

  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.55, 0.1), matHair);
  hairBack.position.set(0, 1.78, -0.26);
  g.add(hairBack);

  const adorno = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.12), matAdorno);
  adorno.position.set(0, 2.14, 0);
  g.add(adorno);

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.18), matSkin);
  armL.position.set(-0.46, 1.05, 0);
  armL.name = 'armL';
  armL.castShadow = true;
  g.add(armL);

  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.18), matSkin);
  armR.position.set(0.46, 1.05, 0);
  armR.name = 'armR';
  armR.castShadow = true;
  g.add(armR);

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.22), matPants);
  legL.position.set(-0.18, 0.36, 0);
  legL.name = 'legL';
  legL.castShadow = true;
  g.add(legL);

  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.22), matPants);
  legR.position.set(0.18, 0.36, 0);
  legR.name = 'legR';
  legR.castShadow = true;
  g.add(legR);

  const bow = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.035, 6, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x6b3f1f, roughness: 0.7 })
  );
  bow.position.set(0, 1.15, -0.28);
  bow.rotation.z = Math.PI / 2;
  bow.name = 'bow';
  g.add(bow);

  const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), matPants);
  quiver.position.set(0.28, 1.4, -0.22);
  quiver.rotation.z = 0.2;
  g.add(quiver);

  return g;
}
