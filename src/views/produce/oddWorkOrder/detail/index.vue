<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-position="top" :rules="rules" :disabled='editOrAudit'>
			<el-collapse v-model="activeNames">
				<el-collapse-item title="零工申请" name="oddJobs">
					<el-row :gutter="20">
						<el-col :span="6">
              <el-form-item label="零工类型" prop="oddType">
                <el-radio-group v-model="formData.oddType" @change="dataClear">
                  <el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
						</el-col>
            <el-col :span="6">
              <el-form-item label="零工单号" prop="oddPlanNo">
                <el-input v-model="formData.oddPlanNo" disabled  />
              </el-form-item>
            </el-col>
            <el-col :span="6" >
              <el-form-item label="作业部门" prop="workDeptId" >
                <Select
                  :selectData="workDeptMacList"
                  v-model:value="formData.workDeptId"
                  v-model:label="formData.workDeptName"
                  selectLabel="deptName"
                  selectValue='deptNo'
                  @change="workDeptChange"
                />
              </el-form-item>
            </el-col>
						<el-col :span="6" v-if="formData.oddType == 1">
              <el-form-item label="机械类型" prop="macTypeCode" >
                <Select
                  :dataConfig="{ params: { type: 'MAC_TYPE' } }"
                  v-model:value="formData.macTypeCode"
                  v-model:label="formData.macTypeName"
                  @change="macTypeChange"
                />
              </el-form-item>
						</el-col>
						<el-col :span="6" v-if="formData.oddType == 1">
              <el-form-item label="机械编号" prop="macId">
                <Select
                  :selectData="equipmentNoList"
                  v-model:value="formData.macId"
                  v-model:label="formData.macNo"
                  @change="macNoChange"
                  multiple
                />
              </el-form-item>
						</el-col>
            <el-col :span="6" v-if="formData.oddType == 1">
              <el-form-item label="机械数量" prop="macAmount">
                <el-input v-model="formData.macAmount" placeholder="机械零工数量" disabled  />
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if=" formData.workDeptId =='000100010005' ">
              <el-form-item label="人员选择" prop="oddUserIds">
                <Select
                  :selectData="oddUserIdsList"
                  v-model:value="formData.oddUserIds"
                  v-model:label="formData.oddUserNames"
                  @change="oddUserIdsChange"
                  multiple
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="formData.oddType == 1 && formData.workDeptId =='000100010005' ">
              <el-form-item label="人员数量" prop="workerAmount">
                <el-input v-model="formData.workerAmount" placeholder="人员零工数量"  @change="changeDate" :disabled ="formData.workDeptId =='000100010005'"/>
              </el-form-item>
            </el-col>
						<el-col :span="6" v-if="formData.oddType == 2">
							<el-form-item label="人员数量" prop="workerAmount">
								<el-input v-model="formData.workerAmount" placeholder="人员零工数量"  @change="changeDate" />
							</el-form-item>
						</el-col>
            <el-col :span="6">
              <el-form-item label="零工作业分类" prop="oddWorkTypeCode">
                <Select
                  :selectData="oddWorkTypeList"
                  v-model:value="formData.oddWorkTypeCode"
                  v-model:label="formData.oddWorkTypeName"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="作业内容" prop="workContent">
                <el-input v-model="formData.workContent" placeholder="请输入作业内容" />
              </el-form-item>
            </el-col>
					</el-row>
				</el-collapse-item>
				<el-collapse-item title="作业信息" name="workInfo">
          <el-row :gutter="20">
            <!--<el-col :span="6" >
							<el-form-item label="作业开始时间" prop="reportStartTime">
								<el-date-picker
									format="YYYY-MM-DD HH:mm"
									v-model="formData.reportStartTime"
									type="datetime"
									placeholder="作业开始时间"
									value-format="YYYY-MM-DD HH:mm"
									@change="changeDate"
								/>
							</el-form-item>
            </el-col>
			  		<el-col :span="6" >
							<el-form-item label="作业结束时间" prop="reportEndTime">
								<el-date-picker
									format="YYYY-MM-DD HH:mm"
									v-model="formData.reportEndTime"
									type="datetime"
									placeholder="作业结束时间"
									value-format="YYYY-MM-DD HH:mm"
									@change="changeDate"
								/>
							</el-form-item>
			  		</el-col>-->
            <el-col :span="6">
              <el-form-item label="作业总时长" prop="workDuration">
                <el-input v-model="formData.workDuration" placeholder="请输入作业时长" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="总工时" prop="workHours">
                <el-input v-model="formData.workHours" placeholder="请输入总工时" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="formData.remark" placeholder="请输入备注"  />
              </el-form-item>
            </el-col>
          </el-row>
				</el-collapse-item>
        <el-collapse-item title="作业时间" name="workTime" >
          <EditTable
            ref="tableRef"
            :showSearchHeader="false"
            :showPagination="false"
            :showToolBarEditTable="true"
            :tableColumns="tableColumns"
            :tableData="formData.workTimeTable"
            :editRules="timeRules"
            :rowConfig="rowConfig"
            :tableHeight="tableHeight"
            :hasAdd="true"
            :autoResize="true"
            :default-sort="{ prop: 'reportStartTime', order: 'ascending' }"
            style="padding: 10px ;"
            @chang_date="workTimeChange"
          />
        </el-collapse-item>
        <el-collapse-item title="变更日志" name="changeLog" >
          <BaseTable
            ref="tableLogRef"
            :showSearchHeader="false"
            :tableColumns="tableLogColumns"
            :tableData="tableData"
            :rowConfig="rowConfig"
            :searchClick="getLogList"
            :tableHeight="tableHeight"
          />
        </el-collapse-item>
			</el-collapse>
		</el-form>
	</div>
