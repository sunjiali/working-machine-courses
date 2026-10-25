# 施工日志 · 按 QUALITY-GAP.md 规格 U1–U11 全量施工

施工日期：2026-10-25。批准：Robin「照规格全部施工」。证据目录：`~/workspace/server-hardware-course-artifacts/quality-evidence/build/`。
线上仓库：https://github.com/sunjiali/working-machine-courses （服务器课根路径 / 继电器 `/relay/`）

## 改前基线（动工前实测锁定，/tmp/verify_server.mjs）
- 服务器满负载（导览 6 步走完，step6 自动 load=85）：**322 W / 64.4 °C / 14,689 RPM** ✓ 与规格基线一致
- RAID 全链：拔盘→「降级运行」(314 W)；插回→「重建中」→完成回「在线」(322 W)；再拔两块→失效；复位→在线 ✓
- 风扇故障：14800 RPM / 77.2 °C / 状态「运行中 · 风扇告警」✓；0 控制台错误

## 服务器线

### U3 渲染管线（完成）
- 截图复核：server-u2-first-frame.png 全景有可辨接触阴影、机器不再漂浮；server-u4-cpu-closeup.png 中 PSU 金属面有明暗渐变、鳍片/风扇有环境反射；与审计 server-1/server-4 并排差异一眼可辨 ✓
- 开 PCFSoft 阴影（主方向光 2048 阴影图、bias/normalBias 校准）、ACES 色调映射（曝光 1.06）
- 环境反射：自建小环境场景（顶部光板+三面彩窗）经 PMREM 生成 environment，无外部资源、离线可用；全标准材质 envMapIntensity 0.55
- 地面：canvas 地砖贴图（噪点+砖缝+径向暗角）+ 机器基座台；删无限 GridHelper；远景机柜排剪影推远至 ±16.5 并提亮至近雾色
- 材质按真实分工重调 roughness/metalness（拉丝金属 .38/.6、铜 .3/.8、银 .27/.7、PCB .55/.15）
- 全场景 traverse：标准材质 castShadow/receiveShadow；贴标平面与导流罩不投阴影
- 证据：server-u2-first-frame.png（接触阴影可见）、server-u4-cpu-closeup.png

### U4 模型保真第二轮（完成；前面板计数一张补拍在终验轮）
- 逐项复核：风扇扫掠双转子 ✓（server-u4-fanwall.png，特写可辨镰刀叶与前后两排）；DIMM 颗粒+纸标签 ✓（server-u4-ram-closeup.png）；鳍片 19 片特写不露馅 ✓（cpu-closeup）；丝印字号真实比例 ✓（ram-closeup 中 DIMM A1–A8 丝印可读不玩具）；前面板 8 仓在 step4 定机位图中成排可辨，终验轮补一张正面定机位图存档
- 风扇叶轮：星形盒叶 → Shape 镰刀扫掠轮廓 ExtrudeGeometry 薄片 + 0.62 rad 迎角，前排 9 叶 + 后排 7 叶反向双转子（syncScene 反向驱动）
- 散热鳍片 11 → 19 片加密（间距 0.05）
- DIMM：每条加纸标签（DDR5 · 64GB · ECC RDIMM，canvas 纹理，+x 侧面）
- 主板丝印字号降到真实比例（44px→27px、36px→22px；DIMM 丝印 40px→23px）
- 前面板机位改低（front y 2.0→1.05）以便数清 8 仓位——证据 server-u4-frontpanel.png（待补拍复核）

### U2 服务器默认运行态（完成）
- 初始状态 bootStage=6、load=60（首帧：运行中、254 W 量级、风扇转动、状态灯亮）
- 导览改浮层邀请（舞台左上「跟着开机时序走一遍」/「先自己逛逛」），点邀请才重置回未上电走时序
- 证据：server-u2-first-frame.png + server-u2-frame-plus1s.png（风扇角度差由脚本回读，见验收 JSON）

### U5 构图与镜头（完成）
- VIEWS 全量重定：overview 拉近（整机占舞台宽约 62% > 55% 达标线）、front/disk 改低机位、其余逐个对准被讲部件
- 六步 contact sheet：server-u5-contact.png（step1..6 单张同目录）——逐张等相机飞到位（投影点稳定判定）后截，六张主体完整、被讲部件可辨、信息卡与引出点齐全
- 踩坑记录：相机飞行用 dt 推进且 dt 被钳在 0.05s，低帧率环境下 1.6s 只走完约 7% 行程——首轮六步图全是"没飞到位"的同角度图，已用"等投影稳定"协议重拍

### U6 扩课到 6 节（完成）
- 答题实测：三节新课逐节在无头 Chrome 点选正确答案，反馈均判 ✓、顶栏「已学」依次 1/6 → 2/6 → 3/6（verify2 输出）；证据 server-u6-lessons.png
- 新增第 4 节《内存与通道实操》（插序/通道带宽/ECC，MCQ 答案 B）
- 新增第 5 节《RAID 实操：亲手拔一次盘》（引导去实验室实操，MCQ 答案 B）
- 新增第 6 节《故障排查：读灯、读日志、定位》（BMC 能登录场景，MCQ 答案 B）
- 每节保持既有结构：paras + guide + quiz + big idea；lessonDone 改为按 LESSONS 长度动态生成

### U8 自由探索（完成）
- 分解数值验证：fanGroup.z = explodeCur × 1.5（实测 0.3384 = 0.2256 × 1.5）等四组偏移公式全对；截图 server-u8-exploded.png（导流罩升起可辨；注：无头 SwiftShader 帧率 <1fps，收敛慢，真实 GPU 上约 0.3s 到位）
- 拖拽实测（插桩 getDrag 钩子）：抓盘 engaged(type=disk,i=2)、拖动 off 达 -1.2、松手 disks[2] 由 out → rebuild ✓；拖出方向在 verify2 已实测（ok → out、阵列转降级）✓；风扇模块拖出后停住（z=2.45=1.5+0.95）✓ 证据 server-u8-drag-rebuild.png / server-u8-fan-out.png
- 踩坑记录：前两轮拖拽测试失败均为测试侧问题——①相机自动旋转使瞄准点过期 ②瞄准点被已拔出盘的邻位遮挡，与产品无关，插桩后一次通过
- 分解视图滑杆（舞台左下）：导流罩升起、风扇墙/盘仓/PSU/网卡沿轴向拉开（animate 内平滑趋近，只改呈现不进模型）
- 盘拖拽：pointer 抓盘上下拖，松手超阈值 → 走 clickDisk 同一模型路径（拔出=out、拖回=重建）；风扇模块可拖出停住、再拖回
- 与 OrbitControls 共存：抓到部件时禁用轨道控制；小位移仍走原点击选中

