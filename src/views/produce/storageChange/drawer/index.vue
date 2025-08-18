<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="100px" :inline="true" label-position="top" :rules="editRules">
			<el-row :gutter="20">
				<el-col :span="6">
					<el-form-item label="日期" prop="workDate">
						<el-date-picker
							v-model="formData.workDate"
							type="date"
							placeholder="日期"
							value-format="YYYY-MM-DD"
							format="YYYY-MM-DD"
							:size="size"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="班次" prop="classCode">
						<Select
							:dataConfig="{ params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } }"
							v-model:value="formData.classCode"
							v-model:label="formData.className"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="3">
					<el-form-item label="本场地调账" prop="localStorageChange">
						<el-checkbox v-model="formData.localStorageChange"></el-checkbox>
					</el-form-item>
				</el-col>
        <el-col :span="6" v-if = "formData.localStorageChange">
          <el-form-item label="调账分类" prop="processOtherCode">
            <el-select
            v-model="formData.processOtherCode"
            >
              <el-option
                v-for="item in processOtherList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label='从垛位' prop='fromMassId'>
						<RemoteSelect
						type='ALL_STORAGE_MASS'
						v-model:value='formData.fromMassId'
						@change='changeFromMass'
						/>
					</el-form-item>

					<!-- <el-form-item label="从库场" prop="fromStorehouseId">
						<Select
							:dataConfig="{ params: { type: 'STORAGE_YARD_LEVEL', parent: '-1', level: '1' } }"
							v-model:value="formData.fromStorehouseId"
							v-model:label="formData.fromStorehouseName"
							@change="changeFromStorehouse"
						/>
					</el-form-item> -->
				</el-col>
				<!-- <el-col :span="6">
					<el-form-item label="从区域" prop="fromRegionId">
						<Select
							:dataConfig="{ params: { type: 'STORAGE_YARD_LEVEL', parent: formData.fromStorehouseId, level: '2' } }"
							v-model:value="formData.fromRegionId"
							v-model:label="formData.fromRegionName"
							@change="changeFromRegion"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="从垛位" prop="fromMassId">
						<Select
							:dataConfig="{ params: { type: 'STORAGE_YARD_LEVEL', parent: formData.fromRegionId, level: '3' } }"
							v-model:value="formData.fromMassId"
							v-model:label="formData.fromMassName"
							@change="changeFromMass"
						/>
					</el-form-item>
				</el-col> -->
				<el-col :span="12">
					<el-button type="primary" @click="selPortStorageYard">选择场存</el-button>
				</el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :span="6">
					<el-form-item label="场存" prop="fromPortStorageYard">
						<el-input v-model="formData.fromPortStorageYard" disabled/>
					</el-form-item>
				</el-col>
				<el-col :span="18">
					<el-form-item label="票货信息" prop="fromTrustCargoInfo">
						<el-input v-model="formData.fromTrustCargoInfo" disabled/>
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="20" v-if="!formData.localStorageChange">
				<!-- <el-col :span="6">
					<el-form-item label="到库场" prop="toStorehouseId">
						<Select
							:dataConfig="{ params: { type: 'STORAGE_YARD_LEVEL', parent: '-1', level: '1' } }"
							v-model:value="formData.toStorehouseId"
							v-model:label="formData.toStorehouseName"
							@change="changeToStorehouse"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="到区域" prop="toRegionId">
						<Select
							:dataConfig="{ params: { type: 'STORAGE_YARD_LEVEL', parent: formData.toStorehouseId, level: '2' } }"
							v-model:value="formData.toRegionId"
							v-model:label="formData.toRegionName"
							@change="changeToRegion"
						/>
					</el-form-item>
				</el-col> -->
				<el-col :span="12">
					<!-- <el-form-item label="到垛位" prop="toMassId">
						<Select
							:dataConfig="{ params: { type: 'STORAGE_YARD_LEVEL', parent: formData.toRegionId, level: '3' } }"
							v-model:value="formData.toMassId"
							v-model:label="formData.toMassName"
							@change="changeToMass"
						/>
					</el-form-item> -->
					<el-form-item label='到垛位' prop='toMassId'>
						<RemoteSelect
							type='ALL_STORAGE_MASS'
							v-model:value='formData.toMassId'
							@change='changeToMass'
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="场存" prop="workDate">
						<el-input v-model="formData.toPortStorageYard" disabled/>
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :span="6">
					<el-form-item label="件数" prop="quantity">
						<el-input v-model="formData.quantity"/>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="重量" prop="ton">
						<el-input v-model="formData.ton"/>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="备注" prop="remark">
						<el-input v-model="formData.remark"/>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>

		<el-drawer v-model="drawerVisible" title="选择场存" size="80%">
			<drawerCargoList ref="drawerCargoListRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">{{ '取消' }}</el-button>
					<el-button type="primary" @click="save">选择</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="drawer">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/produce/storageChange/index.js'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import drawerCargoList from '../drawerCargoList/index.vue'

