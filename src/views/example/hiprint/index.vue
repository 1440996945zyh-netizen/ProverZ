<!--
 * @Author: zhangsd
 * @Date: 2025-09-04 10:05:32
 * @LastEditTime: 2025-09-04 14:16:19
 * @LastEditors: zhangsd
 * @Description: 自定义打印
 * @FilePath: \view\src\views\example\hiprint\index.vue
-->
<template>
	<div class="app-container">
        <PrintDesigner ref="printDesignerRef"/>
    </div>
</template>

<script setup>
    import PrintDesigner from './detail/PrintDesigner.vue'

    // 父组件示例（假设设计器组件ref为printDesigner）
const editTemplate = (template) => {
  printDesignerRef.value.setEditTemplate({
    id: template.id,
    rateTypeCode: template.rateTypeCode,
    rateTypeName: template.rateTypeName,
    model: template.model, // 模板JSON字符串
  });
};
</script>
<style lang="scss" scoped>

</style>
