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
      :html-content="collectHtml"
		/>
		<!-- 交接清单明细 -->
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

<script setup name="handoverList">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/handoverList/index.js'
import drawer from './drawer/index.vue'
import statistics from './statistics/index.vue'
import math from '@/utils/math.js'
import { ref, reactive, toRefs } from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()
const drawerVisible = ref(false) //新增修改抽屉
const total = ref(0)
const drawerRef = ref(null) // 明细组件ref
const clickRow = ref({}) //点击当前行

let statisticsVisible = ref(false) //新增修改抽屉
const statisticsRef = ref(null) // 明细组件ref
const collectHtml = ref(`<p>Hello, <strong>Vue 3</strong>!</p>`)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  	{ label: '序号', type: 'seq', width: 50,align: 'center' },
  	{ label: '船名航次', prop: 'shipNameVoyage'},
	{ label: '货种', prop: 'cargoCategoryName', width: 130 },
	{ label: '装卸', prop: 'loadUnload', width: 75 },
	{ label: '船代名称', prop: 'customerName'},
  	{ label: '交接量', prop: 'handoverlistTon', width: 130},
	{ label: '靠泊时间', prop: 'berthTime', isTime: true, width: 150  },
	{ label: '离泊时间', prop: 'leaveBerthTime', isTime: true, width: 150  },
	{
		label: '状态',
		prop: 'isHaveHandoverlistLabel',
		align: 'center',
		width: 100,
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
	/*{
		name: '船名航次',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'shipvoyageItemId', //对应字段
		span: 12,
		dataType: 'VOYAGE',
	},*/
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
		name: '船舶状态',
		type: 'select',
		modelValue: 'shipStatusCode', //对应字段
		span: 8,
		dataConfig: {
			url: '/api/internal/public/getDictListByType/SHIPSTATUS',
		},
	},
  {
    name: '票货号',
    type: 'input', // 搜索框类型
    modelValue: 'cargoInfoNo', // 绑定字段
    span:3,
  },
  {
    name: '离港时间起始', //日期搜索
    type: 'date', //搜索框类型
    modelValue: 'beginLeavePortTime', //绑定字段
    span: 3, //占位多少，总共24
  },
  {
    name: '离港时间截至', //日期搜索
    type: 'date', //搜索框类型
    modelValue: 'endLeavePortTime', //绑定字段
    span: 3, //占位多少，总共24
  },
  {
    name: '船代名称', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'customerId', // 绑定字段
    span: 3, // 占位，共24
    dataType: 'CUSTOMER_ALL',
  },
  {
    name: '货种', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoCategoryName', // 绑定字段
    span: 3, // 占位，共24
  }
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
// const fileIds=ref([])//文件上传
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	buttonList[0].disabled = true
	buttonList[1].disabled = true
  api.getList(e).then(res => {
		// console.log('交接清单', res)
		tableData.value = res.data.pages
		total.value = res.data.totalNum
    api.getAllTon(e).then(res => {
      collectHtml.value = `<p > 总交接量：${res.data}</p>`
    })
	})
}

const handoverList = async () => {
	drawerVisible.value = true
	// const fileIds=clickRow.value.fileIds
	// 获取当前船舶下的票货数据
	const { data } = await api.getCargoInfo(clickRow.value.shipvoyageItemId)
	// console.log('票货数据', data)
	// 处理票货数据 保存时与数据库字段对应
	const cargoData = data.map(item => {
		const obj = {
			...item,
			type: 1,
			cargoInfoId: item.id,
			shipvoyageId: clickRow.value.id,
			shipName: clickRow.value.shipName,
			voyage: clickRow.value.voyage,
			shipvoyageItemId: clickRow.value.shipvoyageItemId,
			tradeType: clickRow.value.tradeTypeLabel,
			loadUnload: clickRow.value.loadUnload,
			quantity: null,
			ton: null,
			ticketNum: null,
		}
		return obj
	})

	// 获取当前船舶下的交接清单
	const { data: handoverData } = await api.getHandoverList(clickRow.value.shipvoyageItemId)
	// console.log('交接清单', handoverData)
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
		drawerRef.value.formData.shipNameVoyage = clickRow.value.shipNameVoyage
		drawerRef.value.formData.cargoCategoryName = clickRow.value.cargoCategoryName
		drawerRef.value.formData.berthTime = clickRow.value.berthTime
		drawerRef.value.formData.leaveBerthTime = clickRow.value.leaveBerthTime
		drawerRef.value.formData.id = clickRow.value.shipvoyageItemId
		drawerRef.value.formData.quantity = 0
		drawerRef.value.formData.ton = 0
		drawerRef.value.formData.ticketNum = 0
		drawerRef.value.tableData.forEach(item => {
			if (Number(item.quantity)) {
				drawerRef.value.formData.quantity = math.numAdd(drawerRef.value.formData.quantity, Number(item.quantity))
			}
			if (Number(item.ton)) {
				drawerRef.value.formData.ton = math.numAdd(drawerRef.value.formData.ton, Number(item.ton))
			}
			if (Number(item.ticketNum)) {
				drawerRef.value.formData.ticketNum = math.numAdd(drawerRef.value.formData.ticketNum, Number(item.ticketNum))
			}
		})
	})
}

const cargoStatistics = async () => {
  statisticsVisible.value = true
  let statisticsTableData = ref([])
  // 获取当前船舶下的票货数据
  const { data } = await api.getCargoInfo(clickRow.value.shipvoyageItemId)
  // console.log('票货数据', data)
  // 处理票货数据 保存时与数据库字段对应
  const cargoData = data.map(item => {
    const obj = {
      ...item,
      type: 1,
      cargoInfoId: item.id,
      shipvoyageId: clickRow.value.id,
      shipName: clickRow.value.shipName,
      voyage: clickRow.value.voyage,
      shipvoyageItemId: clickRow.value.shipvoyageItemId,
      tradeType: clickRow.value.tradeTypeLabel,
      loadUnload: clickRow.value.loadUnload,
    }
    return obj
  })

  // 获取当前船舶下的交接清单
  const { data: handoverData } = await api.getHandoverList(clickRow.value.shipvoyageItemId)
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
          statisticsTableData[index].remainderTon =
            (parseFloat(Number(statisticsTableData[index].ton)) - parseFloat(Number(statisticsTableData[index].tallyZqTon))
            - parseFloat(Number(statisticsTableData[index].tallyZyTon))).toFixed(2)
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
			fileIds: drawerRef.value.formData.fileIds,
			hgFileIds: drawerRef.value.formData.hgFileIds,
			jcFileIds: drawerRef.value.formData.jcFileIds,
			handoverlists: [...params],
		}
		// console.log('交接清单保存', data)
		// return
		proxy.$modal.confirm('确定保存？').then(() => {
			api.busHandoverList(data).then(res => {
				if (res.code === '0000') {
          if(res.data){
            proxy.$modal.msgWarning('票货号'+res.data+'修改失败，已下发疏港通知单无法修改交接清单')
            drawerVisible.value = false
            getList(queryParams.value)
          }else{
            proxy.$modal.msgSuccess('提交成功')
            drawerVisible.value = false
            getList(queryParams.value)
          }

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
