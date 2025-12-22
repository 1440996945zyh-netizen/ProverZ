import MyProcessDesigner from './ProcessDesigner.vue'

MyProcessDesigner.install = function (app) {
  app.component(MyProcessDesigner.name, MyProcessDesigner)
}

// 流程图的设计器，可编辑
export default MyProcessDesigner