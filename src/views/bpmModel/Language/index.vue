<!--
 * @Author: zhangsd
 * @Date: 2026-02-24 10:29:17
 * @LastEditTime: 2026-02-24 10:41:33
 * @LastEditors: zhangsd
 * @Description: 常用审批语配置
 * @FilePath: \view\src\views\bpmModel\Language\index.vue
-->

<template>
    <div class="app-container">
      <BaseTable
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:rowConfig="rowConfig"
			:tableHeight="tableHeight"
			:loading="loading"
			:showPagination="true"
			:showToolBar="false"
			:showNum="5"
			defaultWidth="50"
			:total="total"
		/>
    </div>
</template>
<script setup>
 import BaseTable from '@/components/BaseTable/index.vue'
import { ref, onMounted } from 'vue'
import { getList } from '@/api/bpmModel/processLanguage'

const loading = ref(false)
</script>

<style>
 
</style>