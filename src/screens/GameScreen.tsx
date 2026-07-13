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

const BALL_RADIUS = 25
const GRAVITY = 0.3
const BALL_START_VX = 4

interface Wire {
  x: number
  y: number
}

interface Ball {
  x: number
  y: number
  vx: number
  vy: number
}

interface GameScreenProps {
  onBackToMain: () => void
}

function GameScreen({ onBackToMain }: GameScreenProps) {
  const [playerX, setPlayerX] = useState((GAME_WIDTH - PLAYER_WIDTH) / 2)
  const [wire, setWire] = useState<Wire | null>(null)
  const [ball, setBall] = useState<Ball>({
    x: GAME_WIDTH / 3,
    y: BALL_RADIUS,
    vx: BALL_START_VX,
    vy: 0,
  })

  const pressedKeys = useRef(new Set<string>())
  const playerXRef = useRef(playerX)
  playerXRef.current = playerX

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !pressedKeys.current.has(e.key)) {
        setWire((prev) => prev ?? { x: playerXRef.current + PLAYER_WIDTH / 2, y: PLAYER_Y })
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

      setWire((prev) => {
        if (!prev) return prev
        const nextY = prev.y - WIRE_SPEED
        return nextY > 0 ? { ...prev, y: nextY } : null
      })

      setBall((prev) => {
        let { x, y, vx, vy } = prev
        vy += GRAVITY
        x += vx
        y += vy

        if (x - BALL_RADIUS < 0) {
          x = BALL_RADIUS
          vx = -vx
        } else if (x + BALL_RADIUS > GAME_WIDTH) {
          x = GAME_WIDTH - BALL_RADIUS
          vx = -vx
        }

        if (y - BALL_RADIUS < 0) {
          y = BALL_RADIUS
          vy = -vy
        } else if (y + BALL_RADIUS > GAME_HEIGHT) {
          y = GAME_HEIGHT - BALL_RADIUS
          vy = -vy
        }

        return { x, y, vx, vy }
      })

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
        <div
          className="ball"
          style={{
            left: ball.x - BALL_RADIUS,
            top: ball.y - BALL_RADIUS,
            width: BALL_RADIUS * 2,
            height: BALL_RADIUS * 2,
          }}
        />
        {wire && (
          <div
            className="wire"
            style={{
              left: wire.x - WIRE_WIDTH / 2,
              top: wire.y,
              width: WIRE_WIDTH,
              height: PLAYER_Y - wire.y,
            }}
          />
        )}
      </div>
      <button type="button" className="back-button" onClick={onBackToMain}>
        메인 화면으로
      </button>
    </div>
  )
}

export default GameScreen
