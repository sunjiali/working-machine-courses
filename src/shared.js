// shared.js — 材质/纹理/小工具。真实感轮（2026-10-25）升级：
// ①纹理全种子化（确定性纪律）：拉丝金属 roughness、塑料微噪、PCB 走线/过孔/丝印 canvas。
// ②材质按真实分工调 envMapIntensity/roughness（金属高反、塑料低反），envMapIntensity 一律创建处定死。
// ③标签平面改 MeshStandardMaterial 吃光（原 MeshBasic 自发亮感与本体脱节）。
import * as THREE from 'three';

/* ---------------- 种子 RNG + canvas 工具 ---------------- */
export function makeRng(seed){
  let s = (seed >>> 0) || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
function srgbTex(c){
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function linearTex(c){
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/* 拉丝金属（roughness/bump 共用灰度图：横向细纹） */
function makeBrushedTex(){
  const rnd = makeRng(20261026);
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#c8c8c8'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 950; i++){
    const y = rnd() * 256, dx = rnd() * 40, l = 20 + rnd() * 216;
    x.strokeStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.20)' : 'rgba(70,70,70,0.15)';
    x.lineWidth = 1;
    x.beginPath(); x.moveTo(dx, y); x.lineTo(dx + l, y); x.stroke();
  }
  return linearTex(c);
}
/* 塑料/涂装微噪点（roughness/bump 共用） */
function makeNoiseTex(){
  const rnd = makeRng(20261027);
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#d2d2d2'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5200; i++){
    const v = 150 + ((rnd() * 105) | 0);
    x.fillStyle = `rgba(${v},${v},${v},0.5)`;
    x.fillRect(rnd() * 256, rnd() * 256, 1.6, 1.6);
  }
  return linearTex(c);
}
const brushedTex = makeBrushedTex();
const noiseTex = makeNoiseTex();

/* ---------------- 材质（按真实分工） ---------------- */
export const M = {
  metal:  new THREE.MeshStandardMaterial({ color:0x8A95A3, roughness:.48, metalness:.6, roughnessMap: brushedTex, bumpMap: brushedTex, bumpScale: .004, envMapIntensity: .65 }),
  dark:   new THREE.MeshStandardMaterial({ color:0x414D5E, roughness:.78, metalness:.25, roughnessMap: noiseTex, bumpMap: noiseTex, bumpScale: .005, envMapIntensity: .5 }),
  plastic:new THREE.MeshStandardMaterial({ color:0x2F3844, roughness:.62, metalness:.05, roughnessMap: noiseTex, bumpMap: noiseTex, bumpScale: .006, envMapIntensity: .5 }),
  pcb:    new THREE.MeshStandardMaterial({ color:0x166534, roughness:.5, metalness:.12, envMapIntensity: .5 }),
  chip:   new THREE.MeshStandardMaterial({ color:0x4A5568, roughness:.3, metalness:.42, envMapIntensity: .6 }),
  chipTop:new THREE.MeshStandardMaterial({ color:0x626F81, roughness:.26, metalness:.5, envMapIntensity: .65 }),
  copper: new THREE.MeshStandardMaterial({ color:0xC08A3E, roughness:.38, metalness:.85, roughnessMap: brushedTex, bumpMap: brushedTex, bumpScale: .003, envMapIntensity: .7 }),
  silver: new THREE.MeshStandardMaterial({ color:0x9AA7B8, roughness:.35, metalness:.7, roughnessMap: brushedTex, bumpMap: brushedTex, bumpScale: .004, envMapIntensity: .7 }),
  blue:   new THREE.MeshStandardMaterial({ color:0x1D4ED8, roughness:.45, metalness:.3, envMapIntensity: .5 }),
  amber:  new THREE.MeshStandardMaterial({ color:0x92400E, roughness:.45, metalness:.3, envMapIntensity: .5 }),
  clipW:  new THREE.MeshStandardMaterial({ color:0xD9DDE3, roughness:.5, metalness:0, envMapIntensity: .5 }),
  cavity: new THREE.MeshStandardMaterial({ color:0x0B0E13, roughness:.85, metalness:.1, envMapIntensity: .35 }),
  substrate: new THREE.MeshStandardMaterial({ color:0x14532D, roughness:.5, metalness:.1, envMapIntensity: .5 }),
};

/* ---------------- PCB 表面材质（走线+过孔+焊盘+丝印，全种子化） ---------------- */
export function makePcbMaterial({ base = '#166534', seed = 7, size = 1024, traces = 130, silk = null, rough = .48 } = {}){
  const rnd = makeRng(seed);
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, size, size);
  // 阻焊色泽不均
  for (let i = 0; i < 26; i++){
    x.fillStyle = rnd() > .5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.035)';
    x.beginPath(); x.arc(rnd() * size, rnd() * size, 60 + rnd() * 220, 0, 7); x.fill();
  }
  // 细噪点
  for (let i = 0; i < size * 2.2; i++){
    x.fillStyle = `rgba(0,0,0,${rnd() * .05})`;
    x.fillRect(rnd() * size, rnd() * size, 1.6, 1.6);
  }
  // 焊盘阵（测试点/未焊接位）
  x.fillStyle = 'rgba(216,180,84,0.5)';
  for (let g = 0; g < 5; g++){
    const gx = rnd() * size * .9, gy = rnd() * size * .9, n = 4 + ((rnd() * 6) | 0);
    for (let i = 0; i < n; i++) x.fillRect(gx + i * 13, gy, 7, 4);
  }
  // 走线（45° 折线）+ 过孔
  const dirs = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for (let i = 0; i < traces; i++){
    let px = rnd() * size, py = rnd() * size;
    let d = dirs[(rnd() * 8) | 0];
    x.strokeStyle = rnd() > .42 ? 'rgba(255,255,255,0.075)' : 'rgba(0,0,0,0.10)';
    x.lineWidth = 1.6 + rnd() * 1.6;
    x.beginPath(); x.moveTo(px, py);
    const segs = 2 + ((rnd() * 4) | 0);
    for (let sgm = 0; sgm < segs; sgm++){
      const len = 26 + rnd() * 130;
      px = Math.max(4, Math.min(size - 4, px + d[0] * len));
      py = Math.max(4, Math.min(size - 4, py + d[1] * len));
      x.lineTo(px, py);
      if (rnd() > .5) d = dirs[(rnd() * 8) | 0];
    }
    x.stroke();
    if (rnd() > .35){
      x.fillStyle = 'rgba(12,18,24,0.55)';
      x.beginPath(); x.arc(px, py, 3.1, 0, 7); x.fill();
      x.fillStyle = 'rgba(226,196,110,0.75)';
      x.beginPath(); x.arc(px, py, 1.3, 0, 7); x.fill();
    }
  }
  if (silk) silk(x, size, rnd);
  const tex = srgbTex(c);
  return new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: .012,
    roughness: rough, metalness: .12, envMapIntensity: .5 });
}

/* 文字贴标：Canvas 纹理平面（吃光的标准材质，与本体同光照） */
export function makeLabelPlane(w, h, draw){
  const c = document.createElement('canvas');
  c.width = 512; c.height = Math.max(32, Math.round(512 * h / w));
  draw(c.getContext('2d'), c.width, c.height);
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .55, metalness: 0, envMapIntensity: .55 }));
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
