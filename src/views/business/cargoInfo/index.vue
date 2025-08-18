<template>
	<!-- 票货管理 -->
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
			:total="total"
			@Status_Change="Status_Change"
			:html-content="collectHtml"
			:tableHeight="'tabTableSummary'"
      :rowStyle="rowStyle"
    />
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="ticketVisible" :title="title" size="60%">
			<drawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="ticketVisible = false">{{ saveShow ? '取消' : '关闭' }}</el-button>
					<el-button type="primary" v-if="saveShow" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
		<!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="poundbillVisible" title="详情" size="80%" :withHeader="false">
      <header class="el-drawer__header" style="padding-bottom: 15px">
        <span id="el-id-7217-63" role="heading" class="el-drawer__title">详情</span>
        <el-input style="width: 150px;margin: 0px 5px " placeholder="车牌号" clearable v-model="params.truckPlate" />
        <el-input style="width: 150px;margin: 0px 5px " placeholder="计划号" clearable v-model="params.planNo" />
        <el-input style="width: 150px;margin: 0px 5px " placeholder="检斤号" clearable v-model="params.unionNo" />
        <el-date-picker
          v-model="params.dateTime"
          type="daterange"
          style="width: 200px;margin: 0px 5px "
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
        <el-button type="primary" style="margin: 0px 10px 0px 5px " @click="getPoundbillList">查询</el-button>
      </header>
      <poundbill ref="poundbillRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button type="primary" @click="poundbillVisible = false">返回</el-button>
        </div>
      </template>
    </el-drawer>

<!--		</el-drawer>-->
		<!-- 新增，货权转移抽屉组件 -->
		<el-drawer v-model="transferVisible" :title="transferTitle" size="55%">
			<transfer ref="transferRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="transferVisible = false">取消</el-button>
					<el-button type="primary" @click="transferSave" :disabled="transferFormDisabled">保存</el-button>
				</div>
			</template>
		</el-drawer>
		<!-- 货转查询 -->
		<el-drawer v-model="transferListVisible" :title="transferListTitle" size="70%">
			<transferList ref="transferListRef" @editEmit="editEmit" @deleteEmit="deleteEmit" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="transferListVisible = false">关 闭</el-button>
				</div>
			</template>
		</el-drawer>
		<!-- 完货 -->
		<el-dialog v-model="cleanVisible" title="完货提示" size="80%">
			<cleanDialog ref="dialogRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button type="primary" @click="submitClean">确定</el-button>
					<el-button @click="cleanVisible = false">取消</el-button>
				</div>
			</template>
		</el-dialog>
    <el-dialog v-model="hqVisible" title="海清物流" size="80%">
			<hqDialog ref="dialogHqRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button type="primary" @click="submitHq">确定</el-button>
					<el-button @click="hqVisible = false">取消</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
	<!--  货物清单-->
	<el-dialog type="primary" v-model="dialogVisible" title="卷钢导入" width="65%" :before-close="handleClose">
		<el-upload
			ref="upload"
			action="#"
			:show-file-list="false"
			:on-change="handleExcel"
			:limit="1"
			:multiple="false"
			accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			:auto-upload="false"
			:headers="headers"
		>
			<!--accept 只接受某种格式的文件-->
			<el-button type="primary" style="margin-bottom: 20px">导入货物清单</el-button>
			<el-button type="primary" style="margin-left: 20px; margin-bottom: 20px" @click.stop="downTemplate">模板下载</el-button>
		</el-upload>

		<!--    货物清单表单显示 -->
		<BaseTable ref="baseTable" :tableColumns="cargoListColumns" :tableData="cargoListTableData" :tableHeight="400" :autoResize="true" />
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialogVisible = false">取消</el-button>
				<!-- <el-button type="primary" @click="dialogVisible = false">Confirm</el-button> -->
			</span>
		</template>
	</el-dialog>
  <el-dialog type="primary" v-model="dialogBoxVisible" title="箱号导入" width="65%" :before-close="handleClose">
    <el-upload
      ref="upload"
      action="#"
      :show-file-list="false"
      :on-change="handleBoxExcel"
      :limit="1"
      :multiple="false"
      accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      :auto-upload="false"
      :headers="headers"
    >
      <!--accept 只接受某种格式的文件-->
      <el-button type="primary" style="margin-bottom: 20px">导入集装箱清单</el-button>
      <el-button type="primary" style="margin-left: 20px; margin-bottom: 20px" @click.stop="downBoxTemplate">模板下载</el-button>
    </el-upload>

    <!--    货物清单表单显示 -->
    <BaseTable ref="baseTable" :tableColumns="cargoListBoxColumns" :tableData="cargoListBoxTableData" :tableHeight="400" :autoResize="true" />
    <template #footer>
			<span class="dialog-footer">
				<el-button @click="dialogBoxVisible = false">取消</el-button>
			</span>
    </template>
  </el-dialog>
</template>

<script setup name="cargoInfo">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/business/cargoInfo/index.js'
import drawer from './drawer/index.vue'
import transfer from './transferDrawer/index.vue'
import poundbill from './poundbillDetail/index.vue'
import transferList from './transferList/index.vue'
import {ref, reactive, toRefs, h} from 'vue'
import { ElButton, ElTag } from 'element-plus'
import cleanDialog from './dialog/index.vue'
import hqDialog from './hqDialog/index.vue'
import { parseDate } from '@/utils'
import EditTable from "@/components/EditTable/index.vue";
import math from "@/utils/math";
import moment from "moment";

