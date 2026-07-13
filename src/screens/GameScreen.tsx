import { useEffect, useRef, useState } from 'react'
import './GameScreen.css'

const GAME_WIDTH = 800
const GAME_HEIGHT = 600
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 20
const PLAYER_Y = GAME_HEIGHT - PLAYER_HEIGHT - 10
const PLAYER_SPEED = 6
const WIRE_SPEED = 10
const WIRE_WIDTH = 3

interface Wire {
  id: number
  x: number
  y: number
}

interface GameScreenProps {
  onBackToMain: () => void
}

function GameScreen({ onBackToMain }: GameScreenProps) {
  const [playerX, setPlayerX] = useState((GAME_WIDTH - PLAYER_WIDTH) / 2)
  const [wires, setWires] = useState<Wire[]>([])

  const pressedKeys = useRef(new Set<string>())
  const nextWireId = useRef(0)
  const playerXRef = useRef(playerX)
  playerXRef.current = playerX

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !pressedKeys.current.has(e.key)) {
        setWires((prev) => [
          ...prev,
          { id: nextWireId.current++, x: playerXRef.current + PLAYER_WIDTH / 2, y: PLAYER_Y },
        ])
      }
      pressedKeys.current.add(e.key)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    let frameId: number

    const tick = () => {
      setPlayerX((x) => {
        let next = x
        if (pressedKeys.current.has('ArrowLeft')) next -= PLAYER_SPEED
        if (pressedKeys.current.has('ArrowRight')) next += PLAYER_SPEED
        return Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, next))
      })

      setWires((prev) =>
        prev
          .map((wire) => ({ ...wire, y: wire.y - WIRE_SPEED }))
          .filter((wire) => wire.y > 0),
      )

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <div className="game-screen">
      <div className="game-area" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        <div
          className="player"
          style={{
            left: playerX,
            top: PLAYER_Y,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
          }}
        />
        {wires.map((wire) => (
          <div
            key={wire.id}
            className="wire"
            style={{
              left: wire.x - WIRE_WIDTH / 2,
              top: wire.y,
              width: WIRE_WIDTH,
              height: PLAYER_Y - wire.y,
            }}
          />
        ))}
      </div>
      <button type="button" className="back-button" onClick={onBackToMain}>
        메인 화면으로
      </button>
    </div>
  )
}

export default GameScreen
