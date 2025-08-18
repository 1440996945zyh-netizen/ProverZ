<!-- 作业指令新增编辑表单 -->
<template>
	<el-form :model='trustOrderForm' ref='ruleForm' label-width='120px' :rules='rules'  >
		<el-collapse v-model='activeNames'>
			<el-collapse-item title='基本信息' name='order'>
				<el-row>
					<el-col :span='8'>
						<el-form-item label='系统发票'>
							<el-input v-model='trustOrderForm.sysInvoiceCode' readonly disabled />
						</el-form-item>
					</el-col>
					<el-col :span='8'>
						<el-form-item label='作业公司' prop='companyId'>
							<Select  :disabled = "editOrAdd2"
								:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
								v-model:value='trustOrderForm.companyId'
								v-model:label='trustOrderForm.companyName'
								placeholder='作业公司'
							/>
						</el-form-item>
					</el-col>
          <el-col :span='8'>
            <el-form-item label='发票类型' prop='invoiceTypeCode'>
              <Select :disabled = "editOrAdd2"
                      :selectData="[
										{ label: '货物发票', value: '10' },
									  { label: '船舶发票', value: '30' },
									  { label: '杂项发票', value: '40' },
									  { label: '堆存费', value: '50' },
								]"
                      v-model:value='trustOrderForm.invoiceTypeCode'
                      v-model:label='trustOrderForm.invoiceTypeName'
                      @change="invoiceTypeCodeChange"
              />
            </el-form-item>
          </el-col>
				</el-row>
				<el-row>
					<el-col :span='8'>
						<el-form-item label='税务服务发票' prop='taxationInvoiceCode'>
							<Select :disabled = "editOrAdd2"
								:dataConfig="{ params: { type: 'DICT', dictType: 'TAX_INVOICE' } }"
								v-model:value='trustOrderForm.taxationInvoiceCode'
								v-model:label='trustOrderForm.taxationInvoice'
								placeholder='请选择税务服务发票' />
						</el-form-item>
					</el-col>
          <el-col :span='8'>
            <el-form-item label='付款人' prop='customerId'>
              <div style='width: 100%'>
                <RemoteSelect :disabled = "editOrAdd2"
                  type='CUSTOMER_ALL'
                  v-model:value='trustOrderForm.customerId'
                  v-model:label='trustOrderForm.customerName'
                  @change='customerChange'
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span='8'>
            <el-form-item label='发票抬头' prop='invoice'  >
              <el-input v-model='trustOrderForm.invoice' :disabled = "editOrAdd2" placeholder='请输入发票抬头' />
            </el-form-item>
          </el-col>
					<el-col :span='8'>
						<el-form-item label='税务发票编号' prop='invoiceCode' >
							<el-input v-model='trustOrderForm.invoiceCode' placeholder='请输入税务发票编号' />
						</el-form-item>
					</el-col>
					<el-col :span='8'>
						<el-form-item label='开票日期' prop='invoiceTime'>
							<el-date-picker
                disabled
								v-model='trustOrderForm.invoiceTime'
								type='date'
								:default-value='trustOrderForm.invoiceTime'
								placeholder='选择日期'>
							</el-date-picker>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span='8'>
						<el-form-item label='备注' prop='remark'>
							<el-input :disabled = "editOrAdd2"
								v-model='trustOrderForm.remark'
								:autosize='{ minRows: 2, maxRows: 4 }'
								type='textarea'
								maxlength='500'
								show-word-limit
								placeholder='请输入备注'
							/>
						</el-form-item>
					</el-col>
				</el-row>
        <el-col :span='8'>
						<el-form-item label='上传凭证'>
							<upload :disabled = "editOrAdd2"
								:fileTypeName='fileTypeName'
								businessType='INVOICE_PROOF'
								:businessId='trustOrderForm.id'
								@changeFile='changeFile'
							/>

						</el-form-item>
        </el-col>
			</el-collapse-item>

			<el-collapse-item name='cargo' >
				<template v-slot:title>
					<div style='display: flex; justify-content: space-between; width: 95%'>
						<div>结算单信息</div>
						<div>
							<el-button v-if='editOrAdd1' type='primary' @click.stop='chooseStatement'>添加</el-button>
						</div>
					</div>
				</template>
				<EditTable
					ref='editTable'
					:tableHeight='300'
					:tableColumns='tableColumns'
					:tableData='trustOrderForm.statementList'
          :cellClickEvent="cellClickEvent"
					:editRules='editRules'
          :disabledKey="'dis'"
          @blur='inputChange'
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>

	<!--结算单详情信息组件 -->
	<el-drawer v-model='statementDetailShow' title='结算单详情信息' size='60%'>
		<tickTable ref='statementDetailRef'></tickTable>
		<template #footer>
			<div style='flex: auto'>
				<el-button @click='statementDetailShow = false'>取消</el-button>
				<el-button type='primary' @click='addStatementDetail'>保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name='editTrustOrder'>
