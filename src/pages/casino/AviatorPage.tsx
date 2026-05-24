import { useState, useEffect, useRef } from "react";
import { User, Transaction } from "@/App";
import Icon from "@/components/ui/icon";

interface AviatorPageProps {
  user: User | null;
  updateBalance: (delta: number) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  navigate: (p: string) => void;
}

type GameState = "waiting" | "flying" | "crashed" | "cashed";

export default function AviatorPage({ user, updateBalance, addTransaction, navigate }: AviatorPageProps) {
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [cashOutAt, setCashOutAt] = useState<number | null>(null);
  const [result, setResult] = useState<{ win: boolean; amount: number; mult: number } | null>(null);
  const [planeX, setPlaneX] = useState(10);
  const [planeY, setPlaneY] = useState(80);
  const [autoCashout, setAutoCashout] = useState("2.0");
  const [betPlaced, setBetPlaced] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crashAtRef = useRef<number>(1);
  const tickRef = useRef(0);

  const startGame = () => {
    if (!user || user.balance < bet) return;
    updateBalance(-bet);
    setBetPlaced(true);
    setResult(null);
    setCashOutAt(null);
    setMultiplier(1.0);
    setPlaneX(10);
    setPlaneY(80);
    setGameState("flying");

    // Determine crash point: exponential distribution for casino edge
    const crashAt = Math.max(1.0, -Math.log(Math.random()) / 0.5 + 1.0);
    crashAtRef.current = parseFloat(crashAt.toFixed(2));
    tickRef.current = 0;

    intervalRef.current = setInterval(() => {
      tickRef.current += 1;
      const newMult = parseFloat((1 + tickRef.current * 0.04).toFixed(2));
      const newX = Math.min(85, 10 + tickRef.current * 2);
      const newY = Math.max(10, 80 - tickRef.current * 3);
      setMultiplier(newMult);
      setPlaneX(newX);
      setPlaneY(newY);

      // Auto cashout
      const autoCashoutNum = parseFloat(autoCashout);
      if (!isNaN(autoCashoutNum) && newMult >= autoCashoutNum && betPlaced) {
        handleCashout(newMult, bet);
        return;
      }

      if (newMult >= crashAtRef.current) {
        clearInterval(intervalRef.current!);
        setGameState("crashed");
        setBetPlaced(false);
        addTransaction({ type: "loss", amount: bet, game: "Авиатрикс", status: "done" });
        setResult({ win: false, amount: 0, mult: crashAtRef.current });
      }
    }, 100);
  };

  const handleCashout = (currentMult?: number, currentBet?: number) => {
    if (!betPlaced || gameState !== "flying") return;
    clearInterval(intervalRef.current!);
    const m = currentMult ?? multiplier;
    const b = currentBet ?? bet;
    const win = parseFloat((b * m).toFixed(2));
    updateBalance(win);
    addTransaction({ type: "win", amount: win, game: "Авиатрикс", status: "done" });
    setCashOutAt(m);
    setGameState("cashed");
    setBetPlaced(false);
    setResult({ win: true, amount: win, mult: m });
  };

  const reset = () => {
    setGameState("waiting");
    setMultiplier(1.0);
    setResult(null);
    setPlaneX(10);
    setPlaneY(80);
    setBetPlaced(false);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const betOptions = [10, 25, 50, 100, 250, 500];

  const getMultColor = () => {
    if (multiplier < 2) return "#00FFFF";
    if (multiplier < 5) return "#00FF88";
    if (multiplier < 10) return "#FFD700";
    return "#FF0080";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("home")} className="btn-ghost-white p-2">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="font-oswald text-3xl font-bold text-white">✈️ АВИАТРИКС</h1>
      </div>

      {user && (
        <div className="casino-card neon-border-pink p-4 mb-6 flex items-center justify-between">
          <span className="text-white/60 font-oswald text-sm">БАЛАНС</span>
          <span className="font-oswald text-xl font-bold neon-pink">{user.balance.toFixed(0)} ₽</span>
        </div>
      )}

      {/* Flight area */}
      <div className="casino-card neon-border-pink p-4 mb-6" style={{ minHeight: 240, position: "relative", overflow: "hidden" }}>
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(255,0,128,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,128,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Multiplier display */}
        <div className="absolute inset-0 flex items-center justify-center">
          {gameState === "flying" && (
            <div className="text-center">
              <div className="font-oswald text-6xl font-black animate-pulse" style={{ color: getMultColor(), textShadow: `0 0 30px ${getMultColor()}` }}>
                x{multiplier.toFixed(2)}
              </div>
            </div>
          )}
          {gameState === "crashed" && (
            <div className="text-center animate-fade-in-up">
              <div className="font-oswald text-5xl font-black text-red-500" style={{ textShadow: "0 0 30px rgba(255,0,0,0.8)" }}>
                💥 УЛЕТЕЛ!
              </div>
              <div className="text-red-400 font-oswald text-2xl mt-1">x{result?.mult.toFixed(2)}</div>
            </div>
          )}
          {gameState === "cashed" && (
            <div className="text-center animate-fade-in-up">
              <div className="font-oswald text-5xl font-black text-yellow-400" style={{ textShadow: "0 0 30px rgba(255,215,0,0.8)" }}>
                🏆 ЗАБРАЛ!
              </div>
              <div className="neon-gold font-oswald text-2xl mt-1">+{result?.amount.toFixed(0)} ₽</div>
            </div>
          )}
          {gameState === "waiting" && (
            <div className="text-center text-white/30 font-oswald text-xl">
              Сделай ставку и взлетай! ✈️
            </div>
          )}
        </div>

        {/* Plane */}
        {gameState === "flying" && (
          <div
            className="absolute text-3xl transition-all"
            style={{
              left: `${planeX}%`,
              top: `${planeY}%`,
              transform: "translate(-50%,-50%) rotate(-15deg)",
              filter: `drop-shadow(0 0 10px ${getMultColor()})`,
              transition: "left 0.1s linear, top 0.1s linear",
            }}
          >
            ✈️
          </div>
        )}
        {gameState === "crashed" && (
          <div className="absolute text-3xl" style={{ left: `${planeX}%`, top: `${planeY}%`, transform: "translate(-50%,-50%) rotate(90deg)" }}>
            💥
          </div>
        )}
        {gameState === "cashed" && (
          <div className="absolute text-3xl animate-float-up" style={{ left: "50%", top: "30%", transform: "translate(-50%,-50%)" }}>
            ✈️💨
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="casino-card neon-border-pink p-5 space-y-4">
        {/* Bet */}
        <div>
          <div className="text-xs text-white/40 font-oswald mb-2">СТАВКА</div>
          <div className="flex flex-wrap gap-2">
            {betOptions.map(b => (
              <button
                key={b}
                onClick={() => setBet(b)}
                disabled={gameState === "flying"}
                className={`px-3 py-1.5 rounded-lg font-oswald text-sm transition-all disabled:opacity-30 ${
                  bet === b ? "btn-neon-pink" : "btn-ghost-white"
                }`}
              >
                {b} ₽
              </button>
            ))}
          </div>
        </div>

        {/* Auto cashout */}
        <div>
          <div className="text-xs text-white/40 font-oswald mb-2">АВТО-ВЫВОД (множитель)</div>
          <input
            className="casino-input w-full max-w-xs"
            value={autoCashout}
            onChange={e => setAutoCashout(e.target.value)}
            placeholder="напр. 2.0"
            disabled={gameState === "flying"}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {gameState === "waiting" || gameState === "crashed" || gameState === "cashed" ? (
            <button
              onClick={gameState === "waiting" ? startGame : reset}
              disabled={!user}
              className="btn-neon-pink flex-1 py-4 text-xl font-oswald disabled:opacity-50"
            >
              {gameState === "waiting" ? `🚀 ВЗЛЁТ — ${bet} ₽` : "🔄 НОВАЯ ИГРА"}
            </button>
          ) : (
            <button
              onClick={() => handleCashout()}
              disabled={!betPlaced}
              className="flex-1 py-4 text-xl font-oswald rounded-lg font-bold disabled:opacity-50 transition-all"
              style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)", color: "#000", boxShadow: "0 0 20px rgba(255,215,0,0.5)" }}
            >
              💰 ЗАБРАТЬ x{multiplier.toFixed(2)} = {(bet * multiplier).toFixed(0)} ₽
            </button>
          )}
        </div>

        {!user && (
          <p className="text-center text-white/40 text-sm">
            <button onClick={() => navigate("home")} className="text-pink-400 hover:underline">Войди</button> чтобы играть
          </p>
        )}

        <div className="casino-card2 p-3 text-sm text-white/40 font-rubik text-center">
          Ставь — смотри как растёт множитель — забирай до краша. Чем дольше летишь, тем больше выигрыш!
        </div>
      </div>
    </div>
  );
}
