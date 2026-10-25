// Power.jsx — 电源 'psu' ×2（原几何移植：提手/AC口/释放闩/出风孔/规格标签/双灯）
// Network.jsx 同文件附带：板载网卡 'nic'（原移植）+ OCP 网卡 'ocp' + 后面板 IO 'rio'（本轮新建）
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { M, makeLabelPlane } from '../shared.js';
import { B, Led, BlinkLed, reg, onSel } from './common.jsx';
import { S, selectPart } from '../store.js';

function useVent() {
  return useMemo(() => makeLabelPlane(0.55, 0.3, (ctx, w, h) => {
    ctx.fillStyle = '#39424e'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#141a21';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++){
      ctx.beginPath(); ctx.arc(24 + c * 40, 24 + r * 56, 9, 0, 7); ctx.fill();
    }
  }), []);
}
function useSpec() {
  return useMemo(() => makeLabelPlane(1.05, 0.42, (ctx, w, h) => {
    ctx.fillStyle = '#ddd6c2'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#8a8474'; ctx.lineWidth = 6; ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = '#26303c'; ctx.font = '700 52px sans-serif';
    ctx.fillText('HOT-PLUG POWER SUPPLY', 28, 66);
    ctx.font = '44px sans-serif';
    ctx.fillText('800W PLATINUM · 80 PLUS', 28, 128);
    ctx.fillStyle = '#6b6350'; ctx.font = '36px sans-serif';
    ctx.fillText('INPUT 200–240V ~ 50/60Hz', 28, 182);
  }), []);
}

function PsuUnit({ x, i, mres }) {
  const vent = useVent();
  const lab = useSpec();
  const latch = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xea580c, roughness: .5, metalness: .2, envMapIntensity: 0.55 }), []);
  // 状态灯（原 syncScene 口径）
  let stLed;
  if (!mres.powered) stLed = <Led p={[x - 0.45, 0.22, -3.34]} color={0x1a2436} intensity={0.4} />;
  else if (S.psuCut && i === 1) stLed = <Led p={[x - 0.45, 0.22, -3.34]} color={0xf87171} intensity={1.8} />;
  else stLed = <Led p={[x - 0.45, 0.22, -3.34]} color={0x34d399} intensity={1.6} />;
  // 故障灯（原 v3 联动块口径）
  const fActive = mres.powered && S.psuCut && i === 1;
  return (
    <group>
      <B m={M.metal} s={[1.35, 0.62, 0.85]} p={[x, 0.02, -2.9]} />
      <B m={M.dark} s={[0.07, 0.1, 0.14]} p={[x - 0.22, 0.12, -3.36]} />
      <B m={M.dark} s={[0.07, 0.1, 0.14]} p={[x + 0.22, 0.12, -3.36]} />
      <B m={M.dark} s={[0.52, 0.09, 0.06]} p={[x, 0.12, -3.44]} />
      <B m={M.dark} s={[0.36, 0.28, 0.05]} p={[x - 0.38, -0.08, -3.34]} />
      <mesh material={latch} position={[x + 0.58, 0.0, -3.35]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.34, 0.06]} />
      </mesh>
      <primitive object={vent} position={[x + 0.08, -0.12, -3.335]} rotation={[0, Math.PI, 0]} />
      <primitive object={lab} position={[x, 0.335, -2.9]} rotation={[-Math.PI / 2, 0, 0]} />
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
  return (
    <group ref={reg('nic')} onClick={onSel(() => selectPart('nic', false, 'user'))}>
      <B m={M.pcb} s={[1.1, 0.05, 1.5]} p={[0.55, -0.1, -2.3]} />
      <B m={M.chip} s={[0.45, 0.1, 0.45]} p={[0.55, -0.03, -2.3]} />
      {[-0.25, 0.3].map((dx, i) => (
        <group key={i}>
          <B m={M.dark} s={[0.42, 0.34, 0.1]} p={[0.55 + dx, 0.05, -3.36]} />
          {linked
            ? <BlinkLed p={[0.55 + dx, 0.3, -3.36]} color={0x34d399} speed={7} phase={i * 2} thresh={-0.2} hi={1.7} lo={0.2} />
            : <Led p={[0.55 + dx, 0.3, -3.36]} color={0x1a2436} intensity={0.4} />}
        </group>
      ))}
      <B m={M.silver} s={[1.2, 0.5, 0.04]} p={[0.55, 0.05, -3.38]} />
    </group>
  );
}

function SfpCage({ x }) {
  return (
    <group position={[x, 0.42, -3.28]}>
      <B m={M.silver} s={[0.26, 0.2, 0.14]} p={[0, 0, 0]} />
      <B m={M.dark} s={[0.2, 0.13, 0.02]} p={[0, 0, -0.075]} cast={false} />
    </group>
  );
}
export function Ocp() {
  const tag = useMemo(() => makeLabelPlane(0.62, 0.13, (ctx, w, h) => {
    ctx.fillStyle = '#e6ecf4'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e3a5f'; ctx.font = '700 34px sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText('OCP 3.0 · 2×25GbE', 12, h / 2 + 1);
  }), []);
  return (
    <group ref={reg('ocp')} onClick={onSel(() => selectPart('ocp', false, 'user'))}>
      <B m={M.pcb} s={[0.8, 0.04, 0.9]} p={[0.38, 0.42, -2.85]} />
      <B m={M.chip} s={[0.34, 0.05, 0.34]} p={[0.3, 0.465, -2.7]} />
      <B m={M.silver} s={[0.84, 0.26, 0.04]} p={[0.38, 0.42, -3.33]} />
      <SfpCage x={0.17} />
      <SfpCage x={0.59} />
      <B m={M.metal} s={[0.05, 0.4, 0.05]} p={[0.1, 0.2, -2.6]} />
      <B m={M.metal} s={[0.05, 0.4, 0.05]} p={[0.66, 0.2, -2.6]} />
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
      <B m={M.dark} s={[0.24, 0.17, 0.06]} p={[0, 0, 0]} />
      <B m={M.metal} s={[0.19, 0.12, 0.02]} p={[0, 0, -0.035]} cast={false} />
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
      <B m={M.blue} s={[0.13, 0.07, 0.05]} p={[0.585, -0.27, -3.37]} cast={false} />
      <B m={M.metal} s={[0.05, 0.14, 0.05]} p={[0.1, -0.32, -3.3]} />
      <B m={M.metal} s={[0.05, 0.14, 0.05]} p={[0.6, -0.32, -3.3]} />
      {mres.powered
        ? <BlinkLed p={[0.08, -0.22, -3.39]} color={0x34d399} speed={5} hi={1.7} lo={0.3} />
        : <Led p={[0.08, -0.22, -3.39]} color={0x1a2436} intensity={0.4} />}
    </group>
  );
}
