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

export default function WithdrawPage({ user, saveUser, addTransaction, navigate }: WithdrawPageProps) {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [method, setMethod] = useState<"card" | "phone">("card");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [txId, setTxId] = useState("");

  const amountNum = parseFloat(amount) || 0;
  const canWithdraw = user.balance >= MIN_WITHDRAW;

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
    if (method === "card" && cardNumber.replace(/\s/g, "").length < 16) {
      setError("Введи корректный номер карты (16 цифр)");
      return;
    }
    if (method === "phone" && phone.replace(/\D/g, "").length < 10) {
      setError("Введи корректный номер телефона");
      return;
    }

    const tx = addTransaction({
      type: "withdraw",
      amount: amountNum,
      status: "pending",
      details: method === "card" ? `Карта: ${cardNumber}` : `Телефон: ${phone}`,
    });
    setTxId(tx.id);

    // Deduct from balance immediately
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

      {/* Balance */}
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
          {/* Method */}
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

          {/* Requisites */}
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

          {/* Amount */}
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
            disabled={!amount || amountNum < MIN_WITHDRAW}
            className="btn-neon-green w-full py-4 text-lg font-oswald disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #00FF88, #00BB66)", color: "#000" }}
          >
            ПОДАТЬ ЗАЯВКУ НА ВЫВОД
          </button>
        </div>
      )}
    </div>
  );
}
