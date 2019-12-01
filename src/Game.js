import state from './state'
import imagesArray from './images'
import config from './config'
import windows from './windows'
import DebugView from './lib/DebugView'
import _ from 'lodash'

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
    createRain()
  }

  const toScale = (value) => {
    return value * config.scale
  }

  const toScaleWithZoom = (value) => {
    return value * state.zoom === 'out' ? 1 : 2
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
    if (config.rainIntensity > 0) {
      updateRainDrops()
    }
  }

  const createWindows = () => {
    state.windows = _.cloneDeep(windows)
  }

  const createRain = () => {
    const dropAmount = config.rainIntensity * 200
    state.rainDrops = []
    for (let i = 0; i < dropAmount; i++) {
      const size = _.random(1, 3)
      state.rainDrops.push({
        x: _.random(-100, config.width),
        y: _.random(-100, config.height),
        width: size,
        height: _.random(4 * config.rainIntensity * size, 6 * config.rainIntensity * size),
        alpha: 0.2,
      })
    }
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

  const updateRainDrops = () => {
    if (!state.rainDrops) {
      return
    }

    state.rainDrops.forEach(drop => {
      drop.y += (config.rainIntensity * drop.width) * 5
      drop.x += config.rainIntensity
      if (drop.y > config.height) {
        drop.y = _.random(-100, -200)
      }
      if (drop.x > config.width) {
        drop.x = _.random(-10, -30)
      }
    })
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

    // Draw windows.
    state.windows.forEach(window => {
      playground.layer.fillStyle(window.lightsOn ? '#f4e6b7' : '#313131');
      const x = (window.x + state.city.x) * sizeMultiplier
      const y = (window.y + state.city.y) * sizeMultiplier
      const width = window.width * sizeMultiplier
      const height = window.height * sizeMultiplier
      playground.layer.fillRect(x, y, width, height);
    })

    // Rain!
    drawRainDrops()

    // Draw player/gun/sight.
    playground.layer.drawImage(playground.images.sightLarger, 0, 0, config.width, config.height)
  }

  const drawRainDrops = () => {
    const ctx = playground.layer
    state.rainDrops.forEach(drop => {
      ctx.strokeStyle('rgba(0, 0, 0, ' + drop.alpha + ')')
      ctx.lineWidth(drop.width)
      ctx.beginPath()
      ctx.moveTo(drop.x, drop.y)
      ctx.lineTo(drop.x + config.rainIntensity, drop.y + drop.height)
      ctx.stroke()
    })
  }

  const applyRecoil = () => {
    const powerMultiplier = toScaleWithZoom(1)
    const originals = {
      x: state.city.x,
      y: state.city.y,
    }
    const recoilPower = _.random(100, 130) * powerMultiplier
    playground
      .tween(state.city)
      .to({
        y: state.city.y + recoilPower,
        x: state.city.x + _.random(-30 * powerMultiplier, 30 * powerMultiplier)
      }, 0.02, 'outExpo')
      .to({
        y: originals.y
      }, 1, 'outExpo')
  }

  const fire = () => {
    applyRecoil()
    // @todo
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

      // "Dead zone"...
      const deadZoneThreshold = 0.1
      if (Math.abs(stick.x) < deadZoneThreshold) {
        stick.x = 0
      }
      if (Math.abs(stick.y) < deadZoneThreshold) {
        stick.y = 0
      }

      state.city.velocities.x = (stick.x * 10) * -1
      state.city.velocities.y = (stick.y * 10) * -1
    }
  }

  return {
    init
  }
}

export default Game
