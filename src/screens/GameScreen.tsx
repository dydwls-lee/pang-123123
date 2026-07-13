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

const HP_MAX = 100
const HP_DAMAGE = 10

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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function circleRectOverlap(
  circleX: number,
  circleY: number,
  radius: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
) {
  const closestX = clamp(circleX, rectX, rectX + rectWidth)
  const closestY = clamp(circleY, rectY, rectY + rectHeight)
  const dx = circleX - closestX
  const dy = circleY - closestY
  return dx * dx + dy * dy < radius * radius
}

interface GameScreenProps {
  onBackToMain: () => void
}

function GameScreen({ onBackToMain }: GameScreenProps) {
  const [playerX, setPlayerX] = useState((GAME_WIDTH - PLAYER_WIDTH) / 2)
  const [wire, setWire] = useState<Wire | null>(null)
  const [ball, setBall] = useState<Ball | null>({
    x: GAME_WIDTH / 3,
    y: BALL_RADIUS,
    vx: BALL_START_VX,
    vy: 0,
  })
  const [hp, setHp] = useState(HP_MAX)

  const pressedKeys = useRef(new Set<string>())
  const playerXRef = useRef(playerX)
  const wireRef = useRef(wire)
  const isTouchingBallRef = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !pressedKeys.current.has(e.key) && !wireRef.current) {
        const newWire = { x: playerXRef.current + PLAYER_WIDTH / 2, y: PLAYER_Y }
        wireRef.current = newWire
        setWire(newWire)
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
      let nextPlayerX = playerXRef.current
      if (pressedKeys.current.has('ArrowLeft')) nextPlayerX -= PLAYER_SPEED
      if (pressedKeys.current.has('ArrowRight')) nextPlayerX += PLAYER_SPEED
      nextPlayerX = clamp(nextPlayerX, 0, GAME_WIDTH - PLAYER_WIDTH)
      playerXRef.current = nextPlayerX
      setPlayerX(nextPlayerX)

      let nextWire = wireRef.current
      if (nextWire) {
        const nextY = nextWire.y - WIRE_SPEED
        nextWire = nextY > 0 ? { ...nextWire, y: nextY } : null
      }

      setBall((prevBall) => {
        let nextBall = prevBall

        if (nextBall) {
          let { x, y, vx, vy } = nextBall
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

          nextBall = { x, y, vx, vy }
        }

        if (nextBall && nextWire) {
          const dx = nextBall.x - nextWire.x
          const dy = nextBall.y - clamp(nextBall.y, nextWire.y, PLAYER_Y)
          if (dx * dx + dy * dy < (BALL_RADIUS + WIRE_WIDTH / 2) ** 2) {
            nextBall = null
            nextWire = null
          }
        }

        if (
          nextBall &&
          circleRectOverlap(
            nextBall.x,
            nextBall.y,
            BALL_RADIUS,
            nextPlayerX,
            PLAYER_Y,
            PLAYER_WIDTH,
            PLAYER_HEIGHT,
          )
        ) {
          if (!isTouchingBallRef.current) {
            isTouchingBallRef.current = true
            setHp((prevHp) => Math.max(0, prevHp - HP_DAMAGE))
          }
        } else {
          isTouchingBallRef.current = false
        }

        return nextBall
      })

      wireRef.current = nextWire
      setWire(nextWire)

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <div className="game-screen">
      <div className="hud">HP: {hp}</div>
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
        {ball && (
          <div
            className="ball"
            style={{
              left: ball.x - BALL_RADIUS,
              top: ball.y - BALL_RADIUS,
              width: BALL_RADIUS * 2,
              height: BALL_RADIUS * 2,
            }}
          />
        )}
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
