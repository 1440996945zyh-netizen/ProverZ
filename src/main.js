// ==================== 基础依赖导入 ====================
import { createApp } from 'vue'
import Cookies from 'js-cookie'

// ==================== UI框架导入 ====================
import ElementPlus from 'element-plus'
import locale from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 1. 引入全量组件
import YYComponents from '@yy-framework/all';
// 2. 引入全量组件样式（元包已整合所有组件样式）
import '@yy-framework/all/style';

import VxeUIAll from 'vxe-pc-ui'
import 'vxe-pc-ui/es/style.css'
import VxeUITable from 'vxe-table'
import 'vxe-table/es/style.css'

// ==================== 样式文件导入 ====================
import '@/assets/styles/index.scss' // 全局样式
import './assets/styles/hiprint.css'
import './assets/styles/print-lock.css'
import './assets/newIconFonts/iconfont.css'
import './assets/home_icon/font_icon/iconfont.css'
import './assets/home_icon/iconfont.css'
import './assets/wficonfont/iconfont.css'
import './assets/wficonfont/iconfont.js'

// ==================== 应用核心模块导入 ====================
import App from './App'
import store from './store'
import router from './router'
import directive from './directive'
import plugins from './plugins'
import './permission'

// ==================== SVG图标相关 ====================
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

// ==================== 工具函数导入 ====================
import { download } from '@/utils/auth/request'
import request from '@/utils/auth/request'
import { ElMessage } from 'element-plus'
import {
	useDict,
	deepClone,
	clearObjectValues,
	flattenToTree,
	setEditTableOptions,
	formatDate,
	addDateRange,
	selectDictLabel,
	selectDictLabels,
	getRules,
	resetForm,
	setFormData,
	filterInput,
} from '@/utils'
import $bus from '@/utils/bus.js'

// ==================== 全局组件导入 ====================
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import Editor from '@/components/Editor'
import ImageUpload from '@/components/ImageUpload'
import ImagePreview from '@/components/ImagePreview'
import TreeSelect from '@/components/TreeSelect'
import DictTag from '@/components/DictTag'

// ==================== 插件导入 ====================
import { setupFormCreate } from '@/plugins/formCreate'
import print from 'vue3-print-nb' // 打印插件
// ==================== 应用初始化 ====================
const app = createApp(App)

// ==================== 全局方法挂载 ====================
app.config.globalProperties.useDict = useDict // 全局字典函数
app.config.globalProperties.download = download // 全局下载函数
app.config.globalProperties.parseTime = formatDate // 全局时间格式化函数
app.config.globalProperties.resetForm = resetForm // 全局重置表单函数
app.config.globalProperties.flattenToTree = flattenToTree // 全局树状结构转换函数
app.config.globalProperties.addDateRange = addDateRange // 全局日期范围添加函数
app.config.globalProperties.selectDictLabel = selectDictLabel // 全局字典标签函数
app.config.globalProperties.selectDictLabels = selectDictLabels // 全局字典标签数组函数
app.config.globalProperties.verify = filterInput // 全局表单验证函数
app.config.globalProperties.getRules = getRules // 全局表单规则函数
app.config.globalProperties.setFormData = setFormData // 全局设置表单数据函数
app.config.globalProperties.setEditTableOptions = setEditTableOptions // 全局设置编辑表格选项函数
app.config.globalProperties.clearObjectValues = clearObjectValues // 全局清除对象值函数
app.config.globalProperties.deepClone = deepClone // 全局深拷贝函数
app.config.globalProperties.$bus = $bus // 全局事件总线
app.config.globalProperties.$message = ElMessage // 全局消息提示函数
app.config.globalProperties.$request = request // 全局请求函数
app.config.warnHandler = () => null // 忽略警告信息

// ==================== 全局组件注册 ====================
app.component('DictTag', DictTag) // 全局字典标签组件
app.component('Pagination', Pagination) // 全局分页组件
app.component('TreeSelect', TreeSelect) // 全局树选择组件
app.component('ImageUpload', ImageUpload) // 全局图片上传组件
app.component('ImagePreview', ImagePreview) // 全局图片预览组件
app.component('RightToolbar', RightToolbar) // 全局右侧操作栏组件
app.component('Editor', Editor) // 全局编辑器组件
app.component('svg-icon', SvgIcon) // 全局SVG图标组件

// ==================== 插件注册 ====================
app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.use(setupFormCreate)
app.use(print)
// ==================== Element Plus图标全局注册 ====================
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
}

// ==================== 自定义指令注册 ====================
directive(app)

// ==================== UI框架配置 ====================
app.use(ElementPlus, {
	locale: locale,
	size: Cookies.get('size') || 'default',
})
app.use(VxeUIAll)
app.use(VxeUITable)
app.use(YYComponents); // 再注册 YY Framework 组件
// ==================== Number原型方法扩展 ====================
Number.prototype._toFixed = Number.prototype.toFixed

Number.prototype.toFixed = function (n) {
	if (n === undefined || n < 0 || n > 20) {
		return this._toFixed(n)
	}
	const num = this.valueOf()
	const power = 10 ** (n + 1)
	let rounded = (num * power + 0.1) / power
	return rounded._toFixed(n)
}

// ==================== 应用挂载 ====================
app.mount('#app')
