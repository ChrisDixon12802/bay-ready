import { useState, useEffect, useRef } from "react";
import {
  Users,
  Settings as SettingsIcon,
  Volume2,
  LogOut,
  Trash2,
  Plus,
  X,
  Clock,
  Store,
  Save,
  UserPlus,
  Mic,
  Shield,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Building2,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { convertTo12Hour } from "@/utils/timeFormat";

export default function Settings({ onLogout }) {
  const {
    employees,
    settings,
    addEmployee: contextAddEmployee,
    deleteEmployee,
    updateSettings,
    customRoles,
    addRole,
    deleteRole,
    getRoleConfig,
  } = useAppContext();

  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", role: "" });
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    icon: "👤",
    color: "bg-gray-100 text-gray-800",
    border: "border-gray-300",
  });
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testTranscript, setTestTranscript] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(() => {
    const saved = localStorage.getItem("bayReadyWeeklyHours");
    console.log("Loading from localStorage:", saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log("Parsed weekly hours:", parsed);
        return parsed;
      } catch (error) {
        console.error("Error parsing weekly hours:", error);
      }
    }
    console.log("Using default weekly hours");
    return {
      Monday: {
        open: "09:00",
        close: "18:00",
        closed: false,
        note: "",
        label: "",
      },
      Tuesday: {
        open: "09:00",
        close: "18:00",
        closed: false,
        note: "",
        label: "",
      },
      Wednesday: {
        open: "09:00",
        close: "18:00",
        closed: false,
        note: "",
        label: "",
      },
      Thursday: {
        open: "09:00",
        close: "18:00",
        closed: false,
        note: "",
        label: "",
      },
      Friday: {
        open: "09:00",
        close: "18:00",
        closed: false,
        note: "",
        label: "",
      },
      Saturday: {
        open: "09:00",
        close: "17:00",
        closed: false,
        note: "",
        label: "",
      },
      Sunday: {
        open: "09:00",
        close: "17:00",
        closed: true,
        note: "",
        label: "",
      },
    };
  });
  const [expandedDay, setExpandedDay] = useState(null);
  const isFirstRender = useRef(true);

  // Auto-save weeklyHours whenever it changes (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem("bayReadyWeeklyHours", JSON.stringify(weeklyHours));
    console.log("Saved weekly hours:", weeklyHours);
  }, [weeklyHours]);

  const handleAddEmployee = () => {
    if (newEmployee.name.trim() && newEmployee.role.trim()) {
      contextAddEmployee(newEmployee);
      setNewEmployee({ name: "", role: "" });
      setShowNewEmployee(false);
    }
  };

  const handleAddRole = () => {
    if (newRole.name.trim()) {
      addRole(newRole);
      setNewRole({
        name: "",
        icon: "👤",
        color: "bg-gray-100 text-gray-800",
        border: "border-gray-300",
      });
      setShowNewRole(false);
    }
  };

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    localStorage.setItem("bayReadyWeeklyHours", JSON.stringify(weeklyHours));
    setHasUnsavedChanges(false);
  };

  const handleSettingChange = (key, value) => {
    setLocalSettings({ ...localSettings, [key]: value });
    setHasUnsavedChanges(true);
  };

  const handleDayHoursChange = (day, field, value) => {
    setWeeklyHours({
      ...weeklyHours,
      [day]: { ...weeklyHours[day], [field]: value },
    });
    setHasUnsavedChanges(true);
  };

  const handleTestVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setTestResult({
        success: false,
        message: "Speech recognition not supported in this browser",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setTestTranscript("");

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setTestResult({
        success: null,
        message: "🎤 Listening... Say something!",
      });
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTestTranscript((prev) => prev + finalTranscript);
      } else if (interimTranscript) {
        setTestTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      setTestResult({
        success: false,
        message: `❌ Error: ${event.error}`,
      });
      setIsTesting(false);
    };

    recognition.onend = () => {
      if (testTranscript.trim()) {
        setTestResult({
          success: true,
          message: `✅ Voice recognized! You said: "${testTranscript.trim()}"`,
        });
      } else {
        setTestResult({
          success: false,
          message: "❌ No speech detected. Please try again.",
        });
      }
      setIsTesting(false);
    };

    recognition.start();
  };

  const roleConfig = {
    Tech: {
      color: "bg-blue-100 text-blue-800",
      icon: "🔧",
      border: "border-blue-300",
    },
    Technician: {
      color: "bg-blue-100 text-blue-800",
      icon: "🔧",
      border: "border-blue-300",
    },
    Mechanic: {
      color: "bg-indigo-100 text-indigo-800",
      icon: "🔧",
      border: "border-indigo-300",
    },
    Closer: {
      color: "bg-purple-100 text-purple-800",
      icon: "🎯",
      border: "border-purple-300",
    },
    Manager: {
      color: "bg-green-100 text-green-800",
      icon: "👔",
      border: "border-green-300",
    },
  };

  return (
    <div className="space-y-6 mb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <SettingsIcon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Settings & Configuration</h2>
            <p className="text-sm opacity-90">Manage your shop preferences</p>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="card bg-yellow-50 border-2 border-yellow-300">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="text-yellow-600 flex-shrink-0 mt-0.5"
              size={24}
            />
            <div className="flex-1">
              <p className="font-semibold text-yellow-900 mb-1">
                Unsaved Changes
              </p>
              <p className="text-sm text-yellow-800">
                You have unsaved settings. Click "Save All Settings" to apply
                changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Voice Control Settings */}
      <div className="card border-2 border-purple-200 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Volume2 className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-dark text-lg">Voice Control</h3>
              <p className="text-xs text-gray-600">
                Configure hands-free operation
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              localSettings.voiceEnabled
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {localSettings.voiceEnabled ? "✓ Enabled" : "○ Disabled"}
          </div>
        </div>

        <div className="space-y-4">
          {/* Voice Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mic
                className={
                  localSettings.voiceEnabled ? "text-success" : "text-gray-400"
                }
                size={20}
              />
              <div>
                <p className="font-semibold text-dark">
                  Enable Voice Assistant
                </p>
                <p className="text-xs text-gray-600">
                  Activate hands-free voice commands
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.voiceEnabled}
                onChange={(e) =>
                  handleSettingChange("voiceEnabled", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-success"></div>
            </label>
          </div>

          {/* Wake Word */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Wake Word
            </label>
            <input
              type="text"
              value={localSettings.wakeWord}
              onChange={(e) => handleSettingChange("wakeWord", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!localSettings.voiceEnabled}
              placeholder="e.g., Ready, Bay, Assistant..."
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              Say this word before each voice command
            </p>
          </div>

          {/* Test Voice Button */}
          <button
            onClick={handleTestVoice}
            disabled={!localSettings.voiceEnabled || isTesting}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Mic size={20} className={isTesting ? "animate-pulse" : ""} />
            {isTesting ? "Testing Voice..." : "Test Voice Recognition"}
          </button>

          {/* Test Result */}
          {testResult && (
            <div
              className={`p-4 rounded-lg border-2 ${
                testResult.success
                  ? "bg-green-50 border-green-300"
                  : testResult.success === false
                    ? "bg-red-50 border-red-300"
                    : "bg-blue-50 border-blue-300"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  testResult.success
                    ? "text-green-800"
                    : testResult.success === false
                      ? "text-red-800"
                      : "text-blue-800"
                }`}
              >
                {testResult.message}
              </p>
              {testTranscript && (
                <p className="text-xs text-gray-600 mt-2">
                  Transcript: <span className="italic">"{testTranscript}"</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Role Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Shield className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-dark text-lg">Role Management</h3>
              <p className="text-xs text-gray-600">
                {customRoles.length} roles available
              </p>
            </div>
          </div>
          {!showNewRole && (
            <button
              onClick={() => setShowNewRole(true)}
              className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Add Role
            </button>
          )}
        </div>

        {/* Add Role Form */}
        {showNewRole && (
          <div className="card space-y-4 border-2 border-indigo-300 shadow-xl bg-gradient-to-br from-white to-indigo-50">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-dark">Create New Role</h4>
              <button
                onClick={() => setShowNewRole(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Role Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Senior Mechanic..."
                value={newRole.name}
                onChange={(e) =>
                  setNewRole({ ...newRole, name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Icon Emoji
              </label>
              <input
                type="text"
                placeholder="e.g., 🔧, 👔, 🎯..."
                value={newRole.icon}
                onChange={(e) =>
                  setNewRole({ ...newRole, icon: e.target.value })
                }
                maxLength="2"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddRole}
                className="flex-1 btn-primary py-3 rounded-lg font-semibold"
              >
                Create Role
              </button>
              <button
                onClick={() => setShowNewRole(false)}
                className="flex-1 btn-secondary py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Roles List */}
        <div className="grid gap-3">
          {customRoles.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-gray-500">No roles created yet</p>
            </div>
          ) : (
            customRoles.map((role) => (
              <div
                key={role.name}
                className={`card border-l-4 ${role.border} hover:shadow-lg transition-all flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${role.color} flex items-center justify-center text-2xl`}
                  >
                    {role.icon}
                  </div>
                  <div>
                    <p className="font-bold text-dark">{role.name}</p>
                    <p className="text-xs text-gray-500">Custom role</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteRole(role.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete role"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-dark text-lg">Team Management</h3>
              <p className="text-xs text-gray-600">
                {employees.length} active members
              </p>
            </div>
          </div>
          {!showNewEmployee && (
            <button
              onClick={() => setShowNewEmployee(true)}
              className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
            >
              <UserPlus size={16} />
              Add Member
            </button>
          )}
        </div>

        {/* Add Employee Form */}
        {showNewEmployee && (
          <div className="card space-y-4 border-2 border-blue-300 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-dark">Add Team Member</h4>
              <button
                onClick={() => {
                  setShowNewEmployee(false);
                  setNewEmployee({ name: "", role: "Tech" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Employee Name *
              </label>
              <input
                type="text"
                placeholder="Full name..."
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Role
              </label>
              <select
                value={newEmployee.role}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, role: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a role...</option>
                {customRoles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.icon} {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddEmployee}
                disabled={!newEmployee.name.trim()}
                className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                ✓ Add Employee
              </button>
              <button
                onClick={() => {
                  setShowNewEmployee(false);
                  setNewEmployee({ name: "", role: "" });
                }}
                className="flex-1 bg-gray-200 text-dark py-3 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {employees.length === 0 ? (
            <div className="col-span-2 card text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300">
              <Users className="text-gray-400 mx-auto mb-3" size={48} />
              <p className="text-lg font-semibold text-gray-600 mb-1">
                No Team Members
              </p>
              <p className="text-sm text-gray-500">
                Add your first employee to get started
              </p>
            </div>
          ) : (
            employees.map((emp) => {
              const roleStyle = getRoleConfig(emp.role);
              return (
                <div
                  key={emp.id}
                  className={`card border-l-4 ${roleStyle.border} hover:shadow-lg transition-all group`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full ${roleStyle.color} flex items-center justify-center text-2xl flex-shrink-0`}
                      >
                        {roleStyle.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-dark text-lg">
                          {emp.name}
                        </p>
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1 ${roleStyle.color}`}
                        >
                          {emp.role || "No role assigned"}
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            {emp.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        deleteEmployee(emp.id);
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Shop Settings */}
      <div className="card border-2 border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Building2 className="text-orange-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-dark text-lg">Shop Information</h3>
            <p className="text-xs text-gray-600">Business details and hours</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Store size={16} />
              Shop Name
            </label>
            <input
              type="text"
              placeholder="Your shop name"
              value={localSettings.shopName}
              onChange={(e) => handleSettingChange("shopName", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Weekly Hours */}
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-orange-600" size={20} />
              <h4 className="font-bold text-dark">Weekly Schedule</h4>
            </div>

            <div className="space-y-3">
              {Object.keys(weeklyHours).map((day) => (
                <div
                  key={day}
                  className="bg-white p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!weeklyHours[day].closed}
                        onChange={(e) =>
                          handleDayHoursChange(day, "closed", !e.target.checked)
                        }
                        className="w-4 h-4 text-orange-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-700">
                          {day}
                        </span>
                        {!weeklyHours[day].closed ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
                            OPEN
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold">
                            CLOSED
                          </span>
                        )}
                        {weeklyHours[day].label && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {weeklyHours[day].label}
                          </span>
                        )}
                      </div>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setExpandedDay(expandedDay === day ? null : day)
                        }
                        className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                      >
                        {expandedDay === day ? "Less" : "Customize"}
                      </button>
                    </div>
                  </div>

                  {!weeklyHours[day].closed && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                          Open
                        </label>
                        <div className="text-sm font-semibold text-gray-800 px-3 py-2 bg-blue-50 rounded border border-blue-200">
                          {convertTo12Hour(weeklyHours[day].open)}
                        </div>
                        <input
                          type="time"
                          value={weeklyHours[day].open}
                          onChange={(e) =>
                            handleDayHoursChange(day, "open", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none text-sm mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                          Close
                        </label>
                        <div className="text-sm font-semibold text-gray-800 px-3 py-2 bg-red-50 rounded border border-red-200">
                          {convertTo12Hour(weeklyHours[day].close)}
                        </div>
                        <input
                          type="time"
                          value={weeklyHours[day].close}
                          onChange={(e) =>
                            handleDayHoursChange(day, "close", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none text-sm mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* Expanded Customization Options */}
                  {expandedDay === day && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                          Day Label (e.g., "Early Close", "Holiday Hours")
                        </label>
                        <input
                          type="text"
                          value={weeklyHours[day].label || ""}
                          onChange={(e) =>
                            handleDayHoursChange(day, "label", e.target.value)
                          }
                          placeholder="Optional label"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                          Notes (e.g., "Staff meeting at 12", "Busy day")
                        </label>
                        <textarea
                          value={weeklyHours[day].note || ""}
                          onChange={(e) =>
                            handleDayHoursChange(day, "note", e.target.value)
                          }
                          placeholder="Add notes for this day"
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <button
        onClick={handleSaveSettings}
        disabled={!hasUnsavedChanges}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
          hasUnsavedChanges
            ? "bg-gradient-to-r from-success to-green-600 text-white hover:shadow-xl"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        <Save size={24} />
        {hasUnsavedChanges ? "Save All Settings" : "All Settings Saved"}
      </button>

      {/* Danger Zone */}
      <div className="card border-2 border-red-200 bg-red-50">
        <div className="flex items-start gap-3 mb-4">
          <Shield className="text-danger flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-danger text-lg">Danger Zone</h3>
            <p className="text-sm text-red-700">Irreversible actions</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-danger text-white rounded-lg hover:bg-red-700 transition-all font-semibold"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      {/* App Info */}
      <div className="card bg-gray-50 border border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <p className="font-semibold text-dark mb-1">Bay Ready v1.0</p>
          <p className="text-xs">
            Voice-First Task Management for Service Shops
          </p>
          <p className="text-xs text-gray-500 mt-2">
            © 2026 Bay Ready. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
