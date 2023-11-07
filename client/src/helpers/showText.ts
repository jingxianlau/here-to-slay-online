import { ClientStateObj } from '../types';

export const showText = (
  showHelperText: ClientStateObj['showHelperText'],
  text: string,
  timeout: number = 1200
) => {
  showHelperText.setText(text);
  showHelperText.set(true);

  showHelperText.setShowText(true);
  setTimeout(() => {
    showHelperText.setShowText(false);
  }, timeout);
};

export const setTimer = (
  timer: ClientStateObj['timer'],
  startTime: number = 30
) => {
  timer.maxTime.set(startTime);
  const seconds = Number(window.sessionStorage.getItem('timer-seconds'));
  const tenths = Number(window.sessionStorage.getItem('timer-tenths'));

  timer.settings.start({
    startValues:
      seconds || tenths
        ? {
            seconds: seconds,
            secondTenths: tenths
          }
        : {
            seconds: startTime,
            secondTenths: 0
          },
    target: {
      seconds: 0,
      secondTenths: 0
    }
  });
};
