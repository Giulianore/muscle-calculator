/* ================== Muscle Calculator · 逻辑层 ================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const round = (v, n = 0) => { const m = 10 ** n; return Math.round(v * m) / m; };
const fmt = (v, n = 0) => round(v, n).toLocaleString('zh-CN');

const DEFAULTS = {
  screen: 'input',
  group: 'train',       // train | none | rest
  goal: 'bulk',         // bulk | cut
  rest: 'rest1',        // rest1 | rest7 | rest14
  sex: 'm',
  height: 175,
  weight: 72,
  age: 27,
  sessions: 4,
  trainTime: 'evening_after',
  cart: [],                    // 购物车 [{cat,id,g,method,serv}]
  cartSlot: 'lunch',           // 结算时选哪一餐
  cardioH: 0,                  // 每周有氧小时
  cardioInt: 'mid',            // low | mid | high
  exp: 'inter',         // novice | inter | adv
  activity: 1.35,
  meals: 4,
  proteinTier: 'std',          // std | high
  kcalOffset: 0,               // 根据反馈手动调节的热量
  logs: [],                    // 餐次记录（最多 90 条）
  weights: [],                 // 体重记录（最多 400 条）
  days: {},                    // 每日汇总（保留 400 天）
  logView: 'today',            // today | calendar | history
  calMonth: null,              // 'YYYY-MM'
  calZoom: 'month',            // month | quarter | year
  draft: null,
  tune: null,
  foodCat: 'carb',
  foodQuery: '',
  foodDraft: null,
  meal: {
    carb: { id: 'rice', g: 0, method: 'boil' },
    protein: { id: 'chicken', g: 0, method: 'light' },
    fat: { id: 'oliveoil', g: 0, method: 'raw' },
    veg: { id: 'broccoli', g: 0, on: false, method: 'cold' }
  }
};

let state = { ...DEFAULTS };
try {
  const saved = JSON.parse(localStorage.getItem('mc_state_v2') || localStorage.getItem('mc_state_v1') || 'null');
  if (saved) {
    state = { ...DEFAULTS, ...saved, meal: { ...DEFAULTS.meal, ...(saved.meal || {}) } };
    ['carb', 'protein', 'fat', 'veg'].forEach(k => {
      state.meal[k] = { ...DEFAULTS.meal[k], ...(state.meal[k] || {}) };
    });
  }
} catch (e) { /* ignore */ }
const save = () => { try { localStorage.setItem('mc_state_v2', JSON.stringify(state)); } catch (e) {} };

/* ---------------- 计算核心 ---------------- */
function sceneKey() {
  if (state.group === 'train') return state.goal;
  if (state.group === 'none') return 'maintain';
  return state.rest;
}

function compute() {
  const w = state.weight, h = state.height, a = state.age;
  const bmr = state.sex === 'm'
    ? 10 * w + 6.25 * h - 5 * a + 5
    : 10 * w + 6.25 * h - 5 * a - 161;

  // 训练消耗：训练期全额计入；休息期按残余活动量折算（避免把训练热量重复算进「维持」）
  const base = Math.min(0.16, state.sessions * 0.035);
  let trainFactor = 0;
  if (state.group === 'train') trainFactor = base;
  else if (state.group === 'rest') {
    trainFactor = base * (state.rest === 'rest1' ? 0.8 : state.rest === 'rest7' ? 0.3 : 0.15);
  }
  // 有氧：按体重与强度折算成日均消耗（kcal/kg/h：低 5 / 中 7 / 高 9）
  const cardioFactor = { low: 5, mid: 7, high: 9 }[state.cardioInt] || 7;
  const cardioDaily = (state.cardioH || 0) / 7 * w * cardioFactor;
  const tdee = bmr * (state.activity + trainFactor) + cardioDaily;
  const tdeeRest = bmr * state.activity + cardioDaily;

  const sc = SCENES[sceneKey()];
  const tier = state.proteinTier === 'high' ? 'high' : 'std';
  const pPerKg = tier === 'high' ? (sc.proteinHigh || sc.proteinPerKg) : sc.proteinPerKg;
  const guards = [];

  /* ---- ⓪ 参考体重：BMI ≥ 28 时按理想体重折算（国内临床惯用做法） ---- */
  const bmi = w / ((h / 100) ** 2);
  const ibw = 22 * ((h / 100) ** 2);
  const refW = bmi >= 28 ? ibw : w;

  /* ---- ① 热量：只设上限 40 kcal/kg（防止公式在极端体型上跑飞），并设安全下限 ---- */
  const rawKcal = tdee * sc.calorieFactor + (state.kcalOffset || 0);
  const rawKcalRest = tdeeRest * sc.calorieFactor + (state.kcalOffset || 0);
  const kHi = 40 * w;
  const kMin = state.sex === 'm' ? 1500 : 1200;
  let kcal = Math.round(Math.min(rawKcal, kHi) / 10) * 10;
  if (rawKcal > kHi) guards.push(`热量按 ${round(kcal / w)} kcal/kg 封顶（原计算 ${Math.round(rawKcal)} kcal 超出合理范围）`);
  const kcalRest = Math.round(Math.min(rawKcalRest, kHi) / 10) * 10;
  if (kcal < kMin) {
    kcal = kMin;
    guards.push(`已提到安全下限 ${kMin} kcal，避免长期极低热量`);
  }

  /* ---- ② 蛋白：按参考体重的 g/kg 起算，并夹在 10–30% 供能之间 ---- */
  let protein = pPerKg * refW;
  protein = clamp(protein, 0.10 * kcal / 4, 0.30 * kcal / 4);

  /* ---- ③ 脂肪：按参考体重起算，夹在 20–30% 供能之间 ---- */
  let fat = sc.fatPerKg * refW;
  fat = clamp(fat, 0.20 * kcal / 9, 0.30 * kcal / 9);

  /* ---- ④ 碳水 = 剩余热量；绝不给负数 ---- */
  let carb = (kcal - protein * 4 - fat * 9) / 4;
  if (carb < 0) {
    fat = Math.max(0.15 * kcal / 9, fat + carb * 4 / 9);
    carb = (kcal - protein * 4 - fat * 9) / 4;
    guards.push('蛋白与脂肪偏高，脂肪已下调以留出碳水');
  }
  if (carb < 0) {
    protein = Math.max(0.10 * kcal / 4, protein + carb * 4 / 4);
    carb = (kcal - protein * 4 - fat * 9) / 4;
    guards.push('热量偏低，蛋白已下调到 10% 供能以保证碳水不为负');
  }
  if (carb < 0) { carb = 0; guards.push('当前参数下热量不足以同时满足蛋白与脂肪，请提高热量或调整体重'); }

  /* ---- ⑤ 碳水供能比高于 65% 时，用脂肪补到 30% 供能以内 ---- */
  if (carb * 4 / (protein * 4 + carb * 4 + fat * 9) > 0.65) {
    const cap = 0.30 * kcal / 9;
    if (cap > fat) {
      fat = cap;
      carb = (kcal - protein * 4 - fat * 9) / 4;
      guards.push('碳水供能比偏高，脂肪已上调到 30% 供能以内');
    }
  }

  protein = Math.round(protein);
  fat = Math.round(fat);
  carb = Math.max(0, Math.round(carb));

  const pKcal = protein * 4, cKcal = carb * 4, fKcal = fat * 9;
  const macroKcal = pKcal + cKcal + fKcal;
  const pPct = Math.round(pKcal / macroKcal * 100);
  const cPct = Math.round(cKcal / macroKcal * 100);
  const fPct = Math.round(fKcal / macroKcal * 100);

  /* ---- ⑥ 对照《中国居民膳食营养素参考摄入量（2023）》的供能比 ---- */
  let diet = 'amdr', dietNote = '碳水 50–65% · 蛋白 10–20% · 脂肪 20–30%，符合中国 DRIs';
  if (pPct > 20 && pPct <= 30 && sc.key === 'cut') {
    diet = 'hpd';
    dietNote = '属「高蛋白减重」模式（蛋白 20–30% 供能），《中国超重/肥胖医学营养治疗指南（2021）》允许的区间';
  } else if (cPct > 70 || fPct > 35 || pPct > 32) {
    diet = 'out';
    dietNote = '供能比偏离中国 DRIs，请优先检查体重与活动量是否填得准确';
  }

  const weekly = w * (sc.rate[0] + sc.rate[1]) / 2;
  const adjusted = guards.length ? guards[0] : null;

  return {
    bmr: Math.round(bmr), tdee: Math.round(tdee), kcal,
    kcalRest: Math.max(kMin, kcalRest), cardioDaily: Math.round(cardioDaily),
    p: protein, c: carb, f: fat, pPerKg, tier,
    pKcal, cKcal, fKcal, macroKcal,
    pPct, cPct, fPct,
    perKg: { p: round(protein / refW, 1), c: round(carb / w, 1), f: round(fat / refW, 1) },
    pRange: sc.proteinRange || [pPerKg, pPerKg],
    scene: sc, adjusted, guards, diet, dietNote,
    refW: round(refW, 1), bmi: round(bmi, 1), useIbw: bmi >= 28,
    weekly,
    perMealP: round(protein / state.meals),
    water: round(w * 0.035, 1),
    fiber: clamp(Math.round(kcal / 1000 * 14), 25, 40),
    veg: '300–500 g',
    fruit: '200–350 g'
  };
}

/* ---------------- 组件 ---------------- */
function segHTML(id, options, active, small) {
  const idx = Math.max(0, options.findIndex(o => o.v === active));
  return `<div class="seg${small ? ' small' : ''}" data-segid="${id}" style="--n:${options.length};--i:${idx}">
    <div class="thumb"></div>
    ${options.map(o => `<button data-seg="${id}" data-val="${o.v}" class="${o.v === active ? 'on' : ''}">${o.t}</button>`).join('')}
  </div>`;
}

function sliderHTML(id, label, value, min, max, step, unit, hint) {
  const p = (value - min) / (max - min) * 100;
  return `<div class="field">
    <div class="field-head">
      <span class="field-label">${label}</span>
      <span class="field-value" id="fv-${id}">${value}<small>${unit}</small></span>
    </div>
    <input type="range" data-slider="${id}" min="${min}" max="${max}" step="${step}" value="${value}"
      style="--p:${p}%" aria-label="${label}">
    ${hint ? `<div class="card-hint" style="margin-top:6px">${hint}</div>` : ''}
  </div>`;
}

/* ---------------- 页面：输入 ---------------- */
function renderInput() {
  const sc = SCENES[sceneKey()];
  const isTrain = state.group === 'train';
  const isRest = state.group === 'rest';
  return `
  <div class="hero">
    <div class="kicker"><span class="dot"></span> 循证营养 · 四场景</div>
    <h1>练得对，<br>也要吃得准。</h1>
    <p>输入身高体重与当前状态，算出你每天该吃的碳水、蛋白质与脂肪克数，再告诉你具体吃什么、吃多少。</p>
  </div>

  <div class="card">
    <div class="card-title"><h3>你现在属于哪种情况</h3><span class="card-hint">4 种算法</span></div>
    ${segHTML('group', [
      { v: 'train', t: '在训练' },
      { v: 'none', t: '不训练' },
      { v: 'rest', t: '休息 / 停训' }
    ], state.group)}
    <div style="height:10px"></div>
    ${isTrain ? segHTML('goal', [{ v: 'bulk', t: '增肌' }, { v: 'cut', t: '减脂' }], state.goal, true) : ''}
    ${isRest ? segHTML('rest', [
      { v: 'rest1', t: '休息 1 天' },
      { v: 'rest7', t: '1–1.5 周' },
      { v: 'rest14', t: '2–4 周' }
    ], state.rest, true) : ''}
    ${state.group === 'train' ? `
    <div style="height:12px"></div>
    <div class="card-hint" style="margin-bottom:7px">蛋白质档位　<span style="color:var(--dim-2)">标准 ${sc.proteinPerKg} · 偏高 ${sc.proteinHigh} g/kg</span></div>
    ${segHTML('proteinTier', [{ v: 'std', t: '标准' }, { v: 'high', t: '偏高' }], state.proteinTier, true)}
    <p class="lead" style="margin-top:10px">${state.proteinTier === 'high'
      ? '偏高档取 meta 分析 95% 置信上限：更适合体脂较低、训练年限长、或减脂末期的人。'
      : '标准档是 meta 分析的「平台值」，对大多数人已经足够，多吃没有额外增肌收益。'}</p>` : ''}
    <p class="lead" style="margin-top:12px">${sc.desc} <b style="color:#ffb066">${sc.headline}</b></p>
  </div>

  <div class="card">
    <div class="card-title"><h3>身体数据</h3><span class="card-hint">用于 BMR 计算</span></div>
    <div style="margin-bottom:20px">
      ${segHTML('sex', [{ v: 'm', t: '男' }, { v: 'f', t: '女' }], state.sex, true)}
    </div>
    ${sliderHTML('height', '身高', state.height, 145, 205, 1, 'cm')}
    ${sliderHTML('weight', '体重', state.weight, 40, 130, 0.5, 'kg')}
    ${sliderHTML('age', '年龄', state.age, 15, 65, 1, '岁')}
  </div>

  <div class="card">
    <div class="card-title"><h3>${isTrain || isRest ? '训练与日常活动' : '日常活动量'}</h3>
      <span class="card-hint">${isTrain || isRest ? '每周练几次' : '非运动消耗'}</span></div>
    ${isTrain || isRest ? sliderHTML('sessions', '每周训练次数', state.sessions, 0, 7, 1, '次') : ''}
    <div style="margin-bottom:14px">
      ${segHTML('activity', [
        { v: '1.2', t: '久坐办公' },
        { v: '1.35', t: '轻度走动' },
        { v: '1.5', t: '体力较多' }
      ], String(state.activity), true)}
    </div>
    <div style="margin-top:18px">
      ${sliderHTML('cardioH', '每周有氧', state.cardioH, 0, 10, 0.5, '小时')}
      <div class="card-hint" style="margin:10px 0 7px">有氧强度</div>
      ${segHTML('cardioInt', [
        { v: 'low', t: '快走 / 低强度' },
        { v: 'mid', t: '慢跑 / 中强度' },
        { v: 'high', t: '骑行 / 高强度' }
      ], state.cardioInt, true)}
    </div>
    ${isTrain ? `<div class="card-hint" style="margin:18px 0 8px">训练年限（影响增肌速度与盈余幅度）</div>
      ${segHTML('exp', [
        { v: 'novice', t: '新手 <1 年' },
        { v: 'inter', t: '进阶 1–3 年' },
        { v: 'adv', t: '资深 3 年+' }
      ], state.exp, true)}` : ''}
  </div>

  <button class="btn-primary" data-action="calc"><span class="shine"></span>算出我的每日配额</button>
  <button class="evidence-inline" data-action="science">
    <span class="ei-title">🔬 依据 ${STUDIES.length} 篇同行评议研究</span>
    <span class="ei-sub">Morton 2018 · Helms 2014 · Iraki 2019 · 中国居民膳食指南 2022</span>
    <span class="ei-go">查看 →</span>
  </button>
  <div class="footer-note">区间取值，非医疗建议</div>
  `;
}

/* 阶段建议：参照国内健身圈通行的 BMI 切换点 */
function bmiNote(r) {
  const bmi = r.bmi;
  if (r.scene.key === 'cut') {
    if (bmi <= (state.sex === 'm' ? 22 : 20)) return `BMI ${bmi}，已经到了建议的减脂终点（男 22–23 / 女 20–21）。再往下减，掉的更多是肌肉而不是脂肪，建议转增肌。`;
    if (bmi <= 24) return `BMI ${bmi}，处在正常范围。可以继续减，但注意别追低体脂——腹肌这类目标对多数人性价比很低。`;
    return `BMI ${bmi}，先减到 24 以下再考虑增肌，收益会比现在直接增肌更大。`;
  }
  if (r.scene.key === 'bulk') {
    if (bmi >= 25) return `BMI ${bmi}，已经偏高。增肌期建议控制在 BMI 24–25 以内，否则多出来的重量主要是脂肪。`;
    if (bmi >= 23) return `BMI ${bmi}，接近增肌的上限区间（男 23–24 / 女 21–22）。建议按每月 0.5–1 kg 的速度收着增。`;
    return `BMI ${bmi}，还有增重空间。控制在每月 +0.5–1 kg，别追求快速涨秤。`;
  }
  return '';
}

