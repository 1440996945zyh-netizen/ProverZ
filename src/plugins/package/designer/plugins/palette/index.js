
// 导入改造后的自定义面板类
import CustomPalette from "./CustomPalette";

// 导出 bpmn-js 插件配置（核心规则不变）
export default {
  // 插件初始化入口
  __init__: ["customPalette"],
  // 声明自定义面板为 "type" 类型（bpmn-js 原生规则）
  customPalette: ["type", CustomPalette]
};