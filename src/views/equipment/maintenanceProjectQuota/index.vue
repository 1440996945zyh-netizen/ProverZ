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
    <Drawer v-model="dialogVisible" :title="title" size="30%">
      <detail ref="detailRef" />
      <template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm">确定</el-button>
				</span>
      </template>
    </Drawer>
  </div>
</template>

<script setup name="maintenanceProjectQuota">
import { ref, reactive, getCurrentInstance, toRefs, h, nextTick } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/maintenanceProjectQuota/index'

const { proxy } = getCurrentInstance()

/**
 * 表格组件引用
 * 用于读取当前勾选数据
 */
const baseTable = ref()

/**
 * 列表总数
 */
const total = ref(0)

/**
 * 表格数据
 */
const tableData = ref([])

/**
 * 列表加载状态
 */
const loading = ref(false)

/**
 * 新增/编辑抽屉显示状态
 */
const dialogVisible = ref(false)

/**
 * 抽屉标题
 */
const title = ref('')

/**
 * 详情组件引用
 */
const detailRef = ref(null)

/**
 * 当前已勾选的数据
 * 这里作为页面状态缓存使用
 * 真正批量操作时还会再从 BaseTable 实时读取一次，避免事件同步时机问题
 */
const selectedRows = ref([])

/**
 * 状态映射
 * 1 = 生效
 * 0 = 失效
 */
const STATUS_MAP = {
  '1': { label: '生效', type: 'success' },
  '0': { label: '失效', type: 'danger' },
}

const data = reactive({
  queryParams: {
    startPage: 1,
    pageSize: 20,
    projectName: undefined,
    quotaCode: undefined,
  },
})
const { queryParams } = toRefs(data)

/**
 * 复选框配置
 * 参考设备工单管理页
 */
const checkboxConfig = reactive({
  trigger: 'row',
  checkField: 'checked',
})

/**
 * 复选框勾选变化事件
 * 注意：
 * BaseTable 抛出的参数本身就是“选中行数组”
 * 不是 { records }
 */
const checkboxChange = (records) => {
  selectedRows.value = Array.isArray(records) ? records : []
}

/**
 * 表格列定义
 */
const tableColumns = ref([
  /**
   * 第一列：复选框列
   */
  {
    type: 'checkbox',
    width: 50,
    align: 'center',
    fixed: 'left',
  },
  {
    label: '序号',
    type: 'seq',
    width: 60,
    align: 'center',
    fixed: 'left',
  },
  {
    label: '定额编号',
    prop: 'quotaCode',
    align: 'center',
    width: 180,
  },
  {
    label: '维修项目名称',
    prop: 'projectName',
    align: 'left',
    width: 200,
    showOverFlow: true,
  },
  {
    label: '维修项目内容',
    prop: 'projectContent',
    align: 'left',
    minWidth: 300,
    showOverFlow: true,
  },
  {
    label: '计量单位',
    prop: 'unit',
    align: 'center',
    width: 100,
  },
  {
    label: '不含税金额',
    prop: 'amountExcludingTax',
    align: 'right',
    width: 120,
    render: row => {
      const val = parseFloat(row.amountExcludingTax)
      if (isNaN(val)) {
        return h('span', '0.00')
      }
      return h('span', val.toFixed(2))
    },
  },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    width: 100,
    render: row => {
      const statusMeta = STATUS_MAP[String(row.status)] || { label: '未知', type: 'info' }
      return h(
        ElTag,
        {
          type: statusMeta.type,
        },
        {
          default: () => statusMeta.label,
        }
      )
    },
  },
  {
    prop: 'operate',
    label: '操作',
    align: 'center',
    width: 90,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              handleUpdate(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'equipment:emmaintenanceprojectquota:update',
          },
          {
            default: () => '编辑',
          }
        ),
      ]
    },
  },
])

/**
 * 查询区域配置
 */
const selectData = reactive([
  {
    name: '维修项目名称',
    type: 'input',
    modelValue: 'projectName',
    span: 12,
  },
  {
    name: '定额编号',
    type: 'input',
    modelValue: 'quotaCode',
    span: 12,
  },
])

/**
 * 顶部按钮配置
 * 注意：
 * 你项目里的 SearchHeader 对 click 的调用方式是 i()()
 * 所以这里必须保持 click: () => 方法名 这种写法
 */
const buttonList = reactive([
  {
    label: '生效',
    type: 'primary',
    icon: 'CircleCheck',
    click: () => handleBatchEnable,
    permission: 'equipment:emmaintenanceprojectquota:update',
  },
  {
    label: '失效',
    type: 'danger',
    icon: 'CircleClose',
    click: () => handleBatchDisable,
    permission: 'equipment:emmaintenanceprojectquota:update',
  },
  {
    label: '新增',
    type: 'primary',
    icon: 'Plus',
    click: () => handleAdd,
    permission: 'equipment:emmaintenanceprojectquota:add',
  },
])

