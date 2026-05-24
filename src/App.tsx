import { useState, useEffect } from "react";
import HomePage from "./pages/casino/HomePage";
import SlotsPage from "./pages/casino/SlotsPage";
import DicePage from "./pages/casino/DicePage";
import AviatorPage from "./pages/casino/AviatorPage";
import ProfilePage from "./pages/casino/ProfilePage";
import DepositPage from "./pages/casino/DepositPage";
import WithdrawPage from "./pages/casino/WithdrawPage";
import BonusPage from "./pages/casino/BonusPage";
import HistoryPage from "./pages/casino/HistoryPage";
import AuthModal from "./pages/casino/AuthModal";
import NavBar from "./pages/casino/NavBar";
import AdminPage from "./pages/casino/AdminPage";

export type User = {
  id: string;
  login: string;
  password: string;
  balance: number;
  registeredAt: string;
  bonusUsed: boolean;
};

export type Transaction = {
  id: string;
  type: "win" | "loss" | "deposit" | "withdraw" | "bonus";
  amount: number;
  game?: string;
  date: string;
  status: "pending" | "done" | "rejected";
  details?: string;
};

export default function App() {
  const [page, setPage] = useState<string>("home");
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("casino_user");
    if (saved) setUser(JSON.parse(saved));
    const savedTx = localStorage.getItem("casino_txs");
    if (savedTx) setTransactions(JSON.parse(savedTx));
  }, []);

  const saveUser = (u: User) => {
    setUser(u);
    localStorage.setItem("casino_user", JSON.stringify(u));
  };

  const addTransaction = (tx: Omit<Transaction, "id" | "date">) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).slice(2),
      date: new Date().toISOString(),
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      localStorage.setItem("casino_txs", JSON.stringify(updated));
      return updated;
    });
    return newTx;
  };

  const updateBalance = (delta: number) => {
    if (!user) return;
    const updated = { ...user, balance: Math.max(0, user.balance + delta) };
    saveUser(updated);
  };

  const openRegister = () => { setAuthMode("register"); setShowAuth(true); };
  const openLogin = () => { setAuthMode("login"); setShowAuth(true); };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("casino_user");
    setPage("home");
  };

  const navigate = (p: string) => {
    if (["profile", "deposit", "withdraw", "history", "bonus"].includes(p) && !user) {
      openLogin();
      return;
    }
    setPage(p);
  };

  const commonProps = { user, updateBalance, addTransaction, navigate };

  return (
    <div className="casino-bg min-h-screen relative">
      <div className="stars">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              "--duration": `${2 + Math.random() * 4}s`,
              "--delay": `${Math.random() * 3}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <NavBar
        user={user}
        currentPage={page}
        navigate={navigate}
        onLogin={openLogin}
        onRegister={openRegister}
        onLogout={logout}
      />

      <div className="relative z-10">
        {page === "home" && <HomePage {...commonProps} onRegister={openRegister} />}
        {page === "slots" && <SlotsPage {...commonProps} />}
        {page === "dice" && <DicePage {...commonProps} />}
        {page === "aviator" && <AviatorPage {...commonProps} />}
        {page === "profile" && user && (
          <ProfilePage user={user} navigate={navigate} logout={logout} transactions={transactions} />
        )}
        {page === "deposit" && user && (
          <DepositPage user={user} saveUser={saveUser} addTransaction={addTransaction} navigate={navigate} />
        )}
        {page === "withdraw" && user && (
          <WithdrawPage user={user} saveUser={saveUser} addTransaction={addTransaction} navigate={navigate} />
        )}
        {page === "bonus" && user && (
          <BonusPage user={user} saveUser={saveUser} updateBalance={updateBalance} addTransaction={addTransaction} navigate={navigate} />
        )}
        {page === "history" && user && (
          <HistoryPage transactions={transactions} navigate={navigate} />
        )}
        {page === "admin" && (
          <AdminPage navigate={navigate} />
        )}
      </div>

      {showAuth && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setShowAuth(false)}
          onSuccess={(u) => { saveUser(u); setShowAuth(false); }}
        />
      )}
    </div>
  );
}