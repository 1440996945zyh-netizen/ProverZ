<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-position="top" label-width="120px" :rules="rules">
			<el-tabs type="border-card" v-model="activeName">
				<el-tab-pane label="基本信息" name="first">
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="船名" prop="shipName">
								<el-input v-model="formData.shipName" @input="getShortCd" placeholder="请输入船名" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="助记码" prop="shorthandCode">
								<el-input v-model="formData.shorthandCode" placeholder="不输入自动生成" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="英文船名" prop="shipNameEn">
								<el-input v-model="formData.shipNameEn" placeholder="请输入英文船名" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="船舶类型" prop="shipKindCode">
								<div style="width: 100%">
									<Select
										:dataConfig="{ url: '/api/internal/public/getDictListByType/SHIP_KIND' }"
										v-model:value="formData.shipKindCode"
										v-model:label="formData.shipKindLabel"
									/>
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="船籍" prop="nationCode">
								<div style="width: 100%">
									<Select
										:dataConfig="{ url: '/api/internal/public/getDictListByType/NATION' }"
										v-model:value="formData.nationCode"
										v-model:label="formData.nationLabel"
										placeholder="请输入船籍"
									/>
								</div>
							</el-form-item>
						</el-col>
            <el-col :span="8">
              <el-form-item label="船上电话" prop="captainPhone">
                <el-input v-model="formData.captainPhone" placeholder="请输入船上电话" />
              </el-form-item>
            </el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="IMO" :prop="formData.nationLabel == '中国' ? '' : 'imo'">
								<el-input v-model="formData.imo" placeholder="请输入IMO" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="MMSI" :prop="formData.nationLabel == '中国' ? '' : 'mmsi'">
								<el-input v-model="formData.mmsi" placeholder="请输入MMSI" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="呼号" prop="callNo">
								<el-input v-model="formData.callNo" placeholder="请输入呼号" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="船舶总长" prop="shipLength">
								<el-input v-model="formData.shipLength" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="船宽" prop="shipWidth">
								<el-input v-model="formData.shipWidth" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="船高" prop="shipHeight">
								<el-input v-model="formData.shipHeight" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="净吨" prop="netWeight">
								<el-input v-model="formData.netWeight" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="载重吨" prop="dwt">
								<el-input v-model="formData.dwt" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="总吨" prop="totalWeight">
								<el-input v-model="formData.totalWeight" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="船舶自重" prop="selfWeight">
								<el-input v-model="formData.selfWeight" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="舱口数" prop="hatchNum">
								<el-input v-model="formData.hatchNum" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
            <el-col :span="8">
              <el-form-item label="满载吃水" prop="fullLoadWater">
                <el-input v-model="formData.fullLoadWater" placeholder="请输入数字" />
              </el-form-item>
            </el-col>
					</el-row>
					<el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="申报单位" prop="applicationUnitCode">
                  <RemoteSelect type="CUSTOMER_ALL" v-model:value="formData.applicationUnitCode" v-model:label="formData.applicationUnit" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否重点船舶" prop="isFocusShip" >
                <Select
                  v-model:value="formData.isFocusShip"
                  :selectData="[
                    { label: '是', value: '1' },
                    { label: '否', value: '0' },
                  ]"/>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否黑名单" prop="isBlackShip" >
                <Select
                  v-model:value="formData.isBlackShip"
                  :selectData="[
                    { label: '是', value: '1' },
                    { label: '否', value: '0' },
                  ]"/>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="status" label="是否停用">
                <el-switch v-model="formData.status" active-value="0" inactive-value="1"></el-switch>
              </el-form-item>
            </el-col>

						<el-col :span="6">
							<el-form-item label="附件信息" prop="">
								<Upload businessType="MASTER_SHIP_01" :businessId="formData.id" @changeFile="changeFile" />
							</el-form-item>
						</el-col>
						<el-col :span="2">
              <el-form-item label="附件" prop="">
                <el-button @click="viewFile" plain>查看附件</el-button>
              </el-form-item>
						</el-col>
					</el-row>
				</el-tab-pane>
				<el-tab-pane label="结构信息" name="second">
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="舱层数" prop="cabinLayerNum">
								<el-input v-model="formData.cabinLayerNum" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="舱型" prop="cabinType">
								<el-input v-model="formData.cabinType" placeholder="请输入舱型" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="舱容" prop="cabinVolume">
								<el-input v-model="formData.cabinVolume" placeholder="请输入舱容" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="舱口尺寸" prop="hatchSize">
								<el-input v-model="formData.hatchSize" placeholder="请输入舱口尺寸" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="最大船速" prop="maxSpeed">
								<el-input v-model="formData.maxSpeed" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="航速" prop="speed">
								<el-input v-model="formData.speed" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="型深" prop="mouldedDepth">
								<el-input v-model="formData.mouldedDepth" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="吊机位置" prop="hangerLocation">
								<el-input v-model="formData.hangerLocation" placeholder="请输入吊机位置" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="吊机数量" prop="hangerNum">
								<el-input v-model="formData.hangerNum" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="机舱位置" prop="hangerLoad">
								<el-input v-model="formData.hangerLoad" placeholder="请输入机舱位置" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="舱口盖类型" prop="hatchCoverTypeCode">
								<div style="width: 100%">
									<Select
										:dataConfig="{ url: '/api/internal/public/getDictListByType/HATCH_COVER_TYPE' }"
										v-model:value="formData.hatchCoverTypeCode"
									/>
								</div>
							</el-form-item>
						</el-col>
					</el-row>
				</el-tab-pane>
				<el-tab-pane label="其他信息" name="third">
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="船长姓名" prop="captainName">
								<el-input v-model="formData.captainName" placeholder="请输入船长姓名" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="建造年月" prop="builtYm">
								<el-date-picker v-model="formData.builtYm" value-format="YYYY-MM" type="month" placeholder="请选择..." />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="淡水容量" prop="waterVolume">
								<el-input v-model="formData.waterVolume" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="富余水深" prop="surplusWaterDepth">
								<el-input v-model="formData.surplusWaterDepth" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="空载吃水" prop="emptyLoadWater">
								<el-input v-model="formData.emptyLoadWater" placeholder="请输入数字" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="头驾距离" prop="headerCockpitDistance">
								<el-input v-model="formData.headerCockpitDistance" placeholder="请输入头驾距离" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-tab-pane>
			</el-tabs>
		</el-form>
	</div>
  <el-dialog v-model="imageVisible" title="附件">
    <div class="demo-image__lazy">
      <el-image v-for="url in imageFiles" :key="url" :src="url" lazy></el-image>
    </div>
  </el-dialog>
