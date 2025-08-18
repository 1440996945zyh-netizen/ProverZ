<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules" style="margin: 20px 20px">
			<el-form-item label="封航开始时间" prop="startTime">
				<nvDatePicker v-model:value="formData.startTime" typeFlag="nativedatetime" placeholder="开始时间" @change="changeDate" />
			</el-form-item>
			<el-form-item label="封航结束时间" prop="endTime">
				<nvDatePicker v-model:value="formData.endTime" typeFlag="nativedatetime" placeholder="结束时间" @change="changeDate" />
			</el-form-item>
			<el-form-item label="封航时长(小时)" prop="timeLength">
				<el-input v-model="formData.timeLength" placeholder="请输入封航时长" />
			</el-form-item>
			<el-form-item label="航次" prop="shipList" style="width: 100%">
				<div style="width: 100%">
<!--          <el-input v-model="formData.shipNameList" placeholder="请输入内容"></el-input>-->

          <el-input
            type="textarea"
            :rows="3"
            placeholder="输入船名航次（船名_航次），多个用逗号“,”隔开"
            @change="getShipCount"
            v-model="formData.effectShipvoyage">
          </el-input>
<!--					<RemoteSelect multiple type="SCN_STATUS" v-model:value="formData.shipList" @change="shipChange" />-->
<!--        <el-select-->
<!--            v-model="formData.shipList"-->
<!--            multiple-->
<!--            collapse-tags-->
<!--            style="margin-left: 0px;"-->
<!--            @change="shipChange"-->
<!--            placeholder="请选择">-->
<!--            <el-option-->
<!--              v-for="item in shipVoyageList"-->
<!--              :key="item.value"-->
<!--              :label="item.label"-->
<!--              :value="item.value">-->
<!--            </el-option>-->
<!--          </el-select>-->
				</div>
			</el-form-item>
			<el-form-item label="封航原因" prop="closeReason">
				<el-select
					v-model="formData.closeReason"
					filterable
					allow-create
					default-first-option
					:reserve-keyword="false"
					placeholder="请选择封航原因"
					@change="selectChange"
				>
					<el-option v-for="item in reasonList" :key="item.value" :label="item.label" :value="item" />
				</el-select>
			</el-form-item>
			<el-form-item label="影响艘次" prop="shipVoyageNum">
				<el-input
					v-model="formData.shipVoyageNum"
					@input="formData.shipVoyageNum = proxy.verify('number', formData.shipVoyageNum)"
					placeholder="请输入影响艘次"
				/>
			</el-form-item>
			<el-form-item label="注意事项" prop="remark">
				<el-input v-model="formData.remark" maxlength="200" placeholder="请输入注意事项" show-word-limit type="textarea" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="closeSail">
import { ref, reactive, nextTick, onMounted, h, watch, getCurrentInstance } from 'vue'
import { getDuration } from '@/utils/index.js'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import publicApi from '@/api/public/index.js'
import api from '@/api/dispatch/closeSail/index.js'
import nvDatePicker from '@/components/nvDatePicker/index.vue'
const value2 = ref([])
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const ruleForm = ref()
const times = ref([])
const reasonList = ref([])
const closeReason = ref({})
const formData = reactive({
	id: '',
	startTime: '',
	endTime: '',
	timeLength: null,
	shipList: [],
	remark: '',
	shipVoyageNum: '',
	closeReason: null,
	closeReasonCode: '',
	closeReasonName: '',
  effectShipvoyage:'',
})
const rules = reactive({
	closeReason: proxy.getRules({ required: true }),
	startTime: proxy.getRules({ required: true }),
	endTime: proxy.getRules({ required: false }),
})
const shipChange = () => {
	let i = 0
	for (let x = 0; x < formData.shipList.length; x++) {
		i++
	}
	formData.shipVoyageNum = i
}
const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
		}
	})
	return flag
}
// 清空表单
const resetForm = () => {
	ruleForm.value.resetFields()
	formData.id = ''
	formData.effectShipvoyage = ''
  formData.value = []
}

const selectChange = e => {
	var flag = true
	reasonList.value.forEach(item => {
		if (item.value == e.value) {
			formData.closeReasonCode = item.value
			formData.closeReasonName = item.label
			flag = false
		}
	})
	if (flag) {
		formData.closeReasonCode = 0 //等于0时后端会增加新的字典信息
		formData.closeReasonName = e
	}
}

const init = () => {
	publicApi.getLocalSelect({ type: 'DICT', dictType: 'DIS_CLOSE_SAIL_REASON' }).then(res => {
		reasonList.value = res.data
	})
}
// 监听
// watch(
// 	() => formData.startTime,
// 	newVal => {
// 		if (newVal) {
// 			formData.timeLength = getDuration('hour', newVal)
// 		} else {
// 			formData.timeLength = ''
// 		}
// 	},
// 	{ deep: true }
// )
const getShipCount= value =>{
  if(","==value.charAt(value.length-1) || "，"==value.charAt(value.length-1)){
    value = value.substring(0,value.length-1);
  }
  value = value.replaceAll("，",",");
  formData.effectShipvoyage = value
  let array = formData.effectShipvoyage.split(",");
  let count = 0;
  for(let index in array){
    let item = array[index]
    if("" != item && '' != item){
      count++;
    }
  }
  // let length = array.length;
  formData.shipVoyageNum = count;
}

const changeDate = val => {
	if (formData.startTime && formData.endTime) {
		times.value[0] = formData.startTime
		times.value[1] = formData.endTime
    var beginTime = new Date(times.value[0])
    var endTime = new Date(times.value[1])
    var hours = (endTime - beginTime) / (1000 * 60 * 60)
    var time = Math.round(hours * 100) / 100
		formData.timeLength = Number(time)
	}else{
    formData.timeLength = Number(0)
  }

	// //查询在港的船舶
  // api.getShipVoyageList({
  //   startTime:formData.startTime,
  //   endTime:formData.endTime,
  // }).then(res=>{
  //   formData.shipList = []
  //   // shipVoyageList.value = res.data;
  //   for(let index in res.data){
  //     formData.shipList.push(res.data[index].value)
  //   }
  // })
  // console.log(formData.shipList)
  // console.log(shipVoyageList.value)

}
defineExpose({
	validate,
	resetForm,
	formData,
})
init()
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.newDateStyle {
	width: 100%;
	height: 32px;
	line-height: 28px;
	padding-left: 10px;
	border-radius: 4px;
	border: 1px solid #dcdfe6;
	box-shadow: none;
	font-size: 13px;
	color: #606266;
	font-family: Arial;
	display: inline-block;
}
.newDateStyle:focus {
	outline: none;
	border: 1px solid #1890ff;
}
</style>