import EditTable from '@/components/EditTable/index.vue'
import tickTable from './tickTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import { ElButton, ElTag } from 'element-plus'
import publicApi from '@/api/public/index'
import api from '@/api/finance/invoice/index'
import Upload from '@/components/upload/index.vue'
import math from "../../../../utils/math";

const fileTypeName = ref('.pdf, .png, .jpeg')

const ruleForm = ref(null)


const editOrAdd1 =ref(false) // 是否显示添加按钮

//查询点击事件
const clickRow = ref({})

const cellClickEvent = ({ row }) => {
  clickRow.value = row
}

const containCargo = ref(true)
//新增票货
const addTicket = ref(true)
//结算依据 字典值
const SETTLEMENT_BASIS = ref(null)
const editRules = ref({
	tax: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2
		}
	}),
	numberCount: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 4
		}
	})
})
const changeFile = file => {
	trustOrderForm.fileIds = file
}

const editTable = ref(null)
const nowDate = reactive(null)
const  editOrAdd2 = ref(false) //更新编辑按钮
//发票详情数据
const trustOrderForm = reactive({
	id: '',
  status:'',
	sysInvoiceCode: '',//系统发票编号（发票编号）
	invoiceCode: '', //税务发票编号
	companyName: '', //作业公司
	companyId: '', //作业公司id
	customerId: '',//付款人(客户名称code
	customerName: '',//付款人name(客户名称name
	invoiceTypeCode: '', //发票类型code
	invoiceTypeName: '', //发票类型name
	taxationInvoice: '', //税务服务发票（字典TAX_INVOICE
	taxationInvoiceCode: '', //税务服务发票编号
	invoiceTime: '', //开票日期
  invoice:'', //发票抬头
	remark: '', //备注
	fileIds: [],//上传
	statementList: [],//结算单明细信息
  symbol:'', //标志位 控制查看
})
//表单验证
const rules = reactive({
	companyId: [{ required: true, message: '作业公司不能为空', trigger: 'blur' }],
  customerId: [{ required: true, message: '付款人不能为空', trigger: 'blur' }],
  invoiceTypeCode: [{ required: true, message: '发票类型不能为空', trigger: 'blur' }],
  // invoiceCode: [{ required: true, message: '发票类型不能为空', trigger: 'blur' }],
  taxationInvoiceCode: [{ required: true, message: '税务服务发票类型不能为空', trigger: 'blur' }],
  invoiceTime: [{ required: true, message: '开票日期不能为空', trigger: 'blur' }],
  taxationInvoice: [{ required: true, message: '作业依据不能为空', trigger: 'blur' }],
  invoice: [{ required: true, message: '发票抬头不能为空', trigger: 'blur' }]
})
//折叠面板
const activeNames = ref(['order', 'ship', 'cargo'])

