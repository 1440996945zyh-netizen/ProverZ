<!-- 商务指令 -->
<template>
	<div class='app-container'>
		<BaseTable
			:showSearchHeader='true'
			:selectData='selectData'
			:searchClick='getList'
			:buttonList='buttonList'
			:tableColumns='tableColumns'
			:tableData='tableData'
			:total='total'
		/>
		<!--新增抽屉组件 -->
		<el-drawer v-model='addReceiptDrawer' title='新增贷方票据信息' size='80%'>
			<addReceipt ref='addReceiptRef'  />
			<template #footer>
				<div style='flex: auto'>
					<el-button @click='addReceiptDrawer = false'>取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
		<!--查看抽屉组件 -->
		<el-drawer v-model='trustOrderDrawer' title='查看付款收据信息' size='70%'>
			<editTrustOrder ref='trustOrderRef' />
			<template #footer>
				<div style='flex: auto'>
					<el-button @click='trustOrderDrawer = false'>取消</el-button>
				</div>
			</template>
		</el-drawer>
	</div>

  <el-dialog
    v-model="dialogVisible"
    title="作废原因"
    width="30%"
  >
    <el-form :model="formDataDo" ref="ruleForm" label-width="80px" :rules="rules">
      <el-form-item label="作废原因" prop="voidReason">
        <el-input  maxlength="200"
                   show-word-limit
                   type="textarea"
                   rows="5"
                   v-model="formDataDo.voidReason"  placeholder="请输入作废原因" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="voidClose">关闭</el-button>
        <el-button type="primary" @click="handelDel"> 处理 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup name='creditNote'>
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted } from 'vue'
import editTrustOrder from './editTrustOrder/index.vue'
import addReceipt from './addReceipt/index.vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/finance/CNDNapi/index'

const { proxy } = getCurrentInstance()

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
    cndnType: 1,
})
//查看付款收据
const trustOrderRef = ref(null)
//添加付款收据
const addReceiptRef = ref(null)
//控制查看抽屉
const trustOrderDrawer = ref(false)
//控制作废弹窗
const dialogVisible = ref(false)
//控制添加抽屉
const addReceiptDrawer = ref(false)
const title = ref('新增贷方票据信息')
//顶部 搜索表单
const selectData = reactive([
	{
		name: '公司名称',
		type: 'select',
		modelValue: 'companyId',
		span: 8,
		dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } }
	},
	{
		name: '系统票据编号',
		type: 'input', // 搜索框类型
		modelValue: 'cndnCode', // 绑定字段
		span: 8 // 占位，共24

	},
	{
		name: '票据号码', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'invoiceCode', // 绑定字段
		span: 8 // 占位，共24
	},
	{
		name: '付款人', // 搜索框name
		type: 'remoteSelect', //远程下拉框
		modelValue: 'customerId', //对应字段
		span: 3,
		dataType: 'CUSTOMER_CARGO_OWNER'
	},
	{
		name: '开票日期', // 搜索框name
		type: 'date', // 搜索框类型
		modelValue: 'cndnTime', // 绑定字段
		span: 3 // 占位，共24
	},
])
//数据总条数
const total = ref(0)
//顶部 右侧按钮
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'finance:creditNote:add' // 权限
	}
])
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '系统票据编号', prop: 'cndnCode' },
  { label: '票据号码', prop: 'invoiceCode' },
	{ label: '付款人名称', prop: 'customerName',width:220,align: "center"},
  { label: '开具日期', prop: 'cndnTime' },
	{ label: '总额', prop: 'eliminateAmount',isThousandth: 'true',align:'right'},
	{ label: '创建人', prop: 'createByName' },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    fixed:'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '1' ? 'success' : 'info'
          },
          {
            default: () => (row.status == '1' ? '正常' : '作废')
          }
        )
      ]
    }
  },
	{
		prop: '',
		label: '操作',
		width: 200,
		align: 'center',
    fixed:'right',
    render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							check(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'finance:creditNote:check' // 权限
					},
					{
						default: () => '查看'
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handle(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'finance:creditNote:handle' // 权限
					},
					{
						default: () => '作废'
					}
				)
			]
		}
	}
])
//查询
const getList = e => {
	queryParams.value = e
  e.cndnType = 1
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

//新增
const add = () => {
	addReceiptDrawer.value = true
	nextTick(() => {
    addReceiptRef.value.resetForm()
    addReceiptRef.value.addinfoShowFlag=false//为了清空baseTable在点击添加之后的显示问题
    addReceiptRef.value.infoShowFlag=false//为了清空baseTable在点击添加之后的显示问题
    addReceiptRef.value.selAmount=false
	})
}
//提交付款收据信息
const save = async () => {
  if (await addReceiptRef.value.validate()) {
    proxy.$modal.confirm('确定保存？').then(() => {
      const params = addReceiptRef.value.addReceiptForm
      if(JSON.parse(JSON.stringify(addReceiptRef.value.tableData)).length>0){
        params.detailList = JSON.parse(JSON.stringify(addReceiptRef.value.tableData))
      }
      api.CNadd(params).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('新增成功')
          addReceiptDrawer.value = false
          getList(queryParams.value)
        }
      })
    })
  }
}

const handle = row => {
	console.log(row)
	if (row.status == 2) {
		proxy.$message.error('已作废！！')
		return
	}
  formDataDo.id=row.id
  dialogVisible.value = true

}
const voidClose = () => {
  dialogVisible.value = false
  formDataDo.voidReason=''
}
const formDataDo = reactive({
  id:'',
  voidReason:'',//作废说明
  status:'',
})
const rules = reactive({
  voidReason: [{ required: true, message: '请输入作废原因', trigger: 'blur' }],
})
const ruleForm = ref()
const handelDel =async  () => {
  if (await ruleForm.value.validate()) {
    //进行保存
    nextTick(() => {
      api.voidNote(formDataDo)
        .then(res => {
          nextTick(() => {
            dialogVisible.value =false
            getList(queryParams.value)
            proxy.$modal.msgSuccess(res.msg)
            formDataDo.voidReason=''
          })
        })
        .catch(err => {
        })
    })
  }
}

const check = row => {
	trustOrderDrawer.value = true
	nextTick(() => {
		trustOrderRef.value.resetForm()
		api.getDetail(row.id).then(res => {
			if (res.code === '0000') {
				trustOrderRef.value.trustOrderForm = res.data
				trustOrderRef.value.detailList = res.data.detailList
       }
		})
	})

}

getList(queryParams.value)

/*//设置监听器，当表单数据变化的时候，对数组进行增加操作
watch(()=> addReceiptDrawer.value,(newValue,oldValue)=>{
  if(addReceiptDrawer.value==false){
    getList(queryParams.value)
  }
})*/
</script>

<style scoped></style>
