const THREE = require('three');

const worldEuler = new THREE.Euler(0.2, 0, 0.5);
const tiltEuler = new THREE.Euler(1.9, 2.35, -0.55);

const worldMat = new THREE.Matrix4().makeRotationFromEuler(worldEuler);
const tiltMat = new THREE.Matrix4().makeRotationFromEuler(tiltEuler);
const tiltInv = tiltMat.clone().invert();

const localMat = tiltInv.multiply(worldMat);
const localEuler = new THREE.Euler().setFromRotationMatrix(localMat);

console.log('Local Euler:', localEuler.x, localEuler.y, localEuler.z);
