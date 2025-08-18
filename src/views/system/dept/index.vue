<template>
	<div class="app-container">
		<div class="search_form percent">
			<el-row>
				<el-col :span="4">
					<el-input
						v-model="queryParams.deptName"
						placeholder="请输入部门名称"
						clearable
						style="width: 200px"
						@keyup.enter="handleQuery"
					/>
				</el-col>
				<el-col :span="4">
					<el-select v-model="queryParams.status" placeholder="部门状态" clearable style="width: 200px">
						<el-option key="1" label="在用" value="1" />
						<el-option key="0" label="停用" value="0" />
					</el-select>
				</el-col>
				<el-col :span="8">
					<el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
					<el-button icon="Refresh" @click="resetQuery">重置</el-button>
				</el-col>
				<el-col :span="8">
					<span class="search_form btnWrapper">
						<el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:dept:add']">新增</el-button>
						<el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
					</span>
				</el-col>
			</el-row>
		</div>
		<el-table
			v-if="refreshTable"
			:data="deptList"
			row-key="id"
			:height="storeHight"
			:default-expand-all="isExpandAll"
			:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
		>
			<el-table-column prop="deptName" label="部门名称" width="400"></el-table-column>
			<el-table-column prop="deptLevel" label="级别">
				<template #default="scope">
					<span>
						{{ scope.row.deptLevelLabel }}
					</span>
				</template>
			</el-table-column>
			<el-table-column prop="inOutType" label="类型" align="center">
				<template #default="scope">
					<span v-if="scope.row.inOutType == 'I'">内部</span>
					<span v-else="scope.row.inOutType == 'O'">外部</span>
				</template>
			</el-table-column>
			<el-table-column prop="status" label="状态" align="center">
				<template #default="scope">
					<el-tag class="ml-2" :type="'1' === scope.row.status ? '' : 'info'">
						{{ '1' === scope.row.status ? '在用' : '停用' }}
					</el-tag>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
				<template #default="scope">
					<el-button size="mini" type="text" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:update']">
						编辑
					</el-button>
					<el-button size="mini" type="text" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:dept:add']">
						新增
					</el-button>
					<el-button
						v-if="scope.row.parentId != 0"
						link
						size="mini"
						type="danger"
						icon="Delete"
						@click="handleDelete(scope.row)"
						v-hasPermi="['system:dept:delete']"
					>
						删除
					</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!-- 添加或修改部门对话框 -->
		<el-drawer :title="title" v-model="open" size="40%" append-to-body>
			<div class="formData">
				<el-form ref="deptRef" :model="form" :rules="rules" label-width="auto">
					<el-row>
						<el-col :span="20" v-if="form.parentId !== '0'">
							<el-form-item label="上级部门" prop="parentId">
								<el-tree-select
									style="width: 100%"
									v-model="form.parentId"
									:data="deptOptions"
									:props="{ value: 'id', label: 'deptName', children: 'children' }"
									value-key="id"
									placeholder="选择上级部门"
									check-strictly
								/>
							</el-form-item>
						</el-col>
						<el-col :span="20">
							<el-form-item label="部门编号" prop="deptCode">
								<el-input v-model="form.deptCode" placeholder="请输入部门编号" />
							</el-form-item>
						</el-col>
						<el-col :span="20">
							<el-form-item label="部门名称" prop="deptName">
								<el-input v-model="form.deptName" placeholder="请输入部门名称" />
							</el-form-item>
						</el-col>
						<el-col :span="20">
							<el-form-item label="级别" prop="deptLevel">
								<el-select v-model="form.deptLevel" placeholder="请选择级别">
									<el-option
										v-for="item in deptLevelList"
										:key="item.id"
										:label="item.dictLabel"
										:value="item.dictValue"
									/>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="20">
							<el-form-item label="类型" prop="inOutType">
								<el-radio-group v-model="form.inOutType">
									<el-radio key="1" label="I">内部</el-radio>
									<el-radio key="0" label="O">外部</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="20" v-if="form.deptLevel == 1">
							<el-form-item label="是否作业公司" prop="isWorkCompany">
								<el-radio-group v-model="form.isWorkCompany">
									<el-radio key="1" label="1">是</el-radio>
									<el-radio key="0" label="0">否</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="20" v-if="form.deptLevel == 1">
							<el-form-item label="是否理货公司" prop="isTallyCompany">
								<el-radio-group v-model="form.isTallyCompany">
									<el-radio key="1" label="1">是</el-radio>
									<el-radio key="0" label="0">否</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="20" v-if="form.deptLevel == 2">
							<el-form-item label="是否为项目组" prop="isProject">
								<el-radio-group v-model="form.isProject">
									<el-radio key="1" label="1">是</el-radio>
									<el-radio key="0" label="0">否</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="20" v-if="form.deptLevel == 2">
							<el-form-item label="是否为装卸队" prop="isLabor">
								<el-radio-group v-model="form.isLabor">
									<el-radio key="1" label="1">是</el-radio>
									<el-radio key="0" label="0">否</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="20" v-if="form.deptLevel == 2">
							<el-form-item label="是否为机械队" prop="isMachine">
								<el-radio-group v-model="form.isMachine">
									<el-radio key="1" label="1">是</el-radio>
									<el-radio key="0" label="0">否</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
            <el-col :span="20" v-if="form.deptLevel == 2">
              <el-form-item label="签票等级" prop="ticketLevel">
                <div style="width: 100%">
                  <Select
                    :selectData="[
										{ label: '一级签票', value: '1' },
										{ label: '二级签票', value: '2' },
									]"
                    v-model:value="form.ticketLevel"
                    v-model:label="form.ticketLevelLabel"
                  />
                </div>
              </el-form-item>
            </el-col>
						<el-col :span="20">
							<el-form-item label="负责人" prop="chief">
								<el-input v-model="form.chief" placeholder="请输入负责人" maxlength="20" />
							</el-form-item>
						</el-col>
						<el-col :span="20">
							<el-form-item label="部门状态" prop="status">
								<el-radio-group v-model="form.status">
									<el-radio key="1" label="1">在用</el-radio>
									<el-radio key="0" label="0">停用</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="20">
							<el-form-item label="显示排序" prop="orderNo">
								<el-input-number style="width: 100%" v-model="form.orderNo" controls-position="right" :min="0" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
			</div>
			<template #footer>
				<div class="drawer-footer">
					<el-button @click="cancel">取 消</el-button>
					<el-button type="primary" @click="submitForm">确 定</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="dept">