</template>

<script setup name="oddJobs">
import {ref, reactive, getCurrentInstance, nextTick, h} from 'vue'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import publicApi from '@/api/public/index'
import api from '@/api/produce/oddWorkOrder/index.js'
import nvDatePicker from '@/components/nvDatePicker/index.vue'
import { getDuration } from '@/utils/index.js'
import MyMath from '../../../../utils/math'
import {ElButton} from "element-plus";
import tableParamsStore from '@/store/modules/tableParams'
import EditTable from '@/components/EditTable/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'

const ruleForm = ref()
const MechanicalTypeRef = ref()
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const workPlanId = ref(null)
const equipmentNoList = ref([]) //机械编号
const oddUserIdsList = ref([]) //机械编号
const oddWorkTypeList = ref([]) //零工作业类型
const workDeptMacList = ref([]) //申请机械部门
const editOrAudit = ref(false) //禁止按钮
const isHidden = ref(false) //禁止按钮
const isHourMeterHidden = ref(true) //禁止按钮
const rowConfig = {isCurrent: true, isHover: true, height: 50, keyField: 'row_id'}
//表格ref
const tableRef = ref();
const tableLogRef = ref();
const queryParams = ref({
  startPage: 1,
  pageSize: 10,
  id: ''
})
const tableData = ref([])
const total = ref(0)
// 校验规则
const rules = ref({
  oddWorkTypeCode: proxy.getRules({ required: true }),
	classCode: proxy.getRules({ required: true }),
	quantityPlan: proxy.getRules({
		numberCheck: {
			int: 8,
		},
	}),
	laborNum: proxy.getRules({
		numberCheck: {
			int: 2,
		},
	}),
	remark: proxy.getRules({
		length: '1-200',
	}),
	tonPlan: proxy.getRules({
		numberCheck: {
			int: 7,
			dec: 4,
		},
	}),
	processName: proxy.getRules({ required: true }),
})
const timeRules = ref({
  reportStartTime: proxy.getRules({required: true, message: '必须填写'}),
  reportEndTime: proxy.getRules({required: true, message: '必须填写' }),
  hourMeterStart: proxy.getRules({
    required: false,
    type: Number,
    numberCheck: {
      int: 7,
      dec: 4,
    },
    message: '请填写数字'
  }),
})

const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight
const tablePageHeight = tableParams.pageTableHeight
const activeNames = reactive(['oddJobs', 'mechanicalType','workInfo','workTime','changeLog']) //控制默认展开
const formData = ref({
    id :'',
    oddType:'1',
    workDeptId:'',
    workDeptName:'',
    macTypeCode:'',
    macTypeName:'',
    macNo:'',
    macId:'',
    macAmount:'',
    workerAmount:'',
    oddUserIds:'',
    oddUserNames:'',
    workContent:'',
    //reportStartTime:'',
    //reportEndTime:'',
    workDuration:'',
    workHours:'',
    status:'',//状态（字典 ODD_STATUS）
    remark:'',
    oddPlanNo:'',
    workTimeTable:[],
    oddWorkTypeCode: '',
    oddWorkTypeName: '',
})
const workTimeChange = (row, title) => {
  let hours = 0;
  formData.value.workTimeTable = formData.value.workTimeTable.map((item, index) => {
    if (index == row.index && item.reportStartTime && item.reportEndTime) {
      times.value[0] = row.reportStartTime
      times.value[1] = row.reportEndTime
      item.duration = getDuration('hourMin', times.value)
    }
    if (item.duration) {
      hours = MyMath.numAdd(hours, item.duration)
    }
    return item
  })
  formData.value.workDuration = hours
  if(formData.value.oddType == '1'){
    macAmountChange()
  }
  else if(formData.value.oddType == '2') {
    workerAmountChange()
  }
}

