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

  // Только пополнения и выводы
  const moneyTxs = transactions.filter(t => t.type === "deposit" || t.type === "withdraw").slice(0, 5);

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: "Ожидает", color: "text-yellow-400" },
    done: { label: "Выполнено", color: "text-green-400" },
    rejected: { label: "Отклонено", color: "text-red-400" },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-oswald text-3xl font-bold text-white">МОЙ АККАУНТ</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate("settings")} className="btn-ghost-white px-3 py-2 text-sm flex items-center gap-1.5">
            <Icon name="Settings2" size={15} /> НАСТРОЙКИ
          </button>
          <button onClick={logout} className="btn-ghost-white px-3 py-2 text-sm flex items-center gap-2 text-red-400 border-red-500/20">
            <Icon name="LogOut" size={15} /> ВЫЙТИ
          </button>
        </div>
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

      {/* История пополнений и выводов */}
      <div className="casino-card p-5 mb-4 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="CreditCard" size={18} className="text-yellow-400" />
            <h2 className="font-oswald font-bold text-white">ПОПОЛНЕНИЯ И ВЫВОДЫ</h2>
          </div>
          <button onClick={() => navigate("history")} className="text-yellow-400 text-xs font-oswald hover:underline flex items-center gap-1">
            ВСЕ <Icon name="ArrowRight" size={12} />
          </button>
        </div>

        {moneyTxs.length === 0 ? (
          <div className="text-center py-6 text-white/30 font-rubik text-sm">
            Операций пока нет
          </div>
        ) : (
          <div className="space-y-2">
            {moneyTxs.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === "deposit" ? "bg-yellow-500/10" : "bg-cyan-500/10"
                  }`}>
                    <Icon
                      name={tx.type === "deposit" ? "ArrowUpToLine" : "ArrowDownToLine"}
                      size={14}
                      className={tx.type === "deposit" ? "text-yellow-400" : "text-cyan-400"}
                    />
                  </div>
                  <div>
                    <div className="font-oswald text-sm text-white font-bold">
                      {tx.type === "deposit" ? "Пополнение" : "Вывод"}
                    </div>
                    <div className="text-white/30 text-xs font-rubik">
                      {new Date(tx.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                      {tx.details && ` · ${tx.details}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-oswald font-bold text-sm ${tx.type === "deposit" ? "text-yellow-400" : "text-cyan-400"}`}>
                    {tx.type === "deposit" ? "+" : "-"}{tx.amount.toFixed(0)} ₽
                  </div>
                  <div className={`text-xs ${statusLabel[tx.status]?.color || "text-white/40"}`}>
                    {statusLabel[tx.status]?.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credentials reminder */}
      <div className="casino-card2 p-4 rounded-xl border border-yellow-500/20">
        <div className="flex items-start gap-3">
          <Icon name="AlertTriangle" size={18} className="text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-oswald font-bold text-yellow-400 text-sm mb-1">ДАННЫЕ ВХОДА</div>
            <div className="text-white/40 text-xs font-rubik">
              Логин: <span className="text-white/70">{user.login}</span><br />
              Пароль: <span className="text-white/70">{user.password}</span><br />
              <button onClick={() => navigate("settings")} className="text-yellow-400 hover:underline mt-1 inline-block">
                Сменить логин или пароль →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
