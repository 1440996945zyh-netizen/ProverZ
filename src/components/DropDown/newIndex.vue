<template>
	<el-dropdown placement="bottom-end" @command="clickDrop">
		<span class="el-dropdown-link">
			{{ dropDownName }}
			<el-icon class="el-icon--right">
				<arrow-down />
			</el-icon>
		</span>
		<template #dropdown>
			<el-dropdown-menu>
				<el-dropdown-item v-for="item in filterList" :key="item.command" :command="item.command" :disabled="item.disabled">
					<el-upload
						class="upload_demo"
						v-if="item.type == 'upload'"
						:http-request="item.upload"
						:show-file-list="false"
						accept=".jpeg,.jpg,.png"
						:disabled="item.disabled"
						multiple
						:limit="9"
					>
						<el-button link type="primary" :disabled="item.disabled">{{ item.name }}</el-button>
					</el-upload>
					<el-button v-else :type="item.type ? item.type : 'primary'" :icon="item.icon" link :disabled="item.disabled">
						{{ item.name }}
					</el-button>
				</el-dropdown-item>
			</el-dropdown-menu>
		</template>
	</el-dropdown>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import useUserStore from '../../store/modules/user'
const props = defineProps({
	dropDownName: {
		type: String,
		default: '操作',
	},
	dropDownList: {
		type: Array,
	},
	// 是否为内部项目
	isInner: {
		type: Boolean,
		default: false,
	},
})
const userStore = useUserStore()
const permissions = userStore.permissions
const filterList = computed(() => {
	if (!props.isInner) {
		return props.dropDownList.filter(
			item => (permissions.includes(item.permission) || permissions.includes('*:*:*')) && (item.vif == true || item.vif === undefined)
		)
	} else {
		// 判断是否为项目经理和是否有操作权限
		return props.dropDownList.filter(item => {
			if (!item.projectPermission || !item.manageUserId || !item.projectMenu) return item
			const isManager = item.manageUserId == useUserStore().userId // 判断当前用户是否为项目经理
			const hasProjectPermission = item.projectPermission.includes('ALL') || item.projectPermission.includes(item.projectMenu)
			if (
				permissions.includes(item.permission) &&
				(item.vif == true || item.vif === undefined) &&
				(useUserStore().isSuperadmin == '1' || isManager || hasProjectPermission)
			)
				return item
		})
	}
})
const clickDrop = command => {
	filterList.value.filter(item => item.command === command)[0].click()
}
</script>
<style scoped>
.el-dropdown-link {
	cursor: pointer;
	color: var(--el-color-primary);
	display: flex;
	align-items: center;
}
.el-dropdown {
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
