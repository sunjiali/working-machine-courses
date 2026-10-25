// Drives.jsx — 硬盘 'disk'：4 装机盘（托架/标签/双灯/可拖）+ 4 空仓挡板
// FanWall.jsx 同文件附带：风扇墙 'fan' ×6 模块（双转子，角度由 clock 绝对时间驱动）
// 真实感轮（2026-10-25）：托架/挡板/风扇壳圆角 + 塑料微噪材质；拉手铰链盘；标签补条码/型号行；
// 风扇加风道环 + 内套筒 + 规格贴 + 面螺丝。registry 下标（drives/fanModules/rotors）与拖拽路径零改动。
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { M, makeLabelPlane, buildRotor } from '../shared.js';
import { B, RB, Led, BlinkLed, Screws, reg, onSel } from './common.jsx';
import { S, U, selectPart, cameraBus, registry, fanState } from '../store.js';

/* 盘活动灯：上电且在位时绿闪（原 v3 联动块同口径，改由 clock 驱动） */
function ActLed({ p, on, phase }) {
  const ref = useRef();
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x0c0f14, emissive: 0x34d399, emissiveIntensity: 0.3, envMapIntensity: 0.55 }), []);
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.material.emissiveIntensity =
        on ? (Math.sin(clock.elapsedTime * 9.09 + phase) > -0.1 ? 1.6 : 0.25) : 0.3;
  });
  return <mesh ref={ref} material={mat} position={p}><boxGeometry args={[0.09, 0.09, 0.03]} /></mesh>;
}

