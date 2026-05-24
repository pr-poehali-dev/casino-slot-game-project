import { useState } from "react";
import { User, Transaction } from "@/App";
import Icon from "@/components/ui/icon";

interface DicePageProps {
  user: User | null;
  updateBalance: (delta: number) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  navigate: (p: string) => void;
}

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function DicePage({ user, updateBalance, addTransaction, navigate }: DicePageProps) {
  const [guess, setGuess] = useState<number | null>(null);
  const [bet, setBet] = useState(10);
  const [rolling, setRolling] = useState(false);
  const [rolled, setRolled] = useState<number | null>(null);
  const [result, setResult] = useState<{ win: boolean; amount: number } | null>(null);
  const [displayFace, setDisplayFace] = useState(0);

  const roll = () => {
    if (!user || guess === null) return;
    if (user.balance < bet) { setResult({ win: false, amount: 0 }); return; }

    setRolling(true);
    setResult(null);
    updateBalance(-bet);

    let ticks = 0;
    const interval = setInterval(() => {
      setDisplayFace(Math.floor(Math.random() * 6));
      ticks++;
      if (ticks > 15) {
        clearInterval(interval);
        const outcome = Math.floor(Math.random() * 6) + 1;
        setRolled(outcome);
        setDisplayFace(outcome - 1);
        setRolling(false);

        if (outcome === guess) {
          const win = bet * 6;
          updateBalance(win);
          addTransaction({ type: "win", amount: win, game: "Кости", status: "done" });
          setResult({ win: true, amount: win });
        } else {
          addTransaction({ type: "loss", amount: bet, game: "Кости", status: "done" });
          setResult({ win: false, amount: 0 });
        }
      }
    }, 100);
  };

  const betOptions = [10, 25, 50, 100, 250, 500];

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("home")} className="btn-ghost-white p-2">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="font-oswald text-3xl font-bold text-white">🎲 КОСТИ</h1>
      </div>

      {user && (
        <div className="casino-card neon-border-cyan p-4 mb-6 flex items-center justify-between">
          <span className="text-white/60 font-oswald text-sm">БАЛАНС</span>
          <span className="font-oswald text-xl font-bold neon-cyan">{user.balance.toFixed(0)} ₽</span>
        </div>
      )}

      <div className="casino-card neon-border-cyan p-6 mb-6">
        {/* Big dice display */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-32 h-32 rounded-3xl flex items-center justify-center text-7xl transition-all
              ${rolling ? "animate-pulse" : ""}
              ${result?.win ? "animate-win-flash" : ""}`}
            style={{
              background: "rgba(0,255,255,0.08)",
              border: result?.win ? "2px solid rgba(0,255,255,0.8)" : "1px solid rgba(0,255,255,0.3)",
              boxShadow: result?.win ? "0 0 30px rgba(0,255,255,0.5)" : "0 0 15px rgba(0,255,255,0.2)",
            }}
          >
            {rolling ? DICE_FACES[displayFace] : (rolled !== null ? DICE_FACES[rolled - 1] : "🎲")}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`text-center py-3 rounded-xl mb-4 font-oswald text-lg font-bold animate-fade-in-up
            ${result.win ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30" : "text-red-400 bg-red-500/10 border border-red-500/20"}`}>
            {result.win
              ? `🏆 УГАДАЛ! Выпало ${rolled} — +${result.amount} ₽`
              : `😔 Выпало ${rolled ?? "?"}, ты выбрал ${guess}`}
          </div>
        )}

        {/* Number selector */}
        <div className="mb-5">
          <div className="text-xs text-white/40 font-oswald mb-3">ВЫБЕРИ ЧИСЛО (множитель x6)</div>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                onClick={() => setGuess(n)}
                className={`w-12 h-12 rounded-xl text-2xl transition-all font-oswald font-bold
                  ${guess === n ? "scale-110" : "opacity-50 hover:opacity-80"}`}
                style={{
                  background: guess === n ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.05)",
                  border: guess === n ? "2px solid rgba(0,255,255,0.8)" : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: guess === n ? "0 0 15px rgba(0,255,255,0.4)" : "none",
                }}
              >
                {DICE_FACES[n - 1]}
              </button>
            ))}
          </div>
        </div>

        {/* Bet */}
        <div className="mb-5">
          <div className="text-xs text-white/40 font-oswald mb-2">СТАВКА</div>
          <div className="flex flex-wrap gap-2">
            {betOptions.map(b => (
              <button
                key={b}
                onClick={() => setBet(b)}
                className={`px-3 py-1.5 rounded-lg font-oswald text-sm transition-all ${
                  bet === b ? "btn-neon-cyan" : "btn-ghost-white"
                }`}
              >
                {b} ₽
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={roll}
          disabled={rolling || !user || guess === null}
          className="btn-neon-cyan w-full py-4 text-xl font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {rolling ? (
            <span className="flex items-center justify-center gap-2">
              <Icon name="Loader2" size={20} className="animate-spin" /> БРОСАЕМ...
            </span>
          ) : guess === null ? "ВЫБЕРИ ЧИСЛО" : `🎲 БРОСИТЬ — ${bet} ₽`}
        </button>

        <div className="mt-4 casino-card2 p-3 text-center text-sm text-white/40 font-rubik">
          Угадай число от 1 до 6 — выигрыш x6 от ставки!
        </div>

        {!user && (
          <p className="text-center text-white/40 text-sm mt-3">
            <button onClick={() => navigate("home")} className="text-cyan-400 hover:underline">Войди</button> чтобы играть
          </p>
        )}
      </div>
    </div>
  );
}
