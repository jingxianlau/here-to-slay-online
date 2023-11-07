import useTimer from 'easytimer-react-hook';
import { useState } from 'react';

const useEventTimer = () => {
  const [targetAchievedFunc, setTargetAchieved] = useState(() => () => {});
  const [timer, targetAchieved] = useTimer({
    target: {
      secondTenths: 0,
      seconds: 0
    },
    countdown: true,
    precision: 'secondTenths'
  });
  timer.removeAllEventListeners();
  timer.on('secondTenthsUpdated', () => {
    const timeValues = timer.getTimeValues();
    window.sessionStorage.setItem('timer-seconds', String(timeValues.seconds));
    window.sessionStorage.setItem(
      'timer-tenths',
      String(timeValues.secondTenths)
    );

    if (targetAchieved) {
      window.sessionStorage.clear();
    }
  });
  timer.on('targetAchieved', targetAchievedFunc);

  return {
    timer,
    setTargetAchieved: (func: () => void) => setTargetAchieved(() => func)
  };
};

export default useEventTimer;
