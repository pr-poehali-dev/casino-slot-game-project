import { User, Transaction } from "@/App";
import Icon from "@/components/ui/icon";

interface HomePageProps {
  user: User | null;
  navigate: (p: string) => void;
  updateBalance: (delta: number) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  onRegister: () => void;
}

const games = [
  {
    id: "slots",
    name: "СЛОТЫ",
    emoji: "🎰",
    desc: "Крути барабаны и срывай джекпот!",
    color: "neon-border-gold",
    glow: "rgba(255,215,0,0.3)",
    badge: "x500",
  },
  {
    id: "dice",
    name: "КОСТИ",
    emoji: "🎲",
    desc: "Угадай число — забери выигрыш!",
    color: "neon-border-cyan",
    glow: "rgba(0,255,255,0.3)",
    badge: "x6",
  },
  {
    id: "aviator",
    name: "АВИАТРИКС",
    emoji: "✈️",
    desc: "Лети выше — выиграй больше!",
    color: "neon-border-pink",
    glow: "rgba(255,0,128,0.3)",
    badge: "x100",
  },
];

const stats = [
  { label: "Игроков онлайн", value: "1 247", icon: "Users" },
  { label: "Выплачено сегодня", value: "₽ 487 320", icon: "TrendingUp" },
  { label: "Джекпот", value: "₽ 1 000 000", icon: "Trophy" },
];

export default function HomePage({ user, navigate, onRegister }: HomePageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      {/* Hero */}
      <div className="text-center pt-16 pb-12">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-oswald tracking-widest"
          style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700" }}>
          🔥 ЛУЧШИЕ ВЫПЛАТЫ В СЕТИ
        </div>
        <h1 className="font-oswald text-5xl md:text-7xl font-black mb-4" style={{ lineHeight: 1.1 }}>
          <span className="neon-gold">LUCKY</span>{" "}
          <span style={{ color: "#fff" }}>STAR</span>
        </h1>
        <p className="text-white/60 text-lg md:text-xl font-rubik mb-8 max-w-xl mx-auto">
          Играй. Выигрывай. Снимай деньги — реальные выплаты каждый день!
        </p>
        {!user ? (
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={onRegister} className="btn-neon-gold px-8 py-4 text-lg font-oswald">
              🎁 НАЧАТЬ БЕСПЛАТНО
            </button>
            <button onClick={() => navigate("slots")} className="btn-ghost-white px-8 py-4 text-lg font-oswald">
              ИГРАТЬ
            </button>
          </div>
        ) : (
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate("slots")} className="btn-neon-gold px-8 py-4 text-lg font-oswald">
              🎰 ИГРАТЬ СЕЙЧАС
            </button>
            <button onClick={() => navigate("deposit")} className="btn-ghost-white px-8 py-4 text-lg font-oswald">
              ПОПОЛНИТЬ БАЛАНС
            </button>
          </div>
        )}
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {stats.map((s, i) => (
          <div key={i} className="casino-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,215,0,0.15)" }}>
              <Icon name={s.icon} size={20} className="text-yellow-400" />
            </div>
            <div>
              <div className="text-xs text-white/40 font-rubik">{s.label}</div>
              <div className="font-oswald font-bold text-lg neon-gold animate-ticker">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Games */}
      <h2 className="font-oswald text-2xl font-bold text-white/80 mb-6 tracking-wide">ИГРЫ</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => navigate(g.id)}
            className={`casino-card ${g.color} p-6 text-left group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1`}
            style={{ transition: "all 0.3s" }}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-5xl">{g.emoji}</span>
              <span className="font-oswald text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>
                до {g.badge}
              </span>
            </div>
            <h3 className="font-oswald text-2xl font-bold text-white mb-2">{g.name}</h3>
            <p className="text-white/50 text-sm font-rubik mb-4">{g.desc}</p>
            <div className="flex items-center gap-2 text-yellow-400 font-oswald text-sm group-hover:gap-3 transition-all">
              ИГРАТЬ <Icon name="ArrowRight" size={16} />
            </div>
          </button>
        ))}
      </div>

      {/* Bonus banner */}
      <div className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, rgba(255,0,128,0.15), rgba(191,0,255,0.15))", border: "1px solid rgba(255,0,128,0.3)" }}>
        <div>
          <div className="font-oswald text-2xl font-bold text-white mb-1">🎁 БОНУС ПЕРВОМУ ИГРОКУ</div>
          <p className="text-white/60 font-rubik">Зарегистрируйся первым — получи <strong className="text-yellow-400">100 ₽</strong> на баланс бесплатно!</p>
        </div>
        {!user && (
          <button onClick={onRegister} className="btn-neon-pink px-8 py-3 font-oswald whitespace-nowrap">
            ПОЛУЧИТЬ БОНУС
          </button>
        )}
      </div>

      {/* How to */}
      <div className="mt-12">
        <h2 className="font-oswald text-2xl font-bold text-white/80 mb-6 tracking-wide">КАК НАЧАТЬ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Регистрация", desc: "Получи логин и пароль за 1 клик", icon: "UserPlus" },
            { step: "02", title: "Пополнение", desc: "Пополни счёт через Билайн от 100 ₽", icon: "CreditCard" },
            { step: "03", title: "Игра", desc: "Выбери слоты, кости или авиатрикс", icon: "Gamepad2" },
            { step: "04", title: "Вывод", desc: "Выводи выигрыш на свою карту или номер", icon: "Banknote" },
          ].map((item) => (
            <div key={item.step} className="casino-card p-5">
              <div className="font-oswald text-3xl font-black mb-3" style={{ color: "rgba(255,215,0,0.2)" }}>{item.step}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(255,215,0,0.1)" }}>
                <Icon name={item.icon} size={20} className="text-yellow-400" />
              </div>
              <div className="font-oswald font-bold text-white mb-1">{item.title}</div>
              <div className="text-white/50 text-sm font-rubik">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="mt-12 casino-card p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(0,255,136,0.15)" }}>
            <Icon name="Headphones" size={24} className="text-green-400" />
          </div>
          <div>
            <div className="font-oswald text-white font-bold">ПОДДЕРЖКА 24/7</div>
            <div className="text-white/50 text-sm">Ответим на любой вопрос</div>
          </div>
        </div>
        <div className="flex gap-3">
          <a href="https://t.me/luckystar_support" className="btn-neon-green px-4 py-2 text-sm flex items-center gap-2 rounded-lg font-oswald"
            style={{ background: "linear-gradient(135deg, #00FF88, #00BB66)", color: "#000", fontWeight: 700, boxShadow: "0 0 15px rgba(0,255,136,0.4)" }}>
            <Icon name="Send" size={14} /> TELEGRAM
          </a>
        </div>
      </div>
    </div>
  );
}
