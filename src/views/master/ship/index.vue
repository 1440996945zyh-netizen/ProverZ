<template>
	<div>
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
        :cellDBLClickEvent="cellDBLClickEvent"
				:total="total"
			/>
		</div>
		<el-drawer v-model="customerVisible" :title="title" size="80%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto" v-if="title == '审核' ? false : true">
					<el-button @click="customerVisible = false">取消</el-button>
					<el-button type="primary" @click="save" v-if="saveBtnShow">保存</el-button>
					<el-button v-hasPermi="['master:ship:reject']" v-if="showFlag" type="danger" @click="reject">驳回</el-button>
				</div>
			</template>
		</el-drawer>
<!--    船舶信息变更日志-->
		<el-drawer v-model="shipLogVisible" :title="title" size="60%">

			<detail3 ref="detail3Ref" />
<!--			<template #footer>-->
<!--				<div >-->
<!--					<el-button @click="shipLogVisible = false">关闭</el-button>-->
<!--				</div>-->
<!--			</template>-->
		</el-drawer>

		<el-dialog v-model="dialogVisible" title="驳回意见" width="30%" :before-close="handleClose">
			<el-form :label-position="labelPosition" ref="rejectRef" :model="rejectObj" :rules="rules">
				<el-form-item label="" prop="idea">
					<el-input v-model="rejectObj.idea" type="textarea" placeholder="请输入" />
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" @click="goReject">确定</el-button>
				</span>
			</template>
		</el-dialog>

<!--    <el-drawer v-model="customerVisible2" :title="title" size="80%">-->
<!--      <detail2 ref="detailRef" />-->
<!--      <template #footer>-->
<!--        <el-button @click="customerVisible2 = false">取消</el-button>-->
<!--      </template>-->
<!--    </el-drawer>-->

    <el-drawer v-model="customerVisible2" :title="title" size="80%">
      <detail2 ref="detailRef" />
      <template #footer>
        <el-button @click="customerVisible2 = false">取消</el-button>
      </template>
    </el-drawer>
    <!--  船舶资料同步  -->
    <el-drawer v-model="shipDataDrawer" :title="shipDataDrawerTitle" size="80%" @close="clearShipDataDrawer">
      <BaseTable
        ref="baseTable2"
        :showSearchHeader="true"
        :selectData="selectData2"
        :searchClick="getData"
        :tableHeight="460"
        :checkbox-config="checkboxConfig"
        :tableColumns="shipDataTableColumns"
        @checkbox-change="checkboxChangeEvent"
        :tableData="getShipDataTableData"
        :selectAllChangeEvent="allChangeEvent"
        :cellClickEvent="cellClickEvent"
        :loading="false"
        :total="total2"
      />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="shipDataDrawer = false">取 消</el-button>
          <el-button type="primary"  @click="synchronization">同 步</el-button>
        </div>
      </template>
    </el-drawer>
	</div>
</template>

