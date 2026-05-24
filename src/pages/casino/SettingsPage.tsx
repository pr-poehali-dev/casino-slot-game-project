import { useState } from "react";
import { User } from "@/App";
import Icon from "@/components/ui/icon";

interface SettingsPageProps {
  user: User;
  saveUser: (u: User) => void;
  navigate: (p: string) => void;
}

export default function SettingsPage({ user, saveUser, navigate }: SettingsPageProps) {
  const [newLogin, setNewLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [passError, setPassError] = useState("");
  const [loginOk, setLoginOk] = useState(false);
  const [passOk, setPassOk] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChangeLogin = () => {
    setLoginError("");
    setLoginOk(false);
    if (!newLogin.trim()) { setLoginError("Введи новый логин"); return; }
    if (newLogin.trim().length < 4) { setLoginError("Логин должен быть не менее 4 символов"); return; }
    if (currentPassword !== user.password) { setLoginError("Неверный текущий пароль"); return; }

    // Проверяем уникальность
    const allUsers: User[] = JSON.parse(localStorage.getItem("casino_all_users") || "[]");
    if (allUsers.some(u => u.login === newLogin.trim() && u.id !== user.id)) {
      setLoginError("Этот логин уже занят");
      return;
    }

    const updated = { ...user, login: newLogin.trim() };
    // Обновляем в списке всех пользователей
    const updatedAll = allUsers.map(u => u.id === user.id ? { ...u, login: newLogin.trim() } : u);
    localStorage.setItem("casino_all_users", JSON.stringify(updatedAll));
    saveUser(updated);
    setLoginOk(true);
    setNewLogin("");
    setCurrentPassword("");
  };

  const handleChangePassword = () => {
    setPassError("");
    setPassOk(false);
    if (currentPassword !== user.password) { setPassError("Неверный текущий пароль"); return; }
    if (newPassword.length < 6) { setPassError("Новый пароль должен быть не менее 6 символов"); return; }
    if (newPassword !== confirmPassword) { setPassError("Пароли не совпадают"); return; }

    const updated = { ...user, password: newPassword };
    const allUsers: User[] = JSON.parse(localStorage.getItem("casino_all_users") || "[]");
    const updatedAll = allUsers.map(u => u.id === user.id ? { ...u, password: newPassword } : u);
    localStorage.setItem("casino_all_users", JSON.stringify(updatedAll));
    saveUser(updated);
    setPassOk(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("profile")} className="btn-ghost-white p-2">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="font-oswald text-3xl font-bold text-white">⚙️ НАСТРОЙКИ</h1>
      </div>

      {/* Текущие данные */}
      <div className="casino-card neon-border-gold p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-black text-xl font-oswald">
          {user.login[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-oswald font-bold text-white">{user.login}</div>
          <div className="text-white/40 text-xs font-rubik">ID: {user.id.slice(0, 8)}...</div>
        </div>
      </div>

      {/* Смена логина */}
      <div className="casino-card p-5 mb-4 space-y-4 border border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="User" size={18} className="text-yellow-400" />
          <h2 className="font-oswald font-bold text-white text-lg">СМЕНИТЬ ЛОГИН</h2>
        </div>

        <div>
          <label className="text-xs text-white/40 font-oswald mb-1.5 block">ТЕКУЩИЙ ПАРОЛЬ (для подтверждения)</label>
          <div className="relative">
            <input
              className="casino-input pr-10"
              type={showCurrent ? "text" : "password"}
              placeholder="Введи текущий пароль..."
              value={currentPassword}
              onChange={e => { setCurrentPassword(e.target.value); setLoginError(""); setLoginOk(false); }}
            />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              <Icon name={showCurrent ? "EyeOff" : "Eye"} size={15} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 font-oswald mb-1.5 block">НОВЫЙ ЛОГИН</label>
          <input
            className="casino-input"
            placeholder="Введи новый логин..."
            value={newLogin}
            onChange={e => { setNewLogin(e.target.value); setLoginError(""); setLoginOk(false); }}
          />
        </div>

        {loginError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm font-rubik">
            {loginError}
          </div>
        )}
        {loginOk && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm font-rubik flex items-center gap-2">
            <Icon name="CheckCircle" size={16} /> Логин успешно изменён!
          </div>
        )}

        <button
          onClick={handleChangeLogin}
          disabled={!newLogin || !currentPassword}
          className="btn-neon-gold w-full py-3 font-oswald disabled:opacity-40 disabled:cursor-not-allowed"
        >
          СОХРАНИТЬ ЛОГИН
        </button>
      </div>

      {/* Смена пароля */}
      <div className="casino-card p-5 space-y-4 border border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Lock" size={18} className="text-cyan-400" />
          <h2 className="font-oswald font-bold text-white text-lg">СМЕНИТЬ ПАРОЛЬ</h2>
        </div>

        <div>
          <label className="text-xs text-white/40 font-oswald mb-1.5 block">ТЕКУЩИЙ ПАРОЛЬ</label>
          <div className="relative">
            <input
              className="casino-input pr-10"
              type={showCurrent ? "text" : "password"}
              placeholder="Введи текущий пароль..."
              value={currentPassword}
              onChange={e => { setCurrentPassword(e.target.value); setPassError(""); setPassOk(false); }}
            />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              <Icon name={showCurrent ? "EyeOff" : "Eye"} size={15} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 font-oswald mb-1.5 block">НОВЫЙ ПАРОЛЬ</label>
          <div className="relative">
            <input
              className="casino-input pr-10"
              type={showNew ? "text" : "password"}
              placeholder="Мин. 6 символов..."
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setPassError(""); setPassOk(false); }}
            />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              <Icon name={showNew ? "EyeOff" : "Eye"} size={15} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 font-oswald mb-1.5 block">ПОВТОРИ НОВЫЙ ПАРОЛЬ</label>
          <input
            className="casino-input"
            type="password"
            placeholder="Повтори пароль..."
            value={confirmPassword}
            onChange={e => { setConfirmPassword(e.target.value); setPassError(""); setPassOk(false); }}
          />
        </div>

        {/* Индикатор силы пароля */}
        {newPassword && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all"
                  style={{
                    background: newPassword.length >= i * 3
                      ? i <= 1 ? "#FF4444" : i <= 2 ? "#FFD700" : i <= 3 ? "#00AAFF" : "#00FF88"
                      : "rgba(255,255,255,0.1)"
                  }} />
              ))}
            </div>
            <div className="text-xs text-white/30 font-rubik">
              {newPassword.length < 6 ? "Слабый" : newPassword.length < 9 ? "Средний" : newPassword.length < 12 ? "Хороший" : "Отличный"}
            </div>
          </div>
        )}

        {passError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm font-rubik">
            {passError}
          </div>
        )}
        {passOk && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm font-rubik flex items-center gap-2">
            <Icon name="CheckCircle" size={16} /> Пароль успешно изменён!
          </div>
        )}

        <button
          onClick={handleChangePassword}
          disabled={!currentPassword || !newPassword || !confirmPassword}
          className="w-full py-3 font-oswald rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: "linear-gradient(135deg, #00FFFF, #0080FF)", color: "#000", boxShadow: "0 0 15px rgba(0,255,255,0.3)" }}
        >
          СОХРАНИТЬ ПАРОЛЬ
        </button>
      </div>

      <div className="mt-4 casino-card2 p-3 rounded-xl text-xs text-white/30 font-rubik text-center">
        ⚠️ После смены — запиши новые данные. Восстановление невозможно.
      </div>
    </div>
  );
}
