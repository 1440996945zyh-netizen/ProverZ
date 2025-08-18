<template>
	<el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="货权转移" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="原票货" prop="cargoInfoIdSource">
							<div style="width: 100%">
								<RemoteSelect
									type="BUS_CARGO_INFO"
									v-model:value="formData.cargoInfoIdSource"
									disabled
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="目标货主" prop="cargoOwnerName">
							<div style="width: 100%">
								<RemoteSelect
									type="CUSTOMER_CARGO_OWNER"
									v-model:value="formData.cargoOwnerId"
									v-model:label="formData.cargoOwnerName"
									@change="changeCargoOwner"
                  :disabled="isDisabled"
								/>
							</div>
						</el-form-item>
					</el-col>
					<!--<el-col :span="6">
						<el-form-item label="目标货代" prop="cargoAgentName">
							<div style="width: 100%">
								<RemoteSelect
									type="CUSTOMER_CARGO_AGENT"
									v-model:value="formData.cargoAgentId"
									v-model:label="formData.cargoAgentName"
									@change="changeSelect1"
								/>
							</div>
						</el-form-item>
					</el-col>-->
					<el-col :span="6">
						<el-form-item label="货转日期" prop="transferDate">
							<div style="width: 100%">
								<el-date-picker
									v-model="formData.transferDate"
									value-format="YYYY-MM-DD"
									format="YYYY-MM-DD"
									type="date"
									placeholder="请选择"
									:size="size"
                  :disabled="isDisabled"
								/>
							</div>
						</el-form-item>
					</el-col>
					<!--<el-col :span="6">
						<el-form-item label="堆存费起算日期" prop="storageDate">
							<div style="width: 100%">
								<el-date-picker
									value-format="YYYY-MM-DD"
									format="YYYY-MM-DD"
									v-model="formData.storageDate"
									type="date"
									placeholder="请选择"
									:size="size"
								/>
							</div>
						</el-form-item>
					</el-col>-->
					<el-col :span="6">
						<el-form-item label="货转件数" prop="quantity">
							<el-input
								v-model="formData.quantity"
								@input="formData.quantity = proxy.verify('number', formData.quantity)"
								placeholder="请输入数字"
                :disabled="isDisabled"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货转重量" prop="ton">
							<el-input
								v-model="formData.ton"
								placeholder="请输入数字"
                :disabled="isDisabled"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<!--<el-form-item label="状态" prop="status">
							<div style="width: 100%">
								<el-radio-group v-model="formData.status" disabled>
									<el-radio label="1" value="1">待审核</el-radio>
									<el-radio label="10" value="10">商务审核</el-radio>
								</el-radio-group>
							</div>
						</el-form-item>-->
            <el-form-item
              label="状态"
              prop="status"
            >
              <Select
                :disabled="true"
                :selectData="[
									{ label: '待审核', value: '1' },
									{ label: '商务审核', value: '10' },
									{ label: '库场审核', value: '20' },
								]"
                v-model:value="formData.status"
              />
            </el-form-item>
					</el-col>
          <el-col :span="6">
            <el-form-item label="是否计费" prop="isBilling">
              <div style="width: 100%">
                <el-radio-group v-model="formData.isBilling" @change="isBillChange(e)" :disabled="isDisabled">
                  <el-radio label="1" value="1">是</el-radio>
                  <el-radio label="0" value="0">否</el-radio>
                </el-radio-group>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="付款人" prop="paymentCustomerId">
              <div style="width: 100%">
                <Select
                  :selectData="customerList"
                  :selectLabel="'label'"
                  :selectValue="'value'"
                  v-model:value="formData.paymentCustomerId"
                  v-model:label="formData.paymentCustomerName"
                  placeholder="付款人"
                  :disabled="isDisabled"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="isShow">
            <el-form-item
              label="原票货来源"
              prop="cargoSource"
            >
              <Select
                :selectData="[
									{ label: '卸船', value: '卸船' },
									{ label: '集港', value: '集港' },
									{ label: '拆箱集港', value: '拆箱集港' },
								]"
                v-model:value="formData.cargoSource"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="isShow">
            <el-form-item label="堆存费起算日期" prop="sourceStorageDate">
              <div style="width: 100%">
                <el-date-picker
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  v-model="formData.sourceStorageDate"
                  type="date"
                  placeholder="请选择"
                  :size="size"
                />
              </div>
            </el-form-item>
          </el-col>
					<el-col :span="6">
						<el-form-item label="备注" prop="remark">
							<el-input v-model="formData.remark" type="textarea" placeholder="请输入" :disabled="isDisabled"/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="协议附件" prop="remark">
							<upload
								:fileTypeName="fileTypeName"
								businessType="BUSINESS_CUSTOMER_LICENSE"
								:businessId="formData.id"
								@changeFile="changeFile"
                :showUploadBtn="!isDisabled"
                :showRemoveBtn="!isDisabled"
							/>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="transferDrawer">
import upload from '../../../../components/upload/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import publicApi from '@/api/public/index'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const collapseOpen = ['1', '2'] // 打开的面板
const value1 = ref('')
let selectLabel = ref('dictLabel')
let selectValue = ref('dictValue')
const myValue = ref('')
const myLabel = ref('')
const ruleForm = ref()
const customerList = ref([])
const isDisabled = ref(false)
const isShow = ref(false)
const changeCargoOwner = val => {
	console.log(val)
  if (val && val.value) {
    customerList.value.pop()
    customerList.value.push({value:val.value,label:val.label})
  }
}
const formData = reactive({
	id: null,
	cargoInfoIdSource: '', //原票货
	cargoAgentId: '',
	cargoAgentName: '', //货代
	cargoOwnerId: '',
	cargoOwnerName: '', //货主
	status: '1',
  isBilling:'0',
  paymentCustomerId:'',
  paymentCustomerName:'',
  cargoSource:'',
  sourceStorageDate:'',
	fileIds: [], //附件
})
// 验证规则
const rules = reactive({
	cargoOwnerName: proxy.getRules({
		required: true,
	}),
	/*cargoAgentName: proxy.getRules({
		required: true,
	}),*/
	transferDate: proxy.getRules({
		required: true,
	}),
	quantity: proxy.getRules({
		numberCheck: {
			int: 8,
			dec: 0,
		},
	}),
	ton: proxy.getRules({
		required: true,
    numberCheck: {
      int: 7,
      dec: 4,
    },
	}),
	status: proxy.getRules({
		required: true,
	}),
  isBilling: proxy.getRules({
    required: true,
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

// 上传文件
const changeFile = file => {
	formData.fileIds = file
}
const resetForm = () => {
	formData.id = null
	console.log('重置', 'ruleForm')
	ruleForm.value.resetFields()
}
const changeSelect = val => {
	console.log(val, myValue.value, myLabel.value)
}
const isBillChange = val => {
	debugger
  console.log(formData.isBilling)
}
defineExpose({
	validate,
	resetForm,
	formData,
  customerList,
  isDisabled,
  isShow
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
