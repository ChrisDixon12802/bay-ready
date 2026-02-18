import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function Analytics() {
  const { timeSavedToday, resetTimeSaved } = useAppContext();
  const [dailyData, setDailyData] = useState([]);
  const [totalTimeSaved, setTotalTimeSaved] = useState(0);
  const [averageTimeSaved, setAverageTimeSaved] = useState(0);
  const [daysTracked, setDaysTracked] = useState(0);
  const [bestDay, setBestDay] = useState(null);
  const [selectedRange, setSelectedRange] = useState("30d");

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