import { listDept, getDept, delDept, addDept, updateDept } from '@/api/system/dept'
import publicApi from '@/api/public/index'
import tableParamsStore from '@/store/modules/tableParams'
import BaseTable from '@/components/BaseTable/index.vue'
import { ElButton } from 'element-plus'
import Select from "@/components/Select/index.vue";
const { proxy } = getCurrentInstance()

let storeHight = computed(() => tableParamsStore().normalTableHeight)
const deptLevelList = ref([])
const deptList = ref([])
const open = ref(false)
const showSearch = ref(true)
const title = ref('')
const deptOptions = ref([])
const isExpandAll = ref(true)
const refreshTable = ref(true)
const clickRow = ref({}) //点击当前行
const total = ref(0)
const queryParams = ref({
	deptName: '',
	status: '',
})
const data = reactive({
	form: {},
	queryParams: {
		deptName: undefined,
		status: undefined,
	},
	rules: {
		parentId: [{ required: true, message: '上级部门不能为空', trigger: 'blur' }],
		deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
		deptCode: [{ required: true, message: '部门编号不能为空', trigger: 'blur' }],
		orderNo: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
		status: [{ required: true, message: '请选择部门状态', trigger: 'blur' }],
		deptLevel: [{ required: true, message: '请选择级别', trigger: 'change' }],
		inOutType: [{ required: true, message: '请选择类型', trigger: 'change' }],
		isWorkCompany: [{ required: true, message: '请选择是否为作业公司', trigger: 'change' }],
		isTallyCompany: [{ required: true, message: '请选择是否为理货公司', trigger: 'change' }],
		isProject: [{ required: true, message: '请选择是否为项目组', trigger: 'change' }],
		isLabor: [{ required: true, message: '请选择是否为装卸队', trigger: 'change' }],
		isMachine: [{ required: true, message: '请选择是否为机械队', trigger: 'change' }],
		chief: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
		email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
		phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
	},
})

const { form, rules, tableParams } = toRefs(data)

/** 查询部门列表 */
const getList = data => {
	console.log('查询shuju', data)
	listDept(data).then(response => {
		console.log('列表', response)
		deptList.value = proxy.handleTree(response.data)
	})
}
/** 取消按钮 */
function cancel() {
	open.value = false
	reset()
}
/** 表单重置 */
function reset() {
	form.value = {
		id: undefined,
		parentId: undefined,
		deptName: undefined,
		deptCode: undefined,
		orderNo: 0,
		chief: undefined,
		phone: undefined,
		email: undefined,
		status: '1',
    ticketLevel:undefined,
	}
	proxy.resetForm('deptRef')
}
/** 搜索按钮操作 */
function handleQuery() {
	getList(queryParams.value)
}
/** 重置按钮操作 */
function resetQuery() {
	proxy.resetForm('queryRef')
	handleQuery()
}
/** 新增按钮操作 */
function handleAdd(row) {
	reset()
	publicApi.getDeptList().then(response => {
		deptOptions.value = proxy.handleTree(response.data)
	})
	if (row != undefined) {
		form.value.parentId = row.id
	}
	open.value = true
	title.value = '新增'
}
/** 展开/折叠操作 */
function toggleExpandAll() {
	refreshTable.value = false
	isExpandAll.value = !isExpandAll.value
	nextTick(() => {
		refreshTable.value = true
	})
}
/** 修改按钮操作 */
function handleUpdate(row) {
	console.log(row)
	reset()
	publicApi.getDeptList().then(response => {
		deptOptions.value = proxy.handleTree(response.data)
	})
	getDept(row.id).then(response => {
		form.value = response.data
		console.log('修改数据', response.data)
		open.value = true
		title.value = '编辑'
	})
}
/** 提交按钮 */
function submitForm() {
	proxy.$refs['deptRef'].validate(valid => {
		if (valid) {
			proxy.$modal.confirm('确定提交？').then(res => {
				if (form.value.id != undefined) {
					updateDept(form.value).then(res => {
						proxy.$modal.msgSuccess(res.msg)
						open.value = false
						getList(queryParams.value)
					})
				} else {
					addDept(form.value).then(res => {
						proxy.$modal.msgSuccess(res.msg)
						open.value = false
						getList(queryParams.value)
					})
				}
			})
		}
	})
}
/** 删除按钮操作 */
function handleDelete(row) {
	proxy.$modal
		.confirm('确定删除?')
		.then(function () {
			return delDept(row.id)
		})
		.then(() => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}
// 根据字典进行查询级别
const getdeptLevelList = () => {
	publicApi.getDictList({ types: 'DEPT_LEVEL' }).then(response => {
		console.log('级别字典', response)
		deptLevelList.value = proxy.handleTree(response.data.DEPT_LEVEL)
	})
}
getdeptLevelList()
getList(queryParams.value)
</script>
<style lang="scss" scoped>
@import '../../../assets/styles/searchform.scss';
@import '@/assets/styles/formData.scss';
</style>
