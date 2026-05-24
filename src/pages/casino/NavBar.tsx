import { User } from "@/App";
import Icon from "@/components/ui/icon";
import { useState } from "react";

interface NavBarProps {
  user: User | null;
  currentPage: string;
  navigate: (p: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

const navItems = [
  { id: "home", label: "ГЛАВНАЯ", icon: "Home" },
  { id: "slots", label: "СЛОТЫ", icon: "Slot" },
  { id: "dice", label: "КОСТИ", icon: "Dices" },
  { id: "aviator", label: "АВИАТРИКС", icon: "Plane" },
  { id: "bonus", label: "БОНУСЫ", icon: "Gift" },
];

const SUPPORT_URL = "https://t.me/Magiscesh";

export default function NavBar({ user, currentPage, navigate, onLogin, onRegister, onLogout }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 border-b border-white/5" style={{ background: "rgba(8,8,16,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <button onClick={() => navigate("home")} className="flex items-center gap-2 group">
          <span className="text-2xl font-oswald font-bold neon-gold animate-neon-pulse">⭐ MAGISCESH</span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`nav-item px-3 py-2 rounded-lg flex items-center gap-1.5 ${currentPage === item.id ? "active bg-white/5" : ""}`}
            >
              <Icon name={item.icon} fallback="Star" size={14} />
              {item.label}
            </button>
          ))}
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item px-3 py-2 rounded-lg flex items-center gap-1.5"
            style={{ color: "#00FF88" }}
          >
            <Icon name="Headphones" size={14} />
            ПОДДЕРЖКА
          </a>
          <button
            onClick={() => navigate("admin")}
            className={`nav-item px-3 py-2 rounded-lg flex items-center gap-1.5 ${currentPage === "admin" ? "active bg-white/5" : ""}`}
            style={{ color: currentPage === "admin" ? "#FFD700" : "rgba(255,255,255,0.3)" }}
            title="Панель администратора"
          >
            <Icon name="Settings2" size={14} />
            ADMIN
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Balance pill — всегда видна */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-oswald"
                style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)" }}>
                <Icon name="Wallet" size={14} className="text-yellow-400" />
                <span className="text-sm font-bold neon-gold">{user.balance.toFixed(0)} ₽</span>
              </div>
              {/* Пополнить */}
              <button
                onClick={() => navigate("deposit")}
                className="btn-neon-gold px-3 py-1.5 text-sm font-oswald flex items-center gap-1.5"
              >
                <Icon name="Plus" size={14} />
                <span className="hidden sm:inline">ПОПОЛНИТЬ</span>
              </button>
              {/* Вывести */}
              <button
                onClick={() => navigate("withdraw")}
                className="btn-ghost-white px-3 py-1.5 text-sm font-oswald flex items-center gap-1.5"
                style={{ border: "1px solid rgba(0,255,136,0.35)", color: "#00FF88" }}
              >
                <Icon name="ArrowDownToLine" size={14} />
                <span className="hidden sm:inline">ВЫВЕСТИ</span>
              </button>
              {/* Аватар / профиль */}
              <button
                onClick={() => navigate("profile")}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-xs font-oswald hover:scale-110 transition-all"
                title={user.login}
              >
                {user.login[0]?.toUpperCase()}
              </button>
              <button onClick={onLogout} className="btn-ghost-white p-2 hidden sm:flex" title="Выйти">
                <Icon name="LogOut" size={16} />
              </button>
            </>
          ) : (
            <>
              <button onClick={onLogin} className="btn-ghost-white px-4 py-2 text-sm hidden sm:block">
                ВОЙТИ
              </button>
              <button onClick={onRegister} className="btn-neon-gold px-4 py-2 text-sm">
                РЕГИСТРАЦИЯ
              </button>
            </>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden btn-ghost-white p-2">
            <Icon name={menuOpen ? "X" : "Menu"} size={18} />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 p-4 space-y-1 animate-fade-in-up" style={{ background: "rgba(8,8,16,0.98)" }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { navigate(item.id); setMenuOpen(false); }}
              className={`nav-item w-full text-left px-4 py-3 rounded-lg flex items-center gap-2 ${currentPage === item.id ? "active bg-white/5" : ""}`}
            >
              <Icon name={item.icon} fallback="Star" size={16} />
              {item.label}
            </button>
          ))}
          {user ? (
            <div className="pt-2 border-t border-white/5 space-y-1">
              <button onClick={() => { navigate("deposit"); setMenuOpen(false); }} className="nav-item w-full text-left px-4 py-3 rounded-lg flex items-center gap-2">
                <Icon name="Plus" size={16} /> ПОПОЛНИТЬ
              </button>
              <button onClick={() => { navigate("withdraw"); setMenuOpen(false); }} className="nav-item w-full text-left px-4 py-3 rounded-lg flex items-center gap-2">
                <Icon name="ArrowDownToLine" size={16} /> ВЫВОД
              </button>
              <button onClick={() => { navigate("history"); setMenuOpen(false); }} className="nav-item w-full text-left px-4 py-3 rounded-lg flex items-center gap-2">
                <Icon name="History" size={16} /> ИСТОРИЯ
              </button>
              <button onClick={() => { onLogout(); setMenuOpen(false); }} className="nav-item w-full text-left px-4 py-3 rounded-lg flex items-center gap-2 text-red-400">
                <Icon name="LogOut" size={16} /> ВЫЙТИ
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/5 flex gap-2">
              <button onClick={() => { onLogin(); setMenuOpen(false); }} className="btn-ghost-white flex-1 py-2 text-sm">ВОЙТИ</button>
              <button onClick={() => { onRegister(); setMenuOpen(false); }} className="btn-neon-gold flex-1 py-2 text-sm">РЕГИСТРАЦИЯ</button>
            </div>
          )}
          <div className="pt-2 border-t border-white/5 space-y-1">
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-item w-full text-left px-4 py-3 rounded-lg flex items-center gap-2"
              style={{ color: "#00FF88" }}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name="Headphones" size={16} /> ПОДДЕРЖКА
            </a>
            <button onClick={() => { navigate("admin"); setMenuOpen(false); }}
              className="nav-item w-full text-left px-4 py-3 rounded-lg flex items-center gap-2"
              style={{ color: "rgba(255,255,255,0.25)" }}>
              <Icon name="Settings2" size={16} /> ADMIN
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}