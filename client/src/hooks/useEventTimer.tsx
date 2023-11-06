import useTimer from 'easytimer-react-hook';
import { useState } from 'react';

const useEventTimer = (duration: number) => {
  const [timer, targetAchieved] = useTimer({ updateWhenTargetAchieved: false });
  const [timerCb, setTimerCb] = useState<() => void>(() => {});
  timer.on('targetAchieved', () => {});
  timer.on('secondTenthsUpdated', () => {
    const timeValues = timer.getTimeValues();
    window.sessionStorage.setItem('timer-seconds', String(timeValues.seconds));
    window.sessionStorage.setItem(
      'timer-tenths',
      String(timeValues.secondTenths)
    );

    if (timeValues.seconds === 0 && timeValues.secondTenths === 0) {
      timer.stop();
      window.sessionStorage.clear();
    }
  });

  const onEnd = (cb: () => void) => {
    timer.off('targetAchieved', timerCb);
    timer.on('targetAchieved', cb);
    setTimerCb(cb);
  };

  return { timer, targetAchieved, onEnd };
};

export default useEventTimer;
