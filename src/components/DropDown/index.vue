<template>
	<el-dropdown placement="bottom-end">
		<span class="el-dropdown-link">
			{{ dropDownName }}
			<el-icon class="el-icon--right">
				<arrow-down />
			</el-icon>
		</span>
		<template #dropdown>
			<el-dropdown-menu>
				<el-dropdown-item
					v-for="item in dropDownList"
					:key="item.command"
					:command="item.command"
					:disabled="item.disabled"
					@click="clickDrop(item.click)"
				>
					{{ item.name }}
				</el-dropdown-item>
			</el-dropdown-menu>
		</template>
	</el-dropdown>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
const props = defineProps({
	dropDownName: {
		type: String,
		default: '操作',
	},
	dropDownList: {
		type: Array,
	},
})
const clickDrop = e => {
	e()
}
</script>
<style scoped>
.example-showcase .el-dropdown-link {
	cursor: pointer;
	color: var(--el-color-primary);
	display: flex;
	align-items: center;
}
</style>
