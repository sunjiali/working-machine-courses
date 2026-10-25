# 真实细节清单 · 2U 机架服务器（v3 打磨依据）

搜集日期：2026-10-24。方法：image_search 看实物图（前面板/内部俯视/导流罩/riser/电源/风扇模块单品图）+ 厂商官方手册/QuickSpecs 核对数量与命名。
依据分三档：**官方**（手册/规格书明文）> **实拍**（评测/产品图可见形态）> **示意**（拿不准或为教学简化，条目后标「示意」）。

## 参考机型与来源

| 机型 | 借了什么 | 来源 |
|---|---|---|
| Dell PowerEdge R760 / R760xs | 前面板盘位配置、左右控制面板、LCD 诊断屏、32 DIMM、6 热插拔风扇 | 官方手册 Front view / 产品页规格（见下链接） |
| Dell PowerEdge R750 | 内部总布局（riser 1–4、风扇笼、导流罩、背板盖）、盘托架释放手柄、风扇笼蓝色释放杆 | 官方 Installation and Service Manual「Inside the system」 |
| HPE ProLiant DL380 Gen11 | 前面板元素清单（UID/Health/NIC 灯/iLO 口）、内部视图部件命名、后部 riser 分区、32 DIMM（16/CPU） | 官方 QuickSpecs Front/Internal/Rear View |
| Supermicro 2U（6029U / SSG-520P / SYS-6029UZ 零件表） | 半透明烟灰导流罩形态、蓝色风扇卡扣、80mm 热插拔风扇、PSU 灯语义、快拆导轨 | 产品俯视照片 + 官方规格页 + 零件清单 |

图片来源（image_search 实查）：DL380 Gen11 内部结构图（expresscomputersystems.com 产品页）、R750 前面板实拍（newserverlife.com 评测）、Supermicro 导流罩单品图（varle.lt / wiredzone.com，料号 MCP-310 系列）、Dell riser 4S 单品图（expresscomputersystems.com）、服务器热插拔电源单品图（cpumedics.com 等）。

---

## 1. 前面板

- **盘位排布/数量**：2U 前脸就是一整排盘仓。R760 配置谱：12×3.5"、8×2.5"、16×2.5"、24×2.5"、16×E3.S（官方）；DL380 Gen11 有 12LFF / 8SFF / 12EDSFF 三种前脸（官方 QuickSpecs）；Supermicro SSG-520P 为 12×3.5" 前置热插拔（官方）。→ 本课采用 **8×2.5" SFF 一排** 的框架形态（R760 8×2.5 配置），其中 4 仓装盘（RAID 教学组）、4 仓为空仓挡板——真机未满配时就是挡板封仓。
- **盘托架（caddy）细节**：每块盘是一只独立托架：金属边框 + 正面释放按钮（按下弹出拉手）+ 拉手 + 双灯（活动灯绿闪 / 状态灯绿-黄-红）（Dell R750 手册 drive carrier 步骤：press the release button to open the drive carrier release handle；实拍）。托架正面常贴容量/型号标签贴纸（实拍）。
- **左右挂耳 / 控制面板**：R760 左控制面板 = 系统健康+ID、状态 LED、iDRAC Quick Sync 2；右控制面板 = 电源按钮、USB 口、iDRAC Direct 微型口+LED（官方手册 Front view）。DL380 Gen11 前脸元素：Quick removal access panel、UID 按钮/LED、NIC 状态灯、Health LED、电源按钮/LED、iLO Service Port、USB 3.0、序列号抽拉标签（官方 QuickSpecs）。
- **电源键**：圆形带电源符号，内嵌绿灯（开机亮）（三家一致，实拍）。
- **ID 灯 / UID**：蓝色按钮+蓝灯，前后各一，按亮后机柜里一眼定位本机（DL380 QuickSpecs 明列 UID Button/LED；R760 为 system ID）。
- **液晶诊断屏（LCD panel）**：Dell 可选 LCD 前挡板：小液晶屏+左/选/右三键，正常白背光、故障变琥珀色并滚动错误码，可看/配 iDRAC IP（官方手册 LCD panel 章）。位置在前挡板左侧。→ 本课在前框上轨做一条简化 LCD 诊断条「示意」（位置简化，文案示意）。
- **通风孔**：空仓挡板与前挡板为冲孔阵列进风（实拍）；盘仓本身即进风道，前脸孔隙率直接决定进风量。

