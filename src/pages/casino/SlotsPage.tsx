import { useState, useRef } from "react";
import { User, Transaction } from "@/App";
import Icon from "@/components/ui/icon";

interface SlotsPageProps {
  user: User | null;
  updateBalance: (delta: number) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  navigate: (p: string) => void;
}

const SYMBOLS = ["🍒", "🍋", "🍇", "7️⃣", "⭐", "💎", "🔔", "🍀"];
const PAYOUTS: Record<string, number> = {
  "💎": 50, "7️⃣": 30, "⭐": 15, "🔔": 10, "🍀": 8, "🍇": 6, "🍋": 4, "🍒": 3,
};

function getRandomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

export default function SlotsPage({ user, updateBalance, addTransaction, navigate }: SlotsPageProps) {
  const [reels, setReels] = useState(["🍒", "🍋", "🍇"]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [lastResult, setLastResult] = useState<{ win: boolean; amount: number; message: string } | null>(null);
  const [spinDisplay, setSpinDisplay] = useState(["🍒", "🍋", "🍇"]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spin = () => {
    if (!user) { navigate("home"); return; }
    if (user.balance < bet) { setLastResult({ win: false, amount: 0, message: "Недостаточно средств!" }); return; }

    setSpinning(true);
    setLastResult(null);
    updateBalance(-bet);

    let ticks = 0;
    intervalRef.current = setInterval(() => {
      setSpinDisplay([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      ticks++;
      if (ticks > 20) {
        clearInterval(intervalRef.current!);
        const result = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

        // Slight chance to win (35%)
        const roll = Math.random();
        let finalReels = result;
        if (roll < 0.12) {
          // Three of a kind
          const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          finalReels = [sym, sym, sym];
        } else if (roll < 0.35) {
          // Two of a kind
          const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          const pos = Math.floor(Math.random() * 3);
          finalReels = [result[0], result[1], result[2]];
          finalReels[pos] = sym;
          finalReels[(pos + 1) % 3] = sym;
        }

        setReels(finalReels);
        setSpinDisplay(finalReels);
        setSpinning(false);

        // Calculate win
        const allSame = finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2];
        const twoSame = finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2];

        let winAmount = 0;
        if (allSame) {
          winAmount = bet * (PAYOUTS[finalReels[0]] || 5);
        } else if (twoSame) {
          winAmount = bet * 2;
        }

        if (winAmount > 0) {
          updateBalance(winAmount);
          addTransaction({ type: "win", amount: winAmount, game: "Слоты", status: "done" });
          setLastResult({
            win: true,
            amount: winAmount,
            message: allSame ? `ДЖЕКПОТ! ${finalReels[0]}${finalReels[0]}${finalReels[0]}` : "Два совпадения!",
          });
        } else {
          addTransaction({ type: "loss", amount: bet, game: "Слоты", status: "done" });
          setLastResult({ win: false, amount: 0, message: "Не повезло... Попробуй снова!" });
        }
      }
    }, 80);
  };

  const betOptions = [10, 25, 50, 100, 250, 500];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("home")} className="btn-ghost-white p-2">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="font-oswald text-3xl font-bold text-white">🎰 СЛОТЫ</h1>
      </div>

      {/* Balance */}
      {user && (
        <div className="casino-card neon-border-gold p-4 mb-6 flex items-center justify-between">
          <span className="text-white/60 font-oswald text-sm">БАЛАНС</span>
          <span className="font-oswald text-xl font-bold neon-gold">{user.balance.toFixed(0)} ₽</span>
        </div>
      )}

      {/* Slot machine */}
      <div className="casino-card neon-border-gold p-6 mb-6">
        {/* Reels */}
        <div className="flex gap-3 justify-center mb-6">
          {spinDisplay.map((sym, i) => (
            <div
              key={i}
              className={`w-24 h-24 rounded-2xl flex items-center justify-center text-5xl transition-all
                ${spinning ? "animate-pulse" : ""}
                ${lastResult?.win ? "animate-win-flash" : ""}`}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: lastResult?.win ? "2px solid rgba(255,215,0,0.8)" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: lastResult?.win ? "0 0 20px rgba(255,215,0,0.5)" : "none",
              }}
            >
              {sym}
            </div>
          ))}
        </div>

        {/* Result */}
        {lastResult && (
          <div className={`text-center py-3 rounded-xl mb-4 font-oswald text-lg font-bold animate-fade-in-up
            ${lastResult.win ? "text-yellow-400 bg-yellow-500/10 border border-yellow-500/30" : "text-red-400 bg-red-500/10 border border-red-500/20"}`}>
            {lastResult.win ? `🏆 ${lastResult.message} +${lastResult.amount} ₽` : `😔 ${lastResult.message}`}
          </div>
        )}

        {/* Payout table */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Object.entries(PAYOUTS).map(([sym, mult]) => (
            <div key={sym} className="casino-card2 p-2 text-center">
              <div className="text-2xl">{sym}</div>
              <div className="text-xs font-oswald text-yellow-400">x{mult}</div>
            </div>
          ))}
        </div>

        {/* Bet selector */}
        <div className="mb-4">
          <div className="text-xs text-white/40 font-oswald mb-2">СТАВКА</div>
          <div className="flex flex-wrap gap-2">
            {betOptions.map(b => (
              <button
                key={b}
                onClick={() => setBet(b)}
                className={`px-3 py-1.5 rounded-lg font-oswald text-sm transition-all ${
                  bet === b ? "btn-neon-gold" : "btn-ghost-white"
                }`}
              >
                {b} ₽
              </button>
            ))}
          </div>
        </div>

        {/* Spin */}
        <button
          onClick={spin}
          disabled={spinning || !user}
          className="btn-neon-gold w-full py-4 text-xl font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {spinning ? (
            <span className="flex items-center justify-center gap-2">
              <Icon name="Loader2" size={20} className="animate-spin" /> КРУТИМ...
            </span>
          ) : (
            `🎰 КРУТИТЬ — ${bet} ₽`
          )}
        </button>

        {!user && (
          <p className="text-center text-white/40 text-sm mt-3">
            <button onClick={() => navigate("home")} className="text-yellow-400 hover:underline">Войди</button> чтобы играть
          </p>
        )}
      </div>
    </div>
  );
}
