import React, { useEffect, useState } from 'react';
import useClientContext from '../hooks/useClientContext';
import { TimeCounter } from 'easytimer.js';

const HelperText: React.FC = () => {
  const { showHelperText, timer } = useClientContext();
  const [timeValues, setTimeValues] = useState({} as TimeCounter);

  useEffect(() => {
    setTimeValues(timer.settings.getTimeValues());
  }, [timer]);
  return (
    <div
      className={`timer
      ${showHelperText.val ? 'show' : 'hide'}
      ${
        showHelperText.showText || !timer.settings.isRunning() ? 'text' : 'time'
      }`}
      style={
        !showHelperText.showText && !timer.settings.isRunning()
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
      <div
        className={`time-bar
        ${
          !showHelperText.showText && timer.settings.isRunning()
            ? 'show'
            : 'hide'
        }`}
        style={
          timer.settings.isRunning()
            ? {
                width: `${
                  (timeValues.seconds * 10 + timeValues.secondTenths) / 3
                }%`
              }
            : { width: '100%' }
        }
      ></div>
    </div>
  );
};

export default HelperText;