/* ---------------- 今日推荐组合 ---------------- */
function recoCard(r) {
  const cPerKg = r.c / state.weight;
  const k = r.scene.key;
  let carbPick, carbAlt, protPick, protAlt, fatPick, fatAlt, note;

  if (cPerKg >= 4.2) {
    carbPick = 'rice'; carbAlt = 'oats';
    note = `你的碳水达到 ${round(cPerKg, 1)} g/kg，属于高碳日：主食选<b>低脂、易消化</b>的蒸米饭/燕麦，把脂肪留给坚果和油，别再给主食「加油」。`;
  } else if (cPerKg >= 2.6) {
    carbPick = 'rice'; carbAlt = 'sweetpotato';
    note = `碳水 ${round(cPerKg, 1)} g/kg 属于中等：米饭和红薯各占一半，饱腹感和训练表现都照顾到。`;
  } else {
    carbPick = 'sweetpotato'; carbAlt = 'rice';
    note = `碳水只有 ${round(cPerKg, 1)} g/kg，是低碳日：主食体积要大、热量要低，红薯/土豆优先，米饭按克称。`;
  }

  if (k === 'cut') {
    protPick = 'chicken'; protAlt = 'shrimp';
    fatPick = 'oliveoil'; fatAlt = 'almond';
  } else if (k === 'bulk') {
    protPick = 'beef'; protAlt = 'chicken';
    fatPick = 'peanutbutter'; fatAlt = 'almond';
  } else {
    protPick = 'egg'; protAlt = 'tofu';
    fatPick = 'almond'; fatAlt = 'oliveoil';
  }

  const shares = { c: [0.6, 0.4], p: [0.6, 0.4], f: [0.5, 0.5] };
  const plan = [
    ['c', carbPick, shares.c[0]], ['c', carbAlt, shares.c[1]],
    ['p', protPick, shares.p[0]], ['p', protAlt, shares.p[1]],
    ['f', fatPick, shares.f[0]], ['f', fatAlt, shares.f[1]]
  ];
  const mt = { c: r.c / state.meals, p: r.p / state.meals, f: r.f / state.meals };
  const label = { c: '碳水', p: '蛋白', f: '脂肪' };
  const color = { c: '#ffd60a', p: '#ff6482', f: '#64d2ff' };

  const rows = plan.map(([macro, id, share]) => {
    const f = FOODS.find(x => x.id === id);
    const g = f[macro] > 0 ? mt[macro] * share / (f[macro] / 100) : 0;
    return `<div class="reco-row" data-food="${id}">
      <div class="thumb">${ICONS[f.icon]}</div>
      <div style="flex:1;min-width:0">
        <div class="nm" style="font-size:13px;font-weight:700">${f.name}
          <span class="mini-tag" style="background:${color[macro]}22;color:${color[macro]}">${label[macro]}</span></div>
        <div class="macros" style="font-size:10.5px;color:var(--dim-2);margin-top:4px">${portionText(g, f)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:15px;font-weight:750;font-variant-numeric:tabular-nums">${fmt(g)}<span style="font-size:10px;color:var(--dim-2)"> g</span></div>
        <div style="font-size:10px;color:var(--dim-2);margin-top:2px">每餐</div>
      </div>
    </div>`;
  }).join('');

  return `<div class="card">
    <div class="card-title"><h3>今天就按这个吃</h3><span class="card-hint">每餐 · ${state.meals} 餐/天</span></div>
    <div class="reco-list">${rows}</div>
    <p class="lead" style="margin-top:12px">${note}</p>
    <div class="pill-note"><span class="i">🥬</span><span>外加蔬菜 <b>300–500 g</b>、水果 <b>200–350 g</b>、饮水 <b>${r.water} L</b>。这三项几乎不加蛋白质，却决定了你吃得健不健康。</span></div>
  </div>`;
}

/* ---------------- 页面：结果 ---------------- */
function renderResult() {
  const r = compute();
  const sc = r.scene;
  const R = 78, C = 2 * Math.PI * R;
  const frac = clamp(r.kcal / 4200, 0.05, 1);
  const delta = Math.round(r.kcal - r.tdee);

  return `
  <div class="hero" style="padding-bottom:10px">
    <div class="kicker"><span class="dot"></span> ${sc.short} · ${state.weight} kg</div>
    <h1 style="font-size:30px">你的每日配额</h1>
    <p>按 ${state.sex === 'm' ? '男' : '女'}性、${state.age} 岁、${state.height} cm、每周训练 ${state.group === 'none' ? 0 : state.sessions} 次的模型计算。</p>
  </div>

  <button class="evidence-bar" data-action="science">
    <span class="eb-ico">🔬</span>
    <span class="eb-body">
      <span class="eb-title">这套数字来自 ${STUDIES.length} 篇同行评议研究</span>
      <span class="eb-sub">含 4 篇 A 级证据 · 49 项以上 RCT · 查看中文摘要</span>
    </span>
    <span class="eb-arrow">›</span>
  </button>

  <div class="card" style="text-align:center;padding:22px 18px 18px">
    <div class="ring-wrap">
      <svg class="ring" width="196" height="196" viewBox="0 0 196 196">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffb02e"/>
            <stop offset="55%" stop-color="#ff7a18"/>
            <stop offset="100%" stop-color="#ff3b30"/>
          </linearGradient>
        </defs>
        <circle class="track" cx="98" cy="98" r="${R}" stroke-width="12"/>
        <circle class="prog" cx="98" cy="98" r="${R}" stroke-width="12"
          stroke-dasharray="${C}" stroke-dashoffset="${C}" data-dash="${C * (1 - frac)}"/>
      </svg>
      <div class="ring-center">
        <div class="ring-kcal">${fmt(r.kcal)}</div>
        <div class="ring-unit">kcal / 天</div>
        <div class="ring-delta">${delta >= 0 ? '+' : ''}${fmt(delta)} kcal vs 维持</div>
        ${Math.abs(r.kcalRest - r.kcal) >= 30 ? `<div class="ring-rest">休息日 ${fmt(r.kcalRest)} kcal</div>` : ''}
      </div>
    </div>
    <div class="pill-note" style="text-align:left">
      <span class="i">🎯</span>
      <span><b>${sc.rateLabel}</b><br>${sc.desc}</span>
    </div>
    ${state.kcalOffset ? `<div class="pill-note" style="text-align:left;background:rgba(10,132,255,.09);border-color:rgba(10,132,255,.28);color:#9ccbff">
      <span class="i">🛠</span>
      <span>已按你的反馈手动调整 <b>${state.kcalOffset > 0 ? '+' : ''}${state.kcalOffset} kcal</b>。
      <a href="#" data-reset-tune="1" style="color:#64d2ff">撤销</a></span>
    </div>` : ''}
  </div>

  <div class="card">
    <div class="card-title"><h3>三大营养素</h3><span class="card-hint">每天要吃够</span></div>
    <div class="macro-grid">
      ${macroRow('c1', '碳水', ICONS.rice, r.c, r.cPct, r.perKg.c)}
      ${macroRow('c2', '蛋白质', ICONS.chicken, r.p, r.pPct, r.perKg.p, `区间 ${r.pRange[0]}–${r.pRange[1]} g/kg`)}
      ${macroRow('c3', '脂肪', ICONS.avocado, r.f, r.fPct, r.perKg.f, '含烹调油，建议 ≤25–30 g/天')}
    </div>
    <div class="diet-chip ${r.diet}">
      <span class="dc-dot"></span>碳水 ${r.cPct}% · 蛋白 ${r.pPct}% · 脂肪 ${r.fPct}% —— ${r.dietNote}
    </div>
    ${r.adjusted ? `<div class="pill-note"><span class="i">⚖️</span><span>${r.adjusted}</span></div>` : ''}
    ${bmiNote(r) ? `<div class="pill-note" style="background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:var(--dim)">
      <span class="i">🧭</span><span>${bmiNote(r)}</span></div>` : ''}
    ${r.useIbw ? `<div class="pill-note" style="background:rgba(10,132,255,.08);border-color:rgba(10,132,255,.25);color:#9ccbff">
      <span class="i">📐</span><span>BMI ${r.bmi}，蛋白与脂肪按<b>理想体重 ${r.refW} kg</b> 折算（国内临床对肥胖人群的通行做法），而不是实际体重 ${state.weight} kg。</span></div>` : ''}
  </div>

  <div class="card">
    <div class="card-title"><h3>把数字落到每顿饭</h3><span class="card-hint">${state.meals} 餐 / 天</span></div>
    <div class="stat-grid">
      <div class="stat"><div class="k">每餐蛋白</div><div class="v">${r.perMealP} g</div><div class="s">≈ ${round((r.useIbw ? r.refW : state.weight) * 0.4)} g 的更优区间</div></div>
      <div class="stat"><div class="k">基础代谢 BMR</div><div class="v">${fmt(r.bmr)} kcal</div><div class="s">维持 ${fmt(r.tdee)} kcal</div></div>
      <div class="stat"><div class="k">每日纤维</div><div class="v">${r.fiber} g</div><div class="s">按 14 g/1000 kcal 推算</div></div>
      <div class="stat"><div class="k">饮水</div><div class="v">${r.water} L</div><div class="s">训练日再加 0.5 L</div></div>
    </div>
  </div>

  ${recoCard(r)}

  <div class="card">
    <div class="card-title"><h3>吃两周后，回来对一次</h3><span class="card-hint">动态调整</span></div>
    <p class="lead">涨太快、掉太慢，或者练着没劲——不是你不行，是配额该改了。填一次体重和训练表现，我给你具体加减多少。</p>
    <button class="btn-secondary" style="margin-top:12px" data-action="tune">记录体重与表现 → 获取调整方案</button>
  </div>

  <div class="btn-row">
    <button class="btn-secondary" data-action="goto-food">去挑食物 →</button>
    <button class="btn-secondary" data-action="goto-meal">开始配餐 →</button>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-title"><h3>这个结果从哪来</h3><span class="card-hint">点开看依据</span></div>
    ${sc.ev.map(id => {
      const e = EVIDENCE[id];
      return `<details class="acc"><summary>${e.label}<span class="chev">›</span></summary>
        <div class="acc-body">${e.text}<br><a class="ref" href="${e.link}" target="_blank" rel="noopener">查看原文 ↗</a></div></details>`;
    }).join('')}
    <div class="pill-note"><span class="i">ⓘ</span><span>算法给出的是<b>起点</b>，不是终点。连续 2–3 周记录晨起体重，按周平均变化调整：增肌每周 +0.25–0.5%、减脂每周 −0.5–1%，超出范围就增减 100–150 kcal。</span></div>
  </div>
  `;
}

function macroRow(cls, name, icon, grams, pct, perKg, hint) {
  return `<div class="macro ${cls}">
    <div class="ico">${icon}</div>
    <div class="body">
      <div class="name">${name}</div>
      <div class="val">${fmt(grams)}<small>g</small> <span style="font-size:11px;color:var(--dim-2);font-weight:600">· ${perKg} g/kg</span></div>
      ${hint ? `<div class="pct" style="margin-top:3px">${hint}</div>` : ''}
      <div class="bar"><i style="width:${clamp(pct, 4, 100)}%"></i></div>
    </div>
    <div style="text-align:right"><div class="name">${pct}%</div><div class="pct">热量占比</div></div>
  </div>`;
}

/* ---------------- 页面：食物库 ---------------- */
function foodFiltered() {
  const q = (state.foodQuery || '').trim();
  if (!q) return FOODS.filter(f => f.cat === state.foodCat);
  return FOODS.filter(f => (f.name + f.tag + f.state + f.why).includes(q));
}

function foodCardHTML(f, i) {
  const gi = giOf(f);
  return `<div class="food" data-food="${f.id}" style="animation-delay:${Math.min(i, 12) * 25}ms">
    <div class="thumb">${ICONS[f.icon]}</div>
    <div class="info">
      <div class="nm">${f.name}<span class="tag">${f.tag}</span></div>
      <div class="macros">
        <span>碳水 <b>${f.c}</b></span><span>蛋白 <b>${f.p}</b></span><span>脂肪 <b>${f.f}</b></span>
        <span>${f.kcal} kcal</span>${gi ? `<span class="gi ${gi.level}">GI ${gi.level}</span>` : ''}
      </div>
      <div class="tip">${f.tip}</div>
    </div>
    <div class="go">›</div>
  </div>`;
}

function updateFoodList() {
  const box = $('#foodList');
  const cnt = $('#foodCount');
  if (!box) return;
  if (state.foodCat === 'dish') {
    const q = (state.foodQuery || '').trim();
    const list = DISHES.filter(d => !q || (d.name + d.note).includes(q));
    box.innerHTML = list.map((d, i) => dishCardHTML(d, i)).join('') || `<div class="empty-note">没有找到「${q}」。</div>`;
    if (cnt) cnt.textContent = `${list.length} 道`;
    return;
  }
  const list = foodFiltered();
  box.innerHTML = list.map((f, i) => foodCardHTML(f, i)).join('') || `<div class="empty-note">没有找到「${state.foodQuery}」，换个关键词试试。</div>`;
  if (cnt) cnt.textContent = `${list.length} 种`;
}

function renderFood() {
  const list = foodFiltered();
  return `
  <div class="hero" style="padding-bottom:6px">
    <div class="kicker"><span class="dot"></span> 中国市场常见食材</div>
    <h1 style="font-size:30px">吃什么，<br>怎么吃。</h1>
    <p>每张卡片都标注了「更好的做法」——同样的食材，做法不同，结果差很多。</p>
  </div>
  <div style="margin:12px 0 10px">
    ${segHTML('foodCat', [
      { v: 'carb', t: '碳水' }, { v: 'protein', t: '蛋白' },
      { v: 'fat', t: '脂肪' }, { v: 'veg', t: '果蔬' }, { v: 'snack', t: '零食' }
    ], state.foodCat)}
  </div>
  <div class="food-search">
    <span class="fs-ico">⌕</span>
    <input id="foodSearch" type="search" placeholder="搜索食材，如「鸡」「高纤维」「蒸」" value="${state.foodQuery || ''}" autocomplete="off">
    <span class="fs-count" id="foodCount">${list.length} 种</span>
  </div>
  ${state.foodCat === 'veg' ? `<div class="pill-note" style="margin:0 0 12px"><span class="i">🥬</span><span>目标：蔬菜 <b>300–500 g</b>、水果 <b>200–350 g</b>，每天至少 <b>3 种颜色</b>。深色蔬菜（菠菜、西兰花）占一半，水果尽量整吃而不是榨汁。</span></div>` : ''}
  <button class="dish-entry" data-action="dishes">
    <span>🍜 外食 / 菜品估算</span>
    <span class="de-sub">${DISHES.length} 道常见菜，按「一份」算 →</span>
  </button>
  <div class="food-list" id="foodList">
    ${list.map((f, i) => foodCardHTML(f, i)).join('')}
  </div>
  <div class="footer-note">数值为每 100 g 可食部，生熟状态见详情页 · 参考《中国食物成分表》第 6 版、《中国居民膳食营养素参考摄入量（2023 版）》/ USDA</div>
  `;
}

/* ---------------- 页面：配餐 ---------------- */
function mealOrderCard() {
  const seq = mealSequence(state.trainTime, state.meals);
  const r = compute();
  const totalShare = seq.reduce((a, role) => a + MEAL_ROLES[role].share, 0);

  const list = seq.map((role, i) => {
    const m = MEAL_ROLES[role];
    const share = m.share;
    const kcal = Math.round(r.kcal * share / totalShare);
    return `<div class="seq-row">
      <span class="seq-idx">${i + 1}</span>
      <span class="seq-role">${m.icon} ${m.label}</span>
      <span class="seq-share">${Math.round(share / totalShare * 100)}% · ${kcal} kcal</span>
    </div>`;
  }).join('');

  const tips = [...new Set(seq)].map(role => `<li><b>${MEAL_ROLES[role].label}</b>：${MEAL_ROLES[role].tip}</li>`).join('');

  return `<div class="card tight" style="margin-bottom:14px">
    <div class="card-title" style="margin-bottom:8px"><h3>今天的餐序</h3><span class="card-hint">全天 ${fmt(r.kcal)} kcal 怎么分</span></div>
    <div class="chips" style="margin-bottom:10px">
      ${TRAIN_TIMES.map(t => `<button class="chip sm ${state.trainTime === t.id ? 'on' : ''}" data-traintime="${t.id}">${t.name}</button>`).join('')}
    </div>
    <div class="seq-list">${list}</div>
    <ul class="seq-tips">${tips}</ul>
  </div>`;
}

function slotFood(k) { return FOODS.find(x => x.id === state.meal[k].id); }

function slotOil(k) {
  const sel = state.meal[k];
  if (!sel || !sel.g) return 0;
  if (k === 'veg' && !sel.on) return 0;
  const f = slotFood(k);
  return f ? oilGrams(f, sel.method || 'raw', sel.g) : 0;
}

function totalOil() {
  return ['carb', 'protein', 'fat', 'veg'].reduce((a, k) => a + slotOil(k), 0);
}

