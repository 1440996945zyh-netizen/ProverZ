<template>
	<el-form ref="ruleForm" :model="form" :rules="rules" label-width="80px">
		<el-collapse :v-model="collapseOpen">
			<el-collapse-item title="基本信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="20" style="margin-left: 0px">
					<el-col :span="6">
						<el-form-item prop="roleCode" label="角色编号">
							<el-input v-model="form.roleCode" placeholder="请输入角色代码" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="角色名称" prop="roleName">
							<el-input v-model="form.roleName" placeholder="请输入角色名称" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="状态">
							<el-radio-group v-model="form.status">
								<el-radio key="0" label="0">停用</el-radio>
								<el-radio key="1" label="1">在用</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="角色顺序" prop="roleSort">
							<el-input-number v-model="form.roleSort" controls-position="right" :min="0" style="width: 100%" />
						</el-form-item>
					</el-col>
					<!-- <el-col :span="8">
						<el-form-item label="角色类别" prop="roleClass">
							<el-input v-model="form.roleClass" placeholder="请输入角色类别" />
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="部门名称" prop="deptName">
							<el-input v-model="form.deptName" placeholder="请输入部门名称" />
						</el-form-item>
					</el-col> -->
					<el-col :span="24">
						<el-form-item label="备注" prop="remark">
							<el-input
								v-model="form.remark"
								type="textarea"
								placeholder="请输入内容"
								:autosize="{ minRows: 2, maxRows: 4 }"
							></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
			<!-- 权限信息 -->
			<el-row>
				<el-tabs type="border-card" style="width: 100%; min-height: 500px; padding-left: 0 !important" v-model="tabSelectedName">
					<el-tab-pane label="功能权限分配" name="menuTab">
						<el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
						<el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
						<el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">
							父子联动
						</el-checkbox>
						<el-tree
							class="tree-border"
							:data="menuOptions"
							show-checkbox
							ref="menuRef"
							node-key="id"
							:check-strictly="!(form.menuCheckStrictly || null === form.menuCheckStrictly)"
							empty-text="加载中，请稍候"
							:props="{ label: 'label', children: 'children' }"
						></el-tree>
					</el-tab-pane>
					<el-tab-pane label="数据权限分配" name="deptTab">
						<el-form-item label="权限范围">
							<el-radio-group v-model="form.dataScope">
								<el-radio key="1" label="1">全部</el-radio>
								<!-- <el-radio key="2" label="2">自定义</el-radio> -->
								<el-radio key="3" label="3">本部门</el-radio>
								<el-radio key="4" label="4">本部门及以下</el-radio>
								<el-radio key="5" label="5">仅本人</el-radio>
							</el-radio-group>
						</el-form-item>
						<div v-if="form.dataScope == 2">
							<el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">展开/折叠</el-checkbox>
							<el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
							<el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">
								父子联动
							</el-checkbox>
							<el-tree
								class="tree-border"
								lazy
								:data="deptOptions"
								show-checkbox
								default-expand-all
								ref="deptRef"
								node-key="id"
								:check-strictly="!(form.deptCheckStrictly || null === form.deptCheckStrictly)"
								empty-text="加载中，请稍候"
								:props="{ label: 'label', children: 'children' }"
							></el-tree>
						</div>
					</el-tab-pane>
				</el-tabs>
			</el-row>
		</el-collapse>
	</el-form>
</template>

<script setup>
import { nextTick, reactive } from 'vue'
import { getDeptTree, getMenuTree } from '@/api/system/role'
const emit = defineEmits(['drawerShowEmit'])
const deptOptions = ref([])
const menuOptions = ref([])
const ruleForm = ref()
const menuRef = ref(null)
const deptRef = ref(null)
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const collapseOpen = ['1', '2'] // 打开的面板
const tabSelectedName = ref('menuTab')
const { proxy } = getCurrentInstance()
const form = ref({
	id: undefined,
	roleName: undefined,
	roleCode: undefined,
	roleSort: 0,
	status: '1',
	menuIds: [],
	deptIds: [],
	menuCheckStrictly: true,
	deptCheckStrictly: false,
	remark: '',
	roleClass: '',
	deptName: '',
})
// 验证
const rules = reactive({
	roleName: proxy.getRules({
		required: true,
		length: '1-100',
	}),
	roleCode: proxy.getRules({
		required: true,
		length: '1-100',
	}),
	roleSort: proxy.getRules({
		required: true,
	}),
	remark: proxy.getRules({
		length: '1-200',
	}),
})

