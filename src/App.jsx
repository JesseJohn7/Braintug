import { useState } from "react";
import Game from "./Game";
import { TOPICS, CATEGORIES, loadBank } from "./questions";

const Heading = ({ children }) => (
  <h3 className="mb-2 mt-6 text-sm uppercase tracking-widest opacity-80">{children}</h3>
);

export default function App() {
  const [cfg, setCfg] = useState({ topic: "mixed", level: "JSS1", seconds: 15, mode: "single", cat: 19 });
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  async function start() {
    if (cfg.topic === "trivia" || cfg.topic === "custom") {
      setLoading(true);
      const ok = await loadBank(cfg.topic, cfg.cat);
      setLoading(false);
      if (!ok) {
        setNote(cfg.topic === "custom"
          ? "Couldn't load public/questions.json"
          : "Couldn't reach the trivia server. Check the internet and wait 5 seconds.");
        return;
      }
    }
    setNote("");
    setPlaying(true);
  }

  if (playing) return <Game {...cfg} onExit={() => setPlaying(false)} />;

  const chip = (k, v, label) => (
    <button
      key={String(v)}
      onClick={() => set(k, v)}
      className={`rounded-full border-2 px-4 py-2.5 transition ${
        cfg[k] === v ? "border-amber-400 bg-amber-950" : "border-transparent bg-slate-800 hover:bg-slate-700"
      }`}
    >
      {label}
    </button>
  );

  const Chips = ({ children }) => <div className="flex flex-wrap justify-center gap-2">{children}</div>;
  const noLevel = ["trivia", "custom"].includes(cfg.topic);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-10 pt-5 text-center">
      <h1 className="mt-2 text-5xl font-bold sm:text-6xl">
        🪢 Brain<span className="text-amber-400">Tug</span>
      </h1>
      <p className="opacity-70">Pull with your brain!</p>

      <Heading>Mode</Heading>
      <Chips>
        {chip("mode", "single", "👤 Vs Bot")}
        {chip("mode", "multi", "👥 2 Players")}
      </Chips>

      <Heading>Topic</Heading>
      <Chips>{TOPICS.map((t) => chip("topic", t.id, `${t.icon} ${t.label}`))}</Chips>

      {cfg.topic === "trivia" && (
        <>
          <Heading>Trivia category</Heading>
          <Chips>{CATEGORIES.map((c) => chip("cat", c.id, c.label))}</Chips>
        </>
      )}

      <Heading>Level {noLevel && "(not used for this topic)"}</Heading>
      <Chips>{["JSS1", "JSS2", "JSS3"].map((l) => chip("level", l, l))}</Chips>

      <Heading>Seconds per question</Heading>
      <Chips>{[10, 15, 20, 30].map((s) => chip("seconds", s, `${s}s`))}</Chips>

      {note && <p className="mt-5 font-bold text-rose-300">{note}</p>}

      <button
        disabled={loading}
        onClick={start}
        className="mt-8 w-full max-w-sm rounded-2xl bg-amber-400 py-4 text-2xl font-bold text-stone-900 shadow-[0_6px_0_#b45309] transition active:translate-y-1 active:shadow-[0_2px_0_#b45309] disabled:opacity-60"
      >
        {loading ? "Loading questions…" : "▶ Start"}
      </button>
    </main>
  );
}