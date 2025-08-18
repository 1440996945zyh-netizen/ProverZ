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
						<el-form-item label="作业公司" prop="companyName">
							<div style="width: 100%">
								<el-input v-model="formData.companyName" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货主" prop="cargoOwnerName">
							<div style="width: 100%">
								<el-input v-model="formData.cargoOwnerName" disabled />
							</div>
						</el-form-item>
					</el-col>
<!--					<el-col :span="6">
						<el-form-item label="货代" prop="cargoAgentName">
							<div style="width: 100%">
								<el-input v-model="formData.cargoAgentName" disabled />
							</div>
						</el-form-item>
					</el-col>-->
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
					<el-col :span="6" v-show="formData.settlementFlag!='3'&&formData.settlementFlag!='6'">
						<el-form-item label="上一港" prop="impExpLabel">
							<el-input v-model="formData.prePortName" disabled />
						</el-form-item>
					</el-col>
					<el-col :span="6" v-show="formData.settlementFlag!='3'&&formData.settlementFlag!='6'">
						<el-form-item label="下一港" prop="impExpLabel" >
							<el-input v-model="formData.nextPortName" disabled />
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
			<el-collapse-item title="结算信息" name="2">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="合同" prop="contractId">
							<div style="width: 100%">
								<Select
                  :selectData="contractList"
									v-model:value="formData.contractId"
									v-model:label="formData.contractNo"
									selectValue="id"
									selectLabel="contactNo"
									@change="contactChange"
                  :disabled="formData.status !== '10'"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="合同匹配日期" prop="date">
							<div style="width: 100%">
                <el-date-picker
                  v-model="formData.date"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  type="date"
                  placeholder="可选"
                  @change="formData.contractId = '';contactChange(undefined);proxy.$emit('listContract', formData.date)"
                />
							</div>
						</el-form-item>
					</el-col>
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
            <el-form-item label="结算方式" prop="settlementBasisName">
              <Select
                :disabled="(formData.status !== '10')&&(formData.settlementFlag == '1'||formData.settlementFlag == '2')"
                :selectData="settlementList"
                @change = "changeRate"
                v-model:label="formData.settlementBasisName"
                v-model:value="formData.settlementBasisCode"/>
            </el-form-item>
          </el-col>
					<el-col :span="6">
						<el-form-item label="是否最终结算" prop="isFinal">
							<div style="width: 100%">
								<el-input v-model="formData.isFinalLabel" disabled />
							</div>
						</el-form-item>
					</el-col>
          <el-col :span="6">
						<el-form-item label="预结算量" prop="preNumberCount">
							<div style="width: 100%">
								<el-input v-model="formData.preNumberCount" disabled />
							</div>
						</el-form-item>
					</el-col>
          <el-col :span="6">
						<el-form-item label="阶梯累积量" prop="accNumber">
							<div style="width: 100%">
								<el-input v-model="accNumber" disabled />
							</div>
						</el-form-item>
					</el-col>
          <el-col :span="6">
						<el-form-item label="入库时间" prop="inTime">
							<div style="width: 100%">
								<el-input v-model="formData.inTime" disabled />
							</div>
						</el-form-item>
					</el-col>
          <el-col :span="6" v-if="isLJLS">
						<el-form-item label="集港过磅吨数" prop="inTime">
							<div style="width: 100%">
								<el-input v-model="formData.jgWeight" disabled />
							</div>
						</el-form-item>
					</el-col>
          <el-col :span="6" v-if="isLJLS">
						<el-form-item label="疏港过磅吨数" prop="inTime">
							<div style="width: 100%">
								<el-input v-model="formData.sgWeight" disabled />
							</div>
						</el-form-item>
					</el-col>
          <el-col :span="24">
            <el-form-item label="合同附件">
              <Upload
                businessType="BUSINESS_CONTRACT_02"
                :businessId="formData.contractId"
                @changeFile="changeFile"
                :showUploadBtn="false"
                :showRemoveBtn="false"
              />
            </el-form-item>
            <el-form-item label="其他附件">
              <Upload
                businessType="BUSINESS_CONTRACT_01"
                :businessId="formData.contractId"
                @changeFile="changeFile"
                :showUploadBtn="false"
                :showRemoveBtn="false"
              />
            </el-form-item>
          </el-col>
					<el-col :span="24">
						<el-form-item label="备注" prop="remark">
							<div style="width: 100%">
								<el-input v-model="formData.remark" type="textarea" disabled />
							</div>
						</el-form-item>
					</el-col>
				</el-row>
				<EditTable
					ref="EditTableRef"
					:showToolBar="true"
					:tableHeight="400"
					:autoResize="true"
					:tableColumns="tableColumns"
					:tableData="formData.details"
					@input="tableInput"
					@change="tableChange"
				/>
			</el-collapse-item>
      <el-collapse-item title="其他费用信息" name="3">
        <BaseTable
          ref="otherCostTableRef"
          :autoResize="true"
          :tableColumns="otherCostTableColumns"
          :tableData="otherDetailList"
        />
      </el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="drawer">
