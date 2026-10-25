// store.js — 全局状态中枢（类原版架构：可变 S 输入 + 纯函数模型 + 变更函数统一 emit）。
// 纪律：读数只来自 machineModel(S)；这里只存输入与 UI 运行态。
import { S, machineModel } from './model.js';
import { PARTS, STEPS, LESSONS } from './data.js';
export { S, machineModel, PARTS, STEPS, LESSONS };

/* ---------------- 录制模式（?rec：关 MSAA、降阴影图；原版同口径） ---------------- */
export const REC_MODE = new URLSearchParams(location.search).has('rec');

/* ---------------- UI 运行态 ---------------- */
export const U = {
  selected: null,
  curLesson: 0,
  lessonDone: LESSONS.map(() => false),
  quizClickArmed: false,
  quizFb: null,            // {ok:bool, text} 互动题反馈（click 型）
  inviteDismissed: false,
  tipText: null,           // 导览提示覆盖文案（null = 默认）
  partCycle: -1,
  explodeT: 0, explodeCur: 0,
  dragOff: [0, 0, 0, 0],
  fanDragOff: [0, 0, 0, 0, 0, 0],
  drag: null,
  raidNote: null,
  topoOpen: false,
  tab: 'overview',
  railExpanded: false,
};
U.quizClickArmed = LESSONS[0].quiz.type === 'click';

/* ---------------- 订阅 ---------------- */
const subs = new Set();
export function emit(){ subs.forEach(f => f()); }
export function subscribe(fn){ subs.add(fn); return () => subs.delete(fn); }

/* ---------------- 3D 注册表与相机总线（Scene 注入实现） ---------------- */
export const registry = {};            // key -> THREE.Group；另有 drives[] / fanModules[]
export const cameraBus = { flyTo: null, camPos: null, partScreen: null, getAzimuth: null };
export const fanState = { angle: 0 };
export const dotUpdater = { fn: null };   // Stage 注册：(camera, size) => void

/* ---------------- 事件日志（Serial monitor 等价物：全部由状态 diff 生成） ---------------- */
export const logLines = [];
const T0 = Date.now();
export function logStamp(){
  const s = Math.floor((Date.now() - T0) / 1000);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}
