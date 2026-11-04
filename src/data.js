/* ================== 数据层：循证依据 / 食物库 / emoji 风格插画 ================== */

/* ---------- 文献依据 ---------- */
const EVIDENCE = {
  morton: {
    id: 'morton',
    label: 'Morton 2018 · 蛋白质剂量 meta 分析',
    text: '49 项 RCT、1863 人的 meta 回归显示：抗阻训练者的去脂体重增长在 <b>1.6 g/kg/天</b> 附近达到平台，95% 置信上限约 <b>2.2 g/kg/天</b>。这就是本应用「蛋白 1.6–2.2 g/kg」区间的来源。',
    link: 'https://bjsm.bmj.com/content/52/6/376'
  },
  helms: {
    id: 'helms',
    label: 'Helms 2014 · 备赛期（减脂）营养建议',
    text: '减脂期：每周减重 <b>0.5–1% 体重</b>；蛋白 <b>2.3–3.1 g/kg 去脂体重</b>（按体脂 15–20% 折算约 1.9–2.5 g/kg 体重）；脂肪 <b>15–30% 热量</b>；剩余热量给碳水。',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4033492/'
  },
  iraki: {
    id: 'iraki',
    label: 'Iraki 2019 · 增肌期（非赛季）营养建议',
    text: '增肌期：热量 <b>高于维持 10–20%</b>；每周增重 <b>0.25–0.5% 体重</b>；蛋白 <b>1.6–2.2 g/kg</b>；脂肪 <b>0.5–1.5 g/kg</b>；碳水吃满剩余热量，且不低于 <b>3–5 g/kg</b>。',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6680710/'
  },
  issn: {
    id: 'issn',
    label: 'ISSN 2017 · 蛋白与运动立场声明',
    text: '规律抗阻训练人群每日蛋白 <b>1.4–2.0 g/kg</b> 即可满足适应需求，单餐 <b>0.25–0.4 g/kg</b> 分 3–6 餐摄入更利于合成。',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/'
  },
  tipton: {
    id: 'tipton',
    label: 'Tipton 2015 · 运动损伤期营养支持',
    text: '受伤/制动期间能量需求下降但蛋白质需求上升，建议维持 <b>高蛋白（约 2 g/kg 以上）</b>、充足亮氨酸与维生素 D，同时避免热量过剩导致脂肪堆积。',
    link: 'https://pubmed.ncbi.nlm.nih.gov/25674949/'
  },
  protein_ceiling: {
    id: 'protein_ceiling',
    label: '高蛋白的边际收益（Morton 2018 / Antonio 系列）',
    text: '把每日蛋白从 1.6 提到 2.2 g/kg，去脂体重增长的<b>边际收益很小</b>；再往上（3.4–4.4 g/kg 的自由饮食研究）虽未见脂肪增加，但也没有更多肌肉增长，主要是饱腹感与食物热效应带来的「少吃」。所以本工具在增肌期给 1.8（区间 1.6–2.2），而不是 3+。',
    link: 'https://bjsm.bmj.com/content/52/6/376'
  },
  immobil: {
    id: 'immobil',
    label: '2021–2022 · 短期制动研究',
    text: '7 天单腿制动期间，即使把蛋白提高到 1.6–2.0 g/kg 以上，也<b>无法完全阻止</b>肌肉量与力量的下降 —— 所以「停训期多吃蛋白就能长肌肉」是误解，蛋白的作用是<b>把损失压到最小</b>。',
    link: 'https://pubmed.ncbi.nlm.nih.gov/34228957/'
  },
  memory: {
    id: 'memory',
    label: 'Ogasawara 2013 / Seaborne 2018 · 停训与肌肉记忆',
    text: '2–3 周停训后肌核数量与表观遗传标记仍被保留，复训时力量与围度恢复速度显著快于初次获得 —— 短暂休息不会「白练」，但前提是别在休息期持续热量盈余。',
    link: 'https://pubmed.ncbi.nlm.nih.gov/23372143/'
  },
  blueberry: {
    id: 'blueberry',
    label: '2023 RCT · 蓝莓与运动后炎症',
    text: '随机对照试验发现，运动前摄入蓝莓可提升运动后血浆中的<b>抗炎类 oxylipin</b> 水平，并促进恢复相关的脂质介质生成。',
    link: 'https://www.nature.com/articles/s41598-023-39269-1'
  },
  dietary: {
    id: 'dietary',
    label: '中国居民膳食指南 2022',
    text: '建议每日蔬菜 <b>300–500 g</b>、水果 <b>200–350 g</b>、全谷物及杂豆 <b>50–150 g</b>、大豆及坚果 <b>25–35 g</b>；烹调以蒸、煮、快炒为主，控油控盐。',
    link: 'https://www.chinanutri.cn/xwzx_238/xyxw/202204/t20220427_258627.html'
  },
  cooking: {
    id: 'cooking',
    label: '烹调方式与能量密度研究',
    text: '同一食材经油炸/爆炒后能量密度可上升 <b>50–150%</b>，主要来自吸油（每 100 g 米饭炒制可吸油 6–12 g，约 +55–110 kcal），且高温油炸会额外产生晚期糖基化终产物。蒸、煮、烤是更「划算」的做法。',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11063351/'
  }
};

/* ---------- SVG 插画：统一的 emoji 风格（粗描边 + 高光 + 平涂） ---------- */
const S = (inner) => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
const OUT = 'stroke="#2a1608" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';

const ICONS = {
  rice: S(`
    <ellipse cx="61" cy="103" rx="38" ry="6" fill="#000" opacity=".22"/>
    <path d="M14 56h92c0 28-19 46-46 46S14 84 14 56Z" fill="#f4f0e6" ${OUT}/>
    <path d="M14 56h92c0 8-2 15-6 21H20c-4-6-6-13-6-21Z" fill="#ff7a18" opacity=".9"/>
    <path d="M22 50c2-15 17-25 38-25s36 10 38 25c0 7-15 11-38 11S22 57 22 50Z" fill="#fffdf7" ${OUT}/>
    <path d="M32 44c3-8 14-13 28-13s25 5 28 13" fill="none" stroke="#d8d2c2" stroke-width="3" stroke-linecap="round"/>
    <circle cx="48" cy="38" r="3" fill="#e6dfcd"/><circle cx="66" cy="35" r="3" fill="#e6dfcd"/><circle cx="76" cy="42" r="3" fill="#e6dfcd"/>
  `),
  sweetpotato: S(`
    <ellipse cx="60" cy="104" rx="30" ry="5" fill="#000" opacity=".2"/>
    <path d="M30 78c-10-8-14-20-9-29 6-11 22-14 36-11 12 2 25 4 31 12 8 10 2 25-8 33-12 10-38 6-50-5Z" fill="#cf6a35" ${OUT}/>
    <path d="M40 52c6-4 16-4 24 0" stroke="#f0a06a" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M78 40c4-8 12-12 18-10-1 8-6 14-14 16" fill="#5fae4a" ${OUT}/>
    <circle cx="52" cy="70" r="2.5" fill="#8f4520"/><circle cx="73" cy="76" r="2.5" fill="#8f4520"/>
  `),
  oats: S(`
    <ellipse cx="60" cy="104" rx="32" ry="5" fill="#000" opacity=".2"/>
    <path d="M22 66h76c0 22-17 36-38 36S22 88 22 66Z" fill="#f2e3c8" ${OUT}/>
    <path d="M22 66h76c0 6-1 11-4 16H26c-3-5-4-10-4-16Z" fill="#ffa033"/>
    <path d="M30 60c4-12 15-18 30-18s26 6 30 18c0 5-13 8-30 8s-30-3-30-8Z" fill="#e9c88f" ${OUT}/>
    <ellipse cx="48" cy="54" rx="6" ry="3.4" fill="#f7e6c2" transform="rotate(-18 48 54)"/>
    <ellipse cx="66" cy="52" rx="6" ry="3.4" fill="#f7e6c2" transform="rotate(12 66 52)"/>
    <ellipse cx="58" cy="60" rx="6" ry="3.4" fill="#f7e6c2" transform="rotate(-4 58 60)"/>
  `),
  bread: S(`
    <ellipse cx="60" cy="104" rx="30" ry="5" fill="#000" opacity=".2"/>
    <path d="M28 44c0-12 14-20 32-20s32 8 32 20v46c0 6-5 10-11 10H39c-6 0-11-4-11-10V44Z" fill="#d99b52" ${OUT}/>
    <path d="M38 46c0-7 10-12 22-12s22 5 22 12v40H38V46Z" fill="#f2d3a3"/>
    <circle cx="50" cy="56" r="2.5" fill="#b47a3a"/><circle cx="68" cy="62" r="2.5" fill="#b47a3a"/><circle cx="58" cy="74" r="2.5" fill="#b47a3a"/>
  `),
  pasta: S(`
    <ellipse cx="58" cy="106" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M40 30v46" stroke="#9a9aa2" stroke-width="6" stroke-linecap="round"/>
    <path d="M34 26v-6M40 26v-6M46 26v-6" stroke="#9a9aa2" stroke-width="5" stroke-linecap="round"/>
    <path d="M34 30h12" stroke="#9a9aa2" stroke-width="6" stroke-linecap="round"/>
    <path d="M44 68c-10 10-8 26 4 32 14 7 30-2 32-16 2-12-8-20-18-18" fill="#f7d98a" ${OUT}/>
    <path d="M50 72c-6 8-4 18 4 22 10 5 20-1 22-10" fill="none" stroke="#e0b761" stroke-width="4" stroke-linecap="round"/>
    <path d="M62 96c-6-2-9-7-9-13" fill="none" stroke="#e0b761" stroke-width="4" stroke-linecap="round"/>
  `),
  banana: S(`
    <ellipse cx="60" cy="102" rx="30" ry="5" fill="#000" opacity=".2"/>
    <path d="M28 44c-2 26 12 48 38 50 14 1 24-6 26-14 1-5-4-8-9-6-18 8-38-4-40-28-1-7-14-9-15-2Z" fill="#ffd84d" ${OUT}/>
    <path d="M33 48c4 20 18 34 36 34" fill="none" stroke="#f5c518" stroke-width="4" stroke-linecap="round"/>
    <path d="M28 44c-3-8 2-14 7-14 3 0 4 4 3 8" fill="#8a6a1e" ${OUT}/>
    <path d="M90 74c4 0 7 2 6 6" fill="#8a6a1e" ${OUT}/>
  `),
  chicken: S(`
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M52 74 34 93" stroke="#2a1608" stroke-width="15" stroke-linecap="round"/>
    <path d="M52 74 34 93" stroke="#f6ecd9" stroke-width="9" stroke-linecap="round"/>
    <circle cx="32" cy="95" r="8" fill="#f6ecd9" stroke="#2a1608" stroke-width="5"/>
    <path d="M50 26c18-8 36 3 36 22 0 16-13 28-28 28-13 0-22-8-22-19 0-11 5-24 14-31Z" fill="#eaa286" ${OUT}/>
    <path d="M44 44c6-8 16-12 24-10" fill="none" stroke="#ffd3c0" stroke-width="5" stroke-linecap="round"/>
    <path d="M62 62c4-2 9-1 12 2" fill="none" stroke="#c98a6e" stroke-width="4" stroke-linecap="round"/>
  `),
  beef: S(`
    <ellipse cx="60" cy="103" rx="32" ry="5" fill="#000" opacity=".2"/>
    <path d="M24 62c-4-18 12-32 34-32 24 0 42 12 42 28 0 18-18 30-40 30-20 0-32-8-36-26Z" fill="#b8452f" ${OUT}/>
    <path d="M40 56c10-8 24-10 36-4 10 5 12 14 6 20-8 8-24 8-34 2-8-6-12-12-8-18Z" fill="#e0715a"/>
    <path d="M46 58c8-4 18-4 26 0M50 70c6 3 14 3 20 0" fill="none" stroke="#f7d5c9" stroke-width="4" stroke-linecap="round"/>
  `),
  egg: S(`
    <ellipse cx="60" cy="103" rx="34" ry="5" fill="#000" opacity=".2"/>
    <path d="M22 70c-6-10-2-24 8-30 8-5 16-2 22-8 8-8 22-10 32-3 12 8 16 22 10 32-6 12-18 16-26 14-6-2-10 4-18 6-14 4-22-2-28-11Z" fill="#fffdf8" ${OUT}/>
    <circle cx="62" cy="60" r="18" fill="#ffb02e" ${OUT}/>
    <ellipse cx="56" cy="53" rx="5" ry="3.4" fill="#ffd98a" transform="rotate(-20 56 53)"/>
  `),
  salmon: S(`
    <ellipse cx="61" cy="103" rx="32" ry="5" fill="#000" opacity=".2"/>
    <path d="M22 58c14-14 40-22 62-16 12 3 16 12 12 22-6 16-28 28-48 26-18-2-30-16-26-32Z" fill="#f98a6a" ${OUT}/>
    <path d="M36 52c10-4 22-5 32-2M42 64c10-3 22-3 32 0M50 76c8-2 16-2 24 1" fill="none" stroke="#fff0e6" stroke-width="5" stroke-linecap="round"/>
    <circle cx="40" cy="74" r="3" fill="#ffd2c0"/>
  `),
  shrimp: S(`
    <ellipse cx="60" cy="103" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M78 42c-16-8-34 0-40 14-7 18 4 34 22 36 12 1 20-6 18-14-2-6-10-6-16-3-8 4-14-1-13-9 1-9 12-15 22-13 8 2 13 0 14-4 1-3-3-5-7-7Z" fill="#ff8a5c" ${OUT}/>
    <path d="M44 62c4-6 12-9 19-8M50 78c6 1 12-1 16-5" fill="none" stroke="#ffc7b0" stroke-width="4" stroke-linecap="round"/>
    <path d="M78 42c6-2 10 0 11 5-4 2-8 2-11-5Z" fill="#e0512a" ${OUT}/>
    <circle cx="52" cy="56" r="2.6" fill="#2a1608"/>
  `),
  tofu: S(`
    <ellipse cx="60" cy="104" rx="30" ry="5" fill="#000" opacity=".2"/>
    <path d="M26 52l34-14 34 14v30L60 96 26 82V52Z" fill="#fffdf4" ${OUT}/>
    <path d="M26 52l34 14 34-14" fill="none" ${OUT}/>
    <path d="M60 66v30" fill="none" ${OUT}/>
    <path d="M40 62l14 6v18l-14-6V62Z" fill="#f2ecdb"/>
    <path d="M68 74h14v10H68z" fill="#ff7a18" opacity=".85" rx="2"/>
  `),
  milk: S(`
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M42 34h36v58c0 6-4 10-10 10H52c-6 0-10-4-10-10V34Z" fill="#f7f7fa" ${OUT}/>
    <path d="M42 34l10-14h16l10 14" fill="#e8e8ef" ${OUT}/>
    <path d="M46 60h28v18H46z" fill="#0a84ff" opacity=".85" rx="4"/>
    <path d="M50 66h20M50 72h12" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <circle cx="52" cy="80" r="3" fill="#f7f7fa" opacity=".8"/>
  `),
  yogurt: S(`
    <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
    <path d="M34 44h52l-5 48c-1 6-6 10-12 10H51c-6 0-11-4-12-10L34 44Z" fill="#fffdf8" ${OUT}/>
    <path d="M32 44h56c0 6-12 10-28 10S32 50 32 44Z" fill="#e8e2f2" ${OUT}/>
    <circle cx="52" cy="44" r="7" fill="#5b5bd6" ${OUT}/>
    <circle cx="70" cy="40" r="6" fill="#7b7bf0" ${OUT}/>
    <path d="M44 68h32M46 78h24" stroke="#d9d2e8" stroke-width="4" stroke-linecap="round"/>
  `),
  whey: S(`
    <ellipse cx="60" cy="104" rx="30" ry="5" fill="#000" opacity=".2"/>
    <path d="M44 40h32l10 34c2 8-4 14-12 14H46c-8 0-14-6-12-14l10-34Z" fill="#ffd7a8" ${OUT}/>
    <path d="M34 40h52c0 8-11 13-26 13S34 48 34 40Z" fill="#ffe9cc" ${OUT}/>
    <path d="M46 40c4-8 10-12 16-10 6 2 8 6 8 10" fill="#ffb066" ${OUT}/>
    <path d="M50 64h20" stroke="#e8a967" stroke-width="4" stroke-linecap="round"/>
    <path d="M60 50v8" stroke="#e8a967" stroke-width="4" stroke-linecap="round"/>
  `),
  avocado: S(`
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M60 18c14 0 30 16 30 38 0 24-14 40-30 40S30 80 30 56c0-22 16-38 30-38Z" fill="#3f7d38" ${OUT}/>
    <path d="M60 30c10 0 21 12 21 28 0 17-10 28-21 28s-21-11-21-28c0-16 11-28 21-28Z" fill="#c6e08a"/>
    <circle cx="60" cy="62" r="12" fill="#8a5a2b" ${OUT}/>
    <ellipse cx="56" cy="57" rx="3.5" ry="2.5" fill="#c08a52"/>
  `),
  almond: S(`
    <ellipse cx="60" cy="104" rx="30" ry="5" fill="#000" opacity=".2"/>
    <path d="M40 40c10-8 22 2 22 18s-10 30-20 30-18-8-18-22 6-20 16-26Z" fill="#d99a5b" ${OUT}/>
    <path d="M70 34c10-8 22 2 22 18s-10 30-20 30" fill="#c98a4b" ${OUT}/>
    <path d="M44 48c-4 8-4 18 0 26" fill="none" stroke="#f0c08a" stroke-width="4" stroke-linecap="round"/>
  `),
  oliveoil: S(`
    <ellipse cx="60" cy="104" rx="24" ry="5" fill="#000" opacity=".2"/>
    <path d="M50 22h20v12c10 8 14 16 14 28v26c0 6-4 10-10 10H46c-6 0-10-4-10-10V62c0-12 4-20 14-28V22Z" fill="#e9d18a" ${OUT}/>
    <path d="M50 22h20v8H50z" fill="#3f7d38" ${OUT}/>
    <path d="M42 64h36v30c0 4-2 6-6 6H48c-4 0-6-2-6-6V64Z" fill="#7cb342" opacity=".75"/>
    <path d="M60 70c5 6 7 10 7 14 0 5-3 8-7 8s-7-3-7-8c0-4 2-8 7-14Z" fill="#ffd84d" ${OUT}/>
  `),
  peanutbutter: S(`
    <ellipse cx="60" cy="105" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M34 44h52v48c0 6-4 10-10 10H44c-6 0-10-4-10-10V44Z" fill="#c98a4b" ${OUT}/>
    <path d="M30 38h60v12H30z" fill="#8a5a2b" ${OUT} rx="4"/>
    <path d="M42 62h36v24H42z" fill="#f7ead8" rx="4"/>
    <path d="M48 68h24M48 76h14" stroke="#c98a4b" stroke-width="4" stroke-linecap="round"/>
  `),
  broccoli: S(`
    <ellipse cx="60" cy="104" rx="24" ry="5" fill="#000" opacity=".2"/>
    <path d="M56 62v34c0 5 4 8 8 8" fill="none" stroke="#4f8f3a" stroke-width="9" stroke-linecap="round"/>
    <circle cx="44" cy="44" r="16" fill="#3f7d38" ${OUT}/>
    <circle cx="76" cy="44" r="16" fill="#3f7d38" ${OUT}/>
    <circle cx="60" cy="34" r="16" fill="#4a9440" ${OUT}/>
    <circle cx="48" cy="54" r="13" fill="#3f7d38" ${OUT}/>
    <circle cx="72" cy="54" r="13" fill="#4a9440" ${OUT}/>
    <circle cx="46" cy="40" r="3" fill="#6cb85c"/><circle cx="64" cy="30" r="3" fill="#6cb85c"/><circle cx="78" cy="44" r="3" fill="#6cb85c"/>
  `),
  spinach: S(`
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M60 92c-2-20-14-34-30-38 0 20 10 34 30 38Z" fill="#2f7a3a" ${OUT}/>
    <path d="M60 92c4-24 16-40 34-44 2 24-10 40-34 44Z" fill="#3d9448" ${OUT}/>
    <path d="M60 94c-2-26 2-44 10-56" fill="none" stroke="#4f8f3a" stroke-width="7" stroke-linecap="round"/>
    <path d="M36 62c8 6 14 14 18 24M76 60c-8 8-13 18-16 28" fill="none" stroke="#7cc47a" stroke-width="3.5" stroke-linecap="round"/>
  `),
  blueberry: S(`
    <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
    <circle cx="44" cy="66" r="20" fill="#3b3f8f" ${OUT}/>
    <circle cx="76" cy="70" r="17" fill="#4a4fa8" ${OUT}/>
    <circle cx="62" cy="44" r="15" fill="#555ab8" ${OUT}/>
    <path d="M44 50l4 6 6-2-4 6 5 4" fill="none" stroke="#2a2a66" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M62 30l4 6 6-1-4 5 4 4" fill="none" stroke="#2a2a66" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="37" cy="58" rx="4" ry="3" fill="#8f95e8" opacity=".9"/>
    <ellipse cx="70" cy="63" rx="3.5" ry="2.5" fill="#8f95e8" opacity=".9"/>
  `),
  apple: S(`
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M60 34c-8-8-26-10-34 4-8 15 2 40 14 52 7 7 14 7 20 2 6 5 13 5 20-2 12-12 22-37 14-52-8-14-26-12-34-4Z" fill="#e8424a" ${OUT}/>
    <path d="M60 34c0-8 2-14 8-18" fill="none" stroke="#6b4423" stroke-width="5" stroke-linecap="round"/>
    <path d="M68 18c8-6 16-4 20 2-6 8-14 10-20 4" fill="#3d9448" ${OUT}/>
    <ellipse cx="44" cy="52" rx="5" ry="8" fill="#ff8a90" opacity=".7" transform="rotate(-20 44 52)"/>
  `),
  tomato: S(`
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <circle cx="60" cy="64" r="34" fill="#e8423a" ${OUT}/>
    <path d="M60 32l-8 8-12-2 6 9-8 6 12 2 2 10 8-8 8 8 2-10 12-2-8-6 6-9-12 2Z" fill="#3d9448" ${OUT} transform="translate(0,-6) scale(.85) translate(10,6)"/>
    <ellipse cx="44" cy="54" rx="5" ry="7" fill="#ff8a80" opacity=".65" transform="rotate(-25 44 54)"/>
  `),
  carrot: S(`
    <ellipse cx="60" cy="104" rx="22" ry="5" fill="#000" opacity=".2"/>
    <path d="M46 52c-4-10 2-18 10-18 10 0 16 8 14 18l-14 44c-2 6-6 6-8 0L46 52Z" fill="#f07b2a" ${OUT}/>
    <path d="M56 30c-4-10 0-18 8-20M60 32c4-10 12-14 18-12M52 32c-8-6-16-4-20 2" fill="none" stroke="#3d9448" stroke-width="6" stroke-linecap="round"/>
    <path d="M52 58h10M54 72h8M56 86h6" stroke="#ffb27a" stroke-width="4" stroke-linecap="round"/>
  `),
  kiwi: S(`
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <circle cx="60" cy="62" r="36" fill="#8a6a3a" ${OUT}/>
    <circle cx="60" cy="62" r="28" fill="#a8cf4a"/>
    <circle cx="60" cy="62" r="9" fill="#fff6d8"/>
    <circle cx="60" cy="44" r="2.6" fill="#2a1608"/><circle cx="74" cy="50" r="2.6" fill="#2a1608"/>
    <circle cx="79" cy="66" r="2.6" fill="#2a1608"/><circle cx="70" cy="79" r="2.6" fill="#2a1608"/>
    <circle cx="52" cy="82" r="2.6" fill="#2a1608"/><circle cx="41" cy="72" r="2.6" fill="#2a1608"/>
    <circle cx="43" cy="52" r="2.6" fill="#2a1608"/><circle cx="54" cy="42" r="2.6" fill="#2a1608"/>
    <path d="M60 62l18-14M60 62l20 6M60 62l8 22M60 62l-8 22M60 62l-20 6M60 62l-18-14" stroke="#e8f5a8" stroke-width="2.5" opacity=".8"/>
  `),
  mushroom: S(`
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M26 60c0-20 15-34 34-34s34 14 34 34c0 6-6 8-12 8H38c-6 0-12-2-12-8Z" fill="#a9744a" ${OUT}/>
    <path d="M50 68h20v22c0 6-4 10-10 10s-10-4-10-10V68Z" fill="#f2e3c8" ${OUT}/>
    <circle cx="46" cy="50" r="5" fill="#d1a37a"/><circle cx="68" cy="44" r="6" fill="#d1a37a"/><circle cx="78" cy="58" r="4" fill="#d1a37a"/>
  `),
  potato: S(`
    <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
    <path d="M30 74c-8-12-4-30 10-38 16-9 36-4 44 8 8 12 4 28-10 36-14 8-36 6-44-6Z" fill="#c99a5b" ${OUT}/>
    <circle cx="48" cy="52" r="3" fill="#8a5a2b"/><circle cx="72" cy="66" r="3" fill="#8a5a2b"/><circle cx="58" cy="78" r="3" fill="#8a5a2b"/>
    <path d="M40 60c4-6 10-9 16-9" fill="none" stroke="#e8c08a" stroke-width="4" stroke-linecap="round"/>
  `)
};


