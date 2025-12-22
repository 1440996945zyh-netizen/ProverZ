import MyPropertiesPanel from './PropertiesPanel.vue'

/**
 * @description 安装组件
 * @param {Object} Vue Vue 实例
 */
MyPropertiesPanel.install = function (Vue) {
  Vue.component(MyPropertiesPanel.name, MyPropertiesPanel)
}

export default MyPropertiesPanel