import { useState } from "react";
import { User, Transaction } from "@/App";
import Icon from "@/components/ui/icon";

interface WithdrawPageProps {
  user: User;
  saveUser: (u: User) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  navigate: (p: string) => void;
}

const MIN_WITHDRAW = 1000;
const MIN_DEPOSIT_FOR_WITHDRAW = 100;
const DEPOSIT_WINDOW_DAYS = 7;

const BANKS = [
  { id: "tinkoff", name: "Тинькофф", emoji: "🟡", color: "rgba(255,220,0,0.15)", border: "rgba(255,220,0,0.4)" },
  { id: "ozon", name: "Озон Банк", emoji: "🔵", color: "rgba(0,130,255,0.15)", border: "rgba(0,130,255,0.4)" },
  { id: "sber", name: "Сбербанк", emoji: "🟢", color: "rgba(0,200,100,0.15)", border: "rgba(0,200,100,0.4)" },
];

function checkRecentDeposit(): { ok: boolean; totalDeposited: number } {
  const txs: Transaction[] = JSON.parse(localStorage.getItem("casino_txs") || "[]");
  const cutoff = Date.now() - DEPOSIT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recent = txs.filter(
    t => t.type === "deposit" && t.status === "done" && new Date(t.date).getTime() >= cutoff
  );
  const total = recent.reduce((s, t) => s + t.amount, 0);
  return { ok: total >= MIN_DEPOSIT_FOR_WITHDRAW, totalDeposited: total };
}

