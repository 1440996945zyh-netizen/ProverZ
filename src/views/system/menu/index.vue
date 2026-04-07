<!--
 * @Author: zhangsd
 * @Date: 2025-07-28 16:51:35
 * @LastEditTime: 2026-04-07 15:57:03
 * @LastEditors: zhangsd
 * @Description: 菜单管理
 * @FilePath: \view\src\views\system\menu\index.vue
-->
<template>
	<div class="app-container">
		<!-- 顶部搜索条件 -->

		<!-- 主列表菜单管理显示 -->
		<div class="container-content">
			<BaseTable
				ref="menuTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableData="menuList"
				:tableColumns="tableColumns"
				:treeConfig="treeConfig"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="menuLazyTable"
				:cellClickEvent="cellClickEvent"
				:loading="tableLoading"
				:showPagination="false"
				:showToolBar="false"
			/>
		</div>
		<!-- 新增弹窗/编辑弹窗 -->
		<Dialog v-model:visible="open" :title="title" width="50%">
			<el-form ref="menuRef" :model="form" :rules="rules" label-width="100px" style="padding: 20px">
				<el-row>
					<el-col :span="24">
						<el-form-item label="上级菜单">
							<el-tree-select
								v-model="form.parentId"
								:data="menuOptions"
								:props="{ value: 'menuId', label: 'menuName', children: 'children' }"
								value-key="menuId"
								placeholder="选择上级菜单"
								check-strictly
							/>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="菜单类型" prop="menuType">
							<el-radio-group v-model="form.menuType">
								<el-radio label="M">目录</el-radio>
								<el-radio label="C">菜单</el-radio>
								<el-radio label="F">按钮</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="显示方式" prop="isFrame">
							<template #label>
								<span>
									<el-tooltip
										content="内部：在系统内置页面打开；外部链接内部显示：嵌入当前系统窗口打开外部链接；外部链接外部显示：新浏览器标签页打开外部链接"
										placement="top"
									>
										<el-icon><question-filled /></el-icon>
									</el-tooltip>
									显示方式
								</span>
							</template>
							<el-radio-group v-model="form.isFrame">
								<el-radio label="0">内部</el-radio>
								<el-radio label="1">外部链接内部显示</el-radio>
								<el-radio label="2">外部链接外部显示</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="12" v-if="form.menuType != 'F'">
						<el-form-item label="菜单图标" prop="icon">
							<el-popover
								placement="bottom-start"
								:width="540"
								v-model:visible="showChooseIcon"
								trigger="click"
								@show="showSelectIcon"
							>
								<template #reference>
									<el-input
										v-model="form.icon"
										placeholder="点击选择图标"
										@blur="showSelectIcon"
										v-click-outside="hideSelectIcon"
									>
										<template #prefix>
											<svg-icon
												v-if="form.icon"
												:icon-class="form.icon"
												class="el-input__icon"
												style="height: 32px; width: 16px"
											/>
											<el-icon v-else style="height: 32px; width: 16px"><search /></el-icon>
										</template>
									</el-input>
								</template>
								<icon-select ref="iconSelectRef" @selected="selected" />
							</el-popover>
						</el-form-item>
					</el-col>
					<!-- 菜单图标颜色选择 -->
					<!-- 菜单图标颜色选择（按钮组单选改造） -->
					<!-- 菜单图标颜色选择（纯按钮形式） -->
					<el-col :span="12" v-if="form.menuType != 'F'">
						<el-form-item label="图标颜色" prop="menuIconColor">
							<!-- 按钮容器：横向排列 + 间距控制 -->
							<div class="icon-color-btn-group">
								<!-- 遍历颜色列表生成独立按钮 -->
								<el-button
									v-for="(color, index) in colorMap"
									:key="index"
									type="text"
									:class="['icon-color-btn', form.menuIconColor === color.value ? 'icon-color-btn--active' : '']"
									@click="form.menuIconColor = color.value"
									size="mini"
								>
									<!-- 按钮内容：颜色块 + 颜色名称 -->
									<div class="color-btn-inner">
										<!-- 颜色示例块：背景色与当前颜色值一致 -->
										<div class="color-block" :style="{ backgroundColor: color.value }"></div>
										<!-- 颜色名称：文字颜色匹配颜色值 -->
										<!-- <span :style="{ color: color.value }">{{ color.label }}</span> -->
									</div>
								</el-button>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="菜单名称" prop="menuName">
							<el-input v-model="form.menuName" placeholder="请输入菜单名称" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="显示排序" prop="orderNum">
							<el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
						</el-form-item>
					</el-col>
					<el-col :span="12" v-if="form.menuType != 'F'">
						<el-form-item
							prop="path"
							:rules="
								form.menuType === 'M' && form.parentId == '0'
									? [
											{ required: true, message: '路由地址不能为空' },
											{ pattern: '^\/.*', message: '一级菜单路由以 / 开头' },
									  ]
									: [
											// 非一级目录或菜单
											{ required: true, message: '路由地址不能为空', trigger: 'blur' },
											{ pattern: '^(?!/).*', message: '非一级菜单路由不能以 / 开头', trigger: 'blur' }, // 增加反向校验
									  ]
							"
						>
							<template #label>
								<span>
									<el-tooltip
										content="访问的路由地址,一级如:'/user',二级如:'user',如外网地址需内链访问则以`http(s)://`开头"
										placement="top"
									>
										<el-icon><question-filled /></el-icon>
									</el-tooltip>
									路由地址
								</span>
							</template>
							<el-input v-model="form.path" placeholder="请输入路由地址" />
						</el-form-item>
					</el-col>
					<el-col :span="12" v-if="form.menuType == 'C'">
						<el-form-item prop="component">
							<template #label>
								<span>
									<el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
										<el-icon><question-filled /></el-icon>
									</el-tooltip>
									组件路径
								</span>
							</template>
							<el-input v-model="form.component" placeholder="请输入组件路径" />
						</el-form-item>
					</el-col>
					<el-col :span="12" v-if="form.menuType != 'M'">
						<el-form-item>
							<el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
							<template #label>
								<span>
									<el-tooltip
										content="控制器中定义的权限字符，如：@RequiresPermissions(`system:menu:query`)"
										placement="top"
									>
										<el-icon><question-filled /></el-icon>
									</el-tooltip>
									权限字符
								</span>
							</template>
						</el-form-item>
					</el-col>
					<el-col :span="12" v-if="form.menuType == 'C'">
						<el-form-item>
							<el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" />
							<template #label>
								<span>
									<el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
										<el-icon><question-filled /></el-icon>
									</el-tooltip>
									路由参数
								</span>
							</template>
						</el-form-item>
					</el-col>
					<el-col :span="12" v-if="form.menuType == 'C'">
						<el-form-item>
							<template #label>
								<span>
									<el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
										<el-icon><question-filled /></el-icon>
									</el-tooltip>
									是否缓存
								</span>
							</template>
							<el-radio-group v-model="form.isCache">
								<el-radio label="0">缓存</el-radio>
								<el-radio label="1">不缓存</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="12" v-if="form.menuType != 'F'">
						<el-form-item>
							<template #label>
								<span>
									<el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
										<el-icon><question-filled /></el-icon>
									</el-tooltip>
									显示状态
								</span>
							</template>
							<el-radio-group v-model="form.visible">
								<el-radio key="0" label="0">显示</el-radio>
								<el-radio key="1" label="1">隐藏</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="12" v-if="form.menuType != 'F'">
						<el-form-item>
							<template #label>
								<span>
									<el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
										<el-icon><question-filled /></el-icon>
									</el-tooltip>
									菜单状态
								</span>
							</template>
							<el-radio-group v-model="form.status">
								<el-radio key="0" label="0">正常</el-radio>
								<el-radio key="1" label="1">停用</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="数据类别" prop="dataType">
							<el-radio-group v-model="form.dataType">
								<el-radio key="PC" label="PC">PC</el-radio>
								<el-radio key="APP" label="APP">APP</el-radio>
								<el-radio key="APPLET" label="APPLET">APPLET</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<!-- <el-col :span="12" v-if="form.menuType == 'C'">
						<el-form-item>
							<template #label>
								<span>
									<el-tooltip content="选择是将会打开新的显示窗口" placement="top">
										<el-icon><question-filled /></el-icon>
									</el-tooltip>
									外部显示
								</span>
							</template>
							<el-radio-group v-model="form.isFrame">
								<el-radio label="0">是</el-radio>
								<el-radio label="1">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col> -->
					<!-- <el-col :span="12" v-if="form.menuType == 'C'">
						<el-form-item prop="link">
							<template #label>
								<span>
									<el-tooltip content="外部网页链接地址，http(s)开头" placement="top">
										<el-icon><question-filled /></el-icon>
									</el-tooltip>
									外链地址
								</span>
							</template>
							<el-input v-model="form.link" placeholder="请输入外链地址" />
						</el-form-item>
					</el-col> -->
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm">确定</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>
<script setup name="systemMenu">
import { ref, reactive, computed, nextTick, getCurrentInstance, onMounted } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import SvgIcon from '@/components/SvgIcon'
import Dialog from '@/components/Dialog/index.vue'
import IconSelect from '@/components/IconSelect'
import tableParamsStore from '@/store/modules/tableParams'