function renderMeal() {
  const r = compute();
  const mt = { c: r.c / state.meals, p: r.p / state.meals, f: r.f / state.meals };
  const oilAll = totalOil();
  const contrib = (k, macro) => {
    const sel = state.meal[k];
    if (!sel || !sel.g || (k === 'veg' && !sel.on)) return 0;
    const f = FOODS.find(x => x.id === sel.id);
    return f ? f[macro] * sel.g / 100 : 0;
  };
  const others = {
    c: contrib('protein', 'c') + contrib('veg', 'c'),
    p: contrib('carb', 'p') + contrib('veg', 'p'),
    f: contrib('carb', 'f') + contrib('protein', 'f') + contrib('veg', 'f') + oilAll
  };
  const slots = [
    { key: 'carb', macro: 'c', label: '碳水', target: Math.max(0, mt.c - others.c), color: '#ffd60a', other: others.c },
    { key: 'protein', macro: 'p', label: '蛋白质', target: Math.max(0, mt.p - others.p), color: '#ff6482', other: others.p },
    { key: 'fat', macro: 'f', label: '脂肪', target: Math.max(0, mt.f - others.f), color: '#64d2ff', other: others.f },
    { key: 'veg', macro: null, label: '果蔬', target: 0, color: '#3ddc84', other: 0 }
  ];

  let tot = { kcal: 0, p: 0, c: 0, f: 0 };
  slots.forEach(s => {
    const sel = state.meal[s.key];
    if (!sel || !sel.g || (s.key === 'veg' && !sel.on)) return;
    const f = FOODS.find(x => x.id === sel.id);
    if (!f) return;
    const k = sel.g / 100;
    tot.kcal += f.kcal * k; tot.p += f.p * k; tot.c += f.c * k; tot.f += f.f * k;
  });
  tot.f += oilAll;
  tot.kcal += oilAll * 9;

  return `
  <div class="hero" style="padding-bottom:6px">
    <div class="kicker"><span class="dot"></span> 一餐配平</div>
    <h1 style="font-size:30px">这顿吃多少？</h1>
    <p>选定食物后，系统直接换算成「克数 + 拳头/手掌」，并把炒菜油一起算进脂肪。</p>
  </div>

  <div class="card tight" style="margin-bottom:14px">
    <div class="card-title" style="margin-bottom:10px"><h3>本餐目标</h3>
      <div style="width:180px">${segHTML('meals', [{ v: '3', t: '3 餐' }, { v: '4', t: '4 餐' }, { v: '5', t: '5 餐' }], String(state.meals), true)}</div>
    </div>
    <div class="macros" style="display:flex;gap:14px;font-size:11px;color:var(--dim-2)">
      <span>碳水 <b style="color:var(--txt)">${round(mt.c)} g</b></span>
      <span>蛋白 <b style="color:var(--txt)">${round(mt.p)} g</b></span>
      <span>脂肪 <b style="color:var(--txt)">${round(mt.f)} g</b></span>
      <span>≈ <b style="color:var(--txt)">${round(r.kcal / state.meals)} kcal</b></span>
    </div>
  </div>

  ${mealOrderCard()}

  ${oilAll > 0 ? `<div class="oil-banner">🫗 这餐的烹调油约 <b>${round(oilAll, 1)} g</b>（${Math.round(oilAll * 9)} kcal），已从脂肪配额里扣掉</div>` : ''}
  ${slots.map(s => slotHTML(s, oilAll)).join('')}

  <div class="totals">
    <div class="t"><div class="k">热量</div><div class="v ${Math.abs(tot.kcal - r.kcal / state.meals) < 120 ? 'good' : 'bad'}">${round(tot.kcal)}</div></div>
    <div class="t"><div class="k">碳水</div><div class="v ${Math.abs(tot.c - mt.c) < 8 ? 'good' : ''}">${round(tot.c)} g</div></div>
    <div class="t"><div class="k">蛋白</div><div class="v ${Math.abs(tot.p - mt.p) < 6 ? 'good' : ''}">${round(tot.p)} g</div></div>
    <div class="t"><div class="k">脂肪</div><div class="v ${Math.abs(tot.f - mt.f) < 5 ? 'good' : ''}">${round(tot.f)} g</div></div>
  </div>

  <button class="btn-secondary" style="margin-top:10px" data-action="autobalance">⚡️ 按目标自动配平三种食物</button>
  <div class="pill-note"><span class="i">💡</span><span>配平只保证三大营养素命中，微量营养素请靠每天 <b>300–500 g 蔬菜</b> 和 <b>200–350 g 水果</b> 补齐——那部分热量很低，却决定了你「吃得健不健康」。</span></div>
  `;
}

function swapCandidates(food, macro, grams) {
  if (!macro || !grams) return [];
  const amount = food[macro] * grams / 100;
  return FOODS
    .filter(f => f.cat === food.cat && f.id !== food.id && f[macro] > 0)
    .map(f => ({ f, g: Math.round(amount / (f[macro] / 100)) }))
    .filter(x => x.g > 8 && x.g < 1200)
    .sort((a, b) => Math.abs(a.g - grams) - Math.abs(b.g - grams))
    .slice(0, 3);
}

function slotHTML(s, oilAll) {
  const sel = state.meal[s.key];
  const foods = FOODS.filter(f => f.cat === s.key);
  const food = FOODS.find(f => f.id === sel.id) || foods[0];
  const g = sel.g || 0;
  const contrib = s.macro ? food[s.macro] * g / 100 : 0;
  const hit = s.macro ? Math.abs(contrib - s.target) <= Math.max(2, s.target * 0.06) : false;
  const need = s.macro && food[s.macro] > 0 ? s.target / (food[s.macro] / 100) : 0;
  const analogy = g > 0 ? portionText(g, food) : '';
  const oil = slotOil(s.key);
  const mets = methodsFor(food);
  const methodId = mets.includes(sel.method) ? sel.method : mets[0];
  const mObj = METHODS.find(x => x.id === methodId) || METHODS[0];

  return `<div class="slot" data-slot="${s.key}">
    <div class="slot-head">
      <div class="slot-title"><span class="pip" style="background:${s.color};box-shadow:0 0 8px ${s.color}"></span>${s.label}${s.macro ? `<span style="font-weight:500;color:var(--dim-2);font-size:11px">本槽需 ${round(s.target)} g${s.other > 1 ? `　<span style="opacity:.7">其他已占 ${round(s.other)} g</span>` : ''}</span>` : `<span style="font-weight:500;color:var(--dim-2);font-size:11px">选加</span>`}</div>
      ${s.macro ? `<div class="slot-target">${g > 0 ? `= <b style="color:var(--orange-2)">${fmt(g)} g</b> ${food.name}` : `需要约 ${fmt(need)} g ${food.name}`}</div>` : `<div class="slot-target">${sel.on ? '已加入' : '未加入'}</div>`}
    </div>
    <div class="chips">
      ${foods.map(f => `<button class="chip ${f.id === food.id ? 'on' : ''}" data-pick="${s.key}" data-fid="${f.id}">${ICONS[f.icon]}${f.name}</button>`).join('')}
      ${s.key === 'veg' ? `<button class="chip ${sel.on ? 'on' : ''}" data-veg-toggle="1">${sel.on ? '✓ 已加入本餐' : '+ 加入果蔬'}</button>` : ''}
    </div>
    <div class="slot-body">
      <div class="big-ico">${ICONS[food.icon]}</div>
      <div>
        <div style="font-size:13px;font-weight:700">${food.name} <span style="font-size:10px;color:var(--dim-2);font-weight:500">${food.state}</span>${giOf(food) ? `<span class="gi ${giOf(food).level}" style="margin-left:6px">GI ${giOf(food).level}</span>` : ''}</div>
        <div class="stepper">
          <button data-step="${s.key}" data-d="-10">−</button>
          <div class="g">${fmt(g)}<small>g</small></div>
          <button data-step="${s.key}" data-d="10">+</button>
        </div>
        <div style="font-size:10.5px;color:var(--dim-2);margin-top:6px">${analogy}</div>
      </div>
      <div class="slot-result">
        ${s.macro ? `<b class="${hit ? 'ok' : ''}">${round(contrib, 1)} g</b><br>${hit ? '✓ 达标' : (contrib > s.target ? '超出' : '还差 ' + round(s.target - contrib, 1) + ' g')}` : `<b>${food.kcal * g / 100 ? round(food.kcal * g / 100) : 0}</b><br>kcal`}
      </div>
    </div>
    ${s.macro ? `<div class="method-row">
      <div class="method-label">做法</div>
      <div class="chips method-chips">
        ${mets.map(id => {
          const m = METHODS.find(x => x.id === id);
          return `<button class="chip sm ${m.id === methodId ? 'on' : ''}" data-method="${s.key}" data-mid="${m.id}">${m.name}</button>`;
        }).join('')}
      </div>
    </div>
    ${s.macro && g > 0 ? `<div class="swap-row">
      <span class="swap-label">等量替换</span>
      ${swapCandidates(food, s.macro, g).map(x => `<button class="chip sm" data-swap="${s.key}" data-fid="${x.f.id}" data-g="${x.g}">${x.f.name} ${x.g}g</button>`).join('')}
    </div>` : ''}
    <div class="oil-line ${oil > 0 ? 'has' : ''}">${oil > 0 ? `🫗 ${mObj.name}：额外油 <b>${round(oil, 1)} g</b> / ${Math.round(oil * 9)} kcal` : `✔ ${mObj.name}：不额外加油`}</div>` : ''}
  </div>`;
}

/* 克数 → 形象比喻 */
function portionText(g, food) {
  const unit = food.unit;
  const n = g / unit.g;
  const raw = unit.name.replace(/^一/, '');
  let phrase;
  if (Math.abs(n - 0.5) < 0.13) phrase = raw.startsWith('个') ? '半个' + raw.slice(1) : '半' + raw;
  else if (Math.abs(n - 1) < 0.13) phrase = '1 ' + raw;
  else if (Math.abs(n - 1.5) < 0.13) phrase = (raw.startsWith('个') ? '一个半' + raw.slice(1) : '一' + raw + '半');
  else phrase = `${round(n, 1)} ${raw}`;
  return `≈ ${phrase}（1 ${raw} ≈ ${unit.g} g）`;
}

/* ---------------- 反馈调整 ---------------- */
function tuneInit() {
  const r = compute();
  const mid = (r.scene.rate[0] + r.scene.rate[1]) / 2;
  const t = state.tune;
  if (!t) {
    const wt = weightTrend();
    const weeks = 2;
    // 有体重记录就用真实数据：两周前 vs 现在
    if (wt.last && wt.w14 && wt.last.d >= dstr(addDays(new Date(), -14))) {
      state.tune = { weeks, start: wt.w14, now: wt.last.kg, strength: 'same', energy: 'ok' };
    } else {
      const start = wt.last ? wt.last.kg : state.weight;
      state.tune = {
        weeks, start,
        now: Math.round((start * (1 + mid * weeks)) * 10) / 10,
        strength: 'same', energy: 'ok'
      };
    }
  }
  return state.tune;
}

function tuneAdvice() {
  const r = compute(), sc = r.scene, t = state.tune;
  const rate = (t.now - t.start) / t.start / t.weeks * 100;
  const lo = sc.rate[0] * 100, hi = sc.rate[1] * 100;
  const isBulk = sc.key === 'bulk', isCut = sc.key === 'cut';
  let delta = 0, title = '', tone = 'good', notes = [];

  if (isBulk) {
    if (rate > 0.65) { delta = -200; title = '增重太快，先减 200 kcal'; tone = 'warn';
      notes.push('超出 0.5%/周的部分基本是脂肪。减 50 g 碳水（约 1/3 碗饭），蛋白与脂肪不动。'); }
    else if (rate > 0.5) { delta = -100; title = '略快于建议，减 100 kcal'; tone = 'warn';
      notes.push('减 25 g 碳水即可；先别动蛋白。'); }
    else if (rate >= 0.2) { delta = 0; title = '速度刚好，保持'; tone = 'good';
      notes.push('维持当前配额，2 周后再复称一次。'); }
    else if (rate >= 0.05) { delta = 100; title = '偏慢，加 100 kcal'; tone = 'warn';
      notes.push('加 25 g 碳水，训练前后各一半。'); }
    else { delta = 200; title = '几乎没涨，加 200 kcal'; tone = 'bad';
      notes.push('加 50 g 碳水；同时确认体重是晨起空腹、排空后称的，且没有漏记饮料和零食。'); }
  } else if (isCut) {
    if (rate < -1.4) { delta = 200; title = '掉太快，加 200 kcal'; tone = 'bad';
      notes.push('超过 1.4%/周时掉肌肉和掉力量的风险明显上升。加 50 g 碳水，蛋白保持 ≥2.2 g/kg。'); }
    else if (rate < -1.05) { delta = 100; title = '略快，加 100 kcal'; tone = 'warn';
      notes.push('加 25 g 碳水，优先放训练前后。'); }
    else if (rate <= -0.45) { delta = 0; title = '速度刚好，保持'; tone = 'good';
      notes.push('缺口合适，每周固定同一天复称。'); }
    else if (rate <= -0.15) { delta = -150; title = '偏慢，减 150 kcal'; tone = 'warn';
      notes.push('先减 15 g 脂肪（约 1 勺油），别先砍碳水——碳水太低会直接拖垮训练表现。'); }
    else { delta = -200; title = '基本没掉，减 200 kcal 或多走路'; tone = 'bad';
      notes.push('先核对记录准确性；再考虑每天多走 2000 步，这比继续砍热量更保肌肉。'); }
  } else {
    if (rate > 0.4) { delta = -150; title = '在慢慢变重，减 150 kcal'; tone = 'warn'; }
    else if (rate < -0.4) { delta = 150; title = '在慢慢变轻，加 150 kcal'; tone = 'warn'; }
    else { delta = 0; title = '体重稳定，保持'; tone = 'good'; }
    notes.push('不训练 / 休息期以稳定为目标，周波动 ±0.3% 都算正常。');
  }

  if (t.strength === 'down') {
    tone = 'bad';
    if (isCut) { delta += 150; notes.push('力量下降是减脂过快的红灯：先加 150 kcal 碳水，再查睡眠（<7 h 会直接压低表现）与训练量。'); }
    else if (isBulk) { delta += 100; notes.push('增肌期力量不升反降，多半不是热量不够，而是恢复不足：加 25 g 碳水，同时检查睡眠与训练容量。'); }
    else { notes.push('非训练期力量下降主要是停训造成的，不必加餐，复训 2–3 周会快速回来（肌肉记忆）。'); }
  }
  if (t.strength === 'up' && (isBulk || isCut)) notes.push('力量还在涨，说明肌肉保住了，优先维持蛋白与训练强度。');
  if (t.energy === 'bad') {
    if (tone === 'good') tone = 'warn';
    if (isCut) { delta += 100; notes.push('持续乏力、易怒、怕冷可能是能量可用性过低：加 100 kcal，并安排 1 天 refeed（碳水 +80–100 g）。'); }
    else notes.push('精力差先查睡眠时长、咖啡因时间与总热量是否长期偏低，再谈加餐。');
  }

  delta = Math.max(-300, Math.min(300, Math.round(delta / 50) * 50));
  const kcal = r.kcal + delta;
  let carb = Math.round((kcal - r.p * 4 - r.f * 9) / 4);
  if (carb < state.weight * 1.5) carb = Math.round(state.weight * 1.5);

  return {
    rate: round(rate, 2), lo, hi, delta, tone, title, notes,
    plan: { kcal, p: r.p, c: carb, f: r.f }
  };
}

function tuneHTML() {
  const t = tuneInit();
  const a = tuneAdvice();
  const color = a.tone === 'good' ? 'var(--green)' : a.tone === 'warn' ? 'var(--orange-2)' : '#ff6482';
  return `
    <h2>执行结果调整</h2>
    <div class="sub">按这套配额吃 2 周后回来填一次，我给你具体加/减多少</div>

    <div class="slot" style="margin-bottom:10px">
      <div class="stepper" style="justify-content:space-between">
        <span style="font-size:13px;font-weight:650">执行了几周</span>
        <div class="stepper">
          <button data-tstep="weeks" data-d="-1">−</button>
          <div class="g" style="min-width:52px">${t.weeks}<small>周</small></div>
          <button data-tstep="weeks" data-d="1">+</button>
        </div>
      </div>
    </div>

    <div class="slot" style="margin-bottom:10px">
      <div class="stepper" style="justify-content:space-between">
        <span style="font-size:13px;font-weight:650">起始体重</span>
        <div class="stepper">
          <button data-tstep="start" data-d="-0.5">−</button>
          <div class="g" style="min-width:86px">${t.start.toFixed(1)}<small>kg</small></div>
          <button data-tstep="start" data-d="0.5">+</button>
        </div>
      </div>
      <div class="stepper" style="justify-content:space-between;margin-top:12px">
        <span style="font-size:13px;font-weight:650">现在体重</span>
        <div class="stepper">
          <button data-tstep="now" data-d="-0.5">−</button>
          <div class="g" style="min-width:86px">${t.now.toFixed(1)}<small>kg</small></div>
          <button data-tstep="now" data-d="0.5">+</button>
        </div>
      </div>
    </div>

    <div class="card-hint" style="margin:14px 0 7px">训练表现</div>
    ${segHTML('strength', [{ v: 'up', t: '在变强' }, { v: 'same', t: '持平' }, { v: 'down', t: '明显下降' }], t.strength, true)}
    <div class="card-hint" style="margin:14px 0 7px">精力与食欲</div>
    ${segHTML('energy', [{ v: 'good', t: '很好' }, { v: 'ok', t: '一般' }, { v: 'bad', t: '长期疲惫' }], t.energy, true)}

    <div class="advice-box" style="border-color:${color}55;background:${color}12">
      <div class="a-head" style="color:${color}">${a.title}</div>
      <div class="a-rate">周均变化 <b>${a.rate > 0 ? '+' : ''}${a.rate}%</b> · 目标 ${a.lo > 0 ? '+' : ''}${a.lo}% ~ ${a.hi > 0 ? '+' : ''}${a.hi}%
        <span style="margin-left:8px">建议 <b style="color:${color}">${a.delta > 0 ? '+' : ''}${a.delta} kcal</b></span></div>
      <ul>${a.notes.map(n => `<li>${n}</li>`).join('')}</ul>
      <div class="a-plan">
        <span>调整后：<b>${fmt(a.plan.kcal)}</b> kcal</span>
        <span>碳水 <b>${a.plan.c}</b> g</span>
        <span>蛋白 <b>${a.plan.p}</b> g</span>
        <span>脂肪 <b>${a.plan.f}</b> g</span>
      </div>
    </div>

    <button class="btn-primary" style="margin-top:16px" data-apply-tune="1"><span class="shine"></span>${a.delta === 0 ? '保持当前方案' : `把目标改为 ${fmt(a.plan.kcal)} kcal`}</button>
    <button class="btn-secondary" style="margin-top:10px" data-reset-tune="1">清除手动调整，回到公式值</button>
  `;
}

