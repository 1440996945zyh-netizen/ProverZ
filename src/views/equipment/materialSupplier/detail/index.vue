<template>
  <div class="supplier-form">
    <el-form
      ref="ruleForm"
      :model="formData"
      :rules="rules"
      label-position="top"
      :disabled="viewMode"
      class="supplier-form__content"
    >
      <div class="section-title">
        <span class="title-text">基本信息</span>
      </div>
      <el-row :gutter="20" class="section-content">
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="供应商编码" prop="supplierCode">
            <el-input v-model="formData.supplierCode" placeholder="供应商编码自动生成" disabled />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="供应商名称" prop="supplierName">
            <el-input v-model="formData.supplierName" placeholder="请输入供应商名称" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="企业名称" prop="companyName">
            <el-input v-model="formData.companyName" placeholder="请输入企业名称" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="统一社会信用代码" prop="uniformSocialCreditCode">
            <el-input v-model="formData.uniformSocialCreditCode" placeholder="请输入统一社会信用代码" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="企业简称" prop="companyShort">
            <el-input v-model="formData.companyShort" placeholder="请输入企业简称" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="企业英文名称" prop="eCompanyName">
            <el-input v-model="formData.eCompanyName" placeholder="请输入企业英文名称" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="企业曾用名" prop="formerName">
            <el-input v-model="formData.formerName" placeholder="请输入企业曾用名" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="企业成立日期" prop="estiblishTime">
            <el-date-picker
              v-model="formData.estiblishTime"
              type="date"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="请选择企业成立日期"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="状态" prop="status" class="status-form-item">
            <el-radio-group v-model="formData.status" class="status-radio-group">
              <el-radio label="2">启用</el-radio>
              <el-radio label="1">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="section-title">
        <span class="title-text">企业资质</span>
      </div>
      <el-row :gutter="20" class="section-content">
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="法定代表人" prop="legalPerson">
            <el-input v-model="formData.legalPerson" placeholder="请输入法定代表人" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="法定代表人身份证号" prop="legalPersonCardNo">
            <el-input v-model="formData.legalPersonCardNo" placeholder="请输入法定代表人身份证号" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="注册资本" prop="registeredCapital">
            <el-input v-model="formData.registeredCapital" placeholder="请输入注册资本" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="注册币种" prop="registeredCurrency">
            <el-input v-model="formData.registeredCurrency" placeholder="请输入注册币种" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="企业类型" prop="businessType">
            <el-input v-model="formData.businessType" placeholder="请输入企业类型" maxlength="30" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="经营状态" prop="businessState">
            <el-input v-model="formData.businessState" placeholder="请输入经营状态" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="行业类型" prop="industryType">
            <el-input v-model="formData.industryType" placeholder="请输入行业类型" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="组织机构代码" prop="organizationCode">
            <el-input v-model="formData.organizationCode" placeholder="请输入组织机构代码" maxlength="10" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="邓氏编号" prop="duns">
            <el-input v-model="formData.duns" placeholder="请输入邓氏编号" maxlength="10" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="助记码" prop="mnemonicCode">
            <el-input v-model="formData.mnemonicCode" placeholder="请输入助记码" maxlength="100" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="section-title">
        <span class="title-text">联系与地址</span>
      </div>
      <el-row :gutter="20" class="section-content">
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="联系人" prop="supplierPerson">
            <el-input v-model="formData.supplierPerson" placeholder="请输入联系人" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="联系电话" prop="supplierPhone">
            <el-input v-model="formData.supplierPhone" placeholder="请输入联系电话" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="公司电话" prop="companyTel">
            <el-input v-model="formData.companyTel" placeholder="请输入公司电话" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="注册地所属国家" prop="country">
            <el-input v-model="formData.country" placeholder="请输入注册地所属国家" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="注册地所属省" prop="province">
            <el-input v-model="formData.province" placeholder="请输入注册地所属省" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <el-form-item label="注册地所属市" prop="city">
            <el-input v-model="formData.city" placeholder="请输入注册地所属市" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-form-item label="注册地详细地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入注册地详细地址" maxlength="500" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-form-item label="公司经营地址" prop="businessAddress">
            <el-input v-model="formData.businessAddress" placeholder="请输入公司经营地址" maxlength="500" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="section-title">
        <span class="title-text">经营补充</span>
      </div>
      <el-row :gutter="20" class="section-content section-content--last">
        <el-col :xs="24">
          <el-form-item label="经营范围" prop="businessScope">
            <el-input
              v-model="formData.businessScope"
              type="textarea"
              :rows="4"
              placeholder="请输入经营范围"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24">
          <el-form-item label="备注信息" prop="companyInfoRemark">
            <el-input
              v-model="formData.companyInfoRemark"
              type="textarea"
              :rows="4"
              placeholder="请输入备注信息"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup name="materialSupplierDetail">
