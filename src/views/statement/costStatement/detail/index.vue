<template>
  <div>
    <el-form :model="statementForm" ref="formRef" label-width="110px" :rules="rules" :inline="true" label-position="top">
      <el-collapse v-model="collapseOpen">
			  <el-collapse-item title="船货信息" name="1">
          <el-row>
            <el-col :span="8">
              <el-form-item label="类型" prop="type">
                <Select
                  v-model:value="statementForm.type"
                  :dataConfig="{ params: { type: 'DICT', dictType: 'HANDOVERLIST_TYPE' } }"
                >
                </Select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="统计日期" prop="settlementDate">
								<el-date-picker
				        	v-model="statementForm.settlementDate"
				        	value-format="YYYY-MM-DD"
				        	format="YYYY-MM-DD"
				        	type="date"
				        	placeholder="计费日期"
				        ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="申请开票日期" prop="invoiceDate">
								<el-date-picker
				        	v-model="statementForm.invoiceDate"
				        	value-format="YYYY-MM-DD"
				        	format="YYYY-MM-DD"
				        	type="date"
				        	placeholder="申请开票日期"
				        ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
<!--              <el-form-item label="作业公司" prop="companyId" required v-if="statementForm.type == '70'">
                <Select
									:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
									v-model:value="statementForm.companyId"
									v-model:label="statementForm.companyName"
								/>
              </el-form-item> v-else-->
              <el-form-item label="作业公司" prop="companyId" required >
                <RemoteSelect
									type="CUSTOMER_ALL"
									v-model:value="statementForm.companyId"
									v-model:label="statementForm.companyName"
								/>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="客户" prop="customerId">
                <RemoteSelect
									type="CUSTOMER_ALL"
									v-model:value="statementForm.customerId"
									v-model:label="statementForm.customerName"
								/>
              </el-form-item>