const collectHtml = ref(`<p>Hello, <strong>Vue 3</strong>!</p>`)
const { proxy } = getCurrentInstance()
const transferFormDisabled = ref(false)
const ticketVisible = ref(false) //新增修改抽屉
const poundbillVisible = ref(false) //新增修改抽屉
const transferVisible = ref(false) //货权转移抽屉
const transferListVisible = ref(false) //货转查询列表
const ids = ref([])
const total = ref(0)
const title = ref('新增票货')
const transferTitle = ref('货权转移')
const transferListTitle = ref('货转查询')
const poundbillRef = ref() // 明细组件ref
const drawerRef = ref(null) // 明细组件ref
const transferRef = ref(null) //票货转移组件ref
const transferListRef = ref(null) //货转查询列表组件ref
const saveShow = ref(true) //票货保存按钮显示隐藏
const baseTable = ref()
// 完货
const cleanVisible = ref(false)
const hqVisible = ref(false)
const dialogRef = ref(false)
const dialogHqRef = ref(false)
const data = reactive({
	transferRow: {},
})
const clickRow = ref({}) //点击当前行
const { transferRow } = toRefs(data)
// const dialogShow=ref(false)//弹出框组件显示隐藏
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
  date:[moment().startOf('M').format('YYYY-MM-DD'),moment().endOf('M').format('YYYY-MM-DD')]
})
const updataId = ref(null)
// 表格数据
const tableData = ref([])
const cargoListTableData = ref([]) // 货物清单列表
const cargoListBoxTableData = ref([]) // 集装箱清单列表
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '票货号', prop: 'cargoInfoNo', width: 124 },
	{ label: '通知单号', prop: 'trustNos', width: 106 },
	{
		label: '船名航次',
		prop: 'shipNameVoyage',
		width: 150,
	},
	{ label: '合同号', prop: 'contractCode', width: 160 },
	{ label: '货主', prop: 'cargoOwnerName', width: 289 },
	// { label: '货代名称', prop: 'cargoAgentName', width: 160 },
	{ label: '货名', prop: 'cargoName', width: 152 },
	{ label: '进出口', prop: 'impExp', align: 'center', width: 93 },
	{ label: '贸别', prop: 'tradeType', align: 'center', width: 81 },
	{ label: '包装', prop: 'packingName', align: 'center', width: 93 },
	{ label: '件数', prop: 'quantity', align: 'right', width: 78 },
	{ label: '重量', prop: 'ton', align: 'right', width: 84 },
  { label: '交接清单量', prop: 'handoverlistTon', align: 'right', width: 114 },