### U9 进度持久化（完成，线上终验通过）
- localStorage（serverCourse.v1）：bootStage/load/ambient/两开关/盘位/curLesson/lessonDone，重建瞬态不存（恢复为 ok）
- 顶栏加「已学 x / 6 节」+「复制分享链接」按钮（?lesson=N&step=M）；URL 参数优先于存档，参数直达对应课与步（实测 ?lesson=5&step=3 → RAID 课 + 开机时序中·3/6 ✓）
- 翻车与修复：首轮答题后刷新进度丢失——根因是答题/切课只调 renderLessonList、不经 refreshUI，saveProgress 没被触发；已在 renderLessonList 末尾补 saveProgress() 并加 beforeunload 兜底保存，复测通过
- 线上终验（真实 Pages 源）：答完第 1 节点击题 → 已学 1/6 → 刷新 → 仍 1/6 ✓；本地 file:// 复测同样通过（证据：verify3/verify_live2 输出）

### U1 部署上线（完成）
- 新公开仓库 sunjiali/working-machine-courses（git CLI 推送），GitHub Pages 已开启（main / 根路径）
- 线上地址：服务器课 https://sunjiali.github.io/working-machine-courses/ ；继电器 https://sunjiali.github.io/working-machine-courses/relay/
- 线上实测（干净无头 Chrome，经本地转发代理过沙箱出口）：两页均 200、0 页面错误；服务器课线上回读满负载基线 322 W / 64.4 °C / 14,689 RPM ✓、初始运行态 254 W、6 节课齐全；继电器线上 0 错误、接口面完整
- 证据：server-u1-live.png / relay-u1-live.png
- 小伤修复：两页补 emoji favicon（消除 favicon 404 控制台错误），已推送并等构建完成
- 环境注记：沙箱直连 Pages 被出口代理的 TLS 拦截挡住，线上浏览器核对经自建本地 CONNECT 转发代理完成（仅核对通道，页面本身为公网直达）

## 待办（按序）
- [x] verify2/3/4/5 结果回收（U5 六步图、U6 答题、U8 拖拽、U9 修复）
- [x] U1 部署：两件产品已上 Pages + 线上截图核对 + U9 线上终验通过
- [x] U11 服务器课 60 秒演示重录（完成，见下「服务器线收尾」节）
- [x] 基线回归复跑（完成：满负载 322/64.4/14689、RAID 全链、0 错误；前面板定机位补拍 server-u4-frontpanel-final.png）
- [x] 继电器线汇总（见下节：U10/U2/U7/U11 全达标，validate 37/37，成片 relay-demo-v2.mp4）

## 服务器线收尾（U11 演示 + 终验回归，2026-10-25）

### U11 服务器课 60 秒演示（完成）
- 脚本 `~/workspace/server-hardware-course-artifacts/recording/record_v4.mjs`（虚拟时钟逐帧）：1482 帧 / 虚拟 61.75s / **skipped=0**，成片裁到 60.000s。事件线：0s 运行态完整 UI 开场 → 点「跟着开机时序走一遍」重走 6 步导览 → 规格仪表段（日志实证回读 **322 W / 64.4 °C / 14,689 RPM**）→ 硬盘白卡 → 实验室拉满负载 100%+室温 34 °C+风扇组故障（实测 **99.0 °C 过热告警 · 已降频**）→ RAID 拔盘降级 → 修复+重建 → 分解视图 → 标题卡（课名 + sunjiali.github.io/working-machine-courses）。
- 成片 `~/workspace/your_files/server-course-demo-v2.mp4`：ffprobe 实测 1152×768 / 24fps / **60.000s** / H.264+AAC / 7.1 MB；垫乐 pad.wav 循环 + loudnorm，成片复测综合响度 **−14.28 LUFS**。
- 五帧 contact sheet（0/15/30/45/59.5s）：`server-demo-contact.png`——0s 运行态全景、15s 导览中+硬盘卡、30s 热拔插段、45s 过热告警段、末帧标题卡带链接，目视全过。
- 录制侧备注（如实）：本机 2 核 + SwiftShader，前两轮录制分别慢速（1500×1000 约 25s/帧）与开场段卡死；最终参数 1152×768 / 24fps + `?rec=1` 录制模式（关 MSAA、阴影 1024，默认访问无此参数、呈现不变，已同步部署）+ 每帧超时保护后稳定约 1.25 fps、零跳帧。第一版录制中段风扇开关真实点击落空（实验室只到 86 °C、无告警），已废弃重录；重录加 `ensureSwitch` 校验兜底后命中 99 °C 告警段。

### 部署一致性补记（收尾核对时发现并修复）
- 收尾 diff 发现部署仓副本缺 REC_MODE 三行（源文件 17:59 改、副本停在 17:55 的同步前版本；该标记对普通访问是 no-op，线上功能不受影响，但源与仓不一致不合规矩）——已 cp 同步并推送（commit c5bb8db），curl 拉线上 HTML 确认含 REC_MODE（Pages 已发新版）。
- 同步后线上复验：服务器课 **200 / 0 错误 / 满负载 322 / 64.4 / 14,689 / 6 节** ✓（证据 `server-u1-live-final.png`）；继电器页本轮无头导航遇出口链路抖动超时，但其文件自首次线上验收后未变（diff IN-SYNC），且 curl 经同一代理实测 200，故沿用首次线上验收结论。

### 基线回归终验（完成）
- 无头 Chrome 实机回读（verify_final）：0 控制台错误；满负载 **322 W / 64.4 °C / 14,689 RPM** ✓；RAID 全链 在线→拔盘降级（314 W）→重建中→在线→双盘失效（307 W / 失效 · 数据丢失）→重置回在线 ✓，与改前基线逐项一致。
- 前面板正面定机位补拍：`server-u4-frontpanel-final.png`（flyTo('front') 后等投影连续稳定再截；前面板 4 盘位+左耳电源/UID 灯清晰），U4 证据集补齐。

