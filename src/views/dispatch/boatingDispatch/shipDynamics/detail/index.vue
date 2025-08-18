<template>
	<el-form :model="formData" ref="ruleForm" label-width="110px" :rules="rules" style="margin: 0px 0px 20px 0px">
    <el-collapse v-model="collapseActiveNames">
      <el-collapse-item title="动态信息" name="1">
		    <el-form-item label="动态类型" prop="dynamicTypeCode">
		    	<Select
		    		:dataConfig="{ url: '/api/internal/public/getDictListByType/SHIPSTATUS' }"
		    		v-model:value="formData.dynamicTypeCode"
		    		v-model:label="formData.dynamicTypeName"
		    		disabled
		    	/>
		    </el-form-item>
		    <el-form-item label="装卸" prop="loadUnload" v-if="dynamicType === '70' || dynamicType === '80' || dynamicType === '90' || dynamicType === '100' || dynamicType === '130'">
		    	<el-input v-model="formData.loadUnload" disabled></el-input>
		    </el-form-item>
		    <el-form-item label="动态时间" prop="dynamicStartTime" >
<!--          <el-input placeholder="动态时间" v-model="formData.dynamicStartTime" ></el-input>-->
          <nvDatePicker v-model:value="formData.dynamicStartTime" typeFlag="nativedatetime" />
          <!--		    	<nvDatePicker v-model:value="formData.dynamicStartTime" disabled typeFlag="nativedatetime" />-->
		    	<!-- <el-date-picker
		    		v-model="formData.dynamicStartTime"
		    		type="datetime"
		    		format="YYYY-MM-DD HH:mm"
		    		value-format="YYYY-MM-DD HH:mm"
		    		placeholder="请选择动态时间"
		    	></el-date-picker> -->
		    </el-form-item>
        <el-form-item label="结束时间" prop="dynamicEndTime" v-if="dynamicType === '60' || dynamicType === '130'">
          <nvDatePicker v-model:value="formData.dynamicEndTime" typeFlag="nativedatetime" />
        </el-form-item>
		    <el-form-item label="泊位" prop="berthId" v-if="dynamicType === '50' || dynamicType === '60'">
		    	<Select :selectData="BERTH" v-model:value="formData.berthId" v-model:label="formData.berthName" @change="changeBerth" />
		    </el-form-item>
		    <el-form-item label="首缆" prop="bollardNoStart" v-if="dynamicType === '50' || dynamicType === '60'">
		    	<Select
            :selectData="berthBollard"
		    		v-model:value="formData.bollardNoStart"
		    		v-model:label="formData.bollardNoStart"
		    	/>
		    </el-form-item>
		    <el-form-item label="尾缆" prop="bollardNoEnd" v-if="dynamicType === '50' || dynamicType === '60'">
		    	<Select
            :selectData="berthBollard"
		    		v-model:value="formData.bollardNoEnd"
		    		v-model:label="formData.bollardNoEnd"
		    	/>
		    </el-form-item>
		    <el-form-item label="舷靠" prop="berthType" v-if="dynamicType === '50' || dynamicType === '60'">
		    	<Select :selectData="SIDE" v-model:value="formData.berthType" selectValue="dictValue" selectLabel="dictLabel" />
		    </el-form-item>
		    <el-form-item label="停工类别" prop="stopTypeCode" v-if="dynamicType === '80'">
		    	<Select
		    		:selectData="STOP_REASON_CLASS"
		    		v-model:value="formData.stopTypeCode"
		    		v-model:label="formData.stopTypeName"
		    		selectValue="dictValue"
		    		selectLabel="dictLabel"
            @change="changeStopType"
		    	/>
		    </el-form-item>
        <el-form-item label="停时类型" prop="stopHourTypeCode" v-if="dynamicType === '80'">
		    	<Select
		    		:selectData="STOP_HOUR_TYPE"
		    		v-model:value="formData.stopHourTypeCode"
		    		v-model:label="formData.stopHourTypeName"
            @change="changeStopHourType"
          />
		    </el-form-item>
		    <el-form-item label="停工原因" prop="stopId" v-if="dynamicType === '80'">
		    	<Select
            :selectData="STOP_REASON"
            v-model:value="formData.stopId"
		    		v-model:label="formData.stopName"
		    	/>
		    </el-form-item>
		    <el-form-item label="备注" prop="remark">
		    	<el-input placeholder="请输入备注" v-model="formData.remark"></el-input>
		    </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="拖轮信息" name="2" v-if="dynamicType === '110' || dynamicType === '50' || dynamicType === '60' || dynamicType === '120'">
        <EditTable
          ref="editTable"
          tableHeight="null"
          :tableColumns="tableColumns"
          :tableData="tableData"
          :syncResize="true"
          :border="true"
          :total="total"
          :editRules="rules"
          :hasAdd="true"
          disabledKey="dis"
          @change="changeSelect"
        />
      </el-collapse-item>
    </el-collapse>
	</el-form>
