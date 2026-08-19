import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppProvider } from './store'
import App from './App.tsx'

const bootSplashHtml =
  '<style>#boot-splash{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:#fff}#boot-splash .boot-spinner{width:64px;height:64px;border-radius:9999px;border:5px solid #fde7ea;border-top-color:#f7566d;animation:boot-spin .9s linear infinite}@keyframes boot-spin{to{transform:rotate(360deg)}}</style><div class="boot-spinner"></div>'

function showBootSplash() {
  if (document.getElementById('boot-splash')) return
  const splash = document.createElement('div')
  splash.id = 'boot-splash'
  splash.setAttribute('aria-hidden', 'true')
  splash.innerHTML = bootSplashHtml
  document.body.prepend(splash)
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    showBootSplash()
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