### 复盘（服务器线）
- 做对：先锁基线再动刀——每组改动后都用无头 Chrome 回读模型输出（322/64.4/14689、RAID 全链、继电器读数）才算过；证据协议统一为「等投影/状态稳定再截图」，避免了把动画中间态当成品态。
- 翻车：①U9 首轮答题后刷新丢进度（保存触发点只挂在 refreshUI 一条路径上）；②相机飞行 dt 被钳 0.05s，低帧率下首轮六步构图证据全是未到位中间态、整轮作废重拍；③录制在 2 核机上两轮失败（慢速、GPU 进程卡死），且第一版成片中段开关点击落空——都是「无头环境 ≠ 真实环境」的假设错误，靠段内日志回读才抓到。
- 沉淀：等投影稳定截图协议、`__demo` 插桩钩子（getDrag/proj/flyTo）＋录制 `ensureSwitch` 校验兜底、每帧超时保护 + REC_MODE 录制模式、本地 CONNECT 转发代理过沙箱出口做线上核对——均已落在脚本与本日志，后续 working-machine 新课可直接复用。

## 继电器线（2026-10-25 施工，证据在 `~/workspace/server-hardware-course-artifacts/quality-evidence/build/relay-*`）

验收总览：扩展后 `~/workspace/server-hardware-course-artifacts/recording/validate_relay.mjs` **37/37 通过、0 控制台错误**（原 17 项既有断言零改动、全部保留通过；新增 20 项为 U10/U2/U7 追加）。

### U10 版式修复（完成）
- (a) 小地图卡：舞台右下 → 右上（`top:14px`），不再压「负载电流」读数；SVG「透明盖已剖开」锚点 930→878 避让小地图。三态 bbox 实测：负载/线圈电流与 minimap/toolbar/演示按钮两两无重叠（`relay-u10-idle/working/welded.png`）。
- (b) 底部中央控制胶囊：移到舞台左下角（frame 内左下），中央底部清空。
- 连带修复（加功能后挤压复发，R1/R2 同类）：右列 flex 微调（信息 1.22→1.10 / 实验室 0.92→1.04）+ 两卡内部间距收紧；五态（待机/第4步/粘连/烧断/弹簧疲劳）实测仪表末行余量 ≥27px、实验室底部读数行余量 ≥41px、按钮余量 ≥1px（弹簧态最紧，1px，已目视全显）。

### U2 继电器自动演示（完成）
- 默认仍待机；舞台右下（viewport 层）加荧光绿入口「▶ 先看它工作一次」：点击后 0.6/2.2/3.8/5.4s 依次推进四步、7.4s 回待机、8.3s 结束解锁（演示中步按钮 pointer-events 锁定）。
- 实测：点击后 6.8s 回读 coilCurrentMa=100、loadPower=120、loadCurrent=2.50；10.2s 回读 step=0、0 mA / 0 W、演示态结束（`relay-u2-demo-working.png`、`relay-u2-demo-back-idle.png`）。

### U7 补题与第三故障（完成）
- 互动题（概览区 `#quizCard`）：情景读数组合（12.0 V / 0 mA / 触点分开 / 0 W）二选一区分粘连 vs 烧断；实测先误选粘连→反馈给出粘连的反向组合（断电 0 V/0 mA 而负载 120 W）解释，再选烧断→判定正确（`relay-u7-quiz.png`）。
- 第三故障「弹簧疲劳」（实验室第三开关 `#faultSpring`）：模型口径——回弹力 ×0.55（待机 30%→17%、吸合 80%→44%，新增读数行「弹簧回弹力」），吸合侧电气读数不变（100 mA / 1.20 W / 120 W / 间隙 0.0 mm）；释放过渡 760→2600 ms。实测释放后 1.0s 负载仍 80.8 W / 电机 67%（迟滞成立）、3.4s 停稳回间隙 3.0 mm；健康态对照 1.0s 已停。口径已写入工程 REFERENCES.md 第 6 条，与弹簧部件卡既有文案（「弹簧疲劳会让释放变慢」）一致、未改既有文案与读数。
- 三故障读数向量（线圈电压|线圈电流|间隙|负载功率|电机|回弹力|触点状态）两两不同：粘连 `0|0|0|120|100|30|粘连闭合`、烧断 `12|0|3|0|0|30|分开`、弹簧疲劳（工作态）`12|100|0|120|100|44|闭合`（`relay-u7-spring-working.png`、`relay-u7-spring-readout.png`、`relay-u7-spring-release-mid.png`）。
- 常闭触点对比小视图（概览区 `#ncView`）：左右两格——未通电格动触点压合（闭合·负载回路接通）/ 通电格动触点拉离（断开·负载回路切断），高亮格随线圈实际通电状态切换（实测待机高亮未通电格、工作态高亮通电格）；文案与 REFERENCES 教学取舍第 1 条已同步（主剖面仍只画常开，常闭仅小视图示意）（`relay-u7-nc-view.png`）。

### U11 继电器 60 秒演示重录（完成）
- 新脚本 `~/workspace/server-hardware-course-artifacts/recording/record_relay_v2.mjs`（旧脚本保留）：1818 帧虚拟 60.60s、段内断言全过、0 页面错误。结构：0–5s 运行态开场（进片前虚拟时钟先 settle 到第 4 步，第 0 帧即 100 mA / 120 W）→ 5–7s 回待机 → 7–23s 导览四步 → 23–32s 粘连+修复 → 32–43s 烧断+四步命令+修复恢复 → 43–49s 弹簧疲劳+释放迟滞（中段实测负载 69.2 W 仍在转、49.5s 停稳）→ 49–52s 修复收尾 → 52–55s 互动题答对 → 55–60s 标题卡（课名 + https://sunjiali.github.io/working-machine-courses/relay/）。
- 成片 `~/workspace/your_files/relay-demo-v2.mp4`：ffprobe 实测 1920×1080 / 30fps / **60.000s** / H.264+AAC / 4.63 MB；底乐沿用 pad.wav 循环 + loudnorm，成片复测 −14.05 LUFS。
- 五帧 contact sheet（0/15/30/45/59.9s）：`relay-demo-contact.png`——0s 运行态、15s 导览第 2 步、30s 粘连故障、45s 弹簧疲劳介入、末帧标题卡带链接，目视全过。

### 基线核对（改后回读，relayModel phase=1）
- 待机 0 mA / 间隙 3.0 mm / 0 W；通电 100 mA / 1.20 W；磁吸间隙 0.96 mm；闭合 2.50 A / 120 W；工作电机 100%；粘连+断电 线圈 0 mA 而负载 120 W；烧断+step4 命令 12 V / 0 mA / 0 W——与改前基线逐项一致，弹簧疲劳关闭时全部既有工况（含 springLoad 30/80）不变。