const rowDisabled = ref(true)
const tableColumns = reactive([
	{
		prop: 'statementNo',
		label: '结算单编号',
		width: 150,
	},
	{
		prop: 'type',
		label: '费用类型',
		width: 150,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.type == '10' ? 'info' : 'info',
          },
          {
            default: () => (row.type == '10' ? '货方结算单' : row.type == '20' ? '陆集陆疏' : row.type == '30' ? '船方计费' : row.type == '40' ? '杂项计费' : row.type == '50' ? '堆存费' : ''),
          }
        ),
      ]
    },
	},
  {
    prop: 'scn',
    label: 'SCN',
    width: 150,
  },
  {
    prop: 'shipNameVoyage',
    label: '船名航次',
    width: 150,
  },
	{
		prop: 'rateItemName',
		label: '费目名称',
		width: 150,
	},
	{
		prop: 'numberCount',
		label: '数量1',
		width: 150,
		editRender: {},
		editType: 'input',
    align:'right'
	},
	{
		prop: 'numberCount2',
		label: '数量2',
		width: 150,
    align:'right'
	},
	{
		prop: 'pieceAmount',
		label: '单价',
		width: 150,
	},
  {
    prop: 'amount',
    label: '金额',
    width: 150,
    editRender: {},
    editType: 'input',
    disabled: rowDisabled
  },
	{
		prop: 'tax',
		label: '税率',
		width: 150,
		editRender: {},
		editType: 'input'
	},
	{
		prop: 'taxAmount',
		label: '税额',
		width: 150,
	},
	{
		label: '操作',
		width: 120,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							deleteCargoInfo(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
            disabled : (row.flag=='1')
					},
					{
						default: () => "删除"
					}
				)
			]
		}
	}
])

const invoiceTypeCodeChange = ()=>{
  console.log("invoiceTypeCodeChange")

  //删除表格中的数据
  trustOrderForm.statementList = []
}


// 列表删除按钮回调
const deleteCargoInfo = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			trustOrderForm.statementList.splice(row.index, 1)
      //备注
      let remark = ''
      if(trustOrderForm.invoiceTypeCode == '30'||trustOrderForm.invoiceTypeCode == '40'){
        trustOrderForm.statementList.forEach(item=>{
          if(!remark.includes(item.shipNameVoyage)&& item.shipNameVoyage!='_'){
            remark += item.shipNameVoyage +' ; '
          }
        })
      }else{
        trustOrderForm.statementList.forEach(item=>{
          remark += item.shipNameVoyage + ' '+ item.cargoName+': '+item.numberCount + '*' + item.pieceAmount +' ; '
        })
      }
      trustOrderForm.remark = remark;
		})
		.catch(err => {
		})
}
//金额输入框改变 计算金额事件
const inputChange = (e, row, labe) =>{
      if(labe=='金额'){
      return;
    }

  if(isNaN(row.numberCount)){
		proxy.$message.warning('金额需为数字！')
      row.numberCount=''
    }else if(isNaN(row.tax)){
      proxy.$message.warning('税率需为数字！')
      row.tax=''
    }else {
      row.numberCount = Number.parseFloat(row.numberCount).toFixed(4)
      api.calculateAmount(row).then(res => {
        trustOrderForm.statementList.forEach(item=>{
          if(item.id == row.id){
            item.amount = res.data.amount
            item.taxAmount = res.data.taxAmount
          }
        })
        //备注
        let remark = ''
        if(trustOrderForm.invoiceTypeCode == '30'||trustOrderForm.invoiceTypeCode == '40'){
          trustOrderForm.statementList.forEach(item=>{
          if(!remark.includes(item.shipNameVoyage)&& item.shipNameVoyage!='_'){
            remark += item.shipNameVoyage +' ; '
          }
          })
        }else{
          trustOrderForm.statementList.forEach(item=>{
            remark += item.shipNameVoyage + ' '+ item.cargoName+': '+item.numberCount + '*' + item.pieceAmount +' ; '
          })
        }
        trustOrderForm.remark = remark;
        //清空备注
        remark = ''
      }).catch(e=>{
       proxy.$message.error(e.value)
       row.numberCount=''
      })
    }
}
//初始化事件
const initData = () => {
  trustOrderForm.invoiceTime = new Date()

  // proxy.setFormData(trustOrderForm.invoiceTime,new Date()) // 第一个参数为给谁赋值，第二个参数为赋什么值
	// 获取字典数据 合同类型：CONTRACT_TYPE 结算依据：SETTLEMENT_BASIS   预缴依据：DEPOSIT_BASIS  付费方式：PAY_TYPE,账期类型：PAYMENT_TYPE 计量单位：UNIT
	publicApi.getDictList({ types: 'SETTLEMENT_BASIS,PACKAGE_TYPE' }).then(res => {
		SETTLEMENT_BASIS.value = res.data.SETTLEMENT_BASIS
		// 给编辑table下拉框设置数据源
		proxy.setEditTableOptions(tableColumns, { packingCode: res.data.PACKAGE_TYPE })
	})

}


