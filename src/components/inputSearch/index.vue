<template>
	<el-input v-model="value" @input="props.handleInput ? props.handleInput : myInput" :disabled="disabled" :placeholder="placeholder">
		<template #suffix>
			<el-icon class="el-input__icon" :style="disabled ? 'cursor:no-drop' : 'cursor: pointer'" @click="open"><Search /></el-icon>
		</template>
	</el-input>
</template>

<script setup name="inputSearch">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
const emit = defineEmits(['update:value', 'open'])
const props = defineProps({
	value: {
		type: String,
		default: '',
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	handleInput: {
		type: Function,
	},
	placeholder: {
		type: String,
		default: '请输入...',
	},
})
const value = computed({
	get() {
		return props.value
	},
	set(val) {
		emit('update:value', val)
	},
})
const myInput = () => {
	value.value = ''
}
const open = () => {
	if (!props.disabled) {
		emit('open')
	}
}
</script>

<style lang="scss" scoped></style>