### 复盘（继电器线）
- 做对：先量几何再动刀——U10 两处伤与后续两次挤压复发（演示按钮误挂 frame 内定位、step4 提示变长顶出仪表）都是 bbox 实测先于目视发现的。
- 翻车：演示按钮第一次放在 frame 内右下，正压负载读数（自检 bbox 抓到）；弹簧工作态证据图第一版拍在健康态设置之后（脚本顺序 bug），已修脚本并重拍。
- 沉淀：validate 只增不改扩到 37 项（几何无重叠、卡底余量、演示全程回读、故障向量、迟滞时序全进自动验收）；录制脚本 v2 的「开场先 settle 到运行态」手法可复用于服务器课 U11。

## 2026-10-25 追加轮 · 架构 spike：Vite + React + React Three Fiber 可行性（Robin 拍板优先尝试）

背景：本轮原计划原生 ES Modules 拆分（已起头：index.html 薄壳 + src/ctx|model|data 草稿），Robin 中途改方向：样板作者 Dilum 的 WareTrack 即 React+R3F 本人亦推荐 React——先 spike 后决策。原生草稿就地暂停（结论后按新栈重写，未部署、线上版未动）。

spike 工程：`refactor-spike/`（Vite 6 + React 19 + @react-three/fiber 9 + @react-three/drei 10 + three 0.180）。移植范围：machineModel 纯函数**原样搬入**（含 S 输入结构）、机箱（含前面板框/LCD 条/双挂耳）、风扇墙 ×6（镰刀扫掠双转子 buildRotor 原样移植）、一组 DIMM（纸标签）、PMREM 自建环境 + 灯光/阴影/ACES 配方、地砖地面（canvas 贴图）、远景机柜排、fog。

三风险点实测结论（证据：~/workspace/server-hardware-course-artifacts/quality-evidence/build/spike/）：
- **a 渲染与交互：通过。** 同机位（overview，负载 85）截图与现行线上版对照：构图、色温、阴影、雾感同级；差异点已定位并修复——envMapIntensity 须在材质创建处定死 0.55（原版靠全场景 traverse 统一压，R3F 里 traverse 时机不可靠，首版截图偏亮发飘，改创建处设定后对齐）。读数经 React 状态→模型→DOM 全等：负载 60 = 254 W / 52.7 °C / 10,841 RPM，负载 85 = **322 W / 64.4 °C / 14,689 RPM**（回归基线原样）。R3F 点选 raycast 实测：投影坐标点风扇墙→选中 fan、点 DIMM→选中 ram，BoxHelper 高亮正常。0 控制台错误（原版页在同环境下出现的 1 个 pageerror 是验收脚本合成 PointerEvent 触发 OrbitControls setPointerCapture 所致，非页面问题）。
- **b 确定性录制：通过（含一条必守纪律）。** frameloop="never" + `advance(ts)` 手动步进可用，转子角改为由 clock 绝对时间驱动后，两轮独立运行转子角逐帧全等（0 / -1138305 / -2276610 rad 线性）。首轮截图哈希不等的根因不在 R3F：地面 canvas 噪点用 `Math.random()` 生成（原版即如此），每次加载纹理不同——改为固定种子 RNG 后，两轮截图哈希逐帧**全等**（DETERMINISM: PASS）。生产录制纪律：①纹理随机一律种子化；②`advance()` 传入时间戳的标度需按实测标定（本机实测 elapsed 与传入数值 1:1），或直接用帧计数驱动角度，二者皆确定。
- **c 部署：通过。** `vite build` 纯静态产物；`base: './'` 相对路径，本地 HTTP 子路径 `/spike/` 下 index 与 JS 资源均 200，file:// 直开亦可（录制管线兼容）。体积：JS 1.14 MB（gzip 318 KB）+ index 0.9 KB——与原版 three.module.js 单文件（约 1.2 MB 未压缩）同量级，gzip 后更小，可接受；chunk-size 提示为警告非错误，后续可 code-split 但不必需。

**结论：spike 通过，全量重构按 React 组件化推进**（model 原样保留、UI 全 React、部件按 React 组件拆分、本轮其余任务在新栈落地，行为等价验收标准不变）。下方条目续记全量重构。

## 2026-10-25 全量重构 + 组件全可视化 + 选中放大 + UI/UX 对表（完成）

### 架构落地（React 组件化，源码已从 refactor-spike/ 提升为工程根）
- 栈：Vite 6 + React 19 + @react-three/fiber 9 + drei 10 + three 0.180；`base:'./'` 纯静态构建。
- 源码结构（共 2,436 行 / 19 文件，最大单文件 302 行；旧单文件归档于 `~/workspace/server-hardware-course-artifacts/archive/index-v3-singlefile.html`，旧 three/OrbitControls 副本与原生 ES 拆分错版草稿一并归档/废弃）：
  - `src/model.js`（76，machineModel 纯函数逐字移植）、`src/data.js`（146，PARTS/STEPS/LESSONS + 新部件文案）、`src/views.js`（33，U5 定版 11 机位 + 6 zoom + 10 新机位）、`src/store.js`（208，S/U 状态、事件日志 diff、进度持久化）、`src/shared.js`（85，材质/标签/转子/种子纹理）
  - `src/Scene.jsx`（302，灯光/环境/相机 rig/分解与高亮）、`src/parts/`（common 34 / Chassis 77 / Board 89 / Drives 148 / Power 146 / RiserBackplane 144）、`src/ui/`（Panels 291 / Stage 130 / TopoView 84）、`src/App.jsx`（121）、`src/styles.css`（291，原 CSS 逐字 + 日志/拓扑/角标新增段）
- **本轮最贵的一个坑（沉淀）**：R3F 中任一 `useFrame` 传 priority>0 会关掉自动渲染（接管渲染循环语义）——场景出现「逻辑全活（raycast/投影/转子都在动）、画面全黑」，排查耗时最长；已在 Scene.jsx 注释钉死：useFrame 一律不传 priority。
- 其余实测纪律：envMapIntensity 在材质创建处定死 0.55；地面纹理随机改固定种子 RNG（确定性录制前提，spike 已验）；OrbitControls minDistance 1.2→0.6（小件特写所需）；SwiftShader 无头验收帧率 ~1fps，相机飞行验收必须用「目标点到达」判据而非「位置不变」判据（自动旋转会让后者永假）。