</template>

<script setup name="shipBlackList">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import publicApi from '@/api/public/index.js'
import Select from '@/components/Select'
import Upload from '@/components/Upload/index.vue'
import { Edit, View as IconView } from '@element-plus/icons-vue'
import RemoteSelect from '@/components/RemoteSelect'
const imageVisible = ref(false) // 附件查看
const imageRef = ref(null) // 附件查看
import { creatShortCd } from '@/utils/index.js'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const ruleForm = ref()
const formData = reactive({
	id: '',
	callNo: '',
	cabinLayerNum: '',
	cabinType: '',
	cabinVolume: '',
	captainName: '',
	captainPhone: '',
	dwt: '',
	emptyLoadWater: '',
	fullLoadWater: '',
	hangerLoad: '',
	hangerLocation: '',
	hangerNum: '',
	hatchCoverTypeCode: '',
	hatchNum: '',
	hatchSize: '',
	headerCockpitDistance: '',
	imo: '',
	maxSpeed: '',
	mmsi: '',
	mouldedDepth: '',
	nationCode: '',
	nationLabel: '',
	netWeight: '',
	selfWeight: '',
	shipHeight: '',
	shipKindCode: '',
	shipKindLabel: '',
	shipLength: '',
	shipName: '',
	shipNameEn: '',
	shipTypeCode: '',
	shipTypeLabel: '',
	shipWidth: '',
	shorthandCode: '',
	speed: '',
	status: '',
  isFocusShip:'',
  isBlackShip:'',
	surplusWaterDepth: '',
	totalWeight: '',
	waterVolume: '',
	fileIds: [],
  certificatePath:'',
  applicationUnit:'',
  applicationUnitCode:'',
  customerId:'',
  customerName:'',
})
// 状态集合
const statusList = reactive([
	{
		value: '0',
		label: '停用',
	},
	{
		value: '1',
		label: '待审核',
	},
	{
		value: '9',
		label: '驳回',
	},
	{
		value: '10',
		label: '审批通过',
	},
])

