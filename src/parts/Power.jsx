// Power.jsx — 电源 'psu' ×2（提手/AC口/释放闩/出风孔/规格标签/双灯）
// Network.jsx 同文件附带：板载网卡 'nic' + OCP 网卡 'ocp' + 后面板 IO 'rio'
// 真实感轮（2026-10-25）：PSU 圆角拉丝壳 + C14 电源座（凹腔+针槽）+ 金属半环提手 + 脸面螺丝；
// 标签补条码/80 PLUS 框/序列号、输入对 REFERENCES 改 100–240V；RJ45 统一为金属壳+内腔+8 金触点；
// 网卡/OCP 卡面 PCB 走线纹理；SFP 笼加内舌与顶槽；USB 加金属壳框。
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { M, makeLabelPlane, makePcbMaterial } from '../shared.js';
import { B, RB, Led, BlinkLed, Screws, mergedBoxes, reg, onSel } from './common.jsx';
import { S, selectPart } from '../store.js';

function useVent() {
  return useMemo(() => makeLabelPlane(0.55, 0.3, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#39424e'); g.addColorStop(1, '#232a33');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0a0d12';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 19; c++){
      ctx.beginPath(); ctx.arc(20 + c * 26 + (r % 2) * 13, 20 + r * 34, 8, 0, 7); ctx.fill();
    }
  }), []);
}
function useSpec() {
  return useMemo(() => makeLabelPlane(1.05, 0.42, (ctx, w, h) => {
    ctx.fillStyle = '#ddd6c2'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#8a8474'; ctx.lineWidth = 6; ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = '#26303c'; ctx.font = '700 50px sans-serif';
    ctx.fillText('HOT-PLUG POWER SUPPLY', 28, 58);
    ctx.font = '42px sans-serif';
    ctx.fillText('800W · 80 PLUS PLATINUM', 28, 110);
    ctx.fillStyle = '#6b6350'; ctx.font = '32px sans-serif';
    ctx.fillText('INPUT 100–240V ~ 50/60Hz', 28, 152);
    ctx.fillText('S/N 8K2P4X9 · MADE FOR 2U RACK', 28, 188);
    // 条码（图形纹样）
    ctx.fillStyle = '#26303c';
    let bx = w - 150;
    const bars = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1];
    bars.forEach((bw, i) => { if (i % 2 === 0) ctx.fillRect(bx, 116, bw * 2.4, 72); bx += bw * 2.4 + 2.6; });
  }), []);
}

/* RJ45 口：金属壳 + 内腔 + 8 根金触点（朝 -z） */
function Rj45Port({ w = 0.4, h = 0.32, d = 0.1 }) {
  const pins = useMemo(() => mergedBoxes(
    Array.from({ length: 8 }, (_, i) => ({
      s: [w * 0.045, h * 0.16, 0.012],
      p: [-w * 0.36 + i * (w * 0.72 / 7), h * 0.2, -d / 2 - 0.006] })), M.copper), [w, h, d]);
  return (
    <group>
      <B m={M.metal} s={[w, h, d]} p={[0, 0, 0]} />
      <B m={M.cavity} s={[w * 0.84, h * 0.72, 0.02]} p={[0, 0, -d / 2 - 0.004]} cast={false} />
      <primitive object={pins} />
    </group>
  );
}

