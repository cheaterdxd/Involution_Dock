import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

function PomodoroTimer({ settings }) {
  const [minutes, setMinutes] = useState(settings.workDuration);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);

  useEffect(() => {
    // Reset timer when settings change
    resetTimer(isWorkSession);
  }, [settings]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          console.log(isWorkSession ? "Pomodoro: Time for a break!" : "Pomodoro: Back to work!");
          const nextIsWorkSession = !isWorkSession;
          setIsWorkSession(nextIsWorkSession);
          resetTimer(nextIsWorkSession);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const resetTimer = (workSession) => {
    setIsActive(false);
    const newMinutes = workSession ? settings.workDuration : settings.breakDuration;
    setMinutes(newMinutes);
    setSeconds(0);
  }

  const toggleTimer = () => setIsActive(!isActive);

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="flex items-center space-x-3 text-white">
      <p className={`font-mono text-lg ${isWorkSession ? 'text-green-400' : 'text-blue-400'}`}>
        {formattedTime}
      </p>
      <div className="flex items-center space-x-2">
        <button onClick={toggleTimer} title={isActive ? "Pause" : "Start"}>
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={() => resetTimer(isWorkSession)} title="Reset">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}

export default PomodoroTimer;
