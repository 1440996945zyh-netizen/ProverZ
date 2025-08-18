<template>
	<el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="票货信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="作业公司" prop="companyName">
							<div style="width: 100%">
								<Select
									:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
									v-model:value="formData.companyId"
									v-model:label="formData.companyName"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="船名航次" prop="shipvoyageItemId">
							<div style="width: 100%">
								<RemoteSelect type="VOYAGE" v-model:value="formData.shipvoyageItemId" @change="changeSelect1" />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货主" prop="cargoOwnerName">
							<div style="width: 100%">
								<RemoteSelect
									type="CUSTOMER_CARGO_OWNER"
									v-model:value="formData.cargoOwnerId"
									v-model:label="formData.cargoOwnerName"
									@change="changeSelect1"
								/>
							</div>
						</el-form-item>
					</el-col>
					<!-- <el-col :span="6">
						<el-form-item label="货代" prop="cargoAgentName">
							<div style="width: 100%">
								<RemoteSelect
									type="CUSTOMER_CARGO_AGENT"
									v-model:value="formData.cargoAgentId"
									v-model:label="formData.cargoAgentName"
									@change="changeSelect1"
								/>
							</div>
						</el-form-item>
					</el-col> -->
					<el-col :span="6">
						<el-form-item label="货名" prop="cargoName">
							<div style="width: 100%">
								<RemoteSelect
									type="CARGO_INFO"
									v-model:value="formData.cargoCode"
									v-model:label="formData.cargoName"
									@change="changeSelect1"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="贸别" prop="tradeType">
							<div style="width: 100%">
								<Select
									:selectData="[
										{ label: '内贸', value: '内贸' },
										{ label: '外贸', value: '外贸' },
									]"
									v-model:value="formData.tradeType"
									v-model:label="formData.tradeType"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="包装" prop="packingName">
							<div style="width: 100%">
								<Select
									:dataConfig="{ url: '/api/internal/public/getDictListByType/PACKAGE_TYPE' }"
									v-model:value="formData.packingCode"
									v-model:label="formData.packingName"
									@change="changeSelect"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="件数" prop="quantity">
							<el-input v-model="formData.quantity" placeholder="长度最长为8位" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="重量（吨）" prop="ton">
							<el-input v-model="formData.ton" placeholder="小数点前最长7位,小数点后最长4位" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货权量" prop="rightsQuantity">
							<el-input v-model="formData.rightsQuantity" disabled />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="剩余货权量" prop="surplusRightsQuantity">
							<el-input v-model="formData.surplusRightsQuantity" disabled />
						</el-form-item>
					</el-col>
					<!-- <el-col :span="6">
						<el-form-item label="是否完货" prop="isClear">
							<el-radio-group v-model="formData.isClear">
								<el-radio label="1" value="1">是</el-radio>
								<el-radio label="0" value="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col> -->
				</el-row>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="drawer">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import publicApi from '@/api/public/index'
const collapseOpen = ['1', '2'] // 打开的面板
let selectLabel = ref('dictLabel')
let selectValue = ref('dictValue')
const myValue = ref('')
const myLabel = ref('')
const ruleForm = ref()
const myValue1 = ref('')
const myLabel1 = ref('')
const changeSelect1 = val => {
	console.log('远程回显')
	console.log(val, myValue1.value, myLabel1.value) // {"label": "陈学龙","value": "1655753239867559936"} 陈学龙 1655753239867559936
}
const formData = reactive({
	id: '',
	// cargoAgentId: '',
	// cargoAgentName: '', //货代
	cargoCode: '',
	cargoName: '', //货名
	cargoOwnerId: '',
	cargoOwnerName: '', //货主
	companyId: '',
	companyName: '', //作业公司
	packingCode: '',
	packingName: '', //包装
	isClear: '0',
	tradeType: '',
	shipvoyageItemId: '',
	ton: '',
	quantity: '',
	rightsQuantity: '',
	surplusRightsQuantity: '',
})
const rules = reactive({
	companyName: proxy.getRules({
		required: true,
	}),
	cargoOwnerName: proxy.getRules({
		required: true,
	}),
	// cargoAgentName: proxy.getRules({
	// 	required: true,
	// }),
	cargoName: proxy.getRules({
		required: true,
	}),
	tradeType: proxy.getRules({
		required: true,
	}),
	packingName: proxy.getRules({
		required: true,
	}),

	quantity: proxy.getRules({
		length: '0-8',
	}),
	ton: proxy.getRules({
		required: true,
		numberCheck: {
			int: 7,
			dec: 4,
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
// 表单重置
const resetForm = () => {
	proxy.resetObj(formData)
}
const changeSelect = val => {
	console.log(val, myValue.value, myLabel.value)
}
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
