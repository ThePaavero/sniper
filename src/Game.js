import state from './state'
import imagesArray from './images'
import config from './config'
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
    centerView()
    createRain()
  }

  const toScaleWithZoom = (value) => {
    return value * state.zoom === 'out' ? 1 : 2
  }

  const toggleZoom = () => {
    state.zoom = state.zoom === 'in' ? 'out' : 'in'
    resetRain()
  }

  const preloadAssets = () => {
    imagesArray.forEach(name => {
      playground.loadImage(name)
    })
  }

  const updateState = () => {
    state.world.x += state.world.velocities.x
    state.world.y += state.world.velocities.y
    updateDebugView()
    if (config.rainIntensity > 0) {
      updateRainDrops()
    }
  }

  const resetRain = () => {
    state.rainDrops.length = 0
    createRain()
  }

  const createRain = () => {
    const dropAmount = config.rainIntensity * 200
    state.rainDrops = []
    for (let i = 0; i < dropAmount; i++) {
      let size = _.random(1, config.rainIntensity * 3)

      // Some drops should be surprisingly near.
      if (_.random(0, 10) === 0) {
        size = _.random(3, config.rainIntensity * 5)
      }

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
      drop.y += (config.rainIntensity * drop.width) * 4
      drop.x += config.rainIntensity
      if (drop.y > config.height) {
        drop.y = _.random(-100, -200)
      }
      if (drop.x > config.width) {
        drop.x = _.random(-10, -30)
      }
    })
  }

  const centerView = () => {
    state.world.x = centers.x - state.world.width / 2
    state.world.y = centers.y - state.world.height / 2
  }

  const draw = () => {
    // Clear frame.
    playground.layer.clear('#000')

    // Draw world.
    const sizeMultiplier = state.zoom === 'out' ? 1 : 2
    const x = state.world.x * sizeMultiplier
    const y = state.world.y * sizeMultiplier
    playground.layer.drawImage(playground.images.map1, x, y, state.world.width * sizeMultiplier, state.world.height * sizeMultiplier)

    // Draw "vignette".
    playground.layer.drawImage(playground.images.vignette, 0, 0, config.width, config.height)

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
      x: state.world.x,
      y: state.world.y,
    }
    const recoilPower = _.random(100, 130) * powerMultiplier
    playground
      .tween(state.world)
      .to({
        y: state.world.y + recoilPower,
        x: state.world.x + _.random(-30 * powerMultiplier, 30 * powerMultiplier)
      }, 0.02, 'outExpo')
      .to({
        y: originals.y
      }, 1, 'outExpo')
  }

  const getCrossHairCoordinates = () => {
    return 'TODO'
  }

  const sendProjectile = () => {
    return
    /*const crossHairCoordinates = getCrossHairCoordinates()
    state.projectiles.push({
      x: crossHairCoordinates.x,
      y: crossHairCoordinates.y,
    })*/
  }

  const fire = () => {
    applyRecoil()
    sendProjectile()
  }

  const moveWorld = (dir, startStop = 'start') => {
    switch (dir) {
      case 'left':
        if (startStop === 'start') {
          state.world.velocities.x -= state.world.speed
          return
        }
        if (state.world.velocities.x < 0) {
          state.world.velocities.x = 0
        }
        break
      case 'right':
        if (startStop === 'start') {
          state.world.velocities.x += state.world.speed
          return
        }
        if (state.world.velocities.x > 0) {
          state.world.velocities.x = 0
        }
        break
      case 'up':
        if (startStop === 'start') {
          state.world.velocities.y -= state.world.speed
          return
        }
        if (state.world.velocities.y < 0) {
          state.world.velocities.y = 0
        }
        break
      case 'down':
        if (startStop === 'start') {
          state.world.velocities.y += state.world.speed
          return
        }
        if (state.world.velocities.y > 0) {
          state.world.velocities.y = 0
        }
        break
    }
  }

  const onMouseMove = (data) => {
    state.world.x = (data.x * -1) - (data.x - centers.x)
    state.world.y = (data.y * -1) - (data.y - centers.y)
  }

  const onMouseDown = (data) => {
    switch (data.button) {
      case 'left':
        fire()
        break
      case 'right':
        toggleZoom()
        break
    }
  }

  const onKeyDown = (data) => {
    switch (data.key) {
      case 'left':
        moveWorld('right', 'start')
        break
      case 'right':
        moveWorld('left', 'start')
        break
      case 'up':
        moveWorld('down', 'start')
        break
      case 'down':
        moveWorld('up', 'start')
        break
    }
  }

  const onKeyUp = (data) => {
    switch (data.key) {
      case 'left':
        moveWorld('right', 'stop')
        break
      case 'right':
        moveWorld('left', 'stop')
        break
      case 'up':
        moveWorld('down', 'stop')
        break
      case 'down':
        moveWorld('up', 'stop')
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
    playground.mousemove = onMouseMove
    playground.mousedown = onMouseDown

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

      state.world.velocities.x = (stick.x * 10) * -1
      state.world.velocities.y = (stick.y * 10) * -1
    }
  }

  return {
    init
  }
}

export default Game