const tableColumns = ref([
  {
    label: '作业开始时间',
    prop: 'reportStartTime',
    editType: 'datetime',
    width: 200,
    align: "center",
    editRender: {},
  },
  {
    label: '作业结束时间',
    prop: 'reportEndTime',
    editType: 'datetime',
    width: 200,
    align: "center",
    editRender: {},
  },
  {
    label: '作业时长',
    prop: 'duration',
    editType: 'input',
    width: 150,
    align: "right",
    disabled: true,
    editRender: {},
  },
  {
    label: '台时开始',
    prop: 'hourMeterStart',
    editType: 'input',
    width: 150,
    align: "right",
    editRender: {},
    isHidden: isHourMeterHidden
  },
  {
    label: '台时结束',
    prop: 'hourMeterEnd',
    editType: 'input',
    width: 150,
    align: "right",
    editRender: {},
    isHidden: isHourMeterHidden
  },
  {
    label: '备注',
    prop: 'remark',
    editType: 'input',
    align: "center",
    editRender: {},
  },
  {
    prop: 'deal',
    label: '添加',
    width: 200,
    align: 'center',
    isHidden: isHidden,
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              handleDelete(row)
            },
            type: 'danger',
            link: true,
            icon: 'Delete',
          },
          {
            default: () => '删除',
          }
        ),
      ]
    },
  },
])
const tableLogColumns = ref([
  {
    label: '操作类型',
    prop: 'operateType',
    width: 150,
    align: "center",
  },
  {
    label: '操作人',
    prop: 'createByName',
    width: 120,
    align: "center",
  },
  {
    label: '操作时间',
    prop: 'createTime',
    width: 180,
    align: "center",
  },
  {
    label: '操作内容',
    prop: 'operateContent',
    align: "center",
  },
])
const validate = async () => {
	let flags = false
  let flag1 = await tableRef.value.validAllEvent()
	await ruleForm.value.validate(valid => {
		if (valid && flag1) {
			flags = true
		} else {
			flags = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flags
}
const trueFalseOptions = ref([
  { label: '机械零工', value: '1' },
  { label: '人员零工', value: '2' },
])
//机械零工数量改变
const macAmountChange = () => {
  if(formData.value.macAmount == '' || formData.value.macAmount == 0){
    formData.value.workHours = formData.value.workDuration
    return
  }
  formData.value.workHours =MyMath.numMulti(formData.value.macAmount, formData.value.workDuration)
}
//人员零工数量改变
const workerAmountChange = () => {
  if(formData.value.workerAmount == '' || formData.value.workerAmount == 0){
    formData.value.workHours = formData.value.workDuration
    return
  }
  formData.value.workHours =MyMath.numMulti(formData.value.workerAmount, formData.value.workDuration)
}
const macTypeChange = val =>{
  formData.value.macNo=''
  formData.value.macId=''
  if (val.value == '0016') {
    isHourMeterHidden.value = false
  } else {
    isHourMeterHidden.value = true
  }
  publicApi.getLocalSelect({ type: 'MAC', macTypeCode: val.value, ownerDeptNo: formData.value.workDeptId }).then(res => {
    console.log(res.data)
    equipmentNoList.value = res.data
  })
}
const workDeptChange = val =>{
  formData.value.macNo=''
  formData.value.macId=''
  formData.value.oddUserIds = ''
  formData.value.workerAmount=''
  if (formData.value.macTypeCode && formData.value.macTypeCode != undefined &&formData.value.macTypeCode != '') {
    publicApi.getLocalSelect({ type: 'MAC', macTypeCode: formData.value.macTypeCode, ownerDeptNo: val.deptNo }).then(res => {
      console.log(res.data)
      equipmentNoList.value = res.data
    })
  }
  if(formData.value.workDeptId =='000100010005'){
    publicApi.getLocalSelect({ type: 'MACHINE_USER',  deptId: val.id }).then(res => {
      oddUserIdsList.value = res.data
    })
  }
}
const handleDelete = row => {
  let hours = 0;
  debugger
  formData.value.workTimeTable.forEach((item, index) => {
    // 根据表格自动生成的唯一标识删除，字段名在rowConfig中指定
    if (item.row_id == row.row_id) {
      formData.value.workTimeTable.splice(index, 1)
    }
  })
  formData.value.workTimeTable.forEach((item, index) => {
    if (item.duration) {
      hours = MyMath.numAdd(hours, item.duration)
    }
  })
  formData.value.workDuration = hours
  if(formData.value.oddType == '1'){
    macAmountChange()
  }
  else if(formData.value.oddType == '2') {
    workerAmountChange()
  }
}

const macNoChange = val =>{
	formData.value.macAmount = val.length
  if (formData.value.workDuration) {
    if(formData.value.oddType == '1'){
      macAmountChange()
    }
    else if(formData.value.oddType == '2') {
      workerAmountChange()
    }
  }
}
const oddUserIdsChange = val =>{
	formData.value.workerAmount = val.length
  if (formData.value.workDuration) {
    if(formData.value.oddType == '1'){
      macAmountChange()
    }
    else if(formData.value.oddType == '2') {
      workerAmountChange()
    }
  }
}
const times = ref([])
const changeDate = val => {
  console.log(formData.value.oddType)
	if (formData.value.workDuration) {
    if(formData.value.oddType == '1'){
      macAmountChange()
    }
		else if(formData.value.oddType == '2') {
      workerAmountChange()
    }
	}
}

const resetForm = () => {
  formData.id = ''
  formData.status = ''

  ruleForm.value.resetFields()
  formData.value.id = ''
  formData.value.macTypeCode = ''
  formData.value.macTypeName = ''
  formData.value.macNo = ''
  formData.value.oddUserIds = ''
  formData.value.macId = ''
  formData.value.macAmount = ''
  formData.value.workerAmount = ''
  formData.value.workDeptId = ''
  formData.value.workDeptName = ''
  formData.value.workContent = ''
  formData.value.workDuration = ''
  formData.value.workHours = ''
  formData.value.remark = ''
  //formData.value.reportEndTime = ''
  //formData.value.reportStartTime = ''
  formData.value.workTimeTable = []
  workDeptMacList.value=[]
}

const dataClear = () => {
	formData.value.macTypeCode = ''
	formData.value.macTypeName = ''
	formData.value.macNo = ''
  formData.value.oddUserIds = ''
  formData.value.macId = ''
	formData.value.macAmount = ''
	formData.value.workerAmount = ''
	formData.value.workDeptId = ''
  formData.value.workDeptName = ''
	formData.value.workContent = ''
	formData.value.workDuration = ''
	formData.value.workHours = ''
	formData.value.remark = ''
	//formData.value.reportEndTime = ''
	//formData.value.reportStartTime = ''
  formData.value.workTimeTable = []
  workDeptMacList.value=[]
  if(formData.value.oddType == '1'){
    api.getDepts({ type: 1 }).then(res => {
      workDeptMacList.value = res.data
    })
  }else if(formData.value.oddType == '2'){
    api.getDepts({ type: 2 }).then(res => {
      workDeptMacList.value = res.data
    })
  }
}
const selectChange = () => {

}
const deptId = ref(null);
const init = () => {
  if(formData.value.oddType == '1'){
    api.getDepts({ type: 1 }).then(res => {
      workDeptMacList.value = res.data
      workDeptMacList.value.forEach(x=>{
        if(x.deptNo == '000100010005'){
          deptId.value = x.id
        }
      })
      publicApi.getLocalSelect({ type: 'MACHINE_USER', deptId: deptId.value }).then(res => {
        oddUserIdsList.value = res.data
      })
    })
  }else if(formData.value.oddType == '2'){
    api.getDepts({ type: 2 }).then(res => {
      workDeptMacList.value = res.data
      workDeptMacList.value.forEach(x=>{
        if(x.deptNo == '000100010005'){
          deptId.value = x.id
        }
      })
      publicApi.getLocalSelect({ type: 'MACHINE_USER', deptId: deptId.value }).then(res => {
        oddUserIdsList.value = res.data
      })
    })
  }
  publicApi.getLocalSelect({ type: 'DICT', dictType: 'ODD_WORK_TYPE' }).then(res => {
    oddWorkTypeList.value = res.data
  })
}
const inits = () => {
  publicApi.getLocalSelect({ type: 'MAC', macTypeCode: formData.value.macTypeCode }).then(res => {
    equipmentNoList.value = res.data
  })
}
const changeTableColumn = val => {
  tableColumns.value.forEach(item => {
    if (item.label == '添加') {
      item.isHidden = val
    }
  })
}
const getLogList = e => {
  api.getLogList(queryParams.value).then(res => {
    tableData.value = res.data
  })
}


defineExpose({
	validate,
	resetForm,
	formData,
	editOrAudit,
  isHidden,
  init,
  inits,
  changeTableColumn,
  queryParams,
  getLogList,
  isHourMeterHidden
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
