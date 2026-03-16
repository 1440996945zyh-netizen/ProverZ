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

<script setup name="costBudgetManagement">
import { ref, reactive, getCurrentInstance, toRefs, h, nextTick, onMounted } from 'vue'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/costBudgetManagement/index'
import publicApi from '@/api/public/index'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const total = ref(0)
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const title = ref('')
const detailRef = ref(null)

const data = reactive({
  queryParams: {
    startPage: 1,
    pageSize: 20,
    year: undefined,
    costType: undefined,
  },
})
const { queryParams } = toRefs(data)

/**
 * 查询条件
 */
const selectData = reactive([
  {
    name: '年份',
    type: 'year',
    modelValue: 'year',
    span: 12,
  },
  {
    name: '费用类型',
    type: 'select',
    modelValue: 'costType',
    span: 12,
    selectData: [],
    clearable: true,
  },
])

/**
 * 表格列
 * 说明：
 * 1. 去掉创建时间、修改时间
 * 2. 操作列取消固定宽度和 fixed:right
 * 3. 操作列使用 minWidth，吃掉右侧剩余空间
 * 4. 操作按钮左对齐，避免看起来悬空
 */
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 90, align: 'center', fixed: 'left' },
  { label: '年份', prop: 'year', align: 'center', width: 220 },
  {
    label: '费用类型',
    prop: 'costTypeName',
    align: 'center',
    minWidth: 690,
    showOverFlow: true,
  },
  {
    label: '预算金额',
    prop: 'amount',
    align: 'right',
    width: 260,
    render: row => {
      const value = Number(row.amount)
      const text = !isNaN(value)
        ? value.toLocaleString('zh-CN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : '0.00'
      return h('span', `¥${text}`)
    },
  },
  {
    prop: 'operate',
    label: '操作',
    align: 'left',
    minWidth: 40,
    showOverFlow: false,
    render: row => {
      return h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '0',
          },
        },
        [
          h(
            ElButton,
            {
              onClick: () => {
                handleUpdate(row)
              },
              type: 'primary',
              link: true,
              icon: 'Edit',
              permission: 'equipment:ecostbudgetmanagement:update',
            },
            {
              default: () => '编辑',
            },
          ),
          h(
            ElButton,
            {
              onClick: () => {
                handleDelete(row)
              },
              type: 'danger',
              link: true,
              icon: 'Delete',
              permission: 'equipment:ecostbudgetmanagement:delete',
            },
            {
              default: () => '删除',
            },
          ),
        ],
      )
    },
  },
])

/**
 * 右侧按钮
 */
const buttonList = reactive([
  {
    label: '新增',
    type: 'primary',
    icon: 'Plus',
    click: () => handleAdd,
    permission: 'equipment:ecostbudgetmanagement:add',
  },
])

/**
 * 加载费用类型字典
 */
const loadCostTypeOptions = async () => {
  try {
    const res = await publicApi.getLocalSelect({
      type: 'DICT',
      dictType: 'EXPENSE_TYPE',
    })
    if (res.code === '0000' && Array.isArray(res.data)) {
      selectData[1].selectData = res.data.map(item => ({
        label: item.label ?? item.dictLabel ?? item.name ?? '',
        value: item.value ?? item.dictValue ?? item.id ?? '',
      }))
      return
    }
    selectData[1].selectData = []
    proxy.$message.error(res.msg || '加载费用类型失败')
  } catch (error) {
    selectData[1].selectData = []
    console.error('加载费用类型字典失败:', error)
    proxy.$message.error('加载费用类型失败')
  }
}

/**
 * 查询列表
 */
const getList = (e = queryParams.value) => {
  loading.value = true
  queryParams.value = { ...queryParams.value, ...e }
  api
    .getList(queryParams.value)
    .then(res => {
      if (res.code === '0000') {
        tableData.value = res.data?.pages || []
        total.value = Number(res.data?.totalNum || 0)
      } else {
        proxy.$message.error(res.msg || '查询失败')
      }
    })
    .finally(() => {
      loading.value = false
    })
}

/**
 * 关闭弹窗
 */
const cancel = () => {
  dialogVisible.value = false
  reset()
}

/**
 * 重置表单
 */
const reset = () => {
  detailRef.value?.resetForm()
}

/**
 * 新增
 */
const handleAdd = () => {
  reset()
  title.value = '新增预算管理'
  dialogVisible.value = true
  nextTick(() => {
    detailRef.value?.resetForm()
  })
}

/**
 * 编辑
 */
const handleUpdate = row => {
  title.value = '编辑预算管理'
  dialogVisible.value = true
  nextTick(() => {
    detailRef.value?.resetForm()
    api.getById(row.id).then(response => {
      const resData = JSON.parse(JSON.stringify(response.data || {}))
      detailRef.value.formData.id = resData.id
      detailRef.value.formData.year = resData.year
      detailRef.value.formData.costType = resData.costType
      detailRef.value.formData.amount = resData.amount
    })
  })
}

/**
 * 删除
 */
const handleDelete = row => {
  proxy.$modal
    .confirm('确定删除该条预算管理数据？')
    .then(function () {
      return api.delete(row.id)
    })
    .then(() => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/**
 * 提交表单
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

onMounted(async () => {
  await loadCostTypeOptions()
  getList(queryParams.value)
})
</script>

<style lang="scss" scoped></style>
