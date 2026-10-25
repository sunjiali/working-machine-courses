// Scene.jsx — Canvas 内部：环境/灯光/台面与微缩环境叙事、全部部件、相机飞行、主循环 rig、选中高亮。
// 灯光与环境配方 = 原单文件逐项移植（PMREM 自建房间、PCFSoft、ACES 1.06、地砖台面、远景机柜排）。
// 本轮环境叙事新增（浅色系低对比、程序化低多边形）：穿孔高架地板砖、左右邻柜（微光 LED）、后上方线缆桥架 + 垂落线缆。
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { M, makeFloorTexture, makeLabelPlane, cableMesh } from './shared.js';
import { VIEWS } from './views.js';
import { S, U, PARTS, registry, cameraBus, dotUpdater, REC_MODE } from './store.js';
import { ChassisFrame, ChassisBody, FrontPanel, LcdPanel } from './parts/Chassis.jsx';
import { Board, Cpus, Memory } from './parts/Board.jsx';
import { Drives, FanWall } from './parts/Drives.jsx';
import { Psus, Nic, Ocp, RearIo } from './parts/Power.jsx';
import { Riser, Backplane, Shroud, shroudMats, Cmos, Boss } from './parts/RiserBackplane.jsx';

export const camAnimRef = { current: null };
const shroudState = { cur: 0.55 };

/* ---------------- PMREM 环境（原配方逐行移植） ---------------- */
function EnvSetup() {
  const gl = useThree(s => s.gl);
  const scene = useThree(s => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.BoxGeometry(30, 16, 30),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide }));
    room.material.color.setRGB(0.32, 0.30, 0.26); room.position.y = 4; env.add(room);
    const panel = (w, h, x, y, z, ry, rgb) => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial());
      p.material.color.setRGB(...rgb); p.position.set(x, y, z); p.rotation.y = ry; env.add(p);
    };
    panel(16, 7, 0, 11.8, 0, 0, [7, 6.8, 6.2]);
    panel(10, 5, -14.8, 6, 0, Math.PI / 2, [2.6, 2.5, 2.3]);
    panel(10, 5, 14.8, 6, 0, -Math.PI / 2, [1.2, 1.7, 1.6]);
    panel(14, 4, 0, 5, -14.8, 0, [2.0, 1.9, 1.7]);
    const tex = pmrem.fromScene(env, 0.05).texture;
    scene.environment = tex;
    return () => { scene.environment = null; tex.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}

function Lights() {
  return (
    <>
      <hemisphereLight args={[0xffffff, 0xcfc4a4, 0.5]} />
      <directionalLight position={[6, 10, 5]} intensity={2.3} color={0xfff1dd} castShadow
        shadow-mapSize={[REC_MODE ? 1024 : 2048, REC_MODE ? 1024 : 2048]}
        shadow-camera-left={-6} shadow-camera-right={6}
        shadow-camera-top={6} shadow-camera-bottom={-6}
        shadow-camera-near={2} shadow-camera-far={30}
        shadow-bias={-0.0004} shadow-normalBias={0.02} />
      <directionalLight position={[-7, 4, -6]} intensity={0.4} color={0x0D9488} />
      <directionalLight position={[-5, 3, 8]} intensity={0.45} color={0xfff4e0} />
    </>
  );
}