<!--              <el-form-item label="客户" prop="customerId" required v-else>
                <Select
									:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
									v-model:value="statementForm.customerId"
									v-model:label="statementForm.customerName"
								/>
              </el-form-item>-->
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同号">
						  	<div style="width: 100%">
						  		<el-input v-model="statementForm.contractNo" />
						  	</div>
						  </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="贸别">
                <Select
							  	:selectData="[
								  	{ label: '内贸', value: '内贸' },
								  	{ label: '外贸', value: '外贸' },
								  ]"
							  	v-model:value="statementForm.tradeType"
							  	v-model:label="statementForm.tradeType"
							  />
              </el-form-item>
            </el-col>
            <el-col :span="8">
					  	<el-form-item label="船名航次">
					  		<el-input v-model="statementForm.shipNameVoyage" />
					  	</el-form-item>
					  </el-col>
            <el-col :span="8">
					  	<el-form-item label="票货">
					  		<RemoteSelect
				        	type="BUS_CARGO_INFO"
				        	v-model:value="statementForm.cargoInfoId"
				        	v-model:label="statementForm.label"
				        />
					  	</el-form-item>
					  </el-col>
          </el-row>
					<el-row>
            <el-col :span="8">
              <el-form-item label="文件">
                <Upload
      					  businessType="STATEMENT"
      					  :businessId="statementForm.id"
      					  @changeFile="changeFile"
      					/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item title="费目明细" name="2">
          <template v-slot:title>
				  	<div style="display: flex; justify-content: space-between; width: 95%">
				  		<div>货物信息</div>
				  		<div>
				  			<el-button type="primary" @click.stop="addTableData">
				  				添加
				  			</el-button>
				  		</div>
				  	</div>
				  </template>
          <EditTable
				  	ref="costTableRef"
				  	:show-footer="true"
				  	:autoResize="true"
				  	:tableColumns="costTableColumns"
				  	:tableData="statementForm.details"
				  	:editRules="editRules"
						:tableHeight="200"
				  	@input="tableInput"
				  />
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<script setup>
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted,h,getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/statement/costStatement/index'
import publicapi from '@/api/public/index'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import EditTable from '@/components/EditTable/index.vue'
import publicApi from '@/api/public/index'
import Upload from '@/components/upload/index.vue'
import { ElButton, ElTag,ElMessage, ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance()

const formRef = ref()
const costTableRef = ref()
const typeList = ref([
  {
    value: '70',
    label: '销售订单'
  },
  {
    value: '80',
    label: '采购订单'
  }
])
const collapseOpen = ['1', '2', '3'] // 打开的面板
// 表单
const statementForm = ref({
  id: '',
  type: '70',
  settlementDate: '',
  invoiceDate: '',
  companyId: '',
  companyName: '',
  customerId: '',
  customerName: '',
  contractNo: '',
  shipNameVoyage: '',
  cargoInfoId: '',
  tradeType: '',
  details: [],
	fileIds: [],
})
//表单验证
const rules = reactive({
	settlementDate: [{ required: true, message: '计费日期不能为空', trigger: 'blur' }],
	invoiceDate: [{ required: true, message: '申请开票不能为空', trigger: 'blur' }],
	companyId: [{ required: false, message: '作业公司不能为空', trigger: 'change' }],
	type: [{ required: true, message: '订单类型不能为空', trigger: 'chage' }],
	customerId: [{ required: false, message: '客户不能为空', trigger: 'change' }]
})
const costTableColumns = reactive([
  {
		prop: 'rateItemCode',
		label: '费目',
		width: 120,
    editType: 'select',
		modelLabel: 'rateItemName',
		selectLabel: 'itemNm',
		selectValue: 'itemCd',
		editRender: {},
		disabled: false,
	},
  {
		label: '作业过程',
		prop: 'processCode',
		editType: 'select',
		modelLabel: 'processName',
		editRender: {},
		minWidth: 120,
	},
  {
		label: '数量1',
		prop: 'number',
		editType: 'input',
		editRender: { autofocus: '.el-input__inner' },
		width: 120,
		input: (e,row) => {
      row.amount = ((row.rate?Number(row.rate):1)*(row.number2?Number(row.number2):1)*Number(e)).toFixed(2)
      if(row.tax){
        row.taxAmount = (((row.amount?Number(row.amount):0)/(100+Number(row.tax))*Number(row.tax))).toFixed(2)
      }
    }
	},
  {
		label: '数量2',
		prop: 'number2',
		editType: 'input',
		editRender: { autofocus: '.el-input__inner' },
		width: 120,
		input: (e,row) => {
      row.amount = ((row.number?Number(row.number):1)*(row.rate?Number(row.rate):1)*Number(e)).toFixed(2)
      if(row.tax){
        row.taxAmount = (((row.amount?Number(row.amount):0)/(100+Number(row.tax))*Number(row.tax))).toFixed(2)
      }
    }
	},
  {
		label: '费率',
		prop: 'rate',
		editType: 'input',
		editRender: { autofocus: '.el-input__inner' },
		width: 120,
    input: (e,row) => {
      row.amount = ((row.number?Number(row.number):1)*(row.number2?Number(row.number2):1)*Number(e)).toFixed(2)
      if(row.tax){
        row.taxAmount = (((row.amount?Number(row.amount):0)/(100+Number(row.tax))*Number(row.tax))).toFixed(2)
      }
    }
	},
  {
		label: '计费单位',
		prop: 'unitCode',
		editType: 'select',
		modelLabel: 'unitName',
		editRender: {},
		minWidth: 120,
	},
  {
		label: '金额',
		prop: 'amount',
		editType: 'input',
		editRender: { autofocus: '.el-input__inner' },
		width: 120,
	},
  {
		label: '税率%',
		prop: 'tax',
		editType: 'input',
		editRender: { autofocus: '.el-input__inner' },
		width: 120,
    input: (e,row) => {
      row.taxAmount = (((row.amount?Number(row.amount):0)/(100+Number(e))*Number(e))).toFixed(2)
    }
	},
  {
		label: '税额',
		prop: 'taxAmount',
		editType: 'input',
		editRender: { autofocus: '.el-input__inner' },
		width: 120,
	},
  {
		label: '备注',
		prop: 'remark',
		editType: 'input',
		editRender: { autofocus: '.el-input__inner' },
		width: 120,
	},
	{
		prop: '',
		label: '操作',
		width: 120,
		align: 'center',
		disabled: false,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							deleteDataRate(row)
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
	}
])
// 可编辑列表校验
const editRules = ref({
	rateItemCode: [{ required: true, message: '填写费目' }],
	unitCode: [{ required: true, message: '填写计费单位' }],
	rate: [{ required: true, message: '填写费率' }],
	number: [{ required: true, message: '填写数量' }],
  amount: [{ required: true, message: '填写金额' }],
  tax: [{ required: true, message: '填写税率' }],
    taxAmount: [{ required: true, message: '填写税额' }],
	// cargoAgentId: [{ required: true, message: '货代必须填写' }],
	ton: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 3,
		},
	}),
	quantity: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 0,
		},
	}),
})
// 可编辑表格 input修改回调
const tableInput = (val, rowData, title) => {
	// if (Number(val)) {
	// 	rowData.amount = ''
	// 	rowData.taxAmount = ''
	// 	// 计算金额 结算数量 * 费率 / 100
	// 	rowData.amount = math.numMulti(val, rowData.rate).toFixed(2)
	// 	// 计算税额 (结算数量 / 1+费率) * 费率
	// 	rowData.taxAmount = math.numMulti(math.numDiv(rowData.amount, 1 + rowData.taxRate), rowData.taxRate).toFixed(2)
	// }
}
// 可编辑列表添加数据、
const addTableData = () => {
  console.log(statementForm.value)
  statementForm.value.details.push({
    rateItemCode: '',
    rateItemName: '',
    processCode: '',
    processName: '',
    number: '',
    number2: '',
    rate: '',
    unitCode: '',
    unitName: '',
    amount: '',
    tax: '',
    taxAmount: '',
    remark: '',
  })
}
// 清空表单
const resetForm = () => {
  statementForm.value.cargoInfoId = ''
  statementForm.value.companyId = ''
  statementForm.value.shipNameVoyage = ''
  statementForm.value.tradeType = ''
  statementForm.value.type = '70'
  statementForm.value.companyName = ''
  statementForm.value.contractNo = ''
  statementForm.value.customerId = ''
  statementForm.value.customerName = ''
  statementForm.value.details = []
  statementForm.value.fileIds = []
  statementForm.value.id = ''
  statementForm.value.invoiceDate = ''
  statementForm.value.settlementDate = ''
	nextTick(() => {
		formRef.value.clearValidate()
	})
}
// 校验
const validate = async () => {
  console.log("校验")
	let flag = false
	let flag2 = costTableRef.value.validAllEvent()
  await formRef.value.validate((valid, fields) => {
		if (valid && flag2) {
			flag = true
		} else if (!valid) {
			proxy.$message.warning('请完善表单信息！')
			flag = false
			return
		} else if (!flag2) {
			proxy.$message.warning('请完善表单信息！')
			flag = false
			return
		} else {
			flag = false
		}
	})
	return flag
}
// 查询详情
const queryById = (e) => {
  api.queryById({id: e}).then(res => {
    statementForm.value = JSON.parse(JSON.stringify(res.data))
  })
}
// 删除费率
const deleteDataRate = row => {
	console.log(statementForm.value.details)
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			statementForm.value.details = statementForm.value.details.splice(1,row.index)
		})
		.catch(err => {})
}
// 初始化数据
const init = () => {
  publicApi.getDictList({types:'UNIT'}).then(res => {
    // 给编辑table下拉框设置数据源
		proxy.setEditTableOptions(costTableColumns, {
			unitCode: res.data.UNIT,
		})
  })
  // 本地下拉框数据源
	publicApi.getLocalSelects({ types: 'MAIN_WORK_PROCESS' }).then(res => {
		// 给编辑table下拉框设置数据源
		proxy.setEditTableOptions(costTableColumns, { processCode: res.data.MAIN_WORK_PROCESS })
	})
  api.queryRateItem().then(res => {
    proxy.setEditTableOptions(costTableColumns, { rateItemCode: res.data })
  })
}
const changeFile = file => {
	statementForm.value.fileIds = file
}
init()
defineExpose({
  statementForm,
  resetForm,
  validate,
  queryById
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.el-form-item {
	position: relative;
}
.el-checkbox {
	position: absolute;
	top: -39px;
	left: 70px;
}
</style>
