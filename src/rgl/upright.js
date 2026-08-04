import * as THREE from 'three';

/** Jacobi eigenvalue decomposition for a 3×3 symmetric covariance matrix. */
function eigenSymmetric3(cov) {
  const [xx, xy, xz, yy, yz, zz] = cov;
  const A = [
    [xx, xy, xz],
    [xy, yy, yz],
    [xz, yz, zz],
  ];
  const V = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];

  for (let iter = 0; iter < 48; iter++) {
    let p = 0;
    let q = 1;
    let max = Math.abs(A[0][1]);
    if (Math.abs(A[0][2]) > max) {
      max = Math.abs(A[0][2]);
      p = 0;
      q = 2;
    }
    if (Math.abs(A[1][2]) > max) {
      max = Math.abs(A[1][2]);
      p = 1;
      q = 2;
    }
    if (max < 1e-14) break;

    const app = A[p][p];
    const aqq = A[q][q];
    const apq = A[p][q];
    const phi = 0.5 * Math.atan2(2 * apq, aqq - app);
    const c = Math.cos(phi);
    const s = Math.sin(phi);

    for (let i = 0; i < 3; i++) {
      const aip = A[i][p];
      const aiq = A[i][q];
      A[i][p] = c * aip - s * aiq;
      A[i][q] = s * aip + c * aiq;
    }
    for (let i = 0; i < 3; i++) {
      const api = A[p][i];
      const aqi = A[q][i];
      A[p][i] = c * api - s * aqi;
      A[q][i] = s * api + c * aqi;
    }
    A[p][q] = 0;
    A[q][p] = 0;

    for (let i = 0; i < 3; i++) {
      const vip = V[i][p];
      const viq = V[i][q];
      V[i][p] = c * vip - s * viq;
      V[i][q] = s * vip + c * viq;
    }
  }

  return {
    evals: [A[0][0], A[1][1], A[2][2]],
    evecs: [
      new THREE.Vector3(V[0][0], V[1][0], V[2][0]).normalize(),
      new THREE.Vector3(V[0][1], V[1][1], V[2][1]).normalize(),
      new THREE.Vector3(V[0][2], V[1][2], V[2][2]).normalize(),
    ],
  };
}

function centroidOf(pts) {
  const n = pts.length / 3;
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < pts.length; i += 3) {
    x += pts[i];
    y += pts[i + 1];
    z += pts[i + 2];
  }
  return new THREE.Vector3(x / n, y / n, z / n);
}

function collectWorldVerts(obj, bucket) {
  if (!obj.isMesh || !obj.geometry?.attributes?.position) return;
  const pos = obj.geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
    bucket.push(v.x, v.y, v.z);
  }
}

function isWarmMaterial(mat) {
  if (!mat?.color) return false;
  const { r, g, b } = mat.color;
  return r > 0.45 && r > b;
}

function bakeQuaternion(root, q) {
  root.quaternion.copy(q);
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    obj.geometry = obj.geometry.clone();
    obj.geometry.applyMatrix4(obj.matrixWorld);
    obj.geometry.computeVertexNormals();
    obj.position.set(0, 0, 0);
    obj.rotation.set(0, 0, 0);
    obj.scale.set(1, 1, 1);
    obj.updateMatrix();
  });
  root.quaternion.identity();
  root.position.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  root.updateMatrixWorld(true);
}

/**
 * Prefer bow-on-top: warm/ribbon materials (or Plane / BezierCurve names)
 * sit above the body. Falls back to PCA if bow/body can't be split.
 *
 * IMPORTANT: `isMesh` is a boolean — never write `obj.isMesh?.geometry`.
 */
export function straightenUpright(root, { preferShortAxis = false, useBow = true } = {}) {
  root.updateMatrixWorld(true);

  const bodyPts = [];
  const bowPts = [];
  const allPts = [];

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry?.attributes?.position) return;
    collectWorldVerts(obj, allPts);

    const namedBow =
      obj.name.startsWith('Plane') ||
      obj.name.startsWith('BezierCurve') ||
      /bow/i.test(obj.name);

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const warm = mats.some(isWarmMaterial);

    // Prefer explicit bow meshes (curves/planes). Warm ribbon wraps around
    // the body should NOT count as "top" or they'll pull up sideways.
    if (useBow && namedBow) collectWorldVerts(obj, bowPts);
    else if (useBow && warm && !obj.name.startsWith('Cube') && !obj.name.startsWith('Cylinder')) {
      collectWorldVerts(obj, bowPts);
    } else {
      collectWorldVerts(obj, bodyPts);
    }
  });

  let up = null;

  if (useBow && bowPts.length >= 9 && bodyPts.length >= 9) {
    up = centroidOf(bowPts).sub(centroidOf(bodyPts));
  }

  if (!up || up.lengthSq() < 1e-8) {
    // PCA fallback
    const n = allPts.length / 3;
    if (n < 8) return;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let i = 0; i < allPts.length; i += 3) {
      cx += allPts[i];
      cy += allPts[i + 1];
      cz += allPts[i + 2];
    }
    cx /= n;
    cy /= n;
    cz /= n;
    let xx = 0;
    let xy = 0;
    let xz = 0;
    let yy = 0;
    let yz = 0;
    let zz = 0;
    for (let i = 0; i < allPts.length; i += 3) {
      const x = allPts[i] - cx;
      const y = allPts[i + 1] - cy;
      const z = allPts[i + 2] - cz;
      xx += x * x;
      xy += x * y;
      xz += x * z;
      yy += y * y;
      yz += y * z;
      zz += z * z;
    }
    const { evals, evecs } = eigenSymmetric3([
      xx / n,
      xy / n,
      xz / n,
      yy / n,
      yz / n,
      zz / n,
    ]);
    let best = 0;
    for (let i = 1; i < 3; i++) {
      if (preferShortAxis ? evals[i] < evals[best] : evals[i] > evals[best]) {
        best = i;
      }
    }
    up = evecs[best].clone();
  }

  if (up.lengthSq() < 1e-8) return;
  up.normalize();
  if (up.dot(new THREE.Vector3(0, 1, 0)) < 0) up.negate();
  if (up.dot(new THREE.Vector3(0, 1, 0)) > 0.9995) return;

  const q = new THREE.Quaternion().setFromUnitVectors(up, new THREE.Vector3(0, 1, 0));
  bakeQuaternion(root, q);
}
