// TopoView.jsx — 系统拓扑/原理图视图（schematic 等价物）：电源/散热/数据三路 2D 流向图。
// 节点状态色与数值全部实时读 machineModel 输出；右下角 @robin_playbooks 署名角标（讲义风小片，不压节点/连线）。
import React from 'react';
import { S, U, emit } from '../store.js';

const Flow = ({ id, d, on }) => (
  <path className={'tp-flow' + (on ? '' : ' off')} id={id} d={d}
    markerEnd={on ? 'url(#tpArr)' : 'url(#tpArrOff)'} />
);
const Node = ({ id, x, y, w, title, sub, cls = '', subId }) => (
  <g className={'tnode ' + cls} id={id}>
    <rect x={x} y={y} width={w} height="44" rx="9" />
    <text className="tt" x={x + w / 2} y={y + 20}>{title}</text>
    <text className="ts" id={subId} x={x + w / 2} y={y + 36}>{sub}</text>
  </g>
);

export default function TopoView({ mres }) {
  const powered = mres.powered;
  const psuCls = !powered ? 'off' : 'ok';
  const psu2Cls = !powered ? 'off' : S.psuCut ? 'bad' : 'ok';
  const fanCls = !powered ? 'off' : S.fanFailed ? 'bad' : 'ok';
  const cpuCls = !powered ? 'off' : mres.cpuTemp >= 90 ? 'bad' : mres.cpuTemp >= 75 ? 'warn' : 'ok';
  const arrCls = !powered ? 'off' : mres.arrayLevel === 'bad' ? 'bad' : mres.arrayLevel === 'warn' ? 'warn' : 'ok';
  const nicCls = S.bootStage >= 5 ? 'ok' : 'off';
  const half = Math.round(mres.powerW / 2);
  return (
    <div id="topoPanel" className="show">
      <div className="tp-head">
        <b>系统拓扑</b>
        <span className="tp-sub">电源 · 散热 · 数据三路流向 — 实时读模型，不是静态图</span>
        <span className="tp-x" id="topoClose" onClick={() => { U.topoOpen = false; emit(); }}>✕</span>
      </div>
      <svg id="topoSvg" viewBox="0 0 920 548" preserveAspectRatio="xMidYMid meet" aria-label="系统拓扑图">
        <defs>
          <marker id="tpArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#1AA3A1" /></marker>
          <marker id="tpArrOff" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#D6C7B3" /></marker>
        </defs>
        <text className="tp-lane" x="26" y="42">电源 POWER</text>
        <Flow id="flP1" d="M150,86 H196" on={powered} />
        <Flow id="flP2" d="M150,142 H196" on={powered && !S.psuCut} />
        <Flow id="flP3" d="M330,86 H372 V106 H404" on={powered} />
        <Flow id="flP4" d="M330,142 H372 V126 H404" on={powered && !S.psuCut} />
        <Flow id="flP5" d="M540,114 H596" on={powered} />
        <Node id="tpAc1" x={26} y={64} w={124} title="市电 A 路" sub="220V" cls={powered ? 'ok' : 'off'} />
        <Node id="tpAc2" x={26} y={120} w={124} title="市电 B 路" sub="220V" cls={powered ? (S.psuCut ? 'bad' : 'ok') : 'off'} />
        <Node id="tpPsu1" x={200} y={64} w={130} title="PSU-1" cls={psuCls}
          sub={!powered ? '未上电' : S.psuCut ? mres.powerW + ' W（全担）' : '≈' + half + ' W'} />
        <Node id="tpPsu2" x={200} y={120} w={130} title="PSU-2" cls={psu2Cls}
          sub={!powered ? '未上电' : S.psuCut ? '已断电' : '≈' + half + ' W'} />
        <Node id="tpBoardP" x={408} y={92} w={132} title="主板供电" cls={psuCls} sub={'整机 ' + mres.powerW + ' W'} />
        <Node id="tpLoad" x={600} y={92} w={150} title="整机负载" cls={psuCls}
          sub={mres.effLoad + ' %' + (mres.throttle ? ' · 降频中' : '')} />
        <text className="tp-lane" x="26" y="222">散热 AIRFLOW</text>
        <Flow id="flA1" d="M164,266 H206" on={powered && mres.fanRPM > 0} />
        <Flow id="flA2" d="M336,266 H378" on={powered && mres.fanRPM > 0} />
        <Flow id="flA3" d="M508,266 H550" on={powered && mres.fanRPM > 0} />
        <Flow id="flA4" d="M690,266 H732" on={powered && mres.fanRPM > 0} />
        <Node id="tpIn" x={26} y={244} w={138} title="冷风入口 · 前脸" sub={'室温 ' + S.ambient + ' °C'} cls={powered ? 'ok' : 'off'} />
        <Node id="tpDrv" x={210} y={244} w={126} title="硬盘仓" sub="先被吹到" cls={powered ? 'ok' : 'off'} />
        <Node id="tpFan" x={382} y={244} w={126} title="风扇墙 ×6" cls={fanCls}
          sub={powered ? mres.fanRPM.toLocaleString() + ' RPM' : '未上电'} />
        <Node id="tpCpu" x={554} y={244} w={136} title="CPU · 内存" cls={cpuCls}
          sub={powered ? mres.cpuTemp.toFixed(1) + ' °C' : '未上电'} />
        <Node id="tpOut" x={736} y={244} w={150} title="热风出口 · 后窗" sub="经 PSU / 网卡排出" cls={powered ? 'ok' : 'off'} />
        <text className="tp-lane" x="26" y="402">数据 DATA</text>
        <Flow id="flD1" d="M196,446 H238" on={powered && S.bootStage >= 4} />
        <Flow id="flD2" d="M368,446 H410" on={powered && S.bootStage >= 4} />
        <Flow id="flD3" d="M546,446 H588" on={powered && S.bootStage >= 4} />
        <Flow id="flD4" d="M718,446 H760" on={powered && S.bootStage >= 5} />
        <Node id="tpDisks" x={26} y={424} w={170} title="硬盘 ×4" cls={arrCls} sub={mres.arrayState} />
        <Node id="tpBp" x={242} y={424} w={126} title="背板" sub="SAS 12Gb/s" cls={powered && S.bootStage >= 4 ? arrCls : 'off'} />
        <Node id="tpHba" x={414} y={424} w={132} title="HBA · RAID 卡" cls={arrCls} sub={mres.arrayState} />
        <Node id="tpBoardD" x={592} y={424} w={126} title="主板 · CPU" sub="PCIe 通道" cls={powered ? 'ok' : 'off'} />
        <Node id="tpNic" x={764} y={424} w={126} title="网卡 · OCP" cls={nicCls} sub={mres.nicState} />
        <text className="tp-note" x="26" y="516">节点颜色 = 模型实时状态：绿 正常 · 黄 降级 / 重建 · 红 故障 · 灰 未上电。虚线箭头流动 = 该通路正在工作。</text>
      </svg>
      <div className="tp-badge">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        <span>@robin_playbooks</span>
      </div>
    </div>
  );
}
