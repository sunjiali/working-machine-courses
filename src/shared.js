// shared.js — 与现行单文件同配方的材质/小工具（spike 移植件，全量重构时继续沿用）
import * as THREE from 'three';

export const M = {
  metal:  new THREE.MeshStandardMaterial({ color:0x8A95A3, roughness:.38, metalness:.6 , envMapIntensity: 0.55 }),
  dark:   new THREE.MeshStandardMaterial({ color:0x414D5E, roughness:.65, metalness:.25 , envMapIntensity: 0.55 }),
  pcb:    new THREE.MeshStandardMaterial({ color:0x166534, roughness:.55, metalness:.15 , envMapIntensity: 0.55 }),
  chip:   new THREE.MeshStandardMaterial({ color:0x4A5568, roughness:.32, metalness:.4 , envMapIntensity: 0.55 }),
  copper: new THREE.MeshStandardMaterial({ color:0xb87333, roughness:.3,  metalness:.8 , envMapIntensity: 0.55 }),
  silver: new THREE.MeshStandardMaterial({ color:0x9aa7b8, roughness:.27, metalness:.7 , envMapIntensity: 0.55 }),
  blue:   new THREE.MeshStandardMaterial({ color:0x1d4ed8, roughness:.45, metalness:.35 , envMapIntensity: 0.55 }),
  amber:  new THREE.MeshStandardMaterial({ color:0x92400e, roughness:.45, metalness:.35 , envMapIntensity: 0.55 }),
};

/* 文字贴标：Canvas 纹理平面（与原版同一实现） */
export function makeLabelPlane(w, h, draw){
  const c = document.createElement('canvas');
  c.width = 512; c.height = Math.max(32, Math.round(512 * h / w));
  draw(c.getContext('2d'), c.width, c.height);
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
}

/* 扫掠扇叶转子（原样移植 buildRotor：镰刀形 Shape 挤出 + 迎角倾斜） */
export function buildRotor(R, nBlades, dir){
  const rotor = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.07, 20), M.metal);
  hub.rotation.x = Math.PI / 2; hub.castShadow = true; rotor.add(hub);
  const s = new THREE.Shape();
  s.moveTo(0.03, -0.042);
  s.quadraticCurveTo(R * 0.5, -0.088, R * 0.94, -0.028);
  s.quadraticCurveTo(R * 1.03, 0.028, R * 0.82, 0.082);
  s.quadraticCurveTo(R * 0.42, 0.078, 0.03, 0.042);
  s.lineTo(0.03, -0.042);
  const bladeGeo = new THREE.ExtrudeGeometry(s, { depth: 0.014, bevelEnabled: false });
  for (let i = 0; i < nBlades; i++){
    const holder = new THREE.Group();
    holder.rotation.z = i / nBlades * Math.PI * 2;
    const b = new THREE.Mesh(bladeGeo, M.silver);
    b.rotation.x = 0.62 * dir;
    b.castShadow = true;
    holder.add(b); rotor.add(holder);
  }
  return rotor;
}

/* 地砖地面贴图（原样移植：细噪点 + 瓷砖缝 + 暗角） */
export function makeFloorTexture(){
  let seed = 20261025;   // 固定种子：原版 Math.random 噪点导致每次加载地面纹理不同
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const x = c.getContext('2d');
  x.fillStyle = '#E6DEC6'; x.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++){
    x.fillStyle = 'rgba(120,105,70,' + (rnd() * 0.05) + ')';
    x.fillRect(rnd() * 1024, rnd() * 1024, 2, 2);
  }
  x.strokeStyle = '#C9BC97'; x.lineWidth = 3;
  for (let i = 0; i <= 4; i++){
    x.beginPath(); x.moveTo(i * 256, 0); x.lineTo(i * 256, 1024); x.stroke();
    x.beginPath(); x.moveTo(0, i * 256); x.lineTo(1024, i * 256); x.stroke();
  }
  const vg = x.createRadialGradient(512, 512, 300, 512, 512, 760);
  vg.addColorStop(0, 'rgba(90,74,32,0)'); vg.addColorStop(1, 'rgba(90,74,32,0.20)');
  x.fillStyle = vg; x.fillRect(0, 0, 1024, 1024);
  const ftex = new THREE.CanvasTexture(c); ftex.anisotropy = 8;
  ftex.colorSpace = THREE.SRGBColorSpace;
  return ftex;
}

/* LED 材质工厂（与 led() 同配方） */
export function ledMaterial(color, intensity){
  return new THREE.MeshStandardMaterial({
    color: 0x0c0f14, emissive: color, emissiveIntensity: intensity, envMapIntensity: 0.55 });
}

/* 线缆（CatmullRom 管，原 backplane cable() 配方） */
export function cableMesh(pts, r, color){
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 8),
    new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .1, envMapIntensity: 0.55 }));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
