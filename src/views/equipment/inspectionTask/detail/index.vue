<template>
  <div>
    <BaseTable
      ref="baseTable"
      :showSearchHeader="false"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :tableHeight="'pageTableHeight'"
      :total="total"
    />
		<el-dialog v-model="dialogVisible" title="图片查看" width="50%">
			<el-image
  		  v-for="(item, index) in imgurl"
				:src="item"
				:key="index"
				loading="lazy"
				fit
				:preview-src-list="imgurl"
				style="width:49%;height:auto"
  		/>
			<template #footer>
  	    <span class="dialog-footer">
  	      <el-button @click="dialogVisible = false">关闭</el-button>
  	    </span>
  	  </template>
  	</el-dialog>
  </div>
</template>

<script setup>
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/equipment/inspectionTask/index'
import publicapi from '@/api/public/index'
import { ElButton, ElSwitch, ElTag } from 'element-plus'

const baseTable = ref(null)
const total = ref(0)
const taskId = ref(null)
const tableData = ref([])
const tableColumns = reactive([
  { label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
  { label: '使用部门', prop: 'deptName', width: 100 },
  { label: '设备机构', prop: 'equipInstitutionName', minWidth:100 },
	{ label: '设备部件', prop: 'equipUnitName', minWidth:100 },
	{ label: '点检内容', prop: 'content', minWidth:120 },
	{ label: '点检标准', prop: 'standard', minWidth:120 },
	{ label: '点检员', prop: 'inspectorName', minWidth:80 },
	{
    label: '点检状态',
    prop: 'status',
		align: 'center',
		width: 100,
    render: row => {
			return [
				h(
					ElTag,
          {
            type: row.status == '1' ? 'success' : 'info',
          },
					{
						default: () => row.status == '1' ? '已点检' : '未点检',
					}
				),
			]
		},
  },
	{
		label: '是否异常',
		prop: 'isAbnormal',
		align: 'center',
		width: 100,
    render: row => {
			return [
				h(
					ElTag,
          {
            type: row.isAbnormal == '1' ? 'danger' : row.isAbnormal == '2' ? 'success' : 'info',
          },
					{
						default: () => row.isAbnormal == '1' ? '异常' : row.isAbnormal == '2' ? '正常' : '未点检',
					}
				),
			]
		},
	},
	{
		label: '是否报修',
		prop: 'isRepair',
		align: 'center',
		width: 100,
    render: row => {
			return [
				h(
					ElTag,
          {
            type: row.isRepair == '1' ? 'danger' : 'info',
          },
					{
						default: () => row.isRepair == '1' ? '已报修' : '未报修',
					}
				),
			]
		},
	},
	{ label: '备注', prop: 'remark',minWidth: 100 },
	{
		label: '图片',
		width: 100,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							look(row)
						},
						type: 'primary',
						link: true,
						icon: 'Picture',
					},
					{
						default: () => '查看',
					}
				),
			]
		},
	},
])
// 类型change事件
const equipTypeChange = e => {
	if (e) {
		switch (e.equipType) {
			case '1':
				return '天';
				break;
			case '2':
				return '周';
				break;
			case '3':
				return '月';
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
				'天'
		}
	} else {
		return '天'
	}
}
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
const getList = e => {
  queryParams.value.id = taskId.value
  api.getById(queryParams.value).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
  })
}
const imgurl = ref([])
const dialogVisible = ref(false)
// 查看图片
const look = row => {
	dialogVisible.value = true
	imgurl.value = []
	const fileIds = row.fileIds?row.fileIds.split(','):[]
	fileIds.forEach(item => {
		publicapi.down(item).then(res => {
			const blob = new Blob([res.data], {
				type: 'application/png;charset=utf-8',
			})
			const url = window.URL.createObjectURL(blob)
			imgurl.value.push(url)
		})
	})
}

defineExpose({
	getList,
  taskId
})
</script>

<style>

</style>