// { label: '已下发计划量', prop: 'trustCargoTon', align: 'right', width: 130 },
  { label: '已下发计划量（集港）', prop: 'trustCargoTonJG', align: 'right', width: 170 },
  { label: '已下发计划量（疏港）', prop: 'trustCargoTonSG', align: 'right', width: 170 },
  // { label: '已完成量', prop: 'weightGoods', align: 'right', width: 99 },
  { label: '已完成量（集港）', prop: 'weightGoodsJG', align: 'right', width: 170 },
  { label: '已完成量（疏港）', prop: 'weightGoodsSG', align: 'right', width: 170 },
  //{ label: '剩余计划量', prop: 'balanceTon', align: 'right', width: 113 },
  { label: '剩余计划量（集港）', prop: 'balanceTonJG', align: 'right', width: 170 },
  { label: '剩余计划量（疏港）', prop: 'balanceTonSG', align: 'right', width: 170 },
	{ label: '剩余港存量', prop: 'balancePortStorageTon', align: 'right', width: 114 },
  { label: '完货时间', prop: 'realClearDate', align: 'right', width: 114 },
  // { label: '货权量', prop: 'rightsQuantity', align: 'right', width: 93 },
	// { label: '剩余货权量', prop: 'surplusRightsQuantity', align: 'right', width: 115 },
	{ label: '预缴状态', prop: 'prePayStatus', align: 'center', width: 100,fixed: "right" },
	{ label: '预缴编号', prop: 'prePayNo', align: 'right', width: 100 },
	{
		label: '是否完货',
		prop: 'isClear',
		align: 'center',
    fixed: 'right',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isClear == '1' ? '' : 'info',
					},
					{
						default: () => (row.isClear == '1' ? '是' : '否'),
					}
				),
			]
		},
	},
  {
    label: '是否作废',
    prop: 'isLogout',
    align: 'center',
    fixed: 'right',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isLogout == '10' ? '' : 'info',
          },
          {
            default: () => (row.isLogout == '10' ? '已作废' : '未作废'),
          }
        ),
      ]
    },
  },
  {
    label: '作业模式',
    prop: 'workType',
    width: 200,
    render: row => {
      return [h('div', {}, row.workType === '1' ? '件杂' : row.workType === '2' ? '散杂' : row.workType === '3' ? '木材' : '')]
    },
  },
	{ label: '作业公司', prop: 'companyName', width: 200 },
	{
		prop: '',
		label: '操作',
		width: 250,
		align: 'center',
		fixed: 'right',
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
						permission: 'business:cargoInfo:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
        h(
          ElButton,
          {
            onClick: () => {
              isLogoutStatus(row)
            },
            type: row.isLogout == '10' ? 'danger' : 'primary',
            link: true,
            icon: row.isLogout == '10' ? 'video-pause' : 'video-play',
            permission: "business:cargoInfo:logout",
          },
          {
            default: () => (row.isLogout == '10' ? '撤销作废' : '作废'),
          }
        ),
				h(
					ElButton,
					{
						onClick: () => {
              poundbillDetail(row)
						},
						type: 'primary',
						link: true,
						// icon: 'Edit',
						permission: 'business:cargoInfo:update', // 权限
					},
					{
						default: () => '过磅明细',
					}
				),
			]
		},
	},
  {label: '放货人', prop: 'releaseByNames', align: 'right', width: 164},
  {label: '第一次放货时间', prop: 'releaseTimes', align: 'right', width: 149},
  {
    label: '结算状态',
    prop: 'statementStatus',
    align: 'center',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.statementStatus == '10' ? 'success' : 'info',
          },
          {
            default: () => row.statementStatus == '10'?'未结算':(row.statementStatus == '20'?'已预结':(row.statementStatus == '30'?'最终结算':'')),
          }
        )
      ]
    },
  },
  {
    label: '是否超期',
    prop: 'isOverdue',
    align: 'center',
    width: 100,
    render: row => {
      if (row.overdueDays || row.overdueDays === 0) {
        return [
          h(
            ElTag,
            {
              type: row.overdueDays > 0 ? 'warning' : 'success',
            },
            {
              default: () => row.overdueDays > 0 ? '是' : '否',
            }
          )
        ]
      } else {
        return [h('div', {}, '')]
      }
    },
  },
  { label: '超期天数', prop: 'overdueDays', align: 'right', width: 100 },
])
//  货物清单列表
//10：已导入  20：入库 30：出库
const cargoListColumns = ref([
	{ label: '序号', prop: 'num', width: 100 },
	{ label: '卷钢号', prop: 'coilNum', width: 150 },
	{ label: '重量', prop: 'ton', width: 110, align: 'right' },
	{ label: '尺寸1', prop: 'coilSize1', width: 110, align: 'right' },
	{ label: '尺寸2', prop: 'coilSize2', width: 110, align: 'right' },
	{ label: '收货地址', prop: 'receiveAddress', width: 200, align: 'right' },
	{
		label: '状态',
		prop: 'status',
		align: 'center',
		width: 110,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '10' ? 'info' : row.status == '30' ? 'error' : row.status == '20' ? '' : '',
					},
					{
						default: () =>
							row.status == '10' ? '已导入' : row.status == '20' ? '入库' : row.status == '30' ? '出库' : row.status,
					}
				),
			]
		},
	},
	{ label: '入库人', prop: 'wareHousingByName', width: 120, align: 'center' },
	{ label: '入库时间', prop: 'wareHousingTime', width: 160, align: 'center' },
	{ label: '出库人', prop: 'outBoundByName', width: 120, align: 'center' },
	{ label: '出库时间', prop: 'outBoundTime', width: 160, align: 'center' },
])
//  货物清单列表
//10：已导入  20：入库 30：出库
const cargoListBoxColumns = ref([
  { label: '序号', prop: 'num', width: 100 },
  { label: '箱号', prop: 'coilNum', width: 150 },
  { label: '重量', prop: 'ton', width: 110, align: 'right' },
  { label: '尺寸1', prop: 'coilSize1', width: 110, align: 'right' },
  { label: '尺寸2', prop: 'coilSize2', width: 110, align: 'right' },
  { label: '收货地址', prop: 'receiveAddress', width: 200, align: 'right' },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    width: 110,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '10' ? 'info' : row.status == '30' ? 'error' : row.status == '20' ? '' : '',
          },
          {
            default: () =>
              row.status == '10' ? '已导入' : row.status == '20' ? '入库' : row.status == '30' ? '出库' : row.status,
          }
        ),
      ]
    },
  },
  { label: '入库人', prop: 'wareHousingByName', width: 120, align: 'center' },
  { label: '入库时间', prop: 'wareHousingTime', width: 160, align: 'center' },
  { label: '出库人', prop: 'outBoundByName', width: 120, align: 'center' },
  { label: '出库时间', prop: 'outBoundTime', width: 160, align: 'center' },
])
const selectData = reactive([
	{
		name: '票货号',
		type: 'input', //远程下拉框
		modelValue: 'cargoInfoNo', //对应字段
		span: 8,
	},
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
	/*{
		name: '船名航次',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'shipvoyageItemId', //对应字段
		span: 8,
		dataType: 'VOYAGE',
	},*/
	{
		name: '货主',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'cargoOwnerId', //对应字段
		span: 2,
		dataType: 'CUSTOMER_CARGO_OWNER',
	},
	{
		name: '合同号',
		type: 'input', //远程下拉框
		modelValue: 'contractCode', //对应字段
		span: 2,
	},
  {
    name: '计划号',
    type: 'input', //远程下拉框
    modelValue: 'businessNo', //对应字段
    span: 2,
  },
  {
    name: '是否作废',
    type: 'select', //下拉框
    modelValue: 'isLogout', //对应字段
    span: 2,
    selectData: [
      { label: '已作废', value: '10' },
      { label: '未作废', value: '20' },
    ],
  },
	{
		name: '货名',
		type: 'input', //
		modelValue: 'cargoName', //对应字段
		span: 2,
	},
	{
		name: '作业公司',
		type: 'select', //下拉框，字典
		modelValue: 'companyId', //对应字段
		span: 2,
		dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } },
	},
	{
		name: '贸别',
		type: 'select', //下拉框
		modelValue: 'tradeType', //对应字段
		span: 2,
		selectData: [
			{ label: '内贸', value: '内贸' },
			{ label: '外贸', value: '外贸' },
		],
	},
	{
		name: '包装',
		type: 'select', //下拉框字典
		modelValue: 'packingCode', //对应字段
		span: 2,
		dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			url: '/api/internal/public/getDictListByType/PACKAGE_TYPE',
			method: 'get',
		},
	},
	{
		name: '是否完货',
		type: 'select',
		modelValue: 'isClear', //对应字段
		span: 2,
		selectData: [
			{ label: '是', value: '1' },
			{ label: '否', value: '0' },
		],
	},
	{
		name: '作业模式',
		type: 'select',
		modelValue: 'workType', //对应字段
		span: 2,
		selectData: [
			{ label: '件杂', value: '1' },
			{ label: '散杂', value: '2' },
		],
	},
  {
    // name: '起止日期',
    type: 'daterange',
    modelValue: 'date', //对应字段
    span: 4,
    shortcuts: [
      {
        text: '上周',
        value: () => {
          const currentTimestamp = Date.now()
          const currentDate = new Date(currentTimestamp)
          // 获取当前日期的星期几（0表示星期日，1表示星期一，以此类推）
          const currentDayOfWeek = currentDate.getDay()
          // 计算上周的起始日期和结束日期的时间戳
          const lastWeekStartDateTimestamp = currentTimestamp - (currentDayOfWeek + 6) * 24 * 60 * 60 * 1000
          const lastWeekEndDateTimestamp = currentTimestamp - currentDayOfWeek * 24 * 60 * 60 * 1000
          const lastWeekStartDate = new Date(lastWeekStartDateTimestamp)
          const lastWeekEndDate = new Date(lastWeekEndDateTimestamp)
          return [lastWeekStartDate, lastWeekEndDate]
        },
      },
      {
        text: '本周',
        value: () => {
          const currentDate = new Date()
          const currentDayOfWeek = currentDate.getDay()
          // 获取本周的起始日期和结束日期
          const thisWeekStartDate = new Date(currentDate)
          thisWeekStartDate.setDate(currentDate.getDate() - currentDayOfWeek + 1)
          const thisWeekEndDate = new Date(currentDate)
          thisWeekEndDate.setDate(currentDate.getDate() + (6 - currentDayOfWeek) + 1)
          return [thisWeekStartDate, thisWeekEndDate]
        },
      },
      {
        text: '下周',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          const currentDayOfWeek = currentDate.getDay()
          // 获取下周的起始日期和结束日期
          const nextWeekStartDate = new Date(currentDate)
          nextWeekStartDate.setDate(currentDate.getDate() + (8 - currentDayOfWeek))
          const nextWeekEndDate = new Date(currentDate)
          nextWeekEndDate.setDate(currentDate.getDate() + (14 - currentDayOfWeek))
          return [nextWeekStartDate, nextWeekEndDate]
        },
      },
      {
        text: '上月',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取上个月的起始日期和结束日期
          const lastMonthStartDate = new Date(currentDate)
          lastMonthStartDate.setMonth(currentDate.getMonth() - 1, 1)

          const lastMonthEndDate = new Date(currentDate)
          lastMonthEndDate.setDate(0)
          return [lastMonthStartDate, lastMonthEndDate]
        },
      },
      {
        text: '本月',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取本月的起始日期和结束日期
          const currentMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
          const currentMonthEndDate = new Date(nextMonthStartDate.getTime() - 24 * 60 * 60 * 1000)
          return [currentMonthStartDate, currentMonthEndDate]
        },
      },
      {
        text: '下月',
        value: () => {
          const currentDate = new Date()
          // 获取下月的起始日期和结束日期
          const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
          const nextMonthEndDate = new Date(nextMonthStartDate.getFullYear(), nextMonthStartDate.getMonth() + 1, 0)
          return [nextMonthStartDate, nextMonthEndDate]
        },
      },
      {
        text: '上季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取上季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const lastQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 - 3, 1)
          const lastQuarterEndDate = new Date(lastQuarterStartDate.getFullYear(), lastQuarterStartDate.getMonth() + 3, 0)
          return [lastQuarterStartDate, lastQuarterEndDate]
        },
      },
      {
        text: '本季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取本季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const currentQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3, 1)
          const nextQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 + 3, 1)
          const currentQuarterEndDate = new Date(nextQuarterStartDate.getTime() - 24 * 60 * 60 * 1000)
          return [currentQuarterStartDate, currentQuarterEndDate]
        },
      },
      {
        text: '下季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取下季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const nextQuarter = currentQuarter === 3 ? 0 : currentQuarter + 1 // 下季度
          const nextQuarterStartDate = new Date(currentDate.getFullYear(), nextQuarter * 3, 1)
          const nextQuarterEndDate = new Date(
            new Date(nextQuarterStartDate.getFullYear(), nextQuarterStartDate.getMonth() + 3, 1) - 1
          )
          return [nextQuarterStartDate, nextQuarterEndDate]
        },
      },
      {
        text: '去年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算去年的起始日期和结束日期
          const lastYearStartDate = new Date(currentDate.getFullYear() - 1, 0, 1)
          const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31)
          return [lastYearStartDate, lastYearEndDate]
        },
      },
      {
        text: '今年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算今年的起始日期和结束日期
          const currentYearStartDate = new Date(currentDate.getFullYear(), 0, 1)
          const currentYearEndDate = new Date(currentDate.getFullYear(), 11, 31)
          return [currentYearStartDate, currentYearEndDate]
        },
      },
      {
        text: '明年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算明年的起始日期和结束日期
          const nextYearStartDate = new Date(currentDate.getFullYear() + 1, 0, 1)
          const nextYearEndDate = new Date(currentDate.getFullYear() + 1, 11, 31)
          return [nextYearStartDate, nextYearEndDate]
        },
      },
    ],
  },
])
const buttonList = reactive([
	// {
	// 	label: '新增', // 按钮名称
	// 	type: 'primary', // 按钮类型
	// 	icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
	// 	click: () => add, // 回调函数
	// 	permission: 'business:cargoInfo:add', // 权限
	// },
	{
		label: '完货', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
		click: () => finished, // 回调函数
		permission: 'business:cargoTransfer:clean', // 权限
	},
	{
		label: '撤销完货', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Delete', // 按钮图标，支持element-Plus中所有图标
		click: () => cancelFinished, // 回调函数
		permission: 'business:cargoTransfer:cancel', // 权限
	},
	{
		label: '货权转移', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Edit', // 按钮图标，支持element-Plus中所有图标
		click: () => transferAdd, // 回调函数
		permission: 'business:cargoTransfer:add', // 权限
	},
	{
		label: '货转查询', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Search', // 按钮图标，支持element-Plus中所有图标
		click: () => transferQuery, // 回调函数
		permission: 'business:cargoTransfer:query', // 权限
	},
	{
		label: '导入货物清单', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => importList, // 回调函数
		permission: 'business:cargoTransfer:import', // 权限
	},
  {
    label: '导入集装箱', // 按钮名称
    type: 'primary', // 按钮类型
    disabled: true,
    icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
    click: () => importBoxList, // 回调函数
    permission: 'business:cargoTransfer:importBox', // 权限
  },
	{
		label: '导出', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Download', // 按钮图标，支持element-Plus中所有图标
		click: () => _export, // 回调函数
    permission: 'business:cargoInfo:query', // 权限
	},
])
const upload = ref()
const rowId = ref('')
const dialogVisible = ref(false)
const dialogBoxVisible = ref(false)
const headers = reactive({ 'Content-Type': 'multipart/form-data;chatset=UTF-8' })
//卷钢导入事件
const importList = () => {
	dialogVisible.value = true
	api.getCargoListByCargoId(rowId.value,1).then(res => {
		cargoListTableData.value = res.data
	})
}
const importBoxList = () => {
  dialogBoxVisible.value = true
  api.getCargoListByCargoId(rowId.value,2).then(res => {
    cargoListBoxTableData.value = res.data
  })
}
// 导出
const _export = () => {
  api.export(queryParams.value).then(async res => {
    if (isJsonString(await res.text())) {
      proxy.$modal.msgError(JSON.parse(await res.text()).msg)
      return
    }
    downLoadBlob(res, '票货信息')
  })
}
function isJsonString(str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}
//模板下载事件
const downTemplate = () => {
	proxy.$modal.confirm('确认下载模板吗？').then(() => {
		api.downTemplate().then(res => {
			downLoadBlob(res, '卷钢导入模板')
		})
	})
}
const downBoxTemplate = () => {
	proxy.$modal.confirm('确认下载模板吗？').then(() => {
		api.downBoxTemplate().then(res => {
			downLoadBlob(res, '集装箱导入模板')
		})
	})
}
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

