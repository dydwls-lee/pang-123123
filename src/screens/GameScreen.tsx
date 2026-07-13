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

const TIME_LIMIT_SECONDS = 45
const BALL_SCORE = 100
const TIME_BONUS_PER_SECOND = 10

type Status = 'playing' | 'clear' | 'fail' | 'gameover'

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

function createInitialBall(): Ball {
  return { x: GAME_WIDTH / 3, y: BALL_RADIUS, vx: BALL_START_VX, vy: 0 }
}

interface GameScreenProps {
  onBackToMain: () => void
}

function GameScreen({ onBackToMain }: GameScreenProps) {
  const [playerX, setPlayerX] = useState((GAME_WIDTH - PLAYER_WIDTH) / 2)
  const [wire, setWire] = useState<Wire | null>(null)
  const [ball, setBall] = useState<Ball | null>(createInitialBall)
  const [hp, setHp] = useState(HP_MAX)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS)
  const [score, setScore] = useState(0)
  const [status, setStatus] = useState<Status>('playing')

  const pressedKeys = useRef(new Set<string>())
  const playerXRef = useRef(playerX)
  const wireRef = useRef(wire)
  const ballRef = useRef(ball)
  const hpRef = useRef(hp)
  const scoreRef = useRef(0)
  const statusRef = useRef<Status>('playing')
  const startTimeRef = useRef<number | null>(null)
  const isTouchingBallRef = useRef(false)
  const runLoopRef = useRef<() => void>(() => {})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === ' ' &&
        !pressedKeys.current.has(e.key) &&
        !wireRef.current &&
        statusRef.current === 'playing'
      ) {
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

    const tick = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp
      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000
      const remaining = Math.max(0, TIME_LIMIT_SECONDS - elapsedSeconds)

      let nextPlayerX = playerXRef.current
      if (pressedKeys.current.has('ArrowLeft')) nextPlayerX -= PLAYER_SPEED
      if (pressedKeys.current.has('ArrowRight')) nextPlayerX += PLAYER_SPEED
      nextPlayerX = clamp(nextPlayerX, 0, GAME_WIDTH - PLAYER_WIDTH)

      let nextWire = wireRef.current
      if (nextWire) {
        const nextY = nextWire.y - WIRE_SPEED
        nextWire = nextY > 0 ? { ...nextWire, y: nextY } : null
      }

      let nextBall = ballRef.current
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
          scoreRef.current += BALL_SCORE
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
          hpRef.current = Math.max(0, hpRef.current - HP_DAMAGE)
        }
      } else {
        isTouchingBallRef.current = false
      }

      let nextStatus: Status = 'playing'
      if (hpRef.current <= 0) {
        nextStatus = 'gameover'
      } else if (nextBall === null) {
        nextStatus = 'clear'
        scoreRef.current += Math.floor(remaining) * TIME_BONUS_PER_SECOND
      } else if (remaining <= 0) {
        nextStatus = 'fail'
      }

      playerXRef.current = nextPlayerX
      wireRef.current = nextWire
      ballRef.current = nextBall
      statusRef.current = nextStatus

      setPlayerX(nextPlayerX)
      setWire(nextWire)
      setBall(nextBall)
      setHp(hpRef.current)
      setTimeLeft(remaining)
      setScore(scoreRef.current)
      setStatus(nextStatus)

      if (nextStatus === 'playing') {
        frameId = requestAnimationFrame(tick)
      }
    }

    runLoopRef.current = () => {
      startTimeRef.current = null
      frameId = requestAnimationFrame(tick)
    }
    runLoopRef.current()

    return () => cancelAnimationFrame(frameId)
  }, [])

  const handleRestart = () => {
    playerXRef.current = (GAME_WIDTH - PLAYER_WIDTH) / 2
    wireRef.current = null
    ballRef.current = createInitialBall()
    hpRef.current = HP_MAX
    scoreRef.current = 0
    statusRef.current = 'playing'
    isTouchingBallRef.current = false
    pressedKeys.current.clear()

    setPlayerX(playerXRef.current)
    setWire(null)
    setBall(ballRef.current)
    setHp(HP_MAX)
    setTimeLeft(TIME_LIMIT_SECONDS)
    setScore(0)
    setStatus('playing')

    runLoopRef.current()
  }

  const statusMessage: Record<Exclude<Status, 'playing'>, string> = {
    clear: '스테이지 클리어!',
    fail: '시간 초과! 실패했습니다.',
    gameover: '게임 오버',
  }

  return (
    <div className="game-screen">
      <div className="hud">
        <span>HP: {hp}</span>
        <span>남은 시간: {Math.ceil(timeLeft)}초</span>
        <span>점수: {score}</span>
      </div>
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

        {status !== 'playing' && (
          <div className="result-overlay">
            <p className="result-message">{statusMessage[status]}</p>
            <p className="result-score">최종 점수: {score}</p>
            <div className="result-buttons">
              <button type="button" className="back-button" onClick={handleRestart}>
                다시 시작
              </button>
              <button type="button" className="back-button" onClick={onBackToMain}>
                메인 화면으로
              </button>
            </div>
          </div>
        )}
      </div>
      <button type="button" className="back-button" onClick={onBackToMain}>
        메인 화면으로
      </button>
    </div>
  )
}

export default GameScreen
