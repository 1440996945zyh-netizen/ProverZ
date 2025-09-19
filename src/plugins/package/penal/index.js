import MyPropertiesPanel from "./PropertiesPanel.vue";

MyPropertiesPanel.install = function(app) {
  app.component(MyPropertiesPanel.name, MyPropertiesPanel);
};

export default MyPropertiesPanel;