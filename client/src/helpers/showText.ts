import { ClientStateObj } from '../types';

export const showText = (
  showHelperText: ClientStateObj['showHelperText'],
  text: string,
  activate: boolean,
  timeout: number = 1200
) => {
  showHelperText.setText(text);
  showHelperText.set(true);

  if (activate) {
    showHelperText.setShowText(true);
    setTimeout(() => {
      showHelperText.setShowText(false);
    }, timeout);
  }
};

// export const setTimer = (
//   timer: ClientStateObj['timer'],
//   newTimer = false,
//   startTime: number = 30
// ) => {
//   timer.maxTime.set(startTime);
//   const seconds = Number(window.sessionStorage.getItem('timer-seconds'));
//   const tenths = Number(window.sessionStorage.getItem('timer-tenths'));

//   timer.settings.stop();
//   timer.settings.start({
//     startValues: newTimer
//       ? {
//           seconds: startTime,
//           secondTenths: 0
//         }
//       : seconds && tenths
//       ? {
//           seconds: seconds,
//           secondTenths: tenths
//         }
//       : {},
//     target: {
//       seconds: 0,
//       secondTenths: 0
//     }
//   });
// };
