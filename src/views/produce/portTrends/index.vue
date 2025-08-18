<template>
	<div class="app-container">
		<SearchHeader
			ref="searchHeaderRef"
			:selectData="selectData"
			@searchClick="getList"
			:buttonList="buttonList"
			:showMoreFlag="true"
			@changeRemoteSelect="changeRemoteSelect"
		/>
		<el-tabs v-model="tabActiveName" type="card" class="demo-tabs" @tab-click="handleClick">
			<el-tab-pane label="详细堆存" name="first">
				<BaseTable
					ref="baseTable"
					:tableColumns="tableColumnsDetail"
					:tableData="tableDataDetail"
					:showSearchHeader="false"
					:searchClick="getList"
					:cellClickEvent="cellClickEvent"
					:show-footer="true"
					:footerConfig="footerConfig"
					:loading="loading"
					:total="total"
					:syncResize="true"
					:showMoreFlag="true"
					:html-content="collectHtml"
				/>
			</el-tab-pane>
			<el-tab-pane label="票货汇总" name="second">
				<BaseTable
					ref="baseTable"
					:tableColumns="tableColumnsW"
					:tableData="tableDataW"
					:searchClick="getList"
					:cellClickEvent="cellClickEvent"
					:loading="loading"
					:total="total"
					:show-footer="true"
					:footerConfig="footerConfig"
					:syncResize="true"
					:showMoreFlag="true"
					:html-content="collectHtml"
				/>
			</el-tab-pane>
			<el-tab-pane label="货主汇总" name="third">
				<BaseTable
					ref="baseTable"
					:tableColumns="tableColumnsWer"
					:tableData="tableDataWer"
					:searchClick="getList"
					:showMoreFlag="true"
					:cellClickEvent="cellClickEvent"
					:loading="loading"
					:total="total"
					:show-footer="true"
					:footerConfig="footerConfig"
					:syncResize="true"
					:html-content="collectHtml"
				/>
			</el-tab-pane>
			<el-tab-pane label="货名汇总" name="fourth">
				<BaseTable
					ref="baseTable"
					:tableColumns="tableColumnsCargoName"
					:tableData="tableDataCargoName"
					:searchClick="getList"
					:showMoreFlag="true"
					:cellClickEvent="cellClickEvent"
					:loading="loading"
					:total="total"
					:show-footer="true"
					:footerConfig="footerConfig"
					:syncResize="true"
					:html-content="collectHtml"
				/>
			</el-tab-pane>
		</el-tabs>
		<el-drawer v-model="childTicketVisible" title="补录场存" size="50%">
			<childTicket ref="childTicketRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="childTicketVisible = false">取消</el-button>
					<el-button @click="save" type="primary">保存</el-button>
				</div>
			</template>
		</el-drawer>
		<el-drawer v-model="detailVisible" title="详情" size="85%">
			<detail ref="detailRef" :detailRow="detailRow" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="detailVisible = false">关闭</el-button>
				</div>
			</template>
		</el-drawer>
    <el-drawer v-model="detailCargoVisible" title="票货详情" size="85%">
      <cargoDetail ref="cargoDetailRef" :detailRow="detailRow" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="detailCargoVisible = false">关闭</el-button>
        </div>
      </template>
    </el-drawer>
		<!-- 清场 -->
		<el-dialog v-model="cleanVisible" title="清场提示" size="80%">
			<cleanDialog ref="dialogRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button type="primary" @click="submitClean">确定</el-button>
					<el-button @click="cleanVisible = false">取消</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup name="portTrends">