function renderTuneSheet() {
  $('#sheetInner').innerHTML = `<div class="grab"></div>${tuneHTML()}`;
}

function openTune() {
  tuneInit();
  $('#sheetMask').classList.add('on');
  $('#sheet').classList.add('on');
  renderTuneSheet();
}

/* ---------------- 体重记录 ---------------- */
function addWeight(date, kg) {
  const i = state.weights.findIndex(w => w.d === date);
  if (i >= 0) state.weights[i].kg = kg;
  else state.weights.push({ d: date, kg });
  state.weights.sort((a, b) => a.d.localeCompare(b.d));
  if (state.weights.length > 400) state.weights = state.weights.slice(-400);
  save();
}

function weightAt(daysAgo) {
  const target = dstr(addDays(new Date(), -daysAgo));
  const before = state.weights.filter(w => w.d <= target).pop();
  return before ? before.kg : null;
}

function weightTrend() {
  const last = state.weights[state.weights.length - 1] || null;
  const w7 = weightAt(7), w14 = weightAt(14);
  const series = state.weights.slice(-30);
  return {
    last, w7, w14,
    d7: last && w7 ? round(last.kg - w7, 1) : null,
    d14: last && w14 ? round(last.kg - w14, 1) : null,
    series
  };
}

function sparkline(series) {
  if (series.length < 2) return '';
  const vals = series.map(x => x.kg);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const W = 300, H = 64, pad = 6;
  const pts = series.map((x, i) => {
    const px = pad + i * (W - pad * 2) / (series.length - 1);
    const py = H - pad - (x.kg - min) / span * (H - pad * 2);
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(' ');
  const lastPt = pts.split(' ').pop();
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <polyline points="${pts}" fill="none" stroke="url(#sparkGrad)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <defs><linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff9f0a"/><stop offset="100%" stop-color="#ff453a"/>
    </linearGradient></defs>
    <circle cx="${lastPt.split(',')[0]}" cy="${lastPt.split(',')[1]}" r="3.5" fill="#fff"/>
  </svg>`;
}

function weightCard() {
  const t = weightTrend();
  if (!t.last) {
    return `<div class="card">
      <div class="card-title"><h3>体重</h3><span class="card-hint">建议每周同一天称</span></div>
      <div class="empty-note">还没有体重记录。体重是判断「吃对没吃对」最直接的指标，比每天称更准的是看 7 天平均。</div>
      <button class="btn-secondary" style="margin-top:12px" data-action="add-weight">＋ 记录体重</button>
    </div>`;
  }
  const d7 = t.d7 === null ? '—' : `${t.d7 > 0 ? '+' : ''}${t.d7} kg`;
  const d14 = t.d14 === null ? '—' : `${t.d14 > 0 ? '+' : ''}${t.d14} kg`;
  return `<div class="card">
    <div class="card-title"><h3>体重</h3><span class="card-hint">${t.last.d}</span></div>
    <div class="weight-top">
      <div class="weight-num">${t.last.kg}<small>kg</small></div>
      <div class="weight-delta">
        <span>7 天 ${d7}</span><span>14 天 ${d14}</span>
      </div>
    </div>
    ${sparkline(t.series)}
    <div class="btn-row" style="margin-top:12px">
      <button class="btn-secondary" data-action="add-weight">记录体重</button>
      <button class="btn-secondary" data-action="tune">看调整建议</button>
    </div>
  </div>`;
}

function openWeightSheet() {
  const t = weightTrend();
  const latest = t.last ? t.last.kg : state.weight;
  sheetHTML(`
    <h2>记录体重</h2>
    <div class="sub">晨起空腹、排空后称最稳定；看 7 天平均，别被单日波动影响</div>
    <label class="lf-date"><span>日期</span><input type="date" id="weightDate" value="${dstr()}" max="${dstr()}"></label>
    <div class="field" style="margin-top:18px">
      <div class="field-head">
        <span class="field-label">体重</span>
        <span class="field-value lv-wrap"><input class="lv-input" type="number" inputmode="decimal" id="weightKg" value="${latest}" step="0.1" min="30" max="250"><small>kg</small></span>
      </div>
    </div>
    <button class="btn-primary" style="margin-top:18px" data-save-weight="1"><span class="shine"></span>保存</button>
  `);
}

/* ---------------- 导出 / 导入 / 提醒 ---------------- */
function exportData() {
  const payload = {
    app: 'muscle-calculator', version: 2, exported: new Date().toISOString(),
    logs: state.logs, days: state.days, weights: state.weights,
    settings: {
      group: state.group, goal: state.goal, rest: state.rest, sex: state.sex,
      height: state.height, weight: state.weight, age: state.age,
      sessions: state.sessions, activity: state.activity, meals: state.meals,
      proteinTier: state.proteinTier, kcalOffset: state.kcalOffset,
      cardioH: state.cardioH, cardioInt: state.cardioInt, trainTime: state.trainTime
    }
  };
  downloadFile(JSON.stringify(payload, null, 2), `muscle-calculator-${dstr()}.json`, 'application/json');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      if (!d || d.app !== 'muscle-calculator') throw new Error('不是本应用导出的文件');
      if (Array.isArray(d.logs)) state.logs = d.logs.slice(0, 90);
      if (d.days && typeof d.days === 'object') state.days = d.days;
      if (Array.isArray(d.weights)) state.weights = d.weights.slice(-400);
      if (d.settings) Object.assign(state, d.settings);
      save(); closeSheet(); render({ top: true });
      alert(`已导入：${state.logs.length} 条餐次、${Object.keys(state.days).length} 天汇总、${state.weights.length} 条体重`);
    } catch (e) {
      alert('导入失败：' + e.message);
    }
  };
  reader.readAsText(file);
}

function downloadFile(text, name, type) {
  try {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    // 某些环境没有 createObjectURL，退化成 data URI
    const a = document.createElement('a');
    a.href = 'data:' + type + ';charset=utf-8,' + encodeURIComponent(text);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }
}

/* 生成每日提醒日历（.ics），任何手机都能导入 */
function downloadReminder() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const y = now.getFullYear(), m = pad2(now.getMonth() + 1), d = pad2(now.getDate());
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Muscle Calculator//CN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:mc-reminder-${Date.now()}@local`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${y}${m}${d}T200000`,
    'DURATION:PT10M',
    'RRULE:FREQ=DAILY',
    'SUMMARY:记录今天的饮食',
    'DESCRIPTION:打开 Muscle Calculator，花 30 秒记一餐。',
    'BEGIN:VALARM', 'TRIGGER:-PT5M', 'ACTION:DISPLAY', 'DESCRIPTION:记录今天的饮食', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  downloadFile(ics, 'muscle-calculator-reminder.ics', 'text/calendar');
}

/* ---------------- 餐次记录 & 日历 ---------------- */
const MEALS = [
  { v: 'breakfast', t: '早餐', icon: '🌅' },
  { v: 'lunch', t: '午餐', icon: '☀️' },
  { v: 'dinner', t: '晚餐', icon: '🌙' },
  { v: 'snack', t: '加餐', icon: '🍎' }
];
const LOG_MAX = 90;          // 餐次记录上限
const DAY_KEEP = 400;        // 每日汇总保留天数（> 1 年）

const pad2 = n => String(n).padStart(2, '0');
const dstr = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseD = str => { const [y, m, d] = str.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const weekdayCN = d => '日一二三四五六'[d.getDay()];

function dayEntry(date) {
  return state.days[date] || { c: 0, p: 0, f: 0, meals: 0, t: null };
}

/* 每日达标判定：85%–115% 之间算达标 */
function dayVerdict(date) {
  const d = state.days[date];
  if (!d || !d.meals) return { status: 'none', rows: [], day: null };
  const r = compute();
  const t = d.t || { c: r.c, p: r.p, f: r.f };
  const rows = [
    { k: 'c', label: '碳水', now: d.c, target: t.c },
    { k: 'p', label: '蛋白', now: d.p, target: t.p },
    { k: 'f', label: '脂肪', now: d.f, target: t.f }
  ].map(x => {
    const ratio = x.target > 0 ? x.now / x.target : 0;
    return { ...x, ratio, verdict: ratio > 1.15 ? 'high' : ratio < 0.85 ? 'low' : 'ok' };
  });
  let status = 'met';
  if (rows.some(x => x.verdict === 'high')) status = 'over';
  else if (rows.some(x => x.verdict === 'low')) status = 'under';
  return { status, rows, day: d, target: t };
}

/* ---------- 写入：增量维护每日汇总 ---------- */
function touchDay(date, probe) {
  if (!state.days[date]) {
    const r = compute();
    state.days[date] = { c: 0, p: 0, f: 0, meals: 0, t: { c: r.c, p: r.p, f: r.f } };
  }
  const d = state.days[date];
  d.c = Math.max(0, d.c + probe.c); d.p = Math.max(0, d.p + probe.p);
  d.f = Math.max(0, d.f + probe.f); d.meals = Math.max(0, d.meals + probe.n);
  if (d.meals === 0) delete state.days[date];
  pruneDays();
}

function pruneDays() {
  const keys = Object.keys(state.days).sort();
  while (keys.length > DAY_KEEP) delete state.days[keys.shift()];
}

function saveEntry(entry) {
  const rounds = x => Math.round(x);
  const clean = { ...entry, c: rounds(entry.c), p: rounds(entry.p), f: rounds(entry.f) };
  if (clean.id) {
    const old = state.logs.find(x => x.id === clean.id);
    if (old) {
      touchDay(old.date, { c: -old.c, p: -old.p, f: -old.f, n: -1 });
      touchDay(clean.date, { c: clean.c, p: clean.p, f: clean.f, n: 1 });
      Object.assign(old, clean);
    }
  } else {
    clean.id = 'L' + Date.now() + Math.random().toString(36).slice(2, 6);
    clean.ts = Date.now();
    state.logs.unshift(clean);
    touchDay(clean.date, { c: clean.c, p: clean.p, f: clean.f, n: 1 });
  }
  state.logs.sort((a, b) => (b.date + b.ts).localeCompare(a.date + a.ts));
  state.logs = state.logs.slice(0, LOG_MAX);
  save();
}

function removeEntry(id) {
  const i = state.logs.findIndex(x => x.id === id);
  if (i < 0) return;
  const e = state.logs[i];
  touchDay(e.date, { c: -e.c, p: -e.p, f: -e.f, n: -1 });
  state.logs.splice(i, 1);
  save();
}

/* ---------- 页面：记录 ---------- */
function renderLog() {
  if (state.logView === 'calendar') return renderLogCalendar();
  if (state.logView === 'history') return renderLogHistory();
  return renderLogToday();
}

function logHeader(title, desc) {
  return `<div class="hero" style="padding-bottom:8px">
    <div class="kicker"><span class="dot"></span> 饮食记录</div>
    <h1 style="font-size:30px">${title}</h1>
    <p>${desc}</p>
    <div style="margin-top:14px">
      ${segHTML('logView', [{ v: 'today', t: '今天' }, { v: 'calendar', t: '日历' }, { v: 'history', t: '明细' }], state.logView)}
    </div>
  </div>`;
}

function renderLogToday() {
  const date = dstr();
  const now = dayEntry(date);
  const v = dayVerdict(date);
  const r = compute();
  const t = now.t || { c: r.c, p: r.p, f: r.f };
  const meals = state.logs.filter(x => x.date === date);
  const st = { none: ['还没有记录', 'var(--dim-2)'], under: ['未达标', '#ff9f0a'], met: ['已达标', '#3ddc84'], over: ['有超标', '#ff453a'] }[v.status];

  const bars = [['碳水', now.c, t.c, 'g', '#ffd60a'], ['蛋白', now.p, t.p, 'g', '#ff6482'], ['脂肪', now.f, t.f, 'g', '#64d2ff']]
    .map(([label, val, target, unit, color]) => {
      const pct = clamp(val / (target * 1.5) * 100, 0, 100);
      const diff = Math.round(val - target);
      const verdict = now.meals === 0 ? 'none' : val > target * 1.15 ? 'high' : val < target * 0.85 ? 'low' : 'ok';
      const tag = verdict === 'ok' ? '达标'
        : verdict === 'none' ? '未记录'
        : verdict === 'high' ? `+${diff} ${unit}` : `${diff} ${unit}`;
      return `<div class="log-bar">
        <div class="lb-top">
          <span>${label}</span>
          <span><b>${Math.round(val)}</b> / ${Math.round(target)} ${unit}
            <i class="lb-flag ${verdict}">${tag}</i></span>
        </div>
        <div class="lb-track"><i style="width:${pct}%;background:${color}"></i><b class="lb-target" style="left:66.6%"></b></div>
      </div>`;
    }).join('');

  return `${logHeader('今天吃够了吗', '记录每一餐的碳蛋脂，系统判断今天是否达标。')}
  <div class="card">
    <div class="card-title">
      <h3>${dstr().slice(5).replace('-', ' 月 ')} 日 · 周${weekdayCN(new Date())}</h3>
      <span class="status-chip ${v.status}">${st[0]}</span>
    </div>
    ${bars}
    <div class="log-total">今日合计 <b>${Math.round(now.c * 4 + now.p * 4 + now.f * 9)}</b> kcal · 已记录 ${now.meals} 餐</div>
    <button class="btn-primary" style="margin-top:14px" data-action="add-meal"><span class="shine"></span>＋ 记录一餐</button>
  </div>

  ${weightCard()}

  <div class="card">
    <div class="card-title"><h3>今天的记录</h3><span class="card-hint">${meals.length} 餐</span></div>
    ${meals.length ? meals.map(e => logRowHTML(e)).join('') : `<div class="empty-note">还没有记录。点上面的按钮，把今天这顿记下来。</div>`}
  </div>

  <div class="pill-note"><span class="i">📌</span><span>已保存 <b>${state.logs.length}/${LOG_MAX}</b> 条餐次记录，每日汇总保留 <b>最近 ${DAY_KEEP} 天</b>。超出 90 条后最早的餐次明细会被清理，但日历上的每日状态会一直留着。</span></div>`;
}

function logRowHTML(e) {
  const m = MEALS.find(x => x.v === e.meal) || MEALS[0];
  const kcal = Math.round(e.c * 4 + e.p * 4 + e.f * 9);
  return `<div class="log-row" data-edit="${e.id}">
    <div class="lr-ico">${m.icon}</div>
    <div class="lr-body">
      <div class="lr-top"><b>${m.t}</b><span>${e.date.slice(5)}</span></div>
      <div class="lr-macros">碳 ${e.c} · 蛋 ${e.p} · 脂 ${e.f} g${e.oil ? ` · 含烹调油 ${e.oil} g` : ''}</div>
    </div>
    <div class="lr-kcal">${kcal}<small>kcal</small></div>
    <button class="lr-again" data-again="${e.id}">再来一份</button>
    <button class="lr-del" data-del="${e.id}" aria-label="删除">✕</button>
  </div>`;
}

function calCell(date, cls, label) {
  const v = dayVerdict(date);
  const today = date === dstr();
  if (cls === 'xs') {
    return `<button class="cal-cell xs ${v.status}${today ? ' today' : ''}" data-day="${date}" title="${date}"></button>`;
  }
  if (cls === 'sm') {
    return `<button class="cal-cell sm ${v.status}${today ? ' today' : ''}" data-day="${date}" title="${date}"></button>`;
  }
  const mark = v.status === 'none' ? '✕' : v.status === 'over' ? '' : v.status === 'met' ? '✓' : '';
  return `<button class="cal-cell ${v.status}${today ? ' today' : ''}" data-day="${date}">
    <span class="cal-num">${Number(date.slice(8))}</span>
    ${mark ? `<span class="cal-mark">${mark}</span>` : ''}
    ${v.status === 'over' ? '<span class="cal-dot"></span>' : ''}
  </button>`;
}

function monthCells(y, m, pad = true) {
  const first = new Date(y, m - 1, 1);
  const startPad = (first.getDay() + 6) % 7;
  const total = new Date(y, m, 0).getDate();
  const cells = [];
  if (pad) for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(`${y}-${pad2(m)}-${pad2(d)}`);
  if (pad) while (cells.length % 7) cells.push(null);
  return cells;
}

function renderLogCalendar() {
  const zoom = state.calZoom || 'month';
  const cur = state.calMonth || dstr().slice(0, 7);
  const [y, m] = cur.split('-').map(Number);
  const today = dstr();

  let title = '', body = '', stats = '';

  if (zoom === 'year') {
    title = `${y} 年`;
    const rows = [];
    for (let mm = 1; mm <= 12; mm++) {
      const days = monthCells(y, mm, false);
      const pad = Array(31 - days.length).fill('<span class="year-pad"></span>').join('');
      rows.push(`<div class="year-row">
        <span class="year-label">${mm}月</span>
        <div class="year-cells">${days.map(d => calCell(d, 'xs')).join('')}${pad}</div>
      </div>`);
    }
    body = `<div class="year-view">${rows.join('')}</div>`;
    const all = [];
    for (let mm = 1; mm <= 12; mm++) all.push(...monthCells(y, mm, false));
    const rec = all.filter(d => dayVerdict(d).status !== 'none');
    const ok = all.filter(d => ['met', 'over'].includes(dayVerdict(d).status));
    stats = `<div class="stat-grid" style="margin-top:0">
      <div class="stat"><div class="k">今年记录</div><div class="v">${rec.length} 天</div><div class="s">共 ${all.length} 天</div></div>
      <div class="stat"><div class="k">达标 / 超标</div><div class="v">${ok.length} 天</div><div class="s">占记录 ${rec.length ? Math.round(ok.length / rec.length * 100) : 0}%</div></div>
    </div>`;
  } else if (zoom === 'quarter') {
    const q = Math.floor((m - 1) / 3) + 1;
    title = `${y} 年 Q${q}`;
    const months = [(q - 1) * 3 + 1, (q - 1) * 3 + 2, (q - 1) * 3 + 3];
    body = `<div class="quarter-grid">${months.map(mm => {
      const cells = monthCells(y, mm, false);
      const startPad = (new Date(y, mm - 1, 1).getDay() + 6) % 7;
      return `<div class="q-month">
        <div class="q-title">${mm} 月</div>
        <div class="q-week">${['一','二','三','四','五','六','日'].map(w => `<span>${w}</span>`).join('')}</div>
        <div class="q-grid">
          ${Array(startPad).fill('<span></span>').join('')}
          ${cells.map(d => calCell(d, 'sm')).join('')}
        </div>
      </div>`;
    }).join('')}</div>`;
    stats = '';
  } else {
    title = `${y} 年 ${m} 月`;
    const cells = monthCells(y, m);
    body = `<div class="cal-week">${['一', '二', '三', '四', '五', '六', '日'].map(w => `<span>${w}</span>`).join('')}</div>
      <div class="cal-grid">${cells.map(d => d ? calCell(d, 'md') : '<div class="cal-cell blank"></div>').join('')}</div>`;
    const days = monthCells(y, m, false);
    const rec = days.filter(d => dayVerdict(d).status !== 'none');
    const ok = days.filter(d => ['met', 'over'].includes(dayVerdict(d).status));
    let streak = 0, cursor = new Date();
    while (['met', 'over'].includes(dayVerdict(dstr(cursor)).status)) { streak++; cursor = addDays(cursor, -1); }
    stats = `<div class="stat-grid" style="margin-top:0">
      <div class="stat"><div class="k">本月记录</div><div class="v">${rec.length} 天</div><div class="s">共 ${days.length} 天</div></div>
      <div class="stat"><div class="k">达标 / 超标</div><div class="v">${ok.length} 天</div><div class="s">含超标日</div></div>
      <div class="stat"><div class="k">连续达标</div><div class="v">${streak} 天</div><div class="s">从今天往回数</div></div>
      <div class="stat"><div class="k">数据保留</div><div class="v">${Object.keys(state.days).length} 天</div><div class="s">上限 ${DAY_KEEP} 天</div></div>
    </div>`;
  }

  return `${logHeader('这个月，练得怎么样', '每个格子是一天。点开就能看到差在哪一项。')}
  <div class="card">
    <div class="cal-head">
      <button class="cal-nav" data-cal="-1">‹</button>
      <div class="cal-title">${title}</div>
      <button class="cal-nav" data-cal="1">›</button>
      <button class="cal-today" data-cal="0">今天</button>
    </div>
    <div class="cal-zoom">
      ${segHTML('calZoom', [{ v: 'month', t: '月' }, { v: 'quarter', t: '季' }, { v: 'year', t: '年' }], zoom, true)}
    </div>
    ${body}
    <div class="cal-legend">
      <span><i class="lg met"></i>达标</span>
      <span><i class="lg over"></i>超标</span>
      <span><i class="lg under"></i>未达标</span>
      <span><i class="lg none">✕</i>没记录</span>
    </div>
  </div>
  ${stats}
  <div class="pill-note"><span class="i">🟩</span><span>绿色 = 三项都在目标 ±15% 内；红色带白点 = 有项目超标；灰色 = 有项目没吃够；红叉 = 当天没有记录。点任意格子看明细；「年」视图适合一次性截图整年。</span></div>`;
}

function renderLogHistory() {
  const list = state.logs;
  const byDate = {};
  list.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  const dates = Object.keys(byDate).sort().reverse();

  return `${logHeader('每一餐的记录', `最多保存 ${LOG_MAX} 条；日历状态不受清理影响。`)}
  <div class="tool-row">
    <button class="chip sm" data-action="export-data">⬇️ 导出备份</button>
    <button class="chip sm" data-action="import-data">⬆️ 导入</button>
    <button class="chip sm" data-action="reminder">⏰ 每日提醒</button>
  </div>
  ${list.length ? dates.map(d => {
    const v = dayVerdict(d);
    const kcal = byDate[d].reduce((a, e) => a + e.c * 4 + e.p * 4 + e.f * 9, 0);
    return `<div class="history-group">
      <div class="hg-head">
        <span>${d.slice(5).replace('-', '/')} · 周${weekdayCN(parseD(d))}</span>
        <span class="status-chip ${v.status}" style="font-size:10px">${{ met: '达标', over: '超标', under: '未达标', none: '—' }[v.status]}</span>
        <span class="hg-kcal">${Math.round(kcal)} kcal</span>
      </div>
      ${byDate[d].map(e => logRowHTML(e)).join('')}
    </div>`;
  }).join('') : `<div class="card"><div class="empty-note">还没有任何记录。去「今天」记第一餐吧。</div></div>`}`;
}

/* ---------- 记录弹层 ---------- */
function openEntry(entry) {
  const base = entry
    ? { ...entry, oil: entry.oil || 0, f: Math.max(0, entry.f - (entry.oil || 0)) }
    : { date: dstr(), meal: 'lunch', c: 0, p: 0, f: 0, oil: 0 };
  state.draft = base;
  renderEntrySheet();
  $('#sheetMask').classList.add('on');
  $('#sheet').classList.add('on');
}

function entryLive() {
  const d = state.draft;
  const oil = d.oil || 0;
  const kcal = d.c * 4 + d.p * 4 + (d.f + oil) * 9;
  const day = state.logs.filter(x => x.date === d.date && x.id !== d.id).reduce((a, e) => ({
    c: a.c + e.c, p: a.p + e.p, f: a.f + e.f
  }), { c: 0, p: 0, f: 0 });
  const r = compute();
  return { kcal, total: { c: day.c + d.c, p: day.p + d.p, f: day.f + d.f + (d.oil || 0) }, target: { c: r.c, p: r.p, f: r.f } };
}

function renderEntrySheet() {
  const d = state.draft;
  const live = entryLive();
  const row = (key, label, max, color) => `
    <div class="lf-slider">
      <div class="field-head" style="margin-bottom:6px">
        <span class="field-label">${label}</span>
        <span class="field-value lv-wrap"><input class="lv-input" type="number" inputmode="numeric"
          data-lnum="${key}" value="${d[key]}" min="0" max="${max}"><small>g</small></span>
      </div>
      <input type="range" data-lslider="${key}" min="0" max="${max}" step="1" value="${d[key]}"
        style="--p:${(d[key] / max) * 100}%">
    </div>`;

  $('#sheetInner').innerHTML = `<div class="grab"></div>
    <h2>${d.id ? '修改这一餐' : '记录一餐'}</h2>
    <div class="sub">填这一餐的碳蛋脂克数，系统自动汇总到今天</div>

    <label class="lf-date">
      <span>日期</span>
      <input type="date" id="logDate" value="${d.date}" max="${dstr()}">
    </label>

    <div class="card-hint" style="margin:16px 0 8px">哪一餐</div>
    ${segHTML('mealType', MEALS.map(m => ({ v: m.v, t: m.t })), d.meal)}

    <div style="margin-top:18px">
      ${row('c', '碳水', 300, '#ffd60a')}
      ${row('p', '蛋白', 200, '#ff6482')}
      ${row('f', '食材脂肪', 150, '#64d2ff')}
      ${row('oil', '烹调油', 40, '#ffd60a')}
    </div>

    <div class="entry-live" id="entryLive">
      <div class="live-kcal">${Math.round(live.kcal)}<small>kcal</small></div>
      <div class="live-sub">本餐 · 今日累计</div>
      <div class="live-macros">
        <span>碳 ${Math.round(live.total.c)}/${live.target.c}</span>
        <span>蛋 ${Math.round(live.total.p)}/${live.target.p}</span>
        <span>脂 ${Math.round(live.total.f + (d.oil || 0))}/${live.target.f}</span>
      </div>
    </div>

    <button class="btn-primary" style="margin-top:16px" data-save-entry="1"><span class="shine"></span>${d.id ? '保存修改' : '保存这一餐'}</button>
    ${d.id ? `<button class="btn-secondary" style="margin-top:10px;color:#ff6482" data-del-now="${d.id}">删除这条记录</button>` : ''}
  `;
}

/* ---------- 某一天详情 ---------- */
function openDaySheet(date) {
  const v = dayVerdict(date);
  const m = (MEALS || []);
  const meals = state.logs.filter(x => x.date === date);
  const st = { none: ['没有记录', 'var(--dim-2)'], under: ['未达标', '#ff9f0a'], met: ['已达标', '#3ddc84'], over: ['有超标', '#ff453a'] }[v.status];
  const d = new Date(parseD(date));

  let body;
  if (v.status === 'none') {
    body = `<div class="empty-note" style="margin-top:8px">这一天没有记录。可以补记，也可以就这样空着。</div>`;
  } else {
    body = v.rows.map(row => {
      const diff = Math.round(row.now - row.target);
      const txt = row.verdict === 'ok' ? '达标' : row.verdict === 'high' ? `超标 ${diff} g` : `还差 ${-diff} g`;
      const color = row.verdict === 'ok' ? '#3ddc84' : row.verdict === 'high' ? '#ff453a' : '#ff9f0a';
      return `<div class="day-row">
        <span class="dr-name">${row.label}</span>
        <span class="dr-val">${Math.round(row.now)} / ${Math.round(row.target)} g</span>
        <span class="dr-tag" style="color:${color};border-color:${color}44;background:${color}14">${txt}</span>
      </div>`;
    }).join('');
    body = `<div class="day-rows">${body}</div>`;
    if (meals.length) {
      body += `<div class="card-hint" style="margin:16px 0 8px">这天的明细</div>${meals.map(e => logRowHTML(e)).join('')}`;
    } else {
      body += `<div class="empty-note" style="margin-top:14px">这天的餐次明细已超过 ${LOG_MAX} 条上限被清理，只剩汇总。</div>`;
    }
  }

  sheetHTML(`
    <h2>${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${weekdayCN(d)}</h2>
    <div class="sub">${v.day ? `记录 ${v.day.meals} 餐 · 合计 ${Math.round(v.day.c * 4 + v.day.p * 4 + v.day.f * 9)} kcal` : '暂无数据'}</div>
    <div class="status-chip ${v.status}" style="margin-bottom:14px">${st[0]}</div>
    ${body}
    <button class="btn-secondary" style="margin-top:16px" data-add-date="${date}">＋ 补记这一天的某一餐</button>
  `);
}

/* ---------------- 选购（购物车） ---------------- */
const MEAL_SLOTS = [
  { id: 'breakfast', name: '早餐', share: 0.25 },
  { id: 'lunch', name: '午餐', share: 0.30 },
  { id: 'dinner', name: '晚餐', share: 0.30 },
  { id: 'snack', name: '加餐', share: 0.15 },
  { id: 'pre', name: '练前', share: 0.20 },
  { id: 'post', name: '练后', share: 0.32 }
];

function slotFoodById(id) { return FOODS.find(x => x.id === id); }

function cartCount() { return state.cart.length; }

/* 加入购物车时的小飞点动画 */
function flyToCart(fromEl) {
  const fab = document.querySelector('.cart-fab');
  if (!fab || !fromEl || typeof fromEl.getBoundingClientRect !== 'function') return;
  const a = fromEl.getBoundingClientRect(), b = fab.getBoundingClientRect();
  if (!a.width || !b.width) return;
  const dot = document.createElement('div');
  dot.className = 'fly-dot';
  dot.style.left = a.left + a.width / 2 + 'px';
  dot.style.top = a.top + a.height / 2 + 'px';
  document.body.appendChild(dot);
  requestAnimationFrame(() => {
    dot.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.4)`;
    dot.style.opacity = '0';
  });
  setTimeout(() => dot.remove(), 520);
}

/* 购物车 → 自动记为这一餐 */
function saveCartAsMeal() {
  if (!state.cart.length) return;
  const t = cartTotals();
  const slot = MEAL_SLOTS.find(x => x.id === state.cartSlot) || MEAL_SLOTS[1];
  saveEntry({
    date: dstr(), meal: slot.id === 'pre' || slot.id === 'post' ? 'snack' : slot.id,
    c: Math.round(t.c), p: Math.round(t.p), f: Math.round(t.f), oil: Math.round(t.oil)
  });
  state.cart = [];
  save();
  go('log');
}

function cartTotals() {
  const t = { kcal: 0, p: 0, c: 0, f: 0, oil: 0 };
  state.cart.forEach(it => {
    if (it.dish) {
      const d = DISHES.find(x => x.id === it.id);
      if (!d) return;
      t.kcal += d.kcal * it.serv; t.p += d.p * it.serv; t.c += d.c * it.serv; t.f += d.f * it.serv;
    } else {
      const f = FOODS.find(x => x.id === it.id);
      if (!f) return;
      const k = (it.g || 0) / 100;
      const oil = oilGrams(f, it.method || 'raw', it.g || 0);
      t.kcal += f.kcal * k + oil * 9; t.p += f.p * k; t.c += f.c * k; t.f += f.f * k + oil; t.oil += oil;
    }
  });
  return t;
}

function addToCart(id, opts = {}) {
  if (id.startsWith('dish:')) {
    const did = id.slice(5);
    const ex = state.cart.find(c => c.dish && c.id === did);
    if (ex) ex.serv = Math.min(3, round(ex.serv + (opts.serv || 1), 1));
    else state.cart.push({ dish: true, id: did, serv: opts.serv || 1 });
  } else {
    const f = FOODS.find(x => x.id === id);
    if (!f) return;
    const method = opts.method || methodsFor(f)[0];
    const g = opts.g || 100;
    const ex = state.cart.find(c => !c.dish && c.id === id && c.method === method);
    if (ex) ex.g = Math.min(1500, ex.g + g);
    else state.cart.push({ id, g, method });
  }
  save();
}

function cartTargetFor(slotId) {
  const r = compute();
  const slot = MEAL_SLOTS.find(x => x.id === slotId) || MEAL_SLOTS[1];
  return { kcal: r.kcal * slot.share, p: r.p * slot.share, c: r.c * slot.share, f: r.f * slot.share, slot };
}

/* 食物卡片（带加入按钮） */
function foodCardHTML(f, i) {
  const gi = giOf(f);
  const inCart = state.cart.filter(c => !c.dish && c.id === f.id).length;
  return `<div class="food" data-food="${f.id}" style="animation-delay:${Math.min(i, 12) * 25}ms">
    <div class="thumb">${ICONS[f.icon]}</div>
    <div class="info">
      <div class="nm">${f.name}<span class="tag">${f.tag}</span>${gi ? `<span class="gi ${gi.level}">GI ${gi.level}</span>` : ''}</div>
      <div class="macros">
        <span>碳水 <b>${f.c}</b></span><span>蛋白 <b>${f.p}</b></span><span>脂肪 <b>${f.f}</b></span>
        <span>${f.kcal} kcal</span>
      </div>
      <div class="tip">${f.tip}</div>
    </div>
    <button class="add-btn ${inCart ? 'in' : ''}" data-addcart="${f.id}" aria-label="加入购物车">${inCart ? '✓' : '＋'}</button>
  </div>`;
}

function dishCardHTML(d, i) {
  const inCart = state.cart.some(c => c.dish && c.id === d.id);
  return `<div class="food" data-dish="${d.id}" style="animation-delay:${Math.min(i, 12) * 25}ms">
    <div class="thumb dish-thumb">🍽</div>
    <div class="info">
      <div class="nm">${d.name}<span class="tag">${d.portion}</span></div>
      <div class="macros">
        <span>碳水 <b>${d.c}</b></span><span>蛋白 <b>${d.p}</b></span><span>脂肪 <b>${d.f}</b></span>
        <span>${d.kcal} kcal</span>
      </div>
      <div class="tip">${d.note}</div>
    </div>
    <button class="add-btn ${inCart ? 'in' : ''}" data-addcart="dish:${d.id}" aria-label="加入购物车">${inCart ? '✓' : '＋'}</button>
  </div>`;
}

function cartFab() {
  const n = cartCount();
  const t = cartTotals();
  if (!n) return '';
  return `<div class="cart-bar">
    <button class="cb-left" data-action="open-cart">
      <span class="cb-count">${n}</span>
      <span class="cb-kcal">${Math.round(t.kcal)} kcal · 蛋 ${Math.round(t.p)} g</span>
    </button>
    <button class="cb-go" data-action="cart">去结算 →</button>
  </div>`;
}

/* ---------------- 页面：选购 ---------------- */
function renderShop() {
  const list = foodFiltered();
  const isDish = state.foodCat === 'dish';
  return `
  <div class="hero" style="padding-bottom:6px">
    <div class="kicker"><span class="dot"></span> 边挑边算</div>
    <h1 style="font-size:29px">选食材，<br>加进这一餐。</h1>
    <p>点「＋」加入购物车，可以选做法；挑完到购物车结算，会自动记进今天。</p>
  </div>
  <div style="margin:12px 0 10px">
    ${segHTML('foodCat', [
      { v: 'carb', t: '碳水' }, { v: 'protein', t: '蛋白' }, { v: 'fat', t: '脂肪' },
      { v: 'veg', t: '果蔬' }, { v: 'snack', t: '零食' }, { v: 'dish', t: '菜品' }
    ], state.foodCat)}
  </div>
  <div class="food-search">
    <span class="fs-ico">⌕</span>
    <input id="foodSearch" type="search" placeholder="搜索食材或菜品" value="${state.foodQuery || ''}" autocomplete="off">
    <span class="fs-count" id="foodCount">${isDish ? DISHES.length : list.length} ${isDish ? '道' : '种'}</span>
  </div>
  ${shopProgressHTML()}
  ${isDish ? `<div class="pill-note" style="margin:0 0 12px"><span class="i">🫗</span><span><b>外食的油通常比家里多 50% 以上。</b>点菜时优先选蒸、煮、白灼、清炒；重油菜用筷子在盘边刮一下。下列数值已包含做菜油，按「一份」估算，因店而异。</span></div>` : ''}
  <div class="food-list" id="foodList">
    ${isDish
      ? DISHES.filter(d => !state.foodQuery || (d.name + d.note).includes(state.foodQuery)).map((d, i) => dishCardHTML(d, i)).join('')
      : list.map((f, i) => foodCardHTML(f, i)).join('')}
  </div>
  <div class="cart-wrap">${cartFab()}</div>
  `;
}

/* 选购页的实时营养进度（局部更新，不重绘整页） */
function shopProgressHTML() {
  const t = cartTotals();
  const tg = cartTargetFor(state.cartSlot);
  const rows = [
    ['碳水', t.c, tg.c], ['蛋白', t.p, tg.p], ['脂肪', t.f, tg.f]
  ].map(([label, val, target]) => {
    const ratio = target > 0 ? val / target : 0;
    const status = ratio > 1.15 ? 'over' : ratio < 0.85 ? 'under' : 'ok';
    const pct = clamp(ratio * 100, 0, 100);
    return `<div class="sp-row ${status}" data-sp="${label}">
      <span class="sp-label">${label}</span>
      <div class="sp-track"><i style="width:${pct}%"></i></div>
      <span class="sp-val">${Math.round(val)}/${Math.round(target)}</span>
    </div>`;
  }).join('');
  return `<div class="shop-progress" id="shopProgress">
    <div class="sp-head"><span>这一餐进度</span><span class="sp-slot">${
      (MEAL_SLOTS.find(x => x.id === state.cartSlot) || {}).name || ''
    } · ${Math.round(t.kcal)} kcal</span></div>
    ${rows}
  </div>`;
}

/* 只刷新购物车相关区域，避免整页重绘造成闪屏 */
function refreshShop() {
  const bar = document.querySelector('.cart-wrap');
  if (bar) bar.innerHTML = cartFab();
  updateShopProgress();
  document.querySelectorAll('[data-addcart]').forEach(btn => {
    const id = btn.dataset.addcart;
    const inCart = id.startsWith('dish:')
      ? state.cart.some(c => c.dish && c.id === id.slice(5))
      : state.cart.some(c => !c.dish && c.id === id);
    btn.classList.toggle('in', inCart);
    btn.textContent = inCart ? '✓' : '＋';
  });
}

function updateShopProgress() {
  const el = document.querySelector('#shopProgress');
  if (!el) return;
  const t = cartTotals();
  const tg = cartTargetFor(state.cartSlot);
  const pairs = [['碳水', t.c, tg.c], ['蛋白', t.p, tg.p], ['脂肪', t.f, tg.f]];
  const rows = el.querySelectorAll('.sp-row');
  pairs.forEach(([label, val, target], i) => {
    const row = rows[i];
    if (!row) return;
    const ratio = target > 0 ? val / target : 0;
    const status = ratio > 1.15 ? 'over' : ratio < 0.85 ? 'under' : 'ok';
    row.className = `sp-row ${status}`;
    const fill = row.querySelector('.sp-track i');
    if (fill) fill.style.width = clamp(ratio * 100, 0, 100) + '%';
    const v = row.querySelector('.sp-val');
    if (v) v.textContent = `${Math.round(val)}/${Math.round(target)}`;
  });
  const slot = el.querySelector('.sp-slot');
  if (slot) slot.textContent = `${(MEAL_SLOTS.find(x => x.id === state.cartSlot) || {}).name || ''} · ${Math.round(t.kcal)} kcal`;
}

/* ---------------- 页面：购物车结算 ---------------- */
function cartItemHTML(it, idx) {
  if (it.dish) {
    const d = DISHES.find(x => x.id === it.id);
    if (!d) return '';
    return `<div class="cart-item">
      <div class="ci-thumb">🍽</div>
      <div class="ci-body">
        <div class="ci-name">${d.name}<span class="ci-portion">${d.portion}</span></div>
        <div class="ci-sub">碳 ${Math.round(d.c * it.serv)} · 蛋 ${Math.round(d.p * it.serv)} · 脂 ${Math.round(d.f * it.serv)} g</div>
      </div>
      <div class="ci-right">
        <div class="stepper sm">
          <button data-cart-serv="${idx}" data-d="-0.5">−</button>
          <div class="g">${it.serv}<small>份</small></div>
          <button data-cart-serv="${idx}" data-d="0.5">+</button>
        </div>
        <div class="ci-kcal">${Math.round(d.kcal * it.serv)} kcal</div>
      </div>
      <button class="ci-del" data-cart-del="${idx}">✕</button>
    </div>`;
  }
  const f = FOODS.find(x => x.id === it.id);
  if (!f) return '';
  const oil = oilGrams(f, it.method || 'raw', it.g);
  return `<div class="cart-item">
    <div class="ci-thumb">${ICONS[f.icon]}</div>
    <div class="ci-body">
      <div class="ci-name">${f.name}<span class="ci-portion">${f.state}</span></div>
      ${f.cat === 'snack' ? '' : `<div class="chips method-chips" style="margin:6px 0 0">
        ${methodsFor(f).map(mid => `<button class="chip xs ${mid === it.method ? 'on' : ''}" data-cart-method="${idx}" data-mid="${mid}">${(METHODS.find(m => m.id === mid) || {}).name}</button>`).join('')}
      </div>`}
      <div class="ci-sub">${oil > 0.05 ? `含烹调油 ${round(oil, 1)} g` : '无额外用油'} · ${Math.round(f.p * it.g / 100)} g 蛋白</div>
    </div>
    <div class="ci-right">
      <div class="stepper sm">
        <button data-cart-g="${idx}" data-d="-10">−</button>
        <div class="g">${it.g}<small>g</small></div>
        <button data-cart-g="${idx}" data-d="10">+</button>
      </div>
    </div>
    <button class="ci-del" data-cart-del="${idx}">✕</button>
  </div>`;
}

function renderCart() {
  const t = cartTotals();
  const tg = cartTargetFor(state.cartSlot);
  const rows = [
    ['碳水', t.c, tg.c, '#ffd60a'],
    ['蛋白质', t.p, tg.p, '#ff6482'],
    ['脂肪', t.f, tg.f, '#64d2ff']
  ].map(([label, val, target, color]) => {
    const ratio = target > 0 ? val / target : 0;
    const status = ratio > 1.15 ? 'over' : ratio < 0.85 ? 'under' : 'ok';
    const pct = clamp(ratio * 100, 0, 100);
    return `<div class="macro-bar ${status}">
      <div class="mb-top"><span>${label}</span><span><b>${Math.round(val)}</b> / ${Math.round(target)} g</span></div>
      <div class="mb-track"><i style="width:${pct}%;background:${status === 'ok' ? '#3ddc84' : status === 'over' ? '#ff453a' : '#ffd60a'}"></i></div>
      <div class="mb-flag">${status === 'ok' ? '达标' : status === 'over' ? `超出 ${Math.round(val - target)} g` : `还差 ${Math.round(target - val)} g`}</div>
    </div>`;
  }).join('');

  return `
  <div class="hero" style="padding-bottom:6px">
    <div class="kicker"><span class="dot"></span> 结算</div>
    <h1 style="font-size:29px">这一餐，<br>够不够。</h1>
    <p>购物车里的东西算总账，对照这一餐的目标；保存后自动记进今天。</p>
  </div>

  <div class="card tight" style="margin-bottom:14px">
    <div class="card-title" style="margin-bottom:8px"><h3>这是哪一餐</h3><span class="card-hint">决定目标分配</span></div>
    <div class="chips">
      ${MEAL_SLOTS.map(s => `<button class="chip sm ${state.cartSlot === s.id ? 'on' : ''}" data-cart-slot="${s.id}">${s.name} ${Math.round(s.share * 100)}%</button>`).join('')}
    </div>
    <div class="cart-target-line">目标 ≈ ${Math.round(tg.kcal)} kcal · 碳 ${Math.round(tg.c)} · 蛋 ${Math.round(tg.p)} · 脂 ${Math.round(tg.f)} g</div>
    <div class="cart-tip">${state.cartSlot === 'post' ? '💪 练后餐：碳水+蛋白优先，蔬菜少吃后吃，纤维会拖慢吸收。' : state.cartSlot === 'pre' ? '⚡️ 练前餐：碳水为主、少油少纤维，别吃太饱。' : state.cartSlot === 'snack' ? '🍎 加餐：优先蛋白或水果，控制总量。' : '🍽 正餐：先吃菜再吃主食，注意烹调油。'}</div>
  </div>

  <div class="card tight" style="margin-bottom:14px">
    <div class="card-title" style="margin-bottom:4px"><h3>购物车</h3><span class="card-hint">${state.cart.length} 项</span></div>
    ${state.cart.length ? state.cart.map((it, i) => cartItemHTML(it, i)).join('') : `<div class="empty-note">还没选东西。去「食物」页点「＋」加进来。</div>`}
  </div>

  <div class="card tight">
    <div class="card-title" style="margin-bottom:10px"><h3>营养进度</h3><span class="card-hint">${t.oil > 0.05 ? `烹调油 ${round(t.oil, 1)} g` : ''}</span></div>
    ${rows}
    <div class="cart-total">合计 <b>${Math.round(t.kcal)}</b> kcal · 蛋白 ${Math.round(t.p)} g · 脂肪 ${Math.round(t.f)} g</div>
    <button class="btn-primary" style="margin-top:14px" data-action="save-cart" ${state.cart.length ? '' : 'disabled'}>
      <span class="shine"></span>记进今天（自动保存）
    </button>
    <button class="btn-secondary" style="margin-top:10px" data-action="clear-cart">清空购物车</button>
  </div>
  <div class="cart-wrap">${cartFab()}</div>
  `;
}

/* ---------------- 购物车弹窗 ---------------- */
function openCartSheet() {
  renderCartSheet();
  $('#sheetMask').classList.add('on');
  $('#sheet').classList.add('on');
}

function renderCartSheet() {
  const t = cartTotals();
  const tg = cartTargetFor(state.cartSlot);
  $('#sheetInner').innerHTML = `<div class="grab"></div>
    <div class="cart-sheet">
      <h2 style="display:flex;align-items:center;gap:8px">购物车 <span class="cs-count">${state.cart.length} 项</span></h2>
      <div class="sub">${(MEAL_SLOTS.find(x => x.id === state.cartSlot) || {}).name} · 目标 ${Math.round(tg.kcal)} kcal</div>
      ${state.cart.length ? state.cart.map((it, i) => cartItemHTML(it, i)).join('') : `<div class="empty-note">购物车是空的</div>`}
      <div class="cs-total">合计 <b>${Math.round(t.kcal)}</b> kcal · 碳 ${Math.round(t.c)} · 蛋 ${Math.round(t.p)} · 脂 ${Math.round(t.f)} g</div>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn-secondary" data-action="clear-cart">清空</button>
        <button class="btn-primary" style="min-height:44px" data-action="cart"><span class="shine"></span>去结算 →</button>
      </div>
    </div>`;
}

/* 购物车变更后：局部刷新，不重绘整页 */
function afterCartChange() {
  save();
  if (document.querySelector('#sheet').classList.contains('on') && document.querySelector('#sheetInner .cart-sheet')) {
    renderCartSheet();
  }
  if (state.screen === 'food') refreshShop();
  else if (state.screen === 'meal') render();
}

/* ---------------- 外食菜品 ---------------- */
function openDishes() {
  const rows = DISHES.map(d => `<div class="dish-row">
    <div class="dish-main">
      <div class="dish-name">${d.name}<span class="dish-portion">${d.portion}</span></div>
      <div class="dish-note">${d.note}</div>
    </div>
    <div class="dish-macros">
      <b>${d.kcal}</b> kcal<br>
      <span>碳 ${d.c} · 蛋 ${d.p} · 脂 ${d.f}</span>
    </div>
  </div>`).join('');
  sheetHTML(`
    <h2>外食菜品</h2>
    <div class="sub">按「一份」估算，含做菜油；实际因店而异，仅供参考</div>
    ${rows}
    <div class="pill-note" style="margin-top:14px"><span class="i">💡</span><span>外食的油通常比家里多 50% 以上。点菜时优先选蒸、煮、白灼、清炒，重油菜用筷子在盘边刮一下。</span></div>
  `);
}

/* ---------------- 科学依据 ---------------- */
function openScience() {
  const total = STUDIES.length;
  const cards = STUDIES.map((st, i) => {
    const rankCls = st.rank === 'A' ? 'a' : st.rank === 'B' ? 'b' : 'c';
    const links = st.links.map(l => `<a class="study-link ${l.k}" href="${l.u}" target="_blank" rel="noopener">
        ${l.t}<span class="lk">${l.k === 'cn' ? '国内可直连' : '期刊原文'}</span></a>`).join('');
    return `<div class="study">
      <div class="study-top">
        <span class="rank ${rankCls}">证据 ${st.rank}</span>
        <span class="jrn">${st.journal} · ${st.year}</span>
      </div>
      <div class="study-zh"><span class="idx">${i + 1}</span>${st.zh}</div>
      <div class="study-en">${st.en}</div>
      <div class="study-meta">${st.design} · ${st.n}</div>
      <div class="study-find">${st.finding}</div>
      <div class="study-use">${st.use}</div>
      <div class="study-links">${links}</div>
    </div>`;
  }).join('');

  sheetHTML(`
    <h2>科学依据</h2>
    <div class="sub">${total} 篇研究，含 4 篇 A 级证据（meta 分析 / 系统综述 / 国家级指南）· 覆盖 49 项以上 RCT</div>
    <div class="pill-note" style="margin-top:0"><span class="i">🔗</span><span>每个条目都给了<b>中文 / 国内可直接打开</b>的入口；标「期刊原文」的需要访问国际期刊网站（多数可直接打开，速度可能稍慢）。<br><b>链接打不开也没关系</b>——每一项的核心结论都已经用中文写在下面。</span></div>
    ${cards}
    <div class="pill-note"><span class="i">📌</span><span>${STUDY_NOTE}</span></div>
    <div class="pill-note" style="background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:var(--dim)">
      <span class="i">⚕️</span><span>研究给的是<b>群体平均值</b>，不是对你个人的处方。有基础疾病、孕期或进食障碍史，请找医生或注册营养师。</span>
    </div>
  `);
}

/* ---------------- 详情弹层 ---------------- */
function openFood(id) {
  const f = FOODS.find(x => x.id === id);
  if (!f) return;
  state.foodDraft = { id: f.id, g: 100, method: methodsFor(f)[0] };
  renderFoodSheet(f);
  $('#sheetMask').classList.add('on');
  $('#sheet').classList.add('on');
}

function renderFoodSheet(f) {
  const d = state.foodDraft;
  const oil = oilGrams(f, d.method, d.g);
  const k = d.g / 100;
  const kcal = Math.round(f.kcal * k + oil * 9);
  sheetHTML(`
    <div class="hero-ico">${ICONS[f.icon]}</div>
    <h2 style="text-align:center">${f.name}</h2>
    <div class="sub" style="text-align:center">${f.state} · 每 100 g</div>
    <div class="macro-grid" style="grid-template-columns:repeat(4,1fr);gap:8px">
      ${['c', 'p', 'f'].map((key, i) => `<div class="stat" style="text-align:center"><div class="k">${['碳水', '蛋白', '脂肪'][i]}</div><div class="v" style="font-size:16px">${f[key]} g</div></div>`).join('')}
      <div class="stat" style="text-align:center"><div class="k">热量</div><div class="v" style="font-size:16px">${f.kcal}</div></div>
    </div>
    <div class="sec"><h4>✔ 更好的做法</h4><p>${f.tip}</p></div>
    <div class="sec"><h4>🔬 为什么这么建议</h4><p>${f.why}</p></div>
    ${giOf(f) ? `<div class="sec"><h4>📈 升糖指数</h4><p>GI ${giOf(f).value}（${giOf(f).level}）</p></div>` : ''}
    ${f.macro ? `<div class="sec"><h4>🌿 关键微量营养素</h4><p>${f.macro.map(m => '· ' + m).join('<br>')}</p></div>` : ''}

    ${f.cat === 'snack' ? `<div class="sec"><h4>🍳 做法</h4><p>零食是已经加工好的成品，不涉及做法与额外用油，按包装上的份量直接计就行。</p></div>` : `<div class="sec"><h4>🍳 这份怎么做</h4>
      <div class="chips" style="margin-top:8px">
        ${methodsFor(f).map(mid => {
          const m = METHODS.find(x => x.id === mid);
          return `<button class="chip sm ${d.method === mid ? 'on' : ''}" data-fd-method="${mid}">${m.name}</button>`;
        }).join('')}
      </div>
      <div class="fd-qty">
        <span>份量</span>
        <div class="stepper sm">
          <button data-fd-g="-20">−</button>
          <div class="g">${d.g}<small>g</small></div>
          <button data-fd-g="20">+</button>
        </div>
      </div>
      <div class="oil-line ${oil > 0 ? 'has' : ''}" style="margin-top:10px">
        ${oil > 0.05 ? `🫗 这一份约用油 ${round(oil, 1)} g（${Math.round(oil * 9)} kcal）` : '✔ 这个做法不额外用油'} · 合计 ${kcal} kcal
      </div>
    </div>`}

    <div class="sec"><h4>🔄 营养相近的替换</h4>
      <div class="chips" style="margin-top:8px">
        ${FOODS.filter(x => x.cat === f.cat && x.id !== f.id && x[f.cat === 'fat' ? 'f' : f.cat === 'protein' ? 'p' : 'c'] > 0)
          .map(x => ({ x, diff: Math.abs(x.kcal - f.kcal) + Math.abs(x.p - f.p) * 4 + Math.abs(x.c - f.c) * 4 }))
          .sort((a, b) => a.diff - b.diff).slice(0, 3)
          .map(o => `<button class="chip sm" data-swap-food="${o.x.id}">${o.x.name}</button>`).join('')}
      </div>
    </div>
    <button class="btn-primary" style="margin-top:16px" data-fd-add="${f.id}"><span class="shine"></span>加入购物车</button>
  `);
}

function openDish(id) {
  const d = DISHES.find(x => x.id === id);
  if (!d) return;
  const similar = DISHES.filter(x => x.id !== d.id)
    .map(x => ({ x, diff: Math.abs(x.kcal - d.kcal) + Math.abs(x.c - d.c) * 4 }))
    .sort((a, b) => a.diff - b.diff).slice(0, 3);
  sheetHTML(`
    <h2>${d.name}</h2>
    <div class="sub">${d.portion} · 已包含做菜油</div>
    <div class="macro-grid" style="grid-template-columns:repeat(4,1fr);gap:8px">
      <div class="stat" style="text-align:center"><div class="k">热量</div><div class="v" style="font-size:16px">${d.kcal}</div></div>
      <div class="stat" style="text-align:center"><div class="k">碳水</div><div class="v" style="font-size:16px">${d.c} g</div></div>
      <div class="stat" style="text-align:center"><div class="k">蛋白</div><div class="v" style="font-size:16px">${d.p} g</div></div>
      <div class="stat" style="text-align:center"><div class="k">脂肪</div><div class="v" style="font-size:16px">${d.f} g</div></div>
    </div>
    <div class="sec"><h4>📝 说明</h4><p>${d.note}</p></div>
    <div class="sec"><h4>🔄 营养相近的替换</h4><p>${similar.map(x => `${x.x.name}（${x.x.kcal} kcal）`).join(' · ')}</p></div>
    <button class="btn-primary" style="margin-top:16px" data-addcart="dish:${d.id}"><span class="shine"></span>加入购物车</button>
  `);
}

function openEvidence(ids) {
  const list = ids && ids.length ? ids.map(id => EVIDENCE[id]) : Object.values(EVIDENCE);
  const rows = Object.values(SCENES).map(sc => `<tr>
      <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,.07)">${sc.short}</td>
      <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,.07);text-align:center">${Math.round((sc.calorieFactor - 1) * 100) >= 0 ? '+' : ''}${Math.round((sc.calorieFactor - 1) * 100)}%</td>
      <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,.07);text-align:center">${sc.proteinPerKg}</td>
      <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,.07);text-align:center">${sc.fatPerKg}</td>
      <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,.07);text-align:center">≥${sc.minCarbPerKg}</td>
    </tr>`).join('');

  sheetHTML(`
    <h2>方法与依据</h2>
    <div class="sub">每个数字是怎么算出来的，以及它来自哪篇文献</div>

    <button class="btn-secondary" style="margin-bottom:16px" data-action="science">🔬 先看 ${STUDIES.length} 篇核心研究 →</button>

    <div class="sec"><h4>① 基础代谢 BMR</h4>
      <p>Mifflin-St Jeor 公式：<br>
      男 = 10×体重 + 6.25×身高 − 5×年龄 + 5<br>
      女 = 10×体重 + 6.25×身高 − 5×年龄 − 161</p></div>

    <div class="sec"><h4>② 每日消耗 TDEE</h4>
      <p>TDEE = BMR ×（日常活动系数 + 训练系数）。活动系数：久坐 1.2 / 轻度 1.35 / 体力 1.5；训练系数按每周次数累加，每次约 +3.5%，上限 +16%。休息期只计残余活动量。</p></div>

    <div class="sec"><h4>③ 四场景参数</h4>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
      <table style="width:100%;border-collapse:collapse;font-size:11.5px;color:rgba(247,247,250,.8)">
        <thead><tr style="color:var(--dim-2);font-size:10px;letter-spacing:.04em">
          <th style="text-align:left;padding:6px">场景</th><th style="padding:6px">热量</th>
          <th style="padding:6px">蛋白 g/kg</th><th style="padding:6px">脂肪 g/kg</th><th style="padding:6px">碳水 g/kg</th>
        </tr></thead><tbody>${rows}</tbody>
      </table></div>
      <p style="margin-top:8px">碳水 =（目标热量 − 蛋白×4 − 脂肪×9）÷ 4；若低于下限则自动下调脂肪。</p></div>

    <div class="sec"><h4>④ 供能比对照的是哪份文件</h4>
      <p>《中国居民膳食营养素参考摄入量（2023 版）》的宏量营养素可接受范围：<b>碳水 50–65%、蛋白 10–20%、脂肪 20–30%</b>（占总能量）。《中国超重/肥胖医学营养治疗指南（2021）》在此之上给出减重模式：<b>限能量平衡膳食</b>与<b>高蛋白膳食（蛋白 20–30% 供能）</b>。<br><br>
      所以本工具现在做三层校验：<br>
      ① 热量上限 <b>40 kcal/kg</b>、下限 1200（女）/1500（男）kcal；<br>
      ② 蛋白与脂肪按参考体重算完后，夹进 <b>10–30%</b> 与 <b>20–30%</b> 供能区间；<br>
      ③ BMI ≥ 28 时改用<b>理想体重</b>（22 × 身高²）折算，避免 110 kg 的人被算出 240 g 蛋白；<br>
      ④ 碳水永远是「剩余热量」，若算成负数会依次下调脂肪、蛋白，绝不显示负值。<br><br>
      这也是为什么有时候你会看到「碳水 44%」——那是减脂期高蛋白膳食（蛋白 30% 供能）的必然结果，属于指南允许的区间，不是算错。</p></div>

    <div class="sec"><h4>⑤ 为什么增肌期蛋白是 1.8，而不是 2.5+</h4>
      <p>Morton 2018 的 meta 回归里，去脂体重的增长在 <b>1.6 g/kg</b> 就进入平台，95% 上限 2.2。也就是说：从 1.6 加到 2.2，收益已经很小；再往上加，肌肉不会多长，只是更饱、更贵。<br><br>
      所以默认给 1.8（区间正中），并提供一个「偏高 2.2」档位——体脂较低、训练年限长、或减脂末期的人，蛋白需求确实更高，选偏高即可。减脂期默认 2.2，最高档 2.6（对应 Helms 的 2.3–3.1 g/kg <b>去脂体重</b>）。</p></div>

    <div class="sec"><h4>⑥ 调整建议怎么算</h4>
      <p>把你的<b>周均体重变化率</b>和场景的目标区间对比：<br>
      · 增肌：目标 +0.25–0.5%/周，超过 0.65% 减 200 kcal，低于 0.05% 加 200 kcal<br>
      · 减脂：目标 −0.5–1%/周，慢于 0.15% 减 150 kcal，快于 1.4% 加 200 kcal<br>
      · 维持/休息：±0.3%/周以内都算正常<br><br>
      再叠加训练表现与精力：<b>力量下降</b>时不会让你继续减，而是先加碳水（减脂期 +150 kcal）并排查睡眠；<b>长期疲惫</b>会再加 100 kcal 并建议 1 天 refeed。所有调整都以 50 kcal 为单位收敛，避免越调越乱。</p></div>

    <div class="sec"><h4>⑦ 烹调油是怎么算进去的</h4>
      <p>食材卡片上的脂肪只算「食材本身」，但中国人一顿饭的脂肪有一大半来自炒菜油。所以配餐页每种食材都可以选做法，系统按「油量 = 每 100 g 吸油量 × 食材吸油系数 × 克数 ÷ 100」单独加一笔：
      <br>· 蒸/煮/白灼 0.3 g · 凉拌 2 g · 汤面/汤粉 3 g · 清炒 3.5 g · 家常炒 6 g · 红烧/炖 3 g · 煎 4 g · 油炸/干煸 12 g · 烤 1 g（每 100 g 食材）
      <br>· 吸油系数：茄子 1.7、鸡蛋 1.5、豆腐 1.35、叶菜 1.3、土豆 1.2；肉类 0.8、鱼 0.7、米饭 0.8。
      <br><br>举例：200 g 面条 + 100 g 牛肉做成汤面，系统算 <b>约 7.8 g 油（70 kcal）</b>；同样食材改成家常炒面，油会变成 <b>15 g 左右</b>。这部分油会自动从当天的脂肪配额里扣掉，不需要你手动记。</p>
      <a class="ref" href="${OIL_EVIDENCE.link}" target="_blank" rel="noopener">依据：中国疾控中心《科学三减，重在厨房》↗</a></div>

    <div class="sec"><h4>⑧ 食物数据来源与版本</h4>
      <p>· <b>《中国食物成分表》第 6 版</b>（杨月欣主编，北京大学医学出版社）：${FOODS.length} 种食材的热量、碳水、蛋白、脂肪、膳食纤维数值，均按每 100 g 可食部标注，生熟状态写在卡片上。<br>
      · <b>《中国居民膳食营养素参考摄入量（2023 版）》</b>：蛋白质、脂肪、碳水的推荐区间与膳食纤维目标。<br>
      · <b>《中国居民膳食指南（2022）》</b>：蔬菜 300–500 g、水果 200–350 g、全谷物 50–150 g、大豆坚果 25–35 g 等份量建议。<br><br>
      <b>关于「2026 版」</b>：截至 2026 年初，中国营养学会仍在为下一版指南公开征集修订意见，新版尚未发布。网上流传的「2026 新膳食指南」多为自媒体解读或预测，所以本工具仍以 2022 版为准，等官方发布后再更新。</p></div>

    <div class="sec"><h4>⑨ 与国内「健身 Excel 套表」类方案的差异</h4>
      <p>国内流行的表格方案（例如 B 站好人松松的套表）用的是「BMR ÷ 0.7 + 训练固定消耗 + 有氧」的分解法，减脂热量取平衡热量的 <b>0.64 倍</b>（20% 缺口 × 0.8 容错余量）。我们吸收了其中两点：<b>训练日 / 休息日分开算</b>、<b>有氧单列</b>。<br><br>
      没有照搬的三点：<br>
      · <b>0.64 倍</b>：它假设你不称重、会不自觉多吃 10–20%。本工具默认你按克称，用 0.8 倍（20% 缺口）更合适；如果你从不称重，请把实际吃进去的热量理解为比目标高 15–20%。<br>
      · <b>脂肪固定 60/50 g</b>：我们用 0.8–1.0 g/kg，并把烹调油单独算一笔，比固定值更贴合不同体重和做法。<br>
      · <b>蛋白靠视频给 g/kg 手填</b>：我们直接算，并按理想体重与 30% 供能上限做夹逼。<br><br>
      它比我们强的地方在执行层：按训练时间排的 7 套餐序、食物等价替换、GI 标注、BMI 阶段切换点。其中阶段建议、做法吸油、食物库已经吸收，餐序模板尚未实现。</p></div>

    <div class="sec"><h4>⑩ 文献</h4>
      ${STUDIES.map((st, i) => `<div style="margin-bottom:14px">
        <div style="font-size:12.5px;font-weight:650;color:var(--txt);margin-bottom:3px">[${i + 1}] ${st.zh}</div>
        <div style="font-size:11px;color:var(--dim-2);line-height:1.5">${st.journal} · ${st.year} · ${st.design}</div>
        <a class="ref" href="${st.links[0].u}" target="_blank" rel="noopener">${st.links[0].t} ↗</a></div>`).join('')}
      <button class="btn-secondary" style="margin-top:6px" data-action="science">查看完整摘要与全部链接 →</button>
    </div>

    <div class="pill-note"><span class="i">⚠️</span><span>本工具不构成医疗或营养处方。数据为群体平均区间，个体差异真实存在；孕期、慢性病、进食障碍史人群请咨询医生或注册营养师。</span></div>
    <div class="build-stamp">构建版本 ${(document.querySelector('meta[name="app-build"]') || {}).content || 'dev'}</div>
  `);
}

function sheetHTML(inner) {
  $('#sheetInner').innerHTML = `<div class="grab"></div>${inner}`;
  $('#sheetMask').classList.add('on');
  $('#sheet').classList.add('on');
}
function closeSheet() {
  $('#sheetMask').classList.remove('on');
  $('#sheet').classList.remove('on');
}

/* ---------------- 渲染与导航 ---------------- */
const SCREENS = { input: renderInput, result: renderResult, food: renderShop, meal: renderCart, log: renderLog };

function render(opts = {}) {
  const y = window.scrollY || window.pageYOffset || 0;
  const fn = SCREENS[state.screen] || renderInput;
  $('#main').innerHTML = fn();
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === state.screen));
  document.body.classList.toggle('screen-meal', state.screen === 'meal');
  if (state.screen === 'result') {
    requestAnimationFrame(() => {
      const p = $('.ring .prog');
      if (p) p.style.strokeDashoffset = p.dataset.dash;
    });
  }
  // 只有切换页面才回到顶部；页面内改选项时保持当前位置
  if (opts.top) window.scrollTo(0, 0);
  else if (y > 0) window.scrollTo(0, y);
}

