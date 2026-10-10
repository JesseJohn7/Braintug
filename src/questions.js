const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const sup = (n) => String(n).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");
const frac = (n, d) => {
  const g = gcd(n, d);
  n /= g; d /= g;
  return d === 1 ? String(n) : `${n}/${d}`;
};

const MAP = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
  [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
const toRoman = (n) => {
  let out = "";
  for (const [v, s] of MAP) while (n >= v) { out += s; n -= v; }
  return out;
};

// 4 unique options, one is the answer
function options(answer, makeWrong) {
  const set = new Set([answer]);
  let tries = 0;
  while (set.size < 4 && tries++ < 300) set.add(makeWrong());
  return shuffle([...set]);
}
const numOpts = (ans, spread = 6) =>
  options(String(ans), () => {
    const w = ans + rand(-spread, spread);
    return String(w < 0 && ans >= 0 ? Math.abs(w) + 1 : w);
  });
const nairaOpts = (ans, step) =>
  options(`₦${ans}`, () => `₦${Math.max(10, ans + rand(-5, 5) * step)}`);

const G = {
  roman: (i) => {
    const max = [20, 100, 1000][i];
    const t = rand(1, i === 2 ? 3 : 2);
    if (t === 3) {
      const a = rand(5, 200), b = rand(5, 200), ans = toRoman(a + b);
      return { text: `${toRoman(a)} + ${toRoman(b)} = ?`, answer: ans,
        options: options(ans, () => toRoman(a + b + (rand(-10, 10) || 1))) };
    }
    const n = rand(1, max);
    if (t === 1)
      return { text: `What number is ${toRoman(n)}?`, answer: String(n),
        options: options(String(n), () => String(Math.max(1, n + rand(-5, 5)))) };
    const ans = toRoman(n);
    return { text: `Write ${n} in Roman numerals`, answer: ans,
      options: options(ans, () => toRoman(Math.max(1, n + rand(-6, 6)))) };
  },

  arith: (i) => {
    const op = pick(["+", "−", "×", "÷"]);
    const r = [[1, 50], [20, 200], [100, 999]][i];
    let a, b, ans;
    if (op === "+") { a = rand(...r); b = rand(...r); ans = a + b; }
    else if (op === "−") { a = rand(...r); b = rand(1, a); ans = a - b; }
    else if (op === "×") { a = rand(2, [9, 12, 25][i]); b = rand(2, [9, 12, 12][i]); ans = a * b; }
    else { b = rand(2, [9, 12, 15][i]); ans = rand(2, [9, 12, 25][i]); a = b * ans; }
    return { text: `${a} ${op} ${b} = ?`, answer: String(ans), options: numOpts(ans) };
  },

  bodmas: (i) => {
    const a = rand(2, 12), b = rand(2, 9), c = rand(2, 9), d = rand(1, 20);
    const sets = [
      [[`${a} + ${b} × ${c}`, a + b * c], [`${a * b} ÷ ${b} + ${c}`, a + c]],
      [[`(${a} + ${b}) × ${c}`, (a + b) * c], [`${a} × ${b} + ${c} × 2`, a * b + c * 2]],
      [[`${d} + ${a} × (${b} + ${c})`, d + a * (b + c)],
       [`(${a} + ${b}) × (${c} − 1)`, (a + b) * (c - 1)]],
    ];
    const [text, ans] = pick(sets[i]);
    return { text: `${text} = ?`, answer: String(ans), options: numOpts(ans, 8) };
  },

  algebra: (i) => {
    const x = rand(1, 12);
    let text;
    if (i === 0) { const b = rand(1, 20); text = `x + ${b} = ${x + b}`; }
    else if (i === 1) { const a = rand(2, 9), b = rand(1, 20); text = `${a}x + ${b} = ${a * x + b}`; }
    else {
      const c = rand(1, 5), a = c + rand(1, 5), b = rand(1, 20);
      text = `${a}x + ${b} = ${c}x + ${(a - c) * x + b}`;
    }
    return { text: `Find x:  ${text}`, answer: String(x), options: numOpts(x, 4) };
  },

  percent: (i) => {
    if (i === 2) {
      const base = rand(2, 20) * 100, p = pick([10, 20, 25, 50]);
      const ans = base - (base * p) / 100;
      return { text: `A bag costs ₦${base}. After ${p}% discount, the price is?`,
        answer: `₦${ans}`, options: nairaOpts(ans, 50) };
    }
    const p = i === 0 ? pick([10, 25, 50]) : pick([5, 10, 15, 20, 30, 40, 60, 75]);
    const base = rand(1, i === 0 ? 10 : 20) * 20;
    const ans = (p * base) / 100;
    return { text: `What is ${p}% of ${base}?`, answer: String(ans), options: numOpts(ans, 8) };
  },

  lcmhcf: (i) => {
    if (Math.random() < 0.5) {
      const g = rand(2, [4, 6, 8][i]);
      let a = g * rand(2, 6), b = g * rand(2, 6);
      if (a === b) b += g;
      const ans = gcd(a, b);
      return { text: `HCF of ${a} and ${b}?`, answer: String(ans), options: numOpts(ans, 4) };
    }
    const m = [6, 12, 15][i];
    let a = rand(2, m), b = rand(2, m);
    if (a === b) b++;
    const ans = (a * b) / gcd(a, b);
    return { text: `LCM of ${a} and ${b}?`, answer: String(ans), options: numOpts(ans, 8) };
  },

  fractions: (i) => {
    if (i === 0) {
      const d = pick([2, 3, 4, 5, 10]), n = rand(1, d - 1), k = rand(2, 12);
      const ans = n * k;
      return { text: `What is ${n}/${d} of ${d * k}?`, answer: String(ans), options: numOpts(ans, 6) };
    }
    if (i === 1) {
      const d = rand(3, 12), a = rand(1, d - 1), b = rand(1, d - 1);
      const ans = frac(a + b, d);
      return { text: `${a}/${d} + ${b}/${d} = ?  (simplest form)`, answer: ans,
        options: options(ans, () => frac(Math.max(1, a + b + rand(-3, 3)), d)) };
    }
    const b = pick([2, 3, 4, 5, 6]);
    let d = pick([2, 3, 4, 5, 6]);
    if (d === b) d = b === 6 ? 5 : b + 1;
    const a = rand(1, b - 1), c = rand(1, d - 1);
    const num = a * d + c * b, den = b * d, ans = frac(num, den);
    return { text: `${a}/${b} + ${c}/${d} = ?  (simplest form)`, answer: ans,
      options: options(ans, () => pick([frac(a + c, b + d), frac(Math.max(1, num + rand(-3, 3)), den)])) };
  },

  angles: (i) => {
    let text, ans;
    if (i === 0) { const x = rand(10, 80); text = `Two angles are complementary. One is ${x}°. The other is?`; ans = 90 - x; }
    else if (i === 1) { const x = rand(20, 160); text = `Angles on a straight line: one is ${x}°. The other is?`; ans = 180 - x; }
    else {
      const a = rand(30, 80), b = rand(30, 80);
      text = `Two angles of a triangle are ${a}° and ${b}°. The third angle is?`; ans = 180 - a - b;
    }
    return { text, answer: `${ans}°`,
      options: options(`${ans}°`, () => `${Math.max(1, ans + rand(-15, 15))}°`) };
  },

  ratio: (i) => {
    const m1 = (v) => Math.max(1, v);
    let a = rand(1, 6), b = rand(1, 6);
    while (a === b || gcd(a, b) !== 1) { a = rand(1, 6); b = rand(1, 6); }
    if (i === 0) {
      const g = rand(2, 9), ans = `${a}:${b}`;
      return { text: `Simplify the ratio ${a * g}:${b * g}`, answer: ans,
        options: options(ans, () => `${m1(a + rand(-2, 2))}:${m1(b + rand(-2, 2))}`) };
    }
    if (i === 1) {
      const unit = rand(1, 20) * 10, first = a * unit;
      return { text: `Share ₦${(a + b) * unit} in the ratio ${a}:${b}. What is the first share?`,
        answer: `₦${first}`,
        options: options(`₦${first}`, () => `₦${Math.max(10, first + rand(-4, 4) * 10)}`) };
    }
    const n = rand(2, 6), price = rand(2, 10) * 50, k = rand(7, 15), ans = k * price;
    return { text: `${n} pens cost ₦${n * price}. How much do ${k} pens cost?`,
      answer: `₦${ans}`, options: nairaOpts(ans, 50) };
  },

  indices: (i) => {
    if (i === 0) {
      const n = rand(2, 12);
      return Math.random() < 0.5
        ? { text: `${n}${sup(2)} = ?`, answer: String(n * n), options: numOpts(n * n, 10) }
        : { text: `√${n * n} = ?`, answer: String(n), options: numOpts(n, 3) };
    }
    if (i === 1) {
      const b = pick([2, 3, 4, 5, 10]), e = rand(2, 4), ans = b ** e;
      return { text: `${b}${sup(e)} = ?`, answer: String(ans), options: numOpts(ans, Math.max(4, b * 3)) };
    }
    const t = rand(1, 3), b = pick([2, 3, 5, 7]);
    if (t === 1) {
      const x = rand(2, 7), y = rand(2, 7);
      return { text: `${b}${sup(x)} × ${b}${sup(y)} = ${b}^?`, answer: String(x + y), options: numOpts(x + y, 3) };
    }
    if (t === 2) {
      const x = rand(5, 10), y = rand(2, 4);
      return { text: `${b}${sup(x)} ÷ ${b}${sup(y)} = ${b}^?`, answer: String(x - y), options: numOpts(x - y, 3) };
    }
    const n = rand(2, 9);
    return { text: `∛${n ** 3} = ?`, answer: String(n), options: numOpts(n, 3) };
  },

  geometry: (i) => {
    let text, ans;
    if (i === 0) {
      if (Math.random() < 0.5) {
        const l = rand(3, 20), w = rand(2, l);
        text = `Perimeter of a rectangle ${l} cm by ${w} cm (in cm)?`; ans = 2 * (l + w);
      } else {
        const s = rand(2, 15);
        text = `Area of a square with side ${s} cm (in cm²)?`; ans = s * s;
      }
    } else if (i === 1) {
      if (Math.random() < 0.5) {
        const l = rand(3, 20), w = rand(2, 15);
        text = `Area of a rectangle ${l} cm by ${w} cm (in cm²)?`; ans = l * w;
      } else {
        const b = 2 * rand(2, 12), h = rand(3, 15);
        text = `Area of a triangle, base ${b} cm and height ${h} cm (in cm²)?`; ans = (b * h) / 2;
      }
    } else {
      const r = 7 * rand(1, 4), k = r / 7;
      if (Math.random() < 0.5) { text = `Circumference of a circle, radius ${r} cm (π = 22/7)?`; ans = 44 * k; }
      else { text = `Area of a circle, radius ${r} cm (π = 22/7)?`; ans = 154 * k * k; }
    }
    return { text, answer: String(ans), options: numOpts(ans, Math.max(4, Math.round(ans * 0.15))) };
  },

  sequence: (i) => {
    if (i === 0 || (i === 1 && Math.random() < 0.5)) {
      const a = rand(1, 20), d = rand(2, 9);
      const ans = a + 4 * d;
      return { text: `${[0, 1, 2, 3].map((k) => a + k * d).join(", ")}, ?`, answer: String(ans), options: numOpts(ans, 6) };
    }
    if (i === 1) {
      const a = rand(1, 4), r = pick([2, 3]);
      const ans = a * r ** 4;
      return { text: `${[0, 1, 2, 3].map((k) => a * r ** k).join(", ")}, ?`, answer: String(ans), options: numOpts(ans, 10) };
    }
    const a = rand(2, 9), b = rand(-5, 10), k = rand(5, 15), ans = a * k + b;
    const bs = b === 0 ? "" : ` ${b > 0 ? "+" : "−"} ${Math.abs(b)}`;
    return { text: `The nth term is ${a}n${bs}. Find the term when n = ${k}.`, answer: String(ans), options: numOpts(ans, 8) };
  },

  average: (i) => {
    const k = [4, 5, 5][i];
    const nums = Array.from({ length: k }, () => rand(2, [20, 40, 60][i]));
    const s = nums.reduce((x, y) => x + y, 0);
    nums[k - 1] += (k - (s % k)) % k;
    const sum = nums.reduce((x, y) => x + y, 0);
    const type = i === 0 ? "mean" : pick(["mean", "median", "range"]);
    const sorted = [...nums].sort((x, y) => x - y);
    const ans = type === "mean" ? sum / k : type === "median" ? sorted[2] : sorted[k - 1] - sorted[0];
    return { text: `Find the ${type} of ${nums.join(", ")}`, answer: String(ans), options: numOpts(ans, 4) };
  },

  rounding: (i) => {
    const place = [10, 100, 1000][i];
    const n = rand(place + 1, place * 10 + place - 1);
    const ans = Math.round(n / place) * place;
    return { text: `Round ${n} to the nearest ${place}`, answer: String(ans),
      options: options(String(ans), () => String(Math.max(0, ans + rand(-3, 3) * place))) };
  },

  primes: (i) => {
    const isP = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
    const hi = [30, 60, 100][i];
    if (i < 2 || Math.random() < 0.5) {
      let p; do { p = rand(2, hi); } while (!isP(p));
      const set = new Set([String(p)]);
      let t = 0;
      while (set.size < 4 && t++ < 500) { const c = rand(4, hi + 10); if (!isP(c)) set.add(String(c)); }
      return { text: "Which of these is a prime number?", answer: String(p), options: shuffle([...set]) };
    }
    const N = rand(12, 100);
    let count = 0;
    for (let d = 1; d <= N; d++) if (N % d === 0) count++;
    return { text: `How many factors does ${N} have?`, answer: String(count), options: numOpts(count, 3) };
  },

  units: (i) => {
    let text, ans, scaled = true;
    if (i === 0) {
      [text, ans] = pick([
        () => { const m = rand(2, 20); return [`${m} m = ? cm`, m * 100]; },
        () => { const k = rand(2, 15); return [`${k} kg = ? g`, k * 1000]; },
        () => { const l = rand(2, 12); return [`${l} litres = ? ml`, l * 1000]; },
        () => { const h = rand(2, 9); return [`${h} hours = ? minutes`, h * 60]; },
      ])();
    } else if (i === 1) {
      [text, ans] = pick([
        () => { const h = rand(2, 9); return [`${h * 60} minutes = ? hours`, h]; },
        () => { const k = rand(2, 12); return [`${k} km = ? m`, k * 1000]; },
        () => { const g = rand(2, 9); return [`${g * 1000} g = ? kg`, g]; },
      ])();
    } else {
      scaled = false;
      const v = rand(4, 20) * 5, t = rand(2, 6);
      [text, ans] = pick([
        [`A car travels at ${v} km/h for ${t} hours. How far (km)?`, v * t],
        [`A bus covers ${v * t} km in ${t} hours. Its speed (km/h)?`, v],
        [`How many hours to travel ${v * t} km at ${v} km/h?`, t],
      ]);
    }
    return { text, answer: String(ans),
      options: scaled
        ? options(String(ans), () => String(Number((ans * pick([10, 100, 0.1, 0.01, 2, 0.5])).toFixed(2))))
        : numOpts(ans, Math.max(3, Math.round(ans * 0.2))) };
  },

  money: (i) => {
    if (i === 0) {
      const n = rand(2, 12), p = rand(2, 20) * 10, ans = n * p;
      return { text: `Ada buys ${n} pencils at ₦${p} each. How much does she pay?`, answer: `₦${ans}`, options: nairaOpts(ans, 10) };
    }
    if (i === 1) {
      const n = rand(2, 8), p = rand(3, 30) * 10, total = n * p;
      const pay = Math.ceil((total + 1) / 500) * 500, ans = pay - total;
      return { text: `Tunde buys ${n} books at ₦${p} each and pays ₦${pay}. His change?`, answer: `₦${ans}`, options: nairaOpts(ans, 10) };
    }
    if (Math.random() < 0.5) {
      const P = rand(1, 20) * 1000, R = pick([5, 10, 15, 20]), T = rand(2, 5), ans = (P * R * T) / 100;
      return { text: `Simple interest on ₦${P} at ${R}% per year for ${T} years?`, answer: `₦${ans}`, options: nairaOpts(ans, 100) };
    }
    const cost = rand(2, 10) * 100, p = pick([10, 20, 25, 50]), sell = (cost * (100 + p)) / 100;
    return { text: `Bought for ₦${cost}, sold for ₦${sell}. Profit percent?`, answer: `${p}%`,
      options: options(`${p}%`, () => `${pick([5, 10, 15, 20, 25, 30, 40, 50])}%`) };
  },
};

/* ---------- topics shown on the menu ---------- */
export const TOPICS = [
  { id: "mixed", label: "Mixed", icon: "🎲" },
  { id: "roman", label: "Roman numerals", icon: "🏛️" },
  { id: "arith", label: "Basic operations", icon: "➕" },
  { id: "bodmas", label: "BODMAS", icon: "🧮" },
  { id: "algebra", label: "Simple equations", icon: "🔤" },
  { id: "percent", label: "Percentages", icon: "💯" },
  { id: "lcmhcf", label: "LCM & HCF", icon: "🔢" },
  { id: "fractions", label: "Fractions", icon: "🍕" },
  { id: "angles", label: "Angles", icon: "📐" },
  { id: "ratio", label: "Ratio & proportion", icon: "⚖️" },
  { id: "indices", label: "Squares & indices", icon: "⚡" },
  { id: "geometry", label: "Perimeter & area", icon: "🟦" },
  { id: "sequence", label: "Number patterns", icon: "🔁" },
  { id: "average", label: "Averages", icon: "📊" },
  { id: "rounding", label: "Rounding", icon: "🎯" },
  { id: "primes", label: "Primes & factors", icon: "🔍" },
  { id: "units", label: "Units & speed", icon: "📏" },
  { id: "money", label: "Naira problems", icon: "💰" },
  { id: "trivia", label: "Online trivia", icon: "🌍" },
  { id: "custom", label: "My own questions", icon: "📝" },
];

// Open Trivia DB category ids
export const CATEGORIES = [
  { id: 19, label: "Maths" }, { id: 17, label: "Science" },
  { id: 9, label: "General" }, { id: 22, label: "Geography" },
];

/* ---------- fetched / custom question bank ---------- */
let BANK = [];

export async function loadBank(topic, category = 19) {
  try {
    let items;
    if (topic === "custom") {
      const r = await fetch(`${import.meta.env.BASE_URL}questions.json`);
      items = (await r.json()).map((q) => ({
        text: q.text, answer: String(q.answer),
        options: shuffle([String(q.answer), ...q.wrong.map(String)]),
      }));
    } else {
      const r = await fetch(
        `https://opentdb.com/api.php?amount=10&category=${category}&type=multiple&encode=url3986`
      );
      const d = await r.json();
      items = d.results.map((q) => {
        const a = decodeURIComponent(q.correct_answer);
        return { text: decodeURIComponent(q.question), answer: a,
          options: shuffle([a, ...q.incorrect_answers.map((x) => decodeURIComponent(x))]) };
      });
    }
    BANK = shuffle(items);
    return BANK.length > 0;
  } catch {
    return false;
  }
}

/* ---------- main entry ---------- */
const recent = [];

function generate(topic, i) {
  if (topic === "trivia" || topic === "custom") {
    if (BANK.length) {
      const q = BANK.shift();
      BANK.push(q); // cycle so a small bank never runs out
      return { ...q, options: shuffle(q.options) };
    }
    return G[pick(Object.keys(G))](i); // fallback
  }
  const id = topic === "mixed" ? pick(Object.keys(G)) : topic;
  return G[id](i);
}

export function makeQuestion(topic, level) {
  const i = ["JSS1", "JSS2", "JSS3"].indexOf(level);
  let q;
  for (let t = 0; t < 12; t++) {
    q = generate(topic, i);
    if (!recent.includes(q.text)) break;
  }
  recent.push(q.text);
  if (recent.length > 25) recent.shift();
  return q;
}