import { createWebHistory, createRouter } from 'vue-router'
/* Layout */
import Layout from '@/layout'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
	noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
	title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
	icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
	breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
	activeMenu: '/system/user'      // 当路由设置
	*/
// 公共路由
export const constantRoutes = [
	{
		path: '/redirect',
		component: Layout,
		hidden: true,
		children: [
			{
				path: '/redirect/:path(.*)',
				component: () => import('@/views/redirect/index.vue'),
			},
		],
	},
	{
		path: '/login',
		component: () => import('@/views/login'),
		hidden: true,
	},
	{
		path: '/register',
		component: () => import('@/views/register'),
		hidden: true,
	},
	{
		path: '/:pathMatch(.*)*',
		component: () => import('@/views/error/404'),
		hidden: true,
	},
	{
		path: '/401',
		component: () => import('@/views/error/401'),
		hidden: true,
	},
	{
		path: '',
		component: Layout,
		redirect: '/index',
		children: [
			{
				path: '/index',
				component: () => import('@/views/home/index'),
				name: 'Index',
				meta: { title: '首页', icon: 'dashboard', affix: true },
			},
		],
	},
	{
		path: '/user',
		component: Layout,
		hidden: true,
		redirect: 'noredirect',
		children: [
			{
				path: 'profile',
				component: () => import('@/views/system/user/profile/index'),
				name: 'Profile',
				meta: { title: '个人中心', icon: 'user' },
			},
			{
				path: '/navigation',
				component: () => import('@/views/navigation/index'),
				name: 'Navigation',
				meta: { title: '站内导航', icon: 'dashboard' },
			},
			{
				path: '/chatAgent',
				component: () => import('@/views/system/chatAgent/index'),
				name: 'chatAgent',
				meta: { title: 'A-Port智能体', icon: 'dashboard' },
			},
		],
	},
	{
		path: '/example/hiprint/detail/PrintDesigner',
		component: Layout,
		hidden: true,
		redirect: 'noredirect',
		children: [
			{
				path: '',
				component: () => import('@/views/example/hiprint/detail/PrintDesigner'),
				name: 'PrintDesigner',
				meta: { title: '设计打印模板', icon: '' },
				query: {
					id: '', // 可选参数
				},
			},
		],
	},
	{
		path: '/example/hiprint/index',
		component: Layout,
		hidden: true,
		redirect: 'noredirect',
		children: [
			{
				path: '',
				component: () => import('@/views/example/hiprint/index'),
				name: 'hiprintIndex',
				meta: { title: '打印示例', icon: '' },
			},
		],
	},
	{
		path: '/bpmModel',
		component: Layout,
		hidden: true,
		redirect: 'noredirect',
		name: 'bpmModel',
		children: [
			{
				path: 'processManagement/CreateProcess',
				component: () => import('@/views/bpmModel/processManagement/components/CreateProcess.vue'),
				name: 'CreateProcess',
				meta: { title: '创建流程', icon: '' },
			},
			{
				path: 'formdesigner/editor',
				component: () => import('@/views/bpmModel/formdesigner/editor/index.vue'),
				name: 'BpmFormEditor',
				meta: {
					title: '设计流程表单',
				},
			},
			{
				path: 'processManagement/definition',
				component: () => import('@/views/bpmModel/processManagement/definition/index.vue'),
				name: 'BpmProcessDefinition',
				meta: {
					title: '流程定义',
				},
			},
			{
				path: 'processInstance/manager',
				component: () => import('@/views/bpmModel/processInstance/manager/index.vue'),
				name: 'BpmProcessInstance',
				meta: {
					title: '流程实例',
				},
			},
			{
				path: 'processInstance/index',
				component: () => import('@/views/bpmModel/processInstance/index.vue'),
				name: 'BpmProcessInstanceIndex',
				meta: {
					title: '审批中心',
				},
			},
			{
				path: 'processInstance/create',
				component: () => import('@/views/bpmModel/processInstance/create/index.vue'),
				name: 'BpmProcessInstanceCreate',
				meta: {
					title: '发起流程',
				},
			},
			{
				path: 'processInstance/detail/:id',
				component: () => import('@/views/bpmModel/processInstance/detail/index.vue'),
				name: 'BpmProcessInstanceDetail',
				meta: { title: '流程实例详情', icon: '' },
				props: route => ({
					id: route.query.id,
					taskId: route.query.taskId,
					activityId: route.query.activityId,
				}),
			},
		],
	},
	{
		path: '/equipment',
		component: Layout,
		hidden: true,
		redirect: 'noredirect',
		name: 'equipment',
		children: [
			{
				path: 'maintInfo',
				component: () => import('@/views/equipment/maintInfo/index.vue'),
				name: 'EquipmentMaintInfo',
				meta: {
					title: '设备工单管理',
				},
			},
			{
				path: 'patrolTask',
				component: () => import('@/views/equipment/patrolTask/index.vue'),
				name: 'EquipmentPatrolTask',
				meta: {
					title: '巡检记录',
				},
			},
			{
				path: 'inspectionTask',
				component: () => import('@/views/equipment/inspectionTask/index.vue'),
				name: 'EquipmentInspectionTask',
				meta: {
					title: '点检记录',
				},
			},
			{
				path: 'maintainTask',
				component: () => import('@/views/equipment/maintainTask/index.vue'),
				name: 'EquipmentMaintainTask',
				meta: {
					title: '润滑保养记录',
				},
			},
		],
	},
	{
		path: '/iframe/:id',
		component: () => import('@/layout/index.vue'), // 或者空组件
		meta: {
			title: '外部系统',
			isIframe: true, // 标记为 iframe 页面
		},
	},
	{
		path: '/dashboard/BigScreenDashboard',
		component: () => import('@/views/dashboard/BigScreenDashboard'),
		hidden: true,
		meta: { title: '数据大屏' },
	},
	{
		path: '/dashboard/more',
		component: () => import('@/views/dashboard/MoreScreen'),
		hidden: true,
		meta: { title: '更多' },
	},
]

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
	// {
	// 	path: '/system/dict-data',
	// 	component: Layout,
	// 	hidden: true,
	// 	permissions: ['master:dict:search'],
	// 	children: [
	// 		{
	// 			path: 'index/:dictId(\\d+)',
	// 			component: () => import('@/views/system/dict/data'),
	// 			name: 'Data',
	// 			meta: { title: '字典数据', activeMenu: '/system/dict' },
	// 		},
	// 	],
	// },
]

const router = createRouter({
	history: createWebHistory(),
	routes: constantRoutes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return savedPosition
		} else {
			return { top: 0 }
		}
	},
})

export default router