</template>

<script setup name="detail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
import EditTable from '@/components/EditTable'
import publicApi from '@/api/public/index.js'
import api from '@/api/dispatch/boatingDispatch/index.js'
import nvDatePicker from '@/components/nvDatePicker/index.vue'
import { ElButton } from 'element-plus'
let tableData = ref([
  {
    tugId: '',
    tugName: '',
    tugServiceType: '',
    tugServiceTypeName: '',
    startTime: '',
    endTime: '',
    remark: '',
    isStandardUse: '1',
    reasonName: '',
    reasonCode: '',
  },
])
const ruleForm = ref()
const formData = reactive({
	id: '',
	stopTypeCode: '',
	stopTypeName: '',
  stopHourTypeCode:'',
  stopHourTypeName:'',
	stopName: '',
	stopId: '',
	dynamicTypeName: '',
	dynamicTypeCode: '',
	shipvoyageId: '',
	shipvoyageItemId: '',
	berthType: '',
	berthName: '',
	berthId: '',
	bollardNoStart: '',
	bollardNoEnd: '',
	remark: '',
	dynamicStartTime: '',
  dynamicEndTime: '',
  loadUnload:'',
  tugs:[]
})
/*const rules = reactive({
  dynamicStartTime: proxy.getRules({ required: true }),
  dynamicEndTime: proxy.getRules({ required: true }),
  bollardNoStart: proxy.getRules({ required: true }),
  bollardNoEnd: proxy.getRules({ required: true }),
  berthId: proxy.getRules({ required: true }),
  berthNo: proxy.getRules({ required: true }),
  berthType: proxy.getRules({ required: true }),
  stopTypeCode: proxy.getRules({ required: true }),
  stopId: proxy.getRules({ required: true }),
  tugId: proxy.getRules({ required: true }),
  tugServiceType: proxy.getRules({ required: true }),
  startTime: proxy.getRules({ required: true }),
  endTime: proxy.getRules({ required: true }),
})*/
// 修改泊位重置缆桩
let berthBollard = ref([]);
const changeBerth = async e => {
	formData.bollardNoStart = ''
	formData.bollardNoEnd = ''
  berthBollard.value = [];
  await api.getBollard({
    id:formData.berthId
  }).then(res=>{
    berthBollard.value.push(...res.data)
  })
}
// table--------------------------------------------------------------------------------------
const props = defineProps({
  // 点击行
  clickRow: {
    type: Object,
    default: {},
  },
  // 动态跟踪的类型
  dynamicType: {
    type: String,
    default: '',
  },
})
const collapseActiveNames = ref(['1', '2'])
let reasonList = ref([])
const resetForm = async () => {
  for (const key in formData) {
    formData[key] = ''
  }
  await publicApi.getLocalSelect({ type: 'DICT', dictType: 'DIS_TUG_REASON' }).then(res => {
    if (res.data != null && res.data.length != 0) {
      reasonList.value = res.data
    }
  })
  await api.getShutdownType({ type: 'STOP_REASON' }).then(res => {
    STOP_REASON.value.push(...res.data)
  })
}
const tableColumns = reactive([
  {
    prop: 'tugId',
    width: 150,
    label: '拖轮名称',
    editRender: {},
    editType: 'select',
    modelLabel: 'tugName',
    selectData: [],
    notDisabledInRow: true,
  },
  {
    prop: 'tugServiceType',
    label: '服务内容名称',
    editRender: {},
    editType: 'select',
    modelLabel: 'tugServiceTypeName',
    selectLabel: 'dictLabel',
    selectValue: 'dictValue',
    selectData: [],
    notDisabledInRow: true,
    width: 150,
  },
  {
    prop: 'isStandardUse',
    label: '是否标准使用',
    editRender: {},
    editType: 'select',
    modelValue: 'isStandardUse',
    width: 150,
    selectData: [
      { label: '是', value: '1' },
      { label: '否', value: '0' },
    ],
    change: (e, row) => {
      if (e.value == 1) {
        row.dis = false
        row.reasonCode = null
        row.reasonName = null
      } else {
        row.dis = false
      }
    },
  },
  {
    prop: 'reasonName',
    label: '未使用原因',
    editRender: {},
    editType: 'select',
    allowCreate: 'true',
    selectData: reasonList,
    modelLabel: 'reasonName',
    modelValue: 'reasonCode',
    selectValue: 'value',
    selectLabel: 'label',
    width: 150,
    change: (e, row) => {
      if (!e) {
        row.reasonCode = null
      } else {
        row.reasonCode = e.value
      }
    },
  },
  { prop: 'startTime', label: '开始时间', width: 150, editRender: {}, editType: 'nativedatetime' },
  { prop: 'endTime', label: '结束时间', width: 150, editRender: {}, editType: 'nativedatetime' },
  { prop: 'remark', label: '备注', width: 150, editRender: {}, editType: 'input', notDisabledInRow: true },
  {
    prop: '',
    label: '添加',
    width: 100,
    align: 'center',
    fixed: 'right',
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
const editTable = ref()
const rules = reactive({
  dynamicStartTime: proxy.getRules({ required: true }),
  dynamicEndTime: proxy.getRules({ required: true }),
  bollardNoStart: proxy.getRules({ required: false }),
  bollardNoEnd: proxy.getRules({ required: false }),
  berthId: proxy.getRules({ required: true }),
  berthNo: proxy.getRules({ required: true }),
  berthType: proxy.getRules({ required: true }),
  stopTypeCode: proxy.getRules({ required: true }),
  stopId: proxy.getRules({ required: true }),
  tugId: proxy.getRules({ required: true }),
  tugServiceType: proxy.getRules({ required: true }),
  startTime: proxy.getRules({ required: true }),
  endTime: proxy.getRules({ required: true }),
})
const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})

	// ------ 拖轮表格校验
	// 筛选数据
	// 触发筛选数据中第一项的表单验证
	// if (editTable.value && filterArr.length >= 1) {
	// 	if (await editTable.value.rowValid(filterArr[0])) {
	// 		flag = true
	// 	} else {
	// 		flag = false
	// 	}
	// }
	// ------ 拖轮表格校验 end

	return flag
}
// 删除事件
const handleDelete = row => {
	tableData.value.splice(row.index, 1)
}
const BERTH = ref([]) // 泊位
const SIDE = ref([]) // 舷靠
const STOP_REASON_CLASS = ref([]) // 停工类别
const STOP_HOUR_TYPE = ref([]) // 停时类型
const STOP_REASON = ref([]) // 停工原因


