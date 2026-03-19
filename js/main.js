const links = document.querySelectorAll(".hero-nav a")
const pages = document.querySelectorAll(".page")
const project1 = document.getElementById("project1")
const project2 = document.getElementById("project2")

links.forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault()

    const targetId = link.dataset.section

    pages.forEach(page => {
      page.classList.remove("active")
    })

    const targetPage = document.getElementById(targetId)
    targetPage.classList.add("active")

    links.forEach(l => {
      l.classList.remove("active")
    })

    link.classList.add("active")
  })
})

const copyEmail = (e) => {
 e.preventDefault()

  const email = "cociellited@gmail.com"
  const msg = e.target.nextElementSibling

  navigator.clipboard.writeText(email).then(() => {
    msg.style.opacity = "1"

    setTimeout(() => {
      msg.style.opacity = "0"
    }, 1500)
  })
}

project1.addEventListener("click", () => {
	window.open(
    "https://github.com/brunococielli/personal-gallery",
    "_blank",
    "noopener,noreferrer"
  )
})

project2.addEventListener("click", () => {
	window.open(
    "https://github.com/brunococielli/pomodoro-timer-pro",
    "_blank",
    "noopener,noreferrer"
  )
})

document.querySelector('.hero-nav a[data-section="projects"]').classList.add("active")
document.getElementById("projects").classList.add("active")