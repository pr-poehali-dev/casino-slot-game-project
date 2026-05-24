import { User, Transaction } from "@/App";
import Icon from "@/components/ui/icon";

interface ProfilePageProps {
  user: User;
  navigate: (p: string) => void;
  logout: () => void;
  transactions: Transaction[];
}

export default function ProfilePage({ user, navigate, logout, transactions }: ProfilePageProps) {
  const wins = transactions.filter(t => t.type === "win");
  const losses = transactions.filter(t => t.type === "loss");
  const totalWon = wins.reduce((s, t) => s + t.amount, 0);
  const totalLost = losses.reduce((s, t) => s + t.amount, 0);
  const gamesPlayed = wins.length + losses.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-oswald text-3xl font-bold text-white">МОЙ АККАУНТ</h1>
        <button onClick={logout} className="btn-ghost-white px-4 py-2 text-sm flex items-center gap-2">
          <Icon name="LogOut" size={16} /> ВЫЙТИ
        </button>
      </div>

      {/* User card */}
      <div className="casino-card neon-border-gold p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-black text-2xl font-oswald">
            {user.login[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-oswald text-xl font-bold text-white">{user.login}</div>
            <div className="text-white/40 text-xs font-rubik">
              Зарегистрирован {new Date(user.registeredAt).toLocaleDateString("ru-RU")}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-4">
          <div className="text-xs text-white/40 font-oswald mb-1">БАЛАНС</div>
          <div className="font-oswald text-4xl font-black neon-gold">{user.balance.toFixed(0)} ₽</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Игр сыграно", value: gamesPlayed, icon: "Gamepad2", color: "text-white" },
          { label: "Выиграно", value: `${totalWon.toFixed(0)} ₽`, icon: "TrendingUp", color: "text-green-400" },
          { label: "Проиграно", value: `${totalLost.toFixed(0)} ₽`, icon: "TrendingDown", color: "text-red-400" },
          { label: "Бонусы", value: user.bonusUsed ? "Исп." : "Есть!", icon: "Gift", color: "text-yellow-400" },
        ].map((s, i) => (
          <div key={i} className="casino-card p-4">
            <Icon name={s.icon} size={18} className={`${s.color} mb-2`} />
            <div className={`font-oswald font-bold text-lg ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs font-rubik">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => navigate("deposit")} className="casino-card neon-border-gold p-4 text-left hover:scale-[1.02] transition-all">
          <Icon name="Plus" size={20} className="text-yellow-400 mb-2" />
          <div className="font-oswald font-bold text-white">Пополнить</div>
          <div className="text-white/40 text-xs font-rubik">Через Билайн от 100 ₽</div>
        </button>
        <button onClick={() => navigate("withdraw")} className="casino-card neon-border-green p-4 text-left hover:scale-[1.02] transition-all">
          <Icon name="ArrowDownToLine" size={20} className="text-green-400 mb-2" />
          <div className="font-oswald font-bold text-white">Вывести</div>
          <div className="text-white/40 text-xs font-rubik">От 1000 ₽ на карту</div>
        </button>
        <button onClick={() => navigate("bonus")} className="casino-card neon-border-purple p-4 text-left hover:scale-[1.02] transition-all">
          <Icon name="Gift" size={20} className="mb-2" style={{ color: "#BF00FF" }} />
          <div className="font-oswald font-bold text-white">Бонусы</div>
          <div className="text-white/40 text-xs font-rubik">Промокоды и акции</div>
        </button>
        <button onClick={() => navigate("history")} className="casino-card p-4 text-left hover:scale-[1.02] transition-all">
          <Icon name="History" size={20} className="text-cyan-400 mb-2" />
          <div className="font-oswald font-bold text-white">История</div>
          <div className="text-white/40 text-xs font-rubik">Ставки и транзакции</div>
        </button>
      </div>

      {/* Credentials reminder */}
      <div className="casino-card2 p-4 rounded-xl border border-yellow-500/20">
        <div className="flex items-start gap-3">
          <Icon name="AlertTriangle" size={18} className="text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-oswald font-bold text-yellow-400 text-sm mb-1">СОХРАНИ ДАННЫЕ ВХОДА</div>
            <div className="text-white/40 text-xs font-rubik">
              Логин: <span className="text-white/70">{user.login}</span><br />
              Пароль: <span className="text-white/70">{user.password}</span><br />
              Восстановление невозможно — запиши и сохрани!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
