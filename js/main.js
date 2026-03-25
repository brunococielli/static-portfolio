const statusEl = document.getElementById('sync-status')

const targetAPI =
  'https://api.counterapi.dev/v1/bruno-cociellis-team-3399/clicks'
const proxy = 'https://api.allorigins.win/get?url='

/*let apiCount = 0
let personalCount = Number(localStorage.getItem('personalCount')) || 0
let pendingClicks = Number(localStorage.getItem('pendingClicks')) || 0
let maxSeen = Number(localStorage.getItem('maxSeenCount')) || 0
let syncing = false
let clickListenerAttached = false*/

const systemHealth = {
 /* Clicker: true,*/
  Map: true,
  GitHub: true,
}

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
/*async function initClicker() {
  const counterEl = document.getElementById('counter')
  const normalCount = document.getElementById('normalCount')
  const clickBtn = document.getElementById('clickBtn')

  if (!counterEl || !clickBtn) return

  normalCount.textContent = personalCount.toLocaleString()
  if (counterEl.textContent === '') counterEl.textContent = '...'

  updateSyncingUI()

  try {
    const res = await fetch(`${proxy}${encodeURIComponent(targetAPI)}`)
    const data = await res.json()
    const parsed = JSON.parse(data.contents)

    apiCount = parsed.count
    maxSeen = Math.max(maxSeen, apiCount)

    counterEl.textContent = maxSeen.toLocaleString()
    localStorage.setItem('maxSeenCount', maxSeen)
    updateStatus('Clicker', true)
  } catch (e) {
    updateStatus('Clicker', false)
  }

  updateSyncingUI()

  if (!clickListenerAttached) {
    clickBtn.addEventListener('click', () => {
      personalCount++
      pendingClicks++
      maxSeen++

      document.getElementById('normalCount').textContent =
        personalCount.toLocaleString()
      document.getElementById('counter').textContent = maxSeen.toLocaleString()

      localStorage.setItem('personalCount', personalCount)
      localStorage.setItem('pendingClicks', pendingClicks)
      localStorage.setItem('maxSeenCount', maxSeen)

      updateSyncingUI()
      if (pendingClicks >= 20) syncClicks()
    })
    clickListenerAttached = true
  }
}

async function syncClicks() {
  if (syncing || pendingClicks <= 0) return
  syncing = true

  updateSyncingUI()

  try {
    while (pendingClicks > 0) {
      fetch(`${targetAPI}/up`, { mode: 'no-cors' })

      pendingClicks--
      localStorage.setItem('pendingClicks', pendingClicks)

      if (pendingClicks % 5 === 0) updateSyncingUI()

      await new Promise((r) => setTimeout(r, 100))
    }
    updateStatus('Clicker', true)
  } catch (e) {
    updateStatus('Clicker', false)
  } finally {
    syncing = false
    updateSyncingUI()
  }
}

function updateSyncingUI() {
  const statusEl = document.getElementById('sync-status')
  const counterEl = document.getElementById('counter')
  if (!statusEl || !counterEl) return

  const isInitialLoad = counterEl.textContent === '...'
  const hasPending = pendingClicks > 0

  if (isInitialLoad || hasPending || syncing) {
    statusEl.style.opacity = '1'
  } else {
    statusEl.style.opacity = '0'
  }
}

setInterval(() => {
  if (pendingClicks > 0) syncClicks()
}, 3000)*/

//MAP LOGIC
let mapInstance = null
const MAPTILER_KEY = 'jrgSeWvWvZCzG5Qsld0w'
maptilersdk.config.apiKey = MAPTILER_KEY

function initMap() {
  const mapContainer = document.getElementById('map')

  if (!mapContainer) return

  if (mapInstance) {
    mapInstance.resize()
    return
  }

  mapInstance = new maptilersdk.Map({
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

  mapInstance.on('load', () => updateStatus('MapTiler', true))
  mapInstance.on('error', () => updateStatus('MapTiler', false))
}

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

//ROUTER LOGIC
history.scrollRestoration = 'manual'

const pages = document.querySelectorAll('.page')
const links = document.querySelectorAll('nav a')

function showPage(id) {
  let found = false

  pages.forEach((page) => {
    if (page.id === id) {
      page.classList.add('active')
      found = true

      if (id === 'home') {
        if (typeof initClicker === 'function') initClicker()
        if (typeof initMap === 'function') initMap()
        if (typeof updateGithub === 'function') updateGithub()
      }
    } else {
      page.classList.remove('active')
    }
  })

  if (!found) {
    document.getElementById('home')?.classList.add('active')
    if (typeof initClicker === 'function') initClicker()
  }
}

function updateActiveLink(current) {
  links.forEach((link) => {
    link.classList.remove('active')

    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active')
    }
  })
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home'

  showPage(hash)
  updateActiveLink(hash)

  window.scrollTo({
    top: 0,
    behavior: 'instant',
  })
}

links.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const target = link.getAttribute('href')
    window.location.hash = target
  })
})

handleRoute()
window.addEventListener('hashchange', handleRoute)
