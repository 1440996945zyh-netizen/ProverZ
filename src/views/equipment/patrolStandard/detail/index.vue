<template>
  <div class="formData patrol-standard-detail">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="标准信息" name="1">
        <el-form :model="formData" ref="ruleForm" label-width="120px" label-position="top" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="标准编号" prop="standardCode">
                <el-input
                  v-model="formData.standardCode"
                  placeholder="请输入标准编号"
                  maxlength="20"
                  inputmode="numeric"
                  @input="handleStandardCodeInput"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="标准名称" prop="standardName">
                <el-input v-model="formData.standardName" placeholder="请输入标准名称" maxlength="255" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="设备名称" prop="eqptId">
                <Select
                  :dataConfig="{ params: { type: 'EQUIPMENT' } }"
                  v-model:value="formData.eqptId"
                  v-model:label="formData.eqptName"
                  placeholder="请选择设备名称"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>
      <el-collapse-item title="巡检标准子表" name="2">
        <template #title>
          <div class="collapse-title-row">
            <div>巡检标准子表</div>
            <div>
              <el-button type="primary" @click.stop="handleAddSubRow">添加</el-button>
            </div>
          </div>
        </template>
        <div class="sub-table-wrap">
          <EditTable
            ref="editTableRef"
            :name="'巡检标准子表'"
            :tableData="subTableData"
            :tableColumns="subTableColumns"
            :editRules="editRules"
            :rowConfig="rowConfig"
            :border="true"
            :stripe="false"
            :showFooter="true"
            :hasAdd="false"
            :tableHeight="420"
          />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup name="patrolStandardDetail">
import { ref, reactive, getCurrentInstance, toRefs, h } from 'vue'
import { ElButton } from 'element-plus'
import EditTable from '@/components/EditTable'
import Select from '@/components/Select'

const { proxy } = getCurrentInstance()

const activeNames = ref(['1', '2'])
const ruleForm = ref()
const editTableRef = ref()
const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'row_id' }

const data = reactive({
  formData: {
    id: null,
    standardCode: '',
    standardName: '',
    eqptId: '',
    eqptName: '',
    subList: [],
  },
  subTableData: [],
})
const { formData, subTableData } = toRefs(data)

const rules = reactive({
  standardCode: [
    ...proxy.getRules({ required: true }),
    {
      pattern: /^\d+$/,
      message: '标准编号只能输入数字',
      trigger: 'blur',
    },
  ],
  standardName: proxy.getRules({ required: true }),
  eqptId: proxy.getRules({ required: true }),
})

const editRules = reactive({
  checkContent: proxy.getRules({ required: true }),
  qualifyCondition: proxy.getRules({ required: true }),
  checkMethod: proxy.getRules({ required: true }),
})

const subTableColumns = reactive([
  {
    label: '检查内容',
    prop: 'checkContent',
    editType: 'input',
    editRender: {},
    minWidth: 280,
    align: 'left',
  },
  {
    label: '合格条件',
    prop: 'qualifyCondition',
    editType: 'input',
    editRender: {},
    minWidth: 280,
    align: 'left',
  },
  {
    label: '检查方法',
    prop: 'checkMethod',
    editType: 'input',
    editRender: {},
    minWidth: 280,
    align: 'left',
  },
  {
    prop: 'operate',
    label: '操作',
    width: 90,
    align: 'center',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => handleDeleteSubRow(row),
            type: 'danger',
            link: true,
            icon: 'Delete',
          },
          { default: () => '删除' },
        ),
      ]
    },
  },
])

const handleStandardCodeInput = value => {
  formData.value.standardCode = String(value || '').replace(/\D/g, '')
}

const handleAddSubRow = () => {
  subTableData.value.push({
    row_id: Date.now() + Math.random(),
    checkContent: '',
    qualifyCondition: '',
    checkMethod: '',
  })
}

const handleDeleteSubRow = row => {
  subTableData.value = subTableData.value.filter(item => item.row_id !== row.row_id)
}

const validate = async () => {
  const formValid = await ruleForm.value
    .validate()
    .then(() => true)
    .catch(() => {
      proxy.$message.warning('请完善表单信息！')
      return false
    })
  if (!formValid) {
    return false
  }
  if (!subTableData.value.length) {
    proxy.$message.warning('请填写子表数据')
    return false
  }
  const tableValid = await editTableRef.value.validAllEvent()
  if (!tableValid) {
    return false
  }
  formData.value.subList = subTableData.value.map(item => ({
    checkContent: item.checkContent,
    qualifyCondition: item.qualifyCondition,
    checkMethod: item.checkMethod,
  }))
  return true
}

const resetForm = () => {
  formData.value.id = null
  formData.value.standardCode = ''
  formData.value.standardName = ''
  formData.value.eqptId = ''
  formData.value.eqptName = ''
  formData.value.subList = []
  subTableData.value = []
  ruleForm.value?.resetFields()
  ruleForm.value?.clearValidate()
}

const setFormData = (data = {}) => {
  formData.value.id = data.id || null
  formData.value.standardCode = String(data.standardCode || '')
  formData.value.standardName = data.standardName || ''
  formData.value.eqptId = data.eqptId || ''
  formData.value.eqptName = data.eqptName || ''
  subTableData.value = (Array.isArray(data.subList) ? data.subList : []).map(item => ({
    row_id: Date.now() + Math.random(),
    checkContent: item.checkContent || '',
    qualifyCondition: item.qualifyCondition || '',
    checkMethod: item.checkMethod || '',
  }))
}

defineExpose({
  validate,
  resetForm,
  setFormData,
  formData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';

.patrol-standard-detail {
  :deep(.el-collapse) {
    border-top: none;
    border-bottom: none;
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: none;
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 12px;
  }

  .collapse-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 95%;
  }

  .sub-table-wrap {
    width: 100%;
  }
}
</style>