function solveMeal() {
  const r = compute();
  const mt = { carb: r.c / state.meals, protein: r.p / state.meals, fat: r.f / state.meals };
  const F = k => FOODS.find(x => x.id === state.meal[k].id);
  const cf = F('carb'), pf = F('protein'), ff = F('fat');

  const gc = cf && cf.c > 0 ? mt.carb / (cf.c / 100) : 0;
  state.meal.carb.g = Math.round(gc);

  const pFromC = cf ? cf.p * gc / 100 : 0;
  const gp = pf && pf.p > 0 ? Math.max(0, mt.protein - pFromC) / (pf.p / 100) : 0;
  state.meal.protein.g = Math.round(gp);

  // 烹调油：先算主食/蛋白/果蔬带进来的油，再从脂肪配额里扣
  const oilC = cf ? oilGrams(cf, state.meal.carb.method || 'raw', state.meal.carb.g) : 0;
  const oilP = pf ? oilGrams(pf, state.meal.protein.method || 'raw', state.meal.protein.g) : 0;
  const vf = F('veg');
  const oilV = (state.meal.veg.on && vf) ? oilGrams(vf, state.meal.veg.method || 'raw', state.meal.veg.g || 0) : 0;

  const fFromC = cf ? cf.f * gc / 100 : 0;
  const fFromP = pf ? pf.f * gp / 100 : 0;
  const fFromV = (state.meal.veg.on && vf) ? vf.f * (state.meal.veg.g || 0) / 100 : 0;
  const remain = Math.max(0, mt.fat - fFromC - fFromP - fFromV - oilC - oilP - oilV);
  const gf = ff && ff.f > 0 ? remain / (ff.f / 100) : 0;
  state.meal.fat.g = Math.round(gf);
}

