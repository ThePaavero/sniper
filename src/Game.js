import state from './state'
import imagesArray from './images'
import config from './config'
import DebugView from './lib/DebugView'

const Game = (playground) => {

  const centers = {
    x: playground.width / 2,
    y: playground.height / 2,
  }

  let debugTickSkips = 10
  let debugTickCounter = 0

  const onReady = () => {
    centerCity()
    createWindows()
  }

  const toScale = (value) => {
    return value * config.scale
  }

  const toggleZoom = () => {
    state.zoom = state.zoom === 'in' ? 'out' : 'in'
  }

  const preloadAssets = () => {
    imagesArray.forEach(name => {
      playground.loadImage(name)
    })
  }

  const updateState = () => {
    state.city.x += state.city.velocities.x
    state.city.y += state.city.velocities.y
    updateDebugView()
  }

  const createWindows = () => {
    console.log('Creating windows...')
  }

  const updateDebugView = () => {
    if (!config.debugState) {
      return
    }
    debugTickCounter++
    if (debugTickCounter === debugTickSkips) {
      DebugView.update(state)
      debugTickCounter = 0
    }
  }

  const centerCity = () => {
    state.city.x = centers.x - state.city.width / 2
    state.city.y = centers.y - state.city.height / 2
  }

  const draw = () => {
    // Clear frame.
    playground.layer.clear('#000')

    // Draw background city.
    const sizeMultiplier = state.zoom === 'out' ? 1 : 2
    const x = state.city.x * sizeMultiplier
    const y = state.city.y * sizeMultiplier
    playground.layer.drawImage(playground.images.city, x, y, state.city.width * sizeMultiplier, state.city.height * sizeMultiplier)

    // Draw "vignette".
    playground.layer.drawImage(playground.images.vignette, 0, 0, config.width, config.height)
    // ...
  }

  const fire = () => {
    console.log('*FIRING*')
  }

  const moveCity = (dir, startStop = 'start') => {
    switch (dir) {
      case 'left':
        if (startStop === 'start') {
          state.city.velocities.x -= state.city.speed
          return
        }
        if (state.city.velocities.x < 0) {
          state.city.velocities.x = 0
        }
        break
      case 'right':
        if (startStop === 'start') {
          state.city.velocities.x += state.city.speed
          return
        }
        if (state.city.velocities.x > 0) {
          state.city.velocities.x = 0
        }
        break
      case 'up':
        if (startStop === 'start') {
          state.city.velocities.y -= state.city.speed
          return
        }
        if (state.city.velocities.y < 0) {
          state.city.velocities.y = 0
        }
        break
      case 'down':
        if (startStop === 'start') {
          state.city.velocities.y += state.city.speed
          return
        }
        if (state.city.velocities.y > 0) {
          state.city.velocities.y = 0
        }
        break
    }
  }

  const onKeyDown = (data) => {
    switch (data.key) {
      case 'left':
        moveCity('right', 'start')
        break
      case 'right':
        moveCity('left', 'start')
        break
      case 'up':
        moveCity('down', 'start')
        break
      case 'down':
        moveCity('up', 'start')
        break
    }
  }

  const onKeyUp = (data) => {
    switch (data.key) {
      case 'left':
        moveCity('right', 'stop')
        break
      case 'right':
        moveCity('left', 'stop')
        break
      case 'up':
        moveCity('down', 'stop')
        break
      case 'down':
        moveCity('up', 'stop')
        break
      case 'space':
      case 'enter':
        fire()
        break
      case 'ctrl':
        toggleZoom()
        break
    }
  }

  const init = () => {
    // Abstract playground methods.
    playground.create = preloadAssets
    playground.ready = onReady
    playground.render = draw
    playground.step = updateState
    playground.keyup = onKeyUp
    playground.keydown = onKeyDown

    playground.gamepaddown = function(data) {
      if (Number(data.button) === 1) {
        fire()
      }
      if (Number(data.button) === 2) {
        toggleZoom()
      }
    }
    playground.gamepadup = function(data) {
    }
    playground.gamepadmove = function(data) {
      const stick = data.sticks[0]
      state.city.velocities.x = (stick.x * 10) * -1
      state.city.velocities.y = (stick.y * 10) * -1
    }
  }

  return {
    init
  }
}

export default Game
