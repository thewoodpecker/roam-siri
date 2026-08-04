import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { bodyMaterialPropsFor, goldMaterialPropsFor, RGL_SUBJECT_SIZE } from './materials';
import { getPackGift } from './giftCatalog';
import { straightenUpright } from './upright';

/** Cache loaded OBJs by URL so switching gifts doesn't re-fetch. */
const loadCache = new Map();

function loadObj(url) {
  if (!loadCache.has(url)) {
    const promise = new Promise((resolve, reject) => {
      const loader = new OBJLoader();
      loader.load(
        url,
        resolve,
        undefined,
        (err) => {
          loadCache.delete(url);
          reject(err);
        },
      );
    });
    loadCache.set(url, promise);
  }
  return loadCache.get(url);
}

/**
 * Bake world transforms, weld coincident verts, recompute smooth normals.
 * Matches RoamIcon3D / GLB gift lighting response — raw OBJ normals are
 * hard-edged and read much dimmer under the same studio lights.
 */
function finalizeForLighting(root) {
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    let geo = obj.geometry.clone();
    geo.applyMatrix4(obj.matrixWorld);
    geo.deleteAttribute('normal');
    const welded = mergeVertices(geo, 1e-4);
    if (welded !== geo) geo.dispose();
    welded.computeVertexNormals();
    obj.geometry = welded;
    obj.position.set(0, 0, 0);
    obj.rotation.set(0, 0, 0);
    obj.scale.set(1, 1, 1);
    obj.updateMatrix();
  });
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  root.updateMatrixWorld(true);
}

function preparePackGift(source, def, theme, paletteId) {
  const root = new THREE.Group();
  root.name = def.id;

  const bodyMat = new THREE.MeshPhysicalMaterial({
    ...bodyMaterialPropsFor(theme, paletteId),
    side: THREE.DoubleSide,
  });
  const accentMat = new THREE.MeshPhysicalMaterial({
    ...goldMaterialPropsFor(theme, paletteId),
    side: THREE.DoubleSide,
  });

  const bodySet = new Set(def.bodyParts);
  const ribbonSet = new Set(def.ribbonParts);

  source.children.forEach((child) => {
    if (!child.isMesh) return;
    const mesh = child.clone();
    // Clone geometry so cache stays pristine across finalize/bake.
    if (mesh.geometry) mesh.geometry = mesh.geometry.clone();
    if (ribbonSet.has(child.name)) mesh.material = accentMat;
    else if (bodySet.has(child.name)) mesh.material = bodyMat;
    else {
      mesh.material = child.name.startsWith('Plane') ? accentMat : bodyMat;
    }
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    root.add(mesh);
  });

  // Undo the lean baked into the pack scene, then smooth for lighting.
  const isFlat = def.id === 'pack-flat';
  straightenUpright(root, { preferShortAxis: isFlat });
  finalizeForLighting(root);

  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.y -= center.y;
  root.position.z -= center.z;

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const fitScale = RGL_SUBJECT_SIZE / maxDim;
  return { object: root, fitScale };
}

/**
 * One gift from the holiday pack (split OBJ),
 * recolored with the active RGL palette.
 */
export default function PackGift3D({ giftId, scale = 1, theme = 'dark', paletteId = 'roam' }) {
  const def = getPackGift(giftId);
  const [source, setSource] = useState(null);

  useEffect(() => {
    if (!def) return undefined;
    let cancelled = false;
    setSource(null);
    loadObj(def.url)
      .then((group) => {
        if (!cancelled) setSource(group);
      })
      .catch((err) => {
        console.error(`[RGL] Failed to load ${def.url}`, err);
      });
    return () => {
      cancelled = true;
    };
  }, [def]);

  const prepared = useMemo(() => {
    if (!source || !def) return null;
    return preparePackGift(source, def, theme, paletteId);
  }, [source, def, theme, paletteId]);

  if (!prepared) return null;

  return (
    <group scale={scale * prepared.fitScale}>
      <primitive object={prepared.object} />
    </group>
  );
}