const changeStopType = async e => {
  formData.stopHourTypeCode = ''
  formData.stopHourTypeName = ''
  formData.stopId = ''
  formData.stopName = ''
  STOP_HOUR_TYPE.value = [];
  let params = {
    type: 'STOP_HOUR_TYPE',
    parent: formData.stopTypeCode
  }
  await api.getStopHourType(params).then(res=>{
    STOP_HOUR_TYPE.value.push(...res.data)
  })
}
const changeStopHourType = async e => {
/*  formData.stopId = ''
  formData.stopName = ''*/
  STOP_REASON.value = [];
  let params = {
    type: 'STOP_REASON',
    stopType: formData.stopTypeCode,
    stopHourType:formData.stopHourTypeCode
  }
  await api.getShutdownType(params).then(res=>{
    STOP_REASON.value.push(...res.data)
  })
}


const init = () => {
	publicApi.getLocalSelects({ types: 'BERTH,TUG' }).then(res => {
		BERTH.value = res.data.BERTH
		proxy.setEditTableOptions(tableColumns, { tugId: res.data.TUG })
	})
	publicApi.getDictList({ types: 'SIDE,TUG_SERVICE_TYPE,STOP_REASON_CLASS' }).then(res => {
		SIDE.value = res.data.SIDE
		STOP_REASON_CLASS.value = res.data.STOP_REASON_CLASS
		proxy.setEditTableOptions(tableColumns, { tugServiceType: res.data.TUG_SERVICE_TYPE })
	})
}

init()
defineExpose({
	validate,
	resetForm,
	formData,
	editTable,
  tableData
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
