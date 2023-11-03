import React from 'react';
import useClientContext from '../hooks/useClientContext';

const HelperText: React.FC = () => {
  const { showHelperText, timer } = useClientContext();
  return (
    <div
      className={`timer
      ${showHelperText.val ? 'show' : 'hide'}
      ${
        showHelperText.showText || !timer.settings.isRunning() ? 'text' : 'time'
      }`}
      style={
        !showHelperText.showText && timer.settings.isRunning()
          ? {
              background: `linear-gradient(to right, #fc7c37 ${
                (timer.settings.getTimeValues().seconds / 30) * 99
              }%, 0, #fc7c37 ${
                (timer.settings.getTimeValues().seconds / 30) * 100
              }%, #111 ${(timer.settings.getTimeValues().seconds / 30) * 101}%)`
            }
          : !showHelperText.showText
          ? {
              background: 'transparent',
              boxShadow: 'transparent 0 0 5px 8px'
            }
          : {}
      }
      onMouseOver={() => showHelperText.setShowText(true)}
      onMouseOut={() => showHelperText.setShowText(false)}
    >
      <h3
        className={`helper-text ${showHelperText.showText ? 'show' : 'hide'}`}
      >
        {showHelperText.text}
      </h3>
    </div>
  );
};

export default HelperText;