import { addMenu, delMenu, getMenu, listMenu, updateMenu, getListByParentId, getContentsMenu } from '@/api/system/menu'
const { proxy } = getCurrentInstance()
const storeHight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHight.value) //表格高度
const menuTableRef = ref(null) // BaseTable实例ref
const menuList = ref([]) // 菜单树形数据
const open = ref(false) // 弹窗显示状态
const title = ref('') // 弹窗标题
const menuOptions = ref([]) // 上级菜单下拉树数据
const isExpandAll = ref(false) // 是否默认展开所有树形节点
const showChooseIcon = ref(false)
const iconSelectRef = ref(null)
const rowConfig = { keyField: 'menuId', treeNode: true }
const menuRef = ref(null) // form表单

const data = reactive({
	form: {},
	queryParams: {
		menuName: undefined,
		visible: undefined,
	},
	rules: {
		menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
		isFrame: [{ required: true, message: '显示方式不能为空', trigger: 'blur' }],
		orderNum: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
		dataType: [{ required: true, message: '数据类别不能为空', trigger: 'blur' }],
	},
})
const { queryParams, form, rules } = toRefs(data)
// 菜单数据详情
const menuDataInfo = ref([])
//定义预设图标颜色列表（固定6种颜色）
const colorMap = ref([
	{ value: '#000000', label: '' },
	{ value: '#80da33', label: 'green' },
	{ value: '#45b6e4', label: 'blue' },
	{ value: '#edb01b', label: 'orange' },
	{ value: '#5a59a6', label: 'purple' },
	{ value: '#f75e5e', label: 'red' },
])
/**
 * @description 取消关闭弹窗按钮
 */