### 组件盘点与补全（对照 REFERENCES 真机：Dell R750/R760、HPE DL380 Gen11 级 2U）
原有 7 部件（主板/CPU/内存/硬盘/风扇墙/电源/网卡）全部保留且行为不变。新增 10 个可选中 3D 部件（编号 8–17）：
| 部件 | 建模内容 | 真机依据/取舍 |
|---|---|---|
| 前面板控制区 panel | 双挂耳、电源键（绿环）、UID 键、USB 口、状态灯排 | R750 前视图；与 v3 前框合体，耳朵为其可选中实体 |
| LCD 诊断屏 lcd | 左耳小屏（深蓝底亮字「iDRAC9 · OK」）+ 边框 | R760xs LCD panel 手册；位置沿用 v3 简化口径（前框上轨） |
| 硬盘背板 backplane | 背板板体 + 每仓连接器 + 双 SAS 线缆（至 HBA）+ 电源线（至主板右侧插头） | R750 Inside the system；线缆走向按实拍 |
| 扩展笼与 HBA 卡 hba | riser 笼 + 全高 HBA/RAID 卡（大散热片/SAS 口/丝印） | R750 riser + PERC 口径 |
| OCP 网卡 ocp | NIC 上方叠层 OCP 3.0 卡（绿 PCB + 双 SFP+ 笼 + 支柱） | R750 OCP 3.0 槽位在后部 riser 区；叠层为示意取舍（见 REFERENCES） |
| 后置 IO 板 rio | 网卡挡板下方独立小板：iDRAC 管理口 + 串口（双 RJ45 带字签）+ 后置 USB + 活动灯 | 原设想位置被 PSU1 后脸遮挡，改放此处（见 REFERENCES） |
| CMOS 电池 cmos | CR2032 电池座 + 银电池 + 保持夹 + 丝印签，主板前右开放带 | R750 电池位于风扇墙后主板上（本课位置同口径） |
| BOSS 启动卡 boss | 主板前左竖卡 + 双 M.2 模块 + microSD 槽 + 丝印签 | BOSS-S2 口径；位置为前左开放带（见 REFERENCES） |
| 导流罩 shroud | 半透明罩体（原有几何归属独立部件） | 点选口径：3D 中不挂 handler（点穿选 CPU/内存，与原版一致），经编号点/列表选中，选中时自身淡出 |
| 机箱 chassis | 侧壁/导轨/提手等框架组（原有几何独立成部件） | — |
判定不补：VGA 口（R750 后置 VGA 为配置项、本课 RIO 以 iDRAC+串口+USB 为代表，前面板 v3 已有 VGA 示意）、内置立式 USB 口（与 BOSS 的 SD/USB 启动叙事重叠，板面空间让给教学部件）、顶盖（教学默认拆盖，REFERENCES 既有口径）、光驱（2U 机架机无此配置）。

### 选中放大（任务 B）验收（1100×700 无头实测，partScreen 包围盒占比，max 轴 ≥0.55 为线）
- 全链（点选→飞到位→白卡标题与 PARTS 一致→「返回全景」回位）17/17 通过，0 控制台错误。
- 覆盖率（宽×高）：board .57×1.24、cpu .48×.74、ram .35×.62、disk .57×.30、fan .52×.65、psu .64×.47、nic .40×.61、panel .67×.26、lcd .64×.27、backplane .50×.59、hba .28×.66、ocp .33×.61、rio .41×.59、shroud .57×.68、chassis .56×.44——15 个部件 max 轴达标。
- **未达 55% 两件（如实）**：cmos .09×.20、boss .09×.23。原因：CR2032（⌀20mm）与 BOSS 卡在 2U 整机真机比例下本就极小，且都位于风扇墙之后——任何保留整机上下文的机位都到不了 55%，贴到最近可用角度又会被风扇墙/线缆遮挡。现机位为正上方「拆盖俯视」特写（部件与丝印可读、3D 直点标签/电池本体可命中），覆盖率数字不达线，留 Robin 定夺是否接受或要更激进的特写（如隐藏风扇墙的 X 光式特写）。
- 3D 直点实测：disk/fan（bbox 中心）、cpu（点穿导流罩点散热鳍片）、ocp（SFP 笼）、hba（bbox 中心）、rio/lcd（bbox 中心）、panel（左耳实体）、cmos（电池本体，俯视机位）、boss（标签面，俯视机位）均命中；backplane 板体/连接器被硬盘仓遮挡（物理事实，与真机一致），其线缆为细目标未单独点验——backplane 经编号点/列表路径全链通过。
- 拖拽：硬盘在特写机位下拖出→out、推入→rebuild→在线全链通过（overview 距离下拖不动是原版 e.delta>6 防误触门，非回归）；风扇模块拖出锁定 0.95（视觉拔出，与原版一致；模型级风扇故障走实验室开关，主验收已验读数）。

### UI/UX 对表 Learn Arduino（任务 C/D/E）
样板盘点（2026-10-25 重新实机截图，存 ~/workspace/server-hardware-course-artifacts/quality-evidence/build/sample-home.png）：左图标栏（栏底竖排署名）、顶左标题、顶右进度卡（BASICS 0/16+日期时钟）、右列 4 tab + TRY IT YOURSELF 代码区、底部 LESSONS 轮播、舞台底部中央胶囊工具条、部件浮卡 + 青点虚线引出、纸面透印署名；场景=整板浮在奶油纸面 + 柔和接触阴影，无 3D 环境。
映射落地：①常驻双进度（顶右卡：导览 x/6 步 + 已学 x/6 节 + 分享链接，与样板同位）；②自由练习显性化（实验室卡标题改「自由练习 · 搞坏它实验室」+ 舞台提示明示）；③系统事件日志（课程信息第三 tab「事件日志」充当 Serial monitor 等价物，全部行由 store 的状态 diff 生成：POST/拔盘/重建 %/阵列失效/风扇故障/PSU 切断/课程完成，实测 24 行与操作一一对应，零写死）；④拓扑视图（工具条「拓扑」切换，电源/散热/数据三路 SVG 流向，节点数值与状态色实时读 machineModel 输出）；⑤拓扑角标：右下「𝕏 @robin_playbooks」讲义风小角标（截图 react-topo-final.png 确认可见、不压内容）；⑥场景：穿孔高架地板砖 + 左右邻柜（带微光 LED 点）+ 后上方桥架与两根垂落线缆 + 暖白关键光 + fog——底色守浅色讲义系、主体占比与首帧密度不变。**诚实口径**：环境叙事是同语言下的自有延伸（样板本身无 3D 环境、只有纸面与阴影），并排对照图 react-side-by-side.png、逐项差距见本轮交付报告。
主操作路径步数对照：选部件看讲解 样板 1 步（浮卡常驻点开）/ 我们 1 步（编号点或 3D 点选）；开始课程 样板 1 步（底部轮播）/ 我们 1 步（底部轮播或导览钮）；自由练习 样板 1 步（TRY IT YOURSELF 常驻）/ 我们 1 步（实验室常驻右列）；看原理图 样板 1 步（工具条切换）/ 我们 1 步（拓扑钮）。

