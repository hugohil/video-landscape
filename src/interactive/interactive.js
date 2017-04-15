'use strict'

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container')
  const video = document.createElement('video')

  let distanceRation = 4
  let resolution = 256

  navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream
  }).catch((err) => {
    console.error(err)
  })
  video.autoplay = true
  video.preload = true
  video.muted = true
  video.style.display = 'none'
  document.body.appendChild(video)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = 1024
  canvas.height = canvas.width * distanceRation
  canvas.style.display = 'none'
  document.body.appendChild(canvas)

  let time = 0
  let position = 0
  let imgdata = null

  function slitscan () {
    ctx.drawImage(video, 0, position, canvas.width, 1)

    if (position > canvas.height) {
      position = 0
    } else {
      ++position
    }
  }

  const center = new THREE.Vector3(0)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, (window.innerWidth / window.innerHeight), 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  })

  // scene.fog = new THREE.Fog(0xFED6E3, 10, 100)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x0, 0)
  document.body.appendChild(renderer.domElement)

  var stats = new Stats()
  if (document.location.href.indexOf('127.0.0.1') > -1) {
    document.body.appendChild(stats.dom)
  }

  const texture = new THREE.Texture(canvas)
  const vertexShader = document.querySelector('#vert').textContent
  const fragmentShader = document.querySelector('#frag').textContent
  const material = new THREE.ShaderMaterial({
    uniforms: {
      texture: {
        type: 't',
        value: texture
      }
    },
    transparent: true,
    side: THREE.DoubleSide,
    shading: THREE.SmoothShading,
    fragmentShader,
    vertexShader
  })
  const planeDimension = {
    x: 20,
    y: 20 * distanceRation
  }
  const geometry = new THREE.PlaneBufferGeometry(planeDimension.x, planeDimension.y, resolution, resolution * distanceRation)
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = Math.PI * .5
  scene.add(plane)

  function render() {
    renderer.render(scene, camera)
  }

  function loop () {
    stats.begin()
    if (video.currentTime && !video.paused) {
      slitscan()
      texture.needsUpdate = true
      plane.material.needsUpdate = true
    }
    camera.lookAt(center)
    camera.position.z = Math.cos(time * -0.0007) * 50
    camera.position.x = Math.sin(time * 0.001) * 10
    camera.position.y = Math.abs(Math.cos(time * 0.0005) * 5) + 0.75
    render()
    ++time
    stats.end()
    window.requestAnimationFrame(loop)
  }
  loop()
})
