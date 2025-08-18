<template>
  <div>
    <el-form :model="formData" ref="ruleForm" label-position="top" :rules="rules">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="计划信息" name="first">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="作业计划" prop="planNo">
                <el-input ref="planNoRef" v-model="formData.planNo" @focus="planRef"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="船名航次">
                <el-input v-model="formData.shipvoyageName" readonly></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="票货" prop="cargoInfoId">
                <Select
                  :selectData="cargoInfoList"
                  v-model:value="formData.cargoInfoId"
                  @change="cargoInfoChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="作业过程" prop="processCode">
                <Select
                  :selectData="processList"
                  v-model:value="formData.processDetailCode"
                  v-model:label="formData.processDetailName"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="起始位置" prop="massIdSource">
                <Select
                  :selectData="sourceList"
                  v-model:value="formData.massIdSource"
                  v-model:label="formData.massNameSource"
                  @change="regionSourceChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="目的位置" prop="massIdTarget">
                <Select
                  :selectData="targetList"
                  v-model:value="formData.massIdTarget"
                  v-model:label="formData.massNameTarget"
                  @change="regionTargetChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="总吨数" prop="ton">
                <el-input v-model="formData.ton"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item title="机械劳务信息" name="second">
          <div style="width:100%">
            <div style="width:47%;float:left">
            <EditTable
				    	ref="editTableLabourRef"
				    	:showSearchHeader="false"
				    	:tableColumns="labourTableColumns"
				    	:tableData="labourTableData"
				    	:editRules="editRules"
				    	:tableHeight="tableHeight"
				    	@change="tableChange"
				    	:auto-resize="true"
				    	:rowConfig="rowConfig"
				    />
            </div>
            <div style="width:53%;float:left">
            <EditTable
				    	ref="editTableMachineRef"
				    	:showSearchHeader="false"
				    	:tableColumns="machineTableColumns"
				    	:tableData="machineTableData"
				    	:editRules="editRules"
				    	:tableHeight="tableHeight"
				    	@change="tableChange"
				    	:auto-resize="true"
				    	:rowConfig="rowConfig"
				    />
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <!-- 选择作业计划 -->
    <el-drawer v-model="isShow" size="65%">
	  	<template #title>
	  		<div>
	  			<span>作业计划</span>
	  		</div>
	  	</template>
	  	<detail ref="detailRef" />
	  	<template #footer>
	  		<div>
	  			<el-button @click="isShow = false">取消</el-button>
	  			<el-button type="primary" @click="savePlan">保存</el-button>
	  		</div>
	  	</template>
	  </el-drawer>
  </div>
</template>

<script setup name="Detail">
import {ref, reactive, getCurrentInstance, onMounted, nextTick, computed} from 'vue'
import EditTable from '@/components/EditTable/index.vue'
import api from '@/api/produce/workTicketTwo/index.js'
import publicApi from '@/api/public/index'
import tableParamsStore from '@/store/modules/tableParams'
import Select from '@/components/Select'
import {ElButton} from 'element-plus'
import BaseTable from "@/components/BaseTable/index.vue"
import detail from "./workPlan.vue"

const {proxy} = getCurrentInstance() // 相当于vue2里的this