/* ---------------- 台面与环境叙事 ---------------- */
function FloorSet() {
  const ftex = useMemo(() => makeFloorTexture(), []);
  const rackMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xE1D8BE, roughness: .95, metalness: .05, envMapIntensity: 0.55 }), []);
  const neighMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xDCD2B2, roughness: .9, metalness: .08, envMapIntensity: 0.55 }), []);
  const tileTex = useMemo(() => makeLabelPlane(3.4, 2.2, (ctx, w, h) => {
    ctx.fillStyle = '#E9E1C9'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(120,105,70,0.35)';
    for (let r = 0; r < 12; r++) for (let c = 0; c < 18; c++){
      ctx.beginPath(); ctx.arc(20 + c * 28, 20 + r * 28, 6, 0, 7); ctx.fill();
    }
    ctx.strokeStyle = '#C9BC97'; ctx.lineWidth = 5; ctx.strokeRect(3, 3, w - 6, h - 6);
  }), []);
  const trayCables = useMemo(() => [
    cableMesh([[-1.3, 3.92, -6.2], [-1.35, 2.4, -5.2], [-1.25, 0.95, -3.55]], 0.026, 0x2b3442),
    cableMesh([[1.35, 3.92, -6.2], [1.4, 2.4, -5.2], [1.3, 0.95, -3.55]], 0.026, 0x2456a6),
  ], []);
  const ledDot = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x7ee2b8 }), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.475, 0]} receiveShadow>
        <planeGeometry args={[38, 38]} />
        <meshStandardMaterial map={ftex} roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[0, -0.52, 0]} receiveShadow>
        <boxGeometry args={[7.6, 0.1, 9.8]} />
        <meshStandardMaterial color={0xEFE8D0} roughness={0.85} metalness={0.05} envMapIntensity={0.55} />
      </mesh>
      {/* 穿孔高架地板砖（机器前方，机房叙事） */}
      <mesh position={[0, -0.445, 7.4]} receiveShadow castShadow>
        <boxGeometry args={[3.4, 0.06, 2.2]} />
        <meshStandardMaterial color={0xE9E1C9} roughness={0.9} metalness={0.03} envMapIntensity={0.55} />
      </mesh>
      <primitive object={tileTex} position={[0, -0.412, 7.4]} rotation={[-Math.PI / 2, 0, 0]} />
      {/* 远景机柜排（原有） */}
      {[-2, -1, 0, 1, 2].map(i => (
        <group key={i}>
          <mesh material={rackMat} position={[i * 5.6, 1.8, -16.5]}>
            <boxGeometry args={[2.4, 4.6, 1.4]} />
          </mesh>
          <mesh material={rackMat} position={[i * 5.6 - 2.8, 1.8, 17]} rotation={[0, Math.PI, 0]}>
            <boxGeometry args={[2.4, 4.6, 1.4]} />
          </mesh>
        </group>
      ))}
      {/* 左右邻柜（近景微缩叙事，低对比 + 微光 LED 点） */}
      {[-9.8, 9.8].map((x, si) => (
        <group key={x} position={[x, 0, -5.5]}>
          <mesh material={neighMat} position={[0, 1.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.6, 4.1, 3.0]} />
          </mesh>
          {[0.9, 1.5, 2.1, 2.7].map((y, i) => (
            <mesh key={i} material={ledDot} position={[si === 0 ? 1.31 : -1.31, y, 0.9]}>
              <boxGeometry args={[0.03, 0.05, 0.05]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* 后上方线缆桥架 + 垂落线缆 */}
      <mesh material={M.metal} position={[-3.6, 1.9, -6.2]}>
        <boxGeometry args={[0.07, 3.9, 0.07]} />
      </mesh>
      <mesh material={M.metal} position={[3.6, 1.9, -6.2]}>
        <boxGeometry args={[0.07, 3.9, 0.07]} />
      </mesh>
      <mesh material={M.metal} position={[0, 3.95, -6.2]}>
        <boxGeometry args={[7.9, 0.07, 0.5]} />
      </mesh>
      <mesh material={M.metal} position={[0, 3.83, -6.05]}>
        <boxGeometry args={[7.9, 0.05, 0.06]} />
      </mesh>
      <mesh material={M.metal} position={[0, 3.83, -6.35]}>
        <boxGeometry args={[7.9, 0.05, 0.06]} />
      </mesh>
      {trayCables.map((c, i) => <primitive key={i} object={c} />)}
    </group>
  );
}

/* ---------------- 相机总线 + 飞行 ---------------- */
function CameraRig() {
  const camera = useThree(s => s.camera);
  const controls = useThree(s => s.controls);
  const size = useThree(s => s.size);
  const gl = useThree(s => s.gl);
  useEffect(() => {
    // 原版语义：首次指针按下关闭自动旋转（一次性）
    const stop = () => { if (controls) controls.autoRotate = false; };
    gl.domElement.addEventListener('pointerdown', stop, { once: true });
    return () => gl.domElement.removeEventListener('pointerdown', stop);
  }, [gl, controls]);
  useEffect(() => {
    cameraBus.flyTo = (name) => {
      const v = VIEWS[name] || VIEWS.overview;
      camAnimRef.current = {
        t: 0, dur: 1.15,
        p0: camera.position.clone(), p1: new THREE.Vector3(...v.p),
        t0: controls ? controls.target.clone() : new THREE.Vector3(), t1: new THREE.Vector3(...v.t),
      };
      if (controls) controls.autoRotate = false;
    };
    cameraBus.camPos = () => camera.position.toArray();
    cameraBus.getAzimuth = () => (controls ? controls.getAzimuthalAngle() : 0);
    cameraBus.setControlsEnabled = (b) => { if (controls) controls.enabled = b; };
    cameraBus.rotate = (dAz) => {
      if (!controls) return;
      camAnimRef.current = null; controls.autoRotate = false;
      const off = camera.position.clone().sub(controls.target);
      const ang = Math.atan2(off.x, off.z) + dAz, r = Math.hypot(off.x, off.z);
      camera.position.x = controls.target.x + r * Math.sin(ang);
      camera.position.z = controls.target.z + r * Math.cos(ang);
    };
    cameraBus.zoomBy = (f) => {
      if (!controls) return;
      camAnimRef.current = null; controls.autoRotate = false;
      const off = camera.position.clone().sub(controls.target);
      const len = THREE.MathUtils.clamp(off.length() * f, controls.minDistance, controls.maxDistance);
      off.setLength(len);
      camera.position.copy(controls.target).add(off);
    };
    cameraBus.projectObj = (obj) => {
      const v = new THREE.Vector3();
      obj.getWorldPosition(v); v.project(camera);
      const r = gl.domElement.getBoundingClientRect();
      return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (-v.y * 0.5 + 0.5) * r.height };
    };
    cameraBus.partScreen = (k) => {
      const g = registry[k]; if (!g) return null;
      const b = new THREE.Box3().setFromObject(g);
      let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
      const v = new THREE.Vector3();
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]){
        v.set(x, y, z).project(camera);
        minx = Math.min(minx, v.x); maxx = Math.max(maxx, v.x);
        miny = Math.min(miny, v.y); maxy = Math.max(maxy, v.y);
      }
      return { wFrac: (maxx - minx) / 2, hFrac: (maxy - miny) / 2,
        cx: (minx + maxx) / 2 * 0.5 + 0.5, cy: -((miny + maxy) / 2) * 0.5 + 0.5,
        size: { w: size.width, h: size.height } };
    };
  }, [camera, controls, size]);
  useFrame((_, dtRaw) => {
    const a = camAnimRef.current; if (!a || !controls) return;
    const dt = Math.min(dtRaw, 0.05);
    a.t += dt / a.dur;
    const k = a.t >= 1 ? 1 : (1 - Math.pow(1 - a.t, 3));
    camera.position.lerpVectors(a.p0, a.p1, k);
    controls.target.lerpVectors(a.t0, a.t1, k);
    if (a.t >= 1) camAnimRef.current = null;
  });
  return null;
}

/* ---------------- 主循环 rig：分解/拖拽/导流罩联动/编号点投影 ---------------- */
/* ⚠ useFrame 一律不传 priority：R3F 中任一订阅 priority>0 会关掉自动渲染（接管渲染循环），
   场景会「逻辑全活、画面全黑」——本轮实测踩过，勿再加。 */
function SceneRig() {
  const camera = useThree(s => s.camera);
  const size = useThree(s => s.size);
  useFrame(() => {
    U.explodeCur += (U.explodeT - U.explodeCur) * 0.12;
    const e = U.explodeCur;
    if (registry.fan) registry.fan.position.z = e * 1.5;
    if (registry.disk) registry.disk.position.z = e * 2.6;
    if (registry.psu) registry.psu.position.z = e * -1.6;
    if (registry.nic) registry.nic.position.z = e * -2.4;
    (registry.drives || []).forEach((d, i) => {
      if (d) d.position.z = (S.disks[i] === 'out' ? 3.55 : 2.95) + U.dragOff[i];
    });
    (registry.fanModules || []).forEach((f, i) => {
      if (f) f.position.z = 1.5 + U.fanDragOff[i];
    });
    // 导流罩联动（原 v3 块：选中 cpu/ram 淡出掀开）
    const open = (U.selected === 'cpu' || U.selected === 'ram');
    const target = open ? 0.05 : 0.55;
    shroudState.cur += (target - shroudState.cur) * 0.25;
    [shroudMats.mat, shroudMats.labelMat].forEach(m => {
      if (m){ m.opacity = shroudState.cur; m.depthWrite = shroudState.cur > 0.3; }
    });
    if (registry.shroud)
      registry.shroud.position.y += (((open ? 0.55 : 0) + e * 0.9) - registry.shroud.position.y) * 0.25;
    if (dotUpdater.fn) dotUpdater.fn(camera, size);
  });
  return null;
}

/* ---------------- 选中高亮 ---------------- */
function Highlight({ targetKey }) {
  const scene = useThree(s => s.scene);
  const helper = useMemo(() => {
    const obj = registry[targetKey];
    return obj ? new THREE.BoxHelper(obj, 0x0D9488) : null;
  }, [targetKey]);
  useEffect(() => {
    if (!helper) return;
    scene.add(helper);
    return () => { scene.remove(helper); helper.geometry.dispose(); helper.material.dispose(); };
  }, [helper, scene]);
  useFrame(() => { if (helper) helper.update(); });
  return null;
}

export default function Scene({ mres }) {
  return (
    <>
      <color attach="background" args={[0xF6EDDD]} />
      <fog attach="fog" args={[0xF6EDDD, 19, 46]} />
      <EnvSetup />
      <Lights />
      <FloorSet />
      <group>
        <ChassisBody />
        <ChassisFrame />
        <FrontPanel powered={mres.powered} />
        <LcdPanel />
        <Board />
        <Cpus />
        <Memory />
        <Drives mres={mres} />
        <FanWall mres={mres} />
        <Psus mres={mres} />
        <Nic mres={mres} />
        <Ocp />
        <RearIo mres={mres} />
        <Riser />
        <Backplane />
        <Cmos />
        <Boss />
        <Shroud />
      </group>
      {U.selected && <Highlight targetKey={U.selected} />}
      <CameraRig />
      <SceneRig />
      <OrbitControls makeDefault target={[0, 0.2, 0]} enableDamping dampingFactor={0.08}
        maxDistance={20} minDistance={0.6} maxPolarAngle={Math.PI * 0.52}
        autoRotate autoRotateSpeed={0.7} />
    </>
  );
}
export { shroudState };
