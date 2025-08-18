<template>
	<!-- 交接清单管理 -->
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
		/>
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="drawerVisible" title="交接清单" size="80%">
			<drawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">{{ '取消' }}</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
    <!-- 票货统计 -->
    <el-drawer v-model="statisticsVisible" title="票货统计" size="80%">
      <statistics ref="statisticsRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="statisticsVisible = false">{{ '关闭' }}</el-button>
        </div>
      </template>
    </el-drawer>
	</div>
</template>

<script setup name="cargoList">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/cargoList/index.js'
import drawer from './drawer/index.vue'
import statistics from './statistics/index.vue'
import { ref, reactive, toRefs } from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()
const drawerVisible = ref(false) //新增修改抽屉

const total = ref(0)
const drawerRef = ref(null) // 明细组件ref
const clickRow = ref({}) //点击当前行

let statisticsVisible = ref(false) //新增修改抽屉
const statisticsRef = ref(null) // 明细组件ref

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '作业公司', prop: 'companyName', align: 'center',width: 200 },
	{ label: '通知单编号', prop: 'trustNo', align: 'center', width: 120 },
	{ label: '票货号', prop: 'cargoInfoNo', align: 'center', width: 160 },
	{ label: '货名', prop: 'cargoNames', align: 'center', width: 160 },
	{ label: '货主', prop: 'cargoOwnerNames', align: 'center', width: 260 },
	{ label: '操作过程', prop: 'processName', align: 'center', width: 100 },
	{ label: '贸别', prop: 'tradeType', align: 'center', width: 100 },
	{ label: '进出口', prop: 'impExp', align: 'center', width: 100 },
	{ label: '计划件数', prop: 'planQuantity', align: 'right' , width: 100},
	{ label: '计划重量', prop: 'planTon', align: 'right' , width: 100},
	{ label: '核销重量', prop: 'checkTon', align: 'right' , width: 100},
	{ label: '核销数量', prop: 'checkNumber', align: 'right' , width: 100},
	{ label: '结算依据', prop: 'settlementBasisName' , width: 150},
	{ label: '作业要求', prop: 'remark' , width: 150},
	{
		label: '状态',
		prop: 'isHaveHandoverlistLabel',
		align: 'center',
		width: 100,
    fixed:'right',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isHaveHandoverlist == 1 ? 'success' : 'danger',
					},
					{
						default: () => row.isHaveHandoverlistLabel,
					}
				),
			]
		},
	},
])
const selectData = reactive([
  {
    name: '票货号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoInfoNo', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '货名',
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span:8,
  },
  {
    name: '货主', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'cargoOwnerId', // 绑定字段
    span: 8, // 占位，共24
    dataType: 'CUSTOMER_CARGO_OWNER',
  },
  {
    name: '通知单编号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'trustNo', // 绑定字段
    span: 3, // 占位，共24
  },
])
const buttonList = reactive([
	{
		label: '交接清单', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Edit', // 按钮图标，支持element-Plus中所有图标
		click: () => handoverList, // 回调函数
		permission: 'produce:handoverList:list', // 权限
	},
  {
    label: '票货统计', // 按钮名称
    type: 'primary', // 按钮类型
    disabled: true,
    icon: 'Edit', // 按钮图标，支持element-Plus中所有图标
    click: () => cargoStatistics, // 回调函数
    permission: 'produce:handoverList:statistics', // 权限
  },
])

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	buttonList[0].disabled = false
	buttonList[1].disabled = false
}
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	buttonList[0].disabled = true
	buttonList[1].disabled = true
	api.getList(e).then(res => {
		// console.log('陆集陆疏列表数据', res)
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

const handoverList = async () => {
	drawerVisible.value = true
	// 获取当前船舶下的票货数据
	const { data } = await api.getCargoInfo(clickRow.value.id)
	// console.log('获取票货信息', data)
	// 处理票货数据 保存时与数据库字段对应
	const cargoData = data.map(item => {
		const obj = {
			...item,
			type: 2,
			cargoInfoId: item.id, //票货ID
			trustId: clickRow.value.id, // 指令ID
			// trustCargoId: clickRow.value.trustNo, //指令票货ID
			// shipvoyageId: clickRow.value.id,
			// shipName: clickRow.value.shipName,
			// voyage: clickRow.value.voyage,
			// shipvoyageItemId: clickRow.value.shipvoyageItemId,
			// tradeType: clickRow.value.tradeType,
			// loadUnload: clickRow.value.loadUnload,
			quantity: null,
			ton: item.weightGoods,
			ticketNum: null,
		}
		return obj
	})

	// 获取当前船舶下的交接清单
	const { data: handoverData } = await api.getHandoverList(clickRow.value.id)
	// console.log('陆集陆疏交接清单', handoverData)

	nextTick(() => {
		if (handoverData && handoverData.length >= 1) {
			// 合并交接数据和票货数据
			let copyArr = [...cargoData]
			cargoData.forEach((item, index) => {
				handoverData.forEach(items => {
					if (item.id == items.cargoInfoId) {
						copyArr[index] = items
					}
				})
			})
			drawerRef.value.tableData = copyArr
		} else {
			drawerRef.value.tableData = cargoData
		}
		drawerRef.value.formData.trustNo = clickRow.value.trustNo //指令编号
		drawerRef.value.formData.releaseTime = clickRow.value.releaseTime //下发时间
		drawerRef.value.formData.trustCargoId = clickRow.value.trustCargoId //票货id
		// drawerRef.value.formData.berthTime = clickRow.value.berthTime
		// drawerRef.value.formData.leaveBerthTime = clickRow.value.leaveBerthTime

		drawerRef.value.formData.quantity = 0
		drawerRef.value.formData.ton = 0
		drawerRef.value.formData.ticketNum = 0
		drawerRef.value.tableData.forEach(item => {
			if (Number(item.quantity)) {
				drawerRef.value.formData.quantity += Number(item.quantity)
			}
			if (Number(item.ton)) {
				drawerRef.value.formData.ton += Number(item.ton)
			}
			if (Number(item.ticketNum)) {
				drawerRef.value.formData.ticketNum += Number(item.ticketNum)
			}
		})
	})
}

const cargoStatistics = async () => {
  statisticsVisible.value = true
  let statisticsTableData = ref([])
  // 获取当前船舶下的票货数据
  const { data } = await api.getCargoInfo(clickRow.value.id)
  // console.log('票货数据', data)
  // 处理票货数据 保存时与数据库字段对应
  const cargoData = data.map(item => {
    const obj = {
      ...item,
      type: 2,
      cargoInfoId: item.id, //票货ID
      trustId: clickRow.value.id, // 指令ID
    }
    return obj
  })

  // 获取当前船舶下的交接清单
  const { data: handoverData } = await api.getHandoverList(clickRow.value.id)
  // console.log('陆集陆疏交接清单', handoverData)

  // console.log('交接清单', handoverData)
  let cargoInfoIds = ref([])
  cargoData.forEach((item, index) => {
    cargoInfoIds.value.push(item.id);
  })
  handoverData.forEach(items => {
    cargoInfoIds.value.push(items.cargoInfoId);
  })
  let ids = cargoInfoIds.value.map(item => item)
  const { data: tallyData } = await api.getCargoStatistics(ids)
  nextTick(() => {
    statisticsRef.value.statisticsData.quantity = 0;
    statisticsRef.value.statisticsData.ton = 0;
    statisticsRef.value.tableData = ref([]);
    if (handoverData && handoverData.length >= 1) {
      // 合并交接数据和票货数据
      let copyArr = [...cargoData]
      cargoData.forEach((item, index) => {
        handoverData.forEach(items => {
          if (item.id == items.cargoInfoId) {
            copyArr[index] = items
          }
        })
      })
      statisticsTableData = copyArr
    } else {
      statisticsTableData = cargoData
    }
    if (tallyData && tallyData.length >= 1) {
      let quantityCount = 0;
      let tonCount = 0;
      statisticsTableData.forEach((item, index) => {
        tallyData.forEach(items => {
          if (item.cargoInfoId == items.cargoInfoId) {
            /*statisticsTableData[index].tallyQuantity = items.quantity
            statisticsTableData[index].tallyTon = items.ton*/
            statisticsTableData[index].tallyZqQuantity = items.zqQuantity
            statisticsTableData[index].tallyZqTon = items.zqTon
            statisticsTableData[index].tallyZyQuantity = items.zyQuantity
            statisticsTableData[index].tallyZyTon = items.zyTon
            statisticsTableData[index].tallyAllQuantity = items.quantity
            statisticsTableData[index].tallyAllTon = items.ton
            quantityCount = quantityCount + Number(items.zqQuantity) + Number(items.zyQuantity)
            //tonCount = (tonCount + Number(items.zqTon) + Number(items.zyTon)).toFixed(3)
            tonCount = (parseFloat(tonCount) + parseFloat(Number(items.zqTon)) + parseFloat(Number(items.zyTon)))
          }
        })

        if (statisticsTableData[index].quantity != undefined
          && statisticsTableData[index].tallyZqQuantity != undefined
          && statisticsTableData[index].tallyZyQuantity != undefined) {
          statisticsTableData[index].remainderQuantity =
            Number(statisticsTableData[index].quantity) - Number(statisticsTableData[index].tallyZqQuantity)
            - Number(statisticsTableData[index].tallyZyQuantity)
        }
        if (statisticsTableData[index].ton != undefined
          && statisticsTableData[index].tallyZqTon != undefined
          && statisticsTableData[index].tallyZyTon != undefined) {
          /*statisticsTableData[index].remainderTon =
            (Number(statisticsTableData[index].ton) - Number(statisticsTableData[index].tallyZqTon)
            - Number(statisticsTableData[index].tallyZyTon)).toFixed(3)*/
          statisticsTableData[index].remainderTon =
            (parseFloat(Number(statisticsTableData[index].ton)) - parseFloat(Number(statisticsTableData[index].tallyZqTon))
              - parseFloat(Number(statisticsTableData[index].tallyZyTon)))
        }
      })
      statisticsRef.value.statisticsData.quantity = quantityCount
      statisticsRef.value.statisticsData.ton = tonCount
    }
    statisticsRef.value.tableData = statisticsTableData
  })

}

// 票货保存
const save = async () => {
	if (await drawerRef.value.validate()) {
		const params = drawerRef.value.tableData.filter(item => {
			if (item.quantity || item.ton || item.ticketNum) {
				return item
			}
		})
		let data = {
			fileIds: [],
			handoverlists: [...params],
		}
		// console.log('陆集陆疏保存', data)
		// return
		proxy.$modal.confirm('确定保存？').then(() => {
			api.busHandoverList(data).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess('提交成功')
					drawerVisible.value = false
					getList(queryParams.value)
				}
			})
		})
	}
}

/** 初始化数据 */

getList(queryParams.value)
</script>
<style lang="less" scoped>
// @import "../../../assets/styles/searchform.scss";
</style>
