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

project1.addEventListener("click", () => {
	window.open(
    "https://github.com/brunococielli/personal-gallery",
    "_blank",
    "noopener,noreferrer"
  )
})

project2.addEventListener("click", () => {
	window.open(
    "pomodoro/public/index.html",
    "_blank",
    "noopener,noreferrer"
  )
})

document.querySelector('.hero-nav a[data-section="projects"]').classList.add("active")
document.getElementById("projects").classList.add("active")