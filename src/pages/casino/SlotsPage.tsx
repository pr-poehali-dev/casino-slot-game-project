import { useState, useRef } from "react";
import { User, Transaction } from "@/App";
import Icon from "@/components/ui/icon";

interface SlotsPageProps {
  user: User | null;
  updateBalance: (delta: number) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  navigate: (p: string) => void;
}

type SlotGame = {
  id: string;
  name: string;
  emoji: string;
  symbols: string[];
  payouts: Record<string, number>;
  color: string;
  glowColor: string;
  reels: number;
  desc: string;
  minBet: number;
};

const SLOT_GAMES: SlotGame[] = [
  {
    id: "classic",
    name: "Классика",
    emoji: "🎰",
    desc: "3 барабана — золотая классика!",
    symbols: ["🍒", "🍋", "🍇", "7️⃣", "⭐", "💎", "🔔", "🍀"],
    payouts: { "💎": 50, "7️⃣": 30, "⭐": 15, "🔔": 10, "🍀": 8, "🍇": 6, "🍋": 4, "🍒": 3 },
    color: "neon-border-gold",
    glowColor: "rgba(255,215,0,0.4)",
    reels: 3,
    minBet: 10,
  },
  {
    id: "gems",
    name: "Самоцветы",
    emoji: "💠",
    desc: "Собери редкие камни — сорви куш!",
    symbols: ["💎", "💠", "🔵", "🟣", "🟡", "🔴", "⚡", "👑"],
    payouts: { "👑": 100, "⚡": 60, "💎": 40, "💠": 25, "🟡": 15, "🟣": 10, "🔵": 7, "🔴": 4 },
    color: "neon-border-cyan",
    glowColor: "rgba(0,255,255,0.4)",
    reels: 3,
    minBet: 25,
  },
  {
    id: "egypt",
    name: "Египет",
    emoji: "🏺",
    desc: "Тайны фараонов открывают богатства!",
    symbols: ["🏺", "🐍", "🦅", "👁️", "🌙", "☀️", "⚱️", "💛"],
    payouts: { "☀️": 80, "👁️": 50, "🦅": 30, "🌙": 20, "🐍": 12, "🏺": 8, "⚱️": 5, "💛": 3 },
    color: "neon-border-gold",
    glowColor: "rgba(255,165,0,0.4)",
    reels: 3,
    minBet: 20,
  },
  {
    id: "space",
    name: "Космос",
    emoji: "🚀",
    desc: "Лети к звёздам за мегавыигрышем!",
    symbols: ["🚀", "🛸", "🌍", "⭐", "🌠", "👽", "🔭", "🪐"],
    payouts: { "🛸": 90, "👽": 55, "🚀": 35, "🪐": 22, "🌠": 15, "🌍": 10, "🔭": 6, "⭐": 4 },
    color: "neon-border-purple",
    glowColor: "rgba(191,0,255,0.4)",
    reels: 3,
    minBet: 30,
  },
  {
    id: "jungle",
    name: "Джунгли",
    emoji: "🌿",
    desc: "Диких животных — дикие выигрыши!",
    symbols: ["🦁", "🐯", "🐘", "🦊", "🌿", "🍌", "🦜", "💰"],
    payouts: { "💰": 75, "🦁": 45, "🐯": 30, "🐘": 20, "🦊": 12, "🦜": 8, "🌿": 5, "🍌": 3 },
    color: "neon-border-green",
    glowColor: "rgba(0,255,136,0.4)",
    reels: 3,
    minBet: 15,
  },
  {
    id: "pirates",
    name: "Пираты",
    emoji: "🏴‍☠️",
    desc: "Найди сокровища пирата!",
    symbols: ["💀", "⚓", "🗺️", "🏴‍☠️", "💣", "🦜", "🥂", "💰"],
    payouts: { "💰": 70, "🏴‍☠️": 45, "💀": 28, "⚓": 18, "🗺️": 12, "🦜": 8, "💣": 5, "🥂": 3 },
    color: "neon-border-pink",
    glowColor: "rgba(255,0,128,0.4)",
    reels: 3,
    minBet: 20,
  },
];

