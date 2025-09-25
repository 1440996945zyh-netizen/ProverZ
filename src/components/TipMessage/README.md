# TipMessage 提示组件使用文档

## 组件介绍

`TipMessage` 是基于 Vue3 + Element Plus 开发的可复用卡片式提示组件，支持 **4种状态类型**（默认/警告/错误/成功），每种状态对应独立的图标与配色，可灵活自定义标题和内容，适用于系统通知、操作反馈、风险提示等场景。


## 1. 组件特性

- **多状态支持**：内置 Primary（默认）、Warning（警告）、Error（错误）、Success（成功）4种状态，视觉区分清晰
- **灵活自定义**：支持自定义标题、提示内容，适配不同业务场景
- **响应式交互**： hover 时卡片阴影加深，提升交互体验
- **统一视觉规范**：图标、边框色、文字色联动，保持设计一致性


## 2. 快速上手

### 2.1 安装依赖

确保项目已集成 Element Plus 及图标库（组件依赖 Element Plus 图标）：

```bash
# 安装 Element Plus
npm install element-plus @element-plus/icons-vue
```

### 2.2 引入组件

在需要使用的页面/组件中引入 `TipMessage`：

```vue
<template>
  <div>
    <!-- 使用组件 -->
    <TipMessage>这是一条默认的提示信息</TipMessage>
  </div>
</template>

<script setup>
// 引入组件（路径根据实际项目结构调整）
import TipMessage from '@/components/TipMessage/index.vue';
</script>
```


## 3. 组件 API

### 3.1 Props 参数

| 参数名  | 类型   | 可选值                              | 默认值                                 | 说明                                     |
| ------- | ------ | ----------------------------------- | -------------------------------------- | ---------------------------------------- |
| `type`  | String | Primary / Warning / Error / Success | Primary                                | 提示组件的状态类型，决定图标和配色       |
| `title` | String | -                                   | 自动匹配类型（如 Primary 对应 "INFO"） | 提示卡片的标题，未传时按类型显示默认标题 |


### 3.2 插槽（Slot）

| 插槽名   | 说明                                                         |
| -------- | ------------------------------------------------------------ |
| 默认插槽 | 提示组件的核心内容区域，用于传入自定义提示文本、链接或简单HTML结构 |


### 3.3 样式联动规则

每种状态对应的视觉元素（图标/颜色）遵循以下规则，无需手动配置：

| 状态类型 | 图标                           | 边框色/图标色   | 默认标题 | 适用场景                         |
| -------- | ------------------------------ | --------------- | -------- | -------------------------------- |
| Primary  | InfoFilled（信息图标）         | #409eff（蓝色） | INFO     | 普通通知、操作说明、系统提示     |
| Warning  | WarningFilled（警告图标）      | #e6a23c（橙色） | WARNING  | 风险提示、需注意的操作、潜在问题 |
| Error    | WarnTriangleFilled（错误图标） | #f56c6c（红色） | ERROR    | 操作失败、数据异常、错误反馈     |
| Success  | SuccessFilled（成功图标）      | #67c23a（绿色） | SUCCESS  | 操作成功、数据提交完成、任务完成 |


## 4. 使用示例

### 4.1 基础用法（默认状态）

无需传参，默认使用 `Primary` 类型，显示默认标题 "INFO"：

```vue
<TipMessage>
  系统将于23:00进行例行维护，维护期间服务可能暂停，请提前做好准备。
</TipMessage>
```


### 4.2 按状态使用

#### 4.2.1 警告状态（Warning）

```vue
<TipMessage type="Warning">
  该操作将清除本地缓存，清除后无法恢复，请确认是否继续。
</TipMessage>
```

#### 4.2.2 错误状态（Error）

```vue
<TipMessage type="Error">
  数据提交失败！请检查以下问题：<br>
  1. 用户名不能为空<br>
  2. 手机号格式不正确
</TipMessage>
```

#### 4.2.3 成功状态（Success）

```vue
<TipMessage type="Success">
  表单提交成功！您的申请已进入审核流程，预计1-2个工作日内反馈结果。
</TipMessage>
```


### 4.3 自定义标题

通过 `title` 属性自定义卡片标题，覆盖默认标题：

```vue
<TipMessage type="Success" title="操作完成">
  您的个人信息已更新，新信息将在下次登录后生效。
</TipMessage>
```


### 4.4 内容带链接

支持在提示内容中插入链接（自动适配链接样式）：

```vue
<TipMessage type="Primary" title="文档指引">
  如需了解更多操作细节，请查看 
  <a href="/docs/operation-guide" target="_blank">《系统操作指南》</a>，
  或联系客服获取帮助。
</TipMessage>
```


## 5. 样式说明

组件内置统一样式，如需个性化调整，可在组件源码的 `<style scoped>` 中修改以下关键样式：

| 样式类             | 作用     | 可调整属性                                                   |
| ------------------ | -------- | ------------------------------------------------------------ |
| `.custom-tip-card` | 卡片容器 | `padding`（内边距）、`border-radius`（圆角）、`box-shadow`（阴影） |
| `.tip-header`      | 标题区域 | `font-size`（标题字号）、`gap`（图标与标题间距）、`margin-bottom`（与内容间距） |
| `.tip-icon`        | 状态图标 | `font-size`（图标大小，默认16px）                            |
| `.tip-content`     | 内容区域 | `padding-left`（内容缩进）、`color`（内容文字色）、`line-height`（行高） |


## 6. 常见问题

### Q1：图标不显示或报错？

A：检查是否正确引入 Element Plus 图标库，确保 `@element-plus/icons-vue` 已安装，且组件内图标导入路径正确（参考组件源码的 `import { InfoFilled, ... }` 部分）。

### Q2：如何修改某类状态的颜色？

A：在组件的 `iconColor` 计算属性中调整对应状态的色值，例如修改错误状态颜色：

```javascript
const iconColor = computed(() => {
  const colors = {
    // ...其他状态
    Error: '#ff4d4f', // 自定义错误色
  };
  return colors[props.type];
});
```

### Q3：内容缩进（padding-left）不合适？

A：修改 `.tip-content` 类的 `padding-left` 属性，建议与图标宽度 + 间距保持一致（默认图标16px + 间距8px = 24px，对应 `padding-left: 24px`）。