// 重置表单
const resetForm = () => {
	ruleForm.value.resetFields()
	addTicket.value = true
		trustOrderForm.id= ''
		trustOrderForm.status= ''
		trustOrderForm.sysInvoiceCode= ''//系统发票编号（发票编号）
		trustOrderForm.invoiceCode= '' //税务发票编号
		trustOrderForm.companyName= ''//作业公司
		trustOrderForm.companyId='' //作业公司id
		trustOrderForm.customerId= ''//付款人(客户名称code
		trustOrderForm.customerName= ''//付款人name(客户名称name
		trustOrderForm.invoiceTypeCode= '' //发票类型code
		trustOrderForm.invoiceTypeName= '' //发票类型name
		trustOrderForm.taxationInvoice= '' //税务服务发票（字典TAX_INVOICE
		trustOrderForm.taxationInvoiceCode= ''//税务服务发票类型
		trustOrderForm.invoiceTime= '' //开票日期
		trustOrderForm.remark= '' //备注
		trustOrderForm.fileIds= []//上传
		trustOrderForm.statementList= [] //结算单明细信息

}

// 校验
const validate = async () => {
	let flag = false
	let flag1 = true
	if (containCargo.value) {
		flag1 = await editTable.value.validAllEvent()
	}
	await ruleForm.value.validate((valid, fields) => {
    if(trustOrderForm.taxationInvoiceCode=='1') {
      console.log("trustOrderForm.value.statementList", trustOrderForm.statementList)
      sumAmount.value = 0
      trustOrderForm.statementList.forEach((item => {
        sumAmount.value = math.numAdd(Number(sumAmount.value),Number(item.amount));
        sumAmount.value =  math.numSub(Number(sumAmount.value), Number(item.taxAmount))
      }))

      if (sumAmount.value > 100000) {
        proxy.$message.warning('单张普票最大金额为10万元，超过10万元请开多张发票！')
        return
      }
    }
    if(trustOrderForm.taxationInvoiceCode=='2') {
      console.log("trustOrderForm.value.statementList", trustOrderForm.statementList)
      sumAmount.value = 0
      trustOrderForm.statementList.forEach((item => {
        sumAmount.value = math.numAdd(Number(sumAmount.value),Number(item.amount));
        sumAmount.value =  math.numSub(Number(sumAmount.value), Number(item.taxAmount))
      }))
      if (sumAmount.value > 1000000) {
        proxy.$message.warning('单张专票最大金额为100万元，超过100万元请开多张发票！')
        return
      }
    }
		if (valid && flag1) {
			flag = true
		} else if (!valid) {
			flag = false
			proxy.$message.warning('请完善表单信息！')
		} else {
			flag = false
		}
	})

	return flag
}

//选择票货信息
const statementDetailShow = ref(false)
const statementDetailRef = ref()
// 添加事件 获取结算单信息
const chooseStatement = () => {
	if (trustOrderForm.companyId && trustOrderForm.invoiceTypeCode ) {
		statementDetailShow.value = true

		nextTick(() => {
      statementDetailRef.value.resetForm();
			statementDetailRef.value.queryParams.companyId = trustOrderForm.companyId
			// statementDetailRef.value.queryParams.customerId = trustOrderForm.customerId
			statementDetailRef.value.queryParams.invoiceTypeCode = trustOrderForm.invoiceTypeCode
			statementDetailRef.value.getList(statementDetailRef.value.queryParams)
		})
	} else {
		proxy.$message.warning('请先选择作业公司和发票类型！')
		return
	}
}

