import useTimer from 'easytimer-react-hook';
import { TimerEvent } from 'easytimer.js';
import { useState } from 'react';

const useEventTimer = (duration: number) => {
  const [timer, targetAchieved] = useTimer({
    startValues: { seconds: 0 },
    target: { seconds: duration }
  });
  const [timerCb, setTimerCb] = useState<() => void>(() => {});
  timer.on('targetAchieved', () => {});

  const onEnd = (cb: () => void) => {
    timer.off('targetAchieved', timerCb);
    timer.on('targetAchieved', cb);
    setTimerCb(cb);
  };

  return { timer, targetAchieved, onEnd };
};

export default useEventTimer;
