<template>
  <div class="page">
    <div class="container" ref="containerRef">
      <canvas ref="canvasRef"></canvas>

      <!-- 按钮 -->
      <div class="controls">
        <el-button type="primary" @click="explode" :disabled="isAnimating">
          💥 爆炸
        </el-button>
        <el-button @click="reset" :disabled="isAnimating">
          🔄 还原
        </el-button>
      </div>

      <!-- 左侧信息面板（固定假数据 + ElementUI风格） -->
      <div class="info-panel">
        <!-- 选中部件信息 -->
        <div class="panel-item">
          <div class="title">选中部件</div>
          <div class="row">
            <label>编号：</label>
            <span>{{ selectedPart?.userData?.id || '未选择' }}</span>
          </div>
          <div class="row">
            <label>名称：</label>
            <span>{{ selectedPart?.userData?.label || '未选择' }}</span>
          </div>
        </div>

        <!-- 设备基本信息（假数据） -->
        <div class="panel-item">
          <div class="title">设备基本信息</div>
          <div class="row">
            <label>设备名称：</label>
            <span>港口装卸起重机</span>
          </div>
          <div class="row">
            <label>设备型号：</label>
            <span>HQ-800T</span>
          </div>
          <div class="row">
            <label>生产厂家：</label>
            <span>中船重型装备</span>
          </div>
          <div class="row">
            <label>出厂日期：</label>
            <span>2023-05-18</span>
          </div>
        </div>

        <!-- 设备状态（假数据） -->
        <div class="panel-item">
          <div class="title">设备运行状态</div>
          <div class="row">
            <label>运行状态：</label>
            <el-tag type="success">正常运行</el-tag>
          </div>
          <div class="row">
            <label>工作负荷：</label>
            <span>62.5%</span>
          </div>
          <div class="row">
            <label>总运行时长：</label>
            <span>3680 小时</span>
          </div>
        </div>

        <!-- 维保情况（假数据） -->
        <div class="panel-item">
          <div class="title">维保信息</div>
          <div class="row">
            <label>上次维保：</label>
            <span>2025-11-20</span>
          </div>
          <div class="row">
            <label>下次维保：</label>
            <span>2026-05-20</span>
          </div>
          <div class="row">
            <label>维保状态：</label>
            <el-tag type="success">已维保</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup >
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { gsap } from 'gsap'

const containerRef = ref(null)
const canvasRef = ref(null)

let scene, camera, renderer, controls, model
let parts = []
let raycaster, mouse
let selectedPart = ref(null)
let originalMaterials = {}
let isAnimating = ref(false)

// 初始化
function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf8fafc)

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000)
  camera.position.set(0, 25, 75) // 🔥 相机拉近，让模型变大

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.target.set(0, 0, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const dir = new THREE.DirectionalLight(0xffffff, 0.9)
  dir.position.set(50, 80, 50)
  scene.add(dir)

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
}

// 加载模型
function loadModel() {
  const loader = new GLTFLoader()
  const draco = new DRACOLoader()
  draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/libs/draco/')
  loader.setDRACOLoader(draco)

  loader.load('/models/harbor-crane.glb', (gltf) => {
    model = gltf.scene
    model.position.set(0, -18, 0)
    // model.rotation.y = -Math.PI / 2
    // model.rotation.x = -0.3
    model.scale.set(0.08, 0.08, 0.08) // 🔥 模型放大
    
    scene.add(model)

    let idx = 0
    model.traverse((child) => {
      if (child.isMesh) {
        child.userData.original = child.position.clone()
        child.userData.id = idx + 1
        child.userData.label = `部件${idx + 1}`
        originalMaterials[child.uuid] = child.material.clone()
        parts.push(child)
        idx++
      }
    })
  })
}

// 点击高亮
function onMouseClick(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(parts)
  if (intersects.length) {
    const obj = intersects[0].object
    if (selectedPart.value)
      selectedPart.value.material = originalMaterials[selectedPart.value.uuid]
    selectedPart.value = obj
    obj.material = new THREE.MeshStandardMaterial({ 
      color: 0xffdd00, 
      emissive: 0xff4400,
      emissiveIntensity: 0.3
    })
  }
}

// 爆炸
function explode() {
  if (parts.length === 0) return
  isAnimating.value = true

  parts.forEach(p => {
    gsap.to(p.position, {
      x: p.userData.original.x + (Math.random() - 0.5) * 60,
      y: p.userData.original.y + Math.random() * 30,
      z: p.userData.original.z + (Math.random() - 0.5) * 60,
      duration: 1.2,
      ease: "power2.out"
    })
  })

  setTimeout(() => isAnimating.value = false, 1300)
}

// 还原
function reset() {
  isAnimating.value = true
  parts.forEach(p => {
    gsap.to(p.position, {
      x: p.userData.original.x,
      y: p.userData.original.y,
      z: p.userData.original.z,
      duration: 1,
      ease: "power2.inOut"
    })
  })
  setTimeout(() => isAnimating.value = false, 1100)
}

// 渲染
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

function resize() {
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
}

onMounted(() => {
  init()
  loadModel()
  animate()
  window.addEventListener('resize', resize)
  window.addEventListener('click', onMouseClick)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('click', onMouseClick)
})
</script>
<style  scoped>
.page {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #e2e8f0;
  overflow: hidden;
}

.container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 按钮 */
.controls {
  position: absolute;
  top: 20px;
  left: 320px;
  z-index: 999;
  display: flex;
  gap: 10px;
}

/* ========== 左侧信息面板 ========== */
.info-panel {
  position: absolute;
  top: 20px;
  left: 20px;    /* 移到左侧 */
  z-index: 999;
  width: 280px;
  max-height: calc(100vh - 40px);
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.panel-item {
  margin-bottom: 18px;
}
.panel-item:last-child {
  margin-bottom: 0;
}

.title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

label {
  font-weight: 500;
  color: #444;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

</style>
