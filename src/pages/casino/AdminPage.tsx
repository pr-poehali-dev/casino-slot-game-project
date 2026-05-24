import { useState, useEffect } from "react";
import { Transaction, User } from "@/App";
import Icon from "@/components/ui/icon";

const ADMIN_PASSWORD = "2007qwerQ";

interface AdminPageProps {
  navigate: (p: string) => void;
}

type FilterType = "all" | "deposit" | "withdraw";

export default function AdminPage({ navigate }: AdminPageProps) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_auth") === "1");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [allTxs, setAllTxs] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [flash, setFlash] = useState<{ id: string; type: "ok" | "fail" } | null>(null);

  const load = () => {
    setAllTxs(JSON.parse(localStorage.getItem("casino_txs") || "[]"));
    setAllUsers(JSON.parse(localStorage.getItem("casino_all_users") || "[]"));
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  const login = () => {
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "1");
      setAuthed(true);
      setError("");
    } else {
      setError("Неверный пароль");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthed(false);
    setInput("");
  };

  const showFlash = (id: string, type: "ok" | "fail") => {
    setFlash({ id, type });
    setTimeout(() => setFlash(null), 1500);
  };

  const confirmDeposit = (tx: Transaction) => {
    // Credit user balance
    const users: User[] = JSON.parse(localStorage.getItem("casino_all_users") || "[]");
    const curUser: User | null = JSON.parse(localStorage.getItem("casino_user") || "null");

    // Update all_users list
    // We don't have userId on tx directly, so find the active session user if same tx
    // Update casino_user if it matches the session
    if (curUser) {
      const updated = { ...curUser, balance: curUser.balance + tx.amount };
      localStorage.setItem("casino_user", JSON.stringify(updated));
    }

    // Update in all_users by finding who has pending tx
    // Tag tx as done
    const txs: Transaction[] = JSON.parse(localStorage.getItem("casino_txs") || "[]");
    const newTxs = txs.map(t => t.id === tx.id ? { ...t, status: "done" as const } : t);
    localStorage.setItem("casino_txs", JSON.stringify(newTxs));
    setAllTxs(newTxs);
    showFlash(tx.id, "ok");
  };

  const confirmWithdraw = (tx: Transaction) => {
    // Balance was already deducted on submit — just mark done
    const txs: Transaction[] = JSON.parse(localStorage.getItem("casino_txs") || "[]");
    const newTxs = txs.map(t => t.id === tx.id ? { ...t, status: "done" as const } : t);
    localStorage.setItem("casino_txs", JSON.stringify(newTxs));
    setAllTxs(newTxs);
    showFlash(tx.id, "ok");
  };

  const reject = (tx: Transaction) => {
    const txs: Transaction[] = JSON.parse(localStorage.getItem("casino_txs") || "[]");

    let newTxs = txs.map(t => t.id === tx.id ? { ...t, status: "rejected" as const } : t);

    // If withdraw rejection — refund balance
    if (tx.type === "withdraw") {
      const curUser: User | null = JSON.parse(localStorage.getItem("casino_user") || "null");
      if (curUser) {
        const refunded = { ...curUser, balance: curUser.balance + tx.amount };
        localStorage.setItem("casino_user", JSON.stringify(refunded));
      }
      // Add refund tx
      const refundTx: Transaction = {
        id: Math.random().toString(36).slice(2),
        type: "deposit",
        amount: tx.amount,
        date: new Date().toISOString(),
        status: "done",
        details: `Возврат: отклонённый вывод #${tx.id.slice(0, 6)}`,
      };
      newTxs = [refundTx, ...newTxs];
    }

    localStorage.setItem("casino_txs", JSON.stringify(newTxs));
    setAllTxs(newTxs);
    showFlash(tx.id, "fail");
  };

  const pending = allTxs.filter(t => t.status === "pending" && (t.type === "deposit" || t.type === "withdraw"));
  const filtered = allTxs.filter(t => {
    if (filter === "all") return t.type === "deposit" || t.type === "withdraw";
    return t.type === filter;
  });

  const totalDeposits = allTxs.filter(t => t.type === "deposit" && t.status === "done").reduce((s, t) => s + t.amount, 0);
  const totalWithdraws = allTxs.filter(t => t.type === "withdraw" && t.status === "done").reduce((s, t) => s + t.amount, 0);
  const totalUsers = allUsers.length;

  // — Auth screen —
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="casino-card neon-border-gold w-full max-w-sm p-8 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="font-oswald text-2xl font-bold text-white">ADMIN ПАНЕЛЬ</h1>
            <p className="text-white/40 text-sm font-rubik mt-1">Только для администратора</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 font-oswald mb-1.5 block">ПАРОЛЬ</label>
              <input
                className="casino-input"
                type="password"
                placeholder="Введи пароль..."
                value={input}
                onChange={e => { setInput(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && login()}
                autoFocus
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <button onClick={login} className="btn-neon-gold w-full py-3 font-oswald">
              ВОЙТИ
            </button>
            <button onClick={() => navigate("home")} className="btn-ghost-white w-full py-3 font-oswald text-sm">
              ← НАЗАД НА САЙТ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // — Admin panel —
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-oswald text-3xl font-bold neon-gold">⚙️ ADMIN ПАНЕЛЬ</h1>
          <p className="text-white/40 text-sm font-rubik mt-0.5">Управление заявками пользователей</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("home")} className="btn-ghost-white px-4 py-2 text-sm">
            ← САЙТ
          </button>
          <button onClick={logout} className="btn-ghost-white px-4 py-2 text-sm flex items-center gap-1.5 text-red-400 border-red-500/30">
            <Icon name="LogOut" size={14} /> ВЫЙТИ
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Пользователей", value: totalUsers, icon: "Users", color: "text-white" },
          { label: "Пополнено", value: `${totalDeposits.toFixed(0)} ₽`, icon: "ArrowUpToLine", color: "text-yellow-400" },
          { label: "Выведено", value: `${totalWithdraws.toFixed(0)} ₽`, icon: "ArrowDownToLine", color: "text-cyan-400" },
          { label: "Ожидают", value: pending.length, icon: "Clock", color: pending.length > 0 ? "text-red-400 animate-neon-pulse" : "text-white" },
        ].map((s, i) => (
          <div key={i} className="casino-card p-4 border border-white/5">
            <Icon name={s.icon} size={18} className={`${s.color} mb-2`} />
            <div className={`font-oswald font-bold text-xl ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs font-rubik">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending banner */}
      {pending.length > 0 && (
        <div className="rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-in-up"
          style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)" }}>
          <Icon name="Bell" size={20} className="text-yellow-400 animate-neon-pulse shrink-0" />
          <span className="font-oswald text-yellow-400 font-bold">
            {pending.length} заявок ожидают рассмотрения!
          </span>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {(["all", "deposit", "withdraw"] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-oswald text-sm transition-all ${filter === f ? "btn-neon-gold" : "btn-ghost-white"}`}
          >
            {{ all: "ВСЕ", deposit: "ПОПОЛНЕНИЯ", withdraw: "ВЫВОДЫ" }[f]}
          </button>
        ))}
        <button onClick={load} className="btn-ghost-white px-3 py-2 ml-auto" title="Обновить">
          <Icon name="RefreshCw" size={16} />
        </button>
      </div>

      {/* Transactions list */}
      {filtered.length === 0 ? (
        <div className="casino-card p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <div className="font-oswald text-white/50 text-lg">Заявок нет</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(tx => {
            const isPending = tx.status === "pending";
            const isFlash = flash?.id === tx.id;

            return (
              <div
                key={tx.id}
                className={`casino-card p-4 transition-all duration-300 ${
                  isFlash
                    ? flash?.type === "ok"
                      ? "border-green-500/60 bg-green-500/5"
                      : "border-red-500/60 bg-red-500/5"
                    : isPending
                    ? "border-yellow-500/30 bg-yellow-500/3"
                    : "border-white/5"
                }`}
              >
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Left: type & info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === "deposit"
                        ? "bg-yellow-500/10 border border-yellow-500/30"
                        : "bg-cyan-500/10 border border-cyan-500/30"
                    }`}>
                      <Icon
                        name={tx.type === "deposit" ? "ArrowUpToLine" : "ArrowDownToLine"}
                        size={18}
                        className={tx.type === "deposit" ? "text-yellow-400" : "text-cyan-400"}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-oswald font-bold text-white">
                          {tx.type === "deposit" ? "ПОПОЛНЕНИЕ" : "ВЫВОД"} — {tx.amount} ₽
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-oswald ${
                          tx.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : tx.status === "done"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {{ pending: "⏳ ОЖИДАЕТ", done: "✅ ВЫПОЛНЕНО", rejected: "❌ ОТКЛОНЕНО" }[tx.status]}
                        </span>
                      </div>
                      <div className="text-white/40 text-xs font-rubik mt-0.5">
                        ID: {tx.id} · {new Date(tx.date).toLocaleString("ru-RU")}
                      </div>
                      {tx.details && (
                        <div className="text-white/60 text-sm font-rubik mt-1 break-all">{tx.details}</div>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  {isPending && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => tx.type === "deposit" ? confirmDeposit(tx) : confirmWithdraw(tx)}
                        className="px-4 py-2 rounded-lg font-oswald text-sm font-bold transition-all"
                        style={{ background: "linear-gradient(135deg, #00FF88, #00BB66)", color: "#000", boxShadow: "0 0 12px rgba(0,255,136,0.4)" }}
                      >
                        <Icon name="Check" size={14} className="inline mr-1" />
                        ПРИНЯТЬ
                      </button>
                      <button
                        onClick={() => reject(tx)}
                        className="px-4 py-2 rounded-lg font-oswald text-sm font-bold transition-all"
                        style={{ background: "linear-gradient(135deg, #FF4444, #CC0000)", color: "#fff", boxShadow: "0 0 12px rgba(255,68,68,0.4)" }}
                      >
                        <Icon name="X" size={14} className="inline mr-1" />
                        ОТКЛОНИТЬ
                      </button>
                    </div>
                  )}
                  {!isPending && (
                    <div className="text-right shrink-0">
                      <div className={`font-oswald text-sm ${
                        tx.status === "done" ? "text-green-400" : "text-red-400"
                      }`}>
                        {tx.status === "done" ? "✅ Обработано" : "❌ Отклонено"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Users section */}
      {allUsers.length > 0 && (
        <div className="mt-10">
          <h2 className="font-oswald text-xl font-bold text-white mb-4">👥 ПОЛЬЗОВАТЕЛИ ({allUsers.length})</h2>
          <div className="space-y-2">
            {allUsers.map(u => {
              const fresh: User | null = JSON.parse(localStorage.getItem("casino_user") || "null");
              const balance = fresh?.id === u.id ? fresh.balance : u.balance;
              return (
                <div key={u.id} className="casino-card p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold font-oswald text-sm">
                      {u.login[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-oswald text-white font-bold">{u.login}</div>
                      <div className="text-white/40 text-xs font-rubik">
                        {new Date(u.registeredAt).toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                  </div>
                  <div className="font-oswald font-bold neon-gold">{balance.toFixed(0)} ₽</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
