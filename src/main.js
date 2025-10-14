import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import locale from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import VxeUIAll from 'vxe-pc-ui'
import 'vxe-pc-ui/es/style.css'
import VxeUITable from 'vxe-table'
import 'vxe-table/es/style.css'


// import { hiPrintPlugin } from 'vue-plugin-hiprint'
// 样式
import "./assets/styles/hiprint.css"
import "./assets/styles/print-lock.css"
// hiPrintPlugin.disAutoConnect() // 取消自动连接直接打印客户端

import '@/assets/styles/index.scss' // global css
import './assets/newIconFonts/iconfont.css' // iconfont
import './assets/home_icon/font_icon/iconfont.css' // iconfont
import './assets/home_icon/iconfont.css' // iconfont
import './assets/wficonfont/iconfont.css' // wficonfont
import './assets/wficonfont/iconfont.js' // wficonfont

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/auth/request'
import request from '@/utils/auth/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'
import { ElMessage } from 'element-plus'

import './permission' // permission control
import {
  useDict, deepClone, clearObjectValues, flattenToTree, setEditTableOptions, formatDate, addDateRange, selectDictLabel,
  selectDictLabels, getRules, resetForm, setFormData, filterInput
} from '@/utils'


import $bus from '@/utils/bus.js'
// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from '@/components/Editor'
// 图片上传组件
import ImageUpload from '@/components/ImageUpload'
// 图片预览组件
import ImagePreview from '@/components/ImagePreview'
// 自定义树选择组件
import TreeSelect from '@/components/TreeSelect'
// 字典标签组件
import DictTag from '@/components/DictTag'
// import hljs from 'highlight.js'
// import highlightPlugin from '@highlightjs/vue-plugin'
// import "highlight.js/styles/atom-one-dark-reasonable.css"; // 保持原样式

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = formatDate
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.flattenToTree = flattenToTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels
app.config.globalProperties.verify = filterInput // 正则匹配
app.config.globalProperties.getRules = getRules // 校验rules封装
app.config.globalProperties.setFormData = setFormData // 修改详情的form
app.config.globalProperties.setEditTableOptions = setEditTableOptions // 可编辑表格中的下拉框赋值方法
app.config.globalProperties.clearObjectValues = clearObjectValues // 清空对象方法
app.config.globalProperties.deepClone = deepClone // 深拷贝
app.config.globalProperties.$bus = $bus // 全局事件总线
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$request = request //等同于vue2的Vue.prototype.$request = request
app.config.warnHandler = () => null

// 全局组件挂载
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('TreeSelect', TreeSelect)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)

app.use(router)
app.use(store)
app.use(plugins)
// app.use(hiPrintPlugin)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)
// app.use(highlightPlugin, { hljs })
// 在 main.js 或入口文件中
Number.prototype._toFixed = Number.prototype.toFixed; // 备份原方法

Number.prototype.toFixed = function (n) {
  //console.log("精度计算")
  // 处理边界情况
  if (n === undefined || n < 0 || n > 20) {
    return this._toFixed(n);
  }
  const num = this.valueOf();
  // 使用科学计数法避免浮点误差
  const power = 10 ** (n + 1); // 放大到 n+1 位
  // 添加极小修正值（避免浮点误差干扰）
  let rounded = ((num * power + 0.1) / power);
  return rounded._toFixed(n)
};

directive(app)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: Cookies.get('size') || 'default',
})
app.use(VxeUIAll)
app.use(VxeUITable)


app.mount('#app')