/* ---------- 参数化插画：新增食材复用同一套 emoji 风格形状 ---------- */
const P = {
  bowl: (fill, rim = '#f4f0e6') => `
    <ellipse cx="60" cy="104" rx="30" ry="5" fill="#000" opacity=".2"/>
    <path d="M16 58h88c0 27-18 44-44 44S16 85 16 58Z" fill="${rim}" ${OUT}/>
    <path d="M24 54c3-14 16-22 36-22s33 8 36 22c0 6-14 10-36 10S24 60 24 54Z" fill="${fill}" ${OUT}/>
    <path d="M30 46c6-8 16-12 28-12" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".45"/>`,
  corn: (fill = '#ffd84d') => `
    <ellipse cx="60" cy="105" rx="22" ry="5" fill="#000" opacity=".2"/>
    <path d="M44 30c12-8 26-8 36 0 6 6 8 16 6 26-3 16-12 28-22 30-8 2-14-6-18-20-3-12-5-28-2-36Z" fill="${fill}" ${OUT}/>
    <path d="M52 34c-2 14 0 30 4 44M66 32c2 16 1 32-3 46M76 38c2 12 0 26-4 38" fill="none" stroke="#e8a91e" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M78 28c6-8 14-10 18-6-2 8-8 14-16 14" fill="#5fae4a" ${OUT}/>`,
  root: (fill, dot = '#8f4520', leaf = '#5fae4a') => `
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M34 78c-8-10-10-24-4-32 8-10 26-12 40-6 12 5 20 16 16 28-4 14-20 24-34 22-8-1-14-6-18-12Z" fill="${fill}" ${OUT}/>
    <circle cx="50" cy="62" r="2.6" fill="${dot}"/><circle cx="70" cy="72" r="2.6" fill="${dot}"/><circle cx="58" cy="80" r="2.6" fill="${dot}"/>
    <path d="M76 38c4-8 12-12 18-10-1 8-6 14-14 16" fill="${leaf}" ${OUT}/>`,
  meat: (fill, line = '#f7d5c9') => `
    <ellipse cx="60" cy="103" rx="30" ry="5" fill="#000" opacity=".2"/>
    <path d="M26 64c-4-18 12-32 34-32 24 0 40 12 40 28 0 18-18 30-40 30-20 0-30-8-34-26Z" fill="${fill}" ${OUT}/>
    <path d="M42 56c10-6 24-8 34-3M48 72c8 3 16 3 24 0" fill="none" stroke="${line}" stroke-width="5" stroke-linecap="round"/>`,
  fish: (fill, fin = '#f2a08a') => `
    <ellipse cx="60" cy="103" rx="28" ry="5" fill="#000" opacity=".2"/>
    <path d="M24 62c14-16 38-24 58-18 8 3 12 9 10 16-3 12-20 24-38 24-16 0-26-10-30-22Z" fill="${fill}" ${OUT}/>
    <path d="M84 44l14-8-2 18 12 6-14 8Z" fill="${fin}" ${OUT}/>
    <circle cx="38" cy="58" r="3" fill="#2a1608"/>
    <path d="M46 44c8-4 18-4 26 0" fill="none" stroke="#ffffff" stroke-width="3.5" opacity=".5" stroke-linecap="round"/>`,
  shell: (fill = '#e8c07a') => `
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M26 78c0-24 15-42 34-42s34 18 34 42c0 8-8 12-16 10-6-2-10 2-18 2s-12-4-18-2c-8 2-16-2-16-10Z" fill="${fill}" ${OUT}/>
    <path d="M42 78c2-16 9-28 18-32M60 78V44M78 78c-2-16-9-28-18-32" fill="none" stroke="#c9a05e" stroke-width="3" stroke-linecap="round"/>`,
  beanPod: (fill = '#8fd14f', bean = '#5fae4a') => `
    <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
    <path d="M22 88c0-26 18-46 40-46 16 0 26 10 26 22 0 14-14 24-30 26-14 2-28 6-36-2Z" fill="${fill}" ${OUT}/>
    <circle cx="48" cy="70" r="8" fill="${bean}"/><circle cx="66" cy="62" r="8" fill="${bean}"/><circle cx="80" cy="56" r="7" fill="${bean}"/>`,
  cheese: (fill = '#ffd166') => `
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M24 80 60 30l34 50-34 14Z" fill="${fill}" ${OUT}/>
    <circle cx="52" cy="72" r="5" fill="#e8b03a"/><circle cx="70" cy="80" r="4" fill="#e8b03a"/><circle cx="66" cy="58" r="3" fill="#e8b03a"/>`,
  cup: (fill = '#f7edd8') => `
    <ellipse cx="60" cy="104" rx="24" ry="5" fill="#000" opacity=".2"/>
    <path d="M38 34h44v56c0 8-6 12-12 12H50c-6 0-12-4-12-12V34Z" fill="#f7f7fa" ${OUT}/>
    <path d="M38 48h44v32c0 6-5 10-11 10H49c-6 0-11-4-11-10V48Z" fill="${fill}"/>
    <path d="M44 26h32" stroke="#d8d8e0" stroke-width="6" stroke-linecap="round"/>`,
  walnut: (fill = '#c98a4b') => `
    <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
    <circle cx="46" cy="66" r="20" fill="${fill}" ${OUT}/>
    <circle cx="74" cy="66" r="20" fill="${fill}" ${OUT}/>
    <path d="M46 50v32M40 58c6 6 6 16 0 22M74 50v32M80 58c-6 6-6 16 0 22" fill="none" stroke="#8a5a2b" stroke-width="3" stroke-linecap="round"/>`,
  nut: (fill = '#d99a5b') => `
    <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
    <path d="M42 40c10-8 22 2 22 18s-10 30-20 30-18-8-18-22 6-20 16-26Z" fill="${fill}" ${OUT}/>
    <path d="M72 36c10-8 22 2 22 18s-10 30-20 30" fill="${fill}" opacity=".9" ${OUT}/>
    <path d="M46 48c-4 8-4 18 0 26" fill="none" stroke="#f0c08a" stroke-width="4" stroke-linecap="round"/>`,
  seed: (fill = '#4a4a52') => `
    <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
    <ellipse cx="42" cy="62" rx="9" ry="14" fill="${fill}" ${OUT} transform="rotate(-20 42 62)"/>
    <ellipse cx="64" cy="54" rx="9" ry="14" fill="${fill}" ${OUT} transform="rotate(8 64 54)"/>
    <ellipse cx="78" cy="76" rx="9" ry="14" fill="${fill}" ${OUT} transform="rotate(-12 78 76)"/>
    <ellipse cx="52" cy="84" rx="8" ry="12" fill="${fill}" ${OUT} transform="rotate(24 52 84)"/>`,
  leafy: (fill = '#3d9448', dark = '#2f7a3a') => `
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M58 94c-4-22-16-36-32-40 0 22 12 36 32 40Z" fill="${dark}" ${OUT}/>
    <path d="M58 94c2-24 14-40 32-44 2 24-10 40-32 44Z" fill="${fill}" ${OUT}/>
    <path d="M58 96c-2-26 2-44 10-56" fill="none" stroke="#4f8f3a" stroke-width="7" stroke-linecap="round"/>`,
  floret: (fill = '#3f7d38', light = '#4a9440') => `
    <ellipse cx="60" cy="104" rx="22" ry="5" fill="#000" opacity=".2"/>
    <path d="M56 64v30c0 5 4 8 8 8" fill="none" stroke="#4f8f3a" stroke-width="9" stroke-linecap="round"/>
    <circle cx="44" cy="46" r="15" fill="${fill}" ${OUT}/>
    <circle cx="74" cy="46" r="15" fill="${light}" ${OUT}/>
    <circle cx="59" cy="36" r="15" fill="${light}" ${OUT}/>
    <circle cx="50" cy="56" r="12" fill="${fill}" ${OUT}/><circle cx="70" cy="56" r="12" fill="${light}" ${OUT}/>`,
  berry: (fill = '#e8424a', calyx = '#3d9448') => `
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M60 92c-18 0-30-12-30-26 0-14 12-22 30-22s30 8 30 22c0 14-12 26-30 26Z" fill="${fill}" ${OUT}/>
    <path d="M44 46l8 8 8-8 8 8 8-8" fill="none" stroke="${calyx}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="64" r="2" fill="#ffe0a0"/><circle cx="66" cy="72" r="2" fill="#ffe0a0"/><circle cx="72" cy="58" r="2" fill="#ffe0a0"/><circle cx="58" cy="80" r="2" fill="#ffe0a0"/>`,
  round: (fill, leaf = '#3d9448') => `
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <circle cx="60" cy="66" r="32" fill="${fill}" ${OUT}/>
    <path d="M60 34c0-8 3-14 10-18" fill="none" stroke="#6b4423" stroke-width="5" stroke-linecap="round"/>
    <path d="M70 18c8-4 15-2 18 4-6 7-13 8-18 2" fill="${leaf}" ${OUT}/>
    <ellipse cx="46" cy="54" rx="5" ry="7" fill="#ffffff" opacity=".45" transform="rotate(-24 46 54)"/>`,
  pepper: (fill = '#ffd60a') => `
    <ellipse cx="60" cy="104" rx="24" ry="5" fill="#000" opacity=".2"/>
    <path d="M42 44c0-8 8-12 18-12s18 4 18 12c4 14 4 34-2 44-4 6-8 8-16 8s-12-2-16-8c-6-10-6-30-2-44Z" fill="${fill}" ${OUT}/>
    <path d="M52 32c2-8 8-12 16-12" fill="none" stroke="#3d9448" stroke-width="7" stroke-linecap="round"/>
    <path d="M54 52c-2 12-2 24 2 34" fill="none" stroke="#ffffff" stroke-width="4" opacity=".45" stroke-linecap="round"/>`,
  stalk: (fill = '#8fce4f', tip = '#4a9440') => `
    <ellipse cx="60" cy="104" rx="22" ry="5" fill="#000" opacity=".2"/>
    <path d="M44 96c-4-26 0-46 8-58" fill="none" stroke="${fill}" stroke-width="9" stroke-linecap="round"/>
    <path d="M60 98c0-28 2-48 8-62" fill="none" stroke="${fill}" stroke-width="9" stroke-linecap="round"/>
    <path d="M42 40c4-8 10-12 16-12M64 38c4-8 10-12 16-12" fill="none" stroke="${tip}" stroke-width="6" stroke-linecap="round"/>`,
  cabbage: (fill = '#7b3fa0') => `
    <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
    <circle cx="60" cy="64" r="36" fill="${fill}" ${OUT}/>
    <path d="M60 28c-8 12-10 26-6 40M60 28c8 12 10 26 6 40M38 44c8 8 14 18 16 30M82 44c-8 8-14 18-16 30" fill="none" stroke="#b98ad0" stroke-width="4" stroke-linecap="round"/>
    <path d="M56 24c-4-8-2-14 4-18 4 6 4 12 0 18" fill="#4a9440" ${OUT}/>`,
  lotus: (fill = '#f0e6d2') => `
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <circle cx="60" cy="64" r="32" fill="${fill}" ${OUT}/>
    <circle cx="60" cy="64" r="24" fill="#fffaf0"/>
    <circle cx="60" cy="50" r="4" fill="#d8cbb0"/><circle cx="72" cy="58" r="4" fill="#d8cbb0"/>
    <circle cx="72" cy="72" r="4" fill="#d8cbb0"/><circle cx="60" cy="80" r="4" fill="#d8cbb0"/>
    <circle cx="48" cy="72" r="4" fill="#d8cbb0"/><circle cx="48" cy="58" r="4" fill="#d8cbb0"/>
    <circle cx="60" cy="64" r="4" fill="#d8cbb0"/>`,
  mushroomCap: (cap = '#a9744a', stem = '#f2e3c8') => `
    <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
    <path d="M28 62c0-18 14-30 32-30s32 12 32 30c0 6-6 8-12 8H40c-6 0-12-2-12-8Z" fill="${cap}" ${OUT}/>
    <path d="M50 70h20v20c0 6-4 10-10 10s-10-4-10-10V70Z" fill="${stem}" ${OUT}/>
    <circle cx="46" cy="54" r="4" fill="#d1a37a"/><circle cx="68" cy="48" r="5" fill="#d1a37a"/>`,
  kelp: (fill = '#3f6b3a') => `
    <ellipse cx="60" cy="104" rx="24" ry="5" fill="#000" opacity=".2"/>
    <path d="M42 94c-8-14-8-30 2-44 6-9 8-16 6-24 10 10 12 22 8 34-4 12-4 22 2 34Z" fill="${fill}" ${OUT}/>
    <path d="M66 94c-6-12-4-26 4-38 6-9 8-14 8-22 8 12 8 24 2 36-5 11-6 16-6 24Z" fill="${fill}" opacity=".85" ${OUT}/>`,
  glass: (fill = '#f7edd8') => `
    <ellipse cx="60" cy="104" rx="22" ry="5" fill="#000" opacity=".2"/>
    <path d="M42 30h36l-4 60c0 6-6 10-14 10s-14-4-14-10l-4-60Z" fill="#f7f7fa" ${OUT}/>
    <path d="M45 56h30l-2 34c0 4-5 7-13 7s-13-3-13-7l-2-34Z" fill="${fill}"/>
    <path d="M46 34h28" stroke="#ffffff" stroke-width="4" opacity=".6"/>`
};


