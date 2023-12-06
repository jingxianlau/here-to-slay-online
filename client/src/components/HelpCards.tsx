import React from 'react';

const HelpCards: React.FC<{ showHelp: boolean }> = ({ showHelp }) => {
  return (
    <>
      <div className={`help-cards${showHelp ? ' show' : ' hide'}`}>
        <div className='img-container'>
          <img
            src='https://jingxianlau.github.io/here-to-slay/assets/help/help-front.jpg'
            alt='help card 1'
            className='small-enlarged'
            draggable='false'
          />
        </div>
        <div className='img-container'>
          <img
            src='https://jingxianlau.github.io/here-to-slay/assets/help/help-back.jpg'
            alt='help card 2'
            className='small-enlarged'
            draggable='false'
          />
        </div>
      </div>
    </>
  );
};

export default HelpCards;
