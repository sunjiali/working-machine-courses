// RiserBackplane.jsx — 扩展笼 'hba' + 硬盘背板与线缆 'backplane'
// Shroud 附带：导流罩 'shroud'（材质经 shroudMats 交 Scene rig 做淡出联动）
// SmallParts 附带：CMOS 电池 'cmos' + BOSS 模块 'boss'
// 真实感轮（2026-10-25）：riser/背板/BOSS 卡面 PCB 走线纹理；铜条改分段金手指；
// riser 挡板口改金属壳+内腔；背板连接器加金触点条 + 白电源块 + 丝印 J1–J4；
// 导流罩标签补气流箭头；CMOS 电池顶印字；BOSS 的 M.2 加颗粒/贴纸/螺丝 + microSD 槽。
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { M, makeLabelPlane, makePcbMaterial, cableMesh } from '../shared.js';
import { B, Screws, mergedBoxes, reg, onSel } from './common.jsx';
import { selectPart } from '../store.js';

export function Riser() {
  const cardMatA = useMemo(() => makePcbMaterial({ base: '#176B36', seed: 71, size: 512, traces: 50 }), []);
  const cardMatB = useMemo(() => makePcbMaterial({ base: '#176B36', seed: 72, size: 512, traces: 50 }), []);
  const fingers = useMemo(() => mergedBoxes(
    [0.14, 0.44].flatMap(y => Array.from({ length: 10 }, (_, i) => ({
      s: [0.055, 0.04, 0.1], p: [-0.765 + i * 0.07, y, -2.18] }))), M.copper), []);
  return (
    <group ref={reg('hba')} onClick={onSel(() => selectPart('hba', false, 'user'))}>
      {[-0.8, -0.1].map(x => <B key={x} m={M.dark} s={[0.06, 0.77, 0.08]} p={[x, 0.05, -2.6]} />)}
      {[-0.87, -0.03].map(x => <B key={x} m={M.metal} s={[0.05, 0.06, 0.95]} p={[x, 0.52, -2.6]} />)}
      <B m={cardMatA} s={[0.8, 0.05, 0.9]} p={[-0.45, 0.47, -2.6]} />
      <B m={M.chip} s={[0.4, 0.06, 0.4]} p={[-0.55, 0.53, -2.5]} />
      <B m={M.chipTop} s={[0.32, 0.012, 0.32]} p={[-0.55, 0.566, -2.5]} />
      <B m={cardMatB} s={[0.8, 0.05, 0.9]} p={[-0.45, 0.17, -2.6]} />
      <B m={M.chip} s={[0.3, 0.05, 0.3]} p={[-0.6, 0.22, -2.75]} />
      <B m={M.chipTop} s={[0.24, 0.012, 0.24]} p={[-0.6, 0.251, -2.75]} />
      <primitive object={fingers} />
      <B m={M.chip} s={[0.2, 0.05, 0.25]} p={[-0.2, 0.52, -2.85]} />
      <B m={M.silver} s={[0.84, 0.52, 0.04]} p={[-0.45, 0.22, -3.37]} />
      <B m={M.metal} s={[0.32, 0.22, 0.05]} p={[-0.55, 0.22, -3.385]} />
      <B m={M.cavity} s={[0.26, 0.15, 0.02]} p={[-0.55, 0.22, -3.415]} cast={false} />
      <Screws r={0.014} list={[
        { p: [-0.82, 0.42, -3.395], a: 'z', f: -1 }, { p: [-0.08, 0.02, -3.395], a: 'z', f: -1 },
      ]} />
      <B m={M.amber} s={[0.18, 0.1, 0.06]} p={[-0.45, 0.56, -2.15]} />
    </group>
  );
}

