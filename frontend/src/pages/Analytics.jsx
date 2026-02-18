import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Lock,
  ListTodo,
  Package,
  Zap,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function Analytics() {
  const { timeSavedToday, resetTimeSaved, tasks, orders, checklists } =
    useAppContext();
  const [dailyData, setDailyData] = useState([]);
  const [totalTimeSaved, setTotalTimeSaved] = useState(0);
  const [averageTimeSaved, setAverageTimeSaved] = useState(0);
  const [daysTracked, setDaysTracked] = useState(0);
  const [bestDay, setBestDay] = useState(null);
  const [selectedRange, setSelectedRange] = useState("30d");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const ANALYTICS_PASSWORD_HASH_KEY = "bayReadyAnalyticsPasswordHash";
  const ANALYTICS_UNLOCKED_KEY = "bayReadyAnalyticsUnlocked";

  const hashPassword = async (value) => {
    if (!window.crypto?.subtle) {
      return btoa(value);
    }

    const data = new TextEncoder().encode(value);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  useEffect(() => {
    const savedHash = localStorage.getItem(ANALYTICS_PASSWORD_HASH_KEY);
    const unlockedThisSession = sessionStorage.getItem(ANALYTICS_UNLOCKED_KEY);

    setIsSetupMode(!savedHash);
    setIsUnlocked(unlockedThisSession === "true");
  }, []);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem(ANALYTICS_UNLOCKED_KEY);
      setIsUnlocked(false);
    };
  }, []);

  useEffect(() => {
    // Load all historical data from localStorage
    const allKeys = Object.keys(localStorage);
    const datePattern = /^bayReadyData_(\d{4}-\d{2}-\d{2})$/;
    const dailyDataArray = [];
    let total = 0;
    let maxDay = null;
    let maxTime = 0;

    // Get today's data (only count if time has actually been saved)
    const saved = localStorage.getItem("bayReadyData");
    if (saved) {
      const data = JSON.parse(saved);
      const todayTimeSaved = data.timeSavedToday || 0;

      if (todayTimeSaved > 0) {
        const today = new Date().toISOString().split("T")[0];
        dailyDataArray.push({
          date: today,
          timeSaved: todayTimeSaved,
          dayName: new Date().toLocaleDateString("en-US", {
            weekday: "long",
          }),
        });
        total += todayTimeSaved;
      }
    }

    // Get historical data (if stored separately)
    for (const key of allKeys) {
      const match = key.match(datePattern);
      if (match) {
        const dateStr = match[1];
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          const timeSaved = parsed.timeSavedToday || 0;
          dailyDataArray.push({
            date: dateStr,
            timeSaved: timeSaved,
            dayName: new Date(dateStr).toLocaleDateString("en-US", {
              weekday: "short",
            }),
          });
          total += timeSaved;

          if (timeSaved > maxTime) {
            maxTime = timeSaved;
            maxDay = {
              date: dateStr,
              timeSaved: timeSaved,
            };
          }
        }
      }
    }

    // Sort by date
    dailyDataArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate stats
    const avg =
      dailyDataArray.length > 0 ? Math.round(total / dailyDataArray.length) : 0;

    setDailyData(dailyDataArray);
    setTotalTimeSaved(total);
    setAverageTimeSaved(avg);
    setDaysTracked(dailyDataArray.length);
    setBestDay(maxDay);
  }, [timeSavedToday]);

  const getDaysWithoutProgress = () => {
    // Days where time saved was 0
    return dailyData.filter((day) => day.timeSaved === 0).length;
  };

  const getTopDays = () => {
    return [...dailyData].sort((a, b) => b.timeSaved - a.timeSaved).slice(0, 5);
  };

  const getFilteredData = () => {
    if (selectedRange === "all") {
      return dailyData;
    }

    const daysBack = selectedRange === "7d" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (daysBack - 1));

    return dailyData.filter((day) => new Date(day.date) >= cutoff);
  };

  const filteredData = getFilteredData();
  const filteredTotalTimeSaved = filteredData.reduce(
    (total, day) => total + day.timeSaved,
    0,
  );
  const filteredAverageTimeSaved =
    filteredData.length > 0
      ? Math.round(filteredTotalTimeSaved / filteredData.length)
      : 0;
  const filteredDaysTracked = filteredData.length;
  const filteredBestDay =
    filteredData.length > 0
      ? [...filteredData].sort((a, b) => b.timeSaved - a.timeSaved)[0]
      : null;
  const filteredDaysWithoutProgress = filteredData.filter(
    (day) => day.timeSaved === 0,
  ).length;

  const getCurrentStreak = () => {
    if (dailyData.length === 0) {
      return 0;
    }

    const sortedData = [...dailyData].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    let streak = 0;

    for (const day of sortedData) {
      if (day.timeSaved > 0) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = getCurrentStreak();

  const handleResetAnalytics = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all analytics data? This cannot be undone.",
      )
    ) {
      // Remove all analytics-related data from localStorage
      localStorage.removeItem("bayReadyData");

      // Remove all historical daily data
      const allKeys = Object.keys(localStorage);
      const keysToRemove = allKeys.filter(
        (key) => key.startsWith("bayReadyData_") || key === "bayReadyAnalytics",
      );
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      console.log("Analytics data cleared");

      // Reset state immediately (don't reload - this keeps state changes)
      setDailyData([]);
      setTotalTimeSaved(0);
      setAverageTimeSaved(0);
      setDaysTracked(0);
      setBestDay(null);

      // Also reset today's time
      resetTimeSaved();
    }
  };

  const handleSetAnalyticsPassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!password || !confirmPassword) {
      setPasswordError("Enter and confirm your analytics password.");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    const hashed = await hashPassword(password);
    localStorage.setItem(ANALYTICS_PASSWORD_HASH_KEY, hashed);
    sessionStorage.setItem(ANALYTICS_UNLOCKED_KEY, "true");
    setIsSetupMode(false);
    setIsUnlocked(true);
    setPassword("");
    setConfirmPassword("");
  };

  const handleUnlockAnalytics = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!password) {
      setPasswordError("Enter your analytics password.");
      return;
    }

    const savedHash = localStorage.getItem(ANALYTICS_PASSWORD_HASH_KEY);
    const enteredHash = await hashPassword(password);

    if (!savedHash || enteredHash !== savedHash) {
      setPasswordError("Incorrect password.");
      return;
    }

    sessionStorage.setItem(ANALYTICS_UNLOCKED_KEY, "true");
    setIsUnlocked(true);
    setPassword("");
  };

  if (!isUnlocked || isSetupMode) {
    return (
      <div className="space-y-6 pb-24">
        <div className="card border-2 border-indigo-200 shadow-lg max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Lock className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark">
                {isSetupMode ? "Set Analytics Password" : "Unlock Analytics"}
              </h1>
              <p className="text-sm text-gray-600">
                Creator-only access for app diagnostics.
              </p>
            </div>
          </div>

          <form
            onSubmit={
              isSetupMode ? handleSetAnalyticsPassword : handleUnlockAnalytics
            }
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                placeholder={
                  isSetupMode ? "Create analytics password" : "Enter password"
                }
              />
            </div>

            {isSetupMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  placeholder="Confirm analytics password"
                />
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {isSetupMode ? "Save Password" : "Unlock Analytics"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-lg">
            <BarChart3 className="text-purple-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark">Analytics</h1>
            <p className="text-sm text-gray-600">
              Track your productivity gains
            </p>
          </div>
        </div>
        <button
          onClick={handleResetAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition"
          title="Reset all analytics data"
        >
          <Trash2 size={18} />
          Reset
        </button>
      </div>

      {/* Range Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "7d", label: "Last 7 Days" },
          { key: "30d", label: "Last 30 Days" },
          { key: "all", label: "All Time" },
        ].map((range) => (
          <button
            key={range.key}
            onClick={() => setSelectedRange(range.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              selectedRange === range.key
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Time Saved */}
        <div className="card border-2 border-purple-200 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">
                Total Time Saved
              </p>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                {filteredTotalTimeSaved}
              </p>
              <p className="text-xs text-gray-500 mt-1">minutes</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Average Per Day */}
        <div className="card border-2 border-blue-200 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Avg Per Day</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {filteredAverageTimeSaved}
              </p>
              <p className="text-xs text-gray-500 mt-1">minutes</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Days Tracked */}
        <div className="card border-2 border-green-200 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">
                Days Tracked
              </p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {filteredDaysTracked}
              </p>
              <p className="text-xs text-gray-500 mt-1">total days</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Days Fallen Behind */}
        <div className="card border-2 border-red-200 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Days Behind</p>
              <p className="text-4xl font-bold text-red-600 mt-2">
                {filteredDaysWithoutProgress}
              </p>
              <p className="text-xs text-gray-500 mt-1">no progress saved</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="card border-2 border-indigo-200 shadow-lg bg-indigo-50">
        <h3 className="font-bold text-dark text-lg">Current Streak</h3>
        <p className="text-3xl font-bold text-indigo-700 mt-2">
          {currentStreak} {currentStreak === 1 ? "day" : "days"}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Consecutive tracked days with time saved above 0 minutes.
        </p>
      </div>

      {/* Best Day */}
      {filteredBestDay && (
        <div className="card border-l-4 border-yellow-500 shadow-lg bg-yellow-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">🏆</div>
            <div>
              <h3 className="font-bold text-dark text-lg">Best Day</h3>
              <p className="text-sm text-gray-600">{filteredBestDay.date}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-700 mt-2">
            {filteredBestDay.timeSaved} minutes saved
          </p>
        </div>
      )}

      {/* Top Days */}
      <div className="card border-2 border-gray-200 shadow-lg">
        <h3 className="font-bold text-dark text-lg mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-success" />
          Top 5 Days
        </h3>
        <div className="space-y-3">
          {[...filteredData]
            .sort((a, b) => b.timeSaved - a.timeSaved)
            .slice(0, 5).length > 0 ? (
            [...filteredData]
              .sort((a, b) => b.timeSaved - a.timeSaved)
              .slice(0, 5)
              .map((day, index) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-dark">{day.date}</p>
                      <p className="text-xs text-gray-500">{day.dayName}</p>
                    </div>
                  </div>
                  <p className="font-bold text-purple-600 text-lg">
                    {day.timeSaved} min
                  </p>
                </div>
              ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No data yet. Start tracking to see your best days!
            </p>
          )}
        </div>
      </div>

      {/* Not Done Items */}
      <div className="card border-2 border-orange-200 shadow-lg bg-orange-50">
        <h3 className="font-bold text-dark text-lg mb-4 flex items-center gap-2">
          <AlertCircle className="text-orange-600" size={24} />
          Not Done Items
        </h3>
        <div className="space-y-4">
          {/* Incomplete Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ListTodo className="text-blue-600" size={20} />
              <h4 className="font-semibold text-dark text-sm">Tasks</h4>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                {tasks.filter((t) => !t.completed).length}
              </span>
            </div>
            {tasks.filter((t) => !t.completed).length > 0 ? (
              <div className="space-y-2 ml-6 bg-white p-3 rounded-lg">
                {tasks
                  .filter((t) => !t.completed)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-gray-400 flex-shrink-0 mt-0.5">
                        •
                      </span>
                      <div className="flex-1">
                        <p className="text-dark font-medium">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          {task.assignee
                            ? `Assigned to ${task.assignee}`
                            : "Unassigned"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 ml-6 italic">
                All tasks completed!
              </p>
            )}
          </div>

          {/* Incomplete Orders */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-green-600" size={20} />
              <h4 className="font-semibold text-dark text-sm">Orders</h4>
              <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                {orders.filter((o) => !o.completed).length}
              </span>
            </div>
            {orders.filter((o) => !o.completed).length > 0 ? (
              <div className="space-y-2 ml-6 bg-white p-3 rounded-lg">
                {orders
                  .filter((o) => !o.completed)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-gray-400 flex-shrink-0 mt-0.5">
                        •
                      </span>
                      <div className="flex-1">
                        <p className="text-dark font-medium">{order.item}</p>
                        <p className="text-xs text-gray-500">
                          From {order.vendor}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 ml-6 italic">
                All orders completed!
              </p>
            )}
          </div>

          {/* Incomplete Checklist Items */}
          {(checklists.opening.filter((item) => !item.completed).length > 0 ||
            checklists.mid.filter((item) => !item.completed).length > 0 ||
            checklists.closing.filter((item) => !item.completed).length >
              0) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-yellow-600" size={20} />
                <h4 className="font-semibold text-dark text-sm">
                  Daily Checklist
                </h4>
                <span className="bg-yellow-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {checklists.opening.filter((item) => !item.completed).length +
                    checklists.mid.filter((item) => !item.completed).length +
                    checklists.closing.filter((item) => !item.completed).length}
                </span>
              </div>
              <div className="space-y-2 ml-6 bg-white p-3 rounded-lg">
                {checklists.opening.filter((item) => !item.completed).length >
                  0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Opening:
                    </p>
                    {checklists.opening
                      .filter((item) => !item.completed)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 text-xs ml-2 mb-1"
                        >
                          <span className="text-gray-400">-</span>
                          <p className="text-dark">{item.task}</p>
                        </div>
                      ))}
                  </div>
                )}
                {checklists.mid.filter((item) => !item.completed).length >
                  0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Mid-Shift:
                    </p>
                    {checklists.mid
                      .filter((item) => !item.completed)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 text-xs ml-2 mb-1"
                        >
                          <span className="text-gray-400">-</span>
                          <p className="text-dark">{item.task}</p>
                        </div>
                      ))}
                  </div>
                )}
                {checklists.closing.filter((item) => !item.completed).length >
                  0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Closing:
                    </p>
                    {checklists.closing
                      .filter((item) => !item.completed)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 text-xs ml-2 mb-1"
                        >
                          <span className="text-gray-400">-</span>
                          <p className="text-dark">{item.task}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="card border-2 border-gray-200 shadow-lg">
        <h3 className="font-bold text-dark text-lg mb-4">Daily Breakdown</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredData.length > 0 ? (
            filteredData.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-dark text-sm">{day.date}</p>
                  <p className="text-xs text-gray-500">{day.dayName}</p>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className="h-8 bg-purple-500 rounded-lg flex items-center justify-center px-3 text-white text-xs font-bold"
                    style={{
                      width: Math.max(60, day.timeSaved * 2) + "px",
                    }}
                  >
                    {day.timeSaved}m
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              No daily data available yet
            </p>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="card border-2 border-blue-200 shadow-lg bg-blue-50">
        <h3 className="font-bold text-dark text-lg mb-3 flex items-center gap-2">
          💡 Insights
        </h3>
        <ul className="space-y-2 text-sm">
          {filteredTotalTimeSaved > 0 && (
            <li className="flex items-start gap-2">
              <CheckCircle2
                size={16}
                className="text-success flex-shrink-0 mt-0.5"
              />
              <span>
                You've saved <strong>{filteredTotalTimeSaved} minutes</strong>{" "}
                across <strong>{filteredDaysTracked} days</strong> in this view.
              </span>
            </li>
          )}
          {filteredAverageTimeSaved > 0 && (
            <li className="flex items-start gap-2">
              <CheckCircle2
                size={16}
                className="text-success flex-shrink-0 mt-0.5"
              />
              <span>
                Your average daily savings is{" "}
                <strong>{filteredAverageTimeSaved} minutes</strong> per day.
              </span>
            </li>
          )}
          {filteredDaysWithoutProgress > 0 && (
            <li className="flex items-start gap-2">
              <AlertCircle
                size={16}
                className="text-warning flex-shrink-0 mt-0.5"
              />
              <span>
                You have <strong>{filteredDaysWithoutProgress} days</strong>{" "}
                where no time was saved in this range. Keep the momentum going!
              </span>
            </li>
          )}
          {filteredDaysWithoutProgress === 0 && filteredDaysTracked > 0 && (
            <li className="flex items-start gap-2">
              <CheckCircle2
                size={16}
                className="text-success flex-shrink-0 mt-0.5"
              />
              <span>
                Amazing! You've saved time <strong>every single day</strong>{" "}
                you've tracked! 🎉
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
