<template>
	<!-- 客户管理 -->
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:loading="false"
			:total="total"
			:showToolBar="true"
			:name="'customerTable'"
		/>
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="clientVisible" :title="title" size="70%">
			<Drawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="clientVisible = false">取 消</el-button>
					<el-button type="primary" v-if="submitShow" @click="save">保 存</el-button>
<!--					<el-button type="danger" v-if="rejectShow" @click="reject">驳 回</el-button>-->
				</div>
			</template>
		</el-drawer>
    <!-- 同步的详情抽屉组件 -->
    <el-drawer v-model="clientVisible2" :title="title" size="70%">
      <Drawer2 ref="drawerRef2" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="clientVisible2 = false">取 消</el-button>
          <!-- <el-button type="primary" v-if="submitShow" @click="save">保 存</el-button> -->
          <!-- <el-button type="danger" v-if="rejectShow" @click="reject">驳 回</el-button> -->
        </div>
      </template>
    </el-drawer>
		<!-- 驳回弹出框 -->
		<el-dialog title="驳回意见" v-model="rejectVisible" width="40%" append-to-body>
			<Dialog ref="dialogRef" />
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="rejectVisible = false">取 消</el-button>
					<el-button type="primary" @click="submitForm">确 定</el-button>
				</div>
			</template>
		</el-dialog>

    <el-dialog title="更改授信" v-model="isCreditVisible" width="40%" append-to-body>
      <Dialog1 ref="creditRef" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isCreditVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitFormCredit">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer v-model="customerDrawer" :title="customerDrawerTitle" size="70%" @close="clearCustomerDrawer">
      <BaseTable
        ref="baseTable2"
        :showSearchHeader="true"
        :selectData="selectData2"
        :searchClick="getData"
        :tableHeight="460"
        :checkbox-config="checkboxConfig"
        :tableColumns="customerTableColumns"
        @checkbox-change="checkboxChangeEvent"
        :tableData="getCustomerTableData"
        :selectAllChangeEvent="allChangeEvent"
        :loading="false"
        :total="total2"
      />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="customerDrawer = false">取 消</el-button>
          <el-button type="primary"  @click="synchronization">同 步</el-button>
        </div>
      </template>
    </el-drawer>
    <el-dialog title="更改结算类型" v-model="isAccountTypeVisible" width="40%" append-to-body>
      <Dialog2 ref="accountTypeRef" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isAccountTypeVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitFormAccountType">确 定</el-button>
        </div>
      </template>
    </el-dialog>

	</div>
</template>