### 回归基线回读（与原版逐项同数，0 控制台错误）
默认（load 60）254 W / 52.7 °C / 10,841 RPM；满负载（boot 6 + load 85）**322 W / 64.4 °C / 14,689 RPM**；风扇故障（load 85）14,800 RPM / 77.2 °C /「运行中 · 风扇告警」；RAID：降级 314 W → 重建中 → 在线 → 双盘失效 307 W /「失效 · 数据丢失」→ 复位在线；导览 6 步机位与 U5 定版逐一全等、末步自动 load 85；click 题先错后对、mcq 错/对反馈与完成态；分解 0.985；localStorage 进度（load 33 刷新保留）；`?lesson=3&step=2` 分享直达（第 3 节、bootStage 2）；390px 移动端无横向溢出、编号点可点（注：首节 click 题武装态下点选先走判题——原版既有设计，非回归）。
证据：~/workspace/server-hardware-course-artifacts/quality-evidence/build/react-parts/（17 部件特写 + 移动端）、react-parts-contact.png、react-overview-final.png、react-topo-final.png、react-side-by-side.png。

### 演示片 server-course-demo-v3.mp4 与新线上版对不上的帧段（先不重录，留 Robin 定）
- 导览第 2/5 步的后视角帧：新版后部多了 OCP 叠层卡与 RIO 板，片中没有。
- 导览第 1 步俯视内部帧：新版主板上多了 CMOS 电池与 BOSS 卡，片中没有。
- 拓扑视图与事件日志为全新 UI，片中完全没有；全景首帧的环境（桥架/邻柜位置）与片中略有出入。
- 录制脚本 ~/workspace/server-hardware-course-artifacts/recording/record_v3/v4 仍指向归档的单文件版；新栈录制走 __demo + REC_MODE（spike 已验确定性），下次重录时适配。

### 复盘（本轮）
- 做对：spike 先行 + 每步实测判据（基线回读/目标点到达/状态 diff 日志）让全量重构没有一步靠「应该没问题」；遮挡类问题全部用几何验算（视线与包围盒求交）定性，没靠猜。
- 翻车：①useFrame priority 关自动渲染，黑屏排查绕了远路（先怀疑材质/相机/层级）——根因是 R3F 渲染循环接管语义不熟；②验收探针两次被自己的测量方法坑（组原点投影 ≠ 部件位置、waitCamStable 在自动旋转下永假、SwiftShader 低帧率下 dt 钳制让飞行慢 20 倍）——测量方法本身要先验。
- 沉淀：R3F 三条纪律（priority 禁用、envMapIntensity 创建处定死、纹理种子化）已写入 Scene.jsx 注释与本条；无头验收判据清单（目标点到达 + bbox 中心点选 + 遮挡几何验算）随本轮脚本留 /tmp（易失，下轮按本条复述重建）。

### 部署确认（2026-10-25）
- 部署仓库 sunjiali/working-machine-courses：`0a21631` 全量替换根目录（index.html + assets/，旧 three/OrbitControls 删除，relay/ 未动）+ `4a9a68b` 补内联 favicon（新壳漏了旧版的 icon 处理，线上首验抓到 /favicon.ico 404）。
- 线上复验（干净无头 Chrome 经代理拉 https://sunjiali.github.io/working-machine-courses/）：HTTP 200、**控制台错误 0**、默认 254 W / 52.7 °C / 10,841 RPM、load 85 = 322 W / 64.4 °C / 14,689 RPM、部件 17、拓扑角标 @robin_playbooks 可见、/relay/ 200 且标题正常。证据图 react-live-topo.png。

---

## 返工轮（2026-10-25 下午）：工程正规化 + UI 高保真复刻

Robin 验收后两点返工：①工程「并不是一个完整的 Vite 项目」——package 名还是 spike、根目录混着工件、GitHub 仓库只有构建产物；②UI 与样板站「还是有很大差距」，要求照着样板做。本轮口径：UI 设计语言以样板站为准（此前「不抄他的红/保持讲义风配色」作废——实测样板根本不是红色系，是奶油纸 + 藏青 + 青绿，与我方原底色 #F4EEDF 本就同系，差的是整套 chrome 的几何与字体）。

### 样板 UI 逐元素盘点（2026-10-25 本轮重新实机截取 + DOM/computed-style 采样，1440×900）

