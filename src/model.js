// model.js — 从现行单文件原样搬入（纯函数，零改动）
export const S = {
  bootStage: 6,                 // 开机导览走到第几步 0..6（默认已开机运行，U2：首帧即运行中）
  load: 60,                     // 业务负载滑杆 %
  ambient: 24,                  // 机房室温 ℃
  fanFailed: false,             // 风扇组故障开关
  psuCut: false,                // 断开一路市电
  disks: ['ok','ok','ok','ok'], // ok | out | rebuild
  rebuildPct: 0,                // 重建进度（作为模型输入，由计时器推进）
};

/* ============================================================
   2) 唯一的模型：纯函数。同样的输入必然同样的输出，
      仪表 / 指示灯 / 风扇转速 / 阵列状态全部只读它的结果。
   ============================================================ */
export function machineModel(inp){
  const powered  = inp.bootStage >= 1;
  const fansOn   = inp.bootStage >= 3;
  const online   = inp.bootStage >= 6;
  // 有效负载：没走完开机时序前只有自检/待机负载
  const effLoad  = !powered ? 0 : (online ? inp.load : Math.min(inp.load, 10));

  // ---- 阵列 ----
  const outN     = inp.disks.filter(d => d === 'out').length;
  const rebdN    = inp.disks.filter(d => d === 'rebuild').length;
  let arrayState = '未上电', arrayLevel = 'off';
  if (powered){
    if (outN >= 2){ arrayState = '失效 · 数据丢失'; arrayLevel = 'bad'; }
    else if (rebdN > 0){ arrayState = '重建中 ' + Math.floor(inp.rebuildPct) + '%'; arrayLevel = 'warn'; }
    else if (outN === 1){ arrayState = '降级运行'; arrayLevel = 'warn'; }
    else { arrayState = '在线'; arrayLevel = 'ok'; }
  }

  // ---- 散热：先按负载估算发热 → 风扇控制器定转速 → 反算稳态温度 ----
  const airflow  = inp.fanFailed ? 0.58 : 1.0;             // 一组风扇停转，风道只剩约六成
  let fanRPM = 0;
  if (powered && fansOn){
    const heatGuess = inp.ambient + 5 + effLoad * 0.72;    // 无散热时的温度估计
    let duty = 0.16 + Math.max(0, heatGuess - 42) / 58;    // 温控曲线
    duty = Math.min(1, Math.max(0.16, duty));
    if (inp.fanFailed) duty = Math.min(1, duty * 1.3);     // 其余风扇 overspeed 补偿
    fanRPM = Math.round(2400 + duty * (14800 - 2400));
  }
  const cooling  = (fanRPM / 14800) * 31 * airflow;
  const cpuTemp  = !powered ? inp.ambient
                 : Math.round((inp.ambient + 4 + effLoad * 0.79 - cooling) * 10) / 10;

  // ---- 功耗 ----
  const diskIn   = inp.disks.filter(d => d !== 'out').length;
  let powerW;
  if (!powered) powerW = 0;
  else if (cpuTemp >= 102) powerW = 11;                    // 过热保护停机，只剩管理口
  else powerW = Math.round(66 + effLoad * 2.05 + diskIn * 7.5
              + Math.pow(fanRPM / 14800, 2) * 36 + 16);

  // ---- 供电 / 网络 ----
  const psuState = !powered ? '未上电'
                 : inp.psuCut ? '单路供电 · 冗余已失' : '双路冗余';
  const nicState = inp.bootStage >= 5 ? '2 × 10GbE 已连接' : (powered ? '未接入' : '—');

  // ---- 整机状态（优先级：停机 > 阵列失效 > 过热 > 降级/冗余 > 正常）----
  let status, level;
  if (!powered){ status = '未上电'; level = 'off'; }
  else if (cpuTemp >= 102){ status = '过热停机'; level = 'bad'; }
  else if (arrayLevel === 'bad'){ status = '阵列失效'; level = 'bad'; }
  else if (cpuTemp >= 90){ status = '过热告警 · 已降频'; level = 'bad'; }
  else if (arrayLevel === 'warn'){ status = '降级运行'; level = 'warn'; }
  else if (inp.psuCut){ status = '运行中 · 冗余告警'; level = 'warn'; }
  else if (inp.fanFailed){ status = '运行中 · 风扇告警'; level = 'warn'; }
  else if (!online){ status = '开机时序中 · ' + inp.bootStage + '/6'; level = 'warn'; }
  else { status = '运行中'; level = 'ok'; }

  return { powered, effLoad, fanRPM, cpuTemp, powerW, arrayState, arrayLevel,
           psuState, nicState, status, level,
           throttle: powered && cpuTemp >= 90 && cpuTemp < 102 };
}
