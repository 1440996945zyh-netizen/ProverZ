<template>
  <div class="app-container">
    <BaseTable
	  	ref="baseTable"
	  	:showSearchHeader="true"
	  	:selectData="selectData"
	  	:searchClick="getList"
	  	:buttonList="buttonList"
	  	:tableColumns="tableColumns"
	  	:tableData="tableData"
	  	:total="total"
	  />
		<!-- 点检计划 -->
  	<el-drawer v-model="isShow" title="计划" size="70%">
			<detail ref="viewRef" />
  	  <template #footer>
				<div style="flex: auto">
					<el-button @click="isShow = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
		<!-- 任务明细 -->
		<el-drawer v-model="isShowDetail" title="任务明细" size="50%">
			<taskDetail ref="detailRef" />
  	  <template #footer>
				<div style="flex: auto">
					<el-button @click="isShowDetail = false">取消</el-button>
				</div>
			</template>
		</el-drawer>
  </div>
</template>
<script setup name="inspectionPlan">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/equipment/inspectionPlan/index'
import { ref, reactive, nextTick, h, getCurrentInstance, computed } from 'vue'
import { ElButton, ElTag, ElMessage } from 'element-plus'
import detail from './detail/index.vue'
import taskDetail from './detail/taskDetail.vue'
import publicApi from '@/api/public/index'
const { proxy } = getCurrentInstance()

const selectData = reactive([
  {
		name: '设备小类',
		type: 'select',
		modelValue: 'equipSmallCategoryId',
		dataConfig: {
			params: {
				type: 'EQUIP_TYPE',
				categoryLevel: '3'
			},
		},
		span: 8,
	},
	{
		name: '类型',
		type: 'select',
		modelValue: 'equipType',
		selectData: [
			{ label: '日', value: '1' },
			{ label: '周', value: '2' },
			{ label: '月', value: '3' },
			{ label: '年', value: '4' },
			{ label: '运行台时', value: '5' },
			{ label: '里程', value: '6' },
		],
		span: 8,
	},
  {
		name: '设备名称',
		type: 'input',
		modelValue: 'equipName',
		span: 8,
	},
])
const buttonList = ref([
  {
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'equipment:inspectionPlan:add',
	},
])
const total = ref(0)
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
const tableData = ref([])
const tableColumns = reactive([
  { label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
  { label: '设备小类', prop: 'equipSmallCategoryName', },
	{ label: '设备名称', prop: 'equipName', },
	{ 
    label: '类型', 
    prop: 'equipType', 
    render: row => {
			return [
				h(
					'span',
          {},
					{
						default: () => equipTypeChange(row),
					}
				),
			]
		},
  },
	{ label: '初始日期', prop: 'initialDate',  },
	{ label: '最近生成任务日期', prop: 'recentlyTaskDate', width: 160  },
	{ label: '初始数据', prop: 'initialNumber', align: 'right' },
	{ 
    label: '是否单次', 
    prop: 'isSingle',
    render: row => {
			return [
				h(
					'span',
          {},
					{
						default: () => row.isSingle == '1' ? '是' : '否',
					}
				),
			]
		}, 
  },
	{ label: '点检周期', prop: 'cycle', align: 'right' },
	{ label: '点检时限（天）', prop: 'timeLimit', align: 'right', width:140 },
	{ label: '点检员', prop: 'inspectorName' },
  {
		prop: '',
		label: '操作',
		width: 150,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleUpdate(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'equipment:inspectionPlan:update',
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
						permission: 'equipment:inspectionPlan:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
// 查询主列表
const getList = e => {
	queryParams.value = e
  api.getList(queryParams.value).then(res => {
    tableData.value = res.data.pages 
    total.value = res.data.totalNum
  })
}
// 抽屉Ref
const viewRef = ref(null)
const isShow = ref(false)
// 类型change事件
const equipTypeChange = e => {
	if (e) {
		switch (e.equipType) {
			case '1':
				return '日';
				break;
			case '2':
				return '周（周'+e.setDate+'）';
				break;
			case '3':
				return '月（'+e.setDate+'号）';
				break;
			case '4':
				return '年';
				break;
			case '5':
				return '运行台时';
				break;
			case '6':
				return '里程';
				break;
			default:
				'日'
		}
	} else {
		return '日'
	}
}
// 添加
const add = () => {
  isShow.value = true
  nextTick(() => {
    viewRef.value.resetForm()
  })
}
// 保存
const save = async () => {
  if (await viewRef.value.validate()){
    const params = JSON.parse(JSON.stringify(viewRef.value.formData))
    if (params.setDate) {
			if (params.setDate.length > 1) {
				return proxy.$message.warning('选择天只能勾选一个复选框')
			}
      params.setDate = params.setDate.join(",")
    }
		if (!viewRef.value.tableData || viewRef.value.tableData.length==0) {
			return proxy.$message.warning('请选择点检标准')
		}
		params.itemList = viewRef.value.tableData
		params.itemList.forEach(v => {
			if (!v.standardId)
				v.standardId = v.id
		})
    proxy.$modal.confirm("确认保存？").then(res => {
      if (params.id) {
        api.update(params).then(res => {
          isShow.value = false
          proxy.$message.success(res.msg)
          getList(queryParams.value)
        })
      } else {
        api.add(params).then(res => {
          isShow.value = false
          proxy.$message.success(res.msg)
          getList(queryParams.value)
        })
      }
    })
  }
}
// 编辑
const handleUpdate = (row) => {
  isShow.value = true
  nextTick(() => {
    viewRef.value.resetForm()
    api.getById({id: row.id}).then(res => {
      viewRef.value.formData = JSON.parse(JSON.stringify(res.data))
			if (viewRef.value.formData.setDate)
				viewRef.value.formData.setDate = viewRef.value.formData.setDate.split(',')
			viewRef.value.getMacTypeList(res.data.equipSmallCategoryId)
			viewRef.value.formData.equipId = res.data.equipId
			viewRef.value.formData.equipName = res.data.equipName
			viewRef.value.tableData = res.data.itemList
    })
  })
}
// 删除
const handleDelete = (row) => {
  proxy.$modal.confirm("确认删除？").then(res => {
    api.delete({id: row.id}).then(res => {
      proxy.$message.success(res.msg)
      getList(queryParams.value)
    })
  })
}
// 任务明细
const isShowDetail = ref(false)
const detailRef = ref(null)
const handleTaskDetail = row => {
	isShowDetail.value = true
	nextTick(() => {
		detailRef.value.equipPlanId = row.id
		detailRef.value.getList()
	})
}

getList(queryParams.value)
</script>

<style>

</style>