<template>
	<div class="app-container">
		<div class="selectBox">
			<div></div>
			<div>
				<el-button v-hasPermi="['system:parameter:query']" type="primary" icon="Search" @click="handleQuery">刷新</el-button>
				<el-button v-hasPermi="['system:parameter:save']" type="primary" icon="CircleCheck" @click="doSave">保存</el-button>
        <el-button v-hasPermi="['system:parameter:save']" type="primary" icon="Check" @click="checkLog">日志</el-button>
      </div>
		</div>
		<EditTable
			ref="editTableRef"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:border="true"
			:rowClassName="rowClassName"
			:rowConfig="rowConfig"
			:radioConfig="radioConfig"
			:exportConfig="exportConfig"
			:editRules="editRules"
			:showFooter="true"
			:tableHeight="'normalTableHeight'"
			:hasAdd="true"
		/>
    <Drawer v-model="parameterLogVis" :title="'日志查看'" size="70%">
      <parameterLogDetail ref="parameterLogDetailRef" />
      <template #footer>
        <div>
          <el-button @click="parameterLogVis = false">取消</el-button>
        </div>
      </template>
    </Drawer>
	</div>
</template>

<script setup name="parameter">
import EditTable from '@/components/EditTable/index.vue'
import { ElButton } from 'element-plus'
import api from '@/api/system/parameter/index.js'
import parameterLogDetail from '@/views/system/parameter/parameterLogDetail/index'
import {ref} from "vue";
import Drawer from '@/components/Drawer/index.vue'
const editConfig = reactive({ trigger: 'click', mode: 'cell' })
const radioConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	checkMethod: ({ row }) => {
		// 返回可选的单选框
		return row.age > 26
	},
	checkRowKey: 10003, // 默认选项，需要在row.config中设置keyField
}
const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'row_id' }
const rowClassName = i => {
	if ([2, 3, 5].includes(i.rowIndex)) {
		return 'row-green'
	}
	return null
}
const exportConfig = {}
const { proxy } = getCurrentInstance()
const parameterLogVis = ref(false)
const parameterLogDetailRef = ref(null)
const tableColumns = reactive([
	{ prop: 'paramCd', label: '参数编号', width: 250, editType: 'input', editRender: {}, align: 'left' },
	{ prop: 'paramNm', label: '参数名称', width: 250, editType: 'input', editRender: {}, align: 'left' },
	{ prop: 'paramVal', label: '参数值', width: 250, editType: 'input', editRender: {}, align: 'left' },
	{ prop: 'remark', label: '备注', editType: 'input', editRender: {}, align: 'left' },
	{
		prop: 'delete',
		label: '添加',
		align: 'center',
		fixed: 'right',
		width: 100,
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
const tableData = ref([])

/** 查询参数列表 */
const getList = e => {
	api.listConfig({flag:2}).then(response => {
		tableData.value = response.data
	})
}
/** 刷新操作 */
const handleQuery = e => {
	getList()
}

const editRules = reactive({
	paramCd: proxy.getRules({
		required: true,
		length: '1-50',
	}),
	paramNm: proxy.getRules({
		required: true,
		length: '1-50',
	}),
	paramVal: proxy.getRules({
		required: true,
		length: '1-50',
	}),
	remark: proxy.getRules({
		length: '1-200',
	}),
})
const editTableRef = ref()
/** 保存按钮 */
const doSave = async () => {
	if (await editTableRef.value.validAllEvent()) {
		proxy.$modal.confirm('确定保存？').then(function () {
			api.listSave(tableData.value).then(response => {
				getList()
				proxy.$modal.msgSuccess(response.msg)
			})
		})
	}
}

const checkLog = () => {
  parameterLogVis.value = true
  api.checkParLog({flag:2}).then(res => {
    parameterLogDetailRef.value.tableData =res.data
  })
}
/** 删除按钮操作 */
/*const handleDelete = row => {
	tableData.value.forEach((item, index) => {
		// 根据表格自动生成的唯一标识删除，字段名在rowConfig中指定
		if (item.row_id == row.row_id) {
			tableData.value.splice(index, 1)
			return
		}
	})
}*/
const handleDelete = row => {
  if(row.id == null) {
    tableData.value.forEach((item, index) => {
      // 根据表格自动生成的唯一标识删除，字段名在rowConfig中指定
      if (item.row_id == row.row_id) {
        tableData.value.splice(index, 1)
        return
      }
    })
  }else {
    proxy.$modal.confirm('确定删除？').then(() => {
      api.delete(row.id).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('删除成功')
          getList()
        }
      })
    })
  }
}

getList()
</script>
<style lang="less" scoped>
@import '../../../assets/styles/searchform.scss';
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