function ensureMeal() {
  const empty = ['carb', 'protein', 'fat'].some(k => !state.meal[k].g);
  if (empty) solveMeal();
  if (state.meal.veg.on && !state.meal.veg.g) state.meal.veg.g = 100;
}

function go(screen) {
  if (screen === 'meal') ensureMeal();
  state.screen = screen; save(); render({ top: true });
}

/* ---------------- 事件 ---------------- */
document.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-action],[data-seg],[data-tab],[data-food],[data-pick],[data-step],[data-veg-toggle],[data-add],[data-slider],[data-tstep],[data-apply-tune],[data-reset-tune],[data-edit],[data-del],[data-del-now],[data-save-entry],[data-add-date],[data-cal],[data-day],[data-method],[data-traintime],[data-swap],[data-save-weight],[data-again],[data-dish],[data-addcart],[data-fd-method],[data-fd-g],[data-fd-add],[data-cart-g],[data-cart-serv],[data-cart-method],[data-cart-del],[data-cart-slot],[data-swap-food]');
  if (!t) return;

  /* 底部导航 */
  if (t.dataset.tab) { go(t.dataset.tab); return; }

  /* 分段控件 */
  if (t.dataset.seg) {
    const id = t.dataset.seg, val = t.dataset.val;
    if (id === 'group') { state.group = val; }
    else if (id === 'goal') { state.goal = val; }
    else if (id === 'rest') { state.rest = val; }
    else if (id === 'sex') { state.sex = val; }
    else if (id === 'exp') { state.exp = val; }
    else if (id === 'activity') { state.activity = parseFloat(val); }
    else if (id === 'foodCat') { state.foodCat = val; state.foodQuery = ''; }
    else if (id === 'meals') { state.meals = parseInt(val, 10); }
    else if (id === 'proteinTier') { state.proteinTier = val; }
    else if (id === 'cardioInt') { state.cardioInt = val; }
    else if (id === 'logView') { state.logView = val; }
    else if (id === 'calZoom') { state.calZoom = val; }
    else if (id === 'mealType') { state.draft.meal = val; renderEntrySheet(); return; }
    else if (id === 'strength' || id === 'energy') {
      tuneInit(); state.tune[id] = val; save(); renderTuneSheet(); return;
    }
    save(); render();
    return;
  }

  /* 训练时间 / 等量替换 */
  if (t.dataset.traintime) {
    state.trainTime = t.dataset.traintime;
    save(); render(); return;
  }
  if (t.dataset.swap) {
    const k = t.dataset.swap, fid = t.dataset.fid, g = parseInt(t.dataset.g, 10);
    state.meal[k].id = fid;
    state.meal[k].g = g;
    const f = FOODS.find(x => x.id === fid);
    const mets = methodsFor(f);
    if (!mets.includes(state.meal[k].method)) state.meal[k].method = mets[0];
    save(); render(); return;
  }

  /* 做法切换 */
  if (t.dataset.method) {
    const k = t.dataset.method, mid = t.dataset.mid;
    state.meal[k].method = mid;
    save(); render(); return;
  }

  /* 购物车 */
  if (t.dataset.addcart) {
    const id = t.dataset.addcart;
    const btn = t;
    if (id.startsWith('dish:')) {
      addToCart(id, { serv: 1 });
    } else {
      const fd = state.foodDraft || {};
      addToCart(id, { g: fd.g || 100, method: fd.method });
    }
    flyToCart(btn);
    if (document.querySelector('#sheet').classList.contains('on')) closeSheet();
    refreshShop();
    return;
  }
  if (t.dataset.fdMethod) { state.foodDraft.method = t.dataset.fdMethod; renderFoodSheet(slotFoodById(state.foodDraft.id)); return; }
  if (t.dataset.fdG) {
    state.foodDraft.g = clamp((state.foodDraft.g || 0) + parseInt(t.dataset.fdG, 10), 10, 1500);
    renderFoodSheet(slotFoodById(state.foodDraft.id));
    return;
  }
  if (t.dataset.swapFood) {
    const f = FOODS.find(x => x.id === t.dataset.swapFood);
    if (f) { state.foodDraft = { id: f.id, g: state.foodDraft.g, method: methodsFor(f)[0] }; renderFoodSheet(f); }
    return;
  }
  if (t.dataset.fdAdd) {
    const fd = state.foodDraft;
    addToCart(t.dataset.fdAdd, { g: fd.g, method: fd.method });
    closeSheet(); flyToCart(t); render(); return;
  }
  if (t.dataset.cartG) {
    const i = +t.dataset.cartG, d = parseInt(t.dataset.d, 10);
    state.cart[i].g = clamp(state.cart[i].g + d, 10, 1500);
    afterCartChange(); return;
  }
  if (t.dataset.cartServ) {
    const i = +t.dataset.cartServ, d = parseFloat(t.dataset.d);
    state.cart[i].serv = clamp(round(state.cart[i].serv + d, 1), 0.5, 3);
    afterCartChange(); return;
  }
  if (t.dataset.cartMethod) {
    const i = +t.dataset.cartMethod;
    state.cart[i].method = t.dataset.mid;
    afterCartChange(); return;
  }
  if (t.dataset.cartDel) {
    state.cart.splice(+t.dataset.cartDel, 1);
    afterCartChange(); return;
  }
  if (t.dataset.cartSlot) {
    state.cartSlot = t.dataset.cartSlot;
    save(); render(); return;
  }

  /* 记录 */
  if (t.dataset.del) {
    ev.stopPropagation();
    removeEntry(t.dataset.del);
    closeSheet(); render();
    return;
  }
  if (t.dataset.edit) { openEntry(state.logs.find(x => x.id === t.dataset.edit)); return; }
  if (t.dataset.delNow) {
    removeEntry(t.dataset.delNow); closeSheet(); render(); return;
  }
  if (t.dataset.saveWeight) {
    const kg = parseFloat($('#weightKg').value);
    const dt = $('#weightDate').value || dstr();
    if (kg >= 30 && kg <= 250) { addWeight(dt, Math.round(kg * 10) / 10); closeSheet(); render(); }
    return;
  }
  if (t.dataset.again) {
    const e = state.logs.find(x => x.id === t.dataset.again);
    if (!e) return;
    openEntry({ date: dstr(), meal: e.meal, c: e.c, p: e.p, f: Math.max(0, e.f - (e.oil || 0)), oil: e.oil || 0 });
    return;
  }
  if (t.dataset.saveEntry) {
    const d = state.draft;
    if (!d) return;
    saveEntry({ id: d.id, date: d.date, meal: d.meal, c: d.c, p: d.p, f: d.f + (d.oil || 0), oil: d.oil || 0 });
    state.draft = null;
    closeSheet();
    const changed = state.screen !== 'log';
    if (changed) state.screen = 'log';
    render(changed ? { top: true } : {});
    return;
  }
  if (t.dataset.addDate) { openEntry({ date: t.dataset.addDate, meal: 'lunch', c: 0, p: 0, f: 0 }); return; }
  if (t.dataset.day) { openDaySheet(t.dataset.day); return; }
  if (t.dataset.cal) {
    const step = parseInt(t.dataset.cal, 10);
    const zoom = state.calZoom || 'month';
    const cur = state.calMonth || dstr().slice(0, 7);
    const [y, m] = cur.split('-').map(Number);
    let target;
    if (step === 0) target = new Date();
    else if (zoom === 'year') target = new Date(y + step, m - 1, 1);
    else if (zoom === 'quarter') target = new Date(y, m - 1 + step * 3, 1);
    else target = new Date(y, m - 1 + step, 1);
    state.calMonth = `${target.getFullYear()}-${pad2(target.getMonth() + 1)}`;
    save(); render(); return;
  }

  /* 反馈调整 */
  if (t.dataset.tstep) {
    const k = t.dataset.tstep, d = parseFloat(t.dataset.d);
    const tune = tuneInit();
    if (k === 'weeks') tune.weeks = clamp(tune.weeks + d, 1, 12);
    else tune[k] = clamp(Math.round((tune[k] + d) * 10) / 10, 30, 200);
    save(); renderTuneSheet(); return;
  }
  if (t.dataset.applyTune) {
    const a = tuneAdvice();
    state.kcalOffset = (state.kcalOffset || 0) + a.delta;
    closeSheet(); state.screen = 'result'; save(); render({ top: true }); return;
  }
  if (t.dataset.resetTune) {
    state.kcalOffset = 0; state.tune = null;
    closeSheet(); save();
    if (state.screen === 'result') render();
    return;
  }

  /* 主按钮 */
  if (t.dataset.action === 'calc') { go('result'); return; }
  if (t.dataset.action === 'tune') { openTune(); return; }
  if (t.dataset.action === 'science') { openScience(); return; }
  if (t.dataset.action === 'add-weight') { openWeightSheet(); return; }
  if (t.dataset.action === 'export-data') { exportData(); return; }
  if (t.dataset.action === 'import-data') { importFile(); return; }
  if (t.dataset.action === 'reminder') { downloadReminder(); return; }
  if (t.dataset.action === 'dishes') { openDishes(); return; }
  if (t.dataset.action === 'cart') { closeSheet(); go('meal'); return; }
  if (t.dataset.action === 'open-cart') { openCartSheet(); return; }
  if (t.dataset.action === 'clear-cart') { state.cart = []; afterCartChange(); return; }
  if (t.dataset.action === 'save-cart') { saveCartAsMeal(); return; }
  if (t.dataset.action === 'add-meal') { openEntry(null); return; }
  if (t.dataset.action === 'goto-food') { go('food'); return; }
  if (t.dataset.action === 'goto-meal') { go('meal'); return; }
  if (t.dataset.action === 'evidence') { openEvidence(state.evidence || compute().scene.ev); return; }
  if (t.dataset.action === 'autobalance') {
    solveMeal();
    save(); render();
    return;
  }

  /* 食物卡 */
  if (t.dataset.food) { openFood(t.dataset.food); return; }
  if (t.dataset.dish) { openDish(t.dataset.dish); return; }

  /* 配餐：选择食物 */
  if (t.dataset.pick) {
    const slot = t.dataset.pick, fid = t.dataset.fid;
    const f = FOODS.find(x => x.id === fid);
    state.meal[slot].id = fid;
    if (slot === 'veg') state.meal.veg.on = true;
    const macro = slot === 'carb' ? 'c' : slot === 'protein' ? 'p' : slot === 'fat' ? 'f' : null;
    if (macro && f[macro] > 0) {
      const target = (macro === 'c' ? compute().c : macro === 'p' ? compute().p : compute().f) / state.meals;
      state.meal[slot].g = Math.round(target / (f[macro] / 100));
    }
    if (slot === 'veg' && (!state.meal.veg.g)) state.meal.veg.g = 100;
    solveMeal();
    save(); render();
    return;
  }

  /* 果蔬开关 */
  if (t.dataset.vegToggle) {
    state.meal.veg.on = !state.meal.veg.on;
    if (state.meal.veg.on && !state.meal.veg.g) state.meal.veg.g = 100;
    save(); render();
    return;
  }

  /* 克数步进 */
  if (t.dataset.step) {
    const slot = t.dataset.step, d = parseInt(t.dataset.d, 10);
    const cur = state.meal[slot].g || 0;
    state.meal[slot].g = clamp(cur + d, 0, 1500);
    if (slot === 'veg' && state.meal[slot].g > 0) state.meal.veg.on = true;
    save(); render();
    return;
  }

  /* 弹层内加入本餐 */
  if (t.dataset.add) {
    const f = FOODS.find(x => x.id === t.dataset.add);
    const slot = f.cat === 'veg' ? 'veg' : f.cat;
    state.meal[slot].id = f.id;
    const macro = slot === 'carb' ? 'c' : slot === 'protein' ? 'p' : slot === 'fat' ? 'f' : null;
    if (macro && f[macro] > 0) {
      const target = (macro === 'c' ? compute().c : macro === 'p' ? compute().p : compute().f) / state.meals;
      state.meal[slot].g = Math.round(target / (f[macro] / 100));
    }
    if (slot === 'veg') { state.meal.veg.on = true; if (!state.meal.veg.g) state.meal.veg.g = 100; }
    closeSheet(); save();
    if (state.screen !== 'meal') go('meal'); else render();
    return;
  }
});

