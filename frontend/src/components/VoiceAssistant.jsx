import { useEffect, useRef, useState, useCallback } from "react";
import {
  Mic,
  MicOff,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3,
  Volume2,
  Clock,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function VoiceAssistant({
  isActive,
  onClose,
  autoStart = false,
}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [status, setStatus] = useState("idle"); // idle, listening, processing, success, error
  const [feedback, setFeedback] = useState("");
  const [actionPerformed, setActionPerformed] = useState(null);
  const [waveData, setWaveData] = useState([0, 0, 0, 0, 0]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptRef = useRef("");
  const noSpeechRetriesRef = useRef(0);
  const lastStartReasonRef = useRef("manual");
  const context = useAppContext();
  const { toggleTask, toggleOrder, addTask, setTimeSavedToday } = context;

  const processCommand = useCallback(
    (cmd) => {
      const command = cmd.toLowerCase().trim();
      let action = null;
      let message = "";
      let timeSaved = 0;

      // Enhanced command parsing
      if (command.includes("done") || command.includes("complete")) {
        if (context.tasks && context.tasks.length > 0) {
          const incompleteTask = context.tasks.find((t) => !t.completed);
          if (incompleteTask) {
            toggleTask(incompleteTask.id);
            action = `Completed: "${incompleteTask.title}"`;
            message = `✅ Completed: "${incompleteTask.title}"`;
            timeSaved = 3;
          }
        }
      } else if (
        command.includes("ordered") ||
        command.includes("order placed") ||
        command.includes("order ready")
      ) {
        if (context.orders && context.orders.length > 0) {
          const incompleteOrder = context.orders.find((o) => !o.completed);
          if (incompleteOrder) {
            toggleOrder(incompleteOrder.id);
            action = `Ordered from: ${incompleteOrder.vendor}`;
            message = `✅ Order Complete: ${incompleteOrder.vendor}`;
            timeSaved = 5;
          }
        }
      } else if (command.includes("what") && command.includes("left")) {
        const incompleteTasks = context.tasks
          ? context.tasks.filter((t) => !t.completed)
          : [];
        const incompleteOrders = context.orders
          ? context.orders.filter((o) => !o.completed)
          : [];
        const count = incompleteTasks.length + incompleteOrders.length;
        action = `Status Check: ${count} items remaining`;
        message = `📊 ${count} items remaining (${incompleteTasks.length} tasks, ${incompleteOrders.length} orders)`;
        setActionPerformed(
          `${incompleteTasks.length} tasks, ${incompleteOrders.length} orders`,
        );
      } else if (
        command.includes("add task") ||
        command.includes("create task")
      ) {
        const taskName = command.replace(/add task|create task/g, "").trim();
        if (taskName) {
          addTask({
            title: taskName,
            assignee: "Unassigned",
            priority: "medium",
            dueTime: "",
          });
          action = `Task Created: ${taskName}`;
          message = `📝 Task Created: "${taskName}"`;
          timeSaved = 2;
        } else {
          message = "📝 Ready to create task - say task name";
          action = "Ready to add task via voice";
        }
      } else if (
        command.includes("summary") ||
        command.includes("status") ||
        command.includes("report")
      ) {
        const incompleteTasks = context.tasks
          ? context.tasks.filter((t) => !t.completed)
          : [];
        const totalTasks = context.tasks ? context.tasks.length : 0;
        const completionRate = totalTasks
          ? Math.round((1 - incompleteTasks.length / totalTasks) * 100)
          : 0;
        action = `Daily Report: ${completionRate}% complete`;
        message = `📊 Daily Report: ${completionRate}% complete`;
        setActionPerformed(
          `${incompleteTasks.length}/${totalTasks} remaining | ${completionRate}% progress`,
        );
      } else if (
        command.includes("quick task") ||
        command.includes("add quick")
      ) {
        message = "⚡ Quick task added";
        action = "Quick task mode activated";
      } else {
        message = `✓ Command recognized: "${command.substring(0, 50)}"`;
        action = command;
      }

      // Add to command history
      setCommandHistory((prev) => [
        {
          command: command.substring(0, 40),
          result: action,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev.slice(0, 4),
      ]);

      if (timeSaved > 0) {
        setTimeSavedToday((prev) => prev + timeSaved);
      }

      setStatus("success");
      setFeedback(message);
      setActionPerformed(action);

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    },
    [
      context.tasks,
      context.orders,
      toggleTask,
      toggleOrder,
      addTask,
      setTimeSavedToday,
      onClose,
    ],
  );

  useEffect(() => {
    if (!isActive) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFeedback("Speech recognition not supported");
      setStatus("error");
      return;
    }

    // Reset state
    setTranscript("");
    setInterimText("");
    transcriptRef.current = "";
    setStatus("idle");
    setFeedback("Click the microphone to start listening");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
      transcriptRef.current = "";
      setInterimText("");
      setStatus("listening");
      setFeedback("🎤 Listening...");
      setActionPerformed(null);
      setConfidence(0);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        confidence = Math.max(confidence, event.results[i][0].confidence);
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        transcriptRef.current += finalTranscript;
        setTranscript((prev) => prev + finalTranscript);
      }
      setInterimText(interimTranscript);
      setConfidence(Math.round(confidence * 100));

      if (finalTranscript || interimTranscript) {
        setStatus("listening");
        setFeedback("📝 " + (finalTranscript || interimTranscript));
      }
    };

    recognition.onerror = (event) => {
      // Ignore no-speech errors; we'll handle retries in onend
      if (event.error === "no-speech") {
        return;
      }
      setStatus("error");
      setFeedback(`❌ Error: ${event.error}`);
    };

    recognition.onend = () => {
      setListening(false);
      const finalTranscript = transcriptRef.current.trim();
      if (finalTranscript) {
        setStatus("processing");
        setFeedback("⚙️ Processing command...");
        processCommand(finalTranscript);
      } else if (autoStart || noSpeechRetriesRef.current < 2) {
        noSpeechRetriesRef.current += 1;
        setStatus("idle");
        setFeedback("Listening... speak your command");
        // Restart listening to give more time
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              startListening(lastStartReasonRef.current, false);
            } catch (e) {
              // Ignore restart errors
            }
          }
        }, 300);
      } else {
        setStatus("idle");
        setFeedback("No speech detected. Click mic to try again.");
      }
    };

    // Don't auto-start, wait for user to click the mic button

    return () => {
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {
          // Ignore errors on abort
        }
      }
    };
  }, [isActive, processCommand]);

  const startListening = async (reason = "manual", resetRetries = true) => {
    if (!recognitionRef.current) return;

    lastStartReasonRef.current = reason;
    if (resetRetries) {
      noSpeechRetriesRef.current = 0;
    }

    setStatus("listening");
    setFeedback("🎤 Requesting microphone...");

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Microphone error:", err);
      setStatus("error");
      setFeedback("🎤 Error: " + err.message);
    }
  };

  // Auto-start listening when opened by wake word
  useEffect(() => {
    if (autoStart && recognitionRef.current && !listening) {
      // Delay to ensure wake word listener has fully stopped
      const timer = setTimeout(() => {
        startListening("auto", true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoStart, listening]);

  const getStatusColor = () => {
    switch (status) {
      case "listening":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "listening":
        return (
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
        );
      case "processing":
        return <Zap size={16} />;
      case "success":
        return <CheckCircle2 size={16} />;
      case "error":
        return <AlertCircle size={16} />;
      default:
        return <Mic size={16} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "listening":
        return "Listening";
      case "processing":
        return "Processing";
      case "success":
        return "Success";
      case "error":
        return "Error";
      default:
        return "Ready";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 bg-white pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Volume2 className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark">Voice Assistant</h2>
              <p className="text-xs text-gray-600">Bay Ready Voice Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Status Badge with confidence */}
        <div className="flex justify-center gap-4 items-center">
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor()}`}
          >
            {getStatusIcon()}
            {getStatusText()}
          </div>
          {confidence > 0 && (
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <BarChart3 size={14} />
              {confidence}% confidence
            </div>
          )}
        </div>

        {/* Enhanced Waveform Visualization */}
        <div className="flex justify-center items-end gap-2 h-24 bg-gradient-to-b from-blue-50 to-transparent p-4 rounded-xl">
          {listening ? (
            <>
              {waveData.map((height, i) => (
                <div
                  key={i}
                  className="w-3 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full transition-all"
                  style={{
                    height: `${Math.max(20, height * 0.8)}px`,
                    opacity: 0.6 + height / 255,
                  }}
                />
              ))}
            </>
          ) : (
            <Volume2 className="text-blue-500 animate-bounce" size={48} />
          )}
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-dark mb-1">
            {listening ? "🎤 Listening for your command..." : "Ready to assist"}
          </p>
          <p className="text-sm text-gray-600 min-h-5">{feedback}</p>
        </div>

        {/* Real-time Transcription Display */}
        <div className="space-y-2">
          {interimText && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Hearing:</span>
                <span className="italic ml-2">{interimText}</span>
                <span className="animate-pulse ml-1">|</span>
              </p>
            </div>
          )}
          {transcript && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">You said:</span>
                <span className="ml-2">{transcript}</span>
              </p>
            </div>
          )}
        </div>

        {/* Action Confirmation with Animation */}
        {actionPerformed && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg space-y-2 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="text-green-600 flex-shrink-0 mt-0.5 animate-bounce"
                size={20}
              />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  ✓ Action Completed
                </p>
                <p className="text-sm text-green-700 font-medium">
                  {actionPerformed}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Command History */}
        {commandHistory.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 flex items-center gap-2">
              <Clock size={14} />
              Recent Commands
            </p>
            <div className="space-y-2">
              {commandHistory.map((cmd, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start text-xs"
                >
                  <div>
                    <p className="text-gray-700 font-medium truncate">
                      {cmd.command}
                    </p>
                    <p className="text-gray-500">{cmd.result}</p>
                  </div>
                  <span className="text-gray-400 whitespace-nowrap ml-2">
                    {cmd.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Control Button */}
        {!listening && (
          <button
            onClick={() => startListening("manual", true)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Mic size={24} className="animate-pulse" />
            Tap to Listen
          </button>
        )}

        {/* Quick Commands Reference */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3">
          <p className="text-xs font-bold text-blue-900 flex items-center gap-2">
            <Zap size={14} />
            Quick Commands
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs text-blue-800">
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">→</span>
              <span>"Done" or "Complete" - mark task done</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">→</span>
              <span>"Ordered" - mark order received</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">→</span>
              <span>"Add task [name]" - create new task</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">→</span>
              <span>"What's left?" - get summary</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">→</span>
              <span>"Summary" - daily report</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