function PsuUnit({ x, i, mres }) {
  const vent = useVent();
  const lab = useSpec();
  const latch = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xea580c, roughness: .5, metalness: .2, envMapIntensity: 0.55 }), []);
  const acSlots = useMemo(() => mergedBoxes(
    [-0.07, 0, 0.07].map(dx => ({ s: [0.02, 0.075, 0.015], p: [x - 0.38 + dx, -0.08, -3.378] })), M.dark), [x]);
  // 状态灯（原 syncScene 口径）
  let stLed;
  if (!mres.powered) stLed = <Led p={[x - 0.45, 0.22, -3.34]} color={0x1a2436} intensity={0.4} />;
  else if (S.psuCut && i === 1) stLed = <Led p={[x - 0.45, 0.22, -3.34]} color={0xf87171} intensity={1.8} />;
  else stLed = <Led p={[x - 0.45, 0.22, -3.34]} color={0x34d399} intensity={1.6} />;
  // 故障灯（原 v3 联动块口径）
  const fActive = mres.powered && S.psuCut && i === 1;
  return (
    <group>
      <RB m={M.metal} s={[1.35, 0.62, 0.85]} p={[x, 0.02, -2.9]} r={0.02} />
      <B m={M.dark} s={[0.07, 0.1, 0.14]} p={[x - 0.22, 0.12, -3.36]} />
      <B m={M.dark} s={[0.07, 0.1, 0.14]} p={[x + 0.22, 0.12, -3.36]} />
      {/* 提手：双耳座 + 金属半环 */}
      <B m={M.dark} s={[0.06, 0.1, 0.1]} p={[x - 0.24, 0.12, -3.39]} />
      <B m={M.dark} s={[0.06, 0.1, 0.1]} p={[x + 0.24, 0.12, -3.39]} />
      <mesh material={M.metal} position={[x, 0.12, -3.42]} castShadow receiveShadow>
        <torusGeometry args={[0.24, 0.028, 10, 28, Math.PI]} />
      </mesh>
      {/* C14 电源座：框 + 凹腔 + 三针槽 */}
      <B m={M.plastic} s={[0.38, 0.3, 0.04]} p={[x - 0.38, -0.08, -3.345]} />
      <B m={M.cavity} s={[0.3, 0.22, 0.025]} p={[x - 0.38, -0.08, -3.362]} cast={false} />
      <primitive object={acSlots} />
      <RB m={latch} s={[0.1, 0.34, 0.06]} p={[x + 0.58, 0.0, -3.35]} r={0.02} />
      <primitive object={vent} position={[x + 0.08, -0.12, -3.335]} rotation={[0, Math.PI, 0]} />
      <primitive object={lab} position={[x, 0.335, -2.9]} rotation={[-Math.PI / 2, 0, 0]} />
      <Screws r={0.02} list={[
        { p: [x - 0.6, 0.27, -3.332], a: 'z', f: -1 }, { p: [x + 0.6, 0.27, -3.332], a: 'z', f: -1 },
        { p: [x - 0.6, -0.23, -3.332], a: 'z', f: -1 }, { p: [x + 0.6, -0.23, -3.332], a: 'z', f: -1 },
      ]} />
      {stLed}
      <Led p={[x + 0.45, 0.22, -3.34]} color={fActive ? 0xf87171 : 0xf59e0b} intensity={fActive ? 1.9 : 0.15} />
    </group>
  );
}

export function Psus({ mres }) {
  return (
    <group ref={reg('psu')} onClick={onSel(() => selectPart('psu', false, 'user'))}>
      {[-1.5, 1.5].map((x, i) => <PsuUnit key={i} x={x} i={i} mres={mres} />)}
    </group>
  );
}

/* ---------------- 网络：nic（原） / ocp + rio（新） ---------------- */
export function Nic({ mres }) {
  const linked = S.bootStage >= 5;
  const pcbMat = useMemo(() => makePcbMaterial({ base: '#176B36', seed: 61, size: 512, traces: 70 }), []);
  return (
    <group ref={reg('nic')} onClick={onSel(() => selectPart('nic', false, 'user'))}>
      <B m={pcbMat} s={[1.1, 0.05, 1.5]} p={[0.55, -0.1, -2.3]} />
      <B m={M.chip} s={[0.45, 0.1, 0.45]} p={[0.55, -0.03, -2.3]} />
      <B m={M.chipTop} s={[0.36, 0.014, 0.36]} p={[0.55, 0.027, -2.3]} />
      {[-0.25, 0.3].map((dx, i) => (
        <group key={i}>
          <group position={[0.55 + dx, 0.05, -3.36]}>
            <Rj45Port />
          </group>
          {linked
            ? <BlinkLed p={[0.55 + dx, 0.3, -3.36]} color={0x34d399} speed={7} phase={i * 2} thresh={-0.2} hi={1.7} lo={0.2} />
            : <Led p={[0.55 + dx, 0.3, -3.36]} color={0x1a2436} intensity={0.4} />}
        </group>
      ))}
      <B m={M.silver} s={[1.2, 0.5, 0.04]} p={[0.55, 0.05, -3.38]} />
      <Screws r={0.016} list={[
        { p: [0.02, 0.24, -3.405], a: 'z', f: -1 }, { p: [1.08, 0.24, -3.405], a: 'z', f: -1 },
      ]} />
    </group>
  );
}

