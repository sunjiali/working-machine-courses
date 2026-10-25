// Board.jsx — 主板 'board'（含 BMC/电容/丝印/PCIe 槽导轨）
// CpuRam.jsx 同文件附带：CPU 'cpu' ×2 + 内存 'ram' ×16
// 真实感轮（2026-10-25）：主板顶面 PCB 走线纹理、芯片顶盖、电容刻痕顶、固定螺丝、PCIe 槽端扣；
// 散热鳍片 19→27 合并绘制 + 基板/座框/弹簧螺丝；DIMM 双面各 8 颗粒（合并）+ 金手指 + 乳白卡扣 + 标签加条码。
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { M, makeLabelPlane, makePcbMaterial } from '../shared.js';
import { B, Led, Screws, mergedBoxes, reg, onSel } from './common.jsx';
import { selectPart } from '../store.js';

export function Board() {
  const silk = useMemo(() => makeLabelPlane(1.5, 0.42, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = '700 27px sans-serif';
    ctx.fillText('SYSTEM BOARD · REV A00', 8, 40);
    ctx.font = '22px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText('J1A1 · BMC READY · RoHS', 8, 76);
  }), []);
  const dimmSilk = useMemo(() => makeLabelPlane(2.4, 0.26, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '700 23px sans-serif';
    ctx.fillText('DIMM A1–A8 · CPU1 | CPU2 · B1–B8', 8, 25);
    ctx.font = '18px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('POPULATE A1 / B1 FIRST', 8, 48);
  }), []);
  // 主板本体：顶面走线纹理（种子化），侧边深绿
  const slab = useMemo(() => {
    const top = makePcbMaterial({ base: '#176B36', seed: 41, size: 1024, traces: 210,
      silk: (x, S) => {
        x.strokeStyle = 'rgba(255,255,255,0.5)'; x.lineWidth = 2;
        x.strokeRect(60, 60, 300, 190); x.strokeRect(660, 700, 300, 240);
        x.strokeRect(420, 120, 190, 130);
        x.fillStyle = 'rgba(255,255,255,0.55)'; x.font = '700 21px sans-serif';
        x.fillText('J8', 66, 86); x.fillText('U12 · BMC', 668, 726); x.fillText('PCH', 428, 146);
        x.font = '17px sans-serif'; x.fillStyle = 'rgba(255,255,255,0.4)';
        x.fillText('C204', 120, 120); x.fillText('R57', 700, 770); x.fillText('L31', 460, 190);
      } });
    const geo = new THREE.BoxGeometry(4.3, 0.06, 4.6);
    const mesh = new THREE.Mesh(geo, [M.substrate, M.substrate, top, M.substrate, M.substrate, M.substrate]);
    mesh.position.set(0, -0.36, -0.9);
    mesh.castShadow = true; mesh.receiveShadow = true;
    return mesh;
  }, []);
  const capGeo = useMemo(() => new THREE.CylinderGeometry(0.05, 0.05, 0.15, 10), []);
  const caps = [];
  [-0.95, 0.95].forEach(cx => { for (let i = 0; i < 6; i++) caps.push([cx - 0.5 + i * 0.2, -0.25, -1.55]); });
  for (let i = 0; i < 5; i++) caps.push([-2.0 + i * 0.2, -0.25, 0.75]);
  // 电容顶刻痕盘（合并）+ 芯片排顶盖（合并）
  const capTops = useMemo(() => mergedBoxes(
    caps.map(p => ({ s: [0.082, 0.008, 0.082], p: [p[0], -0.171, p[2]] })), M.dark), []);
  const chipTops = useMemo(() => mergedBoxes(
    Array.from({ length: 7 }, (_, i) => ({
      s: [0.28 + (i % 3) * 0.1 - 0.05, 0.014, 0.17],
      p: [-1.7 + i * 0.55, -0.278, -2.9 + (i % 2) * 0.35] })), M.chipTop), []);
  return (
    <group ref={reg('board')} onClick={onSel(() => selectPart('board', false, 'user'))}>
      <primitive object={slab} />
      {Array.from({ length: 7 }, (_, i) =>
        <B key={i} m={M.chip} s={[0.28 + (i % 3) * 0.1, 0.05, 0.22]} p={[-1.7 + i * 0.55, -0.31, -2.9 + (i % 2) * 0.35]} />)}
      <primitive object={chipTops} />
      <B m={M.chip} s={[0.5, 0.07, 0.5]} p={[1.7, -0.3, -2.6]} />
      <B m={M.chipTop} s={[0.4, 0.014, 0.4]} p={[1.7, -0.258, -2.6]} />
      <Led p={[1.7, -0.28, -2.3]} color={0x22d3ee} />
      {caps.map((p, i) => <mesh key={i} geometry={capGeo} material={M.silver} position={p} castShadow receiveShadow />)}
      <primitive object={capTops} />
      <B m={M.chip} s={[0.42, 0.06, 0.42]} p={[1.35, -0.3, 0.55]} />
      <B m={M.chipTop} s={[0.34, 0.012, 0.34]} p={[1.35, -0.264, 0.55]} />
      <B m={M.chip} s={[0.3, 0.05, 0.3]} p={[-1.45, -0.3, 0.95]} />
      <B m={M.chipTop} s={[0.24, 0.012, 0.24]} p={[-1.45, -0.269, 0.95]} />
      <B m={M.chip} s={[0.55, 0.05, 0.3]} p={[0.3, -0.3, -1.95]} />
      <B m={M.dark} s={[0.09, 0.05, 1.5]} p={[0.3, -0.31, -2.3]} />
      <B m={M.dark} s={[0.09, 0.05, 1.5]} p={[0.82, -0.31, -2.3]} />
      {/* PCIe 槽端扣（乳白） */}
      <B m={M.clipW} s={[0.07, 0.05, 0.1]} p={[0.3, -0.3, -3.02]} />
      <B m={M.clipW} s={[0.07, 0.05, 0.1]} p={[0.82, -0.3, -3.02]} />
      {/* 主板固定螺丝 */}
      <Screws r={0.026} list={[
        { p: [1.55, -0.322, 1.02] }, { p: [-1.55, -0.322, 1.02] },
        { p: [2.02, -0.322, -3.0] }, { p: [-2.02, -0.322, -3.0] },
        { p: [1.62, -0.322, 0.95] }, { p: [-1.9, -0.322, -0.2] },
      ]} />
      <primitive object={silk} position={[-1.15, -0.324, 0.98]} rotation={[-Math.PI / 2, 0, 0]} />
      <primitive object={dimmSilk} position={[0, -0.324, 0.22]} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}

