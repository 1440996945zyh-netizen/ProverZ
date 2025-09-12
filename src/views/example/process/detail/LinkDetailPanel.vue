<template>
  <div class="link-detail-content">
    <el-descriptions :column="1" border :size="'small'">
      <el-descriptions-item label="连接关系">
        {{ sourceNode.label }} → {{ targetNode.label }}
      </el-descriptions-item>
      <el-descriptions-item label="描述" v-if="link.label">
        {{ link.label }}
      </el-descriptions-item>
      <el-descriptions-item label="耗时" v-if="link.duration">
        {{ link.duration }}
      </el-descriptions-item>
      <el-descriptions-item label="使用设备" v-if="link.equipment">
        {{ link.equipment }}
      </el-descriptions-item>
    </el-descriptions>
    
    <div class="node-details">
      <h4 class="details-title">源节点: {{ sourceNode.label }}</h4>
      <el-descriptions :column="2" border :size="'small'">
        <el-descriptions-item label="货物">{{ sourceNode.cargo }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ sourceNode.pieces }}件 / {{ sourceNode.weight }}吨</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(sourceNode.status)" size="small">
            {{ getStatusText(sourceNode.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <h4 class="details-title">目标节点: {{ targetNode.label }}</h4>
      <el-descriptions :column="2" border :size="'small'">
        <el-descriptions-item label="货物">{{ targetNode.cargo }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ targetNode.pieces }}件 / {{ targetNode.weight }}吨</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(targetNode.status)" size="small">
            {{ getStatusText(targetNode.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LinkDetailPanel',
  props: {
    link: {
      type: Object,
      required: true
    },
    sourceNode: {
      type: Object,
      required: true
    },
    targetNode: {
      type: Object,
      required: true
    }
  },
  methods: {
    getStatusType(status) {
      switch (status) {
        case 'completed': return 'success'
        case 'in-progress': return 'warning'
        case 'planned': return 'info'
        case 'delayed': return 'danger'
        default: return 'default'
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        'completed': '已完成',
        'in-progress': '进行中',
        'planned': '计划中',
        'delayed': '已延迟'
      }
      return statusMap[status] || status
    }
  }
})
</script>

<style scoped>
.details-title {
  margin: 16px 0 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}
</style>