/**
 * 查询列表
 * @param e 查询参数 / 分页参数
 */
const getList = (e = queryParams.value) => {
  loading.value = true
  queryParams.value = { ...queryParams.value, ...e }

  api.getList(queryParams.value)
    .then(res => {
      if (res.code === '0000') {
        tableData.value = res.data?.pages || []
        total.value = Number(res.data?.totalNum || 0)

        // 列表刷新后清空选中数据，避免界面和状态不一致
        selectedRows.value = []
      } else {
        proxy.$message.error(res.msg)
      }
    })
    .finally(() => {
      loading.value = false
    })
}

/**
 * 关闭抽屉
 */
const cancel = () => {
  dialogVisible.value = false
  reset()
}

/**
 * 重置详情表单
 */
const reset = () => {
  detailRef.value?.resetForm()
}

/**
 * 新增
 */
const handleAdd = () => {
  reset()
  title.value = '新增维修项目定额'
  dialogVisible.value = true
  nextTick(() => {
    detailRef.value?.resetForm()
  })
}

/**
 * 编辑
 * @param row 当前行数据
 */
const handleUpdate = row => {
  title.value = '编辑维修项目定额'
  dialogVisible.value = true
  nextTick(() => {
    detailRef.value?.resetForm()
    api.getById(row.id).then(response => {
      const resData = JSON.parse(JSON.stringify(response.data || {}))
      detailRef.value.formData.id = resData.id
      detailRef.value.formData.quotaCode = resData.quotaCode
      detailRef.value.formData.projectName = resData.projectName
      detailRef.value.formData.projectContent = resData.projectContent
      detailRef.value.formData.unit = resData.unit
      detailRef.value.formData.amountExcludingTax = resData.amountExcludingTax
      detailRef.value.formData.status = resData.status ?? '1'
    })
  })
}

/**
 * 提交新增/编辑
 */
const submitForm = async () => {
  if (await detailRef.value.validate()) {
    const params = detailRef.value.formData

    if (params.id) {
      api.update(params).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        dialogVisible.value = false
        getList(queryParams.value)
      })
    } else {
      api.add(params).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        dialogVisible.value = false
        getList(queryParams.value)
      })
    }
  }
}

/**
 * 批量改为“生效”
 */
const handleBatchEnable = () => {
  handleBatchStatus('1')
}

/**
 * 批量改为“失效”
 */
const handleBatchDisable = () => {
  handleBatchStatus('0')
}

/**
 * 批量修改状态
 * @param targetStatus 目标状态：1=生效，0=失效
 */
const handleBatchStatus = (targetStatus) => {
  /**
   * 优先从 BaseTable 实时取当前勾选数据
   * 这样可以避免 checkboxChange 事件和按钮点击之间的同步时机问题
   */
  const currentSelectedRows = baseTable.value?.getSelectEvent?.() || selectedRows.value || []

  if (!currentSelectedRows.length) {
    proxy.$modal.msgWarning('请先选择要修改状态的数据')
    return
  }

  const statusLabel = targetStatus === '1' ? '生效' : '失效'
  const ids = currentSelectedRows.map(item => item.id)

  // 二次确认
  proxy.$modal
    .confirm(`确认将选中的 ${ids.length} 条数据修改为【${statusLabel}】吗？`)
    .then(() => {
      return api.updateStatusBatch({
        ids,
        status: targetStatus,
      })
    })
    .then(res => {
      proxy.$modal.msgSuccess(res.msg || '状态修改成功')
      getList(queryParams.value)
    })
    .catch(() => {})
}

// 页面初始化加载
getList(queryParams.value)
</script>

<style lang="scss" scoped>
/* 页面基础留白 */
.app-container {
  padding: 24px;
}

/*
 * 将复选框选中行背景色改成浅蓝色
 * 避免 vxe-table 默认勾选行出现橙色背景
 */
:deep(.vxe-table--render-default) {
  --vxe-ui-table-row-checkbox-checked-background-color: #e6f7ff;
  --vxe-ui-table-row-hover-checkbox-checked-background-color: #d7effb;
}

/* 已勾选行单元格背景强制统一 */
:deep(.vxe-table--render-default .vxe-body--row.row--checked > .vxe-body--column) {
  background-color: #e6f7ff !important;
}

/* 已勾选并悬浮时颜色稍深一点 */
:deep(.vxe-table--render-default .vxe-body--row.row--checked.row--hover > .vxe-body--column) {
  background-color: #d7effb !important;
}
</style>