const cancel = () => {
	console.log(form.menuIconColor)
	open.value = false
	reset()
}
/**
 * @description 重置表单
 * @param {*} formRef 表单实例
 */
const reset = () => {
	form.value = {
		menuId: undefined,
		parentId: 0,
		menuName: undefined,
		icon: undefined,
		menuType: 'M',
		orderNum: undefined,
		isFrame: '0',
		isCache: '0',
		visible: '0',
		status: '0',
		dataType: 'PC',
		menuIconColor: '#000000', // 新增：图标颜色默认值（黑色）
	}
	proxy.resetForm('menuRef')
}
/* 表格数据列 */
const tableColumns = ref([
	// 列1：菜单名称（树形节点列）
	{
		prop: 'menuName', // 绑定到菜单名字段
		label: '菜单名称',
		align: 'center',
		showOverFlow: true,
		width: 250,
		treeNode: true, // 标记为树形节点列（关键配置）
	},
	// 列2：图标（自定义渲染SvgIcon）
	{
		prop: 'icon',
		label: '图标',
		align: 'center',
		width: 150,
		render: row => {
			return [
				h(SvgIcon, {
					iconClass: row.icon || '',
					color: row.menuIconColor || '#000',
				}),
			]
		},
	},
	// 列3：数据类别（自定义渲染ElTag）
	{
		prop: 'dataType',
		label: '数据类别',
		align: 'center',
		width: 150,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.dataType === 'PC' ? 'success' : '',
						size: 'default',
					},
					{
						default: () => {
							return row.dataType
						},
					}
				),
			]
		},
	},
	// 列4：菜单类型（自定义渲染ElTag）
	{
		prop: 'menuType',
		label: '菜单类型',
		align: 'center',
		width: 150,
		render: row => {
			let type = ''
			let label = ''
			if (row.menuType === 'M') {
				type = 'primary'

				label = '目录'
			} else if (row.menuType === 'C') {
				type = 'warninging'
				label = '菜单'
			} else if (row.menuType === 'F') {
				type = 'danger'
				label = '按钮'
			}
			return [
				h(
					ElTag,
					{
						type: type,
						size: 'default',
					},
					{
						default: () => {
							return label
						},
					}
				),
			]
		},
	},
	// 列5：缓存状态（自定义渲染ElTag）
	{
		prop: 'isCache',
		label: '缓存',
		align: 'center',
		width: 150,

		render: row => {
			const label = row.isCache === '0' ? '缓存' : '不缓存'
			return [
				h(
					ElTag,
					{
						type: row.isCache === '0' ? 'warning' : 'danger',
						size: 'default',
					},
					{
						default: () => {
							return label
						},
					}
				),
			]
		},
	},
	// 列6：权限标识
	{
		prop: 'perms',
		label: '权限标识',
		align: 'center',
		showOverFlow: true,
	},
	// 列7：菜单状态（自定义渲染ElTag）
	{
		prop: 'status',
		label: '状态',
		align: 'center',
		width: 120,

		render: row => {
			const label = row.status === '0' ? '正常' : '停用'
			return [
				h(
					ElTag,
					{
						type: row.status === '0' ? 'success' : 'danger',
						size: 'default',
					},
					{
						default: () => {
							return label
						},
					}
				),
			]
		},
	},
	// 列8：操作列（编辑/新增子菜单/删除）
	{
		prop: 'operate',
		label: '操作',
		align: 'center',
		width: 250,
		fixed: 'right', // 固定在右侧

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
						permission: 'system:menu:update',
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							handleAdd(row)
						},
						type: 'primary',
						link: true,
						icon: 'Plus',
						permission: 'system:menu:insert',
					},
					{
						default: () => '新增',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'system:menu:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

/* 树形表格配置 - 修复懒加载和箭头显示 */
const treeConfig = reactive({
	children: 'children', // 子节点字段
	hasChild: 'hasChildren', // 是否有子节点字段
	lazy: true, // 懒加载
	loadMethod: async ({ row }) => {
		console.log('row', row)
		// 加载子节点数据时显示加载状态
		tableLoading.value = true
		try {
			const res = await getListByParentId(row.id)

			return res.data.map(item => ({
				...item,
				hasChildren: item.hasChildren == '1' ? true : false,
			}))
		} finally {
			tableLoading.value = false
		}
	},
})
/* 表格加载 */
const tableLoading = ref(false)
/* 菜单查询条件 */
const selectData = reactive([
	{
		name: '菜单名称',
		type: 'input',
		modelValue: 'menuName',
		span: 12,
	},
	{
		name: '菜单状态',
		type: 'select',
		modelValue: 'status',
		span: 12,
		placeholder: '菜单状态',
		selectData: [
			{ dictLabel: '正常', dictValue: '0' },
			{ dictLabel: '停用', dictValue: '1' },
		],
		selectLabel: 'dictLabel', // 下拉选项的文本字段
		selectValue: 'dictValue', // 下拉选项的value字段
	},
])
/* 右侧按钮 */
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => handleAdd(), // 回调函数
		permission: 'system:menu:insert', // 权限
	},
	// {
	// 	label: '展开/折叠', // 按钮名称
	// 	type: 'default', // 按钮类型
	// 	click: () => toggleExpandAll(), // 回调函数
	// 	permission: 'system:menu:insert', // 权限
	// },
])
/**
 * 查询主列表数据
 */