const fileTemp = ref({})
const handleExcel = files => {
	upload.value.clearFiles() //清空已上传文件列表
	fileTemp.value = files.raw
	if (fileTemp.value) {
		if (
			fileTemp.value.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
			fileTemp.value.type == 'application/vnd.ms-excel'
		) {
			let file = new FormData()
			file.set('id', rowId.value)
			file.append('file', fileTemp.value)
			console.log(file)
			api.getCargoInfoList(rowId.value,1).then(res => {
				if (res.data.resMsg == 'jg0000') {
					proxy.$modal.confirm('确定保存？').then(() => {
						api.uploadFile(rowId.value, file).then(res => {
							if (res.data) {
								api.getCargoListByCargoId(rowId.value,1).then(res => {
									cargoListTableData.value = res.data
								})
								proxy.$message.success('导入成功')
							} else {
								proxy.$message.error('导入失败！')
							}
						})
					})
				} else if (res.data.resMsg == 'jg0001') {
          proxy.$modal.confirm('该票货已经导入过了，是否覆盖？').then(() => {
            api.uploadFile(rowId.value, file).then(res => {
              if (res.data) {
                api.getCargoListByCargoId(rowId.value,1).then(res => {
                  cargoListTableData.value = res.data
                })
                // dialogVisible.value = false
                proxy.$message.success('导入成功')
              } else {
                proxy.$message.error('导入失败！')
              }
            })
          })

				} else {
				  proxy.$message.error(res.data.resMsg);
				  return;
				}
			})
		} else {
			proxy.$message({
				type: 'warning',
				message: '文件格式不正确，请参考模板文件填写！',
			})
		}
	} else {
		proxy.$message({
			type: 'warning',
			message: '请上传附件！',
		})
	}
}
const handleBoxExcel = files => {
	upload.value.clearFiles() //清空已上传文件列表
	fileTemp.value = files.raw
	if (fileTemp.value) {
		if (
			fileTemp.value.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
			fileTemp.value.type == 'application/vnd.ms-excel'
		) {
			let file = new FormData()
			file.set('id', rowId.value)
			file.append('file', fileTemp.value)
			console.log(file)
			api.getCargoInfoList(rowId.value,2).then(res => {
				if (res.data.resMsg == 'jg0000') {
					proxy.$modal.confirm('确定保存？').then(() => {
						api.uploadBoxFile(rowId.value, file).then(res => {
							if (res.data) {
								api.getCargoListByCargoId(rowId.value,2).then(res => {
                  cargoListBoxTableData.value = res.data
								})
								proxy.$message.success('导入成功')
							} else {
								proxy.$message.error('导入失败！')
							}
						})
					})
				} else if (res.data.resMsg == 'jg0001') {
          proxy.$modal.confirm('该票货已经导入过了，是否覆盖？').then(() => {
            api.uploadBoxFile(rowId.value, file).then(res => {
              if (res.data) {
                api.getCargoListByCargoId(rowId.value,2).then(res => {
                  cargoListBoxTableData.value = res.data
                })
                // dialogVisible.value = false
                proxy.$message.success('导入成功')
              } else {
                proxy.$message.error('导入失败！')
              }
            })
          })

				} else {
				  proxy.$message.error(res.data.resMsg);
				  return;
				}
			})
		} else {
			proxy.$message({
				type: 'warning',
				message: '文件格式不正确，请参考模板文件填写！',
			})
		}
	} else {
		proxy.$message({
			type: 'warning',
			message: '请上传附件！',
		})
	}
}
// 完货
const finished = () => {
	cleanVisible.value = true
	console.log('当前行数据', clickRow.value)
	nextTick(() => {
		dialogRef.value.cleanObj.cargoInfoId = clickRow.value.id //票货id
	})
}
const isHQfinished = () => {
  if(clickRow.value.id===undefined || clickRow.value.id == null || clickRow.value.id== ''){
    proxy.$message.error("请先通过点击选中一条数据")
    return
  }
  hqVisible.value = true
	nextTick(() => {
    dialogHqRef.value.resetForm() // 清空事件
    dialogHqRef.value.disabled = false
    dialogHqRef.value.formData.cargoInfoId = clickRow.value.id //票货id
    dialogHqRef.value.formData.isHq = clickRow.value.isHq //票货id
    if(clickRow.value.isHq == '1'){
      dialogHqRef.value.disabled = true
    }
	})
}
// 完货
const submitClean = () => {
	let cleanData = dialogRef.value.cleanObj
	console.log('完货数据', cleanData)
	if (!cleanData.workDate) {
		proxy.$modal.msgWarning('请选择完货日期！')
		return
	}
	proxy.$modal
		.confirm('是否完货？')
		.then(function () {
			return api.cleanAllPortStorage(cleanData)
		})
		.then(res => {
			proxy.$modal.msgSuccess('完货成功！')
			cleanVisible.value = false
			getList(queryParams.value)
		})
		.catch(() => {})
}
const submitHq = () => {
	let hqData = dialogHqRef.value.formData
	console.log('海清数据', hqData)
	if (!hqData.isHq) {
		proxy.$modal.msgWarning('请选择数据！')
		return
	}
	proxy.$modal
		.confirm('是否确认？')
		.then(function () {
			return api.updateIsHq(hqData)
		})
		.then(res => {
			proxy.$modal.msgSuccess('保存成功！')
      hqVisible.value = false
			getList(queryParams.value)
		})
		.catch(() => {})
}
// 撤销完货
const cancelFinished = () => {
	proxy.$modal.confirm('是否确认撤销完货？').then(() => {
		api.cancelCleanAllPortStorage({
			id: clickRow.value.id,
		}).then(res => {
			proxy.$modal.msgSuccess(res.msg)
			getList(queryParams.value)
		})
	})
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	buttonList[0].disabled = false
	buttonList[1].disabled = false
	buttonList[2].disabled = false
	buttonList[3].disabled = false
  buttonList[4].disabled = true
  buttonList[5].disabled = true
  console.log(row.tally,"row.Tally")
	if (row.tally == '1') {
		rowId.value = row.id
		console.log(rowId.value, 'rowId.value')
		buttonList[4].disabled = false
	} else if(row.tally == '3') {
    rowId.value = row.id
    buttonList[5].disabled = false
	}else{
    buttonList[4].disabled = true
    buttonList[5].disabled = true
  }
}
// 点击查询的事件
const getList = e => {
	queryParams.value = e
  queryParams.value.startDate = null;
  queryParams.value.endDate = null;
  if(queryParams.value.date){
    queryParams.value.startDate = queryParams.value.date[0]
    queryParams.value.endDate = queryParams.value.date[1]
  }
	buttonList[0].disabled = true
	buttonList[1].disabled = true
	buttonList[2].disabled = true
	buttonList[3].disabled = true
	api.getList(e).then(res => {
		// console.log('列表', res)
		tableData.value = res.data.pages
		// console.log('列表数据', tableData.value)
		total.value = res.data.totalNum
	})
	api.getSummary(e).then(res => {
    res.data.handoverlistTon = (typeof res.data.handoverlistTon === undefined || res.data.handoverlistTon === null) ? '0' : res.data.handoverlistTon
    res.data.trustCargoTonJG = (typeof res.data.trustCargoTonJG === undefined || res.data.trustCargoTonJG === null) ? '0' : res.data.trustCargoTonJG
    res.data.weightGoodsJG = (typeof res.data.weightGoodsJG === undefined || res.data.weightGoodsJG === null) ? '0' : res.data.weightGoodsJG
    res.data.balanceTonJG = (typeof res.data.balanceTonJG === undefined || res.data.balanceTonJG === null) ? '0' : res.data.balanceTonJG
    res.data.trustCargoTonSG = (typeof res.data.trustCargoTonSG === undefined || res.data.trustCargoTonSG === null) ? '0' : res.data.trustCargoTonSG
    res.data.weightGoodsSG = (typeof res.data.weightGoodsSG === undefined || res.data.weightGoodsSG === null) ? '0' : res.data.weightGoodsSG
    res.data.balanceTonSG = (typeof res.data.balanceTonSG === undefined || res.data.balanceTonSG === null) ? '0' : res.data.balanceTonSG
    res.data.balancePortStorageTon = (typeof res.data.balancePortStorageTon === undefined || res.data.balancePortStorageTon === null) ? '0' : res.data.balancePortStorageTon
		console.log('票货数据汇总', res)
		collectHtml.value = `<p style="line-height:25px;margin-top:10px;"> 交接清单量：${res.data.handoverlistTon}，已下发计划量集港：${res.data.trustCargoTonJG}，已下发计划量疏港：${res.data.trustCargoTonSG}，已完成量集港：${res.data.weightGoodsJG}，已完成量疏港：${res.data.weightGoodsSG}<br/>剩余计划量集港：${res.data.balanceTonJG}，剩余计划量疏港：${res.data.balanceTonSG}，剩余港存量：${res.data.balancePortStorageTon}</p>`
	})
}
// 新增货权转移
const transferAdd = () => {
	transferFormDisabled.value = false
	if (clickRow.value && clickRow.value.id) {
		const editRow = clickRow.value // 拿到所编辑行的数据
		// console.log('父id', editRow.parentId)
		/*if (editRow.parentId) {
			proxy.$modal.msgError('该票货有货权转移生成，不能进行货权转移。')
			return
		}*/
		if (editRow.isClear == '1') {
			proxy.$modal.msgError('该票货已完货，不能进行货权转移。')
			return
		}
		transferVisible.value = true

		title.value = '货权转移'
		nextTick(() => {
			transferRef.value.resetForm() // 清空事件
			transferRef.value.formData.status = '1'
			transferRef.value.formData.cargoInfoIdSource = editRow.id
      transferRef.value.formData.isBilling = "0";
			transferRef.value.formData.transferDate = parseDate(new Date(), '{yyyy}-{mm}-{dd}')
      transferRef.value.customerList = []
      transferRef.value.customerList.push({value:editRow.cargoOwnerId,label:editRow.cargoOwnerName})
			//transferRef.value.formData.storageDate = parseDate(new Date(), '{yyyy}-{mm}-{dd}')
			// transferRef.value.formData.cargoAgentId = '' // 新建清空货代
			// transferRef.value.formData.cargoOwnerId = '' // 新建清空货主
			// transferRef.value.formData.shipvoyageItemId = '' // 新建清空船名航次
			// transferRef.value.formData.fileIds = [] // 新建清空附件
		})
	} else {
		proxy.$message.error('请选择票货！')
	}
}
// 新增票货
const add = () => {
	ticketVisible.value = true
	saveShow.value = true
	title.value = '新增票货'
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		// drawerRef.value.formData.id = '' // 新建清空id
		// drawerRef.value.formData.cargoAgentId = '' // 新建清空货代
		// drawerRef.value.formData.cargoCode = '' // 新建清空货名
		// drawerRef.value.formData.cargoOwnerId = '' // 新建清空货主
		// drawerRef.value.formData.shipvoyageId = '' // 新建清空船名航次
		// drawerRef.value.formData.companyId = '' // 新建清空作业公司
		// drawerRef.value.formData.packingCode = '' // 新建清空包装
		// console.log('add')
	})
}
// 票货保存
const save = async () => {
	if (await drawerRef.value.validate()) {
		// console.log('保存', drawerRef.value.formData)
		const params = JSON.parse(JSON.stringify(drawerRef.value.formData)) // 取到子组件的formData
		proxy.$modal.confirm('确定保存？').then(() => {
			// console.log('点击保存', params)
			api.insert(params).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess('新增成功')
					ticketVisible.value = false
					getList(queryParams.value)
				}
			})
		})
	}
}
// 货权查询自定义事件
const editEmit = e => {
	transferTitle.value = '货权转移'
	transferVisible.value = true
	// console.log('货转编辑', e)
	nextTick(() => {
		transferRef.value.resetForm() // 清空事件
		if (e.status == '10') {
			transferFormDisabled.value = true
		}
		proxy.setFormData(transferRef.value.formData, e)
	})
}
// 货权列表删除后自定义事件
const deleteEmit = () => {
	getList(queryParams.value)
	transferQuery(transferRow.value)
}
// 货权转移保存
const transferSave = async () => {
	if (await transferRef.value.validate()) {
		// console.log('保存', transferRef.value.formData)
    if (transferRef.value.formData.isBilling!= null && transferRef.value.formData.isBilling == '1') {
      if (transferRef.value.formData.paymentCustomerId == undefined
        || transferRef.value.formData.paymentCustomerId == null
        || transferRef.value.formData.paymentCustomerId == '') {
        proxy.$modal.msgWarning('请填写付款人')
        return
      }
    }
    let transferDate = transferRef.value.formData.transferDate;
		transferRef.value.formData.transferDate = new Date(transferRef.value.formData.transferDate)
			.toLocaleDateString()
			.replaceAll('/', '-') //货转日期
		//transferRef.value.formData.storageDate = new Date(transferRef.value.formData.storageDate).toLocaleDateString().replaceAll('/', '-') //堆货日期
		const params = JSON.parse(JSON.stringify(transferRef.value.formData)) // 取到子组件的formData
proxy.$modal.confirm('确定保存？').then(() => {
			// console.log('点击保存', params)
			if (params.id) {
				api.updateTransfer(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('修改成功')
						transferVisible.value = false
						getList(queryParams.value)
						transferQuery(transferRow.value)
					} else {
            transferRef.value.formData.transferDate = transferDate;
          }
				})
			} else {
				api.insertTransfer(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('新增成功')
						transferVisible.value = false
						getList(queryParams.value)
					} else {
            transferRef.value.formData.transferDate = transferDate;
          }
				})
			}
		})
	}
}
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '编辑票货'
	ticketVisible.value = true
	saveShow.value = false
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		api.getDataById(editRow.id).then(res => {
			// console.log('编辑')
			proxy.setFormData(drawerRef.value.formData, res.data)
			// console.log('编辑回显数据', drawerRef.value.formData)
		})
		// console.log(editRow, 'edit')
	})
}
const params = ref({
  cargoInfoId: null,//票货号
  truckPlate: null,//车牌号
  unionNo: null,//检斤号
  startTime: null,//出港开始时间、出港结束时间
  endTime: null,//车牌号
  planNo: null,//车牌号
  dateTime: null,//时间
})
// 过磅明细 poundbillDetail
const cargoInfoId = ref();
const poundbillDetail = async row => {
  poundbillVisible.value = true
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  cargoInfoId.value = editRow.id;
  params.value.cargoInfoId = cargoInfoId.value;
  console.log(params.value)
  console.log(params.value.dateTime)
  // console.log(params.value.dateTime[0])
  // console.log(params.value.dateTime[1])
  getPoundbillList();

}
const getPoundbillList =async ()=>{
  let data  = [];
  await api.getPoundbillList(params.value).then(res=>{
    data = res.data;
    nextTick(() => {
      poundbillRef.value.resetForm(); // 清空事件
      poundbillRef.value.tableData = data;
      let a = 0
      data.forEach(item=> {
        a = math.numAdd(a, item.WEIGHT_GOODS);
        // 将累加结果赋值给tons.value
        poundbillRef.value.sumTon = a.toFixed(2);
      })
    })
  })
}


