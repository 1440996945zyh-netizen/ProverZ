import MyProcessDesigner from "./ProcessDesigner.vue";

MyProcessDesigner.install = function(app) {
  app.component(MyProcessDesigner.name, MyProcessDesigner);
};

export default MyProcessDesigner;