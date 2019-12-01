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
    centerGun()
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

  const centerGun = () => {
    state.city.x = centers.x - state.city.width / 2
    state.city.y = centers.y - state.city.height / 2
  }

  const draw = () => {
    // Clear frame.
    playground.layer.clear('#000')

    // Draw background city.
    playground.layer.drawImage(playground.images.city, state.city.x, state.city.y, state.city.width, state.city.height)
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
      console.log('DOWN')
      console.log(data)
      console.log('--------')
    }
    playground.gamepadup = function(data) {
      console.log('UP')
      console.log(data)
      console.log('--------')
    }
    /*playground.gamepadmove = function(data) {
      console.log('MOVE')
      console.log(data)
      console.log('--------')
    }*/
  }

  return {
    init
  }
}

export default Game