function getRandomSymbol(symbols: string[]) {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

interface SingleSlotProps {
  game: SlotGame;
  user: User | null;
  updateBalance: (delta: number) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
}

function SingleSlot({ game, user, updateBalance, addTransaction }: SingleSlotProps) {
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(game.minBet);
  const [lastResult, setLastResult] = useState<{ win: boolean; amount: number; message: string } | null>(null);
  const [spinDisplay, setSpinDisplay] = useState(() => [
    game.symbols[0], game.symbols[1], game.symbols[2],
  ]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [expanded, setExpanded] = useState(false);

  const betOptions = [game.minBet, game.minBet * 2, game.minBet * 5, game.minBet * 10].filter(
    (v, i, arr) => arr.indexOf(v) === i
  );

  const spin = () => {
    if (!user) return;
    if (user.balance < bet) {
      setLastResult({ win: false, amount: 0, message: "Недостаточно средств!" });
      return;
    }
    setSpinning(true);
    setLastResult(null);
    updateBalance(-bet);

    let ticks = 0;
    intervalRef.current = setInterval(() => {
      setSpinDisplay([
        getRandomSymbol(game.symbols),
        getRandomSymbol(game.symbols),
        getRandomSymbol(game.symbols),
      ]);
      ticks++;
      if (ticks > 18) {
        clearInterval(intervalRef.current!);
        const roll = Math.random();
        let finalReels = [
          getRandomSymbol(game.symbols),
          getRandomSymbol(game.symbols),
          getRandomSymbol(game.symbols),
        ];
        if (roll < 0.10) {
          const sym = game.symbols[Math.floor(Math.random() * game.symbols.length)];
          finalReels = [sym, sym, sym];
        } else if (roll < 0.32) {
          const sym = game.symbols[Math.floor(Math.random() * game.symbols.length)];
          const pos = Math.floor(Math.random() * 3);
          finalReels[pos] = sym;
          finalReels[(pos + 1) % 3] = sym;
        }
        setSpinDisplay(finalReels);
        setSpinning(false);

        const allSame = finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2];
        const twoSame = finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2];
        let winAmount = 0;
        if (allSame) winAmount = bet * (game.payouts[finalReels[0]] || 5);
        else if (twoSame) winAmount = bet * 2;

        if (winAmount > 0) {
          updateBalance(winAmount);
          addTransaction({ type: "win", amount: winAmount, game: game.name, status: "done" });
          setLastResult({ win: true, amount: winAmount, message: allSame ? `ДЖЕКПОТ! ${finalReels[0]}${finalReels[0]}${finalReels[0]}` : "Два совпадения!" });
        } else {
          addTransaction({ type: "loss", amount: bet, game: game.name, status: "done" });
          setLastResult({ win: false, amount: 0, message: "Не повезло... Попробуй снова!" });
        }
      }
    }, 75);
  };

  return (
    <div className={`casino-card ${game.color} overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{game.emoji}</span>
          <div>
            <div className="font-oswald font-bold text-white text-lg">{game.name}</div>
            <div className="text-white/40 text-xs font-rubik">{game.desc}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-oswald px-2 py-1 rounded-full"
            style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>
            от {game.minBet} ₽
          </span>
          <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={18} className="text-white/40" />
        </div>
      </div>

      {/* Expanded slot */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4 animate-fade-in-up">
          {/* Reels */}
          <div className="flex gap-2 justify-center mb-4">
            {spinDisplay.map((sym, i) => (
              <div
                key={i}
                className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl ${spinning ? "animate-pulse" : ""} ${lastResult?.win ? "animate-win-flash" : ""}`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: lastResult?.win ? `2px solid ${game.glowColor}` : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: lastResult?.win ? `0 0 20px ${game.glowColor}` : "none",
                }}
              >
                {sym}
              </div>
            ))}
          </div>

          {/* Result */}
          {lastResult && (
            <div className={`text-center py-2 rounded-xl mb-3 font-oswald text-base font-bold animate-fade-in-up
              ${lastResult.win ? "text-yellow-400 bg-yellow-500/10 border border-yellow-500/30" : "text-red-400 bg-red-500/10 border border-red-500/20"}`}>
              {lastResult.win ? `🏆 ${lastResult.message} +${lastResult.amount} ₽` : `😔 ${lastResult.message}`}
            </div>
          )}

          {/* Payouts mini */}
          <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
            {Object.entries(game.payouts).slice(0, 4).map(([sym, mult]) => (
              <div key={sym} className="casino-card2 px-2 py-1 flex items-center gap-1">
                <span className="text-base">{sym}</span>
                <span className="text-xs font-oswald text-yellow-400">x{mult}</span>
              </div>
            ))}
            <div className="casino-card2 px-2 py-1 text-xs text-white/30 font-oswald flex items-center">+{Object.keys(game.payouts).length - 4} ещё</div>
          </div>

          {/* Bet */}
          <div className="flex gap-2 mb-3">
            {betOptions.map(b => (
              <button
                key={b}
                onClick={() => setBet(b)}
                className={`flex-1 py-2 rounded-lg font-oswald text-sm transition-all ${bet === b ? "btn-neon-gold" : "btn-ghost-white"}`}
              >
                {b} ₽
              </button>
            ))}
          </div>

          <button
            onClick={spin}
            disabled={spinning || !user}
            className="btn-neon-gold w-full py-3 text-base font-oswald disabled:opacity-50"
          >
            {spinning ? (
              <span className="flex items-center justify-center gap-2">
                <Icon name="Loader2" size={16} className="animate-spin" /> КРУТИМ...
              </span>
            ) : `🎰 КРУТИТЬ — ${bet} ₽`}
          </button>

          {!user && (
            <p className="text-center text-white/40 text-xs mt-2 font-rubik">Войди, чтобы играть</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SlotsPage({ user, updateBalance, addTransaction, navigate }: SlotsPageProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("home")} className="btn-ghost-white p-2">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="font-oswald text-3xl font-bold text-white">🎰 СЛОТЫ</h1>
        {user && (
          <div className="ml-auto font-oswald text-xl font-bold neon-gold">{user.balance.toFixed(0)} ₽</div>
        )}
      </div>

      <p className="text-white/40 text-sm font-rubik mb-6">
        Нажми на слот чтобы раскрыть и начать игру. Нажми ещё раз — свернуть.
      </p>

      <div className="space-y-3">
        {SLOT_GAMES.map(game => (
          <SingleSlot
            key={game.id}
            game={game}
            user={user}
            updateBalance={updateBalance}
            addTransaction={addTransaction}
          />
        ))}
      </div>
    </div>
  );
}