export function logEvent(text, cls = ''){
  logLines.push({ t: logStamp(), cls, text });
  if (logLines.length > 60) logLines.shift();
}
let prevSnap = null;
export function diffLog(mres){
  const snap = {
    boot: S.bootStage, disks: S.disks.join(','), fanFailed: S.fanFailed, psuCut: S.psuCut,
    throttle: mres.throttle, over: mres.cpuTemp >= 102 && mres.powered,
    level: mres.arrayLevel, rebuildPct: S.rebuildPct,
    done: U.lessonDone.filter(Boolean).length,
  };
  if (!prevSnap){
    prevSnap = snap;
    if (mres.powered) logEvent('系统运行中 · ' + mres.status + ' · ' + mres.powerW + ' W / ' + mres.cpuTemp.toFixed(1) + ' °C（BMC 事件日志已同步）', 'ok');
    return;
  }
  const p = prevSnap; prevSnap = snap;
  if (snap.boot > p.boot){
    for (let i = p.boot; i < snap.boot; i++)
      logEvent('[POST ' + (i + 1) + '/6] ' + STEPS[i].label + '完成 · 整机 ' + mres.powerW + ' W / 风扇 ' + mres.fanRPM.toLocaleString() + ' RPM', 'ok');
  }
  if (snap.boot < p.boot) logEvent('回到未上电状态 · BMC 保持待机', 'warn');
  const pd = p.disks.split(','), nd = snap.disks.split(',');
  nd.forEach((d, i) => {
    if (pd[i] === d) return;
    if (d === 'out') logEvent('硬盘 ' + (i + 1) + ' 已离线（热拔出）· 阵列 ' + mres.arrayState, 'warn');
    if (d === 'rebuild') logEvent('硬盘 ' + (i + 1) + ' 新盘插入 · 开始重建', 'warn');
    if (d === 'ok' && pd[i] === 'rebuild') logEvent('硬盘 ' + (i + 1) + ' 重建完成 · 阵列恢复冗余', 'ok');
    if (d === 'ok' && pd[i] === 'out') logEvent('硬盘 ' + (i + 1) + ' 已复位在位', 'ok');
  });
  if (snap.level !== p.level){
    if (snap.level === 'bad') logEvent('⚠ 阵列失效 · 数据丢失（校验信息不足）', 'bad');
    else if (snap.level === 'warn' && p.level === 'bad') logEvent('阵列状态更新 · ' + mres.arrayState, 'warn');
  }
  if (snap.rebuildPct >= 50 && p.rebuildPct < 50 && S.disks.includes('rebuild'))
    logEvent('重建进度 50% · 阵列仍无冗余', '');
  if (snap.fanFailed !== p.fanFailed)
    logEvent(snap.fanFailed ? '⚠ 风扇组故障：2 号模块停转 · 其余模块提速补偿 · CPU ' + mres.cpuTemp.toFixed(1) + ' °C' : '风扇组故障已清除 · 转速恢复 ' + mres.fanRPM.toLocaleString() + ' RPM', snap.fanFailed ? 'bad' : 'ok');
  if (snap.psuCut !== p.psuCut)
    logEvent(snap.psuCut ? '⚠ PSU-2 市电断开 · 单路供电（冗余已失）· 整机功耗不变 ' + mres.powerW + ' W' : 'PSU-2 市电恢复 · 1+1 冗余正常', snap.psuCut ? 'warn' : 'ok');
  if (snap.throttle && !p.throttle) logEvent('⚠ CPU 温度 ' + mres.cpuTemp.toFixed(1) + ' °C ≥ 90 °C · 触发降频保护', 'bad');
  if (!snap.throttle && p.throttle && mres.powered) logEvent('CPU 温度回落至 ' + mres.cpuTemp.toFixed(1) + ' °C · 降频解除', 'ok');
  if (snap.over && !p.over) logEvent('⛔ CPU 温度 ≥ 102 °C · 过热保护停机（仅 BMC 在线）', 'bad');
  if (snap.done > p.done) logEvent('课程完成 · 已学 ' + snap.done + ' / ' + LESSONS.length + ' 节', 'ok');
}

/* ---------------- 变更函数（原版语义逐一对应） ---------------- */
export function setLoad(v){ S.load = v; emit(); }
export function setAmbient(v){ S.ambient = v; emit(); }
export function setFanFailed(b){ S.fanFailed = b; emit(); }
export function setPsuCut(b){ S.psuCut = b; emit(); }

export function selectPart(k, fly = false, via = 'prog'){
  if (U.quizClickArmed && via === 'user'){ judgeClickQuiz(k); return; }
  U.selected = k;
  if (fly && cameraBus.flyTo){
    const p = PARTS[k];
    cameraBus.flyTo(via === 'user' && p.zoom ? p.zoom : p.cam);
  }
  emit();
}
export function closeInfo(){ U.selected = null; emit(); }

export function judgeClickQuiz(k){
  const L = LESSONS[U.curLesson];
  if (!L || L.quiz.type !== 'click') return;
  if (k === L.quiz.part){
    U.quizClickArmed = false;
    U.quizFb = { ok: true, text: L.quiz.ok };
    if (!U.lessonDone[U.curLesson]){ U.lessonDone[U.curLesson] = true; }
    selectPart(k, true);
    U.quizClickArmed = false;
  } else {
    U.quizFb = { ok: false, text: L.quiz.no };
  }
  emit();
}
export function answerMcq(i){
  const L = LESSONS[U.curLesson];
  if (!L || L.quiz.type !== 'mcq') return false;
  const right = i === L.quiz.answer;
  if (right && !U.lessonDone[U.curLesson]) U.lessonDone[U.curLesson] = true;
  emit();
  return right;
}