function Drive({ i, x, st, mres }) {
  const cap = useMemo(() => makeLabelPlane(0.26, 0.11, (ctx, w, h) => {
    ctx.fillStyle = '#e8e2cf'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#26303c'; ctx.textBaseline = 'middle';
    ctx.font = '700 34px sans-serif';
    ctx.fillText('SSD 7.68TB', 12, 26);
    ctx.font = '21px sans-serif'; ctx.fillStyle = '#6b6350';
    ctx.fillText('2.5" SAS · HOT-SWAP', 12, 62);
    ctx.fillStyle = '#26303c';
    let bx = w - 92;
    const bars = [3, 1, 2, 1, 1, 3, 1, 2, 1, 1, 3];
    bars.forEach((bw, j) => { if (j % 2 === 0) ctx.fillRect(bx, 14, bw * 2, h - 28); bx += bw * 2 + 2.2; });
  }), []);
  // 状态灯（原 syncScene 口径）
  let ledEl;
  if (!mres.powered) ledEl = <Led p={[0.13, 0.2, 0.28]} color={0x1a2436} intensity={0.4} />;
  else if (st === 'out') ledEl = <Led p={[0.13, 0.2, 0.28]} color={0x47586e} intensity={0.5} />;
  else if (st === 'rebuild') ledEl = <BlinkLed p={[0.13, 0.2, 0.28]} color={0xfbbf24} speed={6} hi={2} lo={0.3} />;
  else if (mres.arrayLevel === 'bad') ledEl = <Led p={[0.13, 0.2, 0.28]} color={0xf87171} intensity={1.8} />;
  else ledEl = <Led p={[0.13, 0.2, 0.28]} color={0x34d399} intensity={1.6} />;
  return (
    <group position={[x, 0, 2.95]}
      ref={(el) => { if (el) { (registry.drives ||= [])[i] = el; } }}
      onPointerDown={(e) => {
        e.stopPropagation();
        U.drag = { type: 'disk', i, startY: e.clientY };
        if (cameraBus.setControlsEnabled) cameraBus.setControlsEnabled(false);
      }}>
      <RB m={M.plastic} s={[0.44, 0.68, 0.5]} p={[0, 0, 0]} r={0.02} />
      <B m={M.silver} s={[0.38, 0.6, 0.04]} p={[0.02, 0, 0.26]} />
      <B m={M.metal} s={[0.46, 0.045, 0.03]} p={[0, 0.32, 0.30]} />
      <B m={M.metal} s={[0.46, 0.045, 0.03]} p={[0, -0.32, 0.30]} />
      <B m={M.metal} s={[0.045, 0.68, 0.03]} p={[-0.21, 0, 0.30]} />
      <B m={M.metal} s={[0.045, 0.68, 0.03]} p={[0.21, 0, 0.30]} />
      <RB m={M.blue} s={[0.07, 0.1, 0.05]} p={[-0.13, -0.22, 0.27]} r={0.012} />
      <RB m={M.amber} s={[0.08, 0.42, 0.05]} p={[-0.13, 0.05, 0.27]} r={0.015} />
      <mesh material={M.metal} position={[-0.13, -0.15, 0.27]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
      </mesh>
      <Screws r={0.018} list={[
        { p: [0.16, 0.26, 0.285], a: 'z' }, { p: [0.16, -0.26, 0.285], a: 'z' },
      ]} />
      <primitive object={cap} position={[0.05, -0.12, 0.285]} />
      {ledEl}
      <ActLed p={[0.13, -0.24, 0.28]} on={mres.powered && st !== 'out'} phase={i * 1.7} />
    </group>
  );
}

function Blank({ x }) {
  const vent = useMemo(() => makeLabelPlane(0.36, 0.58, (ctx, w, h) => {
    ctx.fillStyle = '#2c3644'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#12181f';
    for (let r = 0; r < 17; r++) for (let c = 0; c < 10; c++){
      ctx.beginPath(); ctx.arc(28 + c * 50, 26 + r * 48, 8.5, 0, 7); ctx.fill();
    }
  }), []);
  return (
    <group position={[x, 0, 2.95]}>
      <RB m={M.plastic} s={[0.44, 0.68, 0.5]} p={[0, 0, 0]} r={0.02} />
      <primitive object={vent} position={[0, 0, 0.26]} />
      <B m={M.metal} s={[0.42, 0.03, 0.02]} p={[0, 0.315, 0.256]} />
      <B m={M.metal} s={[0.42, 0.03, 0.02]} p={[0, -0.315, 0.256]} />
      <B m={M.metal} s={[0.03, 0.66, 0.02]} p={[-0.195, 0, 0.256]} />
      <B m={M.metal} s={[0.03, 0.66, 0.02]} p={[0.195, 0, 0.256]} />
      <B m={M.metal} s={[0.2, 0.05, 0.04]} p={[0, 0, 0.27]} />
      <Screws r={0.016} list={[
        { p: [-0.17, 0.29, 0.262], a: 'z' }, { p: [0.17, -0.29, 0.262], a: 'z' },
      ]} />
    </group>
  );
}

export function Drives({ mres }) {
  return (
    <group ref={reg('disk')} onClick={onSel(() => selectPart('disk', false, 'user'))}>
      {[-1.75, -1.25, -0.75, -0.25].map((x, i) =>
        <Drive key={i} i={i} x={x} st={S.disks[i]} mres={mres} />)}
      {[0.25, 0.75, 1.25, 1.75].map(x => <Blank key={x} x={x} />)}
    </group>
  );
}

/* ---------------- 风扇墙 ---------------- */
function FanModule({ fi, x, ledColor, ledInt }) {
  const rotor = useMemo(() => buildRotor(0.30, 9, 1), []);
  const rotor2 = useMemo(() => buildRotor(0.25, 7, -1), []);
  const num = useMemo(() => makeLabelPlane(0.15, 0.15, (ctx, w, h) => {
    ctx.fillStyle = '#24344d'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff'; ctx.font = '700 300px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(fi + 1), w / 2, h / 2 + 12);
  }), [fi]);
  const spec = useMemo(() => makeLabelPlane(0.3, 0.09, (ctx, w, h) => {
    ctx.fillStyle = '#dfe5ec'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#26303c'; ctx.font = '700 40px sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText('DC 12V · HOT-SWAP', 12, h / 2 + 2);
  }), []);
  const sleeveMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x11161d, roughness: .8, metalness: .1, side: THREE.DoubleSide, envMapIntensity: 0.35 }), []);
  return (
    <group position={[x, 0.02, 1.5]}
      ref={(el) => { if (el) { (registry.fanModules ||= [])[fi] = el; } }}
      onPointerDown={(e) => {
        e.stopPropagation();
        U.drag = { type: 'fan', i: fi, startY: e.clientY };
        if (cameraBus.setControlsEnabled) cameraBus.setControlsEnabled(false);
      }}>
      <RB m={M.plastic} s={[0.7, 0.78, 0.34]} p={[0, 0, 0]} r={0.03} />
      <mesh material={sleeveMat} position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.315, 0.315, 0.12, 36, 1, true]} />
      </mesh>
      <mesh material={M.dark} position={[0, 0, 0.185]} castShadow receiveShadow>
        <torusGeometry args={[0.315, 0.022, 10, 40]} />
      </mesh>
      <B m={M.blue} s={[0.2, 0.05, 0.12]} p={[0, 0.415, -0.04]} />
      <mesh material={M.metal} position={[0, 0.4, 0.06]} castShadow>
        <torusGeometry args={[0.09, 0.024, 8, 18, Math.PI]} />
      </mesh>
      <primitive object={num} position={[0.23, 0.28, 0.176]} />
      <primitive object={spec} position={[-0.17, -0.3, 0.176]} />
      <Screws r={0.018} list={[
        { p: [0.29, 0.32, 0.172], a: 'z' }, { p: [-0.29, 0.32, 0.172], a: 'z' },
        { p: [0.29, -0.32, 0.172], a: 'z' }, { p: [-0.29, -0.32, 0.172], a: 'z' },
      ]} />
      <primitive object={rotor} position={[0, 0, 0.20]}
        ref={(el) => { if (el) { (registry.rotors ||= [])[fi] = el; } }} />
      <primitive object={rotor2} position={[0, 0, 0.07]}
        ref={(el) => { if (el) { (registry.rotors2 ||= [])[fi] = el; } }} />
      <Led p={[0.27, -0.28, 0.18]} color={ledColor} intensity={ledInt} />
    </group>
  );
}