const customerChange = row => {
  if(trustOrderForm.symbol == 1){
    return
  }
  api.getInvoice(row.value).then(res => {
    if (res.code === '0000') {
      trustOrderForm.invoice = res.data.invoice
    }
  })
}

const sumAmount = ref(0)
// 结算单详情信息 保存事件
const addStatementDetail = () => {
	// 处理选中数据
	const changeData = JSON.parse(JSON.stringify(statementDetailRef.value.checkData))
  if(changeData==null || changeData.length < 1){
    proxy.$message.warning('请选中至少一条数据进行保存！')
    return
  }
  let customerIds = changeData.map(item =>{return item.customerId});
  let tmpIds = []
  tmpIds = customerIds.filter((item,index,arr)=>{
    return arr.indexOf(item)===index;
  })
  if(tmpIds.length != 1){
    proxy.$message.warning('必须选择相同的付款人！')
    return
  }

  //判断是不是普票
    if(trustOrderForm.invoiceTypeCode =='10') {
      if(changeData.length > 1) {
        let flag2 = false
        for (let i = 0; i < changeData.length; i++) {
          changeData.forEach(o => {
            if (changeData[i].taxInvoiceCode != o.taxInvoiceCode) {
              flag2=true;
            }
          })
        }
        if (flag2) {
          proxy.$message.warning('发票数据不同无法返回发票')
        } else {
          trustOrderForm.taxationInvoiceCode = changeData[0].taxInvoiceCode
          trustOrderForm.taxationInvoice = changeData[0].taxInvoiceName
        }
      }else{
        trustOrderForm.remark = changeData[0].receiptRemark
        trustOrderForm.taxationInvoiceCode = changeData[0].taxInvoiceCode
        trustOrderForm.taxationInvoice = changeData[0].taxInvoiceName
      }
    }else{
      trustOrderForm.taxationInvoiceCode = changeData[0].taxInvoiceCode
      trustOrderForm.taxationInvoice = changeData[0].taxInvoiceName
    }
    //回显 付款人信息
    trustOrderForm.customerId = changeData[0].customerId
    trustOrderForm.customerName = changeData[0].customerName
    //回显 备注
    let remark= ''

    if(trustOrderForm.invoiceTypeCode == '30'){
      changeData.forEach(item=>{
        if(!remark.includes(item.shipNameVoyage)&& item.shipNameVoyage!='_'){
          remark += item.shipNameVoyage +' ; '
        }
      })
    }else if(trustOrderForm.invoiceTypeCode == '40'){
    if(changeData.length > 1) {
      let flag2 = false
      for (let i = 0; i < changeData.length; i++) {
        changeData.forEach(o => {
          if (changeData[i].taxInvoiceCode != o.taxInvoiceCode) {
            flag2=true;
          }
        })
      }
      if (flag2) {
        proxy.$message.warning('发票数据不同无法返回发票')
      } else {
        trustOrderForm.taxationInvoiceCode = changeData[0].taxInvoiceCode
        trustOrderForm.taxationInvoice = changeData[0].taxInvoiceName
      }
    }else{
      trustOrderForm.taxationInvoiceCode = changeData[0].taxInvoiceCode
      trustOrderForm.taxationInvoice = changeData[0].taxInvoiceName
    }
    changeData.forEach(item=>{
      if(!remark.includes(item.shipNameVoyage)&& item.shipNameVoyage!='_'){
        remark += item.shipNameVoyage +' ; '
      }
    })
    }else{
      changeData.forEach(item=>{
        remark += item.shipNameVoyage + ' '+ item.cargoName+': '+item.numberCount + '*' + item.pieceAmount +' ; '
      })
    }
  if(trustOrderForm.invoiceTypeCode =='40') {
    rowDisabled.value = false;
  }else {
    rowDisabled.value = true;
  }

    trustOrderForm.remark = remark;
    trustOrderForm.statementList = changeData
    statementDetailShow.value = false
}
//初始化下拉列表数据
initData()

defineExpose({
	validate,
	resetForm,
	// isSource,
	trustOrderForm,
  editOrAdd1,
  editOrAdd2,

})
</script>

<style lang='scss' scoped>
@import '@/assets/styles/formData.scss';
</style>