/* 滑块 */
document.addEventListener('input', (ev) => {
  /* 食物搜索 */
  if (ev.target.id === 'foodSearch') {
    state.foodQuery = ev.target.value;
    updateFoodList();
    return;
  }

  /* 记录弹层里的克数滑块 */
  const ls = ev.target.closest('[data-lslider]');
  if (ls && state.draft) {
    const k = ls.dataset.lslider;
    const v = parseFloat(ls.value);
    state.draft[k] = v;
    const p = v / ls.max * 100;
    ls.style.setProperty('--p', p + '%');
    const num = document.querySelector(`[data-lnum="${k}"]`);
    if (num) num.value = String(Math.round(v));
    const live = entryLive();
    const box = $('#entryLive');
    if (box) {
      box.querySelector('.live-kcal').innerHTML = `${Math.round(live.kcal)}<small>kcal</small>`;
      box.querySelector('.live-macros').innerHTML =
        `<span>碳 ${Math.round(live.total.c)}/${live.target.c}</span>` +
        `<span>蛋 ${Math.round(live.total.p)}/${live.target.p}</span>` +
        `<span>脂 ${Math.round(live.total.f)}/${live.target.f}</span>`;
    }
    return;
  }

  const ln = ev.target.closest('[data-lnum]');
  if (ln && state.draft) {
    const k = ln.dataset.lnum;
    const v = clamp(parseFloat(ln.value) || 0, 0, 999);
    state.draft[k] = v;
    const slider = document.querySelector(`[data-lslider="${k}"]`);
    if (slider) { slider.value = String(v); slider.style.setProperty('--p', v / slider.max * 100 + '%'); }
    const live = entryLive();
    const box = $('#entryLive');
    if (box) {
      box.querySelector('.live-kcal').innerHTML = `${Math.round(live.kcal)}<small>kcal</small>`;
      box.querySelector('.live-macros').innerHTML =
        `<span>碳 ${Math.round(live.total.c)}/${live.target.c}</span>` +
        `<span>蛋 ${Math.round(live.total.p)}/${live.target.p}</span>` +
        `<span>脂 ${Math.round(live.total.f)}/${live.target.f}</span>`;
    }
    return;
  }

  const s = ev.target.closest('[data-slider]');
  if (!s) return;
  const id = s.dataset.slider;
  const v = parseFloat(s.value);
  state[id] = v;
  const p = (v - s.min) / (s.max - s.min) * 100;
  s.style.setProperty('--p', p + '%');
  const lab = $('#fv-' + id);
  if (lab) lab.innerHTML = `${v}<small>${lab.querySelector('small')?.textContent || ''}</small>`;
  save();
});