## 2. 风扇墙

- **个数**：R760/R750 均为 **最多 6 个热插拔风扇**（官方技术指南 "Up to six hot swap fans"；R750 手册 GPU 套件表 Fans: 6）；DL380 Gen11 为 **6 个双转子热插拔风扇模块、N+1 冗余**（官方 QuickSpecs DL380a 明文 "6 dualrotor hotplug fans with N+1 redundancy"，DL380 内部视图 Hot Plug Fans）。
- **形态**：每模块独立：方框外壳 + 双转子扇叶 + 顶部提手/指扣 + 释放卡扣（Dell 风扇笼带**蓝色释放杆**与导轨，官方手册 cooling fan cage assembly 步骤；Supermicro 风扇为 80×80×38mm 热插拔模块、带蓝色卡扣件，零件表 FAN-0118L4/0158L4）。
- **位置**：盘背板正后方、主板前缘，横贯整机宽度的一堵墙；模块编号 1–6 贴在顶面（实拍）「编号贴样式为示意」。

## 3. 主板区

- **双 CPU 方位**：两颗 CPU 在主板中后部左右并排（以风道为前后轴，两颗横向并列、各自独立散热器），DL380 内部视图 "Processors, heatsinks showing" 居中后部（官方）。
- **DIMM 槽真实数量与排布**：R760 = **32 个 DDR5 DIMM 槽（每 CPU 16）**（官方产品页）；DL380 Gen11 同为 **32 槽、每处理器 16 槽，满配图里是紧挨 CPU 两侧的密集槽阵**（官方 QuickSpecs 注 "Shown fully populated in 32 slots (16 per processor)"）。排布 = 每颗 CPU 左右各 8 槽（8 通道×2 DPC），槽体细长、带两端白色/彩色卡扣，内存条带颗粒与标签。→ 本课做 16 条（每 CPU 8：两侧各一组 4 条），密度取真机一半，教学可见性优先。
- **CPU 散热器**：被动鳍片式（无风扇），**鳍片平面顺风道（前→后）**让气流穿过，鳍片细密高耸（Supermicro/Dell 内部实拍一致）。
- **Riser 笼位置与形态**：机箱**后部**、两 PSU 之间/上方。R750 内部图明列 Riser 1、Riser 2 cage、Riser 3、Riser 4（官方）；DL380 后视图：Primary Riser（槽 1–3）、Secondary Riser（槽 4–6，需第二颗 CPU）、Tertiary Riser（槽 7–8）、OCP 3.0 槽（官方 QuickSpecs）。形态 = 金属笼架（立柱+横轨）里竖插 riser 板、扩展卡横置，卡后挡板与机箱后脸齐平（riser 单品实拍）。
- **板上其他**：VRM 供电区成排圆柱电容贴在 CPU 后侧、BMC/iLO 管理芯片、PCIe 长槽、白色丝印（板号/槽位号 A1…/警告字）（实拍；丝印具体文案「示意」）。

## 4. 导流罩（Air Shroud）

