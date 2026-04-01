<template>
  <div class="app-container">
    <BaseTable
      ref="baseTable"
      :showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
      :buttonList="buttonList"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :loading="loading"
      :total="total"
      :checkbox-config="checkboxConfig"
      @checkbox-change="checkboxChange"
    />
  </div>
</template>

<script setup name="materialWarningRecord">
import { ref, reactive, getCurrentInstance, toRefs, h } from 'vue'
import { ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/equipment/materialWarningRecord/index'

const { proxy } = getCurrentInstance()
const baseTable = ref()
const total = ref(0)
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

const data = reactive({
  queryParams: {
    startPage: 1,
    pageSize: 20,
    materialName: undefined,
    handleStatus: undefined,
  },
})
const { queryParams } = toRefs(data)

// 复选框
const checkboxConfig = reactive({
  trigger: 'row',
  checkField: 'checked',
})

// 同步勾选数据
const checkboxChange = records => {
  selectedRows.value = Array.isArray(records) ? records : []
}

// 时间转 yyyy/MM/dd HH:mm:ss
const formatDateTime = value => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return `${year}/${month}/${day} ${hour}:${minute}:${second}`
}

const tableColumns = ref([
  {
    type: 'checkbox',
    width: 50,
    align: 'center',
    fixed: 'left',
  },
  { label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
  { label: '物资名称', prop: 'materialName', align: 'left', minWidth: 180, showOverFlow: true },
  {
    label: '触发预警时库存',
    prop: 'currentStock',
    align: 'right',
    width: 140,
    render: row => {
      const val = Number(row.currentStock || 0)
      return h('span', val.toFixed(2))
    },
  },
  {
    label: '预警阈值',
    prop: 'warningThreshold',
    align: 'right',
    width: 120,
    render: row => {
      const val = Number(row.warningThreshold || 0)
      return h('span', val.toFixed(2))
    },
  },
  // { label: '预警触发时间', prop: 'createTime', align: 'center', width: 180 },

  {
    label: '预警触发时间',
    prop: 'createTime',
    align: 'center',
    width: 180,
    render: row => {
      return h('span', formatDateTime(row.createTime))
    },
  },
  {
    prop: 'handleStatus',
    label: '处理状态',
    align: 'center',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.handleStatus === 1 ? 'success' : 'warning',
            size: 'default',
          },
          {
            default: () => {
              return row.handleStatus === 1 ? '已处理' : '未处理'
            },
          },
        ),
      ]
    },
  },
  // { label: '处理时间', prop: 'handleTime', align: 'center', width: 180 },
  {
    label: '处理时间',
    prop: 'handleTime',
    align: 'center',
    width: 180,
    render: row => {
      return h('span', formatDateTime(row.handleTime))
    },
  },
  { label: '处理人', prop: 'handleUserName', align: 'center', width: 120 },
])

const selectData = reactive([
  {
    name: '物资名称',
    type: 'input',
    modelValue: 'materialName',
    span: 8,
  },
  {
    name: '处理状态',
    type: 'select',
    modelValue: 'handleStatus',
    span: 8,
    selectData: [
      { label: '未处理', value: '0' },
      { label: '已处理', value: '1' },
    ],
  },
])

// 右上角按钮
const buttonList = reactive([
  {
    label: '处理数据',
    type: 'primary',
    icon: 'CircleCheck',
    click: () => handleBatchProcess,
    permission: 'equipment:eMaterialWarningRecord:handle',
  },
])

const getList = e => {
  loading.value = true
  queryParams.value = e || queryParams.value

  api.getList(queryParams.value)
    .then(res => {
      if (res.code == '0000') {
        tableData.value = res.data?.pages || []
        total.value = res.data?.totalNum || 0
        selectedRows.value = []
      } else {
        proxy.$message.error(res.msg)
      }
    })
    .finally(() => {
      loading.value = false
    })
}

// 批量处理
const handleBatchProcess = () => {
  const rows = baseTable.value?.getSelectEvent?.() || selectedRows.value || []

  if (!rows.length) {
    proxy.$modal.msgWarning('请先选择要处理的数据')
    return
  }

  const ids = rows.map(item => item.id)

  proxy.$modal
    .confirm(`确认将选中的 ${ids.length} 条数据修改为【已处理】吗？`)
    .then(() => {
      return api.handleBatch({ ids })
    })
    .then(res => {
      proxy.$modal.msgSuccess(res.msg || '处理成功')
      getList(queryParams.value)
    })
    .catch(() => {})
}

getList(queryParams.value)
</script>

<style lang="scss" scoped>
:deep(.vxe-table--render-default) {
  --vxe-ui-table-row-checkbox-checked-background-color: #e6f7ff;
  --vxe-ui-table-row-hover-checkbox-checked-background-color: #d7effb;
}

:deep(.vxe-table--render-default .vxe-body--row.row--checked > .vxe-body--column) {
  background-color: #e6f7ff !important;
}

:deep(.vxe-table--render-default .vxe-body--row.row--checked.row--hover > .vxe-body--column) {
  background-color: #d7effb !important;
}
</style>
