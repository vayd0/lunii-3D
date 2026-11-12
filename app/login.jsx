'use client'

import { useState } from 'react'

const PERMS = [
  { ok: true, text: 'Voir ton pseudo et ton avatar' },
  { ok: true, text: 'Sauvegarder tes points et tes régions visitées' },
  { ok: false, text: 'Lire tes histoires Bluni' },
]

export function Login({ onDone }) {
  const [step, setStep] = useState('start')

  const authorize = () => {
    setStep('wait')
    setTimeout(onDone, 900)
  }

  return (
    <div className="login">
      {step === 'start' && (
        <button className="bluni-btn" onClick={() => setStep('consent')}>
          <img src="/bluni.png" alt="" />
          Se connecter avec Bluni
        </button>
      )}
      {step === 'consent' && (
        <div className="oauth">
          <div className="oauth-body">
            <div className="oauth-avatars">
              <img className="oauth-app" src="/lunii.png" alt="Lunii 3D" />
              <i />
              <i />
              <i />
              <img className="oauth-user" src="/bluni.png" alt="" />
            </div>
            <h2>Lunii 3D</h2>
            <p className="oauth-sub">souhaite accéder à ton compte Bluni</p>
            <hr />
            <h3>Cela permettra à Lunii 3D de :</h3>
            <ul className="oauth-perms">
              {PERMS.map((p) => (
                <li key={p.text} className={p.ok ? 'ok' : 'no'}>
                  <span>{p.ok ? '✓' : '✕'}</span>
                  {p.text}
                </li>
              ))}
            </ul>
            <hr />
            <ul className="oauth-info">
              <li>Une fois autorisé, tu seras redirigé vers Lunii 3D</li>
              <li>Tu peux retirer cet accès à tout moment depuis Bluni</li>
            </ul>
          </div>
          <div className="oauth-foot">
            <button type="button" className="oauth-cancel" onClick={() => setStep('start')}>
              Annuler
            </button>
            <button type="button" className="oauth-ok" onClick={authorize}>
              Autoriser
            </button>
          </div>
        </div>
      )}
      {step === 'wait' && (
        <div className="oauth">
          <div className="oauth-body">
            <img className="oauth-logo spin" src="/bluni.png" alt="" />
            <p className="oauth-sub">Redirection vers Lunii 3D…</p>
          </div>
        </div>
      )}
    </div>
  )
}