export function Cpus() {
  // 鳍片：27 片合并（双 CPU 共用一份几何表，各自 primitive 实例需独立对象 → 工厂函数）
  const finsFor = (cx) => mergedBoxes(
    Array.from({ length: 27 }, (_, i) => ({
      s: [0.02, 0.52, 1.15], p: [cx - 0.455 + i * 0.035, 0.12, -0.7] })), M.silver);
  const finsA = useMemo(() => finsFor(-0.95), []);
  const finsB = useMemo(() => finsFor(0.95), []);
  return (
    <group ref={reg('cpu')} onClick={onSel(() => selectPart('cpu', false, 'user'))}>
      {[-0.95, 0.95].map(cx => (
        <group key={cx}>
          {/* 基板 + 座框 + 压杆 */}
          <B m={M.substrate} s={[1.04, 0.02, 1.14]} p={[cx, -0.325, -0.7]} />
          <B m={M.metal} s={[1.16, 0.045, 0.05]} p={[cx, -0.305, -1.3]} />
          <B m={M.metal} s={[1.16, 0.045, 0.05]} p={[cx, -0.305, -0.1]} />
          <B m={M.metal} s={[0.05, 0.045, 1.24]} p={[cx - 0.6, -0.305, -0.7]} />
          <B m={M.metal} s={[0.03, 0.03, 0.5]} p={[cx + 0.62, -0.3, -0.7]} />
          <B m={M.silver} s={[1.1, 0.1, 1.2]} p={[cx, -0.28, -0.7]} />
          <B m={M.chip} s={[0.7, 0.12, 0.8]} p={[cx, -0.18, -0.7]} />
          <B m={M.silver} s={[1.0, 0.07, 1.2]} p={[cx, 0.41, -0.7]} />
          <Screws r={0.03} list={[
            { p: [cx - 0.42, 0.452, -1.2] }, { p: [cx + 0.42, 0.452, -1.2] },
            { p: [cx - 0.42, 0.452, -0.2] }, { p: [cx + 0.42, 0.452, -0.2] },
          ]} />
        </group>
      ))}
      <primitive object={finsA} />
      <primitive object={finsB} />
    </group>
  );
}

function Dimm({ x }) {
  const label = useMemo(() => makeLabelPlane(1.05, 0.17, (ctx, w, h) => {
    ctx.fillStyle = '#e6ecf4'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e3a5f'; ctx.textBaseline = 'middle';
    ctx.font = '700 27px sans-serif';
    ctx.fillText('DDR5 · 64GB', 12, 24);
    ctx.font = '19px sans-serif'; ctx.fillStyle = '#5a6a7d';
    ctx.fillText('ECC RDIMM', 12, 58);
    // 条码（图形纹样）
    ctx.fillStyle = '#26303c';
    let bx = w - 118;
    const bars = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3];
    bars.forEach((bw, i) => { if (i % 2 === 0) ctx.fillRect(bx, 12, bw * 2.2, h - 24); bx += bw * 2.2 + 2.4; });
  }), []);
  // 双面各 8 颗粒（合并）+ 底部金手指（合并进同一几何表按材质分两组）
  const chips = useMemo(() => mergedBoxes(
    [0.0425, -0.0425].flatMap(fx =>
      Array.from({ length: 8 }, (_, i) => ({
        s: [0.025, 0.16, 0.125], p: [fx, -0.1, -0.5 + i * 0.143] }))), M.chip), []);
  return (
    <group position={[x, 0, -0.7]}>
      <B m={M.blue} s={[0.06, 0.48, 1.3]} p={[0, -0.03, 0]} />
      <primitive object={chips} />
      <B m={M.copper} s={[0.066, 0.05, 1.26]} p={[0, -0.252, 0]} />
      <primitive object={label} position={[0.056, 0.06, 0]} rotation={[0, Math.PI / 2, 0]} />
      <B m={M.clipW} s={[0.09, 0.06, 0.12]} p={[0, -0.24, -0.6]} />
      <B m={M.clipW} s={[0.09, 0.06, 0.12]} p={[0, -0.24, 0.6]} />
      <B m={M.clipW} s={[0.09, 0.12, 0.07]} p={[0, 0.17, -0.665]} />
      <B m={M.clipW} s={[0.09, 0.12, 0.07]} p={[0, 0.17, 0.665]} />
    </group>
  );
}

export function Memory() {
  return (
    <group ref={reg('ram')} onClick={onSel(() => selectPart('ram', false, 'user'))}>
      {[-2.0, -0.18, 0.18, 2.0].map(bx => (
        <group key={bx} position={[bx, 0, 0]}>
          <B m={M.dark} s={[0.48, 0.09, 1.42]} p={[0, -0.31, -0.7]} />
          {[-0.165, -0.055, 0.055, 0.165].map(off => <Dimm key={off} x={off} />)}
        </group>
      ))}
    </group>
  );
}