// 计算表格高度
const tableParams = tableParamsStore()
const tableHeight = computed(() => {
  return tableParams.pageTableHeight - 140
})
// ------------------form表单--------------------
const activeNames = reactive(['first','second'])
const ruleForm = ref(null)
const planNoRef = ref(null)
const formData = ref({
  id: '',
  workTicketDetailId: '',
  planNo: '',
  trustNo: '',
  trustId: '',
  type: '',
  trustCargoInfoId: '',
  workPlanId: '',
  cargoInfoId: '',
  cargoCode: '',
  cargoName: '',
  shipvoyageId: '',
  shipvoyageItemId: '',
  shipvoyageName: '',
  processCode: '',
  processName: '',
  processDetailCode: '',
  processDetailName: '',
  workDate: '',
  classCode: '',
  className: '',
  regionIdSource: '',
  regionNameSource: '',
  storehouseIdSource: '',
  storehouseNameSource: '',
  massIdSource: '',
  massNameSource: '',
  storehouseIdTarget: '',
  storehouseNameTarget: '',
  regionIdTarget: '',
  regionNameTarget: '',
  massIdTarget: '',
  massNameTarget: '',
})
const rules = reactive({
  planNo: proxy.getRules({ required: true }),
  cargoInfoId: proxy.getRules({ required: true }),
  processCode: proxy.getRules({ required: true }),
  massIdSource: proxy.getRules({ required: true }),
  massIdTarget: proxy.getRules({ required: true }),
  ton: proxy.getRules({ required: true }),
})
// 票货List
const cargoInfoList = ref([])
// 作业过程
const processList = ref([])
// 源区域
const sourceList = ref([])
// 目的区域
const targetList = ref([])
// 起始区域change事件
const regionSourceChange = row => {
  formData.value.storehouseIdSource = sourceList.value.filter(v=>v.massId==row.massId)[0].storehouseId
  formData.value.storehouseNameSource = sourceList.value.filter(v=>v.massId==row.massId)[0].storehouseName
  formData.value.regionIdSource = sourceList.value.filter(v=>v.massId==row.massId)[0].regionId
  formData.value.regionNameSource = sourceList.value.filter(v=>v.massId==row.massId)[0].regionName
}
// 目的区域change事件
const regionTargetChange = row => {
  console.log("row",row)
  formData.value.storehouseIdTarget = targetList.value.filter(v=>v.massId==row.massId)[0].storehouseId
  formData.value.storehouseNameTarget = targetList.value.filter(v=>v.massId==row.massId)[0].storehouseName
  formData.value.regionIdTarget = targetList.value.filter(v=>v.massId==row.massId)[0].regionId
  formData.value.regionNameTarget = targetList.value.filter(v=>v.massId==row.massId)[0].regionName
}
//表单校验
const editRules = reactive({
	ton: proxy.getRules({
		required: true,
	}),
})

const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }
// 劳务
const labourTableColumns = ref([
  {
    prop: 'processDetailName',
    label: '作业过程',
  },
  {
    prop: 'deptName',
    label: '劳务',
  },
  {
    prop: 'workPositionName',
    label: '位置',
  },
  {
    prop: 'ton',
    label: '吨数',
    editType: 'input',
		editRender: {},
  },
])
const labourTableData = ref([])
// 机械
const machineTableData = ref([])
const machineTableColumns = ref([
  {
    prop: 'processDetailName',
    label: '作业过程',
  },
  {
    prop: 'equipmentNo',
    label: '机械',
  },
  {
    prop: 'operatorsName',
    label: '司机',
  },
  {
    prop: 'workPositionName',
    label: '位置',
  },
  {
    prop: 'ton',
    label: '吨数',
    editType: 'input',
		editRender: {},
  },
])
// 计划弹框
const planRef = () => {
  isShow.value = true
  planNoRef.value.blur()
  nextTick(() => {
    detailRef.value.init()
  })
}
// 计划保存
const savePlan = () => {
  let data = detailRef.value.clickRow
  if (data == null) {
    return proxy.$message.warning("请选择一条计划信息")
  }
  ruleForm.value.resetFields()
  isShow.value = false
  formData.value.planNo = data.planNo
  formData.value.trustId = data.trustId
  formData.value.trustNo = data.trustNo
  formData.value.type = data.planType
  formData.value.workPlanId = data.id
  formData.value.processCode = data.processCode
  formData.value.processName = data.processName
  formData.value.workDate = data.workDate
  formData.value.classCode = data.classCode
  formData.value.className = data.className
  formData.value.shipvoyageId = data.shipvoyageId
  formData.value.shipvoyageItemId = data.shipvoyageItemId
  formData.value.shipvoyageName = data.shipvoyageLabel
  // 获取子过程
  getProcessDetailList()
  // 获取票货
  getCargInfoList()
  // 获取计划的起始终点位置
  getWorkLocationList()
  // 获取二次配工数据
  getDispatchSecond()
}
// tableChange事件
const tableChange = (val, rowData, title) => {
  if (title == "吨数") {

  }
}
// 票货change事件
const cargoInfoChange = row => {
  formData.value.trustCargoInfoId = cargoInfoList.value.filter(v => v.id==formData.value.cargoInfoId)[0].trustCargoId
  formData.value.cargoCode = cargoInfoList.value.filter(v => v.id==formData.value.cargoInfoId)[0].cargoCode
  formData.value.cargoName = cargoInfoList.value.filter(v => v.id==formData.value.cargoInfoId)[0].cargoName
}
// 根据主过程获取子过程
const getProcessDetailList = () => {
  publicApi.getLocalSelect({type: 'SUB_WORK_PROCESS',parent: formData.value.processCode}).then(res => {
    processList.value = res.data
  })
}
// 获取票货信息
const getCargInfoList = () => {
  api.getCargoInfoListByPlanId({ id: formData.value.workPlanId}).then(res => {
    cargoInfoList.value = res.data
    cargoInfoList.value.forEach(v => {
      v.value = v.id
      v.label = v.cargoLabel
    })
  })
}
// 获取计划下的起始终点位置
const getWorkLocationList = () => {
  api.listWorkPlanLocation(formData.value.workPlanId).then(res => {
    res.data.forEach(v => {
      v.value = v.massId
      v.label = v.storehouseName+'/'+v.regionName+'/'+v.massName
    })
    sourceList.value = res.data.filter(v=>v.direction=='1')
    targetList.value = res.data.filter(v=>v.direction=='2')
  })
}
// 获取二次配工数据
const getDispatchSecond = () => {
  api.getDispatchSecondList({workPlanId: formData.value.workPlanId}).then(res => {
    machineTableData.value = res.data.machineList
    labourTableData.value = res.data.labourList
    machineTableData.value.forEach(v => {
			v.processDetailCode = v.subProcessCode
			v.processDetailName = v.subProcessName
		})
		labourTableData.value.forEach(v => {
			v.processDetailCode = v.subProcessCode
			v.processDetailName = v.subProcessName
		})
  })
}