//查看附件
// const viewFile = () =>{
//   let certificatePath = formData.certificatePath;
//   if(certificatePath !=null && certificatePath !=undefined && certificatePath.length>0){
//     certificatePath.split(",").forEach(path =>{
//       window.open(path)
//     })
//   }else{
//     proxy.$modal.msgWarning('没有附件')
//   }
// }

const imageFiles = reactive([])
//查看附件
const viewFile = () =>{
  let certificatePath = formData.certificatePath;
  let list = [];
  imageFiles.splice(0,imageFiles.length)
  nextTick(() => {
    if(certificatePath !=null && certificatePath !=undefined && certificatePath.length>0){
      imageVisible.value = true;
      certificatePath.split(",").forEach(path =>{
        list.push(path);
      })
      imageFiles.push(...list)
      // imageFiles.push("https://img.guanhai.com.cn/a/10001/202310/2d55526902b58994f9a1be1f8f16185b.jpeg")
      // imageFiles.push("https://img.guanhai.com.cn/a/10001/202310/2d55526902b58994f9a1be1f8f16185b.jpeg")
    }else{
      proxy.$modal.msgWarning('没有附件')
    }
  })
}


// 助记码
const getShortCd = value => {
	formData.shorthandCode = creatShortCd(value)
}
// tabs
const activeName = ref('first')
// 校验
const rules = reactive({
	shipName: proxy.getRules({ required: true, length: '0-50' }),
	shipKindCode: proxy.getRules({ required: true }),
	shipNameEn: proxy.getRules({ required: true, length: '0-100' }),
	// captainPhone: proxy.getRules({ pattern: /^1[3-9]\d{9}$/, required: true, length: '0-100' }),
	imo: proxy.getRules({ required: true }),
	mmsi: proxy.getRules({ required: true }),
	maxSpeed: proxy.getRules({
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),
	mouldedDepth: proxy.getRules({
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
	waterVolume: proxy.getRules({
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
	cabinLayerNum: proxy.getRules({
		numberCheck: {
			dec: 0,
		},
	}),
	surplusWaterDepth: proxy.getRules({
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
	emptyLoadWater: proxy.getRules({
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
	headerCockpitDistance: proxy.getRules({
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
	hangerNum: proxy.getRules({
		numberCheck: {
			int: 4,
			dec: 0,
		},
	}),

	callNo: proxy.getRules({ required: true }),
	shipLength: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),
	shipWidth: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),
	totalWeight: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),
	netWeight: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),
	dwt: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),
	hatchNum: proxy.getRules({
		required: true,
		numberCheck: {
			int: 2,
			dec: 0,
		},
	}),
	fullLoadWater: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
	status: proxy.getRules({ required: true }),
  isFocusShip: proxy.getRules({ required: true }),
  isBlackShip: proxy.getRules({ required: true }),
})
const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			activeName.value = 'first'
			proxy.$message.warning('请完善表单信息！')
		}
	})
	return flag
}
const resetForm = () => {
	ruleForm.value.resetFields()
	formData.id = ''
	formData.nationLabel = ''
	formData.shipKindLabel = ''
	formData.shipTypeLabel = ''
}
// 上传文件
const changeFile = file => {
	formData.fileIds = file
}
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.el-carousel__item h3 {
  color: #475669;
  font-size: 18px;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}
</style>