<script setup name="customer">
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from './dialog/index'
import Dialog1 from './credit/index'
import Dialog2 from './accountType/index'
import api from '@/api/business/customer/index'
const clientVisible = ref(false) //新增修改抽屉
const clientVisible2 = ref(false) //新增修改抽屉
const customerDrawer = ref(false)
import { ref, reactive } from 'vue'
import Drawer from './drawer/index.vue'
import Drawer2 from './drawer2/index.vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()
const ids = ref([])
const total = ref(0)
const total2 = ref(0)
const title = ref('新增')
const drawerRef = ref(null)
const drawerRef2 = ref(null)
const dialogRef = ref(null)
const creditRef = ref(null)
const accountTypeRef = ref(null)
const submitShow = ref(true) //确定按钮
const rejectShow = ref(false) //驳回按钮
const message = ref('确定保存吗？')
const rejectVisible = ref(false) //弹出框组件显示隐藏
const isCreditVisible = ref(false) //弹出框组件显示隐藏
const isAccountTypeVisible = ref(false) //弹出框组件显示隐藏
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const queryParams2 = ref({
  startPage: 1,
  pageSize: 10,
})
// 复选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
// 复选数据
const checkboxList = ref([])
// 复选事件
const checkboxChangeEvent = data => {
  checkboxList.value = data
  if (checkboxList.value.length !== 0) {
    buttonList[0].disabled = false
    buttonList[1].disabled = false
  } else {
    buttonList[0].disabled = true
    buttonList[1].disabled = true
  }
}
const allChangeEvent = ({ checked }) => {
  checkboxList.value = []
  if (checked) {
    checkboxList.value = JSON.parse(JSON.stringify(getCustomerTableData.value))
  } else {
    checkboxList.value = []
  }
}
const updataId = ref(null)
// 表格数据
const tableData = ref([])
// 同步表格数据
const getCustomerTableData = ref([])
const customerTableColumns = ref([
  { label: '', type: 'checkbox', width: 40, fixed: 'left' },
  { label: '客户名称', prop: 'customerName', width: 230 },
  { label: '客户简称', prop: 'customerShortName', width: 160 },
  { label: '客户类型', prop: 'customerTypeLabel', width: 100 },
  { label: '客户属性', prop: 'customerPropertyNames' ,width: 160},
  { label: '联系人名称', prop: 'contact', width: 160 },
  { label: '联系人电话', prop: 'contactNumber', align: 'center', width: 'phoneNumber' },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    fixed: 'right',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type:
              row.status == '10'
                ? 'success'
                : row.status == '1'
                  ? ''
                  : row.status == '9'
                    ? 'danger '
                    : row.status == '0'
                      ? 'info'
                      : '',
          },
          {
            default: () =>
              row.status == '10'
                ? '已审核'
                : row.status == '1'
                  ? '待审核'
                  : row.status == '9'
                    ? '驳回 '
                    : row.status== '0'
                      ? '停用'
                      : '',
          }
        ),
      ]
    },
  },
  {
    prop: '',
    label: '操作',
    width: 'operate',
    align: 'center',
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              detail(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'business:customer:update', // 权限
          },
          {
            default: () => '查看',
          }
        ),

      ]
    },
  },
])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '客户名称', prop: 'customerName', width: 200 },
	{ label: '客户简称', prop: 'customerShortName', width: 160 },
	{ label: '客户类型', prop: 'customerTypeLabel', width: 160 },
  {
    label: '是否授信',
    prop: 'isCredit',
    align: 'center',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isCredit == '1' ? 'primary' : 'danger',
          },
          {
            default: () => (row.isCredit == '1' ? '已授信' : '未授信 '),
          }
        ),
      ]
    },
  },
  {
    label: '结算类型',
    prop: 'accountType',
    align: 'center',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.accountType == '1' ? '' : '',
          },
          {
            default: () => (row.accountType == '1' ? '月结' : '票结'),
          }
        ),
      ]
    },
  },
	{ label: '客户属性', prop: 'customerPropertyNames' },
	{ label: '联系人名称', prop: 'contact', width: 160 },
	{ label: '联系人电话', prop: 'contactNumber', align: 'center', width: 'phoneNumber' },
	{
		label: '状态',
		prop: 'statusLabel',
		align: 'center',
		width: 100,
		render: row => {
			// console.log(row, 'rowww')
			return [
				h(
					ElTag,
					{
						type:
							row.statusLabel == '已审核'
								? 'success'
								: row.statusLabel == '待审核'
								? ''
								: row.statusLabel == '驳回'
								? 'danger '
								: row.statusLabel == '停用'
								? 'info'
								: '',
					},
					{
						default: () =>
							row.statusLabel == '已审核'
								? '已审核'
								: row.statusLabel == '待审核'
								? '待审核'
								: row.statusLabel == '驳回'
								? '驳回 '
								: row.statusLabel == '停用'
								? '停用'
								: '',
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 'operate',
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'business:customer:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'business:customer:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const selectData = reactive([
	{
		name: '客户名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'customerName', // 绑定字段
		span: 8, // 占位，共24
	},
	{
		name: '客户类型',
		type: 'select',
		modelValue: 'customerTypeCode',
		span: 8,
		selectData: [
			{ label: '国内企业', value: '1' },
			{ label: '国外企业', value: '2' },
			{ label: '个人', value: '3' },
		],
	},
	{
		name: '审核状态',
		type: 'select',
		modelValue: 'status',
		span: 8,
		selectData: [
			{ label: '审核通过', value: '10' },
			{ label: '待审核', value: '1' },
			{ label: '驳回', value: '9' },
			{ label: '停用', value: '0' },
		],
	},
	{
		name: '客户属性',
		type: 'select',
		modelValue: 'customerPropertyCode',
		span: 2,
		dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			url: '/api/internal/public/getDictListByType/CUSTOMER_PROPERTY',
			method: 'get',
		},
	},
])
const selectData2 = reactive([
  {
    name: '客户名称', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'customerName', // 绑定字段
    span: 12, // 占位，共24
  },
  {
    name: '审核状态',
    type: 'select',
    modelValue: 'status',
    span: 12,
    selectData: [
      { label: '已审核', value: '10' },
      { label: '待审核', value: '1' },
      { label: '驳回', value: '9' },
      { label: '停用', value: '0' },
    ],
  },
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'business:customer:add', // 权限
	},
  {
    label: '审核', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'View', // 按钮图标，支持element-Plus中所有图标
    click: () => changeC, // 回调函数
    permission:'business:customer:audit' // 权限
  },
  {
    label: '更改授信', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Edit', // 按钮图标，支持element-Plus中所有图标
    click: () => changeCredit, // 回调函数
    permission:'business:customer:doCredit' // 权限
  },
  {
    label: '更改结算类型', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Edit', // 按钮图标，支持element-Plus中所有图标
    click: () => changeAccountType, // 回调函数
    permission:'business:customer:doAccountType' // 权限
  },
])
const clickRow = ref({})
const cellClickEvent = ({ row }) => {
  clickRow.value = row
  if (row.statusLabel == '已审核') {
    buttonList[1].disabled = false
    buttonList[1].label = "销审"
  }
  if(row.statusLabel == '待审核'){
    buttonList[1].disabled = false
    buttonList[1].label = '审核'
  }
  if(row.statusLabel == '停用'){
    buttonList[1].disabled = true
  }
}
const changeC = ()=>{
  if(clickRow.value.statusLabel == '已审核'){
    revokeMiscBilling()
    // proxy.$message.warning('已经审核无需再次审核！')
  }else {
    proxy.$modal
      .confirm('是否审核？')
      .then(() => {
        api.publishMisc(clickRow.value.id).then(res => {
          proxy.$modal.msgSuccess("审核成功")
          getList(queryParams.value);
        })
      })
      .catch(() => {
      })
  }
}
const changeCredit = ()=>{
  isCreditVisible.value = true
  title.value = '更改授信'
  nextTick(() => {
    creditRef.value.resetForm() // 清空事件
    creditRef.value.formData.id = clickRow.value.id
    creditRef.value.formData.isCredit = clickRow.value.isCredit
  })
}
const changeAccountType = ()=>{
  isAccountTypeVisible.value = true
  title.value = '更改结算类型'
  nextTick(() => {
    accountTypeRef.value.resetForm() // 清空事件
    accountTypeRef.value.formData.id = clickRow.value.id
    accountTypeRef.value.formData.accountType = clickRow.value.accountType
  })
}
const revokeMiscBilling = ()=>{
  if(clickRow.value.status=='1'){
    proxy.$modal.msgWarning("该客户管理已销审")
    return;
  }
  proxy.$modal
    .confirm('确认撤销审核吗？')
    .then(() => {
      api.revokeMisc(clickRow.value.id ).then(res => {
        proxy.$modal.msgSuccess("撤销审核成功")
        getList(queryParams.value);
      })
    })
    .catch(() => {})
}

// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		// console.log('列表', res)
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
/** 添加客户 */
const add = () => {
	clientVisible.value = true
	title.value = '新增'
	rejectShow.value = false
	submitShow.value = true
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
    drawerRef.value.formData.status = 1
    drawerRef.value.tableData = []
		console.log('清空没', drawerRef.value.formData)
		// drawerRef.value.formData.id = '' // 清空id
		// console.log('数据回显id是什么', drawerRef.value.formData.id)
		// drawerRef.value.formData.fileTypeName = [] // 清空客户属性
		// drawerRef.value.formData.customerTypeCode = '' // 清空客户类型
		// console.log('add')
	})
}
// 点击驳回
const reject = () => {
	rejectVisible.value = true
}
/** 确定驳回 */
const submitForm = async () => {
	if (await dialogRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(drawerRef.value.formData)) // 取到子组件的form
		proxy.$modal.confirm('确定驳回？').then(() => {
			console.log('点击保存', params)
			let data = {
				id: drawerRef.value.formData.id,
				idea: dialogRef.value.formData.rejectIdea,
			}
			api.reject(data).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				clientVisible.value = false
				rejectVisible.value = false
				getList(queryParams.value)
			})
		})
	}
}
//确定是否授信
const submitFormCredit = async () => {
	if (await creditRef.value.validate()) {
/*		const params = JSON.parse(JSON.stringify(creditRef.value.formData)) // 取到子组件的form
    console.log("params",params)*/
		proxy.$modal.confirm('确定保存？').then(() => {
			let data = {
				id: creditRef.value.formData.id,
        isCredit: creditRef.value.formData.isCredit,
			}
      console.log("data",data)
			api.doCredit(data).then(res => {
				proxy.$modal.msgSuccess(res.msg)
        isCreditVisible.value = false
				getList(queryParams.value)
			})
		})
	}
}
const submitFormAccountType = async () => {
  if (await accountTypeRef.value.validate()) {
    proxy.$modal.confirm('确定保存？').then(() => {
      let data = {
        id: accountTypeRef.value.formData.id,
        accountType: accountTypeRef.value.formData.accountType,
      }
      console.log("data",data)
      api.doAccountType(data).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        isAccountTypeVisible.value = false
        getList(queryParams.value)
      })
    })
  }
}
// 保存
const save = async () => {
	if ( await drawerRef.value.validate()) {
		let status = drawerRef.value.formData.status
		// console.log('状态', status)
		if (status == '0') {
			message.value = '确定停用吗？'
		} else if (status == '10') {
			message.value = '确定审批通过吗？'
		} else {
			message.value = '确定保存吗？'
		}
		// console.log('保存', drawerRef.value.form)
		// const params = JSON.parse(JSON.stringify(drawerRef.value.formData)) // 取到子组件的formData
    const params = {
      ...drawerRef.value.formData,
      contactList: JSON.parse(JSON.stringify(drawerRef.value.tableData)),
    }
		proxy.$modal.confirm(`${message.value}`).then(() => {
			console.log('点击保存', params)
			if (params.id) {
				api.update(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					clientVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insert(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					clientVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
// 同步数据
const synchronization = () => {
  proxy.$modal.confirm("确定同步选中数据吗?").then(()=>{
    api.syncData(checkboxList.value).then(res=>{
      if (res.code ==='0000'){
        customerDrawer.value = false
        proxy.$modal.msgSuccess(res.msg)
        getList(queryParams.value)
      }else {
        proxy.$modal.msgError(res.msg)
      }
    })
  } )
}
/** 编辑 */
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '编辑'
	clientVisible.value = true
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		api.getDataById(editRow.id).then(res => {
			// console.log('客户管理修改数据', res)
			// console.log(6666, drawerRef.value)
			proxy.setFormData(drawerRef.value.formData, res.data)
			// console.log('赋值没', drawerRef.value.formData)
			let status = res.data.status
			if (status == '1') {
				rejectShow.value = true
				submitShow.value = true
			}
			if (status == '10') {
				submitShow.value = false
				rejectShow.value = false
			}
			drawerRef.value.formData.customerProperty = res.data.propertyList.map(item => item.customerPropertyName)
			drawerRef.value.tableData = res.data.contactList
		})
	})
}
/**
 * 同步页面查看详情
 * @param row
 */
const detail = row => {
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  clientVisible2.value = true
  nextTick(() => {
    drawerRef2.value.resetForm() // 清空事件
    proxy.setFormData(drawerRef2.value.formData, editRow)
    drawerRef2.value.formData.customerProperty = editRow.propertyList.map(item => item.customerPropertyName)
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
	// console.log('删除', row)
	const idList = row.id || ids.value
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.delete(idList)
		})
		.then(() => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}

/** 初始化数据 */
getList(queryParams.value)
</script>
<style lang="less" scoped>
// @import "../../../assets/styles/searchform.scss";
</style>
