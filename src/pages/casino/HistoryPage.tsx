import { Transaction } from "@/App";
import Icon from "@/components/ui/icon";

interface HistoryPageProps {
  transactions: Transaction[];
  navigate: (p: string) => void;
}

const TYPE_CONFIG = {
  win: { label: "Выигрыш", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: "TrendingUp", prefix: "+" },
  loss: { label: "Проигрыш", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: "TrendingDown", prefix: "-" },
  deposit: { label: "Пополнение", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: "ArrowUpToLine", prefix: "+" },
  withdraw: { label: "Вывод", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", icon: "ArrowDownToLine", prefix: "-" },
  bonus: { label: "Бонус", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: "Gift", prefix: "+" },
};

const STATUS_LABELS = {
  pending: { label: "На проверке", color: "text-yellow-400" },
  done: { label: "Выполнено", color: "text-green-400" },
  rejected: { label: "Отклонено", color: "text-red-400" },
};

export default function HistoryPage({ transactions, navigate }: HistoryPageProps) {
  if (transactions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("profile")} className="btn-ghost-white p-2">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <h1 className="font-oswald text-3xl font-bold text-white">ИСТОРИЯ</h1>
        </div>
        <div className="casino-card p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <div className="font-oswald text-white text-xl mb-2">История пуста</div>
          <div className="text-white/40 font-rubik text-sm">Начни играть и тут появятся все твои ставки!</div>
          <button onClick={() => navigate("slots")} className="btn-neon-gold px-8 py-3 font-oswald mt-6">
            НАЧАТЬ ИГРУ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("profile")} className="btn-ghost-white p-2">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="font-oswald text-3xl font-bold text-white">ИСТОРИЯ</h1>
        <span className="ml-auto text-white/40 text-sm font-rubik">{transactions.length} операций</span>
      </div>

      <div className="space-y-2">
        {transactions.map((tx) => {
          const cfg = TYPE_CONFIG[tx.type];
          const statusCfg = STATUS_LABELS[tx.status];
          return (
            <div key={tx.id} className={`casino-card p-4 border ${cfg.bg}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} border`}>
                    <Icon name={cfg.icon} size={18} className={cfg.color} />
                  </div>
                  <div>
                    <div className="font-oswald font-bold text-white text-sm">{cfg.label}</div>
                    <div className="text-white/40 text-xs font-rubik">
                      {tx.game && <span>{tx.game} · </span>}
                      {new Date(tx.date).toLocaleString("ru-RU", {
                        day: "2-digit", month: "2-digit", year: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                    {tx.details && (
                      <div className="text-white/30 text-xs font-rubik mt-0.5">{tx.details}</div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-oswald font-bold text-lg ${cfg.color}`}>
                    {cfg.prefix}{tx.amount.toFixed(0)} ₽
                  </div>
                  <div className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