<script setup name="ship">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import detail2 from './detail2/index.vue'
import detail3 from './detail3/index.vue'
import api from '@/api/master/ship/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import { ElTag } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const shipDataDrawer = ref(false)
const baseTable = ref() // table的ref
const baseTable2 = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const detail3Ref = ref(null) // 明细组件ref
const shipLogVisible = ref(false)
const total = ref('') // 数据总数
const title = ref('')
const total2 = ref(0)
const shipDataDrawerTitle = ref('同步船舶资料')
const customerVisible = ref(false)
const customerVisible2 = ref(false)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const queryParams2 = ref({
  startPage: 1,
  pageSize: 10,
})
const rules = reactive({
	idea: [{ required: true, message: '请输入驳回意见', trigger: 'blur' }],
})
// 表格数据
const checkboxList = ref([])
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
		prop: 'shipName',
		label: '中文船名',
		width: 100,
	},
	{
		prop: 'shipNameEn',
		label: '英文船名',
		width: 110,
	},
	{
		prop: 'shipKindLabel',
		label: '船舶类型',
		width: 100,
	},
	{
		prop: 'nationCode',
		label: '国籍',
		width: 100,
	},
	{
		prop: 'imo',
		label: 'IMO',
		width: 100,
	},
	{
		prop: 'mmsi',
		label: 'MMSI',
		width: 100,
	},
	{
		prop: 'callNo',
		label: '呼号',
		width: 100,
	},
	{
		prop: 'shipLength',
		label: '船长',
		width: 100,
		align: 'right',
	},
	{
		prop: 'shipHeight',
		label: '船高',
		width: 100,
		align: 'right',
	},
	{
		prop: 'shipWidth',
		label: '船宽',
		width: 100,
		align: 'right',
	},
	{
		prop: 'captainName',
		label: '船主',
		width: 100,
	},
	{
		prop: 'netWeight',
		label: '净吨',
		width: 100,
		align: 'right',
	},
	{
		prop: 'totalWeight',
		label: '总吨',
		width: 100,
		align: 'right',
	},
	{
		prop: 'dwt',
		width: 100,
		label: '载重吨',
		align: 'right',
	},
	{
		prop: 'selfWeight',
		label: '船舶自重',
		width: 100,
		align: 'right',
	},
	{
		prop: 'hatchNum',
		label: '舱口数',
		width: 100,
		align: 'right',
	},
	{
		prop: 'mouldedDepth',
		label: '型深',
		width: 100,
		align: 'right',
	},
	{
		prop: 'captainPhone',
		width: 'phoneNumber',
		label: '船长电话',
		align: 'center',
	},
	{
		prop: 'shipTypeLabel',
		label: '船型',
		width: 100,
	},
	{
		prop: 'nationLabel',
		label: '船籍代码',
		width: 100,
	},
	{
		prop: 'cabinLayerNum',
		label: '舱层数',
		width: 100,
		align: 'right',
	},
	{
		prop: 'cabinVolume',
		label: '仓容',
		width: 100,
	},
	{
		prop: 'hatchSize',
		label: '舱口尺寸',
		width: 100,
		align: 'right',
	},
	{
		prop: 'speed',
		label: '船速',
		width: 100,
		align: 'right',
	},
	{
		prop: 'maxSpeed',
		label: '最大船速',
		width: 100,
		align: 'right',
	},
	{
		prop: 'hangerNum',
		label: '吊机数量',
		width: 100,
		align: 'right',
	},
	{
		prop: 'headerCockpitDistance',
		label: '头驾距离',
		width: 100,
	},
	{
		prop: 'hangerLocation',
		label: '吊机位置',
		width: 100,
	},
	{
		prop: 'surplusWaterDepth',
		label: '富余水深',
		width: 100,
		align: 'right',
	},
	{
		prop: 'fullLoadWater',
		label: '满载吃水',
		width: 100,
		align: 'right',
	},
	{
		prop: 'emptyLoadWater',
		label: '空载吃水',
		width: 100,
		align: 'right',
	},
	{
		prop: 'waterVolume',
		label: '淡水容量',
		width: 100,
		align: 'right',
	},
	{
		prop: 'hangerLoad',
		label: '机舱位置',
		width: 100,
	},
	{
		prop: 'cabinType',
		label: '舱型',
		width: 100,
	},
	{
		prop: 'hatchCoverTypeLabel',
		label: '舱口盖类型',
		width: 120,
	},
	{
		prop: 'builtYm',
		label: '建造年月',
		width: 'date',
		align: 'center',
	},
	{
		label: '状态',
		prop: 'status',
		width: 'status',
		fixed: 'right',
		render: row => {
			let typeFlag = ''
			typeFlag = row.status == 10 ? 'success' : row.status == 9 ? 'danger' : row.status == 1 ? '' : 'info'
			let textFlag = ''
			textFlag = row.status == 10 ? '审批通过' : row.status == 9 ? '驳回' : row.status == 1 ? '待审核' : '停用'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => textFlag,
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width:  240,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row,1)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'master:ship:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'master:ship:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),h(
					ElButton,
					{
						onClick: () => {
              // console.log(row)
              getUpdateLog(row)
              // proxy.$message.warning("查看日志")
              // shipLogVisible.value = true;
						},
						type: 'success',
						link: true,
						icon: 'Document',
						permission: 'master:ship:shipLog', // 权限
					},
					{
						default: () => '变更日志',
					}
				),
			]
		},
	},
])

