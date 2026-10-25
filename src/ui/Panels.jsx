// Panels.jsx — DOM 面板群：左侧栏 / 顶栏（品牌+状态条）/ 课程信息（概览·规格）/
// 实验室 / 事件日志（Serial monitor 等价物）/ 底部课程轮播。
// UI 语言按 Learn Arduino 实测复刻（2026-10-25 返工轮）：Barlow 系字体、#CEC0AD 描边、
// 半透明卡 + 内嵌实心体、藏青 #18213D 标题、青绿 #1AA3A1 点缀。
// 全部读数只来自 props.mres（= machineModel(S)）。
import React, { useEffect, useRef, useState } from 'react';
import {
  S, U, STEPS, LESSONS, logLines, emit, selectPart, setLoad, setAmbient, setFanFailed, setPsuCut,
  clickDisk, resetArray, advanceStep, setLesson, answerMcq, cameraBus,
} from '../store.js';

export const hist = [];
export function pushHist(mres){
  if (!mres.powered) return;
  hist.push({ t: mres.cpuTemp, f: mres.fanRPM });
  if (hist.length > 56) hist.shift();
}
function drawChart(canvas){
  if (!canvas || !canvas.offsetParent) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const line = (get, max, color) => {
    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1.6;
    hist.forEach((h, i) => {
      const x = i / 55 * (canvas.width - 8) + 4, y = canvas.height - 6 - (get(h) / max) * (canvas.height - 14);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
  };
  line(h => h.t, 110, '#C0392B');
  line(h => h.f, 14800, '#1AA3A1');
}

/* ---------------- 左侧栏（样板：62px 透明栏、SVG 图标、底部竖排署名条） ---------------- */
const PART_KEYS = ['board', 'cpu', 'ram', 'disk', 'fan', 'psu', 'nic', 'panel', 'lcd', 'backplane', 'hba', 'ocp', 'rio', 'cmos', 'boss', 'shroud', 'chassis'];
const IC = {
  home: <><path d="M4 11.2 12 4l8 7.2" /><path d="M6.2 9.6V20h11.6V9.6" /><path d="M10 20v-5h4v5" /></>,
  book: <><path d="M12 6.2C10.2 4.7 7.9 4.2 4 4.2v14c3.9 0 6.2.5 8 2 1.8-1.5 4.1-2 8-2v-14c-3.9 0-6.2.5-8 2Z" /><path d="M12 6.2v14" /></>,
  chip: <><rect x="7" y="7" width="10" height="10" rx="2" /><rect x="10.4" y="10.4" width="3.2" height="3.2" /><path d="M9.5 7V4M14.5 7V4M9.5 20v-3M14.5 20v-3M7 9.5H4M7 14.5H4M20 9.5h-3M20 14.5h-3" /></>,
  sim: <><rect x="3.5" y="5" width="17" height="14" rx="3" /><path d="M10.5 9.3v5.4L15.3 12Z" fill="currentColor" stroke="none" /></>,
  globe: <><circle cx="12" cy="12" r="8.4" /><path d="M3.6 12h16.8" /><path d="M12 3.6c2.5 2.3 3.8 5.1 3.8 8.4s-1.3 6.1-3.8 8.4c-2.5-2.3-3.8-5.1-3.8-8.4s1.3-6.1 3.8-8.4Z" /></>,
};
const Icon = ({ d }) => <svg viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;
export function Rail() {
  const [act, setAct] = useState('home');
  const [expanded, setExpanded] = useState(false);
  const onAct = (a) => {
    setAct(a);
    if (a === 'home'){ if (cameraBus.flyTo) cameraBus.flyTo('overview'); }
    else if (a === 'course'){ setLesson((U.curLesson + 1) % LESSONS.length); }
    else if (a === 'parts'){
      U.partCycle = (U.partCycle + 1) % PART_KEYS.length;
      selectPart(PART_KEYS[U.partCycle], true, 'user');
    }
    else if (a === 'lab'){
      const lc = document.getElementById('labCard');
      if (lc){ lc.classList.remove('flash'); void lc.offsetWidth; lc.classList.add('flash');
        lc.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    }
  };
  const btn = (a, icon, label, title, badge) => (
    <button className={'ric' + (act === a ? ' active' : '')} data-act={a} title={title}
      onClick={() => onAct(a)}><Icon d={icon} /><span>{label}</span>{badge && <em className="ric-badge">{badge}</em>}</button>
  );
  return (
    <nav id="rail" className={expanded ? 'expanded' : ''} aria-label="主导航">
      <button className="ric" id="railMenu" title="展开/收起" onClick={() => setExpanded(e => !e)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={expanded ? 'M14.5 5.5 8 12l6.5 6.5' : 'M9.5 5.5 16 12l-6.5 6.5'} /></svg>
        <span>菜单</span>
      </button>
      {btn('home', IC.home, '首页', '首页 · 全景')}
      {btn('course', IC.book, '课程', '下一节课')}
      {btn('parts', IC.chip, '部件', '轮看部件')}
      {btn('lab', IC.sim, '实验室', '搞坏它实验室')}
      {btn('lang', IC.globe, '语言 · 中文', '语言（演示版仅中文）', '中')}
      <div className="rspacer"></div>
      <a className="credit" href="https://x.com/robin_playbooks" target="_blank" rel="noopener"
        title="X · @robin_playbooks">
        <span className="cd-by">DESIGNED BY</span><span>x.com/robin_playbooks</span>
      </a>
      <a className="ric x" href="https://x.com/robin_playbooks" target="_blank" rel="noopener" title="X · @robin_playbooks">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg><span>X</span>
      </a>
    </nav>
  );
}

/* ---------------- 顶栏（样板：品牌区 + 状态条） ---------------- */
export function TopBar({ mres }) {
  const [, setSec] = useState(0);
  useEffect(() => { const id = setInterval(() => setSec(s => s + 1), 1000); return () => clearInterval(id); }, []);
  const d = new Date(), p2 = n => String(n).padStart(2, '0');
  const done = U.lessonDone.filter(Boolean).length;
  return (
    <header id="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48"><rect x="5" y="5" width="38" height="38" rx="9" fill="none" stroke="#18213D" strokeWidth="2.6" /><rect x="12" y="15" width="17" height="5.5" rx="2.75" fill="#18213D" /><rect x="12" y="27" width="17" height="5.5" rx="2.75" fill="#18213D" /><circle cx="36.5" cy="17.7" r="2.4" fill="#1AA3A1" /><circle cx="36.5" cy="29.7" r="2.4" fill="#1AA3A1" /></svg>
        </div>
        <div className="titleblock">
          <h1>SERVER 硬件课</h1>
          <div className="sub">拆 开 · 看 懂 · 搞 坏 它</div>
        </div>
      </div>
      <div className="topspacer"></div>
      <div className="statusbar">
        <div className="progress-card">
          <div className="pc-icon"><Icon d={IC.book} /></div>
          <div className="pc-main">
            <span className="pc-label">课程进度</span>
            <div className="pc-track"><i id="learnFill" style={{ width: (done / LESSONS.length * 100) + '%' }}></i></div>
          </div>
          <span className="pc-count" id="learnText">{done}/{LESSONS.length}</span>
        </div>
        <div className="statusblock">
          <div className="statusrow">
            <span className={'sdot' + (mres.level === 'off' ? '' : ' ' + mres.level)} id="statusPill"></span>
            <span id="statusText">{mres.status}</span>
          </div>
          <div className="sb-sub">
            <span id="progText">导览 {S.bootStage} / {STEPS.length} 步</span>
            <span id="progNext"> · {S.bootStage < STEPS.length ? '下一步：' + STEPS[S.bootStage].label : '导览已走完，去实验室搞坏它 →'}</span>
          </div>
        </div>
        <div className="datetime">
          <div id="dateText">{d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate())}</div>
          <div id="timeText">{p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds())}</div>
        </div>
      </div>
    </header>
  );
}

/* ---------------- 课程信息面板（样板 info-card：tab + 内嵌体） ---------------- */
const DEFAULT_TIP = '这台 2U 服务器正在运行中（负载 60%）。想从头看一遍开机时序，点舞台左上角的「跟着开机时序走一遍」；想搞坏它，去右下角实验室。';
export function InfoPanel({ mres }) {
  const L = LESSONS[U.curLesson];
  const [mcqSel, setMcqSel] = useState(-1);
  const [mcqFb, setMcqFb] = useState(null);
  const chartRef = useRef();
  useEffect(() => { setMcqSel(-1); setMcqFb(null); }, [U.curLesson]);
  useEffect(() => { if (U.tab === 'specs') drawChart(chartRef.current); });
  const setTab = (t) => { U.tab = t; emit(); };
  const pickMcq = (i) => {
    setMcqSel(i);
    const right = answerMcq(i);
    setMcqFb({ ok: right, text: right ? L.quiz.ok : L.quiz.no });
  };
  const tab = U.tab === 'specs' ? 'specs' : 'overview';
  return (
    <div className="card" id="infoPanel">
      <div className="tabs">
        <button className={'tab' + (tab === 'overview' ? ' active' : '')} data-tab="overview" onClick={() => setTab('overview')}>概览</button>
        <button className={'tab' + (tab === 'specs' ? ' active' : '')} data-tab="specs" onClick={() => setTab('specs')}>规格</button>
      </div>
      <div className="scrollbox" id="paneOverview" style={{ display: tab === 'overview' ? '' : 'none' }}>
        <div className="tipbar"><b>运维提示</b><span id="tipText">{U.tipText || DEFAULT_TIP}</span></div>
        <div className="tour" id="tourBar">
          {STEPS.map((st, i) => (
            <button key={i} className={'step' + (i < S.bootStage ? ' done' : i === S.bootStage ? ' next' : '')}
              disabled={i !== S.bootStage} onClick={() => advanceStep(i)}>
              <span className="n">STEP {i + 1}</span>{i < S.bootStage ? '✓ ' : ''}{st.label}
            </button>
          ))}
        </div>
        <div className="lesson-body">
          <div id="lsKicker">{L.kicker}</div>
          <h2 id="lsTitle">{L.title}</h2>
          <div id="lsText">{L.paras.map((p, i) => <p key={i}>{p}</p>)}</div>
          <div className="guide-btns" id="lsGuide">
            <span style={{ fontSize: '12.5px', color: 'var(--mut)', alignSelf: 'center' }}>导览：</span>
            {L.guide.map(([part, label]) => (
              <button key={part + label} className="gbtn" onClick={() => selectPart(part, true)}>{label}</button>
            ))}
          </div>
          <div className="quiz" id="quizBox">
            <div className="q"><span className="tag">互动题</span>{L.quiz.q}</div>
            {L.quiz.type === 'mcq' && L.quiz.opts.map((o, i) => (
              <button key={i} className={'opt' + (mcqSel === i ? (mcqFb && mcqFb.ok ? ' right' : ' wrong') : '')}
                data-i={i} onClick={() => pickMcq(i)}>{o}</button>
            ))}
            {L.quiz.type === 'mcq' && mcqFb && (
              <div className={'qfb show ' + (mcqFb.ok ? 'ok' : 'no')} id="qfb">{(mcqFb.ok ? '✓ ' : '✗ ') + mcqFb.text}</div>
            )}
            {L.quiz.type === 'click' && U.quizFb && (
              <div className={'qfb show ' + (U.quizFb.ok ? 'ok' : 'no')} id="qfb">{(U.quizFb.ok ? '✓ ' : '✗ ') + U.quizFb.text}</div>
            )}
          </div>
          <div className="bigidea"><b>BIG IDEA</b><span id="lsIdea">{L.idea}</span></div>
          <div className="foot-idea"><b>整机 BIG IDEA</b>服务器的一切状态最终都会写在三个地方：温度、功耗、指示灯——读懂它们，就等于让机器亲口告诉你它哪里疼。</div>
          <div className="foot-note">演示版 · 3D 为风格化教学示意（已拆去顶盖便于观察），非精确工程建模 · 所有读数由同一纯函数模型实时计算 · React + three.js 本地打包，可离线打开</div>
        </div>
      </div>
      <div className="scrollbox" id="paneSpecs" style={{ display: tab === 'specs' ? '' : 'none' }}>
        <div className="gauge"><div className="row"><span>整机功耗</span><span className="val" id="gPowerV">{mres.powered ? mres.powerW + ' W' : '未上电'}</span></div>
          <div className="bar"><i id="gPower" style={{ width: Math.min(100, mres.powerW / 900 * 100) + '%', background: mres.powerW > 620 ? 'var(--red)' : mres.powerW > 450 ? 'var(--amber)' : 'var(--teal)' }}></i></div></div>
        <div className="gauge"><div className="row"><span>CPU 温度</span><span className="val" id="gTempV">{mres.powered ? mres.cpuTemp.toFixed(1) + ' °C' : '—'}</span></div>
          <div className="bar"><i id="gTemp" style={{ width: Math.min(100, mres.cpuTemp / 110 * 100) + '%', background: mres.cpuTemp >= 90 ? 'var(--red)' : mres.cpuTemp >= 75 ? 'var(--amber)' : 'var(--green)' }}></i></div></div>
        <div className="gauge"><div className="row"><span>风扇转速</span><span className="val" id="gFanV">{mres.powered ? mres.fanRPM.toLocaleString() + ' RPM' : '—'}</span></div>
          <div className="bar"><i id="gFan" style={{ width: (mres.fanRPM / 14800 * 100) + '%', background: 'var(--teal)' }}></i></div></div>
        <div className="kv"><span>阵列状态</span><b id="gArray" style={{ color: mres.arrayLevel === 'ok' ? 'var(--green)' : mres.arrayLevel === 'warn' ? 'var(--amber)' : mres.arrayLevel === 'bad' ? 'var(--red)' : 'var(--mut)' }}>{mres.arrayState}</b></div>
        <div className="kv"><span>供电</span><b id="gPsu" style={{ color: S.psuCut && mres.powered ? 'var(--amber)' : '' }}>{mres.psuState}</b></div>
        <div className="kv"><span>网络链路</span><b id="gNic">{mres.nicState}</b></div>
        <div className="kv"><span>有效负载</span><b id="gLoad">{mres.powered ? mres.effLoad + ' %' + (mres.throttle ? '（降频中）' : '') : '—'}</b></div>
        <canvas id="chart" width="300" height="74" ref={chartRef}></canvas>
        <div className="legend"><span><i style={{ background: '#C0392B' }}></i>CPU 温度</span><span><i style={{ background: '#1AA3A1' }}></i>风扇转速</span></div>
        <div className="foot-note">仪表、曲线、3D 指示灯与风扇转速全部只读同一个纯函数模型 machineModel——同样的输入必然同样的输出，数字不可能互相矛盾。</div>
      </div>
    </div>
  );
}

/* ---------------- 事件日志（样板 console 条：Serial monitor 的服务器等价物） ---------------- */
export function ConsoleCard({ mres }) {
  const logRef = useRef();
  useEffect(() => { const el = logRef.current; if (el) el.scrollTop = el.scrollHeight; }, [logLines.length]);
  return (
    <div className="card" id="consoleCard">
      <div className="console-head">
        <span className="console-title">事件日志</span>
        <span className="console-status">{mres.status}</span>
      </div>
      <div id="eventLog" className="evlog" ref={logRef}>
        {logLines.map((l, i) => (
          <div key={i}><span className="et">{l.t}</span><span className={l.cls}>{l.text}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 实验室（样板 code-card 语言：浅卡 + 内胆 + 藏青运行钮） ---------------- */
function raidView(mres){
  const outN = S.disks.filter(d => d === 'out').length;
  const rebuilding = S.disks.includes('rebuild');
  if (!mres.powered) return { st: '阵列未上电', color: '#686C73', barW: '0%', barC: '#A79E83',
    desc: '先在上方导览走完第 1 步上电，阵列才会上线——拔插盘的动作现在就可以预演，上电后状态会按模型实时结算。' };
  if (outN >= 2) return { st: '阵列失效 · 数据丢失', color: '#C0392B', barW: '6%', barC: '#C0392B',
    desc: 'RAID 5 只容忍一块盘故障。第二块盘离线后，校验信息不足以重构数据——这就是"降级必须当 P0 处理"的原因。点「复位阵列」重新来过。' };
  if (rebuilding) return { st: '重建中 ' + Math.floor(S.rebuildPct) + '%', color: '#B96A00', barW: S.rebuildPct + '%', barC: '#B96A00',
    desc: U.raidNote || '新盘已插入，控制器正把其余 3 块盘的数据和校验信息逐条算回新盘。重建期间阵列仍可读写但没有冗余——这段时间最怕第二块盘出事，手别贱。' };
  if (outN === 1) return { st: '降级运行', color: '#B96A00', barW: '72%', barC: '#B96A00',
    desc: '一块盘已离线，数据靠其余盘的校验信息实时重构，业务不中断——但冗余已经用完。点一次拔出的盘位，把新盘插回去开始重建。' };
  return { st: '阵列在线 · 健康', color: '#2F9E44', barW: '100%', barC: '#2F9E44',
    desc: '4 块盘组 RAID 5，全部健康。点任意一块盘把它「拔掉」，看阵列状态和右侧仪表怎么变。' };
}
export function LabCard({ mres }) {
  const rv = raidView(mres);
  return (
    <div className="card lab" id="labCard">
      <div className="lab-head">
        <h3>自由练习 · 搞坏它实验室</h3>
        <button className="btn-ghost" id="raidReset" title="复位阵列" onClick={resetArray}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5v6h6" /><path d="M5.2 11a8 8 0 1 1-1.2 5.2" /></svg>
        </button>
        <button className="btn-run" id="labFull" title="把业务负载拉满做压测" onClick={() => setLoad(100)}>
          <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.5v9l8-4.5Z" /></svg>满载压测
        </button>
      </div>
      <div className="scrollbox">
        <div className="lab-inner">
          <label>业务负载 <output id="oLoad">{S.load}%</output></label>
          <input type="range" id="rLoad" min="0" max="100" value={S.load}
            onInput={(e) => setLoad(+e.target.value)} onChange={() => {}} />
          <label>机房室温 <output id="oAmb">{S.ambient}°C</output></label>
          <input type="range" id="rAmb" min="18" max="40" value={S.ambient}
            onInput={(e) => setAmbient(+e.target.value)} onChange={() => {}} />
          <div className="switchrow"><span>风扇组故障（停转一组）</span>
            <label className="sw"><input type="checkbox" id="swFan" checked={S.fanFailed}
              onChange={(e) => setFanFailed(e.target.checked)} /><span className="tr"></span></label></div>
          <div className="switchrow"><span>断开一路市电（PSU-2）</span>
            <label className="sw"><input type="checkbox" id="swPsu" checked={S.psuCut}
              onChange={(e) => setPsuCut(e.target.checked)} /><span className="tr"></span></label></div>
          <div className="labnote">所有开关和滑杆都只改「模型输入」，仪表、3D 里的风扇转速、指示灯会自己按模型重算——把负载拉满再关掉风扇组，看温度怎么爬、风扇怎么吼。</div>
        </div>
        <div className="subh">模拟器 · RAID 5 硬盘故障</div>
        <div className="lab-inner">
          <div className="disks" id="raidDisks">
            {S.disks.map((d, i) => (
              <div key={i} className={'disk' + (d === 'out' ? ' out' : d === 'rebuild' ? ' rebuild' : '') +
                  (mres.arrayLevel === 'bad' && d !== 'out' ? ' failed' : '')}
                onClick={() => clickDisk(i)}>
                <div className="face"></div><div className="nm">盘 {i + 1}</div>
                <div className="cap">{d === 'out' ? '已拔出' : d === 'rebuild' ? '重建中' : '2TB SSD · 在线'}</div>
              </div>
            ))}
          </div>
          <div className="arraybar"><i id="raidBar" style={{ width: rv.barW, background: rv.barC }}></i></div>
          <div className="raid-status" id="raidStatus" style={{ color: rv.color }}>{rv.st}</div>
          <div className="raid-desc" id="raidDesc">{rv.desc}</div>
          <div className="labnote">拔掉的盘再点一次 = 换上新盘开始重建；重建或降级期间再拔第二块，后果自己看。这就是导览第 4 步那句提示的实证。复位用卡片右上角的 ⟲。</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 底部课程轮播（样板 LESSONS 行：线稿缩略图 + 标题 + 完成点 + 箭头） ---------------- */
const THUMB_PROPS = { viewBox: '0 0 56 64', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const THUMBS = [
  <svg {...THUMB_PROPS}><rect x="9" y="9" width="38" height="46" rx="4" /><path d="M15 24h26M15 34h26M15 44h26" /><circle cx="41" cy="16.5" r="1.8" fill="currentColor" stroke="none" /><rect x="14" y="14" width="9" height="4.5" rx="1" /></svg>,
  <svg {...THUMB_PROPS}><rect x="6" y="9" width="17" height="17" rx="2" /><path d="M11 17.5h7" /><path d="M31 9v17M37.5 9v17M44 9v17" /><rect x="6" y="37" width="44" height="15" rx="3" /><circle cx="43.5" cy="44.5" r="1.8" fill="currentColor" stroke="none" /></svg>,
  <svg {...THUMB_PROPS}><path d="M28 8 53 50H3Z" /><path d="M28 23v11" /><circle cx="28" cy="42" r="1.9" fill="currentColor" stroke="none" /></svg>,
  <svg {...THUMB_PROPS}><path d="M8 10h40" /><path d="M13 10v36M23 10v36M33 10v36M43 10v36" /><path d="M9 54h9M38 54h9" /></svg>,
  <svg {...THUMB_PROPS}><rect x="7" y="10" width="19" height="19" rx="3" /><rect x="30" y="10" width="19" height="19" rx="3" /><rect x="7" y="33" width="19" height="19" rx="3" /><rect x="30" y="33" width="19" height="19" rx="3" /><circle cx="16.5" cy="19.5" r="2" /><circle cx="39.5" cy="42.5" r="2" /></svg>,
  <svg {...THUMB_PROPS}><circle cx="24" cy="24" r="13" /><path d="M33.5 33.5 49 49" /><path d="M18.5 20.5h11M18.5 27.5h11" /></svg>,
];
export function Carousel() {
  const scrollBy = (dx) => {
    const el = document.getElementById('lessonList');
    if (el) el.scrollBy({ left: dx, behavior: 'smooth' });
  };
  const share = () => {
    const u = new URL(location.href); u.search = ''; u.hash = '';
    u.searchParams.set('lesson', U.curLesson + 1); u.searchParams.set('step', S.bootStage);
    const btn = document.getElementById('shareBtn');
    const doneFn = () => { if (btn){ btn.textContent = '已复制 ✓';
      setTimeout(() => { btn.textContent = '复制分享链接'; }, 1600); } };
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(u.toString()).then(doneFn, doneFn);
    else doneFn();
  };
  return (
    <section id="carouselWrap">
      <div className="car-head">
        <h2 className="lessons-label">课程 · Lessons</h2>
        <button className="share-btn" id="shareBtn" onClick={share}>复制分享链接</button>
      </div>
      <div className="car-row">
        <button className="carbtn" id="carPrev" title="向左滚动课程" onClick={() => scrollBy(-284)}>‹</button>
        <div id="lessonList">
          {LESSONS.map((L, i) => (
            <div key={i} className={'lcard' + (i === U.curLesson ? ' active' : '')}
              onClick={() => setLesson(i)}
              title={L.quiz.type === 'click' ? '动手题 · 在模型里点出部件' : '判断题 · 读状态做决策'}>
              <span className={'ldone' + (U.lessonDone[i] ? ' done' : '')}></span>
              <div className="lthumb">{THUMBS[i % THUMBS.length]}</div>
              <div style={{ minWidth: 0 }}>
                <div className="lt">{i + 1}. {L.title}</div>
              </div>
              <span className="lchev">›</span>
            </div>
          ))}
        </div>
        <button className="carbtn" id="carNext" title="向右滚动课程" onClick={() => scrollBy(284)}>›</button>
      </div>
    </section>
  );
}
