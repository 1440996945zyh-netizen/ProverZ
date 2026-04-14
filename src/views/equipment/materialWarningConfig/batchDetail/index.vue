<template>
  <div class="formData">
    <el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
      <el-form-item label="物资" prop="materialIds">
        <el-input
          :model-value="materialNames"
          placeholder="请选择物资"
          readonly
          @click="openMaterialSelect"
        >
          <template #suffix>
            <el-icon style="cursor: pointer" @click="openMaterialSelect"><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 多选后把已选物资的属性汇总展示 -->
      <el-form-item label="物资类型">
        <el-input :model-value="materialTypeNames" disabled placeholder="自动带出" />
      </el-form-item>

      <el-form-item label="规格型号">
        <el-input :model-value="specificationModelNames" disabled placeholder="自动带出" />
      </el-form-item>

      <el-form-item label="计量单位">
        <el-input :model-value="unitNames" disabled placeholder="自动带出" />
      </el-form-item>

      <el-form-item label="品牌">
        <el-input :model-value="brandNames" disabled placeholder="自动带出" />
      </el-form-item>

      <el-form-item label="预警阈值" prop="warningThreshold">
        <el-input-number
          v-model="formData.warningThreshold"
          :min="0"
          :precision="2"
          controls-position="right"
          style="width: 100%"
          placeholder="请输入预警阈值"
        />
      </el-form-item>

      <el-form-item label="预警接收人" prop="receivers">
        <div class="receiver-wrapper">
          <div class="selected-users">
            <el-tag
              v-for="user in selectedUsers"
              :key="user.value"
              closable
              @close="removeUser(user)"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ user.label }}
            </el-tag>
          </div>
          <el-button type="primary" link @click="openUserSelect">
            <el-icon><Plus /></el-icon>
            选择人员
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="1">启用</el-radio>
          <el-radio label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <Dialog v-model:visible="materialDialogVisible" title="选择物资" width="75%" class="material-dialog">
      <BaseTable
        ref="materialTableRef"
        :showSearchHeader="true"
        :selectData="materialSelectData"
        :searchClick="getMaterialList"
        :tableColumns="materialTableColumns"
        :tableData="materialTableData"
        :loading="materialLoading"
        :checkbox-config="checkboxConfig"
        :total="materialTotal"
        :show-pagination="true"
        :tableHeight="tableHeight"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="materialDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmMaterialSelect">确定</el-button>
        </span>
      </template>
    </Dialog>

    <UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />
  </div>
</template>

<script setup name="materialWarningConfigBatchDetail">
import { ref, reactive, computed, getCurrentInstance, nextTick } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import UserSelectForm from '@/components/UserSelectForm/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import materialCodeApi from '@/api/equipment/materialCode/index'
import tableParamsStore from '@/store/modules/tableParams'

const { proxy } = getCurrentInstance()
const tableHeight = computed(() => tableParamsStore().dialogPageTableHeight)

const ruleForm = ref()
const userSelectFormRef = ref()
const materialTableRef = ref()
const selectedUsers = ref([])
const selectedMaterials = ref([])

const materialDialogVisible = ref(false)
const materialLoading = ref(false)
const materialTableData = ref([])
const materialTotal = ref(0)

const materialQueryParams = ref({
  startPage: 1,
  pageSize: 20,
  materialName: '',
  categoryLevel: 3,
})

const formData = ref({
  materialIds: [],
  warningThreshold: null,
  receivers: '',
  receiverNames: '',
  status: '1',
})

