import { ClientStateObj } from '../types';

export const showText = (
  showHelperText: ClientStateObj['showHelperText'],
  text: string,
  timeout: number = 800
) => {
  showHelperText.set(true);
  showHelperText.setText(text);
  showHelperText.setShowText(true);
  setTimeout(() => {
    showHelperText.setShowText(false);
  }, timeout);
  setTimeout(() => {
    showHelperText.set(false);
  }, timeout + 200);
};
