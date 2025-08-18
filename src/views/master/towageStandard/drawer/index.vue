<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="110px" :rules="rules">
			<el-form-item label="费目" prop="itemCd">
				<Select :selectData="itemCdList" v-model:value="formData.itemCd" v-model:label="formData.itemTypeNm" />
				<!-- :disabled="formData.itemCd == '03'" -->
			</el-form-item>
			<el-form-item label="内外贸" prop="tradeType">
				<el-radio-group v-model="formData.tradeType">
					<el-radio label="内贸" value="内贸">内贸</el-radio>
					<el-radio label="外贸" value="外贸">外贸</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="船长" prop="shipLength">
				<el-input v-model="formData.shipLength" placeholder="请输入数字" />
			</el-form-item>
			<el-form-item label="船型" prop="shipTypeCode">
				<Select
					:dataConfig="{ url: '/api/internal/public/getDictListByType/SHIP_TYPE' }"
					v-model:value="formData.shipTypeCode"
					v-model:label="formData.shipTypeLabel"
				/>
			</el-form-item>
			<el-form-item label="单价" prop="rate">
				<el-input
					v-model="formData.rate"
					@input="formData.rate = proxy.verify('twoPoint', formData.rate)"
					placeholder="请输入单价"
				/>
			</el-form-item>

			<el-form-item label="税率" prop="taxRate">
				<el-input v-model="formData.taxRate" size="mini" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="drawer">
import publicApi from '@/api/public/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'

import Select from '@/components/Select'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const ruleForm = ref()
const formData = reactive({
	id: '',
	itemCd: '', //费目
	tradeType: '', //内外贸
	shipLength: '', //船长
	shipTypeCode: '', //船型
	rate: '', //单价
	taxRate: '', //税率
})
const rules = reactive({
	itemCd: proxy.getRules({ required: true }),
	rate: proxy.getRules({ required: true }),
	taxRate: proxy.getRules({
		required: true,
		numberCheck: {
			int: 2,
			dec: 2,
		},
	}),
})

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}
const resetForm = () => {
	proxy.resetObj(formData)
}
// 费目类型列表
const itemCdList = ref([])
const getItemCd = () => {
	let data = {
		type: 'FEE_ITEM',
	}
	publicApi.getLocalSelect(data).then(response => {
		itemCdList.value = response.data.map(item => {
			if (item.value !== '03') {
				item.disabled = true
			}
			return item
		})
	})
}
getItemCd()
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
