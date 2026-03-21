const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
}

const setAccent = (colorName) => {
  document.documentElement.style.setProperty('--accent', `var(--${colorName})`)
}