- **形状**：一整块成型塑料大盖：顶面平、前端斜面迎风、两侧裙边下扣，前缘压在风扇托盘的销钉上、无螺丝（Supermicro 手册：对齐 notch 与 pin、前端压 fan tray；功能为 "concentrate airflow to maximize fan efficiency"）。
- **覆盖范围**：罩住 **CPU + 全部 DIMM 区**（R750 内部图 air shroud 居主板中后部；DL380/Dell 皆然），风扇墙之后、riser 之前。
- **材质/印刷**：Dell 为浅灰不透明罩、表面加强筋+标签区（实拍）；Supermicro 常见**半透明烟灰色**，能透出下面 DIMM 轮廓（6029U 俯视产品图）。罩面印气流方向箭头/拆装警告字（实拍；具体文案「示意」）。→ 本课选 Supermicro 半透明风（教学能看见下面部件），选中 CPU/内存时淡出掀开为教学处理、非真机行为，特此注明。

## 5. 电源（PSU）

- **形态**：后部左右各一的长条模块（Supermicro 800W 模块尺寸 76×40×336mm，官方规格），后脸：AC 输入口 + **提手**（可翻折握把）+ 释放闩（多为彩色）+ 状态灯。
- **灯语义**：绿 = 正常工作；琥珀 = 断电/故障（Supermicro 手册明文 "An amber light … power is switched off. A green light indicates … operating"，且故障时前面板 PWR Fail LED 点亮）。Dell/HPE 同为绿正常、琥珀/红故障（官方 indicator codes 章）。
- **标签**：模块顶/侧面有大标签贴纸：功率（800W/1100W/1400W…）、80 PLUS 等级（Platinum/Titanium）、输入范围 100–240V~（实拍+R760 官方 PSU 谱：800W Platinum / 1100W Titanium 等）。
- **冗余**：双模块 1+1，任一坏掉另一全载（官方通则）。

## 6. 背板与走线

- **硬盘背板（backplane）**：盘仓正后方一整条 PCB，每仓位一个连接器对位盘托架尾部，上有管理芯片与供电口（DL380 内部视图明列 Drive Backplanes + Drive Cages；R750 有 drive backplane cover 盖板件，官方）。
- **线缆走向**：SAS/SlimSAS 数据线从背板**沿机箱侧壁**向后走到主板/RAID 卡（侧壁有线缆固定夹，R750 主板安装步骤明文 "cables … routed along the chassis wall and secured using the cable securing bracket"）；背板电源线（黑/黄黑）短距下行到主板供电口；前面板控制排线沿左侧壁到主板前缘（Supermicro 零件表 CBL-0318L front control cable）。颜色：SAS 线常见蓝/黑，电源线黑或黄黑（实拍）。

## 7. 机箱细节

- **导轨**：两侧快拆导轨（内轨贴机箱侧壁 + 外轨上机柜），Supermicro 零件表明列 Inner/Outer rail, quick-release（MCP-290 系列）；Dell/HPE 同为 sliding ReadyRails 类「导轨具体锁扣样式示意」。
- **提手**：R750 内部图第一号件就是 Handle——机箱后部/顶盖的搬运提手（官方 Inside the system 图注 1. Handle）。
- **通风孔阵列**：后脸 PSU/riser 区之外为冲孔出风阵列，前脸挡板为进风冲孔（实拍）。
- **顶盖**：快拆盖板带释放闩（DL380 "Quick removal access panel"）；本课为教学默认拆盖，不建模顶盖，仅此说明。
- **序列号/服务标签**：前面板抽拉式标签（DL380 Serial Number Label Pull Tab；Dell 为 Information tag/Service tag，官方）「本课以小贴纸示意」。

## 来源链接（官方优先，均为实查返回）

