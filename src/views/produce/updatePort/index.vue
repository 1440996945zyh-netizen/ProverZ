<template>
  <div class="app-container">
<!--    <SearchHeader-->
<!--      ref="searchHeaderRef"-->
<!--      :selectData="selectData"-->
<!--      @searchClick="getList"-->
<!--      :buttonList="buttonList"-->
<!--      :showMoreFlag="true"-->
<!--      @changeRemoteSelect="changeRemoteSelect"-->
<!--    />-->
    <BaseTable
      ref="baseTable"
      :showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
      :buttonList="buttonList"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :cellClickEvent="cellClickEvent"
      :checkbox-config="checkboxConfig"
      :selectAllChangeEvent="checkboxChangeEvent"
      @checkbox-change="checkboxChange"
      :loading="loading"
      :total="total"
    />
  </div>
</template>


<script setup name="updatePort">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/updatePort'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import {ElButton, ElTag} from 'element-plus'
import SearchHeader from "@/components/SearchHeader/index.vue";

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const searchForm = reactive({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '', type: 'checkbox', width: 40,fixed: 'left',},
  { prop: 'planNo', label: '计划号', width: 120 },
  { prop: 'cargoInfoNo', label: '票货号', width: 120 },
  { prop: 'unionNo', label: '磅单号', width: 200 },
  { prop: 'workDate', label: '日期', width: 150 },
  { prop: 'className', label: '班次', width: 150 },
  { prop: 'processName', label: '作业过程', width: 120 },
  {  prop: 'cargoName', label: '货物名称', width: 120},
  { prop: 'weighInDt', label: '一次过磅时间', width: 150 },
	{ prop: 'weighOutDt', label: '二次过榜时间', width: 150 },
	{ prop: 'truckPlate', label: '车号', width: 150 },
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
            type: row.portStorageDetailId == null ? 'info'  : '',
          },
          {
            default: () =>
              row.portStorageDetailId == null ? '未更新' : row.portStorageDetailId != null  ? '已更新' : ''
          }
        ),
      ]
    },
  },
])
const selectData = ref([
  {
    name: '货名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '票货号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoInfoNo', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '车号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'truckPlate', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '状态',
    type: 'select',
    modelValue: 'status',
    span: 4,
    selectData: [
      { label: '未更新港存', value: '0' },
      { label: '已更新场存', value: '1' },
    ],
  },
  {
    name: '开始时间', //日期搜索
    type: 'date', //搜索框类型
    modelValue: 'startDate', //绑定字段
    span: 4, //占位多少，总共24
  },
  {
    name: '结束时间', //日期搜索
    type: 'date', //搜索框类型
    modelValue: 'endDate', //绑定字段
    span: 4, //占位多少，总共24
  },
])
const buttonList = reactive([
    {
      label: '更新港存', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
      click: () => updatePorts, // 回调函数
      permission: "produce:updatePort:updatePorts",// 权限
    },
])

const clickRow = ref({})

// 点击查询的事件
const getList = e => {
	// queryParams.value = Object.assign(queryParams.value, e)
	queryParams.value = e
	loading.value = true
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
		loading.value = false
	})
}

const updatePorts = () => {
  if (checkboxList.value.length == 0) {
    proxy.$message.warning('请选择一条数据！')
    return
  }
  let flag = false
  checkboxList.value.forEach(x=>{
    if(x.portStorageDetailId !=null ){
      flag = true
      return
    }
  })
  if(flag){
    proxy.$message.error(clickRow.value.planNo+'已更新，无法再次更新，请取消勾选')
    return
  }
  proxy.$modal.confirm('是否确定更新港存？').then(() => {
    api.update(checkboxList.value).then(res => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess('更新成功')
    })
  }).catch(() => {})
}

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
const checkboxList = ref([])
// 复选事件
const checkboxChangeEvent = data => {
  checkboxList.value = data.records
}
const checkboxChange = data => {
  checkboxList.value = data
}
const init = () => {
  nextTick(() => {
    queryParams.value.status = '0'
    baseTable.value.SearchHeaderRef.searchData.status = '0'
    getList(queryParams.value)
  })

}
init()


</script>
<style lang="scss" scoped>
.box {
	display: flex;
	justify-content: space-between;

	.left {
		width: 254px;
		height: calc(100vh - 85px);
		display: inline-block;
		white-space: nowrap;
		position: relative;
		transition: all 0.3s;

		&.close {
			width: 0px;

			.content {
				display: none;
			}
		}

		.content {
			overflow-x: hidden;
			height: 100%;

			.left-top {
				height: 40px;
				line-height: 40px;
				padding-left: 10px;
				font-size: 14px;
			}

			.shipData {
				width: 100%;
				height: 150px;
				margin-top: 10px;
			}

			.panel {
				width: 100%;
				height: 200px;
			}

			.step {
				height: calc(100vh - 557px);
				padding: 20px;
				box-sizing: border-box;
				margin-top: 14px;

				:deep(.el-timeline-item) {
					left: 50px;

					:deep(.el-timeline-item__wrapper) {
						height: 43px;
					}
				}

				:deep(.el-timeline-item__content) {
					position: relative;
					top: -1px;
					left: -160px;
					text-align: center;
				}

				:deep(.el-timeline-item__timestamp) {
					position: relative;
					top: -25px;
					left: 0px;
				}
			}
		}

		.fold-wrap {
			position: absolute;
			top: 0;
			right: -16px;
			width: 16px;
			height: 100%;
			display: inline-block;
		}

		.btn-fold {
			font-size: 12px;
			background-color: #f5f7fa;
			width: 16px;
			padding: 15px 0;
			position: absolute;
			top: 50%;
			right: 0px;
			transform: translateY(-50%);
			cursor: pointer;
			overflow: hidden;
			opacity: 0.8;
		}

		.btn-fold:hover {
			opacity: 1;
			// transform:scale(1.2);//设置缩放比例
			// transform: translateX(10%);
		}
	}

	.right {
		width: calc(100% - 270px);
		height: 100%;
	}

	.close + .right {
		width: calc(100% - 20px);
	}
}

:deep(.el-tabs__header) {
	margin: 0 0 0;
}
</style>
