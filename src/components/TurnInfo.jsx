
const TurnInfo = ({ turnDisplay }) => {
  return (
    <div id="game-info">
      <p>🕹️ Turno: <span id="turn-display">{turnDisplay}</span></p>
    </div>
  );
};

export default TurnInfo;