import SearchHeader from '@/components/SearchHeader/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/portTrends/index.js'
import childTicket from './childTicket/index.vue'
import detail from './detail/index.vue'
import cargoDetail from './cargoDeatil/index.vue'
import cleanDialog from './dialog/index.vue'
import { formatMoney } from '@/utils/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElTag, ElNotification } from 'element-plus'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// header--------------------------------------------------------------------------------------------
const collectHtml = ref(`<p>Hello, <strong>Vue 3</strong>!</p>`)
const searchHeaderRef = ref()
const selectData = reactive([
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 8, // 占位，共24
  }, {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 8, // 占位，共24
  },
	{
		name: '垛位',
		type: 'remoteSelect',
		modelValue: 'value',
		span: 8,
		dataType: 'ALL_STORAGE_MASS',
		change: e => {
			if(e){
				queryParams.value.massId = e.massId //垛位
				queryParams.value.storehouseId = e.storehouseId //库场
				queryParams.value.regionId = e.regionId //区域
			} else {
				queryParams.value.massId = '' //垛位
				queryParams.value.storehouseId = '' //库场
				queryParams.value.regionId = '' //区域
			}
		},
	},
	{
		name: '贸别',
		type: 'select',
		modelValue: 'tradeType',
		span: 2,
		selectData: [
			{ label: '内贸', value: '内贸' },
			{ label: '外贸', value: '外贸' },
		],
	},
/*	{
		name: '是否清场',
		type: 'select',
		modelValue: 'inoutStorageName',
		span: 2,
		selectData: [
			{ label: '已清场', value: '清场' },
			{ label: '未清场', value: '未清场' },
		],
	},*/
	{
		name: '票货号',
		type: 'input',
		modelValue: 'cargoInfoNo',
		span: 3,
	},
	{
		name: '货主',
		type: 'remoteSelect',
		modelValue: 'cargoOwnerId',
		span: 3,
		dataType: 'CUSTOMER_CARGO_OWNER',
	},
	{
		name: '作业公司',
		type: 'select',
		modelValue: 'companyId',
		span: 3,
		dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } },
	},
  {
    name: '货名',
    type: 'input',
    modelValue: 'cargoName',
    span: 3,
  },
	{
		name: '包装',
		type: 'select',
		modelValue: 'packingCode',
		span: 2,
		dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			url: '/api/internal/public/getDictListByType/PACKAGE_TYPE',
			method: 'get',
		},
	},
	{
		name: 'SCN',
		type: 'input',
		modelValue: 'scn',
		span: 3,
	},
	{
		name: '场/区/垛',
		type: 'input',
		modelValue: 'queryStr',
		span: 3,
	},
])
const changeRemoteSelect = async e => {
	const res = await api.getstroagestack(e.value)
	selectData.forEach(item => {
		if (item.modelValue === 'stackCode') {
			item.selectData = res.data
		}
	})
}
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	activeName: 'first',
	numFlag: '1',
	storehouseId: '', //库场id
	regionId: '', //区域id
	massId: '', //垛位id
})