/* 补充形状 */
P.cucumber = (fill = '#6fae5a') => `
  <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
  <rect x="34" y="26" width="22" height="66" rx="11" fill="${fill}" ${OUT} transform="rotate(12 45 59)"/>
  <path d="M40 42l2 6M44 58l2 6M48 74l2 6M56 36l2 6" stroke="#c8e8a8" stroke-width="3" stroke-linecap="round"/>`;
P.cashew = (fill = '#e0b878') => `
  <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
  <path d="M74 32c-20-6-38 8-40 28-2 18 12 30 26 28 13-2 20-13 16-22-4-8-15-9-22-4" fill="none" stroke="#2a1608" stroke-width="21" stroke-linecap="round"/>
  <path d="M74 32c-20-6-38 8-40 28-2 18 12 30 26 28 13-2 20-13 16-22-4-8-15-9-22-4" fill="none" stroke="${fill}" stroke-width="14" stroke-linecap="round"/>
  <path d="M52 44c-8 4-13 12-13 21" fill="none" stroke="#f7d9a8" stroke-width="4" stroke-linecap="round"/>`;
P.pistachio = (fill = '#e8d5a0', nut = '#8fbf4a') => `
  <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
  <ellipse cx="60" cy="64" rx="30" ry="26" fill="${fill}" ${OUT} transform="rotate(-12 60 64)"/>
  <path d="M60 40c-6 6-6 16 0 24 6-8 6-18 0-24Z" fill="${nut}" stroke="#2a1608" stroke-width="4" stroke-linejoin="round"/>
  <path d="M36 74c8 6 16 8 24 8" fill="none" stroke="#c9b075" stroke-width="3.5" stroke-linecap="round"/>`;
P.walnut = (fill = '#c98a4b') => `
  <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
  <circle cx="48" cy="66" r="22" fill="${fill}" ${OUT}/>
  <circle cx="72" cy="66" r="22" fill="${fill}" ${OUT}/>
  <path d="M48 48c-6 8-6 20 0 28M42 56c5 5 5 15 0 20M48 70c5-5 11-5 16 0M72 48c6 8 6 20 0 28M78 56c-5 5-5 15 0 20" fill="none" stroke="#8a5a2b" stroke-width="3.2" stroke-linecap="round"/>`;
P.grape = (fill = '#7b5ea8') => `
  <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
  <circle cx="60" cy="46" r="12" fill="${fill}" ${OUT}/>
  <circle cx="46" cy="62" r="12" fill="${fill}" ${OUT}/><circle cx="74" cy="62" r="12" fill="${fill}" ${OUT}/>
  <circle cx="52" cy="80" r="12" fill="${fill}" ${OUT}/><circle cx="68" cy="80" r="12" fill="${fill}" ${OUT}/>
  <circle cx="60" cy="64" r="12" fill="${fill}" ${OUT}/>
  <path d="M60 34c0-8 4-14 10-16" fill="none" stroke="#5f8f3a" stroke-width="5" stroke-linecap="round"/>
  <path d="M70 14c8-4 14-2 17 4-6 6-13 7-17 2" fill="#3d9448" ${OUT}/>`;

Object.assign(ICONS, {
  brownrice: S(P.bowl('#c8a165')),
  quinoa: S(P.bowl('#d9c58a')),
  corn: S(P.corn()),
  potato: S(P.root('#c99a5b')),
  purplesweet: S(P.root('#6b4a8f', '#3a2450', '#5fae4a')),
  yam: S(P.root('#e8d5b0', '#c9b08a', '#8a9a5b')),
  soba: S(P.bowl('#b9a07a')),
  chickenleg: S(P.meat('#e8a07e')),
  porkloin: S(P.meat('#f0b7ad')),
  lamb: S(P.meat('#c9543f')),
  cod: S(P.fish('#f2f2ea', '#d8d8c8')),
  bass: S(P.fish('#c8d8c0', '#a8b898')),
  hairtail: S(P.fish('#c0c8d0', '#a0a8b0')),
  tuna: S(P.fish('#e0715a')),
  clam: S(P.shell()),
  edamame: S(P.beanPod('#8fd14f', '#5fae4a')),
  chickpea: S(P.beanPod('#e8c07a', '#d9a84e')),
  soymilk: S(P.cup('#f7edd8')),
  cheese: S(P.cheese()),
  walnut: S(P.walnut()),
  cashew: S(P.cashew('#e0b878')),
  pistachio: S(P.pistachio()),
  pumpkinseed: S(P.seed('#e8d5a8')),
  sesame: S(P.seed('#4a4a52')),
  flaxseed: S(P.seed('#a8763a')),
  peanut: S(P.nut('#d9a05b')),
  asparagus: S(P.stalk('#8fce4f')),
  okra: S(P.stalk('#6aaa4a')),
  bellpepper: S(P.pepper('#ffb02e')),
  purplecabbage: S(P.cabbage()),
  lettuce: S(P.leafy('#7bc47a')),
  cucumber: S(P.cucumber()),
  radish: S(P.root('#f0f0ea', '#c8ccc0', '#5fae4a')),
  lotus: S(P.lotus()),
  kelp: S(P.kelp()),
  woodear: S(P.mushroomCap('#4a3a30', '#3a2a20')),
  kingoyster: S(P.mushroomCap('#e8dcc8', '#f2ead8')),
  orange: S(P.round('#ff9f0a')),
  strawberry: S(P.berry('#e8424a')),
  grape: S(P.grape()),
  pear: S(P.round('#c8d86a')),
  dragonfruit: S(P.round('#e84a7a'))
});


/* 零食插画 */
P.cookie = (fill = '#d9a05b', chip = '#6b4423') => `
  <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".2"/>
  <circle cx="60" cy="62" r="34" fill="${fill}" ${OUT}/>
  <circle cx="48" cy="50" r="5" fill="${chip}"/><circle cx="72" cy="58" r="5" fill="${chip}"/>
  <circle cx="56" cy="76" r="4.5" fill="${chip}"/><circle cx="74" cy="78" r="4" fill="${chip}"/>
  <circle cx="40" cy="70" r="3.5" fill="${chip}"/>`;
P.cake = (cream = '#ffd9e0', body = '#e8c07a', top = '#e8424a') => `
  <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
  <path d="M28 52h64v40c0 6-6 10-14 10H42c-8 0-14-4-14-10V52Z" fill="${body}" ${OUT}/>
  <path d="M28 52h64v12c0 6-14 10-32 10S28 70 28 64V52Z" fill="${cream}" ${OUT}/>
  <circle cx="60" cy="40" r="8" fill="${top}" ${OUT}/>
  <path d="M44 78h32M48 88h24" stroke="#c9a05e" stroke-width="4" stroke-linecap="round"/>`;