// 批量新增这里不能按字符串规则校验
const rules = reactive({
  materialIds: [
    {
      validator: (rule, value, callback) => {
        if (!Array.isArray(value) || value.length === 0) {
          callback(new Error('请选择物资'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
  warningThreshold: [
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback(new Error('请输入预警阈值'))
          return
        }
        if (Number(value) < 0) {
          callback(new Error('预警阈值不能小于0'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
  receivers: [
    {
      validator: (rule, value, callback) => {
        if (!value || !String(value).trim()) {
          callback(new Error('没有选择预警接收人，请选择后重新提交'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
  status: [
    {
      required: true,
      message: '请选择状态',
      trigger: 'change',
    },
  ],
})

const joinFieldValues = field => {
  const valueList = selectedMaterials.value
    .map(item => item[field])
    .filter(item => item !== undefined && item !== null && item !== '')

  return [...new Set(valueList)].join('，')
}

// 输入框里显示已选物资名称
const materialNames = computed(() => joinFieldValues('materialName'))

// 多选后，把已选物资属性去重后展示
const materialTypeNames = computed(() => joinFieldValues('categoryName'))
const specificationModelNames = computed(() => joinFieldValues('specificationModel'))
const unitNames = computed(() => joinFieldValues('unitName'))
const brandNames = computed(() => joinFieldValues('brand'))

const materialSelectData = reactive([
  {
    name: '物资名称',
    type: 'input',
    modelValue: 'materialName',
    span: 12,
  },
])

const materialTableColumns = ref([
  { type: 'checkbox', width: 50, align: 'center' },
  { label: '物资名称', prop: 'materialName', align: 'left', minWidth: 180, showOverFlow: true },
  { label: '物资类型', prop: 'categoryName', align: 'left', minWidth: 160, showOverFlow: true },
  { label: '规格型号', prop: 'specificationModel', align: 'left', minWidth: 160, showOverFlow: true },
  { label: '品牌', prop: 'brand', align: 'left', minWidth: 140, showOverFlow: true },
  { label: '计量单位', prop: 'unitName', align: 'center', width: 120 },
])

const checkboxConfig = reactive({
  trigger: 'row',
  checkField: 'checked',
})

const openMaterialSelect = () => {
  materialDialogVisible.value = true
  getMaterialList({
    startPage: 1,
    pageSize: 20,
    materialName: '',
    categoryLevel: 3,
  })
}

const getMaterialList = params => {
  materialLoading.value = true
  materialQueryParams.value = {
    ...materialQueryParams.value,
    ...(params || {}),
    categoryLevel: 3,
  }

  materialCodeApi
    .getList(materialQueryParams.value)
    .then(res => {
      if (res.code === '0000') {
        materialTableData.value = res.data?.pages || []
        materialTotal.value = res.data?.totalNum || 0

        nextTick(() => {
          if (!materialTableRef.value || !selectedMaterials.value.length) {
            return
          }

          const checkedRows = materialTableData.value.filter(item => formData.value.materialIds.includes(item.id))
          if (checkedRows.length) {
            materialTableRef.value.setCheckboxRow(checkedRows)
          }
        })
      } else {
        materialTableData.value = []
        materialTotal.value = 0
        proxy.$message.error(res.msg || '获取物资列表失败')
      }
    })
    .catch(() => {
      materialTableData.value = []
      materialTotal.value = 0
      proxy.$message.error('获取物资列表失败')
    })
    .finally(() => {
      materialLoading.value = false
    })
}

const confirmMaterialSelect = () => {
  const rows = materialTableRef.value?.getSelectEvent?.() || []

  if (!rows.length) {
    proxy.$message.warning('请选择物资')
    return
  }

  selectedMaterials.value = rows
  formData.value.materialIds = rows.map(item => item.id)
  materialDialogVisible.value = false

  // 选完物资后把当前字段校验状态清掉
  ruleForm.value?.validateField('materialIds')
}

const openUserSelect = () => {
  userSelectFormRef.value.open(null, selectedUsers.value)
}

const handleUserSelectConfirm = (activityId, userList) => {
  selectedUsers.value = userList || []
  updateReceivers()
}

const removeUser = user => {
  selectedUsers.value = selectedUsers.value.filter(item => item.value !== user.value)
  updateReceivers()
}

const updateReceivers = () => {
  formData.value.receivers = selectedUsers.value.map(item => item.value).join(',')
  formData.value.receiverNames = selectedUsers.value.map(item => item.label).join(',')
}

const validate = async () => {
  if (!formData.value.receivers || !String(formData.value.receivers).trim()) {
    proxy.$message.warning('没有选择预警接收人，请选择后重新提交')
    ruleForm.value?.validateField('receivers')
    return false
  }

  let flag = false
  await ruleForm.value.validate(valid => {
    if (valid) {
      flag = true
    } else {
      flag = false
      proxy.$message.warning('请完善表单信息！')
    }
  })
  return flag
}

const resetForm = () => {
  formData.value = {
    materialIds: [],
    warningThreshold: null,
    receivers: '',
    receiverNames: '',
    status: '1',
  }
  selectedUsers.value = []
  selectedMaterials.value = []
  ruleForm.value?.clearValidate()
}

defineExpose({
  validate,
  resetForm,
  formData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';

.receiver-wrapper {
  width: 100%;

  .selected-users {
    min-height: 32px;
    margin-bottom: 8px;
  }
}
</style>
