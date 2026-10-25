# 服务器硬件交互课 · server-hardware-course

把一台 2U 机架服务器做成一台能点的机器：**拆开 · 看懂 · 搞坏它**。

形态对标 Learn Arduino 式交互 3D 课程站，主题换成服务器硬件：3D 模型讲解 + 开机时序导览 + 一个纯函数模型驱动全部读数 + 「搞坏它」实验室 + RAID 故障模拟器。UI 设计语言按样板站实测复刻（Barlow / Barlow Semi Condensed / JetBrains Mono、奶油纸底、藏青 + 青绿）。

## 快速开始

```bash
npm install
npm run dev      # 本地开发（Vite）
npm run build    # 构建到 dist/（纯静态，base './'，可部署到任意子路径）
npm run preview  # 预览构建产物
```

线上：https://sunjiali.github.io/working-machine-courses/ —— 本仓库即线上站源码，push 到 main 后由 GitHub Actions 自动构建并部署 GitHub Pages；继电器元件课在 `public/relay/`，随构建发布到 `/relay/`。

## 工程结构

| 路径 | 说明 |
|---|---|
| `src/model.js` | `machineModel` 纯函数——全站唯一真相源（见下） |
| `src/data.js` / `src/views.js` | 17 个部件的讲解文案、6 步导览、6 节课 / 相机机位表（含选中特写机位） |
| `src/store.js` | 状态 S/U、事件日志（由状态 diff 实时生成）、进度持久化与分享链接 |
| `src/Scene.jsx`、`src/parts/*.jsx` | 场景/灯光/机房微缩环境与按类拆分的部件组件 |
| `src/ui/*.jsx` | 面板（课程信息/实验室/事件日志）、舞台（编号点/白卡/工具条）、拓扑视图 |
| `src/assets/fonts/` | 自托管字体（Barlow / Barlow Semi Condensed / JetBrains Mono，OFL） |
| `public/relay/` | 继电器元件课（静态单页，构建时原样带入） |
| `docs/` | BUILD-LOG（施工与验收记录）、REFERENCES（真机溯源）、QUALITY-GAP（质量审计） |
| `.github/workflows/pages.yml` | push → npm ci → vite build → 部署 GitHub Pages |

验收截图、录制脚本、旧单文件版等工件不在工程内，存放在同级目录 `server-hardware-course-artifacts/`（本地工作区，不入仓）。

## 核心设计：一台机器只有一个真相源

页面上所有数字（功耗 W、CPU 温度、风扇 RPM、阵列状态、整机状态、曲线图、3D 里的指示灯与风扇转速、事件日志、拓扑节点）全部由一个纯函数算出，禁止任何地方硬编码：

```js
machineModel(S) -> { powerW, cpuTemp, fanRPM, arrayState, status, ... }
// S = { bootStage, load, ambient, fanFailed, psuCut, disks[4], rebuildPct }
```

滑杆、开关、拔盘、导览步骤都只修改输入 `S`，UI 只读模型输出。改模型公式 = 全站读数一起变，永远不会自相矛盾。

## 内容结构

- **部件（17）**：主板/BMC、CPU、内存、硬盘、风扇墙、双电源、网卡、前面板、LCD 诊断屏、硬盘背板、HBA 卡、OCP 网卡、后置 IO、CMOS 电池、BOSS 启动卡、导流罩、机箱——每个都有 3D 本体、编号点、白卡讲解（是什么 / 干什么 / 坏了什么症状，运维口径）与点击特写机位。
- **导览（6 步）**：上电自检 → 供电接入 → 散热启动 → 存储阵列上线 → 网络接入 → 满负载运行，每步一句运维提示 + 视角/高亮跟随。
- **课程（6 节）**：每节 = 导览按钮组 + 短文 + 1 道互动题（点选识别题 / 情景判断题）+ 一句 BIG IDEA；进度本地持久化，可用 `?lesson=n&step=m` 分享直达。
- **实验室**：负载、室温滑杆 + 风扇故障、断一路市电开关，后果全部按模型实时呈现。
- **RAID 5 模拟器**：点盘拔出 → 降级（314 W）；插回 → 重建；降级/重建中再拔第二块 → 阵列失效（307 W）。
- **事件日志**：Serial monitor 的服务器等价物——每一行都由模型状态变化实时生成，零写死。
- **拓扑视图**：电源 / 散热 / 数据三路流向图，节点数值与状态色实时读模型。

## 如何扩课时

1. 在 `src/data.js` 的 `LESSONS` 数组追加一节：`kicker / title / paras[] / guide[[部件key, 按钮名]] / quiz / idea`，底部轮播的线稿缩略图在 `src/ui/Panels.jsx` 的 `THUMBS` 里对应补一张。
2. quiz 两种现成题型：`{type:'click', part:'部件key', q, ok, no}`、`{type:'mcq', q, opts[], answer, ok, no}`。
3. 新部件：在 `PARTS` 加讲解，在 `src/parts/` 加建模并注册到 registry，保证 key 一致，编号点、导览、特写自动生效。
4. 新导览线：在 `STEPS` 加步即可，`apply()` 里可联动实验室控件（如满负载步自动把负载拉到 85%）。

## 已知边界（演示版）

- 3D 为风格化教学示意：比例、走线、部件细节都做了简化，顶盖默认拆除以便观察；模型基线：默认 254 W / 52.7 °C / 10,841 RPM，满负载 322 W / 64.4 °C / 14,689 RPM。
- 模型参数是手感校准的教学近似（量级真实、曲线单调），不是任何具体机型的实测数据。
- 无后端、无账号：学习进度只存浏览器 localStorage。