/* 记录弹层：日期变更 */
document.addEventListener('change', (ev) => {
  if (ev.target.id === 'logDate' && state.draft) {
    state.draft.date = ev.target.value || dstr();
    const live = entryLive();
    const box = $('#entryLive');
    if (box) {
      box.querySelector('.live-macros').innerHTML =
        `<span>碳 ${Math.round(live.total.c)}/${live.target.c}</span>` +
        `<span>蛋 ${Math.round(live.total.p)}/${live.target.p}</span>` +
        `<span>脂 ${Math.round(live.total.f)}/${live.target.f}</span>`;
    }
  }
});

/* 滑动结束再重渲染，避免拖动卡顿 */
document.addEventListener('change', (ev) => {
  const ln = ev.target.closest('[data-lnum]');
  if (ln && state.draft) {
    const k = ln.dataset.lnum;
    const v = clamp(parseFloat(ln.value) || 0, 0, 999);
    state.draft[k] = v;
    const slider = document.querySelector(`[data-lslider="${k}"]`);
    if (slider) { slider.value = String(v); slider.style.setProperty('--p', v / slider.max * 100 + '%'); }
    const live = entryLive();
    const box = $('#entryLive');
    if (box) {
      box.querySelector('.live-kcal').innerHTML = `${Math.round(live.kcal)}<small>kcal</small>`;
      box.querySelector('.live-macros').innerHTML =
        `<span>碳 ${Math.round(live.total.c)}/${live.target.c}</span>` +
        `<span>蛋 ${Math.round(live.total.p)}/${live.target.p}</span>` +
        `<span>脂 ${Math.round(live.total.f)}/${live.target.f}</span>`;
    }
    return;
  }

  const s = ev.target.closest('[data-slider]');
  if (!s) return;
  if (['activity', 'sessions', 'exp'].includes(s.dataset.slider)) render();
});

$('#sheetMask').addEventListener('click', closeSheet);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

function importFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.onchange = () => { if (input.files[0]) importData(input.files[0]); };
  input.click();
}

/* 启动 */
if (state.screen === 'meal') ensureMeal();
render();

/* ---------------- PWA：注册 Service Worker（仅 http/https 生效） ---------------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
