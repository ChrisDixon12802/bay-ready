import {
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ListTodo,
  Package,
  Users,
  Calendar,
  Zap,
  Target,
  Award,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { convertTo12Hour } from "@/utils/timeFormat";

export default function Dashboard() {
  const {
    timeSavedToday,
    openingProgress,
    closingProgress,
    tasks,
    orders,
    employees,
    checklists,
    markChecklistComplete,
    shopInfo,
  } = useAppContext();

  const tasksRemaining = tasks.filter((t) => !t.completed).length;
  const tasksCompleted = tasks.filter((t) => t.completed).length;
  const ordersRemaining = orders.filter((o) => !o.completed).length;
  const ordersCompleted = orders.filter((o) => o.completed).length;

  // Get today's schedule
  const getTodaySchedule = () => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const dayName = daysOfWeek[today.getDay()];

    const weeklyHours = JSON.parse(
      localStorage.getItem("bayReadyWeeklyHours") || "{}",
    );
    return { dayName, schedule: weeklyHours[dayName] };
  };

  // Check if shop is currently open
  const isShopOpen = () => {
    const { schedule } = getTodaySchedule();
    if (!schedule || schedule.closed) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    return currentTime >= schedule.open && currentTime <= schedule.close;
  };

  const { dayName, schedule: todaySchedule } = getTodaySchedule();
  const shopOpen = isShopOpen();

  // Priority tasks
  const highPriorityTasks = tasks
    .filter((t) => !t.completed && t.priority === "high")
    .slice(0, 3);
  const urgentOrders = orders
    .filter((o) => !o.completed && o.emergency)
    .slice(0, 2);

  // Calculate efficiency
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  // Get time estimate
  const estimatedTimeRemaining = tasksRemaining * 3 + ordersRemaining * 5;

  // Calculate behind schedule status
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const totalMinutesIntoDay = currentHour * 60 + currentMinutes;

  // Assuming shift starts at 9 AM (540 minutes from midnight)
  const shiftStart = 9 * 60; // 540 minutes
  const shiftEnd = 18 * 60; // 1080 minutes (6 PM)
  const totalShiftMinutes = shiftEnd - shiftStart; // 540 minutes (9 hours)

  // Calculate expected progress
  const minutesWorked = Math.max(0, totalMinutesIntoDay - shiftStart);
  const expectedCompletionRate =
    totalShiftMinutes > 0 ? (minutesWorked / totalShiftMinutes) * 100 : 0;

  // Calculate if behind schedule
  const actualCompletionRate =
    totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  const behindSchedule = expectedCompletionRate - actualCompletionRate;
  const isBehind = behindSchedule > 5; // More than 5% behind
  const isAhead = actualCompletionRate > expectedCompletionRate + 5; // More than 5% ahead

  return (
    <div className="space-y-6 mb-20">
      {/* Shop Information Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-1">
              {shopInfo?.shopName || "Your Shop"}
            </h2>
            <p className="text-sm text-indigo-700 mb-3">
              {shopInfo?.shopLocation || "Location not set"}
            </p>
            {shopInfo?.managerName && (
              <p className="text-xs text-indigo-600">
                Manager:{" "}
                <span className="font-semibold">{shopInfo.managerName}</span>
              </p>
            )}
            {shopInfo?.shopPhone && (
              <p className="text-xs text-indigo-600">
                Phone:{" "}
                <span className="font-semibold">{shopInfo.shopPhone}</span>
              </p>
            )}
          </div>

          {/* Today's Hours */}
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-indigo-900">{dayName}'s Hours</h3>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                  todaySchedule?.closed
                    ? "bg-red-100 text-red-700"
                    : shopOpen
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    todaySchedule?.closed
                      ? "bg-red-700"
                      : shopOpen
                        ? "bg-green-700"
                        : "bg-yellow-700"
                  }`}
                />
                {todaySchedule?.closed
                  ? "CLOSED"
                  : shopOpen
                    ? "OPEN NOW"
                    : "CLOSED NOW"}
              </div>
            </div>
            {!todaySchedule?.closed ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Open:</span>{" "}
                  {convertTo12Hour(todaySchedule?.open) || "--:--"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Close:</span>{" "}
                  {convertTo12Hour(todaySchedule?.close) || "--:--"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-700 font-semibold">Closed today</p>
            )}
            {todaySchedule?.label && (
              <p className="text-xs mt-2 text-blue-600 font-semibold">
                📌 {todaySchedule.label}
              </p>
            )}
            {todaySchedule?.note && (
              <p className="text-xs mt-1 text-gray-600 italic">
                Note: {todaySchedule.note}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Time Saved - Main Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary via-orange-600 to-danger rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={24} className="animate-pulse" />
                <span className="text-sm opacity-90 font-medium">
                  Time Saved Today
                </span>
              </div>
              <p className="text-6xl font-bold mb-2">
                {timeSavedToday}
                <span className="text-3xl">min</span>
              </p>
              <p className="text-sm opacity-90">
                {timeSavedToday >= 60
                  ? `${Math.floor(timeSavedToday / 60)}h ${timeSavedToday % 60}m saved`
                  : "Keep the momentum going!"}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Award size={32} />
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white border-opacity-30">
            <div>
              <p className="text-2xl font-bold">{tasksCompleted}</p>
              <p className="text-xs opacity-75">Tasks Done</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{ordersCompleted}</p>
              <p className="text-xs opacity-75">Orders Placed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-xs opacity-75">Completion</p>
            </div>
          </div>
        </div>

        {/* Efficiency Score */}
        <div className="card bg-gradient-to-br from-success to-green-600 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} />
            <h3 className="font-semibold">Daily Efficiency</h3>
          </div>
          <div className="text-center my-4">
            <div className="relative inline-block">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${completionRate * 3.51} 351`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{completionRate}%</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-center opacity-90">
            {completionRate >= 75
              ? "Excellent work!"
              : completionRate >= 50
                ? "Great progress!"
                : "Keep pushing!"}
          </p>
        </div>
      </div>

      {/* Behind Schedule Warning */}
      {isBehind && (
        <div className="card border-2 border-danger bg-red-50">
          <div className="flex items-start gap-4">
            <div className="bg-danger bg-opacity-10 p-3 rounded-lg flex-shrink-0">
              <AlertTriangle className="text-danger" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-danger mb-1">Behind Schedule</h3>
              <p className="text-sm text-gray-700 mb-3">
                You're approximately{" "}
                <span className="font-bold text-danger">
                  {Math.round(behindSchedule)}%
                </span>{" "}
                behind on daily tasks. At this time, you should have completed
                about{" "}
                <span className="font-bold">
                  {Math.round(expectedCompletionRate)}%
                </span>{" "}
                of tasks, but you've completed{" "}
                <span className="font-bold">
                  {Math.round(actualCompletionRate)}%
                </span>
                .
              </p>

              <div className="bg-white rounded-lg p-3 space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Expected Progress</span>
                    <span className="font-semibold">
                      {Math.round(expectedCompletionRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-warning to-danger h-2 rounded-full"
                      style={{ width: `${expectedCompletionRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Actual Progress</span>
                    <span className="font-semibold">
                      {Math.round(actualCompletionRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${actualCompletionRate < expectedCompletionRate ? "bg-danger" : "bg-success"} h-2 rounded-full transition-all`}
                      style={{ width: `${actualCompletionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2 bg-white rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Tip:</span> Complete{" "}
                  <span className="font-bold text-danger">
                    {tasksRemaining}
                  </span>{" "}
                  remaining tasks and{" "}
                  <span className="font-bold text-danger">
                    {ordersRemaining}
                  </span>{" "}
                  orders to get back on track (~{estimatedTimeRemaining} min).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ahead of Schedule - Good News */}
      {isAhead && (
        <div className="card border-2 border-success bg-green-50">
          <div className="flex items-start gap-4">
            <div className="bg-success bg-opacity-10 p-3 rounded-lg flex-shrink-0">
              <TrendingUp className="text-success" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-success mb-1">
                Ahead of Schedule! 🎯
              </h3>
              <p className="text-sm text-gray-700">
                Great work! You're{" "}
                <span className="font-bold text-success">
                  {Math.round(actualCompletionRate - expectedCompletionRate)}%
                </span>{" "}
                ahead of the expected daily progress. Keep up this momentum!
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opening Progress */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dark flex items-center gap-2">
              <Zap size={20} className="text-warning" />
              Opening Checklist
            </h3>
            <span className="text-sm font-semibold text-primary">
              {openingProgress}%
            </span>
          </div>
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-success to-green-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end px-2"
                style={{ width: `${openingProgress}%` }}
              >
                {openingProgress > 10 && (
                  <span className="text-xs text-white font-semibold">
                    {openingProgress}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {checklists.opening.filter((t) => t.completed).length} of{" "}
                {checklists.opening.length} complete
              </p>
              {openingProgress === 100 ? (
                <span className="text-xs bg-success text-white px-2 py-1 rounded-full">
                  ✓ Done
                </span>
              ) : (
                <button
                  onClick={() => markChecklistComplete("opening")}
                  className="text-xs btn-primary px-3 py-1"
                >
                  Complete All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Closing Progress */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dark flex items-center gap-2">
              <Target size={20} className="text-danger" />
              Closing Checklist
            </h3>
            <span className="text-sm font-semibold text-danger">
              {closingProgress}%
            </span>
          </div>
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-warning to-orange-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end px-2"
                style={{ width: `${closingProgress}%` }}
              >
                {closingProgress > 10 && (
                  <span className="text-xs text-white font-semibold">
                    {closingProgress}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {checklists.closing.filter((t) => t.completed).length} of{" "}
                {checklists.closing.length} complete
              </p>
              {closingProgress === 100 ? (
                <span className="text-xs bg-success text-white px-2 py-1 rounded-full">
                  ✓ Done
                </span>
              ) : (
                <button
                  onClick={() => markChecklistComplete("closing")}
                  className="text-xs bg-danger text-white px-3 py-1 rounded-lg hover:bg-red-700"
                >
                  Complete All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center hover:shadow-lg transition-all hover:-translate-y-1">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <ListTodo className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-bold text-dark">{tasksRemaining}</p>
          <p className="text-sm text-gray-600">Tasks To Do</p>
          <p className="text-xs text-gray-400 mt-1">
            ~{tasksRemaining * 3} min
          </p>
        </div>

        <div className="card text-center hover:shadow-lg transition-all hover:-translate-y-1">
          <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <Package className="text-warning" size={24} />
          </div>
          <p className="text-3xl font-bold text-dark">{ordersRemaining}</p>
          <p className="text-sm text-gray-600">Orders Pending</p>
          <p className="text-xs text-gray-400 mt-1">
            ~{ordersRemaining * 5} min
          </p>
        </div>

        <div className="card text-center hover:shadow-lg transition-all hover:-translate-y-1">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="text-success" size={24} />
          </div>
          <p className="text-3xl font-bold text-dark">{employees.length}</p>
          <p className="text-sm text-gray-600">Team Members</p>
          <p className="text-xs text-gray-400 mt-1">On duty</p>
        </div>

        <div className="card text-center hover:shadow-lg transition-all hover:-translate-y-1">
          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-dark">
            {estimatedTimeRemaining}
          </p>
          <p className="text-sm text-gray-600">Min Remaining</p>
          <p className="text-xs text-gray-400 mt-1">Estimated</p>
        </div>
      </div>

      {/* Priority Items */}
      {(highPriorityTasks.length > 0 || urgentOrders.length > 0) && (
        <div className="space-y-4">
          <h3 className="font-bold text-dark text-lg flex items-center gap-2">
            <AlertCircle className="text-danger" size={22} />
            Needs Attention
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* High Priority Tasks */}
            {highPriorityTasks.length > 0 && (
              <div className="card border-l-4 border-danger">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">
                  High Priority Tasks
                </h4>
                <div className="space-y-2">
                  {highPriorityTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 p-2 bg-red-50 rounded"
                    >
                      <AlertCircle
                        size={16}
                        className="text-danger flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark truncate">
                          {task.name}
                        </p>
                        {task.assignedTo && (
                          <p className="text-xs text-gray-500">
                            Assigned: {task.assignedTo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Urgent Orders */}
            {urgentOrders.length > 0 && (
              <div className="card border-l-4 border-warning">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">
                  Urgent Orders
                </h4>
                <div className="space-y-2">
                  {urgentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-2 p-2 bg-orange-50 rounded"
                    >
                      <Package
                        size={16}
                        className="text-warning flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark truncate">
                          {order.vendor}
                        </p>
                        <p className="text-xs text-gray-500">{order.item}</p>
                      </div>
                      <span className="text-xs bg-warning text-white px-2 py-1 rounded">
                        !
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-bold text-dark text-lg">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => markChecklistComplete("opening")}
            className="btn-primary py-4 text-left px-6 flex items-center justify-between group"
            disabled={openingProgress === 100}
          >
            <div>
              <p className="font-semibold">Complete Opening</p>
              <p className="text-sm opacity-90">Mark all opening tasks done</p>
            </div>
            <Zap
              className="group-hover:scale-110 transition-transform"
              size={24}
            />
          </button>

          <button
            onClick={() => markChecklistComplete("closing")}
            className="bg-gradient-to-r from-danger to-orange-600 text-white py-4 px-6 rounded-lg hover:shadow-lg transition-all text-left flex items-center justify-between group"
            disabled={closingProgress === 100}
          >
            <div>
              <p className="font-semibold">Complete Closing</p>
              <p className="text-sm opacity-90">Mark all closing tasks done</p>
            </div>
            <Target
              className="group-hover:scale-110 transition-transform"
              size={24}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
