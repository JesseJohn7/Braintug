import { useState, useEffect } from "react";
import { makeQuestion } from "./questions";
import Arena from "./Arena";

const TARGET = 5; // pulls needed to win
const KEYS = { 1:[0,0], 2:[0,1], 3:[0,2], 4:[0,3], 7:[1,0], 8:[1,1], 9:[1,2], 0:[1,3] };
const KEYLABEL = [["1","2","3","4"], ["7","8","9","0"]];

// full class names so Tailwind can detect them
const THEME = [
  { text: "text-sky-400", border: "border-sky-400", press: "active:bg-sky-400" },
  { text: "text-rose-400", border: "border-rose-400", press: "active:bg-rose-400" },
];

export default function Game({ topic, level, seconds, mode, onExit }) {
  const two = mode === "multi";
  const n = two ? 2 : 1;
  const [q, setQ] = useState(() => makeQuestion(topic, level));
  const [time, setTime] = useState(seconds);
  const [pos, setPos] = useState(0); // negative = Player 1 side, positive = Player 2 / Bot side
  const [locked, setLocked] = useState([false, false]);
  const [phase, setPhase] = useState("ask"); // ask | reveal | over
  const [msg, setMsg] = useState("");
  const [round, setRound] = useState(1);

  function resolve(who, text) {
    if (who === 0) setPos((p) => p - 1);
    if (who === 1) setPos((p) => p + 1);
    setMsg(text);
    setPhase("reveal");
  }

  // countdown
  useEffect(() => {
    if (phase !== "ask") return;
    if (time <= 0) {
      two ? resolve(-1, `⏰ Time up! Answer: ${q.answer}`)
          : resolve(1, `⏰ Too slow! Bot pulls. Answer: ${q.answer}`);
      return;
    }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, phase]);

  // after each round: win check or next question
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => {
      if (Math.abs(pos) >= TARGET) return setPhase("over");
      setQ(makeQuestion(topic, level));
      setTime(seconds);
      setLocked([false, false]);
      setRound((r) => r + 1);
      setMsg("");
      setPhase("ask");
    }, 1600);
    return () => clearTimeout(t);
  }, [phase]);

  function answer(p, opt) {
    if (phase !== "ask" || locked[p]) return;
    if (opt === q.answer)
      return resolve(p, two ? `✅ Player ${p + 1} pulls!` : "✅ Correct! You pull!");
    const next = locked.map((l, i) => (i === p ? true : l));
    setLocked(next);
    if (next.slice(0, n).every(Boolean))
      two ? resolve(-1, `❌ Both wrong! Answer: ${q.answer}`)
          : resolve(1, `❌ Wrong! Bot pulls. Answer: ${q.answer}`);
  }

  // keyboard: P1 = 1 2 3 4, P2 = 7 8 9 0
  useEffect(() => {
    const onKey = (e) => {
      const m = KEYS[e.key];
      if (m && m[0] < n) answer(m[0], q.options[m[1]]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const p1Won = pos < 0;
  const title =
    phase !== "over" ? "" :
    !two ? (p1Won ? "You win! 🎉" : "The Bot wins 🤖") :
    `Player ${p1Won ? 1 : 2} wins! 🏆`;

  const danger = time <= 5;
  const ringColor = danger ? "#ef4444" : "#fbbf24";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-10 pt-4">
      {/* top bar */}
      <header className="mb-3 flex items-center justify-between">
        <button onClick={onExit} className="p-2 underline opacity-70">✕ Quit</button>
        <span className="font-bold opacity-80">Round {round}</span>
        <div
          className="grid size-16 place-items-center rounded-full"
          style={{ background: `conic-gradient(${ringColor} ${time / seconds}turn, rgba(255,255,255,.15) 0)` }}
        >
          <b className={`grid size-[52px] place-items-center rounded-full bg-slate-900 text-2xl ${danger ? "animate-beat text-red-500" : ""}`}>
            {time}
          </b>
        </div>
      </header>

      <Arena pos={pos} over={phase === "over"} two={two} />

      {/* question */}
      <section className="mb-2 mt-4 text-center">
        <h2 className="text-2xl font-bold sm:text-4xl">{q.text}</h2>
        <p className="mt-1.5 min-h-[1.6em] font-bold text-amber-400">{msg}</p>
      </section>

      {/* answers */}
      <section className={`grid gap-3 sm:gap-4 ${two ? "grid-cols-2" : "grid-cols-1"}`}>
        {Array.from({ length: n }).map((_, p) => (
          <div key={p}>
            {two && <h4 className={`mb-2 text-center font-bold ${THEME[p].text}`}>Player {p + 1}</h4>}
            <div className={`grid gap-2.5 ${two ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2"}`}>
              {q.options.map((opt, i) => (
                <button
                  key={opt}
                  disabled={locked[p] || phase !== "ask"}
                  onClick={() => answer(p, opt)}
                  className={`min-h-[52px] rounded-2xl border-[3px] bg-slate-800 px-2 py-2 text-lg font-bold transition active:scale-95 active:text-slate-900 disabled:opacity-35 sm:min-h-[60px] sm:text-2xl ${THEME[p].border} ${THEME[p].press}`}
                >
                  <small className="mr-1.5 hidden text-xs opacity-50 sm:inline">{KEYLABEL[p][i]}</small>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* winner overlay */}
      {phase === "over" && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-slate-900/85 p-4">
          <div className="w-full max-w-md animate-pop rounded-3xl bg-slate-800 p-7 text-center">
            <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
            <p className="mb-4 opacity-70">Rounds played: {round}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-2xl bg-amber-400 py-3 text-xl font-bold text-stone-900 shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_2px_0_#b45309]"
            >
              Play again
            </button>
            <button onClick={onExit} className="mt-3 p-2 underline opacity-70">Back to menu</button>
          </div>
        </div>
      )}
    </main>
  );
}