export function Backplane() {
  const cables = useMemo(() => [
    cableMesh([[1.95, 0.1, 2.45], [2.08, -0.05, 1.7], [2.02, -0.18, 0.4], [1.95, -0.1, -1.0], [1.75, 0.02, -2.3]], 0.045, 0x2456a6),
    cableMesh([[1.82, 0.16, 2.45], [1.95, 0.02, 1.6], [1.88, -0.12, 0.3], [1.8, -0.04, -1.1], [1.6, 0.06, -2.35]], 0.04, 0x1c3f75),
    cableMesh([[-1.95, 0.05, 2.45], [-2.08, -0.1, 1.5], [-1.9, -0.22, 0.7]], 0.055, 0x23272e),
    cableMesh([[-1.8, 0.25, 2.5], [-2.02, 0.1, 1.9], [-2.05, -0.05, 1.2], [-1.85, -0.2, 0.85]], 0.028, 0x6b7280),
    cableMesh([[-1.95, 0.0, -2.45], [-2.06, -0.14, -1.7], [-1.95, -0.24, -1.05]], 0.04, 0x8a6d1f),
  ], []);
  const bpFront = useMemo(() => makePcbMaterial({
    base: '#1D5FA8', seed: 53, size: 1024, traces: 150,
    silk: (ctx, w, h) => {
      ctx.fillStyle = 'rgba(240,244,248,0.92)'; ctx.font = '700 26px sans-serif';
      ctx.textAlign = 'center';
      [-1.58, -0.53, 0.53, 1.58].forEach((cx, i) => {
        ctx.fillText('J' + (i + 1), (cx + 1.975) / 3.95 * w, 40);
      });
      ctx.textAlign = 'left'; ctx.font = '22px sans-serif';
      ctx.fillText('BP-8SFF', 24, h - 18);
    },
  }), []);
  const bpMats = useMemo(() => [M.pcb, M.pcb, M.pcb, M.pcb, bpFront, M.pcb], [bpFront]);
  const fingersRow = useMemo(() => mergedBoxes(
    [-1.58, -0.53, 0.53, 1.58].map(cx => ({ s: [0.26, 0.045, 0.012], p: [cx, -0.07, 2.652] })), M.copper), []);
  return (
    <group ref={reg('backplane')} onClick={onSel(() => selectPart('backplane', false, 'user'))}>
      <mesh material={bpMats} position={[0, 0, 2.52]} castShadow receiveShadow>
        <boxGeometry args={[3.95, 0.74, 0.07]} />
      </mesh>
      {[-1.58, -0.53, 0.53, 1.58].map(x => <B key={x} m={M.dark} s={[0.34, 0.34, 0.1]} p={[x, 0, 2.6]} />)}
      <primitive object={fingersRow} />
      <B m={M.chip} s={[0.5, 0.12, 0.35]} p={[-1.15, 0.12, 2.45]} />
      <B m={M.clipW} s={[0.22, 0.16, 0.09]} p={[1.72, 0.26, 2.52]} />
      <B m={M.copper} s={[0.1, 0.03, 0.02]} p={[1.72, 0.26, 2.575]} cast={false} />
      {cables.map((c, i) => <primitive key={i} object={c} />)}
      <B m={M.dark} s={[0.1, 0.14, 0.22]} p={[2.13, -0.02, 0.4]} />
      <B m={M.dark} s={[0.1, 0.14, 0.22]} p={[2.13, -0.02, -1.0]} />
      <Screws r={0.018} list={[
        { p: [-1.85, 0.3, 2.557], a: 'z' }, { p: [1.88, 0.3, 2.557], a: 'z' },
        { p: [-1.85, -0.3, 2.557], a: 'z' }, { p: [1.85, -0.3, 2.557], a: 'z' },
      ]} />
    </group>
  );
}

/* ---------------- 导流罩 ---------------- */
export const shroudMats = { mat: null, labelMat: null };
export function Shroud() {
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: 0x39424e, roughness: .5, metalness: .15, transparent: true, opacity: .55,
      envMapIntensity: 0.55 });
    shroudMats.mat = m; return m;
  }, []);
  const lab = useMemo(() => makeLabelPlane(2.4, 0.85, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(240,244,248,0.95)'; ctx.font = '700 62px sans-serif';
    ctx.fillText('导流罩 · AIR SHROUD', 10, 74);
    ctx.font = '46px sans-serif'; ctx.fillStyle = 'rgba(240,244,248,0.75)';
    ctx.fillText('气流方向 FRONT → REAR · 拆装先断电', 10, 148);
    // 气流箭头（青绿，与站内强调色一致）
    ctx.fillStyle = '#1AA3A1';
    [228, 292].forEach(ay => {
      ctx.fillRect(w - 215, ay, 120, 16);
      ctx.beginPath();
      ctx.moveTo(w - 95, ay - 10); ctx.lineTo(w - 55, ay + 8); ctx.lineTo(w - 95, ay + 26);
      ctx.closePath(); ctx.fill();
    });
  }), []);
  if (!shroudMats.labelMat) shroudMats.labelMat = lab.material;
  const Slope = ({ s, p, rx }) => (
    <mesh material={mat} position={p} rotation={[rx, 0, 0]} receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  );
  return (
    <group ref={reg('shroud')}>
      <mesh material={mat} position={[0, 0.6, -0.72]} receiveShadow>
        <boxGeometry args={[4.44, 0.05, 1.6]} />
      </mesh>
      <Slope s={[4.44, 0.04, 0.62]} p={[0, 0.44, 0.18]} rx={0.55} />
      <Slope s={[4.44, 0.04, 0.5]} p={[0, 0.47, -1.68]} rx={-0.5} />
      <mesh material={mat} position={[-2.22, 0.4, -0.72]} receiveShadow>
        <boxGeometry args={[0.04, 0.34, 1.6]} />
      </mesh>
      <mesh material={mat} position={[2.22, 0.4, -0.72]} receiveShadow>
        <boxGeometry args={[0.04, 0.34, 1.6]} />
      </mesh>
      <mesh material={mat} position={[0, 0.64, -1.32]} receiveShadow>
        <boxGeometry args={[4.0, 0.03, 0.08]} />
      </mesh>
      <mesh material={mat} position={[0, 0.64, -0.18]} receiveShadow>
        <boxGeometry args={[4.0, 0.03, 0.08]} />
      </mesh>
      <mesh material={mat} position={[-1.2, 0.635, -0.85]} receiveShadow>
        <boxGeometry args={[0.5, 0.025, 0.13]} />
      </mesh>
      <mesh material={mat} position={[1.2, 0.635, -0.85]} receiveShadow>
        <boxGeometry args={[0.5, 0.025, 0.13]} />
      </mesh>
      <primitive object={lab} position={[0, 0.628, -0.55]} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}

