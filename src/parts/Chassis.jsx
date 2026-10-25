// Chassis.jsx — 机箱框架（装饰组，不注册）+ 前面板控制区 'panel' + LCD 诊断屏 'lcd'
// 几何逐行对应原单文件机箱块；panel/lcd 从原装饰组拆出独立注册以支持点选/高亮。
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { M, makeLabelPlane } from '../shared.js';
import { B, Led, reg, onSel } from './common.jsx';
import { selectPart } from '../store.js';

export function ChassisFrame() {
  // 仅前框横轨 + 仓位隔断 + 序列号签：底板/侧墙/导轨/提手归 'chassis' 可选组（ChassisBody），避免重合渲染
  return (
    <group>
      <B m={M.dark} s={[4.6, 0.13, 0.1]} p={[0, 0.365, 3.38]} />
      <B m={M.dark} s={[4.6, 0.13, 0.1]} p={[0, -0.365, 3.38]} />
      {[-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5].map(x =>
        <B key={x} m={M.dark} s={[0.045, 0.62, 0.1]} p={[x, 0, 3.38]} />)}
      <B m={M.silver} s={[0.5, 0.09, 0.02]} p={[1.55, -0.365, 3.44]} />
    </group>
  );
}

export function ChassisBody() {
  // 'chassis' 可选部件 = 底板 + 两侧墙 + 导轨 + 提手
  return (
    <group ref={reg('chassis')} onClick={onSel(() => selectPart('chassis', false, 'user'))}>
      <B m={M.metal} s={[4.6, 0.08, 6.8]} p={[0, -0.43, 0]} />
      <B m={M.metal} s={[0.08, 0.86, 6.8]} p={[-2.3, 0, 0]} />
      <B m={M.metal} s={[0.08, 0.86, 6.8]} p={[2.3, 0, 0]} />
      {[-2.36, 2.36].map(x => (
        <group key={x}>
          <B m={M.metal} s={[0.07, 0.34, 5.2]} p={[x, -0.08, -0.4]} />
          <B m={M.dark} s={[0.09, 0.16, 0.3]} p={[x, -0.08, 2.25]} />
        </group>
      ))}
      <B m={M.dark} s={[0.08, 0.28, 0.08]} p={[-1.6, 0.56, -3.25]} />
      <B m={M.dark} s={[0.08, 0.28, 0.08]} p={[1.6, 0.56, -3.25]} />
      <B m={M.dark} s={[3.28, 0.08, 0.08]} p={[0, 0.72, -3.25]} />
    </group>
  );
}

export function FrontPanel({ powered }) {
  const pwrMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x111111, emissive: 0x34d399, emissiveIntensity: powered ? 1.8 : 0.25,
    envMapIntensity: 0.55 }), [powered]);
  const uidMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x0b1e3a, emissive: 0x2563eb, emissiveIntensity: 1.4, envMapIntensity: 0.55 }), []);
  return (
    <group ref={reg('panel')} onClick={onSel(() => selectPart('panel', false, 'user'))}>
      <B m={M.dark} s={[0.32, 0.8, 0.14]} p={[-2.13, 0, 3.40]} />
      <mesh material={pwrMat} position={[-2.13, 0.15, 3.49]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.05, 24]} />
      </mesh>
      <Led p={[-2.13, -0.18, 3.475]} />
      <B m={M.dark} s={[0.32, 0.8, 0.14]} p={[2.13, 0, 3.40]} />
      <B m={M.blue} s={[0.17, 0.08, 0.03]} p={[2.13, 0.22, 3.475]} cast={false} />
      <B m={M.blue} s={[0.26, 0.11, 0.03]} p={[2.13, 0.0, 3.475]} cast={false} />
      <mesh material={uidMat} position={[2.13, -0.22, 3.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 20]} />
      </mesh>
    </group>
  );
}

export function LcdPanel() {
  const lcd = useMemo(() => makeLabelPlane(0.94, 0.12, (ctx, w, h) => {
    ctx.fillStyle = '#d7e9f7'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e3a5f'; ctx.font = '700 30px sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText('iDRAC 192.168.0.120 · OK', 16, h / 2 + 2);
  }), []);
  return (
    <group ref={reg('lcd')} onClick={onSel(() => selectPart('lcd', false, 'user'))}>
      <B m={M.dark} s={[1.02, 0.17, 0.04]} p={[-0.9, 0.365, 3.435]} />
      <primitive object={lcd} position={[-0.9, 0.365, 3.46]} />
    </group>
  );
}