const getUpdateLog=(row)=>{
  shipLogVisible.value = true;
  nextTick(()=>{
    detail3Ref.value.shipId = row.id
    detail3Ref.value.getList(row.id);
    console.log(row.id)
  })
}
const selectData = reactive([
	{
		name: '中文船名', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'shipName', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '状态', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'status', // 绑定字段
		span: 12, // 占位，共24
		selectData: [
			{
				value: '0',
				label: '停用',
			},
			{
				value: '1',
				label: '待审核',
			},
			{
				value: '9',
				label: '驳回',
			},
			{
				value: '10',
				label: '审批通过',
			},
		],
	},
])
const selectData2 = reactive([
  {
    name: '船舶名称', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 12, // 占位，共24
  },
  {
    name: '状态',
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
const getShipDataTableData = ref([])
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
// 复选事件
const checkboxChangeEvent = data => {
  checkboxList.value = data
}
const shipDataTableColumns = ref([
  { label: '', type: 'checkbox', width: 50,align: 'center' },
  {
    prop: 'shipName',
    label: '中文船名',
    width: 100,
  },
  {
    prop: 'shipNameEn',
    label: '英文船名',
    width: 110,
  },
  {
    prop: 'shipKindLabel',
    label: '船舶类型',
    width: 100,
  },
  {
    prop: 'nationCode',
    label: '国籍',
    width: 100,
  },
  {
    prop: 'imo',
    label: 'IMO',
    width: 100,
  },
  {
    prop: 'mmsi',
    label: 'MMSI',
    width: 100,
  },
  {
    prop: 'callNo',
    label: '呼号',
    width: 100,
  },
  {
    prop: 'shipLength',
    label: '船长',
    width: 100,
    align: 'right',
  },
  {
    prop: 'shipHeight',
    label: '船高',
    width: 100,
    align: 'right',
  },
  {
    prop: 'shipWidth',
    label: '船宽',
    width: 100,
    align: 'right',
  },
  {
    prop: 'captainName',
    label: '船主',
    width: 100,
  },
  {
    prop: 'netWeight',
    label: '净吨',
    width: 100,
    align: 'right',
  },
  {
    prop: 'totalWeight',
    label: '总吨',
    width: 100,
    align: 'right',
  },
  {
    prop: 'dwt',
    width: 100,
    label: '载重吨',
    align: 'right',
  },
  {
    prop: 'selfWeight',
    label: '船舶自重',
    width: 100,
    align: 'right',
  },
  {
    prop: 'hatchNum',
    label: '舱口数',
    width: 100,
    align: 'right',
  },
  {
    prop: 'mouldedDepth',
    label: '型深',
    width: 100,
    align: 'right',
  },
  {
    prop: 'captainPhone',
    width: 'phoneNumber',
    label: '船长电话',
    align: 'center',
  },
  {
    prop: 'shipTypeLabel',
    label: '船型',
    width: 100,
  },
  {
    prop: 'nationLabel',
    label: '船籍代码',
    width: 100,
  },
  {
    prop: 'cabinLayerNum',
    label: '舱层数',
    width: 100,
    align: 'right',
  },
  {
    prop: 'cabinVolume',
    label: '仓容',
    width: 100,
  },
  {
    prop: 'hatchSize',
    label: '舱口尺寸',
    width: 100,
    align: 'right',
  },
  {
    prop: 'speed',
    label: '船速',
    width: 100,
    align: 'right',
  },
  {
    prop: 'maxSpeed',
    label: '最大船速',
    width: 100,
    align: 'right',
  },
  {
    prop: 'hangerNum',
    label: '吊机数量',
    width: 100,
    align: 'right',
  },
  {
    prop: 'headerCockpitDistance',
    label: '头驾距离',
    width: 100,
  },
  {
    prop: 'hangerLocation',
    label: '吊机位置',
    width: 100,
  },
  {
    prop: 'surplusWaterDepth',
    label: '富余水深',
    width: 100,
    align: 'right',
  },
  {
    prop: 'fullLoadWater',
    label: '满载吃水',
    width: 100,
    align: 'right',
  },
  {
    prop: 'emptyLoadWater',
    label: '空载吃水',
    width: 100,
    align: 'right',
  },
  {
    prop: 'waterVolume',
    label: '淡水容量',
    width: 100,
    align: 'right',
  },
  {
    prop: 'hangerLoad',
    label: '机舱位置',
    width: 100,
  },
  {
    prop: 'cabinType',
    label: '舱型',
    width: 100,
  },
  {
    prop: 'hatchCoverTypeLabel',
    label: '舱口盖类型',
    width: 120,
  },
  {
    prop: 'builtYm',
    label: '建造年月',
    width: 'date',
    align: 'center',
  },
  {
    label: '状态',
    prop: 'status',
    width: 'status',
    fixed: 'right',
    render: row => {
      let typeFlag = ''
      typeFlag = row.status == 10 ? 'success' : row.status == 9 ? 'danger' : row.status == 1 ? '' : 'info'
      let textFlag = ''
      textFlag = row.status == 10 ? '审批通过' : row.status == 9 ? '驳回' : row.status == 1 ? '待审核' : '停用'
      return [
        h(
          ElTag,
          {
            type: typeFlag,
          },
          {
            default: () => textFlag,
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
              edit(row,0)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'master:ship:update', // 权限
          },
          {
            default: () => '查看',
          }
        ),

      ]
    },
  },
])
const allChangeEvent = ({ checked }) => {
  checkboxList.value = []
  if (checked) {
    checkboxList.value = JSON.parse(JSON.stringify(getShipDataTableData.value))
  } else {
    checkboxList.value = []
  }
}
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:ship:add', // 权限
	},
	{
		label: '审核', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'View', // 按钮图标，支持element-Plus中所有图标
		click: () => changeC, // 回调函数
		permission: 'master:ship:audit', // 权限
	},
  {
    label: '同步', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'View', // 按钮图标，支持element-Plus中所有图标
    click: () => getData, // 回调函数
    permission: 'master:ship:tongBu', // 权限
  },
])
const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
  console.log(clickRow.value)
  if (row.status == '1') {
    buttonList[1].disabled = false
    buttonList[1].label = '审核'
  }
  // if (row.status == '10') {
  //   buttonList[1].disabled = false
  //   buttonList[1].label = '销审'
  // }
  if (row.status == '0') {
    buttonList[1].disabled = true
  }
}
const cellDBLClickEvent =  ({ row }) => {
  clickRow.value = row
  edit(row)
}
const clearShipDataDrawer = () =>{
  proxy.$bus.emit('setInitSearchData', {
    shipName: '',
    status:''
  })
  queryParams2.value={
    startPage: 1,
    pageSize: 10
  }
}
//同步船舶数据
const getData = e=>{
  nextTick(()=>{
    queryParams2.value = e ===undefined?queryParams2.value:e
    shipDataDrawer.value = true
    api.getData(queryParams2.value).then(res=>{
      getShipDataTableData.value = res.data.pages
      total2.value = res.data.totalNum
    })
  })
}
// 同步数据
const synchronization = () => {
  let tempImo = checkboxList.value.map(item => item.imo)
  let message = '';
  let useHTML = false;
  api.getBlackShipData(tempImo).then(res=>{
    if (res.data != null && res.data != '') {
      //  当需要红色时：拼接带样式的HTML内容
      message = `<span style="color: red;">${res.data}为黑名单船舶，请确认是否同步</span>`;
      useHTML = true;
    } else {
      message = '确定同步选中数据吗？';
    }
  ElMessageBox.confirm(message, {
    dangerouslyUseHTMLString: useHTML,
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(()=>{
    api.syncData(checkboxList.value).then(res=>{
      if (res.code ==='0000'){
        shipDataDrawer.value = false
        proxy.$modal.msgSuccess(res.msg)
        getList(queryParams.value)
      }else {
        proxy.$modal.msgError(res.msg)
      }
    })
  })
  })
}
// const changeC = () => {
// 	if (clickRow.value.status == '10') {
// 		revokeMiscBilling()
// 	} else {
// 		proxy.$modal
// 			.confirm('是否审核？')
// 			.then(() => {
// 				api.publishMisc(clickRow.value.id).then(res => {
// 					proxy.$modal.msgSuccess('审核成功')
// 					getList(queryParams.value)
// 				})
// 			})
// 			.catch(() => {})
// 	}
// }
const changeC = () => {
  if (clickRow.value.status == '10') {
    proxy.$modal.msgWarning('该信息已审核')
    // revokeMiscBilling()
  } else {
    proxy.$modal
      .confirm('是否审核？')
      .then(() => {
        api.approve(clickRow.value).then(res => {
          proxy.$modal.msgSuccess('审核成功')
          getList(queryParams.value)
        })
      })
      .catch(() => {})
  }
}
const revokeMiscBilling = () => {
	if (clickRow.value.status == '1') {
		proxy.$modal.msgWarning('该客户管理已销审')
		return
	}
	proxy.$modal
		.confirm('确认撤销审核吗？')
		.then(() => {
			api.revokeMisc(clickRow.value.id).then(res => {
				proxy.$modal.msgSuccess('撤销审核成功')
				getList(queryParams.value)
			})
		})
		.catch(() => {})
}

// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// 新增事件
const saveBtnShow = ref(true)
const add = () => {
	customerVisible.value = true
	saveBtnShow.value = true

	title.value = '新增'
	showFlag.value = false
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.status = 1
		proxy.$bus.emit('resetFileList')
	})
}