export function FanWall({ mres }) {
  const frozen = useRef(null);
  useFrame(({ clock }) => {
    const spd = mres.fanRPM * 0.21;   // 原版每帧 fanRPM*0.0035（60fps）→ rad/s
    const t = clock.elapsedTime;
    if (S.fanFailed && frozen.current === null) frozen.current = { a: -t * spd, b: t * spd * 1.2 };
    if (!S.fanFailed) frozen.current = null;
    (registry.rotors || []).forEach((r, i) => {
      if (r) r.rotation.z = (S.fanFailed && i === 1 && frozen.current) ? frozen.current.a : -t * spd;
    });
    (registry.rotors2 || []).forEach((r, i) => {
      if (r) r.rotation.z = (S.fanFailed && i === 1 && frozen.current) ? frozen.current.b : t * spd * 1.2;
    });
    if (registry.rotors && registry.rotors[0]) fanState.angle = registry.rotors[0].rotation.z;
  });
  return (
    <group ref={reg('fan')} onClick={onSel(() => selectPart('fan', false, 'user'))}>
      <B m={M.metal} s={[4.14, 0.07, 0.44]} p={[0, 0.47, 1.5]} />
      <B m={M.metal} s={[0.07, 0.86, 0.44]} p={[-2.07, 0.02, 1.5]} />
      <B m={M.metal} s={[0.07, 0.86, 0.44]} p={[2.07, 0.02, 1.5]} />
      <B m={M.blue} s={[0.34, 0.06, 0.16]} p={[1.62, 0.54, 1.5]} />
      <Screws r={0.02} list={[
        { p: [-1.95, 0.512, 1.5] }, { p: [1.95, 0.512, 1.5] },
      ]} />
      {[-1.85, -1.11, -0.37, 0.37, 1.11, 1.85].map((x, fi) => {
        let color = 0x34d399, inten = 1.2;
        if (!mres.powered){ color = 0x1a2436; inten = 0.4; }
        else if (S.fanFailed && fi === 1){ color = 0xf87171; inten = 1.8; }
        return <FanModule key={fi} fi={fi} x={x} ledColor={color} ledInt={inten} />;
      })}
    </group>
  );
}
