// Board.jsx — 主板 'board'（含 BMC/电容/丝印/PCIe 槽导轨）
// CpuRam.jsx 同文件附带：CPU 'cpu' ×2 + 内存 'ram' ×16（几何均为原单文件逐行移植）
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { M, makeLabelPlane } from '../shared.js';
import { B, Led, reg, onSel } from './common.jsx';
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
  const capGeo = useMemo(() => new THREE.CylinderGeometry(0.05, 0.05, 0.15, 10), []);
  const caps = [];
  [-0.95, 0.95].forEach(cx => { for (let i = 0; i < 6; i++) caps.push([cx - 0.5 + i * 0.2, -0.25, -1.55]); });
  for (let i = 0; i < 5; i++) caps.push([-2.0 + i * 0.2, -0.25, 0.75]);
  return (
    <group ref={reg('board')} onClick={onSel(() => selectPart('board', false, 'user'))}>
      <B m={M.pcb} s={[4.3, 0.06, 4.6]} p={[0, -0.36, -0.9]} />
      {Array.from({ length: 7 }, (_, i) =>
        <B key={i} m={M.chip} s={[0.28 + (i % 3) * 0.1, 0.05, 0.22]} p={[-1.7 + i * 0.55, -0.31, -2.9 + (i % 2) * 0.35]} />)}
      <B m={M.chip} s={[0.5, 0.07, 0.5]} p={[1.7, -0.3, -2.6]} />
      <Led p={[1.7, -0.28, -2.3]} color={0x22d3ee} />
      {caps.map((p, i) => <mesh key={i} geometry={capGeo} material={M.silver} position={p} castShadow receiveShadow />)}
      <B m={M.chip} s={[0.42, 0.06, 0.42]} p={[1.35, -0.3, 0.55]} />
      <B m={M.chip} s={[0.3, 0.05, 0.3]} p={[-1.45, -0.3, 0.95]} />
      <B m={M.chip} s={[0.55, 0.05, 0.3]} p={[0.3, -0.3, -1.95]} />
      <B m={M.dark} s={[0.09, 0.05, 1.5]} p={[0.3, -0.31, -2.3]} />
      <B m={M.dark} s={[0.09, 0.05, 1.5]} p={[0.82, -0.31, -2.3]} />
      <primitive object={silk} position={[-1.15, -0.324, 0.98]} rotation={[-Math.PI / 2, 0, 0]} />
      <primitive object={dimmSilk} position={[0, -0.324, 0.22]} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}

export function Cpus() {
  return (
    <group ref={reg('cpu')} onClick={onSel(() => selectPart('cpu', false, 'user'))}>
      {[-0.95, 0.95].map(cx => (
        <group key={cx}>
          <B m={M.silver} s={[1.1, 0.1, 1.2]} p={[cx, -0.28, -0.7]} />
          <B m={M.chip} s={[0.7, 0.12, 0.8]} p={[cx, -0.18, -0.7]} />
          {Array.from({ length: 19 }, (_, i) =>
            <B key={i} m={M.silver} s={[0.026, 0.52, 1.15]} p={[cx - 0.45 + i * 0.05, 0.12, -0.7]} />)}
          <B m={M.silver} s={[1.0, 0.07, 1.2]} p={[cx, 0.41, -0.7]} />
        </group>
      ))}
    </group>
  );
}

function Dimm({ x }) {
  const label = useMemo(() => makeLabelPlane(1.05, 0.17, (ctx, w, h) => {
    ctx.fillStyle = '#e6ecf4'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e3a5f'; ctx.font = '700 30px sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText('DDR5 · 64GB · ECC RDIMM', 14, h / 2 + 1);
  }), []);
  return (
    <group position={[x, 0, -0.7]}>
      <B m={M.blue} s={[0.06, 0.48, 1.3]} p={[0, -0.03, 0]} />
      {[0, 1, 2, 3].map(i => <B key={i} m={M.chip} s={[0.08, 0.2, 0.2]} p={[0, 0.0, -1.2 + i * 0.33 + 0.7]} />)}
      <primitive object={label} position={[0.056, 0.06, 0]} rotation={[0, Math.PI / 2, 0]} />
      <B m={M.silver} s={[0.09, 0.06, 0.12]} p={[0, -0.24, -0.6]} />
      <B m={M.silver} s={[0.09, 0.06, 0.12]} p={[0, -0.24, 0.6]} />
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
