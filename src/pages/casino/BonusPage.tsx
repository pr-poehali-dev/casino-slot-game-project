import { useState } from "react";
import { User, Transaction } from "@/App";
import Icon from "@/components/ui/icon";

interface BonusPageProps {
  user: User;
  saveUser: (u: User) => void;
  updateBalance: (delta: number) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  navigate: (p: string) => void;
}

const bonuses = [
  {
    id: "first",
    title: "Бонус первого игрока",
    desc: "100 ₽ бесплатно для первого зарегистрированного игрока",
    amount: 100,
    icon: "🥇",
    condition: "first",
  },
  {
    id: "deposit100",
    title: "+20% к пополнению",
    desc: "При пополнении от 1000 ₽ получи +20% бонусных средств",
    amount: 0,
    icon: "💰",
    condition: "deposit",
  },
  {
    id: "daily",
    title: "Ежедневный бонус",
    desc: "Заходи каждый день и получай 50 ₽ на баланс",
    amount: 50,
    icon: "📅",
    condition: "daily",
  },
  {
    id: "promo",
    title: "Промокод",
    desc: "Введи промокод и получи бонус",
    amount: 0,
    icon: "🎟️",
    condition: "promo",
  },
];

const PROMO_CODES: Record<string, number> = {
  "LUCKY100": 100,
  "BONUS50": 50,
  "STAR200": 200,
  "WELCOME": 150,
};

export default function BonusPage({ user, saveUser, updateBalance, addTransaction, navigate }: BonusPageProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [dailyClaimed, setDailyClaimed] = useState(() => {
    const last = localStorage.getItem(`daily_${user.id}`);
    if (!last) return false;
    const lastDate = new Date(last).toDateString();
    return lastDate === new Date().toDateString();
  });

  const usedPromos: string[] = JSON.parse(localStorage.getItem(`promos_${user.id}`) || "[]");

  const claimDaily = () => {
    updateBalance(50);
    addTransaction({ type: "bonus", amount: 50, status: "done", details: "Ежедневный бонус" });
    localStorage.setItem(`daily_${user.id}`, new Date().toISOString());
    setDailyClaimed(true);
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    if (usedPromos.includes(code)) {
      setPromoResult({ ok: false, msg: "Этот промокод уже использован" });
      return;
    }
    const reward = PROMO_CODES[code];
    if (!reward) {
      setPromoResult({ ok: false, msg: "Промокод не найден" });
      return;
    }
    updateBalance(reward);
    addTransaction({ type: "bonus", amount: reward, status: "done", details: `Промокод ${code}` });
    const updated = [...usedPromos, code];
    localStorage.setItem(`promos_${user.id}`, JSON.stringify(updated));
    setPromoResult({ ok: true, msg: `+${reward} ₽ зачислено на баланс!` });
    setPromoCode("");
  };

  const allUsersCount = JSON.parse(localStorage.getItem("casino_all_users") || "[]").length;
  const isFirstUser = allUsersCount === 1 || !user.bonusUsed;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("home")} className="btn-ghost-white p-2">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="font-oswald text-3xl font-bold text-white">🎁 БОНУСЫ</h1>
      </div>

      {/* Balance */}
      <div className="casino-card neon-border-purple p-4 mb-6 flex items-center justify-between">
        <span className="text-white/60 font-oswald text-sm">БАЛАНС</span>
        <span className="font-oswald text-xl font-bold" style={{ color: "#BF00FF", textShadow: "0 0 10px rgba(191,0,255,0.6)" }}>
          {user.balance.toFixed(0)} ₽
        </span>
      </div>

      <div className="space-y-4">
        {/* First user bonus */}
        <div className={`casino-card neon-border-purple p-5 ${!isFirstUser ? "opacity-50" : ""}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🥇</span>
              <div>
                <div className="font-oswald text-white font-bold">Бонус первого игрока</div>
                <div className="text-white/50 text-sm font-rubik mt-0.5">100 ₽ бесплатно первому зарегистрированному</div>
              </div>
            </div>
            <div className={`text-right shrink-0`}>
              {user.bonusUsed ? (
                <span className="text-green-400 text-xs font-oswald flex items-center gap-1">
                  <Icon name="Check" size={12} /> ПОЛУЧЕН
                </span>
              ) : isFirstUser ? (
                <span className="text-yellow-400 font-oswald text-sm">+100 ₽</span>
              ) : (
                <span className="text-white/30 text-xs font-oswald">ЗАНЯТ</span>
              )}
            </div>
          </div>
        </div>

        {/* Daily bonus */}
        <div className="casino-card neon-border-purple p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <div className="font-oswald text-white font-bold">Ежедневный бонус</div>
                <div className="text-white/50 text-sm font-rubik mt-0.5">Заходи каждый день — получай 50 ₽</div>
              </div>
            </div>
            <div className="shrink-0">
              {dailyClaimed ? (
                <span className="text-green-400 text-xs font-oswald flex items-center gap-1">
                  <Icon name="Check" size={12} /> ПОЛУЧЕН
                </span>
              ) : (
                <button onClick={claimDaily} className="btn-neon-gold px-4 py-2 text-sm font-oswald">
                  ЗАБРАТЬ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Promo code */}
        <div className="casino-card neon-border-purple p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎟️</span>
            <div>
              <div className="font-oswald text-white font-bold">Промокод</div>
              <div className="text-white/50 text-sm font-rubik">Введи промокод и получи бонус</div>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              className="casino-input flex-1"
              placeholder="Введи промокод..."
              value={promoCode}
              onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
              onKeyDown={e => e.key === "Enter" && applyPromo()}
            />
            <button onClick={applyPromo} disabled={!promoCode} className="btn-neon-gold px-5 py-2 font-oswald disabled:opacity-40">
              OK
            </button>
          </div>
          {promoResult && (
            <div className={`mt-3 p-3 rounded-xl text-sm font-rubik ${
              promoResult.ok ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}>
              {promoResult.ok ? "✅ " : "❌ "}{promoResult.msg}
            </div>
          )}
        </div>

        {/* Deposit bonus info */}
        <div className="casino-card neon-border-purple p-5">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <div className="font-oswald text-white font-bold">+20% к пополнению</div>
              <div className="text-white/50 text-sm font-rubik mt-0.5">
                При пополнении от 1000 ₽ — получи +20% бонусных средств. Активируется автоматически!
              </div>
              <button onClick={() => navigate("deposit")} className="mt-3 text-yellow-400 text-sm font-oswald flex items-center gap-1 hover:underline">
                ПОПОЛНИТЬ <Icon name="ArrowRight" size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
