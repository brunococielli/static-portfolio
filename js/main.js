const counterEl = document.getElementById('counter')
const clickBtn = document.getElementById('clickBtn')
const normalCount = document.getElementById('normalCount')
const statusEl = document.getElementById('sync-status')

const targetAPI =
  'https://api.counterapi.dev/v1/bruno-cociellis-team-3399/clicks'
const proxy = 'https://api.allorigins.win/get?url='

let apiCount = 0
let personalCount = Number(localStorage.getItem('personalCount')) || 0
let pendingClicks = Number(localStorage.getItem('pendingClicks')) || 0
let maxSeen = Number(localStorage.getItem('maxSeenCount')) || 0

normalCount.textContent = personalCount.toLocaleString()
counterEl.textContent = '...'
setSyncingText()

async function init() {
  try {
    const res = await fetch(`${proxy}${encodeURIComponent(targetAPI)}`)
    const data = await res.json()
    const parsed = JSON.parse(data.contents)

    apiCount = parsed.count
  } catch {
    apiCount = 0
  }

  const localTotal = maxSeen
  const apiTotal = apiCount

  maxSeen = Math.max(localTotal, apiTotal)

  counterEl.textContent = maxSeen.toLocaleString()
  setSyncingText()
  localStorage.setItem('maxSeenCount', maxSeen)
}

init()

clickBtn.addEventListener('click', () => {
  personalCount++
  pendingClicks++
  maxSeen++

  normalCount.textContent = personalCount.toLocaleString()
  counterEl.textContent = maxSeen.toLocaleString()

  localStorage.setItem('personalCount', personalCount)
  localStorage.setItem('pendingClicks', pendingClicks)
  localStorage.setItem('maxSeenCount', maxSeen)

  if (pendingClicks >= 20) {
    syncClicks()
  }
})

let syncing = false

async function syncClicks() {
  if (syncing || pendingClicks === 0) return

  syncing = true

  while (pendingClicks > 0) {
    try {
      await fetch(`${targetAPI}/up`, { mode: 'no-cors' })
      pendingClicks--
      localStorage.setItem('pendingClicks', pendingClicks)

      await new Promise((r) => setTimeout(r, 100))
    } catch (e) {
      console.error('Sync interrupted', e)
      break
    }
  }

  syncing = false
}

setInterval(() => {
  if (pendingClicks > 0) {
    syncClicks()
  }
}, 3000)

function setSyncingText() {
  if (counterEl.textContent === '...') {
    statusEl.style.opacity = '1'
  } else {
    statusEl.style.opacity = '0'
  }
}

const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
}

const setAccent = (colorName) => {
  document.documentElement.style.setProperty('--accent', `var(--${colorName})`)
}

const MAPTILER_KEY = 'jrgSeWvWvZCzG5Qsld0w'
maptilersdk.config.apiKey = MAPTILER_KEY

const map = new maptilersdk.Map({
  container: 'map',
  style: maptilersdk.MapStyle.DATAVIZ.DARK,
  center: [-47.0608, -22.9064],
  zoom: 11,

  dragPan: true,
  scrollZoom: true,
  doubleClickZoom: true,
  touchZoomRotate: true,
  navigationControl: false,
  geolocateControl: false,
  attributionControl: false,
})

function updateLocationTime() {
  const timeEl = document.getElementById('local-time')
  if (!timeEl) return

  const options = {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }

  timeEl.textContent = new Date().toLocaleTimeString('en-GB', options)
}

setInterval(updateLocationTime, 1000)
updateLocationTime()