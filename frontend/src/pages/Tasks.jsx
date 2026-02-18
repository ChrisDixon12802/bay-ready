import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Trash2,
  User,
  Filter,
  Search,
  X,
  AlertTriangle,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { convertTo12Hour } from "@/utils/timeFormat";
import ConfirmModal from "@/components/ConfirmModal";

export default function Tasks() {
  const {
    tasks,
    employees,
    addTask: contextAddTask,
    toggleTask: contextToggleTask,
    deleteTask,
    canDeleteContent,
    hasDeletePin,
    setDeletePin,
    verifyDeletePin,
  } = useAppContext();

  const canDelete = canDeleteContent();

  const [showNewTask, setShowNewTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [taskPendingDelete, setTaskPendingDelete] = useState(null);
  const [deletePin, setDeletePinValue] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    priority: "low",
    dueTime: "",
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      contextAddTask(newTask);
      setNewTask({ title: "", assignee: "", priority: "low", dueTime: "" });
      setShowNewTask(false);
    }
  };

  const priorityConfig = {
    high: {
      bg: "bg-red-100",
      text: "text-red-800",
      badge: "bg-danger text-white",
      border: "border-danger",
      icon: "🔴",
    },
    medium: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      badge: "bg-warning text-white",
      border: "border-warning",
      icon: "🟡",
    },
    low: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      badge: "bg-gray-400 text-white",
      border: "border-gray-300",
      icon: "⚪",
    },
  };

  // Filter and search tasks
  const filterTasks = (taskList) => {
    return taskList.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.assignee &&
          task.assignee.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;
      const matchesAssignee =
        filterAssignee === "all" || task.assignee === filterAssignee;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  };

  const activeTasks = filterTasks(tasks.filter((t) => !t.completed));
  const completedTasks = filterTasks(tasks.filter((t) => t.completed));

  // Sort tasks: high priority first, then by due time
  const sortedActiveTasks = [...activeTasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
    return 0;
  });

  const activeFiltersCount =
    (filterPriority !== "all" ? 1 : 0) + (filterAssignee !== "all" ? 1 : 0);

  return (
    <div className="space-y-4 mb-20">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-xl p-5 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Task Management</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
              {activeTasks.length}
            </div>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
              {completedTasks.length}
            </div>
            <span>Done</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
              {tasks.length > 0
                ? Math.round((completedTasks.length / tasks.length) * 100)
                : 0}
              %
            </div>
            <span>Complete</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search tasks or assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
            showFilters
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-700 border-gray-200 hover:border-primary"
          }`}
        >
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <span className="font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <ChevronDown
            className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
            size={20}
          />
        </button>

        {/* Filter Options */}
        {showFilters && (
          <div className="card space-y-3 border-2 border-primary">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Priority
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterPriority("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterPriority === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterPriority("high")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterPriority === "high"
                      ? "bg-danger text-white"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  🔴 High
                </button>
                <button
                  onClick={() => setFilterPriority("medium")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterPriority === "medium"
                      ? "bg-warning text-white"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  }`}
                >
                  🟡 Medium
                </button>
                <button
                  onClick={() => setFilterPriority("low")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterPriority === "low"
                      ? "bg-gray-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ⚪ Low
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Assigned To
              </label>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="all">All Team Members</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
                <option value="">Unassigned</option>
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setFilterPriority("all");
                  setFilterAssignee("all");
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => setShowNewTask(!showNewTask)}
        className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all"
      >
        <Plus size={24} />
        <span className="font-semibold">Add New Task</span>
      </button>

      {/* New Task Form */}
      {showNewTask && (
        <div className="card space-y-4 border-2 border-primary shadow-xl bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-dark">Create New Task</h3>
            <button
              onClick={() => setShowNewTask(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Task Description *
            </label>
            <input
              type="text"
              placeholder="e.g., Clean bay 3, Check oil inventory..."
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
                <User size={16} />
                Assign To
              </label>
              <select
                value={newTask.assignee}
                onChange={(e) =>
                  setNewTask({ ...newTask, assignee: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="">Select team member...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
                <AlertTriangle size={16} />
                Priority Level
              </label>
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="low">⚪ Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
              <Clock size={16} />
              Due Time
            </label>
            <input
              type="time"
              value={newTask.dueTime}
              onChange={(e) =>
                setNewTask({ ...newTask, dueTime: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddTask}
              disabled={!newTask.title.trim()}
              className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              ✓ Create Task
            </button>
            <button
              onClick={() => {
                setShowNewTask(false);
                setNewTask({
                  title: "",
                  assignee: "",
                  priority: "low",
                  dueTime: "",
                });
              }}
              className="flex-1 bg-gray-200 text-dark py-3 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-dark text-xl flex items-center gap-2">
            <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-bold">
              {sortedActiveTasks.length}
            </div>
            Active Tasks
          </h3>
          {activeTasks.length > 0 && (
            <span className="text-sm text-gray-500">
              ~{activeTasks.length * 3} min remaining
            </span>
          )}
        </div>

        <div className="space-y-3">
          {sortedActiveTasks.length === 0 ? (
            <div className="card text-center py-12 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-dashed border-gray-300">
              <CheckCircle2 className="text-success mx-auto mb-3" size={48} />
              <p className="text-xl font-semibold text-dark mb-1">
                All Caught Up! 🎉
              </p>
              <p className="text-gray-600">No active tasks at the moment.</p>
            </div>
          ) : (
            sortedActiveTasks.map((task) => (
              <div
                key={task.id}
                className={`card border-l-4 ${priorityConfig[task.priority].border} hover:shadow-lg transition-all group`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => contextToggleTask(task.id)}
                    className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                  >
                    <div className="w-7 h-7 border-2 border-gray-300 rounded-full hover:border-success hover:bg-green-50 transition-all flex items-center justify-center">
                      <Circle className="text-gray-300" size={20} />
                    </div>
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark text-lg mb-2">
                      {task.title}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Priority Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${priorityConfig[task.priority].badge}`}
                      >
                        {priorityConfig[task.priority].icon}{" "}
                        {task.priority.toUpperCase()}
                      </span>

                      {/* Assignee */}
                      {task.assignee && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                          <User size={12} />
                          {task.assignee}
                        </span>
                      )}

                      {/* Due Time */}
                      {task.dueTime && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                          <Clock size={12} />
                          {convertTo12Hour(task.dueTime)}
                        </span>
                      )}

                      {/* Time estimate */}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        ⏱️ ~3 min
                      </span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskPendingDelete({ id: task.id, name: task.title });
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-600 text-xl flex items-center gap-2">
              <div className="w-10 h-10 bg-success text-white rounded-lg flex items-center justify-center">
                ✓
              </div>
              Completed ({completedTasks.length})
            </h3>
            <span className="text-sm text-success font-semibold">
              +{completedTasks.length * 3} min saved
            </span>
          </div>

          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="card bg-gray-50 border border-gray-200 opacity-75 hover:opacity-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  {/* Checkmark */}
                  <button
                    onClick={() => contextToggleTask(task.id)}
                    className="flex-shrink-0 hover:scale-110 transition-transform"
                  >
                    <CheckCircle2 className="text-success" size={28} />
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-500 line-through">
                      {task.title}
                    </p>
                    {(task.assignee || task.dueTime) && (
                      <div className="flex items-center gap-2 mt-1">
                        {task.assignee && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User size={10} />
                            {task.assignee}
                          </span>
                        )}
                        {task.dueTime && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} />
                            {convertTo12Hour(task.dueTime)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskPendingDelete({ id: task.id, name: task.title });
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={taskPendingDelete !== null}
        title="Delete Task"
        message={
          hasDeletePin()
            ? `Are you sure you want to delete "${taskPendingDelete?.name || "this task"}"? This action cannot be undone.`
            : `Set a 4-digit delete PIN, then delete "${taskPendingDelete?.name || "this task"}".`
        }
        confirmText="Delete Task"
        requirePin
        pinValue={deletePin}
        onPinChange={(value) => {
          setDeletePinValue(value.replace(/\D/g, "").slice(0, 4));
          if (deleteError) {
            setDeleteError("");
          }
        }}
        pinError={deleteError}
        onCancel={() => {
          setTaskPendingDelete(null);
          setDeletePinValue("");
          setDeleteError("");
        }}
        onConfirm={() => {
          if (!/^\d{4}$/.test(deletePin)) {
            setDeleteError("Enter a valid 4-digit PIN.");
            return;
          }

          if (!hasDeletePin()) {
            setDeletePin(deletePin);
          } else if (!verifyDeletePin(deletePin)) {
            setDeleteError("Delete PIN is incorrect.");
            return;
          }

          if (taskPendingDelete !== null) {
            deleteTask(taskPendingDelete.id);
          }
          setTaskPendingDelete(null);
          setDeletePinValue("");
          setDeleteError("");
        }}
      />
    </div>
  );
}
