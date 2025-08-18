<!--
 * @Author: zhangsd
 * @Date: 2025-08-12 14:36:56
 * @LastEditTime: 2025-08-13 21:12:35
 * @LastEditors: zhangsd
 * @Description: svg标注层
 * @FilePath: \ppm-view\src\views\device\deviceDetection\detail\svgIndex.vue
-->
<template>
  <div class="container">
    <div class="background">
      <img v-if="useImage" src="@/assets/images/门机.png" alt="机械示意图" class="machine-img">
    </div>
    
    <svg class="overlay" :viewBox="viewBox" preserveAspectRatio="xMidYMid meet">
      <!-- 节点 -->
      <circle 
        v-for="(node, index) in nodes" 
        :key="'node-'+node.id"
        :cx="node.x" 
        :cy="node.y" 
        r="5" 
        fill="#007DFF" 
        stroke="#98CAFF" 
        stroke-width="2"
        @click="selectNode(node)"
        @mouseenter="nodeHovered = node.id"
        @mouseleave="nodeHovered = null"
      ></circle>
      
      <!-- 连接线 -->
      <path 
        v-for="(path, index) in paths" 
        :key="'path-'+path.id"
        :d="path.d" 
        stroke="#007DFF" 
        :stroke-width="path.id === activePath ? 2 : 1"
        fill="none"
        :class="{ 'path-active': path.id === activePath }"
      ></path>
      
      <!-- 标签 -->
      <text 
        v-for="(label, index) in labels" 
        :key="'label-'+label.id"
        :x="label.x" 
        :y="label.y" 
        fill="#007dff" 
        style="font-weight: 600; font-size: 28px; cursor: pointer;"
        @click="showDetails(label)"
        @mouseenter="highlightPath(label.pathId)"
        @mouseleave="activePath = null"
      >
        {{ label.text }}
      </text>
    </svg>
    
    <!-- 详情弹窗 -->
    <div v-if="selectedLabel" class="modal">
      <div class="modal-content">
        <h3>{{ selectedLabel.text }}详情</h3>
        <p>设备状态: <span :class="statusClass">{{ selectedLabel.status }}</span></p>
        <p>上次维护时间: {{ selectedLabel.lastMaintain }}</p>
        <p>运行时长: {{ selectedLabel.runTime }}</p>
        <button @click="selectedLabel = null">关闭</button>
      </div>
    </div>

    <!-- 节点提示 -->
    <div 
      v-if="nodeHovered" 
      class="node-tooltip"
      :style="{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }"
    >
      {{ getNodeName(nodeHovered) }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
const emit = defineEmits(['selectLabel'])
// 状态定义
const useImage = ref(true)
const viewBox = ref("0 0 1600 900")
const selectedNode = ref(null)
const selectedLabel = ref(null)
const nodeHovered = ref(null)
const activePath = ref(null)
const tooltipPos = ref({ x: 0, y: 0 })
// 节点数据（更新变幅节点1坐标后）
const nodes = ref([
  // 行走机构节点
  { id: 4, x: 810.025, y: 970.4578, name: "行走节点1" },
  { id: 5, x: 490.3625, y: 870.6167, name: "行走节点2" },
  
  // 起升机构节点
  { id: 6, x: 1080.8031, y: 410.1767, name: "起升节点1" },
  { id: 7, x: 1380.6469, y: 310.7156, name: "起升节点2" },
  
  // 变幅机构节点（更新后）
  { id: 8, x: 950.3445, y: 320.0839, name: "变幅节点1" },
  { id: 9, x: 1300.7906, y: 10.1333, name: "变幅节点2" }, // 与节点1保持水平
  
  // 旋转机构节点
  { id: 10, x: 980.6375, y: 440.6589, name: "旋转节点1" },
  { id: 11, x: 1290.9688, y: 670.9728, name: "旋转节点2" }
])

// 路径数据（更新变幅机构路径）
const paths = ref([
  // 行走机构路径
  { 
    id: 2, 
    d: "M 810.025 970.4578 L 650.2875 970.6167 L 485.3625 870.6167",
    nodes: [4, 5]
  },
  
  // 起升机构路径
  { 
    id: 3, 
    d: "M 1080.8031 410.1767 L 1215.7219 310.7156 L 1380.6469 310.7156",
    nodes: [6, 7]
  },
  
  // 变幅机构路径（适配新节点1坐标）
  { 
    id: 4, 
    d: "M 950.3445 320.0839 L 1200.5675 10.1086 L 1300.7906 10.1333",
    nodes: [8, 9]
  },
  
  // 旋转机构路径
  { 
    id: 5, 
    d: "M 980.6375 440.6589 L 1200.7969 670.9728 L 1290.9688 670.9728",
    nodes: [10, 11]
  }
])
    

// 标签数据
const labels = ref([
  // 行走机构标签
  { 
    id: 2, 
    x: 370.3625, 
    y: 870.6167, 
    text: "行走机构",
    pathId: 2,
    status: "正常",
    lastMaintain: "2023-05-20",
    runTime: "980小时"
  },
  // 起升机构标签
  { 
    id: 3, 
    x: 1390.6469, 
    y: 320.7156, 
    text: "起升机构",
    pathId: 3,
    status: "注意",
    lastMaintain: "2023-07-02",
    runTime: "1560小时"
  },
  // 变幅机构标签
  { 
    id: 4, 
    x: 1310.7906, 
    y: 20.1333, 
    text: "变幅机构",
    pathId: 4,
    status: "正常",
    lastMaintain: "2023-06-30",
    runTime: "890小时"
  },
  // 旋转机构标签
  { 
    id: 5, 
    x: 1300.9688, 
    y: 680.9728, 
    text: "旋转机构",
    pathId: 5,
    status: "异常",
    lastMaintain: "2023-04-10",
    runTime: "2100小时"
  }
])

// 计算属性 - 状态样式
const statusClass = computed(() => {
  if (!selectedLabel.value) return '';
  switch (selectedLabel.value.status) {
    case '正常': return 'status-normal';
    case '注意': return 'status-warning';
    case '异常': return 'status-error';
    default: return '';
  }
})

// 方法定义
const selectNode = (node) => {
  selectedNode.value = node;
  const relatedPath = paths.value.find(p => p.nodes.includes(node.id));
  if (relatedPath) activePath.value = relatedPath.id;
}

const showDetails = (label) => {
  // selectedLabel.value = label;
  emit('selectLabel', label)

}

const highlightPath = (pathId) => {
  activePath.value = pathId;
}

const getNodeName = (nodeId) => {
  const node = nodes.value.find(n => n.id === nodeId);
  return node ? node.name : '';
}

const updateTooltipPos = (event) => {
  tooltipPos.value = { x: event.clientX + 10, y: event.clientY - 20 };
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('mousemove', updateTooltipPos);
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', updateTooltipPos);
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.container {
  position: relative;
  width: 100%;
  max-width: 90vw;
  max-height: 88vh;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.background {
  position: relative;
  width: 100%;
  height: 88vh;
  /* padding-top: 56.25%; */
  background-color: #f8f9fa;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.machine-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 80%;
  height: 80%;
  object-fit: contain;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  /* transform: scale(1.7); */
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.overlay circle, .overlay text {
  pointer-events: auto;
  /* 移除了所有元素的过渡动画效果 */
}

/* 完全移除了节点的hover效果样式 */
.overlay circle:hover {
  /* 清空hover状态的样式变化 */
}

/* 移除了文本的hover效果 */
.overlay text:hover {
  fill: #007dff; /* 保持原始颜色，不添加变化 */
  text-decoration: none; /* 移除下划线效果 */
}

.path-active {
  stroke: #0056b3;
  filter: drop-shadow(0 0 2px rgba(0, 86, 179, 0.5));
}

.node-tooltip {
  position: fixed;
  padding: 4px 8px;
  background: rgba(0, 125, 255, 0.9);
  color: white;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
  z-index: 900;
  white-space: nowrap;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}

.status-normal { color: #28a745; font-weight: bold; }
.status-warning { color: #ffc107; font-weight: bold; }
.status-error { color: #dc3545; font-weight: bold; }

button {
  background-color: #007DFF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}
</style>
