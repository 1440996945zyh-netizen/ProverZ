<template>
	<el-form :model="formData" ref="ruleForm" label-width="100px" :inline="true" label-position="top">
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="船舶信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="船名航次" prop="shipNameVoyage">
							<div style="width: 100%">
								<el-input v-model="formData.shipNameVoyage" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货种" prop="cargoCategoryName">
							<div style="width: 100%">
								<el-input v-model="formData.cargoCategoryName" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="靠泊时间" prop="berthTime">
							<div style="width: 100%">
								<el-input v-model="formData.berthTime" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="离泊时间" prop="leaveBerthTime">
							<div style="width: 100%">
								<el-input v-model="formData.leaveBerthTime" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item prop="" label="交接清单上传" style="line-height: 50px; display: inline">
							<upload
								:fileTypeName="fileTypeName"
								businessType="HANDOVERLIST"
								:businessId="formData.id"
								@changeFile="changeFile"
							/>
						</el-form-item>
					</el-col>
          <el-col :span="6">
            <el-form-item prop="" label="海关报关单上传" style="line-height: 50px; display: inline">
              <upload
                :fileTypeName="fileTypeName"
                businessType="HANDOVERLIST_HG"
                :businessId="formData.id"
                @changeFile="changeHGFile"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item prop="" label="第三方检测报告上传" style="line-height: 50px; display: inline">
              <upload
                :fileTypeName="fileTypeName"
                businessType="HANDOVERLIST_JC"
                :businessId="formData.id"
                @changeFile="changeJCFile"
              />
            </el-form-item>
          </el-col>
				</el-row>
			</el-collapse-item>
			<el-collapse-item title="货物信息" name="2">
				<template #title>
					<el-row class="listOperate">
						<div style="float: left">
							<span style="padding-right: 5px">货物信息</span>
							<span style="padding-right: 5px">件数:{{ formData.quantity }} |</span>
							<span style="padding-right: 5px">重量:{{ formData.ton }} |</span>
							<span style="padding-right: 5px">票数:{{ formData.ticketNum }}</span>
						</div>
					</el-row>
				</template>
				<EditTable
					ref="EditTableRef"
					:showToolBar="true"
					:tableHeight="400"
					:autoResize="true"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:editRules="editRules"
					@input="tableInput"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="drawer">
import upload from '../../../../components/upload/index'
import math from '@/utils/math.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import EditTable from '@/components/EditTable/index.vue'
const collapseOpen = ['1', '2'] // 打开的面板
const formData = reactive({
	id: '',
	shipNameVoyage: '', //船舶航次
	cargoCategoryName: '', //货种
	berthTime: '', //靠泊时间
	leaveBerthTime: '', //离泊时间
	quantity: 0, //件数
	ton: 0, //重量
	ticketNum: 0, //票数
	fileIds: [], //图片上传
	hgFileIds: [], //海关报关单
	jcFileIds: [], //第三方检测报告单
})
const validate = async () => {
	let flag = await EditTableRef.value.validAllEvent()
	return flag
}
// 可编辑表格
const EditTableRef = ref('')
const tableData = ref([])
// 文件上传
const changeFile = file => {
	// console.log('文件上传', file)
	formData.fileIds = file
}
// 海关报关单
const changeHGFile = file => {
  // console.log('文件上传', file)
  formData.hgFileIds = file
}
// 第三方检测报告
const changeJCFile = file => {
  // console.log('文件上传', file)
  formData.jcFileIds = file
}
const tableColumns = reactive([
	{
		prop: 'cargoInfoNo',
		label: '票货号',
		minWidth: 120,
	},
  // {
  //   prop: 'deliveryNumbers',
  //   label: '提运单号',
  //   width: 150,
  //   editRender: {},
  //   editType: 'input',
  // },
  {
    prop: 'cargoOwnerName',
    label: '货主',
    minWidth: 200,
  },
	// {
	// 	prop: 'cargoAgentName',
	// 	label: '货代',
	// 	minWidth: 200,
	// },
	{
		prop: 'cargoName',
		label: '货物',
		width: 150,
	},

	{
		prop: 'quantity',
		label: '件数',
		width: 150,
		editRender: {},
		editType: 'input',
	},
	{
		prop: 'ton',
		label: '重量',
		width: 150,
		editRender: {},
		editType: 'input',
	},
  {
		prop: 'volumeTon',
		label: '体积吨',
		width: 150,
		editRender: {},
		editType: 'input',
	},
	{
		prop: 'ticketNum',
		label: '票数',
		width: 150,
		editRender: {},
		editType: 'input',
	},

	{
		prop: 'remark',
		label: '备注',
		width: 260,
		editRender: {},
		editType: 'input',
	},
])
const editRules = ref({
	ton: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 4,
		},
	}),
	quantity: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 0,
		},
	}),
	ticketNum: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 0,
		},
	}),
})
// 列回调事件
const tableInput = (val, changeRow, title) => {
	if (title == '件数') {
		formData.quantity = 0
		tableData.value.forEach(item => {
			if (Number(item.quantity)) {
				formData.quantity = math.numAdd(formData.quantity, Number(item.quantity))
				//formData.quantity += Number(item.quantity)
			}
		})
	}
	if (title == '重量') {
		formData.ton = 0
		tableData.value.forEach(item => {
			if (Number(item.ton)) {
				formData.ton = math.numAdd(formData.ton, Number(item.ton))
				//formData.ton += Number(item.ton)
			}
		})
  }
	if (title == '票数') {
		formData.ticketNum = 0
		tableData.value.forEach(item => {
			if (Number(item.ticketNum)) {
				formData.ticketNum = math.numAdd(formData.ticketNum, Number(item.ticketNum))
				//formData.ticketNum += Number(item.ticketNum)
			}
		})
	}
}
// 表单清空
const resetForm = () => {
	// proxy.resetObj(formData.value)
	proxy.$bus.emit('resetFileList') //文件上传清空
}
defineExpose({
	validate,
	formData,
	tableData,
	resetForm,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
	width: 100%;
	padding: 0 10px 0 0;
	justify-content: space-between;
	align-items: center;
}
</style>