export function advanceStep(i){
  if (i !== S.bootStage) return;
  const st = STEPS[i];
  S.bootStage = i + 1;
  if (st.apply) st.apply({ setLoad });
  U.tipText = S.bootStage === STEPS.length
    ? st.tip + ' ——开机时序走完，现在去「搞坏它」实验室拉满负载、关掉风扇组，或者在实验室里拔一块盘，验证你刚才读到的每个数字。'
    : st.tip;
  selectPart(st.part, true);
  emit();
}
export function startTour(){
  U.inviteDismissed = false;
  S.bootStage = 0; S.fanFailed = false; S.psuCut = false;
  S.disks = ['ok', 'ok', 'ok', 'ok']; S.rebuildPct = 0;
  S.load = 35;
  U.tipText = '这是一台拆去顶盖的 2U 机架服务器。点下方第一步「上电自检」，跟着开机时序走一遍——每一步都会把视角和仪表带到对应的部件。';
  emit();
}
export function setLesson(i){
  U.curLesson = i;
  U.quizFb = null;
  U.quizClickArmed = LESSONS[i].quiz.type === 'click';
  emit();
}

export function clickDisk(i){
  const d = S.disks[i];
  if (d === 'ok'){ S.disks[i] = 'out'; U.raidNote = null; }
  else if (d === 'out'){
    if (S.disks.includes('rebuild')){
      U.raidNote = '已经有一块盘在重建了——真实阵列也是串行重建的，等它完成再插下一块。';
      logEvent('已有一块盘在重建 · 阵列串行重建中，暂不能再插盘', 'warn');
      emit(); return;
    }
    S.disks[i] = 'rebuild'; S.rebuildPct = 0; U.raidNote = null;
  }
  emit();
}
export function resetArray(){ S.disks = ['ok', 'ok', 'ok', 'ok']; S.rebuildPct = 0; U.raidNote = null; emit(); }

/* ---------------- 持久化（U9 原样：localStorage + 分享链接） ---------------- */
const SAVE_KEY = 'serverCourse.v1';
let saveLastAt = 0;
export function saveProgress(){
  const now = Date.now(); if (now - saveLastAt < 400) return; saveLastAt = now;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({
    bootStage: S.bootStage, load: S.load, ambient: S.ambient,
    fanFailed: S.fanFailed, psuCut: S.psuCut, disks: S.disks,
    curLesson: U.curLesson, lessonDone: U.lessonDone })); } catch (e) {}
}
export function forceSave(){ saveLastAt = 0; saveProgress(); }
export function restoreProgress(){
  let data = null;
  try { data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) {}
  if (data){
    if (Number.isInteger(data.bootStage)) S.bootStage = Math.min(6, Math.max(0, data.bootStage));
    if (typeof data.load === 'number') S.load = Math.min(100, Math.max(0, data.load));
    if (typeof data.ambient === 'number') S.ambient = Math.min(40, Math.max(18, data.ambient));
    S.fanFailed = !!data.fanFailed; S.psuCut = !!data.psuCut;
    if (Array.isArray(data.disks) && data.disks.length === 4)
      S.disks = data.disks.map(d => d === 'out' ? 'out' : 'ok');
    if (Number.isInteger(data.curLesson)) U.curLesson = Math.min(LESSONS.length - 1, Math.max(0, data.curLesson));
    if (Array.isArray(data.lessonDone)) data.lessonDone.forEach((v, i) => { if (i < U.lessonDone.length) U.lessonDone[i] = !!v; });
  }
  const q = new URLSearchParams(location.search);
  if (q.has('lesson')){ const n = parseInt(q.get('lesson'), 10);
    if (!isNaN(n)) U.curLesson = Math.min(LESSONS.length - 1, Math.max(0, n - 1)); }
  if (q.has('step')){ const n = parseInt(q.get('step'), 10);
    if (!isNaN(n)){ S.bootStage = Math.min(6, Math.max(0, n));
      if (S.bootStage >= 6 && !data) S.load = 85; } }
  U.quizClickArmed = LESSONS[U.curLesson].quiz.type === 'click';
}
