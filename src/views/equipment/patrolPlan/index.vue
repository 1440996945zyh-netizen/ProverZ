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
	
  </div>
</template>
<script setup name="patrolPlan">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/equipment/patrolPlan/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import detail from './detail/index.vue'
const { proxy } = getCurrentInstance()

const selectData = reactive([
  {
		name: '巡检名称',
		type: 'input',
		modelValue: 'planName',
		span: 8,
	},
	{
		name: '类型',
		type: 'select',
		modelValue: 'patrolType',
		selectData: [
			{ label: '日', value: '1' },
			{ label: '周', value: '2' },
			{ label: '月', value: '3' },
			{ label: '年', value: '4' }
		],
		span: 8,
	},
  {
		name: '巡检编号',
		type: 'input',
		modelValue: 'planCode',
		span: 8,
	},
])
const buttonList = ref([
  {
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'equipment:patrolPlan:add',
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
  { label: '巡检计划编号', prop: 'planCode', },
	{ label: '巡检计划名称', prop: 'planName', },
	{ 
    label: '类型', 
    prop: 'patrolType', 
    render: row => {
			return [
				h(
					'span',
          {},
					{
						default: () => patrolTypeChange(row),
					}
				),
			]
		},
  },
	{ label: '初始日期', prop: 'initialDate',  },
	{ label: '最近生成任务日期', prop: 'recentlyTaskDate', width: 160  },
	{ label: '点检时限（天）', prop: 'timeLimit', align: 'right', width:140 },
	{ 
    label: '是否单次', 
    prop: 'isSingle',
    render: row => {
			return [
				h(
					'span',
          {},
					{
						default: () => row.status == '1' ? '是' : '否',
					}
				),
			]
		}, 
  },
  { 
    label: '是否生效', 
    prop: 'status',
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
	{ label: '点检员', prop: 'patrolName' },
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
						permission: 'equipment:patrolPlan:update',
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
						permission: 'equipment:patrolPlan:delete',
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
const patrolTypeChange = e => {
	if (e) {
		switch (e.patrolType) {
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
				return '年（'+e.setDate+'月）';
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
				return proxy.$message.warning('选择日期时只能勾选一个复选框')
			}
      params.setDate = params.setDate.join(",")
    }
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
			viewRef.value.formData.planCode = res.data.planCode
			viewRef.value.formData.planName = res.data.planName
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
getList(queryParams.value)
</script>

<style>

</style>