| 元素 | 样板实测 |
|---|---|
| 字体 | Barlow（正文）/ Barlow Semi Condensed（标题·标签·课程卡）/ JetBrains Mono（代码·日期时间）——Google Fonts |
| 颜色 token | 底 #F6EDDD；卡面 rgba(250,244,233,.97)；卡壳 rgba(246,237,222,.6)；内胆 #F9F2E5；代码底 #F8F0E3；控制台底 #F3EADB；描边 #CEC0AD（浅 #D6C7B3）；藏青 #18213D；正文 #4F535B；弱化 #686C73；芥末灰 #ADA293；强调青绿 #1AA3A1；选中钢青 #3F7F8E；代码蓝 #2A56A3；代码橙 #C0652D；轨道 #E3D8CA |
| 左栏 | 宽 62、全高、透明无卡、右侧发丝线 rgba(196,176,150,.35)；顶部 toggle 钮 40×43（chip 底 rgba(240,230,215,.7)+#D6C7B3 边+r9）；导航行高 34、间距 ~72、图标 ~29、展开出 Semi Condensed 17/600 标签；语言钮带藏青 EN 小徽章（18×13、r5、字 10.5/700）；底部署名条 40×183 竖排（DESIGNED BY + x.com/…，同 chip 样式 r9）+ X 图标 |
| 顶栏 | 左：logo 标记 + H1 Semi Condensed 36.5/600、字距 4.7px、大写、藏青；副行 Semi Condensed 19.5、#ADA293、「·」分隔。右：状态条 [990,15,382,75] 透明底 + 1px #CEC0AD + r11；内嵌进度卡 [218×57] 卡面底 + 同色边 + r9（书图标 + 标签 Semi Condensed 17/700 + 轨道 h11 r7 #E3D8CA + 计数 19/700）；日期/时间 JetBrains Mono 17.5、#5D6066、两行 |
| 舞台 | 无边框无底卡，画布直接浮在纸面（等距网格 + 角落电路走线 SVG）；底部中央：藏青胶囊提示（Semi Condensed 13/600、奶油字、r999）在上，viewbar 在下 [247×36] 卡面底 + #CEC0AD 边 + r11 + 影 rgba(60,45,20,.5) 0 6 16 -12；钮 29×28 r7、图标 16；选中钮青绿 14% 底 |
| 信息卡 | [1013,103,410,342] 卡壳底 + r12 + #CEC0AD 边、无阴影；tab 行：Semi Condensed 17.5，选中 700 藏青 + ::after 下划线（藏青、高 4.5、宽 ~96%、bottom -2），未选 500 #686C73；内胆 [y+50] #F9F2E5 + r10 + 同边；标题 Semi Condensed 25/700 字距 1；正文 18.3/23 #4F535A；特性行 17.2px + 图标盒；右上展开钮 22px |
| 代码卡 | 同壳 r11；标题 Semi Condensed 18/700 藏青；幽灵钮 34×33（#F9F2E5 底 + 边 + r8）；运行钮 38×33 藏青满底白三角；代码块 #F8F0E3 + r9 + 边，JetBrains Mono 16.2/500，行号 #AAA59D，关键字 #2A56A3，函数 #C0652D |
| 控制台条 | 代码卡下贴合 [h79]，底 #F3EADB + 边；标题 Semi Condensed 12.5/700 藏青「Serial monitor」+ 状态 12.5/600 #696D74 + 关闭钮 19；正文 JetBrains Mono 13 |
| 课程轮播 | 「LESSONS」Semi Condensed 700 藏青标于行首上方；卡 [h78] 卡面底 + r9 + #CEC0AD 边，横向滚动（卡宽 214–272 不等）；左缩略图（线稿渲染图，高 72）；标题 Semi Condensed 16.6（选中 700/未选 500，#4B505C）；完成小点 8px 在卡右上；右中箭头 22px；选中卡 2px #3F7F8E 边 + 0 0 0 1px rgba(63,127,142,.08) 环 |
| 部件浮卡 | [230×83] 卡面底 + r9 + #CEC0AD 边：标题粗 + 描述小字，贴部件就近浮出 |
| 其他 | 无小地图；阴影几乎不用（仅 viewbar 与选中环）；圆角体系 9–12 |

### 工程正规化（A）
- 本地：package 改名 `server-hardware-course`、version `1.0.0`；根目录只留 package.json / package-lock.json / vite.config.js / index.html / src/ / public/ / .gitignore / README.md；BUILD-LOG/REFERENCES/QUALITY-GAP 移入 `docs/`；quality-evidence、recording、tools、archive 移至同级 `~/workspace/server-hardware-course-artifacts/`，docs 内引用路径已同步替换；.gitignore = node_modules / dist。
- 继电器课：现行线上 `relay/index.html` 原样收入 `public/relay/index.html`，构建自动带入 dist/relay/，/relay/ 路径与内容不变。
- GitHub：working-machine-courses 改为源码仓库 + Actions 构建部署（细节与验证见下「部署」节，随本轮补记）。

### UI 复刻落地（B，要点）
- 字体自托管（src/assets/fonts/，Barlow 4 字重 + Semi Condensed 3 字重 + JetBrains Mono 可变字体，OFL）——样板用 Google CDN，我方自托管保离线与子路径部署。
- 左栏改 62px 透明栏 + SVG 图标（home/book/chip/sim/globe）+ 「中」徽章 + 竖排署名条（DESIGNED BY x.com/robin_playbooks，学样板署名习惯）+ X 图标；展开态 178px 出标签。
- 顶栏改品牌区（服务器标记 SVG + 大字距标题）+ 状态条（进度卡=已学 x/6 + 状态块 + 等宽日期时间）；分享钮移至课程行首（样板行首只有 LESSONS 标，我方加幽灵钮放行尾）。
- 信息卡：tab 改文字型 + 4.5px 藏青下划线；日志 tab 拆出为独立控制台条（学样板 console 贴卡下常驻）；实验室改浅色 code-card 语言（内胆 #F8F0E3 + 幽灵钮复位 + 藏青「满载压测」运行钮），RAID 盘位改浅色。
- 舞台：去掉蓝边框与底卡渐变（画布直浮纸面）；提示改底部中央藏青胶囊；工具条改 viewbar 规格（r11、SVG 图标、分隔线、拓扑图标钮）；小地图删除（样板无）；分解条改 viewbar 同语言；背景网格改菱格 + 角落电路走线 SVG 装饰；Scene 背景/fog 色对齐 #F6EDDD。
- 轮播：行首「课程 · Lessons」标 + 横向滚动行 + 线稿 SVG 缩略图（6 张，自绘服务器题材）+ 完成 8px 小点 + › 箭头；选中卡钢青 2px 边 + 环。
- 拓扑视图：面板/节点/流线配色并入新 token；右下 @robin_playbooks 角标保留（Robin 既定要求），左栏署名条与之呼应。

### 部署切换与完整性验证（A 续，2026-10-25）
- 阶段一 commit cf537d3：源码 + docs + 字体 + `.github/workflows/pages.yml` 入仓，根 index.html 暂留旧构建产物、Pages 仍走分支 → push 触发 run 40168699534 与手动 dispatch 均全绿（build + deploy job 成功）。
- API 将 Pages `build_type` 切为 `workflow`；切换后 +7/+14/+21s 探针均 200（由上一份 Actions 部署顶着，零中断）。
- 阶段二 commit 1552c71：根 index.html 换源码入口、删除根 assets/ 与 relay/ → run 40168797941（build 19s + deploy 10s）全绿。线上现服务 Actions 构建产物。
- 移动端修复 commit 7bdd387（见回归节）→ run 40172492871 全绿。
- **全新克隆验证**（/tmp/wmc-clone-test）：git clone → npm install ✓ → `npm run dev` 冒烟 ✓（标题正确、/src/main.jsx 200）→ `npm run build` ✓（JS 资产哈希 index-BIu1P6B-.js 与当时线上完全一致）→ vite preview curl / 与 /relay/ 均 200 → 无头打开构建产物（file://；本机 Chromium 的 Local Network Access 策略硬拦 localhost 预览 URL，disable-features 亦无效）：默认 254/52.7/10841、17 部件齐、load 85 → 322/64.4/14689、0 控制台错误。

