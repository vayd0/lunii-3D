'use client'

import { useEffect, useState } from 'react'

let story

export function unlockStory() {
  if (story) return story.ctx.resume()
  const el = new Audio('/histoire.m4a')
  el.preload = 'auto'
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const gain = ctx.createGain()
  ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination)
  story = { el, ctx, gain, ready: null }
  el.muted = true
  story.ready = el
    .play()
    .then(() => el.pause())
    .catch(() => {})
    .finally(() => {
      el.currentTime = 0
      el.muted = false
    })
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function Player() {
  const [playing, setPlaying] = useState(false)
  const [vol, setVol] = useState(0.8)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)

  useEffect(() => {
    unlockStory()
    const { el, ctx } = story
    const sync = () => setPlaying(!el.paused)
    const tick = () => {
      setTime(el.currentTime)
      setDur(el.duration || 0)
    }
    const events = [['play', sync], ['pause', sync], ['ended', sync], ['timeupdate', tick], ['loadedmetadata', tick]]
    events.forEach(([e, f]) => el.addEventListener(e, f))
    let alive = true
    story.ready.then(() => {
      if (!alive) return
      el.currentTime = 0
      ctx.resume()
      el.play().catch(sync)
    })
    return () => {
      alive = false
      el.pause()
      events.forEach(([e, f]) => el.removeEventListener(e, f))
    }
  }, [])

  useEffect(() => {
    story.gain.gain.value = vol
  }, [vol])

  const toggle = () => {
    const { el, ctx } = story
    ctx.resume()
    if (el.paused) el.play()
    else el.pause()
  }

  return (
    <div className="player">
      <button className="player-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Lecture'}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
        </svg>
      </button>
      <div className="player-mid">
        <div className="player-title">L&apos;histoire</div>
        <div className="player-bar">
          <i style={{ width: `${dur ? (time / dur) * 100 : 0}%` }} />
        </div>
        <div className="player-time">
          {fmt(time)} / {fmt(dur)}
        </div>
      </div>
      <label className="player-vol">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M4 9h4l5-4v14l-5-4H4z" />
          {vol > 0 && <path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />}
          {vol > 0.5 && <path d="M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />}
        </svg>
        <input type="range" min="0" max="1" step="0.01" value={vol} onChange={(e) => setVol(Number(e.target.value))} aria-label="Volume" />
      </label>
    </div>
  )
}
