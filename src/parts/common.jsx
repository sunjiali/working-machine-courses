// common.jsx — 部件共用的小组件：B（box）、RB（圆角盒）、Led、BlinkLed、reg（注册表 ref）
// 真实感轮新增：mergedBoxes（小件合并绘制）、screwMesh/Screws（十字槽螺丝组）。
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { registry } from '../store.js';
import { M, ledMaterial } from '../shared.js';

export const reg = (key) => (obj) => { if (obj) registry[key] = obj; };
export const onSel = (fn) => (e) => { if (e.delta > 6) return; e.stopPropagation(); fn(); };

export function B({ m, s, p, cast = true, recv = true }) {
  return (
    <mesh material={m} position={p} castShadow={cast} receiveShadow={recv}>
      <boxGeometry args={s} />
    </mesh>
  );
}

/* 圆角盒（drei RoundedBox）：外形件倒角，破掉「纸片盒」直角感 */
export function RB({ m, s, p, r = 0.02, cast = true, recv = true }) {
  return (
    <RoundedBox args={s} radius={r} smoothness={4} material={m}
      position={p} castShadow={cast} receiveShadow={recv} />
  );
}

/* 合并盒组：一堆小盒（内存颗粒/散热鳍片/金触点/插针）合并成一个几何、一次绘制 */
export function mergedBoxes(list, mat) {
  const geos = list.map(({ s, p }) => {
    const g = new THREE.BoxGeometry(s[0], s[1], s[2]);
    g.translate(p[0], p[1], p[2]);
    return g;
  });
  const mesh = new THREE.Mesh(mergeGeometries(geos), mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

/* 螺丝组：圆头 + 十字槽。list: [{p:[x,y,z], a:'y'|'z'|'x', f:朝向符号(默认+1)}] */
export function screwMesh(list, r = 0.026) {
  const heads = [], slots = [];
  // 槽的两划在头平面内互相垂直：按朝向轴给出两划的尺寸
  const slotDims = {
    y: [[r * 1.45, r * 0.22, r * 0.3], [r * 0.3, r * 0.22, r * 1.45]],
    z: [[r * 1.45, r * 0.3, r * 0.22], [r * 0.3, r * 1.45, r * 0.22]],
    x: [[r * 0.22, r * 0.3, r * 1.45], [r * 0.22, r * 1.45, r * 0.3]],
  };
  list.forEach(({ p, a = 'y', f = 1 }) => {
    const g = new THREE.CylinderGeometry(r, r * 1.08, r * 0.55, 14);
    if (a === 'z') g.rotateX(Math.PI / 2); else if (a === 'x') g.rotateZ(Math.PI / 2);
    g.translate(p[0], p[1], p[2]);
    heads.push(g);
    const off = r * 0.3 * f;
    const sp = a === 'y' ? [p[0], p[1] + off, p[2]]
      : a === 'z' ? [p[0], p[1], p[2] + off] : [p[0] + off, p[1], p[2]];
    slotDims[a].forEach((ss) => {
      const sg = new THREE.BoxGeometry(ss[0], ss[1], ss[2]);
      sg.translate(sp[0], sp[1], sp[2]);
      slots.push(sg);
    });
  });
  const grp = new THREE.Group();
  const hm = new THREE.Mesh(mergeGeometries(heads), M.metal);
  hm.castShadow = true; hm.receiveShadow = true;
  const sm = new THREE.Mesh(mergeGeometries(slots), M.cavity);
  grp.add(hm); grp.add(sm);
  return grp;
}
export function Screws({ list, r = 0.026 }) {
  const obj = useMemo(() => screwMesh(list, r), []);
  return <primitive object={obj} />;
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