const getList = e => {
	tableLoading.value = true

	let params = {
		...e,
	}
	listMenu(params)
		.then(response => {
			menuList.value = response.data.map(item => ({
				...item,
				hasChildren: item.hasChildren == '1' ? true : false,
			}))
		})
		.finally(() => {
			tableLoading.value = false
		})
}

/**
 * @description 查询菜单下拉数结构
 */
const getTreeselect = async () => {
	menuOptions.value = []
	getContentsMenu().then(response => {
		menuDataInfo.value = response.data
		const menu = { menuId: "0", menuName: '主类目', children: [] }
		menu.children = proxy.flattenToTree(response.data, 'menuId')
		menuOptions.value.push(menu)
	})
}
/** 新增菜单 */
const handleAdd = async row => {
	reset()
	await getTreeselect()
	if (row != null && row.menuId) {
		form.value.parentId = row.menuId
	} else {
		form.value.parentId = 0
	}
	open.value = true
	title.value = '新增'
}

/** 编辑菜单 */
const handleUpdate = async row => {
	console.log('编辑菜单', row)
	reset()
	await getTreeselect()
	getMenu(row.id).then(response => {
		form.value = response.data
		open.value = true
		title.value = '编辑'
	})
}

/** 展开/折叠所有节点 */
const toggleExpandAll = () => {
	isExpandAll.value = !isExpandAll.value
	const $table = menuTableRef.value
	if ($table) {
		if (isExpandAll.value) {
			$table.toggleTreeEvent() // 展开所有
		} else {
			$table.clearTreeExpand() // 收起所有
		}
	}
}