// 表尾合计脚函数
const footerConfig = reactive({
	columns: [
		{ prop: 'quantity', formatter: formatMoney },
		{ prop: 'ton', formatter: formatMoney },
	], // 哪一列使用表尾函数，是否需要格式化处理
	functions: ['合计'], // 表尾使用方法名
})
const seachData = ref({})
// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	loading.value = true
	if (queryParams.value.activeName === 'first') {
		api.getPortStorageList(queryParams.value).then(res => {
			tableDataDetail.value = res.data.pages
			console.log('详细堆栈列表数据', res)
			total.value = res.data.totalNum
			loading.value = false
		})
	} else if (queryParams.value.activeName === 'second') {
		api.getPortStorageGbCargoInfoList(queryParams.value).then(res => {
			tableDataW.value = res.data.pages
			total.value = res.data.totalNum
			loading.value = false
		})
	} else if (queryParams.value.activeName === 'third') {
		api.getPortStorageGbCargoOwnerList(queryParams.value).then(res => {
			tableDataWer.value = res.data.pages
			total.value = res.data.totalNum
			loading.value = false
		})
	} else if (queryParams.value.activeName === 'fourth') {
		api.getPortStorageGbCargoList(queryParams.value).then(res => {
			tableDataCargoName.value = res.data.pages
			total.value = res.data.totalNum
			loading.value = false
		})
	}
	api.getSummaryQuantityTon(queryParams.value).then(res => {
		// console.log('件数、吨数汇总', res)
		collectHtml.value = `<p > 总计数：${res.data.quantity},总吨数：${res.data.ton}</p>`
		loading.value = false
	})
}
const buttonList = reactive([
	{
		label: '新建', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		disabled: false,
		permission: 'produce:portTrends:save', // 权限
	},
	{
		label: '详情', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Operation', // 按钮图标，支持element-Plus中所有图标
		click: () => getDetail, // 回调函数
		disabled: false,
		permission: 'dispatch:workPlan:save', // 权限
	},
	{
		label: '清场', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
		click: () => clean, // 回调函数
		disabled: false,
		permission: 'produce:portTrends:clean', // 权限
	},
	/*{
		label: '撤销清场', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
		click: () => cancelClean, // 回调函数
		disabled: false,
		permission: 'produce:portTrends:revokeClean', // 权限
	},*/
	{
		label: '导出', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'DocumentChecked', // 按钮图标，支持element-Plus中所有图标
		click: () => exportFile, // 回调函数
		disabled: false,
		permission: 'produce:portTrends:export', // 权限
	},
  {
    label: '电子垛牌', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Download', // 按钮图标，支持element-Plus中所有图标
    click: () => stackSignDown, // 回调函数
    disabled: false,
    permission: 'produce:portTrends:stackSignDown', // 权限
  },
])
const childTicketVisible = ref(false)
const childTicketRef = ref()
// 新增港存动态
const add = () => {
	childTicketVisible.value = true
	nextTick(() => {
		childTicketRef.value.resetForm()
    childTicketRef.value.busCargoData.processDetailCode = '10090001'
	})
}
// 港存动态保存
const save = async () => {
	if (await childTicketRef.value.validate()) {
		// console.log('补录票货保存')
		const busCargoData = JSON.parse(JSON.stringify(childTicketRef.value.busCargoData)) // 拿到子组件的子票货数据
		const tabelList = JSON.parse(JSON.stringify(childTicketRef.value.tableData)) // 拿到子组件的tableData
		// console.log('票货',busCargoData);
		let params = tabelList.map(item => {
			return { ...item, ...busCargoData }
		})
		// console.log('保存数据', params)
		// params.dataList = dataList
		api.getinsertPortStorage(params).then(res => {
			// console.log('新增成功了么', res)
			childTicketVisible.value = false
			proxy.$modal.msgSuccess(res.msg)
			getList(queryParams.value)
		})
	}
}
// 获取点击行数据
const clickRow = ref({})
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
//选中
const stackSignDown  =()=>{
  console.log(clickRow.value,"行数据")
  let tmpList = [{cargoInfoId:clickRow.value.cargoInfoId,stackId:clickRow.value.massId,shipNameVoyage:clickRow.value.shipNameVoyage}]
  api.exportStackSign(tmpList).then(res=>{
    downLoadBlob(res, '货垛牌')
  })
}
// 查看详情
const detailVisible = ref(false)
const detailCargoVisible = ref(false)
const detailRow = ref({}) // 详情信息
const getDetail = async () => {
	// console.log('所选数据', clickRow.value)
  if (tabActiveName.value == 'first') {
    if (JSON.stringify(clickRow.value) == '{}') {
      proxy.$modal.msgWarning('请选择详细堆存')
      return
    }
    detailVisible.value = true
    let row = clickRow.value
    console.log('选中当前行数据', row)
    let data = {
      cargoInfoId: row.cargoInfoId, //票货ID
      storehouseId: row.storehouseId, //库场ID
      regionId: row.regionId, //区域ID
      massId: row.massId, //垛位ID
      cargoInfoLabel: row.cargoInfoLabel, //票货信息
    }
    detailRow.value = data
  }
  if (tabActiveName.value == 'second') {
    if (JSON.stringify(clickRow.value) == '{}') {
      proxy.$modal.msgWarning('请选择详细堆存')
      return
    }
    detailCargoVisible.value = true
    let row = clickRow.value
    let data = {
      cargoInfoId: row.cargoInfoId, //票货ID
      cargoInfoLabel: row.cargoInfoLabel, //票货信息
    }
    detailRow.value = data
  }
}
// 导出文件流
const downLoadBlob = (file, filename) => {
	let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
	let url = URL.createObjectURL(blob)
	let a = document.createElement('a')
	a.href = url
	a.style.display = 'none'
	document.body.appendChild(a)
	a.setAttribute('download', filename)
	a.click()
	document.body.removeChild(a)
}
// 导出
const exportFile = () => {
	// console.log('导出数据条件', queryParams.value)
	if (tabActiveName.value === 'first') {
		// console.log('详细堆存导出', queryParams.value)
		api.getExportPortStorage(queryParams.value).then(res => {
			downLoadBlob(res, '详细堆存')
		})
	} else if (tabActiveName.value === 'second') {
		api.getExportStorageGbCargoInfo(queryParams.value).then(res => {
			downLoadBlob(res, '票货汇总')
		})
		// console.log('票货汇总导出')
	} else if (tabActiveName.value === 'third') {
		api.getExportStorageGbCargoOwner(queryParams.value).then(res => {
			downLoadBlob(res, '货主汇总')
		})
		// console.log('货主汇总')
	} else if (tabActiveName.value === 'fourth') {
		api.getExportStorageGbCargo(queryParams.value).then(res => {
			downLoadBlob(res, '货名汇总')
		})
	}
}
// 清场
const cleanVisible = ref(false)
const dialogRef = ref(false)
// 打开清场抽屉
const clean = () => {
	if (JSON.stringify(clickRow.value) == '{}') {
		proxy.$modal.msgWarning('请选择详细堆存')
		return
	}
	cleanVisible.value = true
	console.log('当前行数据', clickRow.value)
	nextTick(() => {
		dialogRef.value.cleanData.cargoInfoLabel = clickRow.value.cargoInfoLabel //票货信息
		dialogRef.value.cleanData.ton = clickRow.value.ton //重量
		dialogRef.value.cleanData.storehouseName = clickRow.value.storehouseName //场地
		dialogRef.value.cleanObj.cargoInfoId = clickRow.value.cargoInfoId //票货id
		dialogRef.value.cleanObj.storehouseId = clickRow.value.storehouseId //库场id
		dialogRef.value.cleanObj.regionId = clickRow.value.regionId //区域id
		dialogRef.value.cleanObj.massId = clickRow.value.massId //垛位id
	})
}
// 清场
const submitClean = () => {
	let cleanData = dialogRef.value.cleanObj
	console.log('清场数据', cleanData)
	if (!cleanData.workDate) {
		proxy.$modal.msgWarning('请选择清场日期！')
		return
	}
	proxy.$modal
		.confirm('是否清场？')
		.then(function () {
			return api.getCleanPortStorage(cleanData)
		})
		.then(res => {
			proxy.$modal.msgSuccess('清场成功！')
			cleanVisible.value = false
			getList(queryParams.value)
		})
		.catch(() => {})
}
// 撤销清场
const cancelClean = () => {
  if (JSON.stringify(clickRow.value) == '{}') {
    proxy.$modal.msgWarning('请选择详细堆存')
    return
  }
  proxy.$modal.confirm('是否确认撤销清场？').then(() => {
    api.cancelCleanPortStorage({
      cargoInfoId: clickRow.value.cargoInfoId,
      storehouseId: clickRow.value.storehouseId,
      regionId: clickRow.value.regionId,
      massId: clickRow.value.massId,
    }).then(res => {
      proxy.$modal.msgSuccess(res.msg)
      getList(queryParams.value)
    })
  })
}
// tab------------------------------------------------------------------------
const tabActiveName = ref('first')
const handleClick = tab => {
	if (tab.index === '0') {
		tabActiveName.value = 'first'
	} else if (tab.index === '1') {
		tabActiveName.value = 'second'
	} else if (tab.index === '2') {
		tabActiveName.value = 'third'
	} else if (tab.index === '3') {
		tabActiveName.value = 'fourth'
	}
	clickRow.value = {}
	// console.log('是什么？', tab)
	// console.log('变了吗', tab.paneName)
	queryParams.value.activeName = tab.paneName
	getList(queryParams.value)
	// if (tabActiveName.value !== 'first' && clickRow.value) {
	if (tabActiveName.value !== 'first') {
		buttonList[0].disabled = true
		buttonList[1].disabled = true
		buttonList[2].disabled = true
		buttonList[3].disabled = true
	} else {
		buttonList.forEach(item => (item.disabled = false))
	}
  if (tabActiveName.value == 'second') {
    buttonList[0].disabled = true
    buttonList[1].disabled = false
    buttonList[2].disabled = true
    buttonList[3].disabled = true
  }
}
// table--------------------------------------------------------------------------------------------
const baseTable = ref() // table的ref
const total = ref(10) // 数据总数
const loading = ref(false) // 是否加载中
// 表格数据
const tableDataDetail = ref([])
const tableDataW = ref([])
const tableDataWer = ref([])
const tableDataCargoName = ref([])
// 详细堆存
const tableColumnsDetail = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'trustNo', label: '通知单编号', width: 120 },
	{ prop: 'cargoInfoNo', label: '票货号', width: 120 },
	{ prop: 'companyName', label: '作业公司', width: 200, align: 'center' },
	{ prop: 'shipNameVoyage', label: '船名航次', width: 130 },
	{ prop: 'tradeType', label: '贸别', width: 100, align: 'center' },
	{ prop: 'cargoOwnerName', label: '货主', width: 220, align: 'center' },
	{ prop: 'cargoName', label: '货名' , width: 120, align: 'center'},
	// { prop: 'inoutDate', label: '第一次进货日期', align: 'center', width: 140 },
	{ prop: 'inoutDate', label: '创建时间', align: 'center', width: 140 },
	{ prop: 'storehouseName', label: '场地', width: 70 },
	{ prop: 'regionName', label: '区域', width: 70},
	{ prop: 'massName', label: '垛位', width: 90 },
	{ prop: 'packingName', label: '包装', align: 'center', width: 70 },
	{ prop: 'quantity', label: '件数', align: 'right', width: 70 },
	{ prop: 'ton', label: '重量', align: 'right', width: 90 },
	{ prop: 'inoutStorageName', label: '清场', align: 'center', width: 100,fixed:'right' },
])
// 委托汇总
const tableColumnsW = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'trustNo', label: '通知单编号' , width: 120},
  { prop: 'cargoInfoNo', label: '票货号', width: 120 },
	{ prop: 'companyName', label: '作业公司', width: 200, align: 'center' },
	{ prop: 'shipNameVoyage', label: '船名航次' , width: 130},
	{ prop: 'inoutDate', label: '入场日期', align: 'center' , width: 130},
	{ prop: 'tradeType', label: '贸别', width: 100 },
	{ prop: 'cargoOwnerName', label: '货主', width: 220, align: 'center'  },
	{ prop: 'cargoName', label: '货名' , width: 130},
	{ prop: 'packingName', label: '包装', width: 70 },
	{ prop: 'quantity', label: '件数', align: 'right' , width: 70},
	{ prop: 'ton', label: '重量', align: 'right', width: 90 },
])
// 委托人汇总
const tableColumnsWer = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'companyName', label: '作业公司' },
	{ prop: 'cargoOwnerName', label: '货主' },
	{ prop: 'cargoName', label: '货名' },
	{ prop: 'quantity', label: '件数', align: 'right' },
	{ prop: 'ton', label: '重量', align: 'right' },
])
// 货名汇总
const tableColumnsCargoName = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'companyName', label: '作业公司' },
	{ prop: 'cargoName', label: '货名' },
	{ prop: 'quantity', label: '件数', align: 'right' },
	{ prop: 'ton', label: '重量', align: 'right' },
])

onMounted(() => {
	getList(queryParams.value)
})
</script>
<style lang="scss" scoped></style>