// 编辑事件
const showFlag = ref(false)
const edit = (row,x) => {
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  rejectObj.id = editRow.id //驳回获取id
  title.value = '编辑'
  if (x === 0){
    customerVisible2.value = true
    saveBtnShow.value = false
  }else if (x === 1&& row.status !=='10'){
    customerVisible.value = true
    saveBtnShow.value = true
  }else if (x===1 && row.status ==='10'){
    customerVisible.value = true
    saveBtnShow.value = true
  }
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.id = ''
    detailRef.value.formData["certificatePath"] = row.certificatePath
    detailRef.value.formData.fileIds = []
    if(x === 0){
      proxy.setFormData(detailRef.value.formData, JSON.parse(JSON.stringify(editRow)))
    }else{
      api.getDataById(editRow.id).then(res => {
        let msg = JSON.parse(JSON.stringify(res.data))
        msg.certificatePath = row.certificatePath;
        if (msg.status == '1') {
          showFlag.value = true
        } else {
          showFlag.value = false
        }
        proxy.setFormData(detailRef.value.formData, msg)
        if (!detailRef.value.formData.fileIds) {
          detailRef.value.formData.fileIds = []
        }
        if(msg.bhtCustomerName !=null && msg.bhtCustomerName != undefined && msg.bhtCustomerName != ''){
          if(msg.bhtCustomerName == '渤海通也没有...'){
            proxy.$message.error("缺少申报单位信息，请到客户管理页面进行同步")
          }else{
            proxy.$message.error("缺少申报单位信息：" + msg.bhtCustomerName + " ，请到客户管理进行同步")
          }
        }
      })
    }
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
			})
		})
		.catch(err => {})
}
// 驳回
const dialogVisible = ref(false)
const rejectObj = reactive({
	id: '',
	idea: '',
})
const reject = () => {
	rejectObj.idea = ''
	dialogVisible.value = true
}
// 确定驳回
const rejectRef = ref()
const goReject = () => {
	let params = {
		id: rejectObj.id,
		idea: rejectObj.idea,
	}
	rejectRef.value.validate((valid, fields) => {
		if (valid) {
			api.reject(params).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
				dialogVisible.value = false
				customerVisible.value = false
			})
		} else {
			return
		}
	})
}
// val == 1 保存事件 val == 2 驳回事件
const save = async () => {
	console.log(detailRef.value.formData)
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(res => {
			if (title.value == '编辑') {
				api.update(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
          updateAcceptance();
          getList(queryParams.value)
					customerVisible.value = false
				})
			} else if (title.value == '新增') {
				delete detailRef.value.formData.id
				api.insert(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					customerVisible.value = false
				})
			}
		})
	}
}
/**
 * 更新保存时，将待审核的状态改为审核
 */
const updateAcceptance = async ()=>{
  if (clickRow.value.status == '1') {
    await api.publishMisc(clickRow.value.id)
    getList(queryParams.value)
  }
}
getList(queryParams.value)
</script>
