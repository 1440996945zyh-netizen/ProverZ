<template>
	<el-input
		v-model="value"
		placeholder="Please input"
		:formatter="formatter"
		:parser="parser"
		:disabled="disabled"
		@input="changeInput"
		@keyup.enter="keyupEnter"
	/>
</template>

<script setup name="FormatInput">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const props = defineProps({
	defaultValue: {
		type: [Number, String],
		default: '',
	},
	value: {
		type: [Number, String],
		default: '',
	},
	disabled: {
		type: Boolean,
		default: false,
	},
})
const emit = defineEmits(['input', 'update:value', 'keyup.enter'])

const value = computed({
	get() {
		return formatter(String(props.value))
	},
	set(val) {
		emit('update:value', parser(val))
	},
})
const formatter = value => {
	return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
const parser = value => {
	return value.replace(/\$\s?|(,*)/g, '')
}
const changeInput = value => {
	emit('input', parser(value))
}
const keyupEnter = () => {
	emit('keyup.enter')
}
// onMounted(() => {
// 	if (props.defaultValue !== '') {
// 		value.value = formatter(String(props.defaultValue))
// 	}
// })
defineExpose({})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