// 货转查询
const transferQuery = () => {
	if (clickRow.value && clickRow.value.id) {
		const editRow = clickRow.value // 拿到所编辑行的数据
		transferRow.value = editRow
		transferListTitle.value = '货转查询'
		transferListVisible.value = true
		// console.log('货转', transferRow.value)
		api.getTransferList({ cargoInfoId: editRow.id }).then(res => {
			transferListRef.value.tableData = res.data
			// console.log('货转列表数据', transferListRef.value.tableData)
			// total.value = res.data.totalNum
		})
	} else {
		proxy.$message.error('请选择票货！')
	}
}
/** 作废 */
const isLogoutStatus = row =>{
  if(row.id==null||row.id==''){
    return;
  }
  let text = row.isLogout == '10' ? '撤销作废' : '作废'
  proxy.$modal.confirm('确定"' + text + '"吗?').then(() => {
    api.isLogoutStatus({ id:row.id, isLogout:row.isLogout == '10' ? '20' : '10'}).then(res => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess(text + '成功')
    })
  })
}
const rowStyle = e => {
  if (e.row.isLogout == '10') {
    return 'color:red'
  }
  return null
}
/** 初始化数据 */

const init = async () => {
  await nextTick(() => {
    baseTable.value.SearchHeaderRef.searchData.isLogout = '20'
    let startTime = moment().startOf('Y').format('YYYY-MM-DD');
    let endTime = moment().endOf('M').format('YYYY-MM-DD');
    baseTable.value.SearchHeaderRef.searchData.date = [startTime, endTime]
    queryParams.value.date = [startTime, endTime]
  })
  queryParams.value.isLogout = '20'
  getList(queryParams.value)
}
init()
</script>
<style lang="less" scoped>
// @import "../../../assets/styles/searchform.scss";
</style>