export default function WithdrawPage({ user, saveUser, addTransaction, navigate }: WithdrawPageProps) {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [method, setMethod] = useState<"card" | "phone">("card");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [txId, setTxId] = useState("");

  const depositCheck = checkRecentDeposit();
  const amountNum = parseFloat(amount) || 0;
  const canWithdraw = user.balance >= MIN_WITHDRAW;
  const hasRecentDeposit = depositCheck.ok;

  const handleSubmit = () => {
    setError("");
    if (amountNum < MIN_WITHDRAW) {
      setError(`Минимальная сумма вывода — ${MIN_WITHDRAW} ₽`);
      return;
    }
    if (amountNum > user.balance) {
      setError("Недостаточно средств на балансе");
      return;
    }
    if (method === "card") {
      if (!selectedBank) {
        setError("Выбери банк для вывода");
        return;
      }
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setError("Введи корректный номер карты (16 цифр)");
        return;
      }
    }
    if (method === "phone" && phone.replace(/\D/g, "").length < 10) {
      setError("Введи корректный номер телефона");
      return;
    }

    const bankName = BANKS.find(b => b.id === selectedBank)?.name || "";
    const details = method === "card"
      ? `Карта ${bankName}: ${cardNumber}`
      : `Телефон: ${phone}`;

    const tx = addTransaction({
      type: "withdraw",
      amount: amountNum,
      status: "pending",
      details,
    });
    setTxId(tx.id);
    saveUser({ ...user, balance: user.balance - amountNum });
    setSubmitted(true);
  };

  const formatCard = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="casino-card neon-border-green p-8 text-center space-y-4">
          <div className="text-5xl">🏦</div>
          <h2 className="font-oswald text-2xl font-bold text-white">Заявка на вывод принята!</h2>
          <p className="text-white/60 font-rubik">
            Сумма <strong className="text-green-400">{amountNum} ₽</strong> будет переведена после подтверждения администратором.
          </p>
          <div className="casino-card2 p-3 text-xs text-white/40 font-rubik">
            ID заявки: <span className="text-white/60 font-mono">{txId}</span>
          </div>
          <p className="text-white/40 text-sm">Обычно вывод занимает до 24 часов</p>
          <button onClick={() => navigate("home")} className="btn-neon-gold w-full py-3 font-oswald">
            НА ГЛАВНУЮ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("profile")} className="btn-ghost-white p-2">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="font-oswald text-3xl font-bold text-white">ВЫВОД СРЕДСТВ</h1>
      </div>

      <div className="casino-card neon-border-green p-4 mb-6 flex items-center justify-between">
        <span className="text-white/60 font-oswald text-sm">ДОСТУПНО К ВЫВОДУ</span>
        <span className="font-oswald text-xl font-bold neon-green">{user.balance.toFixed(0)} ₽</span>
      </div>

      {!canWithdraw ? (
        <div className="casino-card neon-border-green p-6 text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h2 className="font-oswald text-xl font-bold text-white">Минимум для вывода — {MIN_WITHDRAW} ₽</h2>
          <p className="text-white/50 font-rubik">
            На твоём балансе <strong className="text-white">{user.balance.toFixed(0)} ₽</strong>.<br />
            Пополни счёт или продолжай играть!
          </p>
          <button onClick={() => navigate("deposit")} className="btn-neon-gold w-full py-3 font-oswald">
            ПОПОЛНИТЬ БАЛАНС
          </button>
        </div>
      ) : (
        <div className="casino-card neon-border-green p-6 space-y-5 animate-fade-in-up">

          {/* Предупреждение о пополнении */}
          {!hasRecentDeposit ? (
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.35)" }}>
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">⚠️</div>
                <div>
                  <div className="font-oswald font-bold text-red-400 text-base mb-1">ВЫВОД МОЖЕТ БЫТЬ ОТКЛОНЁН</div>
                  <p className="text-white/60 font-rubik text-sm leading-relaxed">
                    Необходимо пополнение от <strong className="text-white">{MIN_DEPOSIT_FOR_WITHDRAW} ₽</strong> за последние <strong className="text-white">{DEPOSIT_WINDOW_DAYS} дней</strong>.
                  </p>
                  <p className="text-white/40 font-rubik text-xs mt-1.5">
                    Твоё пополнение за 7 дней: <span className="text-red-400 font-bold">{depositCheck.totalDeposited} ₽</span>
                  </p>
                </div>
              </div>
              <button onClick={() => navigate("deposit")} className="w-full py-2.5 rounded-xl font-oswald text-sm font-bold transition-all"
                style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)", color: "#000" }}>
                ПОПОЛНИТЬ СЕЙЧАС →
              </button>
            </div>
          ) : (
            <div className="rounded-xl p-3 flex items-center gap-2"
              style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.25)" }}>
              <Icon name="CheckCircle" size={16} className="text-green-400 shrink-0" />
              <span className="text-green-400 text-sm font-rubik">
                Пополнение за 7 дней: <strong>{depositCheck.totalDeposited} ₽</strong> — условие выполнено ✓
              </span>
            </div>
          )}

          {/* Способ вывода */}
          <div>
            <div className="text-xs text-white/40 font-oswald mb-2">СПОСОБ ВЫВОДА</div>
            <div className="flex gap-2">
              <button
                onClick={() => setMethod("card")}
                className={`flex-1 py-3 rounded-xl font-oswald text-sm transition-all ${method === "card" ? "btn-neon-green" : "btn-ghost-white"}`}
              >
                💳 НА КАРТУ
              </button>
              <button
                onClick={() => setMethod("phone")}
                className={`flex-1 py-3 rounded-xl font-oswald text-sm transition-all ${method === "phone" ? "btn-neon-green" : "btn-ghost-white"}`}
              >
                📱 НА ТЕЛЕФОН
              </button>
            </div>
          </div>

          {/* Выбор банка (только для карты) */}
          {method === "card" && (
            <div>
              <div className="text-xs text-white/40 font-oswald mb-2">БАНК</div>
              <div className="grid grid-cols-3 gap-2">
                {BANKS.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className="py-3 rounded-xl font-oswald text-sm transition-all flex flex-col items-center gap-1"
                    style={{
                      background: selectedBank === bank.id ? bank.color : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${selectedBank === bank.id ? bank.border : "rgba(255,255,255,0.08)"}`,
                      boxShadow: selectedBank === bank.id ? `0 0 12px ${bank.border}` : "none",
                    }}
                  >
                    <span className="text-xl">{bank.emoji}</span>
                    <span className="text-xs text-white/80">{bank.name}</span>
                    {selectedBank === bank.id && (
                      <Icon name="CheckCircle" size={12} className="text-green-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Реквизиты */}
          {method === "card" ? (
            <div>
              <label className="text-xs text-white/40 font-oswald mb-2 block">НОМЕР КАРТЫ</label>
              <input
                className="casino-input"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={e => setCardNumber(formatCard(e.target.value))}
                maxLength={19}
              />
            </div>
          ) : (
            <div>
              <label className="text-xs text-white/40 font-oswald mb-2 block">НОМЕР ТЕЛЕФОНА</label>
              <input
                className="casino-input"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          )}

          {/* Сумма */}
          <div>
            <label className="text-xs text-white/40 font-oswald mb-2 block">СУММА ВЫВОДА (мин. {MIN_WITHDRAW} ₽)</label>
            <input
              className="casino-input"
              type="number"
              placeholder={`От ${MIN_WITHDRAW} ₽`}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm font-rubik">
              {error}
            </div>
          )}

          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 text-sm text-white/50 font-rubik">
            <Icon name="Info" size={14} className="inline mr-1 text-green-400" />
            Заявки обрабатываются администратором в течение 24 часов
          </div>

          <button
            onClick={handleSubmit}
            disabled={!amount || amountNum < MIN_WITHDRAW || !hasRecentDeposit}
            className="w-full py-4 text-lg font-oswald rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: "linear-gradient(135deg, #00FF88, #00BB66)", color: "#000", boxShadow: "0 0 20px rgba(0,255,136,0.3)" }}
          >
            ПОДАТЬ ЗАЯВКУ НА ВЫВОД
          </button>
          {!hasRecentDeposit && (
            <p className="text-center text-red-400/70 text-xs font-rubik">
              Заявка будет отклонена без пополнения 100 ₽+ за 7 дней
            </p>
          )}
        </div>
      )}
    </div>
  );
}
