import DefaultTheme from 'vitepress/theme'
import './index.scss'
import '@/assets/styles/index.scss' // global css
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import locale from 'element-plus/lib/locale/lang/zh-cn' // 中文语言

import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

import plugins from '../plugins/index.js' // plugins

import verify from '@/utils/verify/verify'
import { setFormData, setEditTableOptions, deepClone } from '@/utils/common/common' // 业务方法
import { resetObj } from '@/utils/index.js' // 清空对象方法
import { getRules } from '@/utils/verify/validate.js' // form校验规则
import $bus from '@/utils/bus.js' // 全局事件总线
import { createPinia } from 'pinia'
export default {
	...DefaultTheme,
	enhanceApp: async ({ app, router, siteData }) => {
		// app is the Vue 3 app instance from `createApp()`. router is VitePress'
		// custom router. `siteData`` is a `ref`` of current site-level metadata.
		app.use(ElementPlus, {
			locale: locale,
			// 支持 large、default、small
			size: 'default',
		})
		app.use(VXETable)
		app.use(createPinia())
		app.use(plugins)
		app.config.globalProperties.$bus = $bus // 全局事件总线
		app.config.globalProperties.verify = verify // 正则匹配
		app.config.globalProperties.getRules = getRules // 校验rules封装
		app.config.globalProperties.setFormData = setFormData // 修改详情的form
		app.config.globalProperties.setEditTableOptions = setEditTableOptions // 可编辑表格中的下拉框赋值方法
		app.config.globalProperties.resetObj = resetObj // 清空对象
		app.config.globalProperties.deepClone = deepClone // 深拷贝
	},
}