/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value, type) {
	if (type == 'menu') {
		menuRef.value.setCheckedNodes(value ? menuOptions.value : [])
	} else if (type == 'dept') {
		deptRef.value.setCheckedNodes(value ? deptOptions.value : [])
	}
}
/** 树权限（父子联动） */
function handleCheckedTreeConnect(value, type) {
	if (type == 'menu') {
		form.value.menuCheckStrictly = value ? true : false
	} else if (type == 'dept') {
		form.value.deptCheckStrictly = value ? true : false
	}
}
/** 所有菜单节点数据 */
function getMenuAllCheckedKeys() {
	let checkedKeys = []
	if (null !== menuRef.value) {
		// 目前被选中的菜单节点
		checkedKeys = menuRef.value.getCheckedKeys()
		// 半选中的菜单节点
		let halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
		checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
	}

	return checkedKeys
}
/** 所有部门节点数据 */
const getDeptAllCheckedKeys = () => {
	let checkedKeys = []
	if (null !== deptRef.value) {
		// 目前被选中的部门节点
		checkedKeys = deptRef.value.getCheckedKeys()
		// 半选中的部门节点
		let halfCheckedKeys = deptRef.value.getHalfCheckedKeys()
		checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
	}
	console.log('部门节点数据', checkedKeys)
	return checkedKeys
}
/** 根据角色ID查询菜单树结构 */
const getRoleMenuTreeselect = id => {
	return getMenuTree(id).then(response => {
		menuOptions.value = response.data.menus
		return response
	})
}
/** 根据角色ID查询部门树结构 */
function getRoleDeptTreeselect(id) {
	return getDeptTree(id).then(response => {
		deptOptions.value = response.data.depts
		return response
	})
}
/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value, type) {
	if (type == 'menu') {
		let treeList = menuOptions.value
		for (let i = 0; i < treeList.length; i++) {
			menuRef.value.store.nodesMap[treeList[i].id].expanded = value
		}
	} else if (type == 'dept') {
		let treeList = deptOptions.value
		for (let i = 0; i < treeList.length; i++) {
			deptRef.value.store.nodesMap[treeList[i].id].expanded = value
		}
	}
}
const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}

/** 重置新增的表单以及其他数据  */
function reset() {
	if (menuRef.value != undefined) {
		menuRef.value.setCheckedKeys([])
	}
	menuExpand.value = false
	menuNodeAll.value = false
	deptExpand.value = true
	deptNodeAll.value = false
	// console.log(form.value);
	form.value = {
		id: undefined,
		roleName: undefined,
		roleCode: undefined,
		roleSort: 0,
		status: '1',
		menuIds: [],
		deptIds: [],
		menuCheckStrictly: true,
		deptCheckStrictly: false,
		remark: '',
	}
}
const getUpdate = val => {
	reset()
	tabSelectedName.value = 'menuTab'
	//  菜单树和有权限的菜单id
	const roleMenu = getRoleMenuTreeselect(val)
	// 部门树和有权限的部门id
	const roleDept = getRoleDeptTreeselect(val)
	// 角色详情
	form.value.roleSort = Number(form.value.roleSort)
	nextTick(() => {
		roleMenu.then(res => {
			// 回显菜单树
			let checkedKeys = res.data.checkedKeys
			nextTick(() => {
				for (let i = 0; i < checkedKeys.length; i++) {
					menuRef.value.setChecked(checkedKeys[i], true, false)
				}
			})
		})
	})

	roleDept.then(res => {
		// 回显菜单树
		let checkedKeys = res.data.checkedKeys
		checkedKeys.forEach(v => {
			nextTick(() => {
				deptRef.value.setChecked(v, true, false)
			})
		})
	})
}
const resetForm = () => {
	form.value.id = undefined
	ruleForm.value.resetFields()

	// proxy.clearObjectValues(form)
	// reset()
}
// 获取部门树
getRoleDeptTreeselect(null)
// 获取菜单树
getRoleMenuTreeselect(null)

defineExpose({
	validate,
	resetForm,
	form,
	getUpdate,
	getMenuAllCheckedKeys,
	getDeptAllCheckedKeys,
})
</script>

<style lang="less" scoped>
@import '@/assets/styles/formData.scss';
</style>
