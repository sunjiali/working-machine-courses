// Stage.jsx — 舞台 DOM 层：编号点、信息卡、导览邀请、工具条、分解条、小地图、拓扑浮层挂载。
// 编号点/信息卡的逐帧投影定位由 dotUpdater 完成（Scene rig 每帧调用），与原版 updateDots 同算法。
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  S, U, PARTS, emit, selectPart, closeInfo, startTour, cameraBus, dotUpdater,
} from '../store.js';
import TopoView from './TopoView.jsx';

const anchors = {};
Object.entries(PARTS).forEach(([k, p]) => { anchors[k] = new THREE.Vector3(...p.dot); });
const _v = new THREE.Vector3();

export default function Stage({ mres, children }) {
  const viewportRef = useRef();
  const dotEls = useRef({});
  const cardRef = useRef();
  const lineRef = useRef();

  useEffect(() => {
    dotUpdater.fn = (camera, size) => {
      const vp = viewportRef.current; if (!vp) return;
      const w = size.width, h = size.height;
      const proj = (k) => {
        _v.copy(anchors[k]).project(camera);
        if (_v.z > 1 || _v.z < -1) return null;
        return { x: (_v.x * 0.5 + 0.5) * w, y: (-_v.y * 0.5 + 0.5) * h };
      };
      for (const k of Object.keys(PARTS)){
        const el = dotEls.current[k]; if (!el) continue;
        const pt = proj(k);
        if (!pt){ el.style.display = 'none'; continue; }
        el.style.display = 'flex';
        el.style.left = pt.x + 'px';
        el.style.top = pt.y + 'px';
      }
      const card = cardRef.current, line = lineRef.current;
      if (U.selected && card && card.classList.contains('show')){
        const pt = proj(U.selected);
        if (pt){
          const cw = card.offsetWidth, ch = card.offsetHeight;
          let cx = pt.x < w / 2 ? pt.x + 32 : pt.x - cw - 32;
          let cy = pt.y - ch / 2;
          cx = Math.max(8, Math.min(w - cw - 8, cx));
          cy = Math.max(8, Math.min(h - ch - 8, cy));
          card.style.left = cx + 'px';
          card.style.top = cy + 'px';
          const ex = pt.x < cx + cw / 2 ? cx : cx + cw;
          line.setAttribute('x1', pt.x); line.setAttribute('y1', pt.y);
          line.setAttribute('x2', ex); line.setAttribute('y2', cy + ch / 2);
          line.style.opacity = 1;
        } else if (line) line.style.opacity = 0;
      } else if (line) line.style.opacity = 0;
    };
    return () => { dotUpdater.fn = null; };
  }, []);

  const sel = U.selected ? PARTS[U.selected] : null;
  const dotCls = (k) => {
    let c = 'hdot' + (U.selected === k ? ' sel' : '');
    if (k === 'disk') c += mres.arrayLevel === 'bad' ? ' bad' : mres.arrayLevel === 'warn' ? ' warn' : '';
    if (k === 'psu' && S.psuCut && mres.powered) c += ' warn';
    if (k === 'fan' && S.fanFailed && mres.powered) c += ' bad';
    return c;
  };

  return (
    <section id="stage">
      <div className="viewport" id="viewport" ref={viewportRef}>
        {children}
        <svg id="leaderSvg"><line ref={lineRef} id="leaderLine" x1="0" y1="0" x2="0" y2="0" /></svg>
        <div id="dots">
          {Object.entries(PARTS).map(([k, p], i) => (
            <div key={k} className={dotCls(k)} title={p.n}
              ref={(el) => { if (el) dotEls.current[k] = el; }}
              onClick={() => selectPart(k, true, 'user')}>{i + 1}</div>
          ))}
        </div>
        <div className={'infocard' + (sel ? ' show' : '')} id="infoCard" ref={cardRef}>
          <span className="x" id="infoClose" onClick={closeInfo}>✕</span>
          <div className="ic-ic" id="icIcon">{sel ? (sel.icon || '🖥️') : ''}</div>
          <h4><span id="icName">{sel ? sel.n : ''}</span><span className="en" id="icEn">{sel ? sel.en : ''}</span></h4>
          <p id="icText">{sel ? sel.text : ''}</p>
          <div className="sym" id="icSym">{sel ? sel.sym : ''}</div>
          {sel && (
            <button className="ic-back" id="icBack"
              onClick={() => { closeInfo(); if (cameraBus.flyTo) cameraBus.flyTo('overview'); }}>
              ⤢ 返回全景
            </button>
          )}
        </div>
        <div className="hint">拖动旋转 · 滚轮缩放 · 点部件或编号点看特写</div>
        <div id="tourInvite" className={S.bootStage >= 6 && !U.inviteDismissed ? 'show' : ''}
          style={{ display: S.bootStage >= 6 && !U.inviteDismissed ? 'flex' : 'none' }}>
          <span>🚀 <b>第一次来？</b></span>
          <button id="tiStart" onClick={startTour}>跟着开机时序走一遍</button>
          <button id="tiHide" className="ghost"
            onClick={() => { U.inviteDismissed = true; emit(); }}>先自己逛逛</button>
        </div>
        <div className="toolbar">
          <button id="tbLeft" title="左转" onClick={() => cameraBus.rotate && cameraBus.rotate(-0.42)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5v6h6" /><path d="M5.4 11a8 8 0 1 1-1.4 5" /></svg>
          </button>
          <button id="tbRight" title="右转" onClick={() => cameraBus.rotate && cameraBus.rotate(0.42)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 5v6h-6" /><path d="M18.6 11a8 8 0 1 0 1.4 5" /></svg>
          </button>
          <button id="tbOut" title="缩小" onClick={() => cameraBus.zoomBy && cameraBus.zoomBy(1.28)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg>
          </button>
          <button id="tbIn" title="放大" onClick={() => cameraBus.zoomBy && cameraBus.zoomBy(0.78)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" /></svg>
          </button>
          <span className="tsep"></span>
          <button id="tbReset" title="重置视角" onClick={() => cameraBus.flyTo && cameraBus.flyTo('overview')}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" /></svg>
          </button>
          <button id="tbTopo" title="系统拓扑图（电源 / 散热 / 数据）"
            onClick={() => { U.topoOpen = true; emit(); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2.2" /><circle cx="19" cy="6" r="2.2" /><circle cx="19" cy="18" r="2.2" /><path d="M7.2 11l9.6-4M7.2 13l9.6 4" /></svg>
          </button>
        </div>
        <div id="explodeBar">
          <span>分解视图</span>
          <input type="range" id="rExplode" min="0" max="100" defaultValue="0"
            onInput={(e) => { U.explodeT = +e.target.value / 100; }} />
          <span className="eb-hint">盘与风扇可拖出</span>
        </div>
        {U.topoOpen && <TopoView mres={mres} />}
      </div>
    </section>
  );
}
