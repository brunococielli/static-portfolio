let workMinutes = Number(localStorage.getItem("workMinutes")) || 25
let breakMinutes = Number(localStorage.getItem("breakMinutes")) || 5
let time = workMinutes * 60
let isBreak = false
let timer = null
let total = Number(localStorage.getItem("total")) || 0
let week = Number(getItemWithExpiry("week")) || 0
let day = Number(getItemWithExpiry("day")) || 0
let notifInterval = null
let alarmInterval = null

const clock = document.getElementById("clock")
const changeBtn = document.getElementById("change")
const settingsEl = document.getElementById("settings")
const settingsBtn = document.getElementById("settingsBtn")
const workInput = document.getElementById("workInput")
const breakInput = document.getElementById("breakInput")
const body = document.querySelector("body")
const colorBtn = document.getElementById("colorBtn")
const statsEl = document.getElementById("stats")
const statsBtn = document.getElementById("statsBtn")
const totalLabel = document.getElementById("total")
const weekLabel = document.getElementById("week")
const dayLabel = document.getElementById("day")
const startBtn = document.getElementById("startBtn")
const pauseBtn = document.getElementById("pauseBtn")
const resetBtn = document.getElementById("resetBtn")
const muteBtn = document.getElementById("muteBtn")
const alarmSound = document.getElementById("alarmSound")

colorBtn.innerText = localStorage.getItem("colorBtn") || "Light Mode"
body.style.color = localStorage.getItem("textColor") || "white"
body.style.backgroundColor = localStorage.getItem("color") || "grey"
clock.innerHTML = `${workMinutes}:00`
updateStatsLabels()
updateClock()

function updateClock() {
  const minutes = Math.floor(time / 60)
  let seconds = time % 60
  seconds = seconds < 10 ? "0" + seconds : seconds
  clock.innerHTML = `${minutes}:${seconds}`
}

function start() {
  if (time > 0) {
    time--
    updateClock()
  } else {
    clearInterval(timer)
    timer = null

		muteBtn.style.display = "block"
    alarmSound.currentTime = 0
    alarmSound.play()
		showNotification("Pomodoro Complete!", "Time for a break ☕")

		alarmSound.onended = () => {
    	muteBtn.style.display = "none";
  	}

		if (!isBreak) {
			total++
			week++
			day++

			localStorage.setItem("total", total)
			setItemWithExpiry("week", week, 604800000)
			setItemWithExpiry("day", day, 86400000)
			updateStatsLabels()
		}
  }
}

function startTimer() {
  if (!timer && time) timer = setInterval(start, 1000)
}

function pauseTimer() {
  clearInterval(timer)
  timer = null
}

function resetTimer() {
  clearInterval(timer)
  timer = null
  time = (isBreak ? breakMinutes : workMinutes) * 60
  updateClock()
}

function toggleMode() {
  clearInterval(timer)
  timer = null
  isBreak = !isBreak

  if (isBreak) {
    time = breakMinutes * 60
    changeBtn.innerText = "Work"
  } else {
    time = workMinutes * 60
    changeBtn.innerText = "Break"
  }

  updateClock()
}

function toggleSettings() {
  if (settingsEl.style.display === "none") {
		settingsEl.style.display = "block"
		settingsBtn.innerText = "Close"
	} else {
		settingsEl.style.display = "none"
		settingsBtn.innerText = "Settings"
	}

  workInput.value = workMinutes
  breakInput.value = breakMinutes
}

function saveSettings() {
  workMinutes = Number(workInput.value)
  breakMinutes = Number(breakInput.value)

  localStorage.setItem("workMinutes", workMinutes)
  localStorage.setItem("breakMinutes", breakMinutes)

  resetTimer()

  settingsEl.style.display = "none"
	settingsBtn.innerText = "Settings"
}

function toggleColor() {
	const color = body.style.backgroundColor

	if (color === "grey") {
		body.style.backgroundColor = "white"
		colorBtn.innerText = "Dark Mode"
		body.style.color = "black" 
	} else { 
		body.style.backgroundColor = "grey"
		body.style.color = "white"
		colorBtn.innerText = "Light Mode"
	}	

	localStorage.setItem("color", body.style.backgroundColor)
	localStorage.setItem("colorBtn", colorBtn.innerText)
	localStorage.setItem("textColor", body.style.color)
}

function updateStatsLabels() {
  totalLabel.innerHTML = `Total Study Sessions: ${total}`;
  weekLabel.innerHTML = `Week Study Sessions: ${week}`;
  dayLabel.innerHTML = `Day Study Sessions: ${day}`;
}

function toggleStats() {
	if (statsEl.style.display === "none") {
		statsEl.style.display = "block"
		statsBtn.innerText = "Close"
	} else {
		statsEl.style.display = "none"
		statsBtn.innerText = "Stats"
	}

	updateStatsLabels()
}

function setItemWithExpiry(key, value, ttl) {
  const now = new Date()
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  }

  localStorage.setItem(key, JSON.stringify(item))
}

function getItemWithExpiry(key) {
  const itemStr = localStorage.getItem(key)
  if (!itemStr) return null

  const item = JSON.parse(itemStr)
  const now = new Date()
	
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key)
    return null
  }

  return item.value
}

document.addEventListener("keydown", function(event) {
  if (event.code === "Space") {
    event.preventDefault()

    if (!timer)  {
			startTimer()
			flashButton(startBtn)
		}
    else {
			pauseTimer()
			flashButton(pauseBtn)
		}
  }

	if (event.code === "KeyR") {
		resetTimer()
		flashButton(resetBtn)
	}

	if (event.code === "KeyC") {
		event.preventDefault()
		toggleMode()
		flashButton(changeBtn)
	}
})

function flashButton(button) {
	button.classList.add("flash")
	setTimeout(() => {
		button.classList.remove("flash");
	}, 100)
}

function showNotification(title, body) {
  new Notification(title, {
    body: body
  })
}

function toggleMute() {
	alarmSound.pause()
	alarmSound.currentTime = 0
	muteBtn.style.display = "none"
}