// ---------------- 作业计划窗口 -----------------
const isShow = ref(false)
const detailRef = ref(null)

const editTableLabourRef = ref(null)
const editTableMachineRef = ref(null)
//表单校验
const validate = async () => {
  let flag = false
  let flag1 = false
  let flag2 = false
  flag1 = await editTableLabourRef.value.validAllEvent()
  flag2 = await editTableMachineRef.value.validAllEvent()
	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag1 && flag2) {
      flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
  return flag
}
// 查询详情
const queryDetail = (row) => {
  api.queryWorkTicket({id: row.id}).then(res => {
    formData.value = JSON.parse(JSON.stringify(res.data))
    machineTableData.value = res.data.machines 
    labourTableData.value = res.data.labors
    // 获取子过程
    getProcessDetailList()
    // 获取票货
    getCargInfoList()
    // 获取计划的起始终点位置
    getWorkLocationList()
  })
}
// 重置
const clearForm = () => {
  ruleForm.value.resetFields()
  formData.value.id = ''
  formData.value.id = ''
  formData.value.workTicketDetailId = ''
  formData.value.planNo = ''
  formData.value.trustNo = ''
  formData.value.trustId = ''
  formData.value.type = ''
  formData.value.trustCargoInfoId = ''
  formData.value.workPlanId = ''
  formData.value.cargoInfoId = ''
  formData.value.cargoCode = ''
  formData.value.cargoName = ''
  formData.value.shipvoyageId = ''
  formData.value.shipvoyageItemId = ''
  formData.value.shipvoyageName = ''
  formData.value.processCode = ''
  formData.value.processName = ''
  formData.value.processDetailCode = ''
  formData.value.processDetailName = ''
  formData.value.workDate = ''
  formData.value.classCode = ''
  formData.value.className = ''
  formData.value.regionIdSource = ''
  formData.value.regionNameSource = ''
  formData.value.storehouseIdSource = ''
  formData.value.storehouseNameSource = ''
  formData.value.massIdSource = ''
  formData.value.massNameSource = ''
  formData.value.storehouseIdTarget = ''
  formData.value.storehouseNameTarget = ''
  formData.value.regionIdTarget = ''
  formData.value.regionNameTarget = ''
  formData.value.massIdTarget = ''
  formData.value.massNameTarget = ''
  machineTableData.value = []
  labourTableData.value = []
  cargoInfoList.value = []
  processList.value = []
  sourceList.value = []
  targetList.value = []
}

defineExpose({
  validate,
  formData,
  machineTableData,
  labourTableData,
  queryDetail,
  clearForm
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