function SfpCage({ x }) {
  return (
    <group position={[x, 0.42, -3.28]}>
      <B m={M.silver} s={[0.26, 0.2, 0.14]} p={[0, 0, 0]} />
      <B m={M.cavity} s={[0.2, 0.13, 0.02]} p={[0, 0, -0.075]} cast={false} />
      <B m={M.copper} s={[0.15, 0.02, 0.012]} p={[0, -0.04, -0.068]} cast={false} />
      {[-0.035, 0, 0.035].map(dz => (
        <B key={dz} m={M.dark} s={[0.2, 0.012, 0.018]} p={[0, 0.103, dz]} cast={false} />
      ))}
    </group>
  );
}
export function Ocp() {
  const pcbMat = useMemo(() => makePcbMaterial({ base: '#176B36', seed: 97, size: 512, traces: 55 }), []);
  const tag = useMemo(() => makeLabelPlane(0.62, 0.13, (ctx, w, h) => {
    ctx.fillStyle = '#e6ecf4'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e3a5f'; ctx.font = '700 34px sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText('OCP 3.0 · 2×25GbE', 12, h / 2 + 1);
  }), []);
  return (
    <group ref={reg('ocp')} onClick={onSel(() => selectPart('ocp', false, 'user'))}>
      <B m={pcbMat} s={[0.8, 0.04, 0.9]} p={[0.38, 0.42, -2.85]} />
      <B m={M.chip} s={[0.34, 0.05, 0.34]} p={[0.3, 0.465, -2.7]} />
      <B m={M.chipTop} s={[0.27, 0.012, 0.27]} p={[0.3, 0.496, -2.7]} />
      <B m={M.silver} s={[0.84, 0.26, 0.04]} p={[0.38, 0.42, -3.33]} />
      <SfpCage x={0.17} />
      <SfpCage x={0.59} />
      <B m={M.metal} s={[0.05, 0.4, 0.05]} p={[0.1, 0.2, -2.6]} />
      <B m={M.metal} s={[0.05, 0.4, 0.05]} p={[0.66, 0.2, -2.6]} />
      <Screws r={0.016} list={[
        { p: [0.03, 0.42, -3.355], a: 'z', f: -1 }, { p: [0.73, 0.42, -3.355], a: 'z', f: -1 },
      ]} />
      <primitive object={tag} position={[0.38, 0.445, -2.62]} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}

function Rj45({ x, label }) {
  const tag = useMemo(() => makeLabelPlane(0.24, 0.07, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(230,236,244,0.95)'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e3a5f'; ctx.font = '700 40px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, w / 2, h / 2 + 2);
  }), [label]);
  return (
    <group position={[x, -0.295, -3.36]}>
      <Rj45Port w={0.24} h={0.18} d={0.06} />
      <primitive object={tag} position={[0, 0.125, -0.03]} rotation={[0, Math.PI, 0]} />
    </group>
  );
}
export function RearIo({ mres }) {
  return (
    <group ref={reg('rio')} onClick={onSel(() => selectPart('rio', false, 'user'))}>
      <B m={M.dark} s={[0.62, 0.19, 0.04]} p={[0.35, -0.295, -3.36]} />
      <Rj45 x={0.17} label="iDRAC" />
      <Rj45 x={0.42} label="SERIAL" />
      {/* 后置 USB：金属壳 + 内腔 + 蓝舌 */}
      <B m={M.metal} s={[0.17, 0.11, 0.045]} p={[0.585, -0.27, -3.362]} />
      <B m={M.cavity} s={[0.13, 0.07, 0.02]} p={[0.585, -0.27, -3.385]} cast={false} />
      <B m={M.blue} s={[0.11, 0.03, 0.025]} p={[0.585, -0.278, -3.388]} cast={false} />
      <B m={M.metal} s={[0.05, 0.14, 0.05]} p={[0.1, -0.32, -3.3]} />
      <B m={M.metal} s={[0.05, 0.14, 0.05]} p={[0.6, -0.32, -3.3]} />
      {mres.powered
        ? <BlinkLed p={[0.08, -0.22, -3.39]} color={0x34d399} speed={5} hi={1.7} lo={0.3} />
        : <Led p={[0.08, -0.22, -3.39]} color={0x1a2436} intensity={0.4} />}
    </group>
  );
}
