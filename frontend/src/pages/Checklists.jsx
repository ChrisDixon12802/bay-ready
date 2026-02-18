import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Trophy,
  Sunrise,
  Sun,
  Sunset,
  AlertCircle,
  Target,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function Checklists() {
  const [activeChecklist, setActiveChecklist] = useState("opening");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskRequired, setNewTaskRequired] = useState(false);
  const {
    checklists,
    toggleChecklistTask,
    markChecklistComplete,
    addChecklistTask,
    deleteChecklistTask,
    canDeleteContent,
  } = useAppContext();

  const canDelete = canDeleteContent();

  const currentTasks = checklists[activeChecklist];
  const completedCount = currentTasks.filter((t) => t.completed).length;
  const progress = Math.round((completedCount / currentTasks.length) * 100);
  const requiredTasks = currentTasks.filter((t) => t.required);
  const requiredCompleted = requiredTasks.filter((t) => t.completed).length;
  const allRequiredDone = requiredCompleted === requiredTasks.length;

  // Calculate time estimate (2 min per task)
  const remainingTasks = currentTasks.filter((t) => !t.completed).length;
  const estimatedTime = remainingTasks * 2;

  // Checklist config
  const checklistConfig = {
    opening: {
      icon: Sunrise,
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      textColor: "text-orange-700",
      badgeColor: "bg-orange-100 text-orange-800",
      title: "Opening Checklist",
      description: "Start the day right",
    },
    mid: {
      icon: Sun,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      textColor: "text-yellow-700",
      badgeColor: "bg-yellow-100 text-yellow-800",
      title: "Mid-Shift Checklist",
      description: "Keep things running smooth",
    },
    closing: {
      icon: Sunset,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      textColor: "text-purple-700",
      badgeColor: "bg-purple-100 text-purple-800",
      title: "Closing Checklist",
      description: "Finish strong",
    },
  };

  const config = checklistConfig[activeChecklist];
  const IconComponent = config.icon;

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      addChecklistTask(activeChecklist, newTaskName, newTaskRequired);
      setNewTaskName("");
      setNewTaskRequired(false);
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6 mb-20">
      {/* Header Card */}
      <div
        className={`bg-gradient-to-r ${config.color} rounded-xl p-6 text-white shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <IconComponent size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{config.title}</h2>
                <p className="text-sm opacity-90">{config.description}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 mb-2">
              <p className="text-4xl font-bold">{progress}%</p>
            </div>
            <p className="text-xs opacity-90">Complete</p>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white border-opacity-30">
          <div>
            <p className="text-2xl font-bold">
              {completedCount}/{currentTasks.length}
            </p>
            <p className="text-xs opacity-75">Tasks Done</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {requiredCompleted}/{requiredTasks.length}
            </p>
            <p className="text-xs opacity-75">Required</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{estimatedTime}m</p>
            <p className="text-xs opacity-75">Time Left</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-white rounded-xl p-2 shadow-md">
        <button
          onClick={() => setActiveChecklist("opening")}
          className={`py-3 px-4 rounded-lg transition-all font-semibold flex items-center justify-center gap-2 ${
            activeChecklist === "opening"
              ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Sunrise size={18} />
          <span className="hidden sm:inline">Opening</span>
        </button>
        <button
          onClick={() => setActiveChecklist("mid")}
          className={`py-3 px-4 rounded-lg transition-all font-semibold flex items-center justify-center gap-2 ${
            activeChecklist === "mid"
              ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Sun size={18} />
          <span className="hidden sm:inline">Mid-Shift</span>
        </button>
        <button
          onClick={() => setActiveChecklist("closing")}
          className={`py-3 px-4 rounded-lg transition-all font-semibold flex items-center justify-center gap-2 ${
            activeChecklist === "closing"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Sunset size={18} />
          <span className="hidden sm:inline">Closing</span>
        </button>
      </div>

      {/* Progress Card */}
      <div className="card border-2 border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-dark flex items-center gap-2">
            <Target size={20} className={config.textColor} />
            Completion Progress
          </h3>
          <span className={`text-sm font-bold ${config.textColor}`}>
            {progress}%
          </span>
        </div>

        <div className="space-y-3">
          {/* Overall Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Overall</span>
              <span>
                {completedCount} of {currentTasks.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${config.color} h-4 rounded-full transition-all duration-500 flex items-center justify-end px-2`}
                style={{ width: `${progress}%` }}
              >
                {progress > 15 && (
                  <span className="text-xs text-white font-bold">
                    {progress}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Required Tasks Progress */}
          {requiredTasks.length > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="flex items-center gap-1">
                  <AlertCircle size={12} className="text-danger" />
                  Required Tasks
                </span>
                <span>
                  {requiredCompleted} of {requiredTasks.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`${allRequiredDone ? "bg-success" : "bg-danger"} h-3 rounded-full transition-all duration-500`}
                  style={{
                    width: `${(requiredCompleted / requiredTasks.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          {progress === 100 ? (
            <div className="flex items-center gap-2 text-success">
              <Trophy size={20} />
              <span className="font-semibold">All tasks complete!</span>
            </div>
          ) : allRequiredDone ? (
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 size={20} className="text-success" />
              <span className="text-sm">
                All required tasks done • {remainingTasks} optional remaining
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} className={config.textColor} />
              <span className="text-sm">
                {remainingTasks} tasks to go • ~{estimatedTime} minutes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-dark text-lg">Tasks</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddTask}
            className="mb-4 card bg-blue-50 border-2 border-blue-300 space-y-3"
          >
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-200">
              <Plus className="text-blue-600" size={20} />
              <h4 className="font-semibold text-blue-900">Create New Task</h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="ml-auto p-1 hover:bg-blue-200 rounded transition"
              >
                <X size={18} className="text-blue-600" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Task name..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
              autoFocus
            />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newTaskRequired}
                onChange={(e) => setNewTaskRequired(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Mark as required task
              </span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={!newTaskName.trim()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Plus size={18} />
                Add Task
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {currentTasks.map((task, index) => (
            <div
              key={task.id}
              className={`card cursor-pointer transition-all group hover:shadow-lg ${
                task.completed
                  ? "bg-gray-50 border border-gray-200"
                  : task.required
                    ? `border-2 ${config.borderColor} ${config.bgColor}`
                    : "border border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Number Badge */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    task.completed
                      ? "bg-success text-white"
                      : `${config.badgeColor}`
                  }`}
                >
                  {task.completed ? "✓" : index + 1}
                </div>

                {/* Checkbox */}
                <button
                  className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChecklistTask(activeChecklist, task.id);
                  }}
                >
                  {task.completed ? (
                    <CheckCircle2 className="text-success" size={28} />
                  ) : (
                    <div
                      className={`w-7 h-7 border-2 rounded-full hover:bg-gray-50 transition-all ${
                        task.required ? "border-danger" : "border-gray-300"
                      }`}
                    >
                      <Circle className="text-transparent" size={24} />
                    </div>
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-lg ${
                      task.completed
                        ? "text-gray-400 line-through"
                        : "text-dark"
                    }`}
                  >
                    {task.task}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {task.required && (
                      <span className="text-xs bg-danger text-white px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                        <AlertCircle size={12} />
                        Required
                      </span>
                    )}
                    {!task.completed && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        ~2 min
                      </span>
                    )}
                    {task.completed && (
                      <span className="text-xs text-success font-medium">
                        +2 min saved
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions - Delete Button */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {task.completed && (
                    <div className="flex-shrink-0">
                      <div className="bg-success bg-opacity-10 p-2 rounded-full">
                        <Zap className="text-success" size={20} />
                      </div>
                    </div>
                  )}
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChecklistTask(activeChecklist, task.id);
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete task"
                    >
                      <Trash2 size={18} className="text-danger" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {progress === 100 ? (
          <button
            onClick={() => {
              // Reset all tasks in this checklist
              currentTasks.forEach((task) => {
                if (task.completed) {
                  toggleChecklistTask(activeChecklist, task.id);
                }
              });
            }}
            className="w-full bg-gray-600 text-white py-4 rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
          >
            <RotateCcw size={24} />
            Reset Checklist
          </button>
        ) : (
          <>
            {allRequiredDone && (
              <button
                onClick={() => markChecklistComplete(activeChecklist)}
                className={`w-full bg-gradient-to-r ${config.color} text-white py-4 rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 font-semibold text-lg shadow-lg`}
              >
                <Trophy size={24} />
                Complete {config.title}
              </button>
            )}

            {!allRequiredDone && (
              <div className="card bg-orange-50 border-2 border-orange-300">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="text-orange-600 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div>
                    <p className="font-semibold text-orange-900 mb-1">
                      Required Tasks Pending
                    </p>
                    <p className="text-sm text-orange-800">
                      Complete all {requiredTasks.length} required tasks (
                      {requiredTasks.length - requiredCompleted} remaining) to
                      finish this checklist.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <p className="text-3xl font-bold text-blue-900">
            {currentTasks.length}
          </p>
          <p className="text-xs text-blue-700 font-medium">Total Tasks</p>
        </div>
        <div className="card text-center bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <p className="text-3xl font-bold text-green-900">{completedCount}</p>
          <p className="text-xs text-green-700 font-medium">Completed</p>
        </div>
        <div className="card text-center bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <p className="text-3xl font-bold text-orange-900">{remainingTasks}</p>
          <p className="text-xs text-orange-700 font-medium">Remaining</p>
        </div>
        <div className="card text-center bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <p className="text-3xl font-bold text-purple-900">
            {completedCount * 2}
          </p>
          <p className="text-xs text-purple-700 font-medium">Min Saved</p>
        </div>
      </div>
    </div>
  );
}
