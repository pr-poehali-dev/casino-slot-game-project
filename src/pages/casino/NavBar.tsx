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

export default function NavBar({ user, currentPage, navigate, onLogin, onRegister, onLogout }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 border-b border-white/5" style={{ background: "rgba(8,8,16,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <button onClick={() => navigate("home")} className="flex items-center gap-2 group">
          <span className="text-2xl font-oswald font-bold neon-gold animate-neon-pulse">⭐ LUCKY STAR</span>
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
              <button
                onClick={() => navigate("deposit")}
                className="btn-neon-gold px-3 py-1.5 text-sm font-oswald hidden sm:flex items-center gap-1.5"
              >
                <Icon name="Plus" size={14} />
                ПОПОЛНИТЬ
              </button>
              <button
                onClick={() => navigate("profile")}
                className="flex items-center gap-2 casino-card px-3 py-1.5 rounded-lg hover:border-yellow-500/40 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-xs font-oswald">
                  {user.login[0]?.toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs text-white/60 font-rubik">Баланс</div>
                  <div className="text-sm font-bold neon-gold font-oswald">{user.balance.toFixed(0)} ₽</div>
                </div>
              </button>
              <button onClick={onLogout} className="btn-ghost-white p-2 hidden sm:block" title="Выйти">
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
          <div className="pt-2 border-t border-white/5">
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