import './MainScreen.css'

const HIGH_SCORE_KEY = 'pang_highscore'

function getHighScore(): number {
  const stored = localStorage.getItem(HIGH_SCORE_KEY)
  return stored ? Number(stored) : 0
}

interface MainScreenProps {
  onStart: () => void
}

function MainScreen({ onStart }: MainScreenProps) {
  return (
    <div className="main-screen">
      <h1 className="title">PANG</h1>

      <button type="button" className="start-button" onClick={onStart}>
        시작하기
      </button>

      <div className="controls-hint">
        <h2>조작 방법</h2>
        <p>← / → : 이동</p>
        <p>Space : 와이어 발사</p>
      </div>

      <p className="high-score">최고 점수: {getHighScore()}</p>
    </div>
  )
}

export default MainScreen