/* ---------------- 小部件：CMOS / BOSS ---------------- */
export function Cmos() {
  const tag = useMemo(() => makeLabelPlane(0.34, 0.09, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#26303c'; ctx.font = '700 44px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('CR2032 · 3V', w / 2, h / 2 + 2);
  }), []);
  const cellPrint = useMemo(() => makeLabelPlane(0.17, 0.17, (ctx, w, h) => {
    ctx.fillStyle = '#c8ccd2';
    ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a4150'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 92px sans-serif';
    ctx.fillText('+', w / 2, h / 2 - 58);
    ctx.font = '700 54px sans-serif';
    ctx.fillText('CR2032', w / 2, h / 2 + 42);
    ctx.font = '44px sans-serif';
    ctx.fillText('3V', w / 2, h / 2 + 104);
  }), []);
  const socketMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x23272e, roughness: .6, metalness: .2, envMapIntensity: 0.55 }), []);
  const cellMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xc8ccd2, roughness: .25, metalness: .85, envMapIntensity: 0.55 }), []);
  return (
    <group ref={reg('cmos')} onClick={onSel(() => selectPart('cmos', false, 'user'))}>
      <mesh material={socketMat} position={[1.8, -0.315, 1.0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.03, 24]} />
      </mesh>
      <mesh material={cellMat} position={[1.8, -0.295, 1.0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.105, 0.105, 0.028, 24]} />
      </mesh>
      <primitive object={cellPrint} position={[1.8, -0.2805, 1.0]} rotation={[-Math.PI / 2, 0, 0]} />
      <B m={M.silver} s={[0.16, 0.012, 0.03]} p={[1.8, -0.278, 0.9]} />
      <primitive object={tag} position={[1.8, -0.322, 1.24]} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}

/* BOSS 的一块 M.2 盘：基板 + 两颗粒 + 型号贴纸 + 端部固定螺丝（贴纸须每盘独立对象） */
function M2Slab({ mx }) {
  const tag = useMemo(() => makeLabelPlane(0.12, 0.07, (ctx, w, h) => {
    ctx.fillStyle = '#e8e2cf'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#26303c'; ctx.font = '700 44px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('M.2 SSD', w / 2, h / 2 + 2);
  }), []);
  return (
    <group>
      <B m={M.dark} s={[0.17, 0.3, 0.03]} p={[mx, -0.04, 1.185]} />
      <B m={M.chipTop} s={[0.06, 0.06, 0.016]} p={[mx, 0.045, 1.205]} />
      <B m={M.chipTop} s={[0.06, 0.06, 0.016]} p={[mx, -0.055, 1.205]} />
      <primitive object={tag} position={[mx, -0.15, 1.202]} />
      <Screws r={0.011} list={[{ p: [mx, 0.098, 1.19], a: 'z' }]} />
    </group>
  );
}

export function Boss() {
  const tag = useMemo(() => makeLabelPlane(0.4, 0.11, (ctx, w, h) => {
    ctx.fillStyle = '#e6ecf4'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e3a5f'; ctx.font = '700 36px sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText('BOSS · M.2 ×2 RAID1', 10, h / 2 + 1);
  }), []);
  const cardMat = useMemo(() => makePcbMaterial({ base: '#176B36', seed: 91, size: 512, traces: 40 }), []);
  return (
    <group ref={reg('boss')} onClick={onSel(() => selectPart('boss', false, 'user'))}>
      <B m={M.dark} s={[0.3, 0.05, 0.34]} p={[-1.9, -0.315, 1.15]} />
      <B m={cardMat} s={[0.44, 0.5, 0.04]} p={[-1.9, -0.06, 1.15]} />
      {[-1.995, -1.805].map(mx => <M2Slab key={mx} mx={mx} />)}
      <B m={M.dark} s={[0.16, 0.1, 0.03]} p={[-1.9, -0.22, 1.185]} />
      <B m={M.cavity} s={[0.11, 0.018, 0.012]} p={[-1.9, -0.22, 1.203]} cast={false} />
      <primitive object={tag} position={[-1.9, 0.2, 1.15]} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}