const processOtherList =ref(
  [{label:"调账（涨吨）",value:"p1"},{label:"调账（亏吨）",value:"p2"},{label:"本地调账",value:"p3"}]
)

const formData = reactive({
	id: '',
	workDate: '', //作业日期
	classCode: '', //作业班次
	className: '',
	localStorageChange: true, //本场地调账
	fromStorehouseId: '',
	fromRegionId: '',
	fromMassId: '',
	fromStorehouseName: '',
	fromRegionName: '',
	fromMassName: '',
	fromPortStorageYard: '',// 场存
	companyId: '',
	companyName: '',
	fromTrustCargoId: '', //票货id
	fromTrustCargoInfo: '',// 票货信息
	toStorehouseId: '',
	toRegionId: '',
	toMassId: '',
	toStorehouseName: '',
	toRegionName: '',
	toMassName: '',
	toPortStorageYard: '',// 场存
	quantity: 0, //件数
	ton: 0, //重量
	remark: '', //备注
})
const ruleForm = ref()
const drawerVisible = ref(false)
const drawerCargoListRef = ref(null) // 明细组件ref
const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
			console.log('err')
		}
	})
	return flag
}

// 修改垛位处理数据
const changeFromMass = row => {

	formData.fromStorehouseId = '';
	formData.fromRegionId = '';
	formData.fromMassId = '';
	formData.fromStorehouseName = '';
	formData.fromRegionName = '';
	formData.fromMassName = '';
	formData.fromPortStorageYard = '';
	formData.companyId = '';
	formData.companyName = '';
	formData.fromTrustCargoId = '';
	formData.fromTrustCargoInfo = '';

	if(row){
		formData.fromStorehouseId = row.storehouseId
		formData.fromRegionId = row.regionId
		formData.fromMassId = row.massId
		formData.fromStorehouseName = row.storehouseName
		formData.fromRegionName = row.regionName
		formData.fromMassName = row.massName
	}
}
const changeToMass = e => {
	formData.toStorehouseId = ''
	formData.toRegionId = ''
	formData.toMassId = ''
	formData.toStorehouseName = ''
	formData.toRegionName = ''
	formData.toMassName = ''
	formData.toPortStorageYard = ''// 场存

	if(!formData.fromMassId){
		proxy.$modal.msgWarning('请选择从垛位！')
		return ;
	}

	if(!formData.fromTrustCargoId){
		proxy.$modal.msgWarning('请先选择票货！')
		return ;
	}

	if(!formData.companyId || !formData.companyId){
		proxy.$modal.msgWarning('未获取到票货作业公司信息！')
		return ;
	}

	if(e){
		formData.toStorehouseId = e.storehouseId
		formData.toRegionId = e.regionId
		formData.toMassId = e.massId
		formData.toStorehouseName = e.storehouseName
		formData.toRegionName = e.regionName
		formData.toMassName = e.massName
	}

	// 查询场存信息
	api.getPortStorage({massId: formData.toMassId, cargoInfoId: formData.fromTrustCargoId}).then(res => {
		if(res.data){
			formData.toPortStorageYard = (res.data.quantity + "件|" + res.data.ton +"吨")
		} else {
			formData.toPortStorageYard = "";
		}
	})
}
const selPortStorageYard = () => {
	if(!formData.fromMassId){
		proxy.$modal.msgWarning('请选择从垛位！')
		return ;
	}

	drawerVisible.value = true

	nextTick(() => {
		drawerCargoListRef.value.clickRow = null
		drawerCargoListRef.value.queryParams.massId = formData.fromMassId
		drawerCargoListRef.value.getList()
	})
}
// 选择票货明细
const save = async () => {
	if(!drawerCargoListRef.value.clickRow){
		proxy.$modal.msgWarning('请选择票货信息！')
		return ;
	}

	formData.fromPortStorageYard = (drawerCargoListRef.value.clickRow.quantity + "件|" + drawerCargoListRef.value.clickRow.ton +"吨")
	formData.fromTrustCargoId = drawerCargoListRef.value.clickRow.cargoInfoId
	formData.companyId = drawerCargoListRef.value.clickRow.companyId
	formData.companyName = drawerCargoListRef.value.clickRow.companyName
	formData.fromTrustCargoInfo = drawerCargoListRef.value.clickRow.cargoInfoLabel

	drawerVisible.value = false
}

const editRules = ref({
	workDate: proxy.getRules({
		required: true,
	}),
	classCode: proxy.getRules({
		required: true,
	}),
	fromStorehouseId: proxy.getRules({
		required: true,
	}),
	fromRegionId: proxy.getRules({
		required: true,
	}),
	fromMassId: proxy.getRules({
		required: true,
	}),
	fromTrustCargoInfo: proxy.getRules({
		required: true,
	}),
	ton: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 4,
		},
	}),
	quantity: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 0,
		},
	}),
})
const resetForm = () => {
	proxy.resetObj(formData)
}
defineExpose({
	validate,
	formData,
	resetForm
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
	width: 100%;
	padding: 0 10px 0 0;
	justify-content: space-between;
	align-items: center;
}
</style>