import { ref, reactive, toRefs, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const ruleForm = ref()
const viewMode = ref(false)

const data = reactive({
  formData: {
    id: null,
    supplierCode: '',
    supplierName: '',
    companyName: '',
    companyShort: '',
    formerName: '',
    eCompanyName: '',
    industryType: '',
    country: '',
    province: '',
    city: '',
    registeredCurrency: '',
    address: '',
    uniformSocialCreditCode: '',
    organizationCode: '',
    businessType: '',
    duns: '',
    mnemonicCode: '',
    estiblishTime: '',
    registeredCapital: '',
    legalPerson: '',
    legalPersonCardNo: '',
    businessState: '',
    businessScope: '',
    companyTel: '',
    businessAddress: '',
    supplierPerson: '',
    supplierPhone: '',
    companyInfoRemark: '',
    status: '2',
  },
})
const { formData } = toRefs(data)

const rules = reactive({
  uniformSocialCreditCode: proxy.getRules({ required: true, message: '请输入统一社会信用代码' }),
  supplierName: proxy.getRules({ required: true, message: '请输入供应商名称' }),
  companyName: proxy.getRules({ required: true, message: '请输入企业名称' }),
  legalPerson: proxy.getRules({ required: true, message: '请输入法定代表人' }),
  supplierPerson: proxy.getRules({ required: true, message: '请输入联系人' }),
  supplierPhone: proxy.getRules({ required: true, message: '请输入联系电话' }),
  businessState: proxy.getRules({ required: true, message: '请输入经营状态' }),
  status: proxy.getRules({ required: true, message: '请选择状态' }),
})

// 详情模式只读
const setViewMode = mode => {
  viewMode.value = !!mode
}

const validate = async () => {
  // 详情模式不做校验
  if (viewMode.value) {
    return true
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
  formData.value.id = null
  formData.value.supplierCode = ''
  formData.value.supplierName = ''
  formData.value.companyName = ''
  formData.value.companyShort = ''
  formData.value.formerName = ''
  formData.value.eCompanyName = ''
  formData.value.industryType = ''
  formData.value.country = ''
  formData.value.province = ''
  formData.value.city = ''
  formData.value.registeredCurrency = ''
  formData.value.address = ''
  formData.value.uniformSocialCreditCode = ''
  formData.value.organizationCode = ''
  formData.value.businessType = ''
  formData.value.duns = ''
  formData.value.mnemonicCode = ''
  formData.value.estiblishTime = ''
  formData.value.registeredCapital = ''
  formData.value.legalPerson = ''
  formData.value.legalPersonCardNo = ''
  formData.value.businessState = ''
  formData.value.businessScope = ''
  formData.value.companyTel = ''
  formData.value.businessAddress = ''
  formData.value.supplierPerson = ''
  formData.value.supplierPhone = ''
  formData.value.companyInfoRemark = ''
  formData.value.status = '2'
  viewMode.value = false
  ruleForm.value?.clearValidate()
}

defineExpose({
  validate,
  resetForm,
  formData,
  setViewMode,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';

.supplier-form {
  padding: 4px 20px 20px;

  .supplier-form__content {
    max-width: 1180px;
    margin: 0 auto;
  }

  .section-title {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 36px;
    margin: 22px 0 14px;
    border-bottom: 1px solid #e8ecf1;

    &::before {
      width: 3px;
      height: 16px;
      margin-right: 8px;
      background: var(--el-color-primary);
      border-radius: 2px;
      content: '';
    }

    &:first-child {
      margin-top: 0;
    }
  }

  .title-text {
    color: #303133;
    font-size: 15px;
    font-weight: 600;
    line-height: 1;
  }

  .section-content {
    padding-bottom: 2px;
  }

  .section-content--last {
    padding-bottom: 12px;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-form-item__label) {
    color: #303133;
    font-weight: 500;
    line-height: 18px;
    padding-bottom: 8px;
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-editor.el-input),
  :deep(.el-date-editor.el-input__wrapper) {
    width: 100%;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;
  }

  .status-form-item {
    :deep(.el-form-item__content) {
      min-height: 32px;
      align-items: center;
    }
  }

  .status-radio-group {
    min-height: 32px;
  }

  @media (max-width: 768px) {
    padding: 0 12px 16px;
  }
}
</style>
