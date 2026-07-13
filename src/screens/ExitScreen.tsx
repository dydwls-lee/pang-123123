import './ExitScreen.css'

interface ExitScreenProps {
  onBackToMain: () => void
}

function ExitScreen({ onBackToMain }: ExitScreenProps) {
  return (
    <div className="exit-screen">
      <h2>플레이해주셔서 감사합니다</h2>
      <p>게임을 종료했습니다. 이 탭을 닫으셔도 됩니다.</p>
      <button type="button" className="restart-button" onClick={onBackToMain}>
        메인 화면으로
      </button>
    </div>
  )
}

export default ExitScreen
