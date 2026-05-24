import { useState } from "react";
import { User } from "@/App";
import Icon from "@/components/ui/icon";

interface AuthModalProps {
  mode: "login" | "register";
  setMode: (m: "login" | "register") => void;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

function generateLogin(): string {
  const adj = ["Lucky", "Gold", "Star", "Mega", "Super", "Fire", "Ice", "Dark"];
  const noun = ["Player", "Wolf", "Fox", "Eagle", "Tiger", "Lion", "Shark", "Bear"];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return adj[Math.floor(Math.random() * adj.length)] + noun[Math.floor(Math.random() * noun.length)] + num;
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function AuthModal({ mode, setMode, onClose, onSuccess }: AuthModalProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [newCreds, setNewCreds] = useState<{ login: string; password: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    const allUsers: User[] = JSON.parse(localStorage.getItem("casino_all_users") || "[]");
    const isFirst = allUsers.length === 0;
    const genLogin = generateLogin();
    const genPass = generatePassword();
    const newUser: User = {
      id: Math.random().toString(36).slice(2),
      login: genLogin,
      password: genPass,
      balance: isFirst ? 100 : 0,
      registeredAt: new Date().toISOString(),
      bonusUsed: isFirst,
    };
    allUsers.push(newUser);
    localStorage.setItem("casino_all_users", JSON.stringify(allUsers));
    setNewCreds({ login: genLogin, password: genPass });
    if (isFirst) {
      const txs = JSON.parse(localStorage.getItem("casino_txs") || "[]");
      txs.unshift({
        id: Math.random().toString(36).slice(2),
        type: "bonus",
        amount: 100,
        date: new Date().toISOString(),
        status: "done",
        details: "Бонус первому пользователю",
      });
      localStorage.setItem("casino_txs", JSON.stringify(txs));
    }
    setTimeout(() => onSuccess(newUser), 2000);
  };

  const handleLogin = () => {
    setError("");
    const allUsers: User[] = JSON.parse(localStorage.getItem("casino_all_users") || "[]");
    const found = allUsers.find(u => u.login === login && u.password === password);
    if (!found) {
      setError("Неверный логин или пароль");
      return;
    }
    const fresh = JSON.parse(localStorage.getItem("casino_user") || "null");
    if (fresh && fresh.id === found.id) {
      onSuccess(fresh);
    } else {
      onSuccess(found);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}>
      <div className="casino-card neon-border-gold w-full max-w-md p-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-oswald font-bold neon-gold">
            {mode === "register" ? "РЕГИСТРАЦИЯ" : "ВХОД"}
          </h2>
          <button onClick={onClose} className="btn-ghost-white p-2">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Register result */}
        {newCreds ? (
          <div className="space-y-4 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-green-400 font-oswald text-lg">Аккаунт создан!</p>
            <p className="text-white/60 text-sm">Сохрани свои данные для входа:</p>
            <div className="casino-card2 p-4 space-y-3 text-left">
              <div>
                <div className="text-xs text-white/40 font-oswald mb-1">ЛОГИН</div>
                <div className="text-white font-oswald text-lg">{newCreds.login}</div>
              </div>
              <div>
                <div className="text-xs text-white/40 font-oswald mb-1">ПАРОЛЬ</div>
                <div className="text-white font-oswald text-lg">{newCreds.password}</div>
              </div>
            </div>
            <p className="text-yellow-400 text-xs">⚠️ Сохрани логин и пароль — восстановление невозможно!</p>
            <div className="text-white/50 text-sm">Вход через 2 секунды...</div>
          </div>
        ) : mode === "register" ? (
          <div className="space-y-4">
            <div className="casino-card2 p-4 rounded-xl border border-white/10">
              <p className="text-white/70 text-sm leading-relaxed">
                Нажми кнопку ниже — система автоматически создаст уникальный логин и пароль для твоего аккаунта.
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-400 text-sm font-medium">🎁 Бонус первому игроку — <strong>100 ₽</strong> на баланс!</p>
            </div>
            <button onClick={handleRegister} className="btn-neon-gold w-full py-3 text-base font-oswald">
              СОЗДАТЬ АККАУНТ
            </button>
            <p className="text-center text-white/40 text-sm">
              Уже есть аккаунт?{" "}
              <button onClick={() => setMode("login")} className="text-yellow-400 hover:underline">Войти</button>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50 font-oswald mb-1.5 block">ЛОГИН</label>
              <input
                className="casino-input"
                placeholder="Введи логин"
                value={login}
                onChange={e => setLogin(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label className="text-xs text-white/50 font-oswald mb-1.5 block">ПАРОЛЬ</label>
              <div className="relative">
                <input
                  className="casino-input pr-10"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введи пароль"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={!login || !password}
              className="btn-neon-gold w-full py-3 text-base font-oswald disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ВОЙТИ
            </button>
            <p className="text-center text-white/40 text-sm">
              Нет аккаунта?{" "}
              <button onClick={() => setMode("register")} className="text-yellow-400 hover:underline">Зарегистрироваться</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
