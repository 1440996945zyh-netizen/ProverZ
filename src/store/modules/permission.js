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
		if (route.component) {
			// Layout ParentView 组件特殊处理
			if (route.component === 'Layout') {
				route.component = Layout
			} else if (route.component === 'ParentView') {
				route.component = ParentView
			} else if (route.component === 'InnerLink') {
				route.component = InnerLink
			} else {
				route.component = loadView(route.component)
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
	let res
	for (const path in modules) {
		const dir = path.split('views/')[1].split('.vue')[0]
		if (dir === view) {
			res = () => modules[path]()
		}
	}
	return res
}

export default usePermissionStore
