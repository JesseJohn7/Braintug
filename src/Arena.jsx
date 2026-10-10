export default function Arena({ pos, over, two }) {
  const p2Wins = over && pos > 0;
  const p1Wins = over && pos < 0;

  return (
    <div className="relative h-44 overflow-hidden rounded-3xl shadow-[inset_0_-8px_0_rgba(0,0,0,.12)] bg-[linear-gradient(180deg,#7dd3fc_58%,#4ade80_58%)] sm:h-56">
      {/* team zones */}
      <div className="absolute bottom-0 left-0 h-[42%] w-1/5 bg-sky-400/45" />
      <div className="absolute bottom-0 right-0 h-[42%] w-1/5 bg-rose-400/45" />

      {/* name tags */}
      <span className="absolute left-2.5 top-2 z-10 rounded-full bg-sky-400 px-3 text-sm font-bold text-slate-900">
        Player 1
      </span>
      <span className="absolute right-2.5 top-2 z-10 rounded-full bg-rose-400 px-3 text-sm font-bold text-slate-900">
        {two ? "Player 2" : "Bot"}
      </span>

      {/* centre line */}
      <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-white">
        <span className="absolute left-1 top-9 text-2xl">🚩</span>
      </div>

      {/* rope + fighters, slides with score */}
      <div
        className="absolute bottom-[20%] flex w-[56%] -translate-x-1/2 items-center transition-[left] duration-700 ease-[cubic-bezier(.3,1.5,.5,1)]"
        style={{ left: `calc(50% + ${pos * 4}%)` }}
      >
        <div key={"a" + pos} className={`text-5xl leading-none sm:text-6xl ${p2Wins ? "animate-fall" : "animate-tug"}`}>
          🧑🏾‍🎓
        </div>
        <div className="relative h-2 flex-1 rounded bg-[repeating-linear-gradient(90deg,#92400e_0_8px,#b45309_8px_16px)]">
          <i className="absolute -top-2.5 left-1/2 h-7 w-3.5 -translate-x-1/2 rounded bg-red-500" />
        </div>
        <div key={"b" + pos} className={`text-5xl leading-none sm:text-6xl ${p1Wins ? "animate-fall" : "animate-tug"}`}>
          {two ? "👩🏾‍🎓" : "🤖"}
        </div>
      </div>
    </div>
  );
}