import BaseTable from '@/components/BaseTable/index.vue'
import {computed, getCurrentInstance, ref} from 'vue'
import EditTable from '@/components/EditTable/index.vue'
import Select from '@/components/Select/index.vue'
import math from '@/utils/math.js'
import api from '@/api/business/businessSettlement/index.js'
import Upload from '@/components/upload'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const fileIds=ref([]) // 文件列表
const settlementList = ref([]) //结算方式下拉框
const collapseOpen = ['1', '2','3'] // 打开的面板
const ruleForm = ref()
const contractList = ref([])
const isLJLS = ref(false)
const otherCostTableColumns = ref([
  {
    label: '费目',
    prop: 'rateName',
  },
  {
    label: '作业过程',
    prop: 'processName',
  },
  {
    label: '单价',
    prop: 'rate',
  },
  {
    label: '数量',
    prop: 'billQuantity',
    alien: 'right',
  },
  {
    label: '计量单位',
    prop: 'unitName',
    alien: 'left',
  },
  {
    label: '税率（%）',
    prop: 'taxRate',
  },
  {
    label: '税额',
    prop: 'taxAmount',
    fixed: 'right',
    isThousandth: true,
  },
  {
    label: '金额',
    prop: 'amountMoney',
    fixed: 'right',
    isThousandth: true,
  },
])
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
  settlementFlag: '',
  settlementBasisName:'',
  settlementBasisCode:'',
  inTime: '',
  date: '',
  nextPortName:'',
  prePortName:'',
})
const accNumber = computed(() => {
  return contractList.value.find(v1 => v1.id === formData.value.contractId)?.item?.accNumber
})
const rules = ref({
	contractId: [{ required: true, message: '合同必须选择' }],
})
const validate = async () => {
	let flag = await EditTableRef.value.validAllEvent()
	if (!flag) {
		return flag
	}
	await ruleForm.value.validate((valid, fields) => {
		if (!valid) {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}
const fileList = ref([]) // 上传文件列表
const resetForm = async () => {
	ruleForm.value.resetFields()
  proxy.$bus.emit('resetFileList')
  fileList.value =[]
  fileIds: [], //附件
	formData.value.id = ''
	formData.value.contractId = ''
	formData.value.details = []
  formData.value.companyId= ''
  formData.value.companyName= ''
  formData.value.cargoOwnerName= ''
  formData.value.cargoAgentName= ''
  formData.value.cargoName= ''
  formData.value.shipNameVoyage= ''
  formData.value.tradeTypeLabel= ''
  formData.value.impExpLabel= ''
  formData.value.remark= ''
  formData.details= []
  formData.value.settlementFlag= ''
  formData.value.settlementBasisName=''
  formData.value.settlementBasisCode=''
  formData.value.prePortName=''
  formData.value.nextPortName=''
}

// 上传文件
const changeFile = files => {
  // console.log('删除附件', files)
  fileIds.value = files
}
const resetFileTmp = () =>{
  nextTick(()=>{
    proxy.$bus.emit('resetFileList')
  })
}
const otherDetailList = ref([])
const getOtherFee = (statemetId)=>{
  api.getOtherFee(statemetId).then(res=>{
    otherDetailList.value = res.data
  })
}

// 可编辑表格
const EditTableRef = ref('')
const tableColumns = ref([
	{
		prop: 'serviceContentName',
		label: '服务内容',
		minWidth: 200,
	},
	{
		prop: 'number',
		label: '结算量',
		minWidth: 200,
	},
	{
		prop: 'unitName',
		label: '计费单位',
		minWidth: 120,
	},
	{
		label: '费目',
		prop: 'rateItemName',
		width: 150,
	},
  {
    prop: 'tempRate',
    label: '费率',
    width: 150,
  },
  {
    label: '阶梯优惠',
    prop: 'preferentialRate',
    width: 150,
  },
	{
		prop: 'rate',
		label: '最终费率',
		width: 150,
	},
	{
		prop: 'amount',
		label: '金额',
		width: 150,
	},
	{
		prop: 'tax',
		label: '税率（%）',
		width: 150,
	},
	{
		prop: 'taxAmount',
		label: '税额',
		width: 150,
	},
])
// 合同选中回调事件
const contactChange = row => {
  // add on 23.10.31 by xielinqi 匹配阶梯费率
  if (row) {
    if (row.item) {
      const item = row.item
      if (item.isTieredRate === '1') {
        let accNumber = typeof item.accNumber === 'undefined' ? 0 : Number(item.accNumber)
        item.details.sort((a, b) => Number(a.beginTon) > Number(b.beginTon) ? 1 : -1)
        formData.value.details = formData.value.details.reduce((acc, cur) => {
          const beginIndex = item.details.findLastIndex(v1 => Number(v1.beginTon) * 10000 <= accNumber)
          const endIndex = item.details.findIndex(v1 => Number(v1.endTon) * 10000 >= accNumber + Number(cur.number))
          if (beginIndex > -1 && endIndex > -1 && beginIndex <= endIndex) {
            const details = item.details.filter((_, index) => index >= beginIndex && index <= endIndex)
            let tempNumber = 0
            for (let i = 0; i < details.length; i++) {
              let number
              if (i === details.length - 1) {
                number = cur.number - tempNumber
              } else {
                number = Number(details[i].endTon) * 10000 - accNumber - tempNumber
                tempNumber += number
              }
              number = number.toFixed(2)
              acc.push({
                ...cur,
                number,
                preferentialRate: Number(details[i].rate),
                isDerived: i === 0 ? '0' : '1',
                trateItemId: item.id,
              })
            }
          } else {
            acc.push({...cur, isDerived: '0'})
          }
          accNumber += Number(cur.number)
          return acc
        }, [])
      } else {
        formData.value.details.forEach(v1 => {
          v1.preferentialRate = item.preferentialRate
          v1.trateItemId = item.id
        })
      }
    }
  } else {
    formData.value.details = formData.value.details.reduce((acc, cur) => {
      const e = acc.find(v1 => v1.serviceContentId === cur.serviceContentId)
      if (e) {
        e.number = Number(e.number) + Number(cur.number)
      } else {
        acc.push({...cur, preferentialRate: undefined, isDerived: '0', trateItemId: undefined})
      }
      return acc
    }, [])
  }

	// 存储当前选中合同id
	const contractId = row ? row.id : ''
	// 遍历匹配数据
	formData.value.details.forEach(item => {
		item.taxAmount = ''
		item.tax = ''
		item.rate = ''
		item.amount = ''
		item.rateItemName = ''
		item.rateItemCode = ''
		item.unitCode = ''
		item.unitName = ''
		item.contractId = ''
		item.rateId = ''
    item.tempRate = ''
    if (row) {
      row.rates.forEach(items => {
        if (item.serviceContentId == items.serviceContentId) {
          item.unitCode = items.unitCode
          item.unitName = items.unitName
          item.rateItemName = items.rateItemName
          item.rateItemCode = items.rateItemCode
          item.contractId = contractId
          item.rateId = items.id
          item.rate = items.rate
          item.tempRate = items.rate
          if (item.preferentialRate) {
            item.rate = items.rate - item.preferentialRate
          }
          item.tax = 6
          // 计算金额 结算数量 * 费率 / 100
          item.amount = Math.round(math.numMulti(item.number, item.rate)*100)/100
          // 计算税额 (结算数量 / 1+费率) * 费率
          item.taxAmount = Math.round( (item.amount * (item.tax / 100) / (1 + item.tax / 100) )*100)/100
        }
      })
    }
	})
}
const init = data => {}
defineExpose({
	validate,
	formData,
	resetForm,
	init,
  contactChange,
  settlementList,
  contractList,
  getOtherFee,
  resetFileTmp,
  isLJLS,
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
