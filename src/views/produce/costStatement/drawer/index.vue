<template>
	<el-form
		:model="formData"
		ref="ruleForm"
		label-width="100px"
		:disabled="formData.isDisabled"
		:rules="formData.isDisabled ? '' : rules"
		:inline="true"
		label-position="top"
	>
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="基本信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="作业公司" prop="companyId">
							<div style="width: 100%">
								<Select
									:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
									v-model:value="formData.companyId"
									v-model:label="formData.companyName"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货主" prop="customerName">
							<div style="width: 100%">
								<el-input v-model="formData.customerName" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货代" prop="cargoAgentName">
							<div style="width: 100%">
								<el-input v-model="formData.cargoAgentName" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货名" prop="cargoName">
							<div style="width: 100%">
								<el-input v-model="formData.cargoName" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="船名航次" prop="shipNameVoyage">
							<div style="width: 100%">
								<el-input v-model="formData.shipNameVoyage" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="贸别" prop="tradeTypeLabel">
							<el-input v-model="formData.tradeTypeLabel" disabled />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="进出口" prop="impExpLabel">
							<el-input v-model="formData.impExpLabel" disabled />
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
			<el-collapse-item title="结算信息" name="2">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="交接清单量" prop="ton">
							<div style="width: 100%">
								<el-input v-model="formData.ton" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="地磅吨数" prop="cargoName">
							<div style="width: 100%">
								<el-input v-model="formData.ton2" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="是否最终结算" prop="isFinal">
							<div style="width: 100%">
								<Select
									:selectData="[
										{ label: '是', value: '1' },
										{ label: '否', value: '0' },
									]"
									v-model:value="formData.isFinal"
									v-model:label="formData.isFinalLabel"
									:disabled="true"
								/>
							</div>
						</el-form-item>
					</el-col>
          <el-col :span="6">
						<el-form-item label="结算方式" prop="settlementBasisName"   >
              <el-input v-model="formData.settlementBasisName"  disabled/>
            </el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="备注" prop="remark">
							<div style="width: 100%">
								<el-input v-model="formData.remark" />
							</div>
						</el-form-item>
					</el-col>
          <el-col :span="6">
            <el-form-item label="出入库作业量(件杂)" prop="inOutTon">
              <div style="width: 100%">
                <el-input v-model="formData.inOutTon" disabled />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="车船直取作业量（件杂）" prop="zqccTon">
              <div style="width: 100%">
                <el-input v-model="formData.zqccTon" disabled />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="车岸直取作业量（件杂）" prop="zqcaTon">
              <div style="width: 100%">
                <el-input v-model="formData.zqcaTon" disabled />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="isHidden">
            <el-form-item label="进保税区货量（吨）" prop="bondedAreaTon">
              <div style="width: 100%">
                <el-input v-model="formData.bondedAreaTon" type="number"/>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="isLJLS">
            <el-form-item label="集港过磅量" prop="jgWeight" >
              <div style="width: 100%">
                <el-input v-model="formData.jgWeight" type="number"/>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="isLJLS">
            <el-form-item label="疏港过磅量" prop="sgWeight">
              <div style="width: 100%">
                <el-input v-model="formData.sgWeight" type="number"/>
              </div>
            </el-form-item>
          </el-col>
				</el-row>
				<EditTable
					ref="EditTableRef"
          border
					:showToolBar="true"
					:tableHeight="400"
					:autoResize="true"
					:tableColumns="tableColumns"
					:tableData="formData.details"
					:editRules="formData.isDisabled ? '' : editRules"
					@input="tableInput"
					@change="tableChange"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="drawer">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import publicApi from '@/api/public/index.js'
import EditTable from '@/components/EditTable/index.vue'
import Select from '@/components/Select/index.vue'
// watch(
// 	'formData.isDisabled',
// 	newV => {
// 		tableColumns.value[3].isHidden = newV || false
// 	},
// 	{ deep: true }
// )
const collapseOpen = ['1', '2'] // 打开的面板
const ruleForm = ref()
const isHidden = ref(false)
const isLJLS = ref(false)
const formData = ref({
	id: '',
	companyId: '',
	companyName: '',
	cargoOwnerName: '',
	cargoAgentName: '',
	cargoName: '',
	shipNameVoyage: '',
	tradeTypeLabel: '',
	impExpLabel: '',
	remark: '',
	details: [],
	isFinal: '',
	customerName: '',
	isFinalLabel: '',
  settlementBasisName:'',
  outerSettlementBasisName:'',
  contractId:'',
  bondedAreaTon:''
})
const rules = ref({
	companyId: [{ required: true, message: '作业公司必须选择' }],
	isFinal: [{ required: true, message: '最终结算必须选择' }],
})
const validate = async () => {
	let flag = await EditTableRef.value.validAllEvent()
	await ruleForm.value.validate((valid, fields) => {
		if (!valid) {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}
const resetForm = () => {
	formData.id = ''
  formData.companyId='',
  formData.companyName= '',
  formData.cargoOwnerName= '',
  formData.cargoAgentName= '',
  formData.cargoName= '',
  formData.shipNameVoyage= '',
  formData.tradeTypeLabel= '',
  formData.impExpLabel= '',
  formData.remark= '',
  formData.details= [],
  formData.isFinal= '',
  formData.customerName= '',
  formData.isFinalLabel= '',
  formData.settlementBasisName= '',
  formData.outerSettlementBasisName='',
  formData.contractId = ''
	ruleForm.value.resetFields()
	formData.details = []
}

const init = data => {}

// 可编辑表格
const EditTableRef = ref('')
const tableColumns = ref([
	{
		prop: 'serviceContentName',
		label: '服务内容',
		minWidth: 200,
		isDisabled: true,
	},
	{
		prop: 'number2',
		label: '预结算量',
		minWidth: 200,
		isDisabled: true,
	},

	{
		prop: 'number',
		label: '本次结算量',
		width: 150,
		editRender: {},
		editType: 'input',
		isDisabled: true,
	},
	// {
	// 	prop: '',
	// 	label: '添加',
	// 	width: 200,
	// 	align: 'center',
	// 	render: row => {
	// 		return [
	// 			h(
	// 				ElButton,
	// 				{
	// 					onClick: () => {
	// 						handleDelete(row)
	// 					},
	// 					type: 'danger',
	// 					link: true,
	// 					icon: 'Delete',
	// 				},
	// 				{
	// 					default: () => '删除',
	// 				}
	// 			),
	// 		]
	// 	},
	// },
])
const editRules = ref({
	serviceContentId: proxy.getRules({
		required: true,
	}),
	/*	number: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),*/
})
/** 删除按钮操作 */
const handleDelete = row => {
	formData.value.details.splice(row.index, 1)
}

const changeTableColums=(routeType)=>{
  console.log('routeType',routeType);
  nextTick(()=>{
    if(routeType=='1'){
      tableColumns.value.forEach(o=>{
        if(o.label=='本次结算量'){
          o.label='本次确认量'
        }
      })
    }else{
      tableColumns.value.forEach(o=>{
        if(o.label=='本次确认量'){
          o.label='本次结算量'
        }
      })
    }
  })

}

// 列输入框回调事件
const tableInput = (val, changeRow, title) => {}
// 列下拉框回调事件
const tableChange = (val, changeRow, title) => {
	if (title == '服务内容') {
		serviceContentNumData.value.forEach(item => {
			if (item.serviceContentId == val.serviceContentId) {
				val.number2 = item.number
			}
		})
	}
}
defineExpose({
	validate,
	formData,
	resetForm,
	init,
  isHidden,
  isLJLS,
  changeTableColums
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
