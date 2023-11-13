import { ClientStateObj } from '../types';

export const showText = (
  showHelperText: ClientStateObj['showHelperText'],
  text: string,
  timeout: number = 1000
) => {
  showHelperText.set(true);
  showHelperText.setText(text);
  showHelperText.setShowText(true);
  setTimeout(() => {
    showHelperText.setShowText(false);
  }, timeout);
  setTimeout(() => {
    showHelperText.set(false);
    showHelperText.setText('');
  }, timeout + 200);
};
