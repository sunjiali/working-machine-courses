// common.jsx — 部件共用的小组件：B（box）、Led（状态灯）、BlinkLed（闪烁灯）、reg（注册表 ref）
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { registry } from '../store.js';
import { ledMaterial } from '../shared.js';

export const reg = (key) => (obj) => { if (obj) registry[key] = obj; };
export const onSel = (fn) => (e) => { if (e.delta > 6) return; e.stopPropagation(); fn(); };

export function B({ m, s, p, cast = true, recv = true }) {
  return (
    <mesh material={m} position={p} castShadow={cast} receiveShadow={recv}>
      <boxGeometry args={s} />
    </mesh>
  );
}

export function Led({ p, color = 0x34d399, intensity = 1.6 }) {
  const mat = useMemo(() => ledMaterial(color, intensity), [color, intensity]);
  return <mesh material={mat} position={p}><boxGeometry args={[0.09, 0.09, 0.03]} /></mesh>;
}

/* 闪烁灯：useFrame 按 clock 驱动（手动 advance 下同样确定性） */
export function BlinkLed({ p, color = 0x34d399, speed = 6, phase = 0, thresh = 0, hi = 2, lo = 0.3, active = true }) {
  const ref = useRef();
  const mat = useMemo(() => ledMaterial(color, lo), [color, lo]);
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.material.emissiveIntensity =
        active ? (Math.sin(clock.elapsedTime * speed + phase) > thresh ? hi : lo) : lo;
  });
  return <mesh ref={ref} material={mat} position={p}><boxGeometry args={[0.09, 0.09, 0.03]} /></mesh>;
}
