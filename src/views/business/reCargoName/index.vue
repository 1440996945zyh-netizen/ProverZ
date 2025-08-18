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
					:cellClickEvent="cellClickEvent"
					:loading="loading"
					:total="total"
				/>
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="drawerVisible" :title="title" size="40%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="system">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/business/reCargoName/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

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
	{ prop: 'cargoCategoryName', label: '货种名称' },
	{ prop: 'cargoName', label: '货物名称' },
	{ prop: 'sign', label: '货物标识码' },
	{
		prop: '',
		label: '操作',
		width: 'operate',
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'reCargoName:system:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
			]
		},
	},
])
const selectData = reactive([
	{
		name: '货种名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'cargoCategoryName', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '货名', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'cargoName', // 绑定字段
		span: 12, // 占位，共24
	},
])
const buttonList = reactive([])
const drawerVisible = ref(false)


const clickRow = ref({})

// 点击查询的事件
const getList = e => {
	queryParams.value =e
	loading.value = true
	api.getList(queryParams.value).then(res => {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
			loading.value = false
	})
}

// 编辑事件
const edit = row => {
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
    detailRef.value.formData.cargoCategoryCode = editRow.cargoCategoryCode
    detailRef.value.formData.cargoCode = editRow.cargoCode
    detailRef.value.formData.oldCargoName = editRow.cargoName
    detailRef.value.formData.sign = editRow.sign
	})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = {
			...detailRef.value.formData,
		}
		proxy.$modal.confirm('本次修改将同步修改掉该货名相关的所有历史数据，是否确认修改？\n' +
      '修改完成后请到相关常用功能进行查询确认！').then(() => {
      api.update(params).then(res => {
        proxy.$modal.msgSuccess('修改成功')
        drawerVisible.value = false
        getList(queryParams.value)
      })
		})
	}
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
getList(queryParams.value)
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
