import { useEffect, useRef, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";

export default function WakeWordListener({
  onWakeWordDetected,
  isVoiceAssistantOpen,
}) {
  const { settings } = useAppContext();
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const intervalRef = useRef(null);
  const lastListenTimeRef = useRef(0);
  const LISTEN_INTERVAL = 8000; // Check every 8 seconds

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null;
      listeningRef.current = false;
    }
  }, []);

  const startListeningSession = useCallback(() => {
    // Don't start if already listening or voice assistant is open
    if (listeningRef.current || isVoiceAssistantOpen) return;
    if (!settings.voiceEnabled || !settings.wakeWord) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    listeningRef.current = true;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("🎤 Listening for wake word:", settings.wakeWord);
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const current = event.results[i][0].transcript.toLowerCase();
        if (event.results[i].isFinal) {
          transcript = current;
        }
      }

      if (transcript && transcript.includes(settings.wakeWord.toLowerCase())) {
        console.log("✅ Wake word detected! Transcript:", transcript);
        listeningRef.current = false;
        try {
          recognition.abort();
        } catch (e) {
          // Ignore
        }
        onWakeWordDetected();
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      listeningRef.current = false;
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.log("Could not start recognition:", e);
      listeningRef.current = false;
      recognitionRef.current = null;
    }
  }, [
    settings.voiceEnabled,
    settings.wakeWord,
    isVoiceAssistantOpen,
    onWakeWordDetected,
  ]);

  useEffect(() => {
    // Check if page is visible and voice is enabled
    const isPageVisible = document.visibilityState === "visible";
    const shouldListen =
      isPageVisible &&
      settings.voiceEnabled &&
      settings.wakeWord &&
      !isVoiceAssistantOpen;

    if (shouldListen) {
      // Start listening immediately
      startListeningSession();

      // Set up interval to restart listening every 5 seconds
      intervalRef.current = setInterval(() => {
        if (!listeningRef.current && !isVoiceAssistantOpen) {
          startListeningSession();
        }
      }, 5000);
    } else {
      // Clear interval and stop listening
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stopListening();
    }

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopListening();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopListening();
    };
  }, [
    settings.voiceEnabled,
    settings.wakeWord,
    isVoiceAssistantOpen,
    startListeningSession,
    stopListening,
  ]);

  return null;
}
