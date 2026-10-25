// App.jsx — 应用组装：布局（左栏/顶栏/舞台/右列/轮播）+ 全局副作用（订阅重渲染、
// 重建计时、曲线采样、拖拽窗监听、持久化、__demo 验收/录制钩子）。
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, advance } from '@react-three/fiber';
import Scene from './Scene.jsx';
import Stage from './ui/Stage.jsx';
import { Rail, TopBar, InfoPanel, LabCard, Carousel, ConsoleCard, pushHist } from './ui/Panels.jsx';
import {
  S, U, PARTS, STEPS, LESSONS, machineModel, subscribe, emit,
  restoreProgress, saveProgress, forceSave, diffLog,
  advanceStep, selectPart, clickDisk, setLoad,
  cameraBus, registry, fanState, logLines, REC_MODE,
} from './store.js';
import { VIEWS } from './views.js';

restoreProgress();   // 首帧前恢复进度（localStorage + 分享链接，原 U9 语义）

export default function App() {
  const [, setTick] = useState(0);
  const [frameloop, setFrameloop] = useState(REC_MODE ? 'never' : 'always');
  const mres = machineModel(S);
  const mresRef = useRef(mres); mresRef.current = mres;
  const logLenRef = useRef(0);

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);
  useEffect(() => {
    saveProgress();
    diffLog(mres);
    if (logLines.length !== logLenRef.current){ logLenRef.current = logLines.length; setTick(t => t + 1); }
  });

  useEffect(() => {
    const rb = setInterval(() => {
      if (S.disks.includes('rebuild')){
        S.rebuildPct += 2.5;
        if (S.rebuildPct >= 100){
          S.disks = S.disks.map(d => d === 'rebuild' ? 'ok' : d);
          S.rebuildPct = 0;
        }
        emit();
      }
    }, 200);
    const ch = setInterval(() => pushHist(mresRef.current), 900);
    const bu = () => forceSave();
    window.addEventListener('beforeunload', bu);
    return () => { clearInterval(rb); clearInterval(ch); window.removeEventListener('beforeunload', bu); };
  }, []);

  useEffect(() => {
    const move = (e) => {
      if (!U.drag) return;
      const off = THREE.MathUtils.clamp((U.drag.startY - e.clientY) * 0.008, -1.2, 1.3);
      if (U.drag.type === 'disk') U.dragOff[U.drag.i] = off;
      else U.fanDragOff[U.drag.i] = off;
    };
    const up = () => {
      if (!U.drag) return;
      if (U.drag.type === 'disk'){
        const st = S.disks[U.drag.i];
        if (st === 'ok' && U.dragOff[U.drag.i] > 0.5) clickDisk(U.drag.i);
        else if (st === 'out' && U.dragOff[U.drag.i] < -0.5) clickDisk(U.drag.i);
        U.dragOff[U.drag.i] = 0;
      } else {
        U.fanDragOff[U.drag.i] = U.fanDragOff[U.drag.i] > 0.5 ? 0.95 : 0;
      }
      U.drag = null;
      if (cameraBus.setControlsEnabled) cameraBus.setControlsEnabled(true);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, []);

  useEffect(() => {
    window.__demo = {
      S, machineModel, advanceStep, selectPart, clickDisk, setLoad, PARTS, STEPS, LESSONS,
      flyTo: (n) => { if (cameraBus.flyTo) cameraBus.flyTo(n); },
      VIEWS,
      getFanAngle: () => fanState.angle,
      setExplode: (v) => { U.explodeT = v; const el = document.getElementById('rExplode'); if (el) el.value = v * 100; },
      getExplode: () => U.explodeCur,
      proj: (obj) => (cameraBus.projectObj ? cameraBus.projectObj(obj) : null),
      get driveGroups(){ return registry.drives; },
      get fanModules(){ return registry.fanModules; },
      getDrag: () => U.drag ? { type: U.drag.type, i: U.drag.i,
        off: U.drag.type === 'disk' ? U.dragOff[U.drag.i] : U.fanDragOff[U.drag.i] } : null,
      get MRES(){ return machineModel(S); },
      partGroups: registry,
      camPos: () => (cameraBus.camPos ? cameraBus.camPos() : null),
      partScreen: (k) => (cameraBus.partScreen ? cameraBus.partScreen(k) : null),
      U,
      toManual: () => setFrameloop('never'), toAuto: () => setFrameloop('always'),
      step: (ts) => advance(ts),
    };
  }, []);

  return (
    <div id="app">
      <svg className="traces" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="#DCCBA6" strokeWidth="1.3">
          <path d="M1152 -2 v34 h54 v26" /><circle cx="1206" cy="62" r="3.5" />
          <path d="M-2 336 h40 v46 h26" /><circle cx="68" cy="382" r="3.5" />
          <path d="M1442 742 h-56 v-40 h-30" /><circle cx="1356" cy="702" r="3.5" />
          <path d="M-2 640 h30 v-38 h34" /><circle cx="66" cy="602" r="3.5" />
        </g>
        <g fill="#DCCBA6">
          <rect x="1308" y="26" width="9" height="9" /><rect x="1322" y="26" width="9" height="9" opacity=".55" />
          <rect x="1308" y="40" width="9" height="9" opacity=".55" /><rect x="1336" y="40" width="9" height="9" opacity=".3" />
          <rect x="96" y="852" width="9" height="9" opacity=".7" /><rect x="110" y="852" width="9" height="9" opacity=".35" />
          <rect x="96" y="838" width="9" height="9" opacity=".35" />
        </g>
      </svg>
      <Rail />
      <div id="main">
        <TopBar mres={mres} />
        <div id="middle">
          <Stage mres={mres}>
            <Canvas shadows dpr={[1, 2]} frameloop={frameloop}
              camera={{ fov: 42, near: 0.1, far: 100, position: [5.0, 3.4, 6.2] }}
              gl={{ antialias: !REC_MODE }}
              onCreated={({ gl }) => { gl.toneMappingExposure = 1.06; }}>
              <Scene mres={mres} />
            </Canvas>
          </Stage>
          <aside id="rightcol">
            <InfoPanel mres={mres} />
            <LabCard mres={mres} />
            <ConsoleCard mres={mres} />
          </aside>
        </div>
        <Carousel />
      </div>
    </div>
  );
}
