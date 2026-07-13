import './GameScreen.css'

interface GameScreenProps {
  onBackToMain: () => void
}

function GameScreen({ onBackToMain }: GameScreenProps) {
  return (
    <div className="game-screen">
      <p>Mission 1 (준비 중)</p>
      <button type="button" className="back-button" onClick={onBackToMain}>
        메인 화면으로
      </button>
    </div>
  )
}

export default GameScreen
