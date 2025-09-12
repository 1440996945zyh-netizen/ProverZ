<template>
  <div class="node-detail-content">
    <el-descriptions :column="2" border :size="'small'">
      <el-descriptions-item label="节点类型">
        <el-tag :type="getNodeTypeTag(node.type)">
          {{ getNodeTypeText(node.type) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="货物类型">
        {{ node.cargo }}
      </el-descriptions-item>
      <el-descriptions-item label="件数">
        {{ node.pieces }} 件
      </el-descriptions-item>
      <el-descriptions-item label="吨数">
        {{ node.weight }} 吨
      </el-descriptions-item>
      <el-descriptions-item label="计划时间">
        {{ node.plannedTime }}
      </el-descriptions-item>
      <el-descriptions-item label="实际时间" v-if="node.actualTime">
        {{ node.actualTime }}
      </el-descriptions-item>
      <el-descriptions-item label="耗时" v-if="node.duration">
        {{ node.duration }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(node.status)">
          {{ getStatusText(node.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="操作人员" v-if="node.operator">
        {{ node.operator }}
      </el-descriptions-item>
      <el-descriptions-item label="位置" v-if="node.location">
        {{ node.location }}
      </el-descriptions-item>
      <el-descriptions-item label="船只" v-if="node.vessel">
        {{ node.vessel }}
      </el-descriptions-item>
      <el-descriptions-item label="泊位" v-if="node.berth">
        {{ node.berth }}
      </el-descriptions-item>
      <el-descriptions-item label="来源位置" v-if="node.from">
        {{ node.from }}
      </el-descriptions-item>
      <el-descriptions-item label="目标位置" v-if="node.to">
        {{ node.to }}
      </el-descriptions-item>
      <el-descriptions-item label="运输商" v-if="node.transporter">
        {{ node.transporter }}
      </el-descriptions-item>
      <el-descriptions-item label="目的地" v-if="node.destination">
        {{ node.destination }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2" v-if="node.notes">
        {{ node.notes }}
      </el-descriptions-item>
    </el-descriptions>
    
    <div class="related-nodes" v-if="relatedNodes && relatedNodes.length">
      <h4 class="related-title">关联节点</h4>
      <el-table 
        :data="relatedNodes" 
        stripe 
        :size="'small'"
        :max-height="200"
        @row-click="handleRowClick"
        class="related-nodes-table"
      >
        <el-table-column prop="label" label="节点名称" width="180"></el-table-column>
        <el-table-column prop="type" label="类型">
          <template #default="scope">
            <el-tag :type="getNodeTypeTag(scope.row.type)" size="small">
              {{ getNodeTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button link type="primary" size="small" @click.stop="handleRowClick(scope.row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-empty v-else description="无关联节点" class="no-related-nodes"></el-empty>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NodeDetailPanel',
  props: {
    node: {
      type: Object,
      required: true
    },
    relatedNodes: {
      type: Array,
      default: () => []
    }
  },
  emits: ['nodeClick'],
  methods: {
    getNodeTypeTag(type) {
      switch (type) {
        case 'start': case 'collection': return 'success'
        case 'end': return 'info'
        default: return 'primary'
      }
    },
    
    getNodeTypeText(type) {
      const typeMap = {
        'start': '开始节点',
        'end': '结束节点',
        'collection': '集港作业',
        'storage': '堆场作业',
        'loading': '装船作业',
        'unloading': '卸船作业',
        'transfer': '转垛作业'
      }
      return typeMap[type] || '普通节点'
    },
    
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
    },
    
    handleRowClick(row) {
      this.$emit('nodeClick', row.id)
    }
  }
})
</script>

<style scoped>
.related-nodes {
  margin-top: 16px;
}

.related-title {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.no-related-nodes {
  margin-top: 16px;
  padding: 20px 0;
}

.related-nodes-table {
  width: 100%;
  cursor: pointer;
}

:deep(.related-nodes-table .el-table__row:hover) {
  background-color: #f5f7fa;
}
</style>