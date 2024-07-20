
const Ship = ({ id, length }) => {
  return (
    <div className="ship" id={id} draggable="true" data-length={length}></div>
  );
};

export default Ship;
