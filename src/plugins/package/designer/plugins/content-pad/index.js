
// 导入改造后的自定义上下文菜单提供者（注意路径与文件名匹配）
import CustomContextPadProvider from "./contentPadProvider";
// 导出bpmn-js插件配置（核心规则不变，仅语法适配ES6）
export default {
  __init__: ["contextPadProvider"],
  contextPadProvider: ["type", CustomContextPadProvider]
};