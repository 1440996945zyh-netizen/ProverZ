<template>
	<BaseTable
		border
		:tableData="tableData"
		:tableColumns="tableColumns"
		:tableHeight="400"
		syncResize
		:spanMethod="spanMethod"
		:cellClickEvent="cellClickEvent"
	/>
</template>

<script setup name="Index">
import { onMounted, getCurrentInstance, nextTick } from 'vue'
import publicApi from '@/api/public'
import BaseTable from '@/components/BaseTable'
import api from '@/api/system/user'
import { ElProgress, ElTag, ElImage } from 'element-plus'
import star from '../../../../assets/icons/star.png'
import fullStar from '../../../../assets/icons/full-star.png'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const getProject = () => {
	api.getProjectList().then(res => {
		tableData.value = res.data
	})
}
getProject()
const tableData = ref([])
const tableColumns = ref([
	{ type: 'seq', width: 60, align: 'center' },
	{
		label: '项目名称',
		prop: 'projectShortName',
		minWidth: 130,
		align: 'left',
		filters: [],
		filterMethod: ({ option, row }) => {
			return row.projectShortName === option.label
		},
		noSlot: true,
		filterMultiple: true,
	},
	{
		label: '项目经理',
		prop: 'manageUserName',
		width: 100,
		align: 'center',
		filters: [],
		filterMethod: ({ option, row }) => {
			return row.manageUserName === option.label
		},
		noSlot: true,
		filterMultiple: true,
	},
	{
		label: '总体开发进度',
		prop: 'progress',
		width: 140,
		align: 'center',
		filters: [
		{ label: '进度=100', value: [100, 100] },
		{ label: '50≤进度<100', value: [50, 99] },
		{ label: '0≤进度<50', value: [0, 49] },
		],
		filterMethod: ({ option, row }) => {
			return row.progress * 1 <= option.value[1] && row.progress * 1 >= option.value[0]
		},
		noSlot: true,
		render: row => {
			return [
				h(
					ElProgress,
					{
						percentage: row.progress ? row.progress : 0,
						strokeWidth: 15,
						textInside: true,
						status: Number(row.progress) == 100 ? 'success' : '',
						strokeWidth: 16,
					},
					{
						default: () => (row.progress ? row.progress + '%' : 0 + '%'),
					}
				),
			]
		},
	},
	{
		label: '当前节点',
		prop: 'statusLabel',
		width: 100,
		align: 'center',
		filters: [],
		filterMethod: ({ option, row }) => {
			return row.statusLabel === option.label
		},
		noSlot: true,
		filterMultiple: true,
	},
	{
		label: '关注',
		prop: 'isCare',
		width: 100,
		align: 'center',
		render: row => {
			return [
				h(
					ElImage,
					{
						src: getStarImg(row.isCare) ,
						// row.isCare == '0' ? '../../../../assets/icons/star.png' : '../../../../assets/icons/full-star.png',
						style: 'width: 20px;height: 20px;cursor:pointer',
						onClick: () => {
							setFollow(row) // 调用跳转函数，并传入当前行数据
						},
					},
					{
						default: () => '',
					}
				),
			]
		},
	},
])
const getStarImg =isCare => {
	if (isCare == '0') {
		return star
	} else {
		return fullStar
	}
}
// 设置关注/取消关注
const setFollow = row => {
// 	const title = row.isCare == '0' ? '关注?' : '取消关注?'
// 	proxy.$modal.confirm('确定' + title).then(() => {
		if (row.isCare == '0') {
			api.projectCare({ projectId: row.id }).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				getProject()
			})
		} else {
			api.projectNoCare({ projectId: row.id }).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				getProject()
			})
		}
	// })
}
const spanMethod = ({ row, _rowIndex, column, visibleData }) => {
	const fields = ['projectShortName', 'node', 'dutyUserName', 'manageUserName', 'progress', 'statusLabel']
	const cellValue = row[column.field]
	if (cellValue && fields.includes(column.field)) {
		const prevRow = visibleData[_rowIndex - 1]
		let nextRow = visibleData[_rowIndex + 1]
		if (prevRow && prevRow[column.field] === cellValue && prevRow.projectShortName === row.projectShortName) {
			console.log(prevRow, cellValue, _rowIndex, 'prevRow')
			return { rowspan: 0, colspan: 0 }
		} else {
			let countRowspan = 1
			while (nextRow && nextRow[column.field] === cellValue && nextRow.projectShortName === row.projectShortName) {
				nextRow = visibleData[++countRowspan + _rowIndex]
			}
			if (countRowspan > 1) {
				return { rowspan: countRowspan, colspan: 1 }
			}
		}
	}
}
const cellClickEvent = ({ row }) => {
	router.push({
		name: 'planDetailEdit',
		params: {
			progress: row.progress,
			weekPlanId: row.weekPlanId,
			projectId: row.id,
			projectName: row.projectName,
			weekNumber: row.weekNumber,
			type: '编辑',
			manageUserId: row.manageUserId,
			permissions: row.permissions,
			status: row.status,
		},
	})
}
const init = () => {
	publicApi.getLocalSelect({ type: 'USER' }).then(res => {
		tableColumns.value.forEach(i => {
			if (i.prop == 'manageUserName' || i.prop == 'dutyUserName') {
				i.filters = res.data
			}
		})
	})
	publicApi.getLocalSelect({ type: 'PROJECT_SHORT' }).then(res => {
		tableColumns.value.forEach(i => {
			if (i.prop == 'projectShortName') {
				i.filters = res.data
			}
		})
	})
	publicApi.getLocalSelect({ type: 'DICT', dictType: 'PROJECT_PROCESS' }).then(res => {
		tableColumns.value.forEach(i => {
			if (i.prop == 'statusLabel') {
				i.filters = res.data
			}
		})
	})
}
init()
</script>

<style scoped lang="scss">
:deep(.vxe-table--render-default .vxe-body--column.col--ellipsis > .vxe-cell) {
	max-height: unset;
}
:deep(
		.vxe-table--render-default .vxe-body--column.col--ellipsis:not(.col--active) > .vxe-cell,
		.vxe-table--render-default .vxe-footer--column.col--ellipsis:not(.col--active) > .vxe-cell,
		.vxe-table--render-default .vxe-header--column.col--ellipsis:not(.col--active) > .vxe-cell
	) {
	white-space: pre-wrap;
}
:deep(.vxe-cell) {
	font-family: aliy;
	font-weight: 600;
	color: #55565a;
	font-size: 12px;
}
</style>
