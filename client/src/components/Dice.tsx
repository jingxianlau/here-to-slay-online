import React, { useEffect, useState } from 'react';
import '../style/dice.css';
import { random } from 'lodash';

const Dice: React.FC<{ roll1: number; roll2: number; total: number }> = ({
  roll1,
  roll2,
  total
}) => {
  const [face1, setFace1] = useState(1);
  const [face2, setFace2] = useState(1);

  useEffect(() => {
    if (total) {
      setFace1(random(1, 6));
      setFace2(random(1, 6));
      let i = 0;
      let int = setInterval(() => {
        if (++i === 20) {
          clearInterval(int);
          setFace1(roll1);
          setFace2(roll2);
        } else {
          setFace1(random(1, 6));
          setFace2(random(1, 6));
        }
      }, 35);
    } else {
      setFace1(roll1);
      setFace2(roll2);
    }
  }, [roll1, roll2]);

  return (
    <>
      <div className='container'>
        <div id='dice1' className={`dice dice-one show-${face1}`}>
          <div id='dice-one-side-one' className='side one'>
            <div className='dot one-1'></div>
          </div>
          <div id='dice-one-side-two' className='side two'>
            <div className='dot two-1'></div>
            <div className='dot two-2'></div>
          </div>
          <div id='dice-one-side-three' className='side three'>
            <div className='dot three-1'></div>
            <div className='dot three-2'></div>
            <div className='dot three-3'></div>
          </div>
          <div id='dice-one-side-four' className='side four'>
            <div className='dot four-1'></div>
            <div className='dot four-2'></div>
            <div className='dot four-3'></div>
            <div className='dot four-4'></div>
          </div>
          <div id='dice-one-side-five' className='side five'>
            <div className='dot five-1'></div>
            <div className='dot five-2'></div>
            <div className='dot five-3'></div>
            <div className='dot five-4'></div>
            <div className='dot five-5'></div>
          </div>
          <div id='dice-one-side-six' className='side six'>
            <div className='dot six-1'></div>
            <div className='dot six-2'></div>
            <div className='dot six-3'></div>
            <div className='dot six-4'></div>
            <div className='dot six-5'></div>
            <div className='dot six-6'></div>
          </div>
        </div>
      </div>
      <div className='container'>
        <div id='dice2' className={`dice dice-two show-${face2}`}>
          <div id='dice-two-side-one' className='side one'>
            <div className='dot one-1'></div>
          </div>
          <div id='dice-two-side-two' className='side two'>
            <div className='dot two-1'></div>
            <div className='dot two-2'></div>
          </div>
          <div id='dice-two-side-three' className='side three'>
            <div className='dot three-1'></div>
            <div className='dot three-2'></div>
            <div className='dot three-3'></div>
          </div>
          <div id='dice-two-side-four' className='side four'>
            <div className='dot four-1'></div>
            <div className='dot four-2'></div>
            <div className='dot four-3'></div>
            <div className='dot four-4'></div>
          </div>
          <div id='dice-two-side-five' className='side five'>
            <div className='dot five-1'></div>
            <div className='dot five-2'></div>
            <div className='dot five-3'></div>
            <div className='dot five-4'></div>
            <div className='dot five-5'></div>
          </div>
          <div id='dice-two-side-six' className='side six'>
            <div className='dot six-1'></div>
            <div className='dot six-2'></div>
            <div className='dot six-3'></div>
            <div className='dot six-4'></div>
            <div className='dot six-5'></div>
            <div className='dot six-6'></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dice;
