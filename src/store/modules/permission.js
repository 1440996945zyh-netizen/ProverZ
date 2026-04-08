import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'
import { defineStore } from 'pinia'

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

const usePermissionStore = defineStore('permission', {
	state: () => ({
		routes: [],
		addRoutes: [],
		defaultRoutes: [],
		topbarRouters: [],
		sidebarRouters: [],
		// 新增：缓存的菜单数据
		menuData: [],
	}),
	actions: {
		setRoutes(routes) {
			this.addRoutes = routes
			this.routes = constantRoutes.concat(routes)
		},
		setDefaultRoutes(routes) {
			this.defaultRoutes = constantRoutes.concat(routes)
		},
		setTopbarRoutes(routes) {
			this.topbarRouters = routes
			// 同时更新菜单数据缓存
			this.menuData = routes
		},
		setSidebarRouters(routes) {
			this.sidebarRouters = routes
		},
		// 新增：获取菜单数据（优先使用缓存）
		getMenuData() {
			// 如果sidebarRouters不为空，直接返回，否则返回缓存的menuData
			return this.sidebarRouters.length > 0 ? this.sidebarRouters : this.menuData
		},
		// 新增：根据路径查找菜单项
		findMenuByPath(targetPath) {
			const normalizePath = path => {
				if (!path) return ''
				return path.replace(/^\/+/, '')
			}

			const buildFullPath = (parentPath, childPath) => {
				// 如果childPath是绝对路径（以/开头），直接返回
				if (childPath && childPath.startsWith('/')) {
					return childPath
				}

				// 如果没有父路径，直接返回子路径
				if (!parentPath) {
					return childPath || ''
				}

				// 如果父路径是根路径
				if (parentPath === '/') {
					return childPath ? (childPath.startsWith('/') ? childPath : '/' + childPath) : '/'
				}

				// 拼接路径
				if (childPath) {
					return parentPath + (childPath.startsWith('/') ? '' : '/') + childPath
				}

				return parentPath
			}

			const findInMenu = (menuList, currentPath = '') => {
				for (const item of menuList) {
					// 计算当前菜单项的完整路径
					const fullPath = buildFullPath(currentPath, item.path)

					// 直接匹配完整路径
					if (normalizePath(fullPath) === normalizePath(targetPath)) {
						return item
					}

					// 如果当前菜单项有子菜单，递归查找
					if (item.children && item.children.length) {
						const found = findInMenu(item.children, fullPath)
						if (found) return found
					}
				}
				return null
			}

			return findInMenu(this.getMenuData())
		},
		// 新增：获取扁平化的菜单列表
		getFlatMenuList(menuList = null) {
			const flatList = []
			const flatten = menus => {
				menus.forEach(menu => {
					flatList.push(menu)
					if (menu.children && menu.children.length) {
						flatten(menu.children)
					}
				})
			}
			flatten(menuList || this.getMenuData())
			return flatList
		},
		generateRoutes(roles) {
			return new Promise(resolve => {
				// 向后端请求路由数据
				getRouters().then(res => {
					const sdata = JSON.parse(JSON.stringify(res.data))
					const rdata = JSON.parse(JSON.stringify(res.data))
					const defaultData = JSON.parse(JSON.stringify(res.data))
					const sidebarRoutes = filterAsyncRouter(sdata)
					const rewriteRoutes = filterAsyncRouter(rdata, false, true)
					const defaultRoutes = filterAsyncRouter(defaultData)
					const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
					asyncRoutes.forEach(route => {
						router.addRoute(route)
					})
					this.setRoutes(rewriteRoutes)
					this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
					this.setDefaultRoutes(sidebarRoutes)
					this.setTopbarRoutes(defaultRoutes)
					resolve(rewriteRoutes)
				})
			})
		},
	},
})

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
	return asyncRouterMap.filter(route => {
		if (type && route.children) {
			route.children = filterChildren(route.children)
		}
		if (!route.meta) route.meta = {}
		// 假设后端返回的菜单数据中包含id字段
		route.meta.menuId = route.id
		const componentStr = route.component;
		if (route.component) {
			// 1. 如果 component 已经是对象/函数（说明处理过了），直接跳过
			if (typeof route.component !== 'string') {
				return true;
			}
			// Layout ParentView 组件特殊处理
			if (route.component === 'Layout') {
				route.component = Layout
			} else if (route.component === 'ParentView') {
				route.component = ParentView
			} else if (route.component === 'InnerLink') {
				route.component = InnerLink
			} else if (route.parentId == '0' && route.menuType == 'C' && route.isFrame == '0') {
				const rawPath = route.path; 

				// 清洗路径，去除 component 开头的斜杠，否则 loadView 会失效
				const cleanComponentPath = componentStr.startsWith('/') ? componentStr.slice(1) : componentStr;

				// 备份当前路由的原始信息
				const originalName = route.name;
				const originalMeta = { ...route.meta };

				// 重组父路由
				route.component = Layout;
				route.name = undefined; // 父路由不设置 name，防止与子路由冲突
				route.redirect = `${rawPath}/index`;

				// 显式创建子路由，并确保 component 被正确赋值
				route.children = [{
					path: 'index',
					component: loadView(cleanComponentPath), // 确保这里返回了正确的组件对象/函数
					name: originalName,
					meta: originalMeta,
					query: route.query
				}];
			} else {
				const cleanPath = componentStr.startsWith('/') ? componentStr.slice(1) : componentStr;
				route.component = loadView(cleanPath);
			}
		}
		if (route.children != null && route.children && route.children.length) {
			route.children = filterAsyncRouter(route.children, route, type)
		} else {
			delete route['children']
			delete route['redirect']
		}
		return true
	})
}


function filterChildren(childrenMap, lastRouter = false) {
	var children = []
	childrenMap.forEach((el, index) => {
		if (el.children && el.children.length) {
			if (el.component === 'ParentView' && !lastRouter) {
				el.children.forEach(c => {
					c.path = el.path + '/' + c.path
					if (c.children && c.children.length) {
						children = children.concat(filterChildren(c.children, c))
						return
					}
					children.push(c)
				})
				return
			}
		}
		if (lastRouter) {
			el.path = lastRouter.path + '/' + el.path
		}
		children = children.concat(el)
	})
	return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
	const res = []
	routes.forEach(route => {
		res.push(route)
		// if (route.permissions) {
		//   if (auth.hasPermiOr(route.permissions)) {
		//     res.push(route)
		//   }
		// } else if (route.roles) {
		//   if (auth.hasRoleOr(route.roles)) {
		//     res.push(route)
		//   }
		// }
	})
	return res
}

export const loadView = view => {
	if (!view) return null
	// 如果传进来的不是字符串，说明逻辑有误，直接返回
	if (typeof view !== 'string') return view;
	// 标准化路径，去掉开头的 /
	const normalizedView = view.startsWith('/') ? view.slice(1) : view;
	let res
	for (const path in modules) {
		const dir = path.split('views/')[1].split('.vue')[0]
		// 比较时使用标准化后的路径
		if (dir === normalizedView) {
			res = () => modules[path]()
		}
	}
	return res
}

export default usePermissionStore
