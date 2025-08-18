<template>
	<BaseTable
		size="65%"
		ref="baseTable"
		:showSearchHeader="true"
		:selectData="selectData"
		:searchClick="getList"
		:buttonList="buttonList"
		:tableColumns="tableColumns"
		:tableData="tableData"
		:cellClickEvent="cellClickEvent"
		:total="total"
    :showNum="2"
	/>
	<el-drawer v-model="cargoVisible" :title="title" size="30%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="cargoVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="inOutwareHq">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/produce/inOutwareHq/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import {ElButton, ElSwitch, ElTag} from 'element-plus'
const title = ref(null)
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const cargoVisible = ref(false)
const detailRef = ref(null) // 明细组件ref
// 检索框
const selectData = reactive([
  {
    // name: '起止日期',
    type: 'daterange',
    modelValue: 'date', //对应字段
    span: 16,
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
	{
		name: '票货号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'cargoInfoNo', // 绑定字段
		span: 8, // 占位，共24
	},
  {
    name: '海清货物名称', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span: 3, // 占位，共24
  },
  {
		name: '喷漆编码', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'pqNo', // 绑定字段
		span: 3, // 占位，共24
	},
])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	// cargoCategoryCode: '03000003',
})
const total = ref(0) // 数据总数
// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
  queryParams.value.beginDate = queryParams.value.date ? queryParams.value.date[0] : ''
  queryParams.value.endDate = queryParams.value.date ? queryParams.value.date[1] : ''
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
const buttonList = reactive([
	/*{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'master:hqStorageStack:add', // 权限
	},*/
  {
		label: '导出', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => exportExcel, // 回调函数
		permission: 'produce:inOutwareHq:export', // 权限
	},
])
// 新增事件
const add = () => {
	cargoVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formData.id = '' // 新增清空id
	})
}
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '作业时间', prop: 'createTime',align: "center" , width: 150  },
	{ label: '货主', prop: 'cargoOwnerName',align: "center" , width: 230 },
	{ label: '计划号', prop: 'planNo',align: "center", width: 200 },
	{ label: '票货编号', prop: 'cargoInfoNo',align: "center", width: 130 },
	{ label: '货物名称', prop: 'cargoName',align: "center", width: 120 },
	{ label: '海清货名', prop: 'hqCargoName',align: "center", width: 120 },
	{ label: '喷码编号', prop: 'pqNo',align: "center", width: 130 },
	{ label: '件数', prop: 'quantity',align: "center", width: 100 },
	{ label: '吨数', prop: 'ton',align: "center", width: 100 },
	{ label: '长(m)', prop: 'hqLength',align: "center" , width: 100},
	{ label: '宽(m)', prop: 'width',align: "center", width: 100 },
	{ label: '高(m)', prop: 'height',align: "center", width: 100 },
	{ label: '立方量(m^3)', prop: 'volume',align: "center", width: 100 },
	{ label: '区域', prop: 'stackPositionName',align: "center" , width: 200},
	{ label: '垛位', prop: 'yardName',align: "center", width: 100 },
	{ label: '车牌号', prop: 'transportEquipmentNo',align: "center", width: 200 },
	{ label: '皮重', prop: 'weightSelf',align: "center", width: 100 },
	{ label: '毛重', prop: 'weightAll',align: "center" , width: 100},
	{ label: '净重', prop: 'weightGoods',align: "center", width: 100 },
	{ label: '进港日期', prop: 'weighInDt',align: "center", width: 200 },
	{ label: '出港日期', prop: 'weighOutDt',align: "center", width: 200 },
	{ label: '理货员', prop: 'createByName',align: "center", width: 200 },
  {
    label: '出入库状态',
    prop: 'status',
    width: 120,
    align: 'center',
    fixed:'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '01' ? 'success' : row.status == '02' ? 'primary' : 'info'
          },
          {
            default: () => (row.status == '10' ? '入库' : row.status == '20' ? '出库' : row.status == '0' ? '未入库' : '')
          }
        )
      ]
    }
  },
  { label: '入库人', prop: 'inPortName',align: "center", width: 100 },
  { label: '入库时间', prop: 'inPortTime',align: "center", width: 150 },
  { label: '卸船船名航次', prop: 'inShipVoyage',align: "center", width: 150 },
  { label: '出库人', prop: 'outPortName',align: "center", width: 100 },
  { label: '出库时间', prop: 'outPortTime',align: "center", width: 150 },
  { label: '装船船名航次', prop: 'outShipVoyage',align: "center", width: 150 },
  /*	{
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
                console.log(row)
                edit(row)
              },
              type: 'primary',
              link: true,
              icon: 'Edit',
              permission: 'master:cargo:update',
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
              permission: 'master:cargo:delete',
            },
            {
              default: () => '删除',
            }
          ),
        ]
      },
    },*/
])

const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '编辑'
	cargoVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getById(editRow.id).then(res => {
			console.log(res.data)
			proxy.setFormData(detailRef.value.formData, res.data)
		})

		console.log(editRow, 'edit')
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(() => {
			api.delete(deleteRow.id).then(res => {
				getList(queryParams.value)
				proxy.$modal.msgSuccess(res.msg)
			})
		})
		.catch(() => {})
	console.log('delete', deleteRow)
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData))
		proxy.$modal.confirm('确定保存？').then(() => {
			console.log('货物数据保存', params)
			if (params.id) {
				api.update(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					cargoVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insert(params).then(res => {
					console.log('新增货物名称', res)
					proxy.$modal.msgSuccess(res.msg)
					cargoVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
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
const exportExcel =()=>{
  api.exportExcel(queryParams.value).then(res => {
    downLoadBlob(res, '海清出入库')
  })
}

const init = async () => {
  await api.getCurrentShift().then(res => {
    console.log('默认时间日期', res)
    nextTick(() => {
      proxy.$bus.emit('setInitSearchData', {
        // beginDate: res.data.workDate.slice(0, -2).concat('01'),
        // endDate: res.data.workDate,
        date: [res.data.workDate.slice(0, -2).concat('01'), res.data.workDate],
      })
      queryParams.value.date = [res.data.workDate.slice(0, -2).concat('01'), res.data.workDate]

      getList(queryParams.value)
    })
  })
}
init()
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
