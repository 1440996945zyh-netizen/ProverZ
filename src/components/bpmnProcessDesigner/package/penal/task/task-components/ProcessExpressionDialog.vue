<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-16 17:47:53
 * @LastEditors: zhangsd
 * @Description: 流程表达式弹窗
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\task\task-components\ProcessExpressionDialog.vue
-->

<!-- 表达式选择 -->
<template>
  <el-dialog title="请选择表达式" v-model="dialogVisible" width="1024px" append-to-body>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="名字" align="center" prop="name" />
      <el-table-column label="表达式" align="center" prop="expression" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="select(scope.row)"> 选择 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageNo"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="getList"
      @current-change="getList"
      class="mt-20px"
    />
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElPagination, ElButton } from 'element-plus'
import { CommonStatusEnum } from '@/utils/bpm/constantEnumeration'



defineOptions({ name: 'ProcessExpressionDialog' })

// 响应式数据
const dialogVisible = ref(false) // 弹窗的是否展示
const loading = ref(true) // 列表的加载中
const list = ref([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  type: '',
  status: CommonStatusEnum.ENABLE
})

// API 模拟实现
const ProcessExpressionApi = {
  getProcessExpressionPage: async (params) => {
    // 这里应该是实际的 API 调用
    console.log('查询表达式列表:', params)
    return {
      list: [],
      total: 0
    }
  }
}

/**
 * @typedef {Object} ProcessExpressionVO
 * @property {string} name - 名字
 * @property {string} expression - 表达式
 */

/** 打开弹窗 */
const open = (type = '') => {
  queryParams.pageNo = 1
  queryParams.type = type
  getList()
  dialogVisible.value = true
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ProcessExpressionApi.getProcessExpressionPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 提交表单 */
const emit = defineEmits(['select']) // 定义 select 事件，用于选择表达式后的回调

const select = async (row) => {
  dialogVisible.value = false
  // 发送选择事件
  emit('select', row)
}

// 暴露方法给父组件
defineExpose({ open })
</script>

<style scoped>
.mt-20px {
  margin-top: 20px;
}
</style>