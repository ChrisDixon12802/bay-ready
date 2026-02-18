import { useState, useEffect } from "react";
import { Mic } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Checklists from "./pages/Checklists";
import Tasks from "./pages/Tasks";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import VoiceAssistant from "./components/VoiceAssistant";
import WakeWordListener from "./components/WakeWordListener";
import { AppProvider, useAppContext } from "./context/AppContext";
import "./App.css";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [voiceActive, setVoiceActive] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { timeSavedToday, settings, setShopInfo } = useAppContext();

  useEffect(() => {
    const savedLogin = localStorage.getItem("bayReadyUser");
    if (savedLogin) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem("bayReadyUser", JSON.stringify(user));

    // Save shop info to localStorage
    const shopData = {
      shopName: user.shopName,
      shopLocation: user.shopLocation,
      managerName: user.managerName,
      shopPhone: user.shopPhone,
      dayOfWeek: user.dayOfWeek,
      registeredDate: user.registeredDate,
    };
    localStorage.setItem("bayReadyShopInfo", JSON.stringify(shopData));
    setShopInfo(shopData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("bayReadyUser");
    setIsLoggedIn(false);
    setVoiceActive(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const pages = {
    dashboard: <Dashboard />,
    checklists: <Checklists />,
    tasks: <Tasks />,
    orders: <Orders />,
    analytics: <Analytics />,
    settings: <Settings onLogout={handleLogout} />,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 w-full">
        <div className="w-full px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-base">
              BR
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-dark hidden sm:block">
              Bay Ready
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {settings.voiceEnabled && (
              <button
                onClick={() => setVoiceActive(!voiceActive)}
                className={`p-2 sm:p-3 rounded-lg transition active:scale-95 touch-highlight`}
                title="Voice Assistant"
              >
                <Mic
                  size={20}
                  className={voiceActive ? "text-danger" : "text-gray-600"}
                />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition active:scale-95"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-3 sm:px-4 py-4 sm:py-6 pb-24">
        {pages[currentPage]}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 w-full">
        <div className="w-full px-1 sm:px-4 flex justify-around items-center h-16 sm:h-20 overflow-x-auto">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "checklists", label: "Daily Flow" },
            { id: "tasks", label: "Tasks" },
            { id: "orders", label: "Orders" },
            { id: "analytics", label: "Analytics" },
            { id: "settings", label: "Settings" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`flex flex-col items-center justify-center py-2 px-2 sm:px-4 transition min-h-16 sm:min-h-20 touch-highlight active:bg-gray-100 ${
                currentPage === id
                  ? "text-primary font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={label}
            >
              <span className="text-xs sm:text-sm">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {voiceActive && (
        <VoiceAssistant
          isActive={voiceActive}
          onClose={() => {
            setVoiceActive(false);
            setAutoStart(false);
          }}
          autoStart={autoStart}
        />
      )}

      <WakeWordListener
        onWakeWordDetected={() => {
          setVoiceActive(true);
          setAutoStart(true);
        }}
        isVoiceAssistantOpen={voiceActive}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
