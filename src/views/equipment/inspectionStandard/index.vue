<template>
	<div class="app-container">
		<el-row :gutter="20">
			<el-col :span="4">
				<el-input
  			  v-model="filterText"
  			  class="w-60 mb-2"
  			  placeholder="部件"
					clearable
  			/>
  			<el-tree
  			  ref="treeRef"
					style="height:80vh;overflow-y:auto;margin-top: 20px"
  			  :data="treeData"
  			  :props="defaultProps"
  			  default-expand-all
					:highlight-current="true"
					:filter-node-method="filterNode"
					@node-click="treeClick"
  			>
<!--					<template #default="{ node, data }">-->
<!--						<span class="custom-tree-node" style="width: 100%;display:flex;justify-content: space-between;">-->
<!--							<span>{{ data.typeName }}</span>-->
<!--							<span class="tree-node-actions" style="margin-right:5px;">-->
<!--								<el-tag-->
<!--									:type="data.categoryLevel==3?'primary':data.categoryLevel==4?'warning':'success'"-->
<!--									size="small"-->
<!--									round-->
<!--								>-->
<!--									{{getLevelName(data.categoryLevel)}}-->
<!--								</el-tag>-->
<!--							</span>-->
<!--						</span>-->
<!--					</template>-->
				</el-tree>
			</el-col>
			<el-col :span="20">
				<div class="selectBox">
					<div></div>
					<div>
						<el-button v-hasPermi="['equipment:inspectionStandard:save']" type="primary" icon="CircleCheck" @click="doSave">保存</el-button>
    		  </div>
				</div>
				<EditTable
					ref="editTableRef"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:editRules="editRules"
					:border="true"
          :stripe="true"
					:rowConfig="rowConfig"
					:showFooter="true"
					:hasAdd="true"
				/>
			</el-col>
		</el-row>
	</div>
</template>

<script setup name="inspectionStandard">
import { ref, reactive, computed, nextTick, getCurrentInstance, onMounted, toRefs, h, watch } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import EditTable from '@/components/EditTable/index.vue'
import api from '@/api/equipment/inspectionStandard/index'

const { proxy } = getCurrentInstance()
const treeData = ref([])
const filterText = ref('')
const treeRef = ref(null)
const queryParams = ref({
	id: ''
})
const defaultProps = {
  children: 'children',
  label: 'typeName',
}
// 获取级别名称
const getLevelName = level => {
	const levelMap = {
		1: '设备大类',
		2: '设备中类',
		3: '设备小类',
		4: '设备机构',
		5: '设备部件',
	}
	return levelMap[level] || ''
}
/** 根据名称筛选分组树 */
watch(filterText, val => {
	if (treeRef.value) {
		treeRef.value.filter(val)
	}
})
/** 根据名称筛选分组树 */
const filterNode = (value, data) => {
	if (!value) return true
	return data.typeName.indexOf(value) !== -1
}
// 获取TREE
const queryTree = () => {
	api.partsTree().then(res => {
		treeData.value = res.data
		treeRowInfo.value = null
	})
}

const tableData = ref([])
const treeRowInfo = ref(null)
// 节点点击事件
const treeClick = e => {
	if (e.categoryLevel == '5') {
		treeRowInfo.value = e
		getList(e)
	}
}
// 获取内容
const getList = e => {
	api.queryByUnitId({equipUnitId: e.id}).then(res => {
		tableData.value = res.data
	})
}
const editRules = ref({
	equipType: [{ required: true, message: '类型必须填写' }],
	content: [{ required: true, message: '点检内容必须填写' }],
	standard: [{ required: true, message: '点检标准必须填写' }],
})
const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'row_id' }
const tableColumns = reactive([
	{
		prop: 'equipType',
		label: '类型',
		width: 100,
		editRender: {},
		editType: 'select',
		selectData: [
			{ label: '日', value: '1' },
			{ label: '周', value: '2' },
			{ label: '月', value: '3' },
			{ label: '年', value: '4' },
			{ label: '运行台时', value: '5' },
			{ label: '里程', value: '6' },
		]
	},
	{ prop: 'content', label: '点检内容', editType: 'input', editRender: {}, align: 'left' },
	{ prop: 'standard', label: '点检标准', editType: 'input', editRender: {}, align: 'left' },
	{
		prop: 'delete',
		label: '添加',
		align: 'center',
		fixed: 'right',
		width: 80,
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
            permission: 'system:parameter:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
// 删除
const handleDelete = e => {
	tableData.value.forEach((item, index) => {
    // 根据表格自动生成的唯一标识删除，字段名在rowConfig中指定
    if (item.row_id == e.row_id) {
      console.log(item)
      tableData.value.splice(index, 1)
    }
  })
}
const editTableRef = ref(null)
const validate = async () => {
	const flag = await editTableRef.value.validAllEvent()
	return flag
}
// 保存
const doSave = async () => {
	if (tableData.value.length == 0) {
		return proxy.$message.warning("请录入节点内容及标准")
	}
	if (treeRowInfo.value == null) {
		return proxy.$message.warning("请选择设备部件类型录入")
	}
	let params = {
		equipUnitId: treeRowInfo.value.id,
		equipUnitName: treeRowInfo.value.typeName,
		list: tableData.value
	}
	if (await validate()) {
		proxy.$modal.confirm('确定保存？').then(() => {
			api.save(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
			})
		})
	}
}

queryTree()
</script>

<style lang="scss" scoped>
.app-container {
	padding: 20px;
}
.selectBox {
	display: flex;
	justify-content: space-between;
	align-content: center;
	height: 40px;
	margin: 8px 0;
	padding-right: 5px;
	.left {
		width: 0%;
	}
	.right {
		width: 100%;
		justify-content: flex-end;
	}
}
</style>
