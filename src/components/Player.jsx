import { useState } from 'react'


const PlayerSelection = ({ onPlayerSelect }) => {
    const [player1, setPlayer1] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault();
        if (player1) {
            onPlayerSelect(player1)
        } else {
            alert('Escribe tú nombre.')
        }
    }

    return (
        <form className='start-players' onSubmit={handleSubmit}>
            <div>
                <label>Player 1</label>
                <input type="text" value={player1} onChange={(e) => setPlayer1(e.target.value)} />
            </div>
            <button type="submit">Start Battle</button>
        </form>
    )
}

export default PlayerSelection