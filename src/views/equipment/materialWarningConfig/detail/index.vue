<template>
  <div class="formData">
    <el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
      <el-form-item label="物资" prop="materialId">
        <el-input v-model="formData.materialName" placeholder="请选择物资" readonly @click="openMaterialSelect">
          <template #suffix>
            <el-icon style="cursor: pointer"><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="规格型号">
        <el-input v-model="formData.specificationModel" disabled placeholder="自动带出" />
      </el-form-item>

      <el-form-item label="计量单位">
        <el-input v-model="formData.unitName" disabled placeholder="自动带出" />
      </el-form-item>

      <el-form-item label="品牌">
        <el-input v-model="formData.brand" disabled placeholder="自动带出" />
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

    <Dialog v-model:visible="materialDialogVisible" title="选择物资" width="70%" class="material-dialog">
      <BaseTable
        ref="materialTableRef"
        :showSearchHeader="true"
        :selectData="materialSelectData"
        :searchClick="getMaterialList"
        :tableColumns="materialTableColumns"
        :tableData="materialTableData"
        :loading="materialLoading"
        :radioConfig="materialRadioConfig"
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

<script setup name="materialWarningConfigDetail">
import { ref, reactive, toRefs, getCurrentInstance, computed, nextTick } from 'vue'
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

const materialDialogVisible = ref(false)
const materialLoading = ref(false)
const materialTableData = ref([])
const materialTotal = ref(0)

const materialQueryParams = ref({
  startPage: 1,
  pageSize: 20,
  materialName: '',
})

const data = reactive({
  formData: {
    id: null,
    materialId: null,
    materialName: '',
    brand: '',
    specificationModel: '',
    unitName: '',
    warningThreshold: null,
    receivers: '',
    receiverNames: '',
    status: '1',
  },
})
const { formData } = toRefs(data)

const rules = reactive({
  materialId: proxy.getRules({ required: true, message: '请选择物资' }),
  status: proxy.getRules({ required: true }),
})

const materialSelectData = reactive([
  {
    name: '物资名称',
    type: 'input',
    modelValue: 'materialName',
    span: 12,
  },
])

const materialTableColumns = ref([
  { label: '', type: 'radio', width: 50, align: 'center' },
  { label: '物资名称', prop: 'materialName', align: 'left', minWidth: 180, showOverFlow: true },
  { label: '规格型号', prop: 'specificationModel', align: 'left', minWidth: 160, showOverFlow: true },
  { label: '品牌', prop: 'brand', align: 'left', minWidth: 140, showOverFlow: true },
  { label: '计量单位', prop: 'unitName', align: 'center', width: 120 },
])

const materialRadioConfig = reactive({
  highlight: true,
  strict: false,
  trigger: 'row',
})

const openMaterialSelect = () => {
  materialDialogVisible.value = true
  getMaterialList({ startPage: 1, pageSize: 20, materialName: '' })
}

const getMaterialList = params => {
  materialLoading.value = true
  materialQueryParams.value = {
    ...materialQueryParams.value,
    ...(params || {}),
  }

  materialCodeApi
    .getList(materialQueryParams.value)
    .then(res => {
      if (res.code === '0000') {
        materialTableData.value = res.data?.pages || []
        materialTotal.value = res.data?.totalNum || 0

        nextTick(() => {
          if (!materialTableRef.value || !formData.value.materialId) {
            return
          }

          const currentRow = materialTableData.value.find(item => item.id === formData.value.materialId)
          if (currentRow) {
            materialTableRef.value.setRadioRow(currentRow)
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
  const currentRow = materialTableRef.value?.getRadioRecord?.()

  if (!currentRow) {
    proxy.$message.warning('请选择物资')
    return
  }

  formData.value.materialId = currentRow.id
  formData.value.materialName = currentRow.materialName
  formData.value.brand = currentRow.brand
  formData.value.specificationModel = currentRow.specificationModel || ''
  formData.value.unitName = currentRow.unitName || ''
  materialDialogVisible.value = false
}

const openUserSelect = () => {
  userSelectFormRef.value.open(formData.value.id, selectedUsers.value)
}

const handleUserSelectConfirm = (activityId, userList) => {
  selectedUsers.value = userList || []
  updateReceivers()
}

const removeUser = user => {
  selectedUsers.value = selectedUsers.value.filter(item => item.value !== user.id)
  updateReceivers()
}

const updateReceivers = () => {
  formData.value.receivers = selectedUsers.value.map(item => item.value).join(',')
  formData.value.receiverNames = selectedUsers.value.map(item => item.label).join(',')
}

const validate = async () => {
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
  formData.value.id = null
  formData.value.materialId = null
  formData.value.materialName = ''
  formData.value.brand = ''
  formData.value.specificationModel = ''
  formData.value.unitName = ''
  formData.value.warningThreshold = null
  formData.value.receivers = ''
  formData.value.receiverNames = ''
  formData.value.status = '1'
  selectedUsers.value = []
  ruleForm.value?.clearValidate()
}

defineExpose({
  validate,
  resetForm,
  formData,
  selectedUsers,
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
