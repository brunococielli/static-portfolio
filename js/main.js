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

const systemHealth = {
  Clicker: true,
  Map: true,
  GitHub: true,
}

normalCount.textContent = personalCount.toLocaleString()
counterEl.textContent = '...'
setSyncingText()

//THEME LOGIC
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

function setAccent(colorName) {
  document.documentElement.style.setProperty('--accent', `var(--${colorName})`)
  localStorage.setItem('accent', colorName)
}

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  const savedAccent = localStorage.getItem('accent') || 'red'

  setTheme(savedTheme)
  setAccent(savedAccent)
})

//CLICKER LOGIC
async function init() {
  try {
    const res = await fetch(`${proxy}${encodeURIComponent(targetAPI)}`)
    const data = await res.json()
    const parsed = JSON.parse(data.contents)

    apiCount = parsed.count
    updateStatus('Clicker', true)
  } catch (e) {
    apiCount = 0
    updateStatus('Clicker', false)
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
      updateStatus('Clicker', true)

      await new Promise((r) => setTimeout(r, 100))
    } catch (e) {
      console.error('Sync interrupted', e)
      updateStatus('Clicker', false)
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

//MAP LOGIC
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

map.on('load', () => updateStatus('MapTiler', true))
map.on('error', () => updateStatus('MapTiler', false))

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

//GITHUB LOGIC
const GH_USER = 'brunococielli'

async function updateGithub() {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GH_USER}/events/public`
    )
    const events = await response.json()
    const lastPush = events.find((e) => e.type === 'PushEvent')

    if (lastPush) {
      const repoPath = lastPush.repo.name
      const repoName = repoPath.split('/')[1]
      const commitSha = lastPush.payload.head
      const commitRes = await fetch(
        `https://api.github.com/repos/${repoPath}/commits/${commitSha}`
      )
      const commitData = await commitRes.json()

      document.getElementById('gh-repo').textContent = repoName
      document.getElementById('gh-message').textContent =
        commitData.commit.message
      document.getElementById('gh-date').innerHTML =
        `${timeAgo(new Date(lastPush.created_at))} <span style="opacity:0.4; font-size:0.7rem;">[${commitSha.substring(0, 7)}]</span>`

      document.getElementById('gh-link').href = `https://github.com/${repoPath}`

      updateStatus('GitHub', true)
    }
  } catch (e) {
    console.error('GH Error:', e)
    updateStatus('GitHub', false)
  }
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = Math.floor(seconds / 3600)
  if (interval >= 1) return interval + 'h ago'
  interval = Math.floor(seconds / 60)
  if (interval >= 1) return interval + 'm ago'
  return Math.floor(seconds) + 's ago'
}

updateGithub()
setInterval(updateGithub, 300000)

//DOT LOGIC
function updateStatus(apiName, isSuccessful) {
  const dot = document.getElementById('status-dot')
  const statusDiv = document.querySelector('.status')

  systemHealth[apiName] = isSuccessful

  const allHealthy = Object.values(systemHealth).every(
    (status) => status === true
  )

  if (allHealthy) {
    dot.classList.remove('dot-offline')
    statusDiv.title = 'All systems operational'
  } else {
    dot.classList.add('dot-offline')

    const offlineApis = Object.keys(systemHealth).filter(
      (key) => !systemHealth[key]
    )
    statusDiv.title = `System Alert: Offline -> ${offlineApis.join(', ')}`
  }
}