P.chocolate = (fill = '#5a3a2a', wrap = '#c9a05e') => `
  <ellipse cx="60" cy="104" rx="28" ry="5" fill="#000" opacity=".2"/>
  <path d="M30 44h60v44H30z" fill="${fill}" ${OUT}/>
  <path d="M50 44v44M70 44v44M30 66h60" stroke="#3a2418" stroke-width="3"/>
  <path d="M30 44h60v10H30z" fill="${wrap}" ${OUT}/>
  <path d="M36 58h8M56 58h8M76 58h8" stroke="#7a5438" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
P.chips = (bag = '#e8424a', chip = '#ffd166') => `
  <ellipse cx="60" cy="104" rx="22" ry="5" fill="#000" opacity=".2"/>
  <path d="M40 26h40l6 66H34l6-66Z" fill="${bag}" ${OUT}/>
  <path d="M34 34h52" stroke="#ffffff" stroke-width="4" opacity=".35"/>
  <ellipse cx="52" cy="62" rx="10" ry="7" fill="${chip}" transform="rotate(-18 52 62)"/>
  <ellipse cx="70" cy="76" rx="10" ry="7" fill="${chip}" transform="rotate(12 70 76)"/>
  <path d="M46 46c4-4 10-5 14-2" stroke="#ffffff" stroke-width="3" opacity=".5" fill="none"/>`;
P.icecream = (scoop = '#ffd9e0', cone = '#e8c07a') => `
  <ellipse cx="60" cy="104" rx="20" ry="5" fill="#000" opacity=".2"/>
  <path d="M40 44h40l-20 48-20-48Z" fill="${cone}" ${OUT}/>
  <path d="M46 54l14 32M74 54L60 86" stroke="#c9a05e" stroke-width="3" opacity=".8"/>
  <circle cx="60" cy="36" r="18" fill="${scoop}" ${OUT}/>
  <path d="M50 30c4-4 10-5 14-2" stroke="#ffffff" stroke-width="4" opacity=".6" fill="none" stroke-linecap="round"/>`;

Object.assign(ICONS, {
  cookie: S(P.cookie()),
  cake: S(P.cake()),
  chocolate: S(P.chocolate()),
  darkchoc: S(P.chocolate('#2f1c12')),
  chips: S(P.chips()),
  icecream: S(P.icecream()),
  nut: S(P.nut('#b8864b')),
  noodlecup: S(P.bowl('#f2d3a3')),
  soda: S(P.cup('#c8503a')),
  tea: S(P.cup('#c9a06e'))
});

/* ---------- 食物库 ---------- */
/* 数值为每 100 g 可食部（熟食按熟重、生食按生重），参考《中国食物成分表》第 6 版与 USDA */
const FOODS = [
  /* ---------------- 碳水 ---------------- */
  {
    id: 'rice', cat: 'carb', name: '米饭', state: '蒸熟', icon: 'rice',
    kcal: 116, p: 2.6, c: 25.9, f: 0.3, fiber: 0.3,
    unit: { name: '一个拳头', g: 130 },
    tag: '主食',
    tip: '只吃蒸/煮的。同样一碗饭，做成蛋炒饭要多 10–15 g 油（+90–135 kcal），增肌期变成多余脂肪，减脂期直接超预算。',
    why: '烹调方式对能量密度的影响远大于食材本身：米饭本身几乎不含脂肪，炒制后吸油量可达 6–12 g/100 g。',
    ev: ['cooking']
  },
  {
    id: 'sweetpotato', cat: 'carb', name: '红薯', state: '蒸', icon: 'sweetpotato',
    kcal: 90, p: 1.1, c: 20.7, f: 0.2, fiber: 1.6,
    unit: { name: '一个中等大小', g: 200 },
    tag: '低 GI',
    tip: '带皮蒸或烤，别拔丝、别油炸。烤到流糖的版本 GI 更高但纤维仍在，训练后 2 小时吃没问题。',
    why: '膳食纤维 1.6 g/100 g，饱腹感强、体积大，减脂期最容易「吃饱又不超」的主食。',
    ev: ['dietary']
  },
  {
    id: 'oats', cat: 'carb', name: '燕麦片', state: '干重', icon: 'oats',
    kcal: 367, p: 15, c: 61.6, f: 6.7, fiber: 5.3,
    unit: { name: '一小袋', g: 40 },
    tag: '慢碳',
    tip: '选配料表只有「燕麦」的原味片，用热水或牛奶泡，别选加糖脆麦片（含糖常 >20%）。',
    why: 'β-葡聚糖可延缓胃排空、平稳血糖；40 g 干燕麦≈15 g 碳水+6 g 蛋白，是早餐最省事的一餐。',
    ev: ['dietary']
  },
  {
    id: 'bread', cat: 'carb', name: '全麦面包', state: '成品', icon: 'bread',
    kcal: 246, p: 9, c: 46, f: 3.5, fiber: 6,
    unit: { name: '一片', g: 35 },
    tag: '便携',
    tip: '看配料表第一位是不是「全麦粉」。抹果酱不如夹鸡蛋+生菜，同样热量下蛋白质翻倍。',
    why: '全谷物保留麸皮与胚芽，纤维与 B 族维生素显著高于白面包，饱腹感更强。',
    ev: ['dietary']
  },
  {
    id: 'pasta', cat: 'carb', name: '意面', state: '煮熟', icon: 'pasta',
    kcal: 158, p: 5.8, c: 30.9, f: 0.9, fiber: 1.8,
    unit: { name: '一盘', g: 180 },
    tag: '低 GI',
    tip: '煮到「弹牙」（al dente），GI 比煮软低 20–30%。酱料用番茄+牛肉末，别用奶油白酱。',
    why: '硬质小麦意面的淀粉结构更紧密，消化更慢，训练前 2–3 小时吃很稳。',
    ev: ['cooking']
  },
  {
    id: 'banana', cat: 'carb', name: '香蕉', state: '可食部', icon: 'banana',
    kcal: 93, p: 1.4, c: 22, f: 0.2, fiber: 1.2,
    unit: { name: '一根中等', g: 120 },
    tag: '训练前',
    tip: '训练前 30–60 分钟吃一根，钾和快碳都能用上。别打成加糖奶昔——那会变成一杯「液体热量」。',
    why: '每 100 g 含钾约 256 mg，出汗多时补钾比补钠更容易被忽略。',
    ev: ['issn']
  },

  /* ---------------- 蛋白 ---------------- */
  {
    id: 'chicken', cat: 'protein', name: '鸡胸肉', state: '生重', icon: 'chicken',
    kcal: 133, p: 24.6, c: 0.6, f: 1.9, fiber: 0,
    unit: { name: '一个手掌', g: 100 },
    tag: '瘦蛋白',
    tip: '水煮、蒸、空气炸都行；别裹粉油炸（面衣+吸油，一份能多 150 kcal）。腌 20 分钟再煎能少放一半油。',
    why: '蛋白质密度最高的常见肉类之一（24.6 g/100 g），脂肪仅 1.9 g，是减脂期的主力蛋白。',
    ev: ['morton', 'helms']
  },
  {
    id: 'beef', cat: 'protein', name: '瘦牛肉', state: '生重', icon: 'beef',
    kcal: 106, p: 20.2, c: 2, f: 2.3, fiber: 0,
    unit: { name: '一个手掌', g: 100 },
    tag: '补铁',
    tip: '炖、卤、煎都可以，选里脊/牛腱。别做「水煮牛肉」——那一盆油的热量比肉本身高 3 倍。',
    why: '血红素铁吸收率显著高于植物铁，肌酸含量也高；增肌期每周 2–3 次红肉有实际价值。',
    ev: ['iraki']
  },
  {
    id: 'egg', cat: 'protein', name: '鸡蛋', state: '可食部', icon: 'egg',
    kcal: 144, p: 13.3, c: 2.8, f: 8.8, fiber: 0,
    unit: { name: '一个', g: 50 },
    tag: '全价蛋白',
    tip: '水煮、蒸蛋最好；煎蛋一个要 5 g 油（+45 kcal）。全蛋一起吃，蛋黄里的胆碱和维生素 D 别浪费。',
    why: 'PDCAAS 评分 1.0 的参考蛋白，一个鸡蛋约 6.7 g 蛋白 + 4.4 g 脂肪，是最容易计量的蛋白单位。',
    ev: ['morton']
  },
  {
    id: 'salmon', cat: 'protein', name: '三文鱼', state: '生重', icon: 'salmon',
    kcal: 139, p: 17.2, c: 0, f: 7.8, fiber: 0,
    unit: { name: '一块', g: 120 },
    tag: 'Omega-3',
    tip: '带皮煎或烤，别反复油炸。每周 2 次，替代一部分鸡胸，顺便把 Omega-3 补上。',
    why: 'EPA/DHA 有抗炎作用，对训练后的恢复与关节不适有帮助；也能帮你自然凑够脂肪配额。',
    ev: ['tipton']
  },
  {
    id: 'shrimp', cat: 'protein', name: '虾', state: '生重', icon: 'shrimp',
    kcal: 93, p: 18.6, c: 2.8, f: 0.8, fiber: 0,
    unit: { name: '中等 8 只', g: 100 },
    tag: '极瘦',
    tip: '白灼、清蒸最佳；油焖大虾的油和糖会让它从「减脂神器」变成「热量炸弹」。',
    why: '蛋白质 18.6 g、脂肪不到 1 g，是减脂后期最容易塞进热量预算的蛋白来源。',
    ev: ['helms']
  },
  {
    id: 'tofu', cat: 'protein', name: '北豆腐', state: '生重', icon: 'tofu',
    kcal: 98, p: 12.2, c: 3, f: 4.8, fiber: 0.5,
    unit: { name: '半盒', g: 200 },
    tag: '植物蛋白',
    tip: '蒸、炖、凉拌；麻婆豆腐的油和豆瓣酱要算进预算。和米饭同吃可互补氨基酸。',
    why: '大豆蛋白是唯一氨基酸谱接近动物蛋白的常见植物蛋白，且含钙与大豆异黄酮。',
    ev: ['morton']
  },
  {
    id: 'milk', cat: 'protein', name: '牛奶', state: '全脂', icon: 'milk',
    kcal: 65, p: 3.3, c: 4.9, f: 3.6, fiber: 0,
    unit: { name: '一杯', g: 250 },
    tag: '液体热量',
    tip: '训练后或早餐喝。减脂期换脱脂（-80 kcal/杯）；增肌期全脂更划算。',
    why: '酪蛋白+乳清双蛋白结构，消化时间跨度长，睡前 1 杯能覆盖夜间氨基酸供应。',
    ev: ['issn']
  },
  {
    id: 'yogurt', cat: 'protein', name: '希腊酸奶', state: '无糖', icon: 'yogurt',
    kcal: 59, p: 10, c: 3.6, f: 0.4, fiber: 0,
    unit: { name: '一杯', g: 150 },
    tag: '高蛋白',
    tip: '只买配料表「生牛乳+菌」的，别买风味酸奶（一份常含 15–20 g 糖）。加蓝莓比加蜂蜜好。',
    why: '过滤乳清后蛋白浓缩到 10 g/100 g，是零食里最容易达标的选择。',
    ev: ['issn']
  },
  {
    id: 'whey', cat: 'protein', name: '乳清蛋白粉', state: '干粉', icon: 'whey',
    kcal: 400, p: 80, c: 8, f: 6, fiber: 0,
    unit: { name: '一勺', g: 30 },
    tag: '补剂',
    tip: '一勺 30 g≈24 g 蛋白，只在「今天蛋白没吃够」时用，它不能替代正餐的微量营养素。',
    why: '吸收快、亮氨酸含量高，训练后 0.3 g/kg 的剂量能有效拉高肌肉蛋白合成。',
    ev: ['morton', 'issn']
  },

  /* ---------------- 脂肪 ---------------- */
  {
    id: 'avocado', cat: 'fat', name: '牛油果', state: '可食部', icon: 'avocado',
    kcal: 160, p: 2, c: 8.5, f: 14.7, fiber: 6.7,
    unit: { name: '半个', g: 100 },
    tag: '单不饱和',
    tip: '生吃、拌沙拉、压成酱抹全麦面包。别加热到冒烟，也别做成加糖奶昔。',
    why: '油酸为主，纤维 6.7 g/100 g，是「脂肪+纤维」的组合，饱腹感远好于同等热量的油。',
    ev: ['helms']
  },
  {
    id: 'almond', cat: 'fat', name: '巴旦木', state: '原味', icon: 'almond',
    kcal: 578, p: 21, c: 21.6, f: 49.9, fiber: 12.5,
    unit: { name: '一小把', g: 15 },
    tag: '坚果',
    tip: '只买原味、无盐、非油炸的。15 g 就够，边看剧边吃很容易一次干掉 100 g（+578 kcal）。',
    why: '坚果的咀嚼感和纤维能提升饱腹感；研究发现适量坚果摄入与体重控制并不冲突。',
    ev: ['dietary']
  },
  {
    id: 'oliveoil', cat: 'fat', name: '橄榄油', state: '可食部', icon: 'oliveoil',
    kcal: 899, p: 0, c: 0, f: 99.9, fiber: 0,
    unit: { name: '一瓷勺', g: 10 },
    tag: '烹调油',
    tip: '凉拌或低温快炒。用喷油壶能把一餐的油从 15 g 降到 5 g，这是最容易被忽略的热量差。',
    why: '每克脂肪 9 kcal，10 g 油=90 kcal。控制油量比控制主食更能决定减脂成败。',
    ev: ['cooking']
  },
  {
    id: 'peanutbutter', cat: 'fat', name: '花生酱', state: '无糖', icon: 'peanutbutter',
    kcal: 588, p: 25, c: 20, f: 50, fiber: 6,
    unit: { name: '一瓷勺', g: 16 },
    tag: '高热量',
    tip: '选配料表只有「花生」的。一勺 16 g≈94 kcal，抹一片面包刚好，抹两片就超了。',
    why: '蛋白+脂肪组合，增肌期是方便的热量补充；减脂期必须称重，它是最容易「手一抖就超」的食物。',
    ev: ['cooking']
  },

  /* ---------------- 果蔬 ---------------- */
  {
    id: 'broccoli', cat: 'veg', name: '西兰花', state: '生重', icon: 'broccoli',
    kcal: 36, p: 4.1, c: 4.3, f: 0.6, fiber: 1.6,
    unit: { name: '一个拳头', g: 100 },
    tag: '维C·维K',
    tip: '蒸 3–5 分钟或快炒，别水煮太久（维 C 流失可达 50%）。冷冻西兰花营养保留其实很好。',
    why: '每 100 g 维 C 约 51 mg、维 K 约 101 μg；十字花科还含萝卜硫素，是抗氧化与解毒通路的研究热点。',
    macro: ['维C 51 mg：胶原合成、铁吸收、免疫', '维K 101 μg：凝血与骨钙沉积', '萝卜硫素：激活 Nrf2 抗氧化通路'],
    ev: ['dietary']
  },
  {
    id: 'spinach', cat: 'veg', name: '菠菜', state: '生重', icon: 'spinach',
    kcal: 28, p: 2.6, c: 4.5, f: 0.3, fiber: 2.2,
    unit: { name: '一大把', g: 80 },
    tag: '叶酸·镁',
    tip: '焯水 30 秒去掉部分草酸再炒，钙和铁的吸收会更好。别和浓茶同餐。',
    why: '叶酸、镁、硝酸盐含量突出；膳食硝酸盐可在体内转化为 NO，有助于运动时的血流与耐力。',
    macro: ['叶酸 194 μg：红细胞生成、DNA 合成', '镁 79 mg：肌肉收缩与神经传导', '硝酸盐：提升 NO、改善血流'],
    ev: ['dietary']
  },
  {
    id: 'blueberry', cat: 'veg', name: '蓝莓', state: '可食部', icon: 'blueberry',
    kcal: 57, p: 0.7, c: 14.5, f: 0.3, fiber: 2.4,
    unit: { name: '一小碗', g: 100 },
    tag: '花青素',
    tip: '新鲜或冷冻都行（冷冻花青素保留很好）。别做成果酱或蓝莓派，那加的是糖不是莓。',
    why: '2023 年随机对照试验显示，运动前摄入蓝莓可提升运动后血浆抗炎 oxylipin 水平，促进恢复。',
    macro: ['花青素：抗炎、改善血管内皮功能', '维C 9.7 mg：抗氧化', '膳食纤维 2.4 g：肠道菌群底物'],
    ev: ['blueberry']
  },
  {
    id: 'apple', cat: 'veg', name: '苹果', state: '可食部', icon: 'apple',
    kcal: 53, p: 0.4, c: 13.5, f: 0.2, fiber: 1.7,
    unit: { name: '一个', g: 180 },
    tag: '果胶',
    tip: '带皮吃，果胶和多数多酚都在皮里。榨汁会丢掉纤维，饱腹感直接减半。',
    why: '果胶是可溶性纤维，延缓胃排空、平稳餐后血糖；整个水果的饱腹感远高于等热量果汁。',
    macro: ['果胶：降低餐后血糖波动、喂养益生菌', '槲皮素：抗炎、抗氧化', '维C 4.6 mg'],
    ev: ['dietary']
  },
  {
    id: 'tomato', cat: 'veg', name: '番茄', state: '可食部', icon: 'tomato',
    kcal: 20, p: 0.9, c: 4, f: 0.2, fiber: 0.5,
    unit: { name: '一个', g: 150 },
    tag: '番茄红素',
    tip: '加热+少量油烹调，番茄红素吸收率显著提高。生吃补维 C，熟吃补番茄红素。',
    why: '番茄红素是脂溶性类胡萝卜素，与心血管健康和前列腺健康的相关性在流行病学研究中较一致。',
    macro: ['番茄红素：脂溶性抗氧化，需油脂助吸收', '维C 14 mg', '钾 179 mg：调节血压'],
    ev: ['dietary']
  },
  {
    id: 'carrot', cat: 'veg', name: '胡萝卜', state: '生重', icon: 'carrot',
    kcal: 39, p: 1, c: 8.8, f: 0.2, fiber: 2.8,
    unit: { name: '一根', g: 120 },
    tag: 'β-胡萝卜素',
    tip: '油炒或和肉同炖，β-胡萝卜素是脂溶性的，水煮后弃水会损失不少。',
    why: 'β-胡萝卜素可在体内转化为维生素 A，对视力、免疫与皮肤屏障都关键。',
    macro: ['β-胡萝卜素 4130 μg：维生素 A 前体', '膳食纤维 2.8 g', '钾 190 mg'],
    ev: ['dietary']
  },
  {
    id: 'kiwi', cat: 'veg', name: '猕猴桃', state: '可食部', icon: 'kiwi',
    kcal: 61, p: 0.8, c: 14.5, f: 0.6, fiber: 2.6,
    unit: { name: '一个', g: 80 },
    tag: '维C 之王',
    tip: '直接吃或拌无糖酸奶。别只喝果汁——两个猕猴桃的纤维在榨汁后基本没了。',
    why: '每 100 g 维 C 约 62 mg，是橙子的 1.5 倍；还含猕猴桃蛋白酶，餐后吃有助于蛋白质消化。',
    macro: ['维C 62 mg：抗氧化、促进铁吸收', '膳食纤维 2.6 g', '维生素 K 40 μg'],
    ev: ['dietary']
  },
  {
    id: 'mushroom', cat: 'veg', name: '香菇', state: '鲜重', icon: 'mushroom',
    kcal: 26, p: 2.2, c: 5.2, f: 0.3, fiber: 3.3,
    unit: { name: '一把', g: 80 },
    tag: '鲜味·多糖',
    tip: '晒 30 分钟再烹饪可提升维生素 D 含量；干香菇泡发的水别倒，那是鲜味来源。',
    why: '香菇多糖与 β-葡聚糖在免疫调节方面有较多研究；高纤维低热量，是减脂期增加饱腹的利器。',
    macro: ['香菇多糖：免疫调节研究热点', '膳食纤维 3.3 g', '麦角甾醇：经日晒转化为维生素 D2'],
    ev: ['dietary']
  },

  /* ---------- 扩充：更多优质食材（参考《中国食物成分表》第 6 版） ---------- */
  {
    id: 'brownrice', cat: 'carb', name: '糙米', state: '蒸熟', icon: 'brownrice',
    kcal: 112, p: 2.6, c: 24.0, f: 0.9, fiber: 1.8,
    unit: { name: '一碗', g: 130 }, tag: '全谷物',
    tip: '和白米 1:1 混着煮，口感更容易接受；别加猪油拌饭，那是纯脂肪。',
    why: '保留麸皮与胚芽，膳食纤维约是白米的 6 倍，餐后血糖上升更平缓。',
    ev: ['dietary']
  },
  {
    id: 'quinoa', cat: 'carb', name: '藜麦', state: '煮熟', icon: 'quinoa',
    kcal: 120, p: 4.4, c: 21.3, f: 1.9, fiber: 2.8,
    unit: { name: '一碗', g: 130 }, tag: '完全蛋白',
    tip: '煮前冲洗 2 遍去皂苷（否则发苦），和米饭同煮最省事。',
    why: '含全部 9 种必需氨基酸，是少见的「碳水里带完整蛋白」的主食。',
    ev: ['issn']
  },
  {
    id: 'corn', cat: 'carb', name: '玉米', state: '水煮', icon: 'corn',
    kcal: 112, p: 4.0, c: 22.8, f: 1.2, fiber: 2.9,
    unit: { name: '一根', g: 150 }, tag: '高纤维',
    tip: '水煮或蒸，别刷黄油、别做奶油玉米浓汤——热量能翻三倍。',
    why: '纤维 2.9 g/100 g，且含叶黄素/玉米黄素，对眼睛有额外好处。',
    ev: ['dietary'],
    macro: ['叶黄素 + 玉米黄素：视网膜黄斑色素', '膳食纤维 2.9 g：饱腹与肠道', '维B1：碳水代谢']
  },
  {
    id: 'potato', cat: 'carb', name: '土豆', state: '蒸', icon: 'potato',
    kcal: 77, p: 2.0, c: 17.2, f: 0.1, fiber: 0.7,
    unit: { name: '一个中等', g: 150 }, tag: '高饱腹',
    tip: '蒸或烤，放凉一点再吃会产生抗性淀粉。薯条、薯片不算土豆。',
    why: '同等热量下饱腹感指数在常见食物里名列前茅，减脂期很划算。',
    ev: ['dietary']
  },
  {
    id: 'purplesweet', cat: 'carb', name: '紫薯', state: '蒸', icon: 'purplesweet',
    kcal: 82, p: 1.3, c: 19.0, f: 0.2, fiber: 1.6,
    unit: { name: '一个', g: 150 }, tag: '花青素',
    tip: '整块蒸，别捣成泥加糖；紫薯泥配炼乳是甜品，不是主食。',
    why: '花青素含量高于普通红薯，抗氧化能力更强；碳水和红薯接近。',
    ev: ['blueberry'],
    macro: ['花青素：抗氧化、抗炎', '膳食纤维 1.6 g', '钾：调节血压']
  },
  {
    id: 'soba', cat: 'carb', name: '荞麦面', state: '煮熟', icon: 'soba',
    kcal: 137, p: 5.0, c: 28.0, f: 0.6, fiber: 2.0,
    unit: { name: '一份', g: 180 }, tag: '低 GI',
    tip: '看配料表荞麦粉占比（越高越好），过冷水后拌，别用浓汤底。',
    why: '荞麦含芦丁，且升糖指数低于白面条，适合训练前 2 小时吃。',
    ev: ['cooking']
  },
  {
    id: 'yam', cat: 'carb', name: '山药', state: '蒸', icon: 'yam',
    kcal: 57, p: 1.9, c: 12.4, f: 0.2, fiber: 0.8,
    unit: { name: '一段', g: 150 }, tag: '易消化',
    tip: '蒸着吃或炖汤，别拔丝（糖+油）。削皮戴手套，黏液容易痒。',
    why: '热量低、质地软，肠胃敏感或训练前不想吃太撑时的好选择。',
    ev: ['dietary']
  },

  {
    id: 'chickenleg', cat: 'protein', name: '鸡腿肉', state: '去皮生重', icon: 'chickenleg',
    kcal: 121, p: 19.9, c: 0, f: 4.5, fiber: 0,
    unit: { name: '一个', g: 100 }, tag: '划算',
    tip: '去皮再烤/炖，脂肪能少一半；带皮炸鸡腿一份轻松 400 kcal。',
    why: '比鸡胸嫩、比牛肉便宜，蛋白 19.9 g 且脂肪可控，适合天天吃。',
    ev: ['morton']
  },
  {
    id: 'porkloin', cat: 'protein', name: '猪里脊', state: '生重', icon: 'porkloin',
    kcal: 155, p: 20.2, c: 0.7, f: 7.9, fiber: 0,
    unit: { name: '一个手掌', g: 100 }, tag: '常见',
    tip: '切丝快炒或水煮后凉拌；糖醋里脊是「糖+油」双重陷阱。',
    why: '中国市场最容易买到的瘦猪肉部位，蛋白 20 g 且B族维生素丰富。',
    ev: ['morton']
  },
  {
    id: 'lamb', cat: 'protein', name: '羊腿肉', state: '瘦，生重', icon: 'lamb',
    kcal: 118, p: 20.5, c: 0.2, f: 3.9, fiber: 0,
    unit: { name: '一个手掌', g: 100 }, tag: '补铁',
    tip: '涮、炖、烤都行，选腿肉/里脊；羊肉串的肥油和撒料要算进去。',
    why: '血红素铁与锌含量高，冬天或红肉摄入不足时是很好的轮换。',
    ev: ['iraki']
  },
  {
    id: 'cod', cat: 'protein', name: '鳕鱼', state: '生重', icon: 'cod',
    kcal: 88, p: 20.4, c: 0.5, f: 0.5, fiber: 0,
    unit: { name: '一块', g: 120 }, tag: '极瘦',
    tip: '清蒸或煎，别裹面包糠油炸（「鳕鱼排」多半是油炸加工品）。',
    why: '蛋白 20 g、脂肪不到 1 g，减脂后期最缺的就是这种「纯蛋白」。',
    ev: ['helms']
  },
  {
    id: 'bass', cat: 'protein', name: '鲈鱼', state: '生重', icon: 'bass',
    kcal: 105, p: 18.6, c: 0, f: 3.4, fiber: 0,
    unit: { name: '一条', g: 200 }, tag: '清蒸首选',
    tip: '清蒸 8–10 分钟，淋少量蒸鱼豉油即可；红烧会多用 15 g 油。',
    why: '肉质细、刺少，蛋白 18.6 g 且脂肪质量优于红肉禽皮。',
    ev: ['dietary']
  },
  {
    id: 'hairtail', cat: 'protein', name: '带鱼', state: '生重', icon: 'hairtail',
    kcal: 127, p: 17.7, c: 3.1, f: 4.9, fiber: 0,
    unit: { name: '一段', g: 80 }, tag: '家常',
    tip: '干煎或清蒸，别做糖醋/红烧；煎之前擦干水分能少吸油。',
    why: '沿海家常鱼，蛋白 17.7 g；注意它本身脂肪不算低，油要少放。',
    ev: ['helms']
  },
  {
    id: 'tuna', cat: 'protein', name: '金枪鱼罐头', state: '水浸', icon: 'tuna',
    kcal: 116, p: 25.5, c: 0, f: 1.0, fiber: 0,
    unit: { name: '一罐', g: 120 }, tag: '便携',
    tip: '只买「水浸」，油浸的多 10 g 油；拌沙拉别再加蛋黄酱。',
    why: '开罐即食、蛋白 25.5 g，出差或没时间做饭时最靠谱的蛋白来源。',
    ev: ['issn']
  },
  {
    id: 'clam', cat: 'protein', name: '蛤蜊', state: '生重', icon: 'clam',
    kcal: 62, p: 10.1, c: 2.8, f: 1.1, fiber: 0,
    unit: { name: '10 只', g: 60 }, tag: '高锌',
    tip: '吐沙后清蒸或煮汤，别用大量油爆炒；汤汁本身很咸，少喝。',
    why: '锌和维生素 B12 含量突出，热量极低，是海鲜里最「减脂友好」的。',
    ev: ['dietary']
  },
  {
    id: 'edamame', cat: 'protein', name: '毛豆', state: '煮熟', icon: 'edamame',
    kcal: 131, p: 13.1, c: 10.5, f: 5.0, fiber: 4.0,
    unit: { name: '一小碗', g: 100 }, tag: '植物蛋白',
    tip: '盐水煮 5 分钟当零食；别选「蒜香/五香」油炸款。',
    why: '蛋白 13 g + 纤维 4 g 的组合，在植物性食物里很少见。',
    ev: ['dietary'],
    macro: ['植物蛋白 13.1 g', '膳食纤维 4.0 g', '叶酸与钾']
  },
  {
    id: 'chickpea', cat: 'protein', name: '鹰嘴豆', state: '煮熟', icon: 'chickpea',
    kcal: 164, p: 8.9, c: 27.4, f: 2.6, fiber: 7.6,
    unit: { name: '半碗', g: 100 }, tag: '高纤维',
    tip: '提前泡 8 小时再煮；做成鹰嘴豆泥时别猛加橄榄油和芝麻酱。',
    why: '纤维 7.6 g/100 g，是主食+蛋白的双重角色，饱腹感极强。',
    ev: ['dietary'],
    macro: ['膳食纤维 7.6 g', '叶酸', '植物铁（配维C更好吸收）']
  },
  {
    id: 'soymilk', cat: 'protein', name: '豆浆', state: '无糖', icon: 'soymilk',
    kcal: 31, p: 3.0, c: 1.2, f: 1.6, fiber: 0.5,
    unit: { name: '一杯', g: 250 }, tag: '植物蛋白',
    tip: '只买无糖的；早餐店的「甜豆浆」一杯常含 15–20 g 糖。',
    why: '液体蛋白，训练后或早餐搭配主食很方便，热量只有牛奶的一半。',
    ev: ['issn']
  },
  {
    id: 'cheese', cat: 'protein', name: '低脂奶酪', state: '每 100 g', icon: 'cheese',
    kcal: 252, p: 24.0, c: 2.5, f: 16.0, fiber: 0,
    unit: { name: '一片', g: 20 }, tag: '浓缩',
    tip: '一片 20 g 就够，夹全麦面包；别选「奶酪棒/再制干酪」零食。',
    why: '蛋白 24 g、钙含量高，但脂肪也高，按片计量最稳妥。',
    ev: ['issn']
  },

  {
    id: 'walnut', cat: 'fat', name: '核桃', state: '原味', icon: 'walnut',
    kcal: 646, p: 14.9, c: 19.1, f: 58.8, fiber: 9.5,
    unit: { name: '3 颗', g: 12 }, tag: 'Omega-3',
    tip: '每天 2–3 颗，原味带壳最好；琥珀核桃是糖裹的，不算坚果。',
    why: '植物性 α-亚麻酸（ALA）最丰富的常见坚果，对血脂友好。',
    ev: ['dietary']
  },
  {
    id: 'cashew', cat: 'fat', name: '腰果', state: '原味', icon: 'cashew',
    kcal: 559, p: 17.3, c: 41.6, f: 36.7, fiber: 3.6,
    unit: { name: '一小把', g: 15 }, tag: '坚果',
    tip: '选原味烘焙，别选盐焗/蜂蜜；碳水在坚果里偏高，按把计量。',
    why: '镁含量高，口感甜，是替代薯片最容易坚持的零食。',
    ev: ['dietary']
  },
  {
    id: 'pistachio', cat: 'fat', name: '开心果', state: '原味', icon: 'pistachio',
    kcal: 562, p: 20.6, c: 21.9, f: 45.3, fiber: 8.2,
    unit: { name: '一小把', g: 15 }, tag: '高蛋白坚果',
    tip: '带壳吃，剥壳的过程本身就能让你吃慢一点、吃少一点。',
    why: '蛋白 20.6 g、纤维 8.2 g，在坚果里蛋白密度最高。',
    ev: ['dietary']
  },
  {
    id: 'pumpkinseed', cat: 'fat', name: '南瓜籽', state: '原味', icon: 'pumpkinseed',
    kcal: 574, p: 30.2, c: 10.7, f: 49.0, fiber: 6.0,
    unit: { name: '一勺', g: 10 }, tag: '高镁',
    tip: '撒在酸奶或沙拉上，10 g 就够；别当瓜子一样嗑一整包。',
    why: '镁和锌含量在种子类里名列前茅，蛋白密度也高（30 g/100 g）。',
    ev: ['dietary']
  },
  {
    id: 'sesame', cat: 'fat', name: '黑芝麻', state: '熟', icon: 'sesame',
    kcal: 559, p: 19.1, c: 24.0, f: 46.1, fiber: 14.0,
    unit: { name: '一勺', g: 10 }, tag: '补钙',
    tip: '磨碎或做成芝麻糊吸收更好；芝麻糊市售款常加大量糖。',
    why: '钙含量在植物食物里极高（约 780 mg/100 g），但热量也高。',
    ev: ['dietary']
  },
  {
    id: 'flaxseed', cat: 'fat', name: '亚麻籽', state: '原味', icon: 'flaxseed',
    kcal: 534, p: 18.3, c: 28.9, f: 42.2, fiber: 27.3,
    unit: { name: '一勺', g: 10 }, tag: '高纤维',
    tip: '整粒难消化，买粉或自己磨；开封后冷藏，容易氧化。',
    why: '纤维 27 g/100 g + ALA，是便秘和血脂问题的双重帮手。',
    ev: ['dietary']
  },
  {
    id: 'peanut', cat: 'fat', name: '花生', state: '生/原味', icon: 'peanut',
    kcal: 574, p: 24.8, c: 21.7, f: 44.3, fiber: 7.7,
    unit: { name: '一小把', g: 15 }, tag: '平价',
    tip: '水煮或原味烘烤；油炸花生米配酒，是热量最容易失控的组合。',
    why: '蛋白 24.8 g/100 g，是中国最便宜的高蛋白坚果，但脂肪同样高。',
    ev: ['dietary']
  },

  {
    id: 'asparagus', cat: 'veg', name: '芦笋', state: '生重', icon: 'asparagus',
    kcal: 22, p: 1.4, c: 4.9, f: 0.1, fiber: 1.9,
    unit: { name: '6 根', g: 100 }, tag: '叶酸',
    tip: '焯水 1 分钟或快炒，别煮太久；根部老的部分削皮再炒。',
    why: '叶酸含量突出，且含天门冬酰胺，是少数「低热量高营养密度」的蔬菜。',
    ev: ['dietary'],
    macro: ['叶酸 52 μg：DNA 合成与红细胞生成', '膳食纤维 1.9 g', '维生素 K']
  },
  {
    id: 'okra', cat: 'veg', name: '秋葵', state: '生重', icon: 'okra',
    kcal: 37, p: 1.8, c: 7.5, f: 0.2, fiber: 3.9,
    unit: { name: '8 根', g: 80 }, tag: '黏液纤维',
    tip: '整根焯水 2 分钟再切，黏液别洗掉——那正是可溶性纤维。',
    why: '可溶性纤维含量高，对餐后血糖和肠道菌群都有好处。',
    ev: ['dietary'],
    macro: ['可溶性膳食纤维 3.9 g', '维C 21 mg', '叶酸']
  },
  {
    id: 'bellpepper', cat: 'veg', name: '彩椒', state: '生重', icon: 'bellpepper',
    kcal: 26, p: 1.0, c: 6.0, f: 0.2, fiber: 2.1,
    unit: { name: '一个', g: 120 }, tag: '维C 之王',
    tip: '生吃或快炒 1 分钟；维 C 怕热怕水，久煮等于白吃。',
    why: '维 C 含量约 128 mg/100 g，是橙子的 2 倍多，且热量只有 26 kcal。',
    ev: ['dietary'],
    macro: ['维生素 C 128 mg：抗氧化、促铁吸收', '维A（β-胡萝卜素）', '膳食纤维 2.1 g']
  },
  {
    id: 'purplecabbage', cat: 'veg', name: '紫甘蓝', state: '生重', icon: 'purplecabbage',
    kcal: 25, p: 1.4, c: 6.2, f: 0.1, fiber: 2.5,
    unit: { name: '1/4 个', g: 150 }, tag: '花青素',
    tip: '切丝凉拌或大火快炒；加一点醋能保住紫色（花青素对 pH 敏感）。',
    why: '花青素 + 硫代葡萄糖苷双重抗氧化，是沙拉里最划算的「颜色」。',
    ev: ['blueberry'],
    macro: ['花青素：抗氧化、抗炎', '维生素 K', '膳食纤维 2.5 g']
  },
  {
    id: 'lettuce', cat: 'veg', name: '生菜', state: '生重', icon: 'lettuce',
    kcal: 15, p: 1.3, c: 2.0, f: 0.3, fiber: 0.7,
    unit: { name: '一大把', g: 80 }, tag: '低热量',
    tip: '洗净生吃或涮 10 秒；沙拉酱才是热量来源，用油醋汁替代。',
    why: '热量极低但体积大，是「先吃菜再吃饭」控制食量的首选。',
    ev: ['dietary'],
    macro: ['维生素 K', '叶酸', '膳食纤维 0.7 g']
  },
  {
    id: 'cucumber', cat: 'veg', name: '黄瓜', state: '生重', icon: 'cucumber',
    kcal: 16, p: 0.8, c: 2.9, f: 0.2, fiber: 0.5,
    unit: { name: '一根', g: 200 }, tag: '补水',
    tip: '带皮吃，洗净即可；拍黄瓜少放香油和糖。',
    why: '95% 是水，热量 16 kcal/100 g，饿的时候最安全的「填肚子」食物。',
    ev: ['dietary'],
    macro: ['水分 95%', '维生素 K', '钾']
  },
  {
    id: 'radish', cat: 'veg', name: '白萝卜', state: '生重', icon: 'radish',
    kcal: 21, p: 0.9, c: 5.0, f: 0.1, fiber: 1.0,
    unit: { name: '一段', g: 150 }, tag: '平价',
    tip: '炖汤或凉拌，别用大量油煎；萝卜炖牛腩的汤要少喝（油和盐）。',
    why: '热量低、体积大，含芥子油苷，是中国冬天最便宜的减脂蔬菜。',
    ev: ['dietary'],
    macro: ['维生素 C 21 mg', '膳食纤维 1.0 g', '钾']
  },
  {
    id: 'lotus', cat: 'veg', name: '莲藕', state: '生重', icon: 'lotus',
    kcal: 73, p: 1.9, c: 16.4, f: 0.2, fiber: 1.2,
    unit: { name: '一节', g: 150 }, tag: '含淀粉',
    tip: '它算「半主食」，吃了藕就少吃半碗饭；凉拌比糖醋更合适。',
    why: '碳水 16 g/100 g，常被当成蔬菜吃过量——这是最容易被忽略的热量。',
    ev: ['dietary'],
    macro: ['维生素 C 44 mg', '膳食纤维 1.2 g', '钾']
  },
  {
    id: 'kelp', cat: 'veg', name: '海带', state: '鲜重', icon: 'kelp',
    kcal: 13, p: 1.2, c: 2.1, f: 0.1, fiber: 0.5,
    unit: { name: '一小把', g: 50 }, tag: '碘',
    tip: '凉拌或煮汤，先泡去多余盐分；甲亢人群需要限制。',
    why: '碘含量极高，一小把就够一天所需；但别天天大量吃。',
    ev: ['dietary'],
    macro: ['碘：甲状腺激素合成', '可溶性纤维（褐藻胶）', '钾']
  },
  {
    id: 'woodear', cat: 'veg', name: '木耳', state: '水发', icon: 'woodear',
    kcal: 27, p: 1.5, c: 6.0, f: 0.2, fiber: 2.6,
    unit: { name: '一小把', g: 50 }, tag: '铁·纤维',
    tip: '冷水泡 2 小时即可，别泡过夜（易滋生细菌）；焯水后再凉拌。',
    why: '铁和可溶性纤维含量高，口感脆，是中式凉菜里最实用的配菜。',
    ev: ['dietary'],
    macro: ['铁 5.5 mg（植物铁）', '膳食纤维 2.6 g', '多糖类物质']
  },
  {
    id: 'kingoyster', cat: 'veg', name: '杏鲍菇', state: '鲜重', icon: 'kingoyster',
    kcal: 35, p: 1.3, c: 8.3, f: 0.1, fiber: 2.1,
    unit: { name: '一根', g: 80 }, tag: '口感肉',
    tip: '切片干煎或烤，能做出「素肉」口感；别用大量黄油煎。',
    why: '低热量高纤维，咀嚼感强，减脂期最能骗过「想吃肉」的嘴。',
    ev: ['dietary'],
    macro: ['膳食纤维 2.1 g', '钾', '多糖类']
  },
  {
    id: 'orange', cat: 'veg', name: '橙子', state: '可食部', icon: 'orange',
    kcal: 48, p: 0.8, c: 11.1, f: 0.2, fiber: 2.4,
    unit: { name: '一个', g: 180 }, tag: '维C',
    tip: '整吃别榨汁——一杯橙汁要用 4 个橙子，纤维全丢。',
    why: '维 C 33 mg/100 g + 类黄酮，是冬季最稳定的水果来源。',
    ev: ['dietary'],
    macro: ['维生素 C 33 mg', '类黄酮（橙皮苷）', '膳食纤维 2.4 g']
  },
  {
    id: 'strawberry', cat: 'veg', name: '草莓', state: '可食部', icon: 'strawberry',
    kcal: 32, p: 1.0, c: 7.1, f: 0.2, fiber: 1.1,
    unit: { name: '8 颗', g: 100 }, tag: '低糖',
    tip: '流水冲洗，别泡；蘸炼乳/巧克力是甜品，不是水果。',
    why: '含糖量在水果里偏低，维 C 47 mg/100 g，解馋不涨秤。',
    ev: ['blueberry'],
    macro: ['维生素 C 47 mg', '花青素', '叶酸']
  },
  {
    id: 'grape', cat: 'veg', name: '葡萄', state: '可食部', icon: 'grape',
    kcal: 45, p: 0.4, c: 10.3, f: 0.3, fiber: 0.4,
    unit: { name: '一小串', g: 100 }, tag: '高糖',
    tip: '数着吃，一次 10–15 颗；葡萄干是浓缩糖，热量翻 3 倍。',
    why: '含白藜芦醇与花青素，但糖密度高，是「容易吃超」的水果。',
    ev: ['dietary'],
    macro: ['白藜芦醇：抗氧化', '花青素', '钾']
  },
  {
    id: 'pear', cat: 'veg', name: '梨', state: '可食部', icon: 'pear',
    kcal: 51, p: 0.4, c: 13.3, f: 0.2, fiber: 3.1,
    unit: { name: '一个', g: 200 }, tag: '高纤维',
    tip: '带皮吃，纤维主要在皮里；蒸梨加冰糖治咳嗽是糖水，不是药。',
    why: '纤维 3.1 g/100 g 且水分足，秋冬最容易被忽略的「通便水果」。',
    ev: ['dietary'],
    macro: ['膳食纤维 3.1 g（果胶）', '钾', '维生素 C 6 mg']
  },
  {
    id: 'dragonfruit', cat: 'veg', name: '火龙果', state: '可食部', icon: 'dragonfruit',
    kcal: 55, p: 1.1, c: 13.3, f: 0.2, fiber: 1.6,
    unit: { name: '半个', g: 200 }, tag: '通便',
    tip: '直接吃，别打成果汁；红心比白心花青素多，也更甜一点。',
    why: '籽提供不溶性纤维，对便秘明显；但糖不算低，一次半个足够。',
    ev: ['dietary'],
    macro: ['膳食纤维 1.6 g（含籽）', '花青素（红心）', '镁']
  },

  /* ---------- 新增原食材 ---------- */
  {
    id: 'millet', cat: 'carb', name: '小米', state: '煮熟', icon: 'oats',
    kcal: 121, p: 3.5, c: 25.0, f: 1.2, fiber: 0.7,
    unit: { name: '一小碗', g: 150 }, tag: '养胃',
    tip: '和米饭轮着吃，别只喝小米粥（粥的碳水密度低，容易喝多）。',
    why: '含 B 族维生素和色氨酸，口感软，肠胃敏感时的替代主食。',
    ev: ['dietary']
  },
  {
    id: 'taro', cat: 'carb', name: '芋头', state: '蒸', icon: 'potato',
    kcal: 56, p: 2.2, c: 12.7, f: 0.2, fiber: 1.0,
    unit: { name: '一个', g: 150 }, tag: '低热量',
    tip: '蒸着吃或炖汤，别做芋泥加糖加油；它算主食不算菜。',
    why: '碳水 12.7 g/100 g 但热量只有 56 kcal，体积大、饱腹强。',
    ev: ['dietary']
  },
  {
    id: 'duckbreast', cat: 'protein', name: '鸭胸', state: '去皮生重', icon: 'chickenleg',
    kcal: 130, p: 19.5, c: 0, f: 5.0, fiber: 0,
    unit: { name: '一块', g: 120 }, tag: '换口味',
    tip: '去皮煎或烤，别做酱鸭、烤鸭（糖和油都高）。',
    why: '蛋白 19.5 g 且富含铁，鸡胸吃腻了可以轮换。',
    ev: ['morton']
  },
  {
    id: 'liver', cat: 'protein', name: '猪肝', state: '生重', icon: 'beef',
    kcal: 129, p: 19.3, c: 5.0, f: 3.5, fiber: 0,
    unit: { name: '一小份', g: 80 }, tag: '补铁·维A',
    tip: '每周 1 次、每次 50–80 g 就够；爆炒前焯水去腥，别过量。',
    why: '铁和维生素 A 含量极高，但维 A 过量有风险，控制频率。',
    ev: ['dietary'],
    macro: ['血红素铁：吸收率高于植物铁', '维生素 A：视力与免疫', '维生素 B12']
  },
  {
    id: 'scallop', cat: 'protein', name: '扇贝', state: '生重', icon: 'clam',
    kcal: 60, p: 11.1, c: 2.6, f: 0.6, fiber: 0,
    unit: { name: '6 个', g: 100 }, tag: '高蛋白低脂',
    tip: '蒜蓉粉丝蒸会把油和粉丝都吃进去，清蒸更划算。',
    why: '蛋白 11 g、脂肪不到 1 g，贝类里最容易买到的一种。',
    ev: ['helms']
  },
  {
    id: 'eggwhite', cat: 'protein', name: '蛋清', state: '生重', icon: 'egg',
    kcal: 48, p: 11.6, c: 1.1, f: 0.1, fiber: 0,
    unit: { name: '3 个蛋的蛋清', g: 100 }, tag: '纯蛋白',
    tip: '做蛋清羹或炒蛋清，蛋黄别扔——一天 1–2 个全蛋没问题。',
    why: '几乎纯蛋白，适合在热量很紧的时候补蛋白。',
    ev: ['morton']
  },
  {
    id: 'hazelnut', cat: 'fat', name: '榛子', state: '原味', icon: 'nut',
    kcal: 628, p: 15.0, c: 17.0, f: 61.0, fiber: 9.7,
    unit: { name: '一小把', g: 15 }, tag: '坚果',
    tip: '原味带壳，别买糖炒或巧克力涂层。',
    why: '单不饱和脂肪和维生素 E 含量高，是坚果里风味最足的之一。',
    ev: ['dietary']
  },
  {
    id: 'pinenut', cat: 'fat', name: '松子', state: '原味', icon: 'nut',
    kcal: 698, p: 13.7, c: 13.0, f: 68.4, fiber: 3.7,
    unit: { name: '一勺', g: 10 }, tag: '高热量',
    tip: '撒在菜上提味即可，10 g 就 70 kcal，别当零食嗑。',
    why: '脂肪密度最高的坚果之一，控量比选种类更重要。',
    ev: ['dietary']
  },
  {
    id: 'flaxoil', cat: 'fat', name: '亚麻籽油', state: '冷榨', icon: 'oliveoil',
    kcal: 899, p: 0, c: 0, f: 99.9, fiber: 0,
    unit: { name: '一瓷勺', g: 10 }, tag: 'Omega-3',
    tip: '只能凉拌，别加热（烟点低，高温会破坏 ALA）。',
    why: '植物性 α-亚麻酸最直接的来源，和橄榄油轮换用。',
    ev: ['dietary']
  },

  /* ---------- 零食 ---------- */
  {
    id: 'sodacracker', cat: 'snack', name: '苏打饼干', state: '每 100 g', icon: 'cookie',
    kcal: 408, p: 8.4, c: 76.0, f: 7.7, fiber: 2.1,
    unit: { name: '4 片', g: 25 }, tag: '高碳水',
    tip: '看着“清淡”，其实 4 片就 100 kcal，且几乎全是精制碳水。',
    why: 'GI 高、饱腹差，最容易一包吃完——按片数拿，别拿着袋子吃。',
    ev: ['dietary']
  },
  {
    id: 'cookie', cat: 'snack', name: '曲奇饼干', state: '每 100 g', icon: 'cookie',
    kcal: 546, p: 6.0, c: 65.0, f: 29.0, fiber: 1.8,
    unit: { name: '3 块', g: 30 }, tag: '糖油混合',
    tip: '黄油+糖的典型组合，3 块约 160 kcal，等于半碗饭。',
    why: '脂肪 29%、碳水 65%，是“糖油混合物”的标准样本。',
    ev: ['dietary']
  },
  {
    id: 'digestive', cat: 'snack', name: '消化饼干', state: '每 100 g', icon: 'cookie',
    kcal: 471, p: 7.0, c: 67.0, f: 20.0, fiber: 3.5,
    unit: { name: '2 片', g: 30 }, tag: '名字误导',
    tip: '“助消化”是营销词，热量并不低，2 片约 140 kcal。',
    why: '纤维略高于普通饼干，但脂肪仍有 20%，不能当健康食品。',
    ev: ['dietary']
  },
  {
    id: 'spongecake', cat: 'snack', name: '蛋糕（海绵）', state: '每 100 g', icon: 'cake',
    kcal: 347, p: 7.0, c: 55.0, f: 12.0, fiber: 1.0,
    unit: { name: '一块', g: 80 }, tag: '高糖',
    tip: '一块 80 g 约 280 kcal；奶油蛋糕再翻一倍。',
    why: '糖占比高、蛋白低，血糖冲得快，饿得也快。',
    ev: ['dietary']
  },
  {
    id: 'cheesecake', cat: 'snack', name: '芝士蛋糕', state: '每 100 g', icon: 'cake',
    kcal: 321, p: 6.0, c: 25.0, f: 22.0, fiber: 0.4,
    unit: { name: '一块', g: 100 }, tag: '高脂',
    tip: '一块 100 g 约 320 kcal，脂肪比蛋白还多。',
    why: '奶油奶酪带来大量饱和脂肪，偶尔吃、按块计量。',
    ev: ['dietary']
  },
  {
    id: 'dark70', cat: 'snack', name: '黑巧克力 70%', state: '每 100 g', icon: 'darkchoc',
    kcal: 598, p: 7.8, c: 45.9, f: 42.6, fiber: 10.9,
    unit: { name: '2 小块', g: 20 }, tag: '高可可',
    tip: '20 g 约 120 kcal；可可含量越高，糖越少、苦味越重。',
    why: '70% 可可的多酚含量高，但脂肪仍有 42%，属于“高热量健康食物”。',
    ev: ['dietary']
  },
  {
    id: 'dark85', cat: 'snack', name: '黑巧克力 85%', state: '每 100 g', icon: 'darkchoc',
    kcal: 592, p: 9.7, c: 34.0, f: 46.0, fiber: 11.0,
    unit: { name: '2 小块', g: 20 }, tag: '低糖',
    tip: '同重量下糖比 70% 少 1/4，但脂肪更高，别因此多吃。',
    why: '糖低、可可高，适合控糖又想吃甜的人，仍要限量。',
    ev: ['dietary']
  },
  {
    id: 'milkchoc', cat: 'snack', name: '牛奶巧克力', state: '每 100 g', icon: 'chocolate',
    kcal: 535, p: 7.6, c: 59.0, f: 30.0, fiber: 3.4,
    unit: { name: '一排', g: 30 }, tag: '高糖',
    tip: '糖接近 60%，一条 30 g 约 160 kcal，是“糖+脂肪”双高。',
    why: '与黑巧相比糖多、可可少，控糖期尽量选 70% 以上。',
    ev: ['dietary']
  },
  {
    id: 'whitechoc', cat: 'snack', name: '白巧克力', state: '每 100 g', icon: 'chocolate',
    kcal: 539, p: 5.9, c: 59.0, f: 32.0, fiber: 0,
    unit: { name: '2 块', g: 20 }, tag: '无可可',
    tip: '白巧不含可可固形物，本质是可可脂+糖，营养价值最低。',
    why: '几乎没有多酚，糖脂比最高的一类巧克力。',
    ev: ['dietary']
  },
  {
    id: 'chips', cat: 'snack', name: '薯片', state: '每 100 g', icon: 'chips',
    kcal: 536, p: 7.0, c: 53.0, f: 34.0, fiber: 4.4,
    unit: { name: '一小袋', g: 40 }, tag: '油炸',
    tip: '一小袋 40 g 约 215 kcal，且几乎没有饱腹感。',
    why: '油炸+精制淀粉+盐，是最容易过量的一类零食。',
    ev: ['cooking']
  },
  {
    id: 'icecream', cat: 'snack', name: '冰淇淋', state: '每 100 g', icon: 'icecream',
    kcal: 207, p: 3.5, c: 24.0, f: 11.0, fiber: 0.5,
    unit: { name: '一个球', g: 60 }, tag: '糖脂',
    tip: '一个球约 124 kcal；甜筒的脆皮再加 60–80 kcal。',
    why: '糖和饱和脂肪都不低，但单份热量可控，偶尔吃不必内疚。',
    ev: ['dietary']
  },
  {
    id: 'milktea', cat: 'snack', name: '奶茶（全糖）', state: '每 100 ml', icon: 'tea',
    kcal: 60, p: 0.6, c: 11.0, f: 1.8, fiber: 0,
    unit: { name: '一杯', g: 500 }, tag: '液体热量',
    tip: '一杯 500 ml 全糖奶茶 ≈ 300 kcal、55 g 糖；选三分糖能砍掉一半。',
    why: '液体热量最不占肚子，是“明明没吃多少却胖了”的常见原因。',
    ev: ['dietary']
  },
  {
    id: 'cola', cat: 'snack', name: '可乐', state: '每 100 ml', icon: 'soda',
    kcal: 43, p: 0, c: 10.6, f: 0, fiber: 0,
    unit: { name: '一罐', g: 330 }, tag: '纯糖',
    tip: '一罐 330 ml 约 35 g 糖，等于 7 块方糖。',
    why: '纯添加糖、零营养，是膳食指南明确建议限制的一类。',
    ev: ['dietary']
  },

  {
    id: 'instantnoodle', cat: 'snack', name: '泡面（含油包）', state: '每 100 g', icon: 'noodlecup',
    kcal: 472, p: 9.5, c: 61.0, f: 21.0, fiber: 2.4,
    unit: { name: '一包', g: 100 }, tag: '高钠高脂',
    tip: '一包约 470 kcal，油包和粉包放一半就能少 60–80 kcal；汤别喝完。',
    why: '面饼多为油炸，钠含量常超过一天建议量的一半，不能当正餐常吃。',
    ev: ['cooking']
  },
  {
    id: 'latiao', cat: 'snack', name: '辣条', state: '每 100 g', icon: 'chips',
    kcal: 400, p: 12.0, c: 45.0, f: 19.0, fiber: 2.0,
    unit: { name: '一小包', g: 30 }, tag: '高钠',
    tip: '一小包 30 g 约 120 kcal，钠含量很高，吃完多喝水。',
    why: '面筋吸油、调味重，蛋白看着不低但伴随大量油和盐。',
    ev: ['dietary']
  },
  {
    id: 'popcorn', cat: 'snack', name: '爆米花（奶油）', state: '每 100 g', icon: 'chips',
    kcal: 459, p: 5.0, c: 60.0, f: 22.0, fiber: 6.0,
    unit: { name: '一小桶', g: 50 }, tag: '高纤维高脂',
    tip: '影院小桶轻松 500 kcal；选原味空气爆的能少一半脂肪。',
    why: '纤维不错，但奶油版脂肪高，且很容易边看边吃完。',
    ev: ['dietary']
  },
  {
    id: 'sachima', cat: 'snack', name: '沙琪玛', state: '每 100 g', icon: 'cake',
    kcal: 470, p: 6.0, c: 62.0, f: 22.0, fiber: 1.0,
    unit: { name: '一块', g: 40 }, tag: '糖油',
    tip: '一块 40 g 约 190 kcal，等于半碗饭，且幾乎没有蛋白质。',
    why: '油炸面条+糖浆，典型的糖油混合物。',
    ev: ['dietary']
  },
  {
    id: 'eggpie', cat: 'snack', name: '蛋黄派', state: '每 100 g', icon: 'cookie',
    kcal: 380, p: 6.0, c: 50.0, f: 18.0, fiber: 1.2,
    unit: { name: '一个', g: 30 }, tag: '糖油',
    tip: '一个约 115 kcal，常被当早餐，其实蛋白很少、糖不少。',
    why: '夹心奶油+糖，饱腹感差，不适合替代正餐。',
    ev: ['dietary']
  },
  {
    id: 'fries', cat: 'snack', name: '薯条（快餐）', state: '每 100 g', icon: 'chips',
    kcal: 312, p: 3.4, c: 41.0, f: 15.0, fiber: 3.8,
    unit: { name: '中份', g: 115 }, tag: '油炸',
    tip: '中份约 360 kcal，蘸酱再加 50–100 kcal。',
    why: '土豆本身才 77 kcal/100 g，油炸后翻了 4 倍。',
    ev: ['cooking']
  }
];



/* ---------- 烹调方式与吸油模型 ----------
   依据：《中国居民营养与慢性病状况报告（2020）》人均每日烹调用油 43.2 g、《健康中国行动》推荐 ≤25–30 g；
   《中国居民膳食指南》引用的吸油率：炸面包片 80%、炒鸡蛋 43%、茄盒 17%；
   《“科学三减，重在厨房”联合提示》：多蒸煮白灼凉拌、少煎炸，汤类注意浮油。
   oil = 每 100 g 食材在该做法下「最终被吃进去」的油（克），不含食材本身脂肪。 */
const METHODS = [
  { id: 'raw',   name: '生食',        oil: 0,    note: '不加油' },
  { id: 'boil',  name: '蒸 / 煮 / 白灼', oil: 0.3,  note: '基本无油，可能淋几滴' },
  { id: 'cold',  name: '凉拌',        oil: 2.0,  note: '一勺香油或橄榄油' },
  { id: 'soup',  name: '汤面 / 汤粉', oil: 3.0,  note: '油主要在汤里，喝汤就吃进去' },
  { id: 'light', name: '清炒 / 快炒', oil: 3.5,  note: '家常少油炒' },
  { id: 'home',  name: '家常炒（多油）', oil: 6.0, note: '外食或重口做法' },
  { id: 'braise', name: '红烧 / 炖',  oil: 3.0,  note: '油多在汤汁，收汁后会附着' },
  { id: 'pan',   name: '煎',          oil: 4.0,  note: '锅底一层油' },
  { id: 'fry',   name: '油炸 / 干煸 / 干锅', oil: 12.0, note: '吸油率约 10–15%' },
  { id: 'roast', name: '烤 / 空气炸', oil: 1.0,  note: '刷薄薄一层' }
];

/* 吸油系数：同样做法，不同食材吸的油差很多 */
const OIL_FACTOR = {
  eggplant: 1.7, lotus: 1.4, egg: 1.5, tofu: 1.35, potato: 1.2, purplesweet: 1.1,
  bread: 1.3, rice: 0.8, brownrice: 0.8, noodles: 0.9, soba: 0.9, oats: 0.7,
  spinach: 1.3, lettuce: 1.3, leafy: 1.3, broccoli: 1.2, mushroom: 1.25, woodear: 1.3,
  kingoyster: 1.3, cabbage: 1.2, purplecabbage: 1.1, bellpepper: 0.9, tomato: 0.9,
  chicken: 0.8, chickenleg: 0.9, beef: 0.8, porkloin: 0.85, lamb: 0.85,
  salmon: 0.7, bass: 0.7, cod: 0.7, hairtail: 0.8, tuna: 0.6, shrimp: 0.7, clam: 0.6,
  avocado: 0.2, banana: 0.3, apple: 0.4, orange: 0.4, pear: 0.4
};

const OIL_EVIDENCE = {
  label: '烹调油：被忽略的那 20 克脂肪',
  text: '《中国居民营养与慢性病状况报告（2020）》：我国家庭人均每日烹调用油 <b>43.2 g</b>，而《健康中国行动》推荐成人每日不超过 <b>25–30 g</b>，超过一半居民超上限。指南引用的吸油率数据：炸面包片 <b>80%</b>、炒鸡蛋 <b>43%</b>、茄盒 <b>17%</b>——同样 100 g 食材，做法不同，吃进去的脂肪能差 10 倍。',
  link: 'https://www.chinanutri.cn/yyjkzxpt/yyjkkpzx/hdjl/202106/t20210622_231517.html'
};

/* 每种食材可选的做法 */
function methodsFor(food) {
  const id = food.id;
  if (food.cat === 'snack') return ['raw'];   // 零食是成品，不涉及做法
  if (food.cat === 'fat') return ['raw'];
  if (['milk', 'yogurt', 'whey', 'soymilk'].includes(id)) return ['raw', 'boil'];
  if (['banana', 'apple', 'orange', 'pear', 'grape', 'strawberry', 'kiwi', 'dragonfruit', 'blueberry'].includes(id)) return ['raw', 'cold', 'boil'];
  if (['egg'].includes(id)) return ['boil', 'pan', 'light', 'home'];
  if (food.cat === 'carb') return ['boil', 'soup', 'light', 'home', 'cold', 'fry'];
  if (food.cat === 'protein') return ['boil', 'light', 'home', 'braise', 'pan', 'fry', 'roast'];
  return ['raw', 'cold', 'boil', 'light', 'home', 'braise', 'fry'];
}

/* 某食材 + 某做法 → 额外油（克） */
function oilGrams(food, methodId, grams) {
  const m = METHODS.find(x => x.id === methodId);
  if (!m) return 0;
  const f = OIL_FACTOR[food.id] ?? (food.cat === 'veg' ? 1.15 : food.cat === 'carb' ? 0.9 : food.cat === 'protein' ? 0.8 : 0);
  return m.oil * f * (grams || 0) / 100;
}


/* ---------- GI 标注（参考国际 GI 数据库与《中国食物成分表》附录） ---------- */
const GI_MAP = {
  rice: ['高', 83], brownrice: ['中', 68], quinoa: ['低', 53], oats: ['低', 55],
  bread: ['高', 69], pasta: ['低', 49], soba: ['中', 59], corn: ['中', 52],
  potato: ['高', 78], sweetpotato: ['中', 63], purplesweet: ['中', 61], yam: ['中', 51],
  banana: ['中', 51], apple: ['低', 36], orange: ['低', 43], pear: ['低', 36],
  grape: ['中', 53], strawberry: ['低', 40], kiwi: ['低', 52], blueberry: ['低', 53],
  dragonfruit: ['低', 48], chickpea: ['低', 28], edamame: ['低', 18],
  milk: ['低', 27], yogurt: ['低', 35], soymilk: ['低', 30],
  tofu: ['低', 15], woodear: ['低', 20], mushroom: ['低', 24], kelp: ['低', 20]
};
function giOf(food) {
  const g = GI_MAP[food.id];
  return g ? { level: g[0], value: g[1] } : null;
}

/* ---------- 餐序模板 ---------- */
const TRAIN_TIMES = [
  { id: 'morning_after', name: '早饭后练' },
  { id: 'morning_before', name: '午饭前练' },
  { id: 'noon_after', name: '午饭后练' },
  { id: 'evening_before', name: '晚饭前练' },
  { id: 'evening_after', name: '晚饭后练' },
  { id: 'night', name: '夜里练' },
  { id: 'none', name: '不训练' }
];

const MEAL_ROLES = {
  pre: {
    label: '练前餐', icon: '⚡️', share: 0.2,
    tip: '碳水为主、少油少纤维，别吃太饱。练前 1–2 小时吃完；太赶就选低饱腹感碳水（馒头/面包/面条）。'
  },
  post: {
    label: '练后餐', icon: '💪', share: 0.32,
    tip: '全天最大的一顿，碳水和蛋白优先，蔬菜少吃、后吃——纤维会拖慢吸收，练后不需要。'
  },
  other: {
    label: '其他餐', icon: '🍽', share: 0.24,
    tip: '先吃蔬菜再吃主食，能平缓血糖；控制烹调油，这一餐最容易超标。'
  },
  night: {
    label: '睡前餐', icon: '🌙', share: 0.12,
    tip: '蛋白为主、碳水少一点，选消化慢的（牛奶、希腊酸奶、豆腐）。'
  }
};

/* 根据训练时间生成餐序：返回 [{role, name}] */
function mealSequence(trainTime, meals) {
  const seq = [];
  if (trainTime === 'none') {
    for (let i = 0; i < meals; i++) seq.push(i === meals - 1 ? 'night' : 'other');
    return seq;
  }
  const n = Math.max(3, meals);
  const preIdx = (trainTime === 'morning_after' || trainTime === 'morning_before') ? 0
    : (trainTime === 'noon_after' || trainTime === 'noon_before') ? 1
    : (trainTime === 'night') ? n - 2 : n - 2;
  for (let i = 0; i < n; i++) {
    if (i === preIdx) seq.push('pre');
    else if (i === preIdx + 1) seq.push('post');
    else seq.push('other');
  }
  return seq;
}


/* ---------- 常见外食菜品（按「一份」估算，仅作参考） ---------- */
const DISHES = [
  { id: 'hongshaorou', name: '红烧肉', portion: '一份 150 g', kcal: 600, p: 15, c: 8, f: 56, note: '五花肉+糖，脂肪最高的一类' },
  { id: 'gongbaojiding', name: '宫保鸡丁', portion: '一份 200 g', kcal: 380, p: 22, c: 14, f: 26, note: '油和花生都不少' },
  { id: 'yuxiangrousi', name: '鱼香肉丝', portion: '一份 200 g', kcal: 340, p: 16, c: 16, f: 24, note: '糖醋口，糖不低' },
  { id: 'fanqiechaodan', name: '番茄炒蛋', portion: '一份 200 g', kcal: 260, p: 12, c: 9, f: 19, note: '家常做法要放两次油' },
  { id: 'mapodoufu', name: '麻婆豆腐', portion: '一份 200 g', kcal: 300, p: 14, c: 10, f: 22, note: '豆腐吸油，油比看起来多' },
  { id: 'qingzhengluyu', name: '清蒸鲈鱼', portion: '一条 200 g', kcal: 210, p: 30, c: 2, f: 9, note: '外食里少见的低油选择' },
  { id: 'shuizhuniurou', name: '水煮牛肉', portion: '一份 250 g', kcal: 520, p: 28, c: 10, f: 40, note: '油在汤里，捞着吃能少一半' },
  { id: 'ganbiandoujiao', name: '干煸豆角', portion: '一份 200 g', kcal: 290, p: 6, c: 12, f: 24, note: '多数店是油炸过的' },
  { id: 'disanxian', name: '地三鲜', portion: '一份 250 g', kcal: 420, p: 6, c: 30, f: 30, note: '茄子土豆都过油' },
  { id: 'tudousi', name: '酸辣土豆丝', portion: '一份 200 g', kcal: 190, p: 3, c: 24, f: 9, note: '它算主食，不算蔬菜' },
  { id: 'qingjiaorousi', name: '青椒肉丝', portion: '一份 200 g', kcal: 300, p: 18, c: 8, f: 21, note: '相对均衡，注意油' },
  { id: 'huiguorou', name: '回锅肉', portion: '一份 150 g', kcal: 480, p: 14, c: 8, f: 44, note: '五花肉+豆瓣酱，高脂' },
  { id: 'tangculiji', name: '糖醋里脊', portion: '一份 200 g', kcal: 520, p: 18, c: 45, f: 28, note: '挂糊油炸+糖醋汁' },
  { id: 'kelejichi', name: '可乐鸡翅', portion: '一份 200 g', kcal: 430, p: 22, c: 18, f: 29, note: '糖和鸡皮都在这' },
  { id: 'niumian', name: '牛肉面', portion: '一碗 600 g', kcal: 650, p: 28, c: 85, f: 18, note: '汤里的油别全喝' },
  { id: 'lanzhou', name: '兰州拉面', portion: '一碗 600 g', kcal: 550, p: 22, c: 80, f: 12, note: '面多肉少，蛋白偏低' },
  { id: 'danchaofan', name: '蛋炒饭', portion: '一份 350 g', kcal: 620, p: 14, c: 80, f: 24, note: '一份油约 15 g' },
  { id: 'jiaozi', name: '饺子（猪肉白菜）', portion: '10 个 250 g', kcal: 500, p: 20, c: 55, f: 22, note: '馅里的肥肉和油' },
  { id: 'baozi', name: '包子（猪肉）', portion: '2 个 200 g', kcal: 460, p: 16, c: 60, f: 17, note: '面多、馅少' },
  { id: 'malatang', name: '麻辣烫', portion: '一份 500 g（不含汤）', kcal: 480, p: 25, c: 40, f: 24, note: '不喝汤能省 100 kcal' },
  { id: 'huangmenji', name: '黄焖鸡米饭', portion: '一份', kcal: 780, p: 32, c: 90, f: 30, note: '一份顶两顿，汤汁别拌饭' },
  { id: 'zhaji', name: '炸鸡', portion: '2 块 200 g', kcal: 560, p: 30, c: 25, f: 38, note: '裹粉吸油，去皮能少 1/3' },
  { id: 'hanbao', name: '汉堡（牛肉）', portion: '1 个', kcal: 520, p: 25, c: 42, f: 28, note: '酱料贡献不少脂肪' },
  { id: 'pisa', name: '披萨', portion: '2 片', kcal: 480, p: 20, c: 50, f: 22, note: '芝士拉丝就是脂肪' }
];

/* ---------- 核心研究（用于「科学依据」页，链接优先国内可直连） ---------- */
const STUDIES = [
  {
    id: 'morton',
    rank: 'A',
    zh: '蛋白质吃多少才够：抗阻训练增肌的剂量—反应关系',
    en: 'A Systematic Review, Meta-analysis and Meta-regression of the Effect of Protein Supplementation on Resistance Training-induced Gains in Muscle Mass and Strength',
    journal: 'British Journal of Sports Medicine', year: 2018,
    design: '系统综述 + meta 回归', n: '49 项 RCT，1863 名受试者',
    finding: '去脂体重的增长在 <b>1.62 g/kg/天</b> 进入平台；95% 置信上限约 2.2 g/kg。平均额外增加 0.30 kg 瘦体重、1RM 提升 2.49 kg。',
    use: '→ 增肌期蛋白默认 1.8 g/kg（区间 1.6–2.2），「偏高」档取 2.2',
    links: [
      { t: '中文解读', u: 'https://btbworkoutlog.com/zh-CN/column/research-morton-2018-protein', k: 'cn' },
      { t: '原文 BMJ', u: 'https://bjsm.bmj.com/content/52/6/376', k: 'intl' }
    ]
  },
  {
    id: 'helms',
    rank: 'A',
    zh: '自然健美备赛期（减脂）营养与补剂建议',
    en: 'Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation',
    journal: 'Journal of the International Society of Sports Nutrition', year: 2014,
    design: '系统综述 + 实践建议', n: '系统评估减脂期热量、蛋白、脂肪与碳水的全部相关证据',
    finding: '每周减重 <b>0.5–1% 体重</b>；蛋白 <b>2.3–3.1 g/kg 去脂体重</b>；脂肪 15–30% 热量；其余给碳水。',
    use: '→ 减脂期蛋白 2.2 g/kg 起，「偏高」档 2.6（按 15–20% 体脂折算）',
    links: [
      { t: '中文平台（Bohrium）', u: 'https://www.bohrium.com/paper-details/evidence-based-recommendations-for-natural-bodybuilding-contest-preparation-nutrition-and-supplementation/813142120092139521-6458', k: 'cn' },
      { t: '原文 PMC', u: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4033492/', k: 'intl' }
    ]
  },
  {
    id: 'iraki',
    rank: 'B',
    zh: '健美运动员非赛季（增肌期）营养建议',
    en: 'Nutrition Recommendations for Bodybuilders in the Off-Season: A Narrative Review',
    journal: 'Sports (Basel)', year: 2019,
    design: '叙述性综述', n: '综合能量、蛋白、脂肪、碳水与补剂证据',
    finding: '热量 <b>高于维持 10–20%</b>；每周增重 0.25–0.5%；蛋白 1.6–2.2 g/kg；脂肪 0.5–1.5 g/kg；碳水 ≥3–5 g/kg。',
    use: '→ 增肌期热量 +12%、脂肪 1.0 g/kg、碳水保底 3 g/kg',
    links: [
      { t: '原文 PMC', u: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6680710/', k: 'intl' },
      { t: 'DOI', u: 'https://doi.org/10.3390/sports7070154', k: 'intl' }
    ]
  },
  {
    id: 'dietary',
    rank: 'A',
    zh: '中国居民膳食指南（2022）',
    en: 'Dietary Guidelines for Chinese Residents (2022)',
    journal: '中国营养学会 / 中国疾控中心营养与健康所', year: 2022,
    design: '国家级膳食指南（近百位专家共识）', n: '面向全体中国居民',
    finding: '蔬菜 <b>300–500 g/天</b>、水果 <b>200–350 g/天</b>、全谷物 50–150 g、大豆及坚果 25–35 g；少盐少油、会烹会选。',
    use: '→ 果蔬推荐量、烹调方式建议、纤维目标',
    links: [
      { t: '官方发布（中国疾控中心营养与健康所）', u: 'https://www.chinanutri.cn/xwzx_238/xyxw/202204/t20220427_258627.html', k: 'cn' }
    ]
  },
  {
    id: 'issn',
    rank: 'A',
    zh: '国际运动营养学会（ISSN）蛋白与运动立场声明',
    en: 'International Society of Sports Nutrition Position Stand: protein and exercise',
    journal: 'JISSN', year: 2017,
    design: '学会立场声明（系统评估）', n: '综合人体试验与 meta 分析',
    finding: '规律抗阻训练者每日蛋白 <b>1.4–2.0 g/kg</b>；单餐 <b>0.25–0.4 g/kg</b>，分 3–6 餐摄入更利于合成。',
    use: '→ 每餐蛋白克数与餐次分配的建议',
    links: [
      { t: '原文 PMC', u: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/', k: 'intl' }
    ]
  },
  {
    id: 'blueberry',
    rank: 'B',
    zh: '蓝莓提升运动后抗炎脂质介质：随机对照试验',
    en: 'Blueberry intake elevates post-exercise anti-inflammatory oxylipins: a randomized trial',
    journal: 'Scientific Reports', year: 2023,
    design: '随机对照试验（RCT）', n: '健康成人，运动前摄入蓝莓 vs 对照',
    finding: '运动前摄入蓝莓可提升运动后血浆中的<b>抗炎类 oxylipin</b>，并促进与恢复相关的脂质介质生成。',
    use: '→ 果蔬页「蓝莓 · 抗炎」条目的直接依据',
    links: [
      { t: '原文 Nature', u: 'https://www.nature.com/articles/s41598-023-39269-1', k: 'intl' }
    ]
  },
  {
    id: 'detrain',
    rank: 'C',
    zh: '停训与肌肉记忆：肌核与表观遗传标记的保留',
    en: 'Myonuclear domain / epigenetic memory of hypertrophy (Ogasawara 2013; Seaborne 2018)',
    journal: 'J Appl Physiol / Scientific Reports', year: '2013 / 2018',
    design: '人体干预 + 机制研究', n: '小样本人体研究，证据等级有限（已在结论中标注）',
    finding: '2–3 周停训后肌核数量与表观遗传标记仍保留，复训时恢复速度快于初次获得。',
    use: '→ 休息 1–4 周场景的「别慌，肌肉记忆还在」，但热量仍需控制',
    links: [
      { t: 'Ogasawara 2013', u: 'https://pubmed.ncbi.nlm.nih.gov/23372143/', k: 'intl' }
    ]
  }
];

const STUDY_NOTE = '证据等级：<b>A</b> = 系统综述 / meta 分析 / 国家级指南；<b>B</b> = 单项 RCT 或叙述性综述；<b>C</b> = 小样本机制研究。本工具的默认值优先取 A 级证据，证据较弱的部分（停训、个别食物）已在条目里单独标注。';

/* ---------- 场景配置 ---------- */
const SCENES = {
  bulk: {
    key: 'bulk', label: '增肌', short: '增肌期',
    calorieFactor: 1.12, proteinPerKg: 1.8, proteinHigh: 2.2, proteinRange: [1.6, 2.2], fatPerKg: 1.0, minCarbPerKg: 3.0,
    rate: [0.0025, 0.005], rateLabel: '每周 +0.25–0.5% 体重',
    headline: '热量盈余 +12%',
    desc: '轻微盈余，把每一卡都尽量导向肌肉而不是腰围。',
    ev: ['iraki', 'morton', 'protein_ceiling']
  },
  cut: {
    key: 'cut', label: '减脂', short: '减脂期',
    calorieFactor: 0.80, proteinPerKg: 2.2, proteinHigh: 2.6, proteinRange: [1.9, 2.6], fatPerKg: 0.8, minCarbPerKg: 2.0,
    rate: [-0.01, -0.005], rateLabel: '每周 −0.5–1% 体重',
    headline: '热量缺口 −20%',
    desc: '温和缺口 + 高蛋白，尽量只掉脂肪不掉肌肉。',
    ev: ['helms', 'morton', 'protein_ceiling']
  },
  maintain: {
    key: 'maintain', label: '不训练', short: '日常维持',
    calorieFactor: 1.0, proteinPerKg: 1.4, proteinHigh: 1.6, proteinRange: [1.2, 1.6], fatPerKg: 0.9, minCarbPerKg: 2.5,
    rate: [-0.002, 0.002], rateLabel: '体重基本不变',
    headline: '维持热量 ±0%',
    desc: '不靠运动，只靠吃对量和吃对食物守住身材。',
    ev: ['issn', 'dietary']
  },
  rest1: {
    key: 'rest1', label: '休息 1 天', short: '单日休息',
    calorieFactor: 0.98, proteinPerKg: 2.0, proteinHigh: 2.3, proteinRange: [1.8, 2.3], fatPerKg: 0.9, minCarbPerKg: 2.5,
    rate: [-0.002, 0.002], rateLabel: '体重基本不变',
    headline: '维持热量 −2%',
    desc: '只少了一天训练的消耗，蛋白别降，碳水略收。',
    ev: ['morton', 'iraki']
  },
  rest7: {
    key: 'rest7', label: '休息 1–1.5 周', short: '短期停训',
    calorieFactor: 0.96, proteinPerKg: 2.1, proteinHigh: 2.4, proteinRange: [1.9, 2.4], fatPerKg: 0.9, minCarbPerKg: 2.2,
    rate: [-0.003, 0.001], rateLabel: '体重 ±0.3 kg/周',
    headline: '维持热量 −4%',
    desc: '出差或生病的一周：蛋白顶住，热量略降，别让脂肪偷偷回来。',
    ev: ['memory', 'tipton']
  },
  rest14: {
    key: 'rest14', label: '休息 2–4 周', short: '长期停训',
    calorieFactor: 0.94, proteinPerKg: 2.2, proteinHigh: 2.4, proteinRange: [2.0, 2.4], fatPerKg: 0.85, minCarbPerKg: 2.0,
    rate: [-0.004, 0], rateLabel: '体重 −0.4% 到 0/周',
    headline: '维持热量 −6%',
    desc: '受伤或长期中断：蛋白拉满，热量小幅下调，优先保住肌肉。',
    ev: ['immobil', 'tipton', 'memory']
  }
};

const CATS = {
  carb: { label: '碳水', color: '#ffd60a', icon: '🍚' },
  protein: { label: '蛋白', color: '#ff6482', icon: '🍗' },
  fat: { label: '脂肪', color: '#64d2ff', icon: '🥑' },
  veg: { label: '果蔬', color: '#3ddc84', icon: '🥦' },
  snack: { label: '零食', color: '#ff9f0a', icon: '🍪' }
};