/** 行点击事件 */
const cellClickEvent = ({ row }) => {
	console.log('行点击事件', row)
}
/**
 * @description 显示选择图标弹窗
 */
const showSelectIcon = () => {
	iconSelectRef.value.reset()
	showChooseIcon.value = true
}
/***
 * @description 选择图标
 * @param {*} name 图标名称

 */
const selected = name => {
	form.value.icon = name
	showChooseIcon.value = false
}
/**
 * @description 隐藏选择图标弹窗
 */
const hideSelectIcon = event => {
	var elem = event.relatedTarget || event.srcElement || event.target || event.currentTarget
	var className = elem.className
	if (className !== 'el-input__inner') {
		showChooseIcon.value = false
	}
}
/**
 * @description 提交表单
 */
const submitForm = () => {
	proxy.$refs['menuRef'].validate(valid => {
		if (valid) {
			const menuData = { ...form.value }
			// 处理外部链接的 link 字段
			if (menuData.isFrame == '1' || menuData.isFrame == '2') {
				// 假设 form.path 此时包含外部链接的 URL
				menuData.link = menuData.path.replace(/^\/+/, '')
			} else {
				// 如果不是外部链接，确保 link 字段为 null 或空
				menuData.link = null
			}
			// 处理二级类型为目录时的 component 字段
			if (menuData.menuType == 'M') {
				const parentId = String(menuData.parentId)
				if (parentId == '0') {
					menuData.component = 'Layout' // 一级目录固定值
				} else {
					const parentMenu = menuDataInfo.value.find(item => String(item.menuId) === parentId)
					menuData.component = parentMenu?.path || null
				}
			} else {
				menuData.component = null // 非目录类型清空
			}

			console.log('提交表单 submitForm menuData', menuData)
			if (menuData.id != undefined) {
				updateMenu(menuData).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					open.value = false
					getList()
				})
			} else {
				addMenu(menuData).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					open.value = false
					getList()
				})
			}
		}
	})
}
/**
 * @description 删除菜单
 * @param row 菜单

 */
const handleDelete = row => {
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return delMenu(row.id)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}

onMounted(() => {
	getList()
})
</script>

<style lang="scss" scoped>
// 颜色按钮组容器：横向排列 + 换行 + 间距
.icon-color-btn-group {
	display: flex;
	flex-wrap: wrap; // 屏幕变窄时自动换行
	gap: 8px; // 按钮之间的间距
	margin-top: 6px;
}

// 单个颜色按钮：基础样式（无背景、无边框）
:deep(.icon-color-btn) {
	padding: 8px 14px;
	margin: 0;
	border: 1px solid #e5e7eb; // 淡灰色边框，区分按钮边界
	border-radius: 6px; // 圆角优化，更贴近现代按钮风格
	background-color: transparent !important; // 清除默认背景
	transition: all 0.2s ease; // 状态切换过渡效果
	cursor: pointer;

	// 鼠标悬浮效果
	&:hover {
		border-color: #c0c6cc; // 悬浮时边框加深
		background-color: #f9fafb !important; // 轻微背景色，提升交互感知
	}

	// 禁用状态（如需）
	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		border-color: #e5e7eb;
		background-color: transparent !important;
	}
}

// 颜色按钮选中状态：突出显示
:deep(.icon-color-btn--active) {
	border-color: #1890ff; // 选中时边框用主题色
	box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1); // 外发光效果，强化选中标识
	background-color: #f0f7ff !important; // 淡蓝色背景，与主题色呼应
}

// 按钮内部容器：对齐颜色块和文字
.color-btn-inner {
	display: flex;
	align-items: center;
	gap: 8px; // 颜色块与文字的间距
}

// 颜色示例块：固定大小 + 圆角
.color-block {
	width: 18px;
	height: 18px;
	border-radius: 4px; // 小圆角，与按钮风格统一
	border: 1px solid #eee; // 浅色边框，避免颜色块与背景融合
}

// 原有其他样式保留
:deep(.el-tag) {
	border: none;
	aspect-ratio: 1;
	width: 20px;
	height: 20px;
	border-radius: 3px;
}
:deep(.el-select__tags .el-tag) {
	width: 20px;
	height: 20px;
}
.el-tag {
	border: none;
	aspect-ratio: 1;
}
</style>
