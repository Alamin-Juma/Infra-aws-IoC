import { useState, useEffect, useCallback, useRef } from "react";
import config from "../configs/app.config";

interface UseInactivityMonitorProps {
  timeout?: number;
  warningTime?: number;
  onLogout?: () => void;
}

export function useInactivityMonitor({
  timeout = config.INACTIVITY_TIME * 1000,
  warningTime = config.INACTIVITY_WARNING_TIME * 1000,
  onLogout,
}: UseInactivityMonitorProps = {}) {
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(warningTime);

  const timeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const isWarningVisibleRef = useRef(false);
  const activityListenersActiveRef = useRef(false);
  const isPausedRef = useRef(false);

  const handleActivity = useCallback(() => {
    if (isPausedRef.current) return;

    resetTimer();
  }, []);

  const removeActivityListeners = useCallback(() => {
    if (!activityListenersActiveRef.current) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.removeEventListener(event, handleActivity, true);
    });

    activityListenersActiveRef.current = false;
  }, [handleActivity]);

  const addActivityListeners = useCallback(() => {
    if (activityListenersActiveRef.current) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    activityListenersActiveRef.current = true;
  }, [handleActivity]);

  const startInactivityTimer = useCallback(() => {
    timeoutRef.current = window.setTimeout(() => {
      isWarningVisibleRef.current = true;
      setIsWarningVisible(true);
      setRemainingTime(warningTime);

      let timeLeft = warningTime;
      countdownRef.current = window.setInterval(() => {
        timeLeft -= 1000;
        setRemainingTime(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(countdownRef.current!);
          handleLogout();
        }
      }, 1000);
    }, timeout);
  }, [timeout, warningTime]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (isWarningVisibleRef.current) {
      isWarningVisibleRef.current = false;
      setIsWarningVisible(false);
      setRemainingTime(warningTime);
      addActivityListeners();
    }

    startInactivityTimer();
  }, [warningTime, addActivityListeners, startInactivityTimer]);

  const handleStaySignedIn = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleLogout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    removeActivityListeners();
    isWarningVisibleRef.current = false;
    setIsWarningVisible(false);

    onLogout?.();
  }, [onLogout, removeActivityListeners]);

  const pauseActivityTracking = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resumeActivityTracking = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    addActivityListeners();
    startInactivityTimer();

    return () => {
      removeActivityListeners();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [addActivityListeners, startInactivityTimer, removeActivityListeners]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const checkListenersInterval = setInterval(() => {
      if (!activityListenersActiveRef.current) {
        addActivityListeners();
      }
    }, 5000);

    return () => clearInterval(checkListenersInterval);
  }, [addActivityListeners]);

  useEffect(() => {
    if (isWarningVisible) {
      pauseActivityTracking();
    } else {
      resumeActivityTracking();
    }
  }, [isWarningVisible, pauseActivityTracking, resumeActivityTracking]);

  return {
    isWarningVisible,
    remainingTime: formatTime(remainingTime),
    handleStaySignedIn,
    handleLogout,
    pauseActivityTracking,
    resumeActivityTracking,
    // Optional: triggerWarning if you want to manually trigger warning from outside
    triggerWarning: () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);

      removeActivityListeners();
      isWarningVisibleRef.current = true;
      setIsWarningVisible(true);
      setRemainingTime(warningTime);

      let timeLeft = warningTime;
      countdownRef.current = window.setInterval(() => {
        timeLeft -= 1000;
        setRemainingTime(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(countdownRef.current!);
          handleLogout();
        }
      }, 1000);
    },
  };
}