### 逐元素对齐表（B 验收）
| 元素 | 结论 | 说明 |
|---|---|---|
| 字体/颜色 token/圆角/描边 | 对齐 | 自托管同族字体；token 全量换成样板实测值（底 #F6EDDD、藏青 #18213D、青绿 #1AA3A1、钢青 #3F7F8E 等） |
| 左栏 62px + 署名条 + X 图标 | 对齐 | 署名对象换成 x.com/robin_playbooks（学样板习惯） |
| 顶栏品牌 + 状态条 + 进度卡 + 等宽时钟 | 对齐（1 处差异） | 状态条比样板宽：多「整机状态 + 导览步数」块，内容需要 |
| 舞台无边框、提示胶囊、viewbar | 对齐 | 小地图按样板删除；保留编号点（样板无——我方点击题与导览依赖） |
| 信息卡 410 + tab 下划线 + 内胆 | 对齐 | tab 收为 概览/规格 2 个（样板 4 个，我方内容量如此） |
| 实验室 code-card 语言 | 对齐 | 浅色内胆、幽灵钮、藏青运行钮、RAID 盘位浅色化 |
| 事件日志 | 差异（有意） | 样板是贴在代码卡下的 console 条；我方为右列第三张独立卡（信息量更大，语言已同化） |
| 分解条 | 差异（有意） | 我方独有控件，已用 viewbar 同语言 |
| 课程轮播 | 对齐（2 处小差异） | 左右双钮常驻（样板仅右钮、疑似悬停出现）；缩略图为自绘线稿（样板是 3D 渲染小图） |
| 背景网格/走线 | 近似 | CSS 菱格 + 4 处角落走线 SVG；样板是整幅 SVG 等距网格 + 走线 |
| 3D 场景环境 | 差异（有意，Robin 上轮认可） | 保留机房微缩环境；样板是板子直接浮在纸面 |
| 标题字距/日期字号 | 小差异 | 字距略小（CJK 混排防溢出）；日期 15px（样板 17.5） |

并排对照图与截图证据：`~/workspace/server-hardware-course-artifacts/quality-evidence/build/`（side-by-side-final.png、live-1440x900.png、live-topo.png、mobile-390-fixed.png、parts-shots/、sample-1440x900.png）。

### 回归（C，2026-10-25 本轮最终版脚本实测）
- 本地（dist，修正版脚本 regress_final）：23 项中 21 PASS；2 项当场处置——① explode 固定 2.5s 读数为 0（后以轮询探针复测：0.912 @41s，见下）；② **移动端 390 横向溢出（真 bug）**：.statusbar flex:none + .sb-sub nowrap 长句把盒子撑到 444–526px → 已修（≤900 时 statusbar flex:1 1 auto + min-width:0、sb-sub/statusrow 允许换行），复测 sw=390=iw、0 错误，截图 mobile-390-fixed.png。
- 线上（regress_final_live，部署后）：23 项中 22 PASS，唯一 FAIL 同为 explode 固定读数窗；**轮询探针线上复测 0.9119 @46s**（与本地同值，阻尼确定性），机制确认无误——该动画在 SwiftShader 下帧率受限（真实 GPU 约 1s 到位），脚本固定 2.5s 读数不适配软件渲染，特此注明而非粉饰。
- 相机口径更正（重要）：导览 advanceStep 自原单文件版起就飞向 PARTS[part].cam（源码双侧核对一致），本轮初版脚本误用 STEPS.cam 作预言机导致假 FAIL；修正预言机后本地 tourcheck 6/6 步精确收敛到定版机位（容差 0.09 内）、线上回归同项 PASS。应用行为从未改变。
- 答题类读数同为 SwiftShader 时序敏感：MCQ 反馈需 ≥1300ms 等待（300ms 读空是测量假象，探针复测答错 ✗ / 答对 ✓ / lessonDone / 进度 1/6 俱全）。
- 部件覆盖率补测（17 部件点选→相机→文案→占屏）：15/17 ≥ 0.55；cmos 0.20、boss 0.23 未达线——与上轮已知值分毫不差（真机比例极小且位于风扇墙后，现为拆盖俯视特写），沿袭待 Robin 定夺（激进特写方案未动）。
- 基线全链（本地 + 线上各一遍）：默认 254W/52.7°C/10,841 RPM；满载 322W/64.4°C/14,689 RPM；风扇故障 14,800 RPM/77.2°C；RAID 降级 314W → 重建 → 在线 → 双盘失效 307W → 复位在线；事件日志 18 行含 POST 与磁盘行；拓扑打开且 @robin_playbooks 角标在；分享链接 ?lesson=3&step=2 落点正确；localStorage 持久化（load=33）复读一致；线上 0 控制台错误。

### 演示片影响
- 本轮 UI 大改后，演示片 v3 与现行 UI 的差距进一步扩大（除上轮已记的 4 处帧段外，整套 chrome 已换样板语言）。是否重录待 Robin 定，本轮未动录制管线。

### 复盘（本轮）
1. 做对了：样板盘点先行（实机截图 + DOM/computed-style 采样落表）再动手改 UI——改完逐元素有据可查，没有靠目测「差不多」。
2. 翻车：回归脚本的相机预言机用错（STEPS.cam vs PARTS[part].cam），先后制造了假 PASS 与假 FAIL 两轮噪音；根因是没先读原版 advanceStep 的调用链就写断言。教训：写验收断言前先读被测代码的真实数据流，预言机必须来自实现而非字段名直觉。
3. 翻车：SwiftShader 时序三连（MCQ 300ms、相机 60s、explode 2.5s 固定读数全数误判）——根因是把「固定等待 + 单次读数」当验收法。已沉淀：软件渲染下动画/飞行类断言一律轮询到阈值或超时，等待下限 MCQ ≥1300ms、相机 ≥120s、explode ≥90s。
4. 意外收获：全量回归逼出一个真 bug（390px 状态条溢出）——样板复刻时只对了桌面几何，移动端是靠回归兜住的。