- Dell PowerEdge R760xs 官方手册 · Front view of the system：https://www.dell.com/support/manuals/en-tt/oth-r760xs/r760xs_ism_pub/Front-view-of-the-system?guid=guid-e8aaabd4-356c-46aa-973f-27e3709a9ed2&lang=en-us
- Dell PowerEdge R760xs 官方手册 · LCD panel：https://www.dell.com/support/manuals/es-sr/poweredge-r760xs/r760xs_ism_pub/lcd-panel?guid=guid-aad9d2dc-f617-4f9f-9868-2908285d7ada&lang=en-us
- Dell PowerEdge R760 官方产品页（32 DIMM / 盘位谱 / PSU 谱）：https://www.dell.com/en-nz/shop/ipovw/poweredge-r760
- Dell PowerEdge R750 官方手册 · Inside the system：https://www.dell.com/support/manuals/zh-hk/oth-r750/per750_ism_pub/inside-the-system?guid=guid-86215914-c63d-48ee-9978-9eb22ee2149c&lang=en-us
- Dell PowerEdge R750 官方手册（旧存档链接）：https://www.dell.com/support/manuals/en-in/poweredge-r750/per750_ism_pub/inside-the-system?guid=guid-86215914-c63d-48ee-9978-9eb22ee2149c&lang=en-us
- HPE ProLiant DL380 Gen11 官方 QuickSpecs（Front/Internal/Rear View）：https://www.hpe.com/psnow/downloadDoc/HPE%20ProLiant%20DL380%20Gen11-a50004307enw.pdf?id=a50004307enw.pdf&isFutureVersion=true&ver=8&form=false&preview=false&print=&servePdfFile=true&hf=slim&r=&section=&prelaunchSection=&softrollSection=&deepLink=&isLinearized=false&contentDisposition=attachment
- Supermicro SSG-520P-ACTR12L 官方规格（前面板按钮/LED、12 盘位、导流罩、双 800W PSU 尺寸）：https://www.supermicro.com/en/products/system/storage/2u/ssg-520p-actr12l?mlg=0
- Supermicro SuperServer 手册（导流罩装配 / PSU 灯语义 / 风扇热插拔）：https://cdn.cs.1worldsync.com/2f/58/2f586f3b-863e-4ba4-8866-ae98df9858b9.pdf
- Dell PowerEdge R750 评测（内部实拍）：https://newserverlife.com/articles/dell-emc-poweredge-r750-server-review/
- Supermicro 6029U 俯视内部图（半透明导流罩出处）：https://effectuscomputing.co.uk/product/effectus-6029u-2u/

## 与真机的已知取舍（教学口径）

- 盘位做 8×2.5" 框架、实装 4 盘 + 4 空仓挡板：RAID 模拟只建模 4 盘，盘数再多会稀释「拔一块试试」的教学焦点。
- 内存 16 条（真机满配 32），分组与相对位置按真机比例。
- 导流罩半透明 + 选中掀开是教学处理（真机为不透明或烟灰罩、且不会自动掀开）。
- LCD 诊断条位置简化到前框上轨（真机在可选 LCD 前挡板左侧）。

## 2026-10-25 新增部件的取舍（React 重构轮）
- **OCP 卡位置**：真机 OCP 3.0 槽位于后部 I/O 区（R750 在 riser 2 附近）；本课为让 OCP 与双口网卡的从属关系可视，作「网卡上方叠层卡 + 双立柱」示意，文案已注明 OCP 是独立槽位、不是插在网卡上。
- **RIO 后置 IO 板位置**：真机 iDRAC 专用口/串口位于后脸左区（与 PSU 相邻）；本课原设想位被 PSU1 后脸几何遮挡，改放网卡挡板正下方独立小板（双 RJ45：iDRAC + SERIAL 字签、后置 USB、活动灯），功能构成与真机一致、位置为教学可见性取舍。
- **BOSS 卡位置**：真机 BOSS-S2 多位于机内前部/中部专用槽（R750 在风扇墙后左侧区域）；本课放主板前左开放带竖卡，与真机同侧同区，文案注明双 M.2 RAID1 启动盘用途。
- **CMOS 电池位置**：R750 的 CR2032 在主板中后部（风扇墙之后）；本课放主板前右开放带（风扇墙后第一排可见区），与真机同为「风扇墙后主板面」口径，丝印 CR2032 字签按实物。
- **背板线缆**：双 SAS 线缆由背板上沿向后上方汇至 HBA 卡、电源线沿右侧壁至主板供电插头——按 R750 内部实拍的走向示意，线缆夹位置为示意。
