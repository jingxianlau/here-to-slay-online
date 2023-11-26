import useClientContext from '../hooks/useClientContext';

const HelperText: React.FC = () => {
  const {
    state: { val: state },
    showHelperText
  } = useClientContext();

  return (
    <div
      className={`helper-text-container ${
        !showHelperText.val ? 'disappear' : ''
      } ${showHelperText.showText ? 'show' : 'hide'}`}
    >
      <>
        <h3>{showHelperText.text}</h3>
        <h4>{state.match.players[state.turn.player]}</h4>
      </>
    </div>
  );
};

export default HelperText;
