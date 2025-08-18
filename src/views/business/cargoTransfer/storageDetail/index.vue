<!-- 作业指令新增编辑表单 -->
<template>
  <el-form :model="formData" ref="ruleForm" :inline="true" label-position="top">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="票货信息" name="cargo">
        <el-row>
          <el-col :span="6">
            <el-form-item label="作业公司" prop="companyName">
              <div style="width: 100%">
                <Select
                  :dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
                  v-model:value="formData.companyId"
                  v-model:label="formData.companyName"
                  :disabled="true"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="船名航次" prop="shipNameVoyage">
              <el-input v-model="formData.shipNameVoyage" readonly :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="货名" prop="cargoName">
              <div style="width: 100%">
                <RemoteSelect
                  type="CARGO_INFO"
                  v-model:value="formData.cargoCode"
                  v-model:label="formData.cargoName"
                  :disabled="true"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="包装" prop="packingName">
              <div style="width: 100%">
                <Select
                  :dataConfig="{ url: '/api/internal/public/getDictListByType/PACKAGE_TYPE' }"
                  v-model:value="formData.packingCode"
                  v-model:label="formData.packingName"
                  :disabled="true"
                />
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="原货主" prop="cargoOwnerNameSource">
              <el-input v-model="formData.cargoOwnerNameSource" readonly :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="原票货号" prop="sourceCargoInfoNo">
              <el-input v-model="formData.sourceCargoInfoNo" readonly :disabled="true" />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="目标货主" prop="cargoOwnerName">
              <el-input v-model="formData.cargoOwnerName" readonly :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="目标票货号" prop="targetCargoInfoNo">
              <el-input v-model="formData.targetCargoInfoNo" readonly :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="货转件数" prop="quantity">
              <el-input v-model="formData.quantity" readonly :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="货转重量" prop="ton">
              <el-input v-model="formData.ton" readonly :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-collapse-item>

      <el-collapse-item name="storage">
        <template v-slot:title>
          <div style="display: flex; justify-content: space-between; width: 95%">
            <div>库场场存</div>
          </div>
        </template>
        <EditTable
          ref="editTable"
          :tableHeight="300"
          :tableColumns="tableColumns"
          :tableData="formData.storageList"
          :editRules="editRules"
        />
      </el-collapse-item>
    </el-collapse>
  </el-form>
</template>

<script setup name="editTrustOrder">
  import EditTable from '@/components/EditTable/index.vue'
  import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
  import Select from '@/components/Select'
  import RemoteSelect from '@/components/RemoteSelect/index.vue'
  import { ElButton, ElInput } from 'element-plus'
  import publicApi from '@/api/public/index'
  const { proxy } = getCurrentInstance() // 相当于vue2里的this

  // 通知单类型列表
  const planTypeList = ref([])
  const type = ref('1') //类型
  const isSelectShip = ref(1) //是否选船（1：是 0：否）
  const isEstimateAmount = ref(0) //是否预估金额（1：是 0：否）
  const isCreateCargo = ref(0) //是否生成新票货（1：生成 2：选择 3：无）
  const isSelectProcess = ref(0) //是否选择作业过程（1：是 0：否）
  const isHidden = ref(true) //货物信息可编辑列表是否显示合同及预估金额
  const containCargo = ref(true) //是否有货物信息
  const trustGroupType = ref(0)
  const ruleForm = ref(null)
  const processList = ref([]) //作业过程列表
  //结算依据 字典值
  const SETTLEMENT_BASIS = ref(null)
  const editRules = ref({
    //consignerId: [{ required: true, message: '委托人必须填写' }],
  })
  const editTable = ref(null)
  //作业指令表单数据
  const formData = ref({
    id: null,
    companyId: '', //作业公司id
    companyName: '', //作业公司名称
    shipvoyageItemId: '',//航次
    cargoCode: '', //货名
    cargoName: '', //货名
    packingCode: '', //包装
    packingName: '', //包装
    cargoOwnerNameSource: '', //原货主
    sourceCargoInfoNo: '', //原票货号
    cargoOwnerName: '', //目标货主
    targetCargoInfoNo: '', //目标票货号
    storageList: [], //场存
    processDetailName: "", //场存
    processDetailCode: "" //场存
  })

  //折叠面板
  const activeNames = ref(['cargo', 'storage'])
  const tableColumns = reactive([
    {
      prop: 'storehouseName',
      label: '库场名称',
      align:'center'
    },
    {
      prop: 'regionName',
      label: '区域名称',
      width: 150,
      align:'center'
    },
    {
      prop: 'massName',
      label: '垛位名称',
      width: 150,
      align:'center'
    },
    {
      prop: 'quantity',
      label: '当前件数',
      width: 120,
      align:'right'
    },
    {
      prop: 'ton',
      label: '当前吨数',
      width: 150,
      align:'right'
    },
    {
      prop: 'transferQuantity',
      label: '转移件数',
      width: 120,
      editType: 'input',
      editRender: {},
      align:'right'
    },
    {
      prop: 'transferTon',
      label: '转移吨数',
      editType: 'input',
      editRender: {},
      width: 150,
      align:'right'
    }
  ])

  const initData = () => {

  }

  // 重置表单
  const resetForm = () => {
    ruleForm.value.resetFields()
    formData.value.storageList = [] //货物信息
    formData.value.id = ''
  }

  //初始化下拉列表数据
  initData()
  // 清空校验
  const validate = async () => {
    return await editTable.value.validAllEvent()
  }
  defineExpose({
    validate,
    resetForm,
    formData,
    type,
    tableColumns,
  })
</script>

<style lang="scss" scoped>
  @import '@/assets/styles/formData.scss';
</style>
