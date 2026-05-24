import { useState } from "react";
import { User, Transaction } from "@/App";
import Icon from "@/components/ui/icon";

interface DepositPageProps {
  user: User;
  saveUser: (u: User) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => Transaction;
  navigate: (p: string) => void;
}

const BEELINE_NUMBER = "8 (962) 903-15-56";
const AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

type Step = "amount" | "details" | "pending";

export default function DepositPage({ user, addTransaction, navigate }: DepositPageProps) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number | "">("");
  const [customAmount, setCustomAmount] = useState("");
  const [checked, setChecked] = useState(false);
  const [txId, setTxId] = useState("");

  const selectedAmount = amount !== "" ? amount : parseInt(customAmount) || 0;

  const handleAmountSelect = (a: number) => {
    setAmount(a);
    setCustomAmount("");
  };

  const handleContinue = () => {
    if (selectedAmount < 100) return;
    const tx = addTransaction({
      type: "deposit",
      amount: selectedAmount,
      status: "pending",
      details: `Пополнение через Билайн ${BEELINE_NUMBER}`,
    });
    setTxId(tx.id);
    setStep("details");
  };

  const handleCheck = () => {
    setChecked(true);
    setStep("pending");
  };

  if (step === "pending") {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("profile")} className="btn-ghost-white p-2">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <h1 className="font-oswald text-3xl font-bold text-white">ПОПОЛНЕНИЕ</h1>
        </div>
        <div className="casino-card neon-border-gold p-8 text-center space-y-4">
          <div className="text-5xl mb-2">⏳</div>
          <h2 className="font-oswald text-2xl font-bold text-white">Заявка отправлена!</h2>
          <p className="text-white/60 font-rubik">
            Мы проверяем перевод на сумму <strong className="text-yellow-400">{selectedAmount} ₽</strong>.<br />
            Как только подтвердим — средства зачислятся на баланс.
          </p>
          <div className="casino-card2 p-3 rounded-xl text-xs text-white/40 font-rubik">
            ID заявки: <span className="text-white/60 font-mono">{txId}</span>
          </div>
          <button onClick={() => navigate("home")} className="btn-neon-gold w-full py-3 font-oswald mt-4">
            НА ГЛАВНУЮ
          </button>
        </div>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setStep("amount")} className="btn-ghost-white p-2">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <h1 className="font-oswald text-3xl font-bold text-white">РЕКВИЗИТЫ</h1>
        </div>

        <div className="casino-card neon-border-gold p-6 space-y-5 animate-fade-in-up">
          <div className="text-center">
            <div className="text-4xl mb-2">📱</div>
            <h2 className="font-oswald text-xl font-bold text-white">Переведи через Билайн</h2>
            <p className="text-white/50 text-sm font-rubik mt-1">Отправь указанную сумму на номер</p>
          </div>

          <div className="rounded-2xl p-5 text-center"
            style={{ background: "rgba(255,215,0,0.08)", border: "2px solid rgba(255,215,0,0.4)" }}>
            <div className="text-xs text-white/40 font-oswald mb-2">НОМЕР БИЛАЙН</div>
            <div className="font-oswald text-3xl font-black neon-gold">{BEELINE_NUMBER}</div>
          </div>

          <div className="casino-card2 p-4 flex items-center justify-between rounded-xl">
            <span className="text-white/60 font-oswald text-sm">СУММА ПЕРЕВОДА</span>
            <span className="font-oswald text-xl font-bold text-white">{selectedAmount} ₽</span>
          </div>

          <div className="space-y-2 text-sm text-white/60 font-rubik">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">•</span>
              <span>Используй приложение Мой Билайн или позвони на 0880</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">•</span>
              <span>Переведи ровно <strong className="text-white">{selectedAmount} ₽</strong> — другие суммы не принимаются</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">•</span>
              <span>После перевода нажми кнопку «Проверить»</span>
            </div>
          </div>

          <button onClick={handleCheck} className="btn-neon-gold w-full py-4 text-lg font-oswald flex items-center justify-center gap-2">
            <Icon name="CheckCircle" size={20} /> ПРОВЕРИТЬ ПЕРЕВОД
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
        <h1 className="font-oswald text-3xl font-bold text-white">ПОПОЛНЕНИЕ</h1>
      </div>

      {/* Balance */}
      <div className="casino-card neon-border-gold p-4 mb-6 flex items-center justify-between">
        <span className="text-white/60 font-oswald text-sm">ТЕКУЩИЙ БАЛАНС</span>
        <span className="font-oswald text-xl font-bold neon-gold">{user.balance.toFixed(0)} ₽</span>
      </div>

      <div className="casino-card neon-border-gold p-6 space-y-5 animate-fade-in-up">
        <h2 className="font-oswald text-xl font-bold text-white">Выбери сумму</h2>
        <div className="grid grid-cols-3 gap-2">
          {AMOUNTS.map(a => (
            <button
              key={a}
              onClick={() => handleAmountSelect(a)}
              className={`py-3 rounded-xl font-oswald font-bold text-sm transition-all ${
                amount === a ? "btn-neon-gold" : "btn-ghost-white"
              }`}
            >
              {a} ₽
            </button>
          ))}
        </div>

        <div>
          <div className="text-xs text-white/40 font-oswald mb-2">ИЛИ ВВЕДИ СВОЮ СУММУ (мин. 100 ₽)</div>
          <input
            className="casino-input"
            type="number"
            min="100"
            placeholder="Введи сумму..."
            value={customAmount}
            onChange={e => { setCustomAmount(e.target.value); setAmount(""); }}
          />
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-2 text-sm text-yellow-400">
          <Icon name="Info" size={16} />
          Минимальная сумма пополнения — 100 ₽
        </div>

        <button
          onClick={handleContinue}
          disabled={selectedAmount < 100}
          className="btn-neon-gold w-full py-4 text-lg font-oswald disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ПОЛУЧИТЬ РЕКВИЗИТЫ →
        </button>
      </div>
    </div>
  );
}
