<template>
	<el-form :inline="true" label-position="top" :model="formData" :rules="rules" ref="ruleForm" disabled='true'>
		<el-collapse v-model="collapseActiveNames">
			<el-collapse-item title="船舶信息" name="1">
				<el-row>
					<el-col :span="6">
						<el-form-item label="船名" prop="shipId">
							<RemoteSelect
								type="SHIP"
								v-model:value="formData.shipId"
								v-model:label="formData.shipName"
								@change="changeShip"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="英文船名" prop="shipNameEn">
							<el-input v-model="formData.shipNameEn" disabled />
						</el-form-item>
					</el-col>
          <el-col :span="6" v-show = "formData.tradeType=='外贸'">
            <el-form-item label="IMO" prop="loadUnload" >
              <el-input v-model="formData.imo" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6" v-show="formData.isLastArrivalType == '首次到港' || formData.isLastArrivalType == '超过一年未到港'">
            <el-form-item label="到港情况" prop="loadUnload">
              <el-input v-model="formData.isLastArrivalType" readonly placeholder="请输入到港情况"></el-input>
            </el-form-item>
          </el-col>
					<el-col :span="6">
						<el-form-item label="船宽" prop="shipWidth">
							<el-input v-model="formData.shipWidth" disabled />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="净吨" prop="netWeight">
							<el-input v-model="formData.netWeight" disabled />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="载重吨" prop="dwt">
							<el-input v-model="formData.dwt" disabled />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="满载吃水" prop="fullLoadWater">
        <el-input v-model="formData.fullLoadWater" disabled />
      </el-form-item>
        </el-col>
<!--        <el-col :span="6">-->
<!--          <el-form-item label="空载吃水" prop="emptyLoadWater">-->
<!--            <el-input v-model="formData.emptyLoadWater" disabled />-->
<!--          </el-form-item>-->
<!--        </el-col>-->
        <el-col :span="6">
          <el-form-item label="船舶总长" prop="shipLength">
            <el-input v-model="formData.shipLength" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="呼号" prop="callNo">
            <el-input v-model="formData.callNo" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="船上电话" prop="captainPhone">
            <el-input v-model="formData.captainPhone" />
          </el-form-item>
        </el-col>
        </el-row>
			</el-collapse-item>
			<el-collapse-item title="航次信息" name="2">
				<el-row>
					<el-col :span="6">
						<el-form-item label="进出口" prop="impExp">
							<el-radio-group v-model="formData.impExp" class="ml-4" @change="changeImpExp">
								<el-radio label="IN">进口</el-radio>
								<el-radio label="OUT">出口</el-radio>
								<el-radio label="INOUT">进出口</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="贸别" prop="tradeType">
							<Select :selectData="TRADE_TYPE" v-model:value="formData.tradeType" @change="changeVoyageAmount(formData.tradeType)" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装卸" prop="loadUnload">
							<el-input v-model="formData.loadUnload" disabled></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="预抵日期" prop="arrivalTimePlan">
							<nvDatePicker v-model:value="formData.arrivalTimePlan" typeFlag="nativedatetime" disabled />
							<!-- <el-date-picker
								v-model="formData.arrivalTimePlan"
								type="datetime"
								format="YYYY-MM-DD HH:mm:ss"
								value-format="YYYY-MM-DD HH:mm:ss"
								placeholder="选择预抵时间"
							></el-date-picker> -->
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="预计离港时间" prop="leavePortTimePlan">
							<nvDatePicker v-model:value="formData.leavePortTimePlan" typeFlag="nativedatetime" disabled />
							<!-- <el-date-picker
								v-model="formData.leavePortTimePlan"
								type="datetime"
								placeholder="选择预计离港时间"
								format="YYYY-MM-DD HH:mm:ss"
								value-format="YYYY-MM-DD HH:mm:ss"
							/> -->
						</el-form-item>
					</el-col>

					<el-col :span="6">
						<el-form-item label="起运港" prop="startPortId">
							<RemoteSelect type="PORT" v-model:value="formData.startPortId" v-model:label="formData.startPortName" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="目的港" prop="endPortId">
							<RemoteSelect type="PORT" v-model:value="formData.endPortId" v-model:label="formData.endPortName" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="上一港" prop="prePortId">
							<RemoteSelect type="PORT" v-model:value="formData.prePortId" v-model:label="formData.prePortName" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="下一港" prop="nextPortId">
							<RemoteSelect type="PORT" v-model:value="formData.nextPortId" v-model:label="formData.nextPortName" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="进口申报吃水" prop="bowDraft">
							<el-input
								v-model="formData.bowDraft"
								placeholder="请输入数字"
								@input="formData.bowDraft = proxy.verify('decimal', formData.bowDraft)"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="出口申报吃水" prop="sternDraft">
							<el-input
								v-model="formData.sternDraft"
								placeholder="请输入数字"
								@input="formData.sternDraft = proxy.verify('decimal', formData.sternDraft)"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="引航方式" prop="pilotage">
							<Select
								:selectData="[
									{ label: '自引', value: '1' },
									{ label: '引航', value: '2' },
									{ label: '进自引出引航', value: '3' },
									{ label: '出引航进自引', value: '4' },
								]"
								v-model:value="formData.pilotage"
							/>
						</el-form-item>
					</el-col>
          <el-col :span="6">
            <!--						<el-form-item label="是否已下发通知单" prop="isShorePower">-->
            <!--							<el-radio-group v-model="formData.isTrust" class="ml-4">-->
            <!--								<el-radio label="1">是</el-radio>-->
            <!--								<el-radio label="0">否</el-radio>-->
            <!--							</el-radio-group>-->
            <!--						</el-form-item>-->
            <el-form-item label="通知单" prop="isTrust">
              <el-input v-model="formData.isTrust" disabled/>
            </el-form-item>
          </el-col>
					<el-col :span="6">
						<el-form-item label="码头" prop="wharf">
							<el-radio-group v-model="formData.wharf" class="ml-4" @change="wharfChange">
								<el-radio label="1">散杂货</el-radio>
								<el-radio label="2">液化品</el-radio>
								<el-radio label="3">晨鸣</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="是否危险物品" prop="isDangerous">
							<el-radio-group v-model="formData.isDangerous" class="ml-4">
								<el-radio label="1">是</el-radio>
								<el-radio label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="是否扣除预缴费用" prop="isPayment">
							<el-radio-group v-model="formData.isPayment" class="ml-4" @change="radioChange">
								<el-radio label="1">是</el-radio>
								<el-radio label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6" v-show="formData.isPayment === '1'">
						<el-form-item label="预缴金额" prop="paymentAmount">
							<el-input
								v-model="formData.paymentAmount"
								placeholder="请输入数字"
								@input="formData.paymentAmount = proxy.verify('decimal', formData.paymentAmount)"
								disabled
							/>
							<!--              <span>余额剩余：</span>-->
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="是否需要拖轮" prop="isTug">
							<el-radio-group v-model="formData.isTug" class="ml-4">
								<el-radio label="1">是</el-radio>
								<el-radio label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6" v-show="formData.isTug === '1'">
						<el-form-item label="拖轮个数" prop="tugNumber">
							<el-input
								v-model="formData.tugNumber"
								placeholder="请输入数字"
								@input="formData.tugNumber = proxy.verify('positiveNumber', formData.tugNumber)"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="是否加油加水" prop="isWater">
							<el-radio-group v-model="formData.isWater" class="ml-4">
								<el-radio label="1">是</el-radio>
								<el-radio label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6" v-show="formData.isWater === '1'">
						<el-form-item label="预计加水量" prop="reqWater">
							<el-input
								v-model="formData.reqWater"
								placeholder="请输入数字"
								@input="formData.reqWater = proxy.verify('decimal', formData.reqWater)"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6" v-show="formData.isWater === '1'">
						<el-form-item label="预计加油量" prop="reqElectricity">
							<el-input
								v-model="formData.reqElectricity"
								placeholder="请输入数字"
								@input="formData.reqElectricity = proxy.verify('decimal', formData.reqElectricity)"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="是否接岸电" prop="isShorePower">
							<el-radio-group v-model="formData.isShorePower" class="ml-4">
								<el-radio label="1">是</el-radio>
								<el-radio label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="是否开工" prop="isShorePower">
							<el-radio-group v-model="formData.isStartWork" class="ml-4">
								<el-radio label="1">是</el-radio>
								<el-radio label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="是否收取停泊费" prop="isShorePower">
							<el-radio-group v-model="formData.berthingCharge" class="ml-4">
								<el-radio label="1">是</el-radio>
								<el-radio label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6" v-if="formData.certificatePath">
					  <el-form-item label="附件" prop="">
					    <el-button @click="viewFile" plain>查看附件</el-button>
					  </el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="备注" prop="remark">
							<el-input v-model="formData.remark" type="textarea" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
		</el-collapse>
	</el-form>
	<el-collapse v-model="collapseActiveNames">
		<el-collapse-item title="进出口信息" name="3">
			<el-row>
				<el-col :span="12">
					<el-form :inline="true" label-position="top" :model="inFormData" :rules="rules" ref="inRuleForm" disabled='true'>
						<el-row>
							<el-col :span="12">
								<el-form-item label="进口航次" prop="voyage">
									<el-input
										v-model="inFormData.voyage"
										placeholder="请输入进口航次"
										:disabled="formData.impExp === 'OUT'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="进口贸别" prop="tradeType">
									<Select
										:selectData="TRADE_TYPE"
										v-model:value="inFormData.tradeType"
										:disabled="formData.impExp === 'OUT'"
										@change="changeAmountIn"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="进口装卸" prop="loadUnload">
									<el-input v-model="inFormData.loadUnload" disabled></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="进口作业公司" prop="companyId">
									<Select
										:selectData="DEPT_WORK_COMPANY"
										v-model:value="inFormData.companyId"
										v-model:label="inFormData.companyName"
										:disabled="formData.impExp === 'OUT'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="进口货物" prop="cargoCategoryName">
									<el-input
										v-model="inFormData.cargoCategoryName"
										placeholder="请输入进口货物"
										:disabled="formData.impExp === 'OUT'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="进口货量" prop="cargoNum">
									<el-input
										v-model="inFormData.cargoNum"
										placeholder="请输入数字"
										@input="formData.cargoNum = proxy.verify('positiveNumber', formData.cargoNum)"
										:disabled="formData.impExp === 'OUT'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="进口船代" prop="customerId">
									<RemoteSelect
										type="CUSTOMER_ALL"
										v-model:value="inFormData.customerId"
										v-model:label="inFormData.customerName"
										:disabled="formData.impExp === 'OUT'"
                    @change="inCustomerChange(inFormData.customerId,inFormData.companyId)"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="联系人" prop="contacts">
									<el-input
										v-model="inFormData.contacts"
										placeholder="请输入联系人"
										:disabled="formData.impExp === 'OUT'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="联系电话" prop="shipPhone">
									<el-input
										v-model="inFormData.shipPhone"
										placeholder="例: 17812345678"
										maxlength="11"
										show-word-limit
										:disabled="formData.impExp === 'OUT'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12" v-show="formData.isPayment === '1'">
								<el-form-item label="进口预缴" prop="">
									<el-input
										v-model="inFormData.paymentAmount"
										:disabled="formData.impExp === 'OUT'"
										placeholder="请输入数字"
										@input="formData.paymentAmount = proxy.verify('decimal', formData.paymentAmount)"
										@change="payChange"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12" v-show="formData.isPayment === '1'">
								<el-form-item label="预缴余额" prop="inResidualAmount">
                  <el-input v-model="inResidualAmount" placeholder="请输入预缴余额" :disabled="formData.impExp === 'OUT'"/>
								</el-form-item>
							</el-col>
              <el-col :span="12">
                <el-form-item label="转水前船名" prop="preChangeShipName">
                  <el-input v-model="inFormData.preChangeShipName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="转水前编号" prop="preChangeShipNo">
                  <el-input v-model="inFormData.preChangeShipNo" />
                </el-form-item>
              </el-col>
							<el-col :span="12">
								<el-form-item label="备注" prop="remark">
									<el-input v-model="inFormData.remark" type="textarea" :disabled="formData.impExp === 'OUT'" />
								</el-form-item>
							</el-col>
						</el-row>
					</el-form>
				</el-col>
				<el-col :span="12">
					<el-form :inline="true" label-position="top" :model="outFormData" :rules="rules" ref="outRuleForm" disabled='true'>
						<el-row>
							<el-col :span="12">
								<el-form-item label="出口航次" prop="voyage">
									<el-input
										v-model="outFormData.voyage"
										placeholder="请输入出口航次"
										:disabled="formData.impExp === 'IN'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="出口贸别" prop="tradeType">
									<Select
										:selectData="TRADE_TYPE"
										v-model:value="outFormData.tradeType"
										:disabled="formData.impExp === 'IN'"
										@change="changeAmountOut"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="出口装卸" prop="loadUnload">
									<el-input v-model="outFormData.loadUnload" disabled></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="出口作业公司" prop="companyId">
									<Select
										:selectData="DEPT_WORK_COMPANY"
										v-model:value="outFormData.companyId"
										v-model:label="outFormData.companyName"
										:disabled="formData.impExp === 'IN'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="出口货物" prop="cargoCategoryName">
									<el-input
										v-model="outFormData.cargoCategoryName"
										placeholder="请输入出口货物"
										:disabled="formData.impExp === 'IN'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="出口货量" prop="cargoNum">
									<el-input
										v-model="outFormData.cargoNum"
										:disabled="formData.impExp === 'IN'"
										placeholder="请输入数字"
										@input="formData.cargoNum = proxy.verify('positiveNumber', formData.cargoNum)"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="出口船代" prop="customerId">
									<RemoteSelect
										type="CUSTOMER_ALL"
										v-model:value="outFormData.customerId"
										v-model:label="outFormData.customerName"
										:disabled="formData.impExp === 'IN'"
                    @change="outCustomerChange(outFormData.customerId,outFormData.companyId)"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="联系人" prop="contacts">
									<el-input
										v-model="outFormData.contacts"
										placeholder="请输入联系人"
										:disabled="formData.impExp === 'IN'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="联系电话" prop="shipPhone">
									<el-input
										v-model="outFormData.shipPhone"
										placeholder="例: 17812345678"
										maxlength="11"
										show-word-limit
										:disabled="formData.impExp === 'IN'"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12" v-show="formData.isPayment === '1'">
								<el-form-item label="出口预缴" prop="">
									<el-input
										v-model="outFormData.paymentAmount"
										:disabled="formData.impExp === 'IN'"
										placeholder="请输入数字"
										@input="formData.paymentAmount = proxy.verify('decimal', formData.paymentAmount)"
										@change="payChange"
									/>
								</el-form-item>
							</el-col>
							<el-col :span="12" v-show="formData.isPayment === '1'">
                <el-form-item label="预缴余额" prop="" >
                  <el-input v-model="outResidualAmount" placeholder="请输入预缴余额" :disabled="formData.impExp === 'IN'"/>
                </el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="备注" prop="remark">
									<el-input v-model="outFormData.remark" type="textarea" :disabled="formData.impExp === 'IN'" />
								</el-form-item>
							</el-col>
						</el-row>
					</el-form>
				</el-col>
			</el-row>
		</el-collapse-item>
    <el-collapse-item title="船舶动态" name="4">
      <div class="p10">
        <BaseTable
          ref="baseTable"
          :tableColumns="tableColumns"
          :tableData="tableData"
          :syncResize="true"
          :tableHeight="'drawerPageTableHeight'"
        />
      </div>
    </el-collapse-item>
    <el-collapse-item title="船舶费用" name="5">
      <EditTable
        ref="costTableRef"
        :autoResize="true"
        :tableColumns="costTableColumns"
        :tableData="costTableData"
        :tableHeight="'drawerPageTableHeight'"
      />
    </el-collapse-item>
	</el-collapse>
  <el-dialog v-model="imageVisible" title="附件">
    <div class="demo-image__lazy">
      <el-image v-for="url in imageFiles" :key="url" :src="url" lazy></el-image>
    </div>
  </el-dialog>
</template>

<script setup name="detail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
import nvDatePicker from '@/components/nvDatePicker/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
const imageVisible = ref(false) // 附件查看
const imageRef = ref(null) // 附件组件ref
import publicApi from '@/api/public/index.js'
import api from '@/api/dispatch/shipForecast/index.js'
import Math from '../../../../utils/math'
import BaseTable from '@/components/BaseTable/index.vue'
import { ElButton } from 'element-plus'
import EditTable from '@/components/EditTable/index.vue'
const ruleForm = ref()
const inRuleForm = ref()
const outRuleForm = ref()
const collapseActiveNames = reactive(['1', '2', '3', '4', '5'])
const formData = reactive({
  wharf:"1",
  isLastArrivalType:"",
	shipName: '',
  shipNameEn:'',
	shipId: '',
	totalWeight: '',
	netWeight: '',
	dwt: '',
	fullLoadWater: '',
	emptyLoadWater: '',
	impExp: 'IN',
	tradeType: '',
	loadUnload: '卸',
	arrivalTimePlan: '',
	leavePortTimePlan: '',
	arrivalAnchorageTime: '',
	leaveAnchorageTime: '',
	berthTime: '',
	leaveBerthTime: '',
	workStartTime: '',
	workEndTime: '',
	berthId: '',
	berthNo: '',
	berthType: '',
	bollardNoStart: '',
	bollardNoEnd: '',
	startPortId: '',
	startPortName: '',
	endPortId: '',
	endPortName: '',
	prePortId: '',
	prePortName: '',
	nextPortId: '',
	nextPortName: '',
	receiveBy: '',
	receiveByName: '',
	receiveTime: '',
	bowDraft: '',
	sternDraft: '',
	pilotage: '',
	isDangerous: '0',
	isPayment: '1',
  isStartWork:'1',
  berthingCharge:'1',
	paymentAmount: '',
	isTug: '0',
	tugNumber: '',
	isWater: '0',
	reqElectricity: '',
	reqWater: '',
	isShorePower: '0',
	remark: '',
	jieShouRemark: '',
	id: '',
	shipLength: '',
	captainPhone: '',
	certificatePath: '',
  imo:'',
  shipWidth:'',
  shipStatusCode:'',
  isTrust:'',
  callNo:'0'
})
const inFormData = reactive({
  id:'',
	impExp: 'IN',
	voyage: '',
	tradeType: '',
	loadUnload: '卸',
	companyId: '',
	companyName: '',
	cargoCategoryCode: '',
	cargoCategoryName: '',
	cargoNum: '',
	customerId: '',
	customerName: '',
	contacts: '',
	shipPhone: '',
	paymentAmount: '',
	remark: '',
  preChangeShipName:'',
  preChangeShipNo:'',
  residualAmount:''
})
const outFormData = reactive({
  id:'',
	impExp: 'OUT',
	voyage: '',
	tradeType: '',
	loadUnload: '',
	companyId: '',
	companyName: '',
	cargoCategoryCode: '',
	cargoCategoryName: '',
	cargoNum: '',
	customerId: '',
	customerName: '',
	contacts: '',
	shipPhone: '',
	paymentAmount: '',
	remark: '',
  residualAmount:''
})
const rules = reactive({
	shipId: proxy.getRules({ required: true, trigger: 'change' }),
	impExp: proxy.getRules({ required: true }),
  wharf: proxy.getRules({ required: true }),
	captainPhone: proxy.getRules({ required: true }),
	tradeType: proxy.getRules({ required: true, trigger: 'change' }),
	isPayment: proxy.getRules({ required: true }),
	isWater: proxy.getRules({ required: false }),
	reqWater: proxy.getRules({
		numberCheck: {
			int: 4,
			dec: 4,
		},
	}),
	reqElectricity: proxy.getRules({
		numberCheck: {
			int: 4,
			dec: 4,
		},
	}),
	bowDraft: proxy.getRules({
		numberCheck: {
			int: 2,
			dec: 2,
		},
	}),
	sternDraft: proxy.getRules({
		numberCheck: {
			int: 2,
			dec: 2,
		},
	}),
	isShorePower: proxy.getRules({ required: false }),
	isTug: proxy.getRules({
		required: false,
	}),
	tugNumber: proxy.getRules({
		numberCheck: {
			int: 2,
			dec: 0,
		},
	}),
	/*	paymentAmount: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),*/
	isDangerous: proxy.getRules({ required: true }),
	arrivalTimePlan: proxy.getRules({ required: true }),
	leavePortTimePlan: proxy.getRules({ required: true }),
	startPortId: proxy.getRules({ required: true, trigger: 'change' }),
	endPortId: proxy.getRules({ required: true, trigger: 'change' }),
	prePortId: proxy.getRules({ required: true, trigger: 'change' }),
	nextPortId: proxy.getRules({ required: false, trigger: 'change' }),
	companyId: proxy.getRules({ required: true, trigger: 'change' }),
	cargoCategoryName: proxy.getRules({ required: true, trigger: 'change' }),
	customerId: proxy.getRules({ required: true, trigger: 'change' }),
	voyage: proxy.getRules({ required: true }),
	shipPhone: proxy.getRules({ required: true }),
	cargoNum: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 3,
		},
	}),
})
const changeImpExp = e => {
	ruleForm.value.clearValidate()
	inRuleForm.value.clearValidate()
	outRuleForm.value.clearValidate()
	if (e === 'IN') {
		formData.loadUnload = '卸'
		inFormData.tradeType = formData.tradeType
    inFormData.loadUnload = '卸'
		outFormData.loadUnload = ''
		outFormData.voyage = ''
		outFormData.tradeType = ''
		outFormData.companyId = ''
		outFormData.companyName = ''
		outFormData.cargoCategoryCode = ''
		outFormData.cargoCategoryName = ''
		outFormData.cargoNum = ''
		outFormData.customerId = ''
		outFormData.customerName = ''
		outFormData.contacts = ''
		outFormData.shipPhone = ''
		outFormData.paymentAmount = ''
		outFormData.remark = ''
	} else if (e === 'OUT') {
		formData.loadUnload = '装'
    outFormData.tradeType = formData.tradeType
		outFormData.loadUnload = '装'
		inFormData.loadUnload = ''
		inFormData.voyage = ''
		inFormData.tradeType = ''
		inFormData.companyId = ''
		inFormData.companyName = ''
		inFormData.cargoCategoryCode = ''
		inFormData.cargoCategoryName = ''
		inFormData.cargoNum = ''
		inFormData.customerId = ''
		inFormData.customerName = ''
		inFormData.contacts = ''
		inFormData.shipPhone = ''
		inFormData.paymentAmount = ''
		inFormData.remark = ''
	} else if (e === 'INOUT') {
		formData.loadUnload = '装卸'
		inFormData.loadUnload = '卸'
		outFormData.loadUnload = '装'
    inFormData.tradeType = formData.tradeType
    outFormData.tradeType = formData.tradeType
	}
	changeAmountIn()
	changeAmountOut()
}
// watch(
// 	() => formData.shipId,
// 	newV => {
// 		console.log(newV, 'newVnewVnewV')
// 	},
// 	{ deep: true }
// )

const wharfChange = e =>{
  console.log(e==1)
  if(e == 1){//散杂货
    formData.isDangerous = '0' ;
    formData.isPayment = '1' ;
    formData.isStartWork = '1' ;
    formData.berthingCharge = '1' ;
  }else if(e == 2){//液化品
    formData.isDangerous = '1' ;
    formData.isPayment = '0' ;
    formData.isStartWork = '0' ;
    formData.berthingCharge = '0' ;
  }else if(e == 3){//晨鸣
    formData.isDangerous = '0' ;
    formData.isPayment = '0' ;
    formData.isStartWork = '0' ;
    formData.berthingCharge = '0' ;
  }
  radioChange();
}
const tableData = ref([])
const costTableData = ref([])
const tableColumns = ref([
	{ prop: 'shipName', label: '船名', width: 100 },
	{ prop: 'dynamicTypeName', label: '动态类型', width: 90 },
	{ prop: 'loadUnload', label: '装卸', width: 90 },
	{ prop: 'dynamicStartTime', label: '动态时间', width: 'time' },
	{ prop: 'berthName', label: '泊位', width: 90 },
	{ prop: 'berthTypeLabel', label: '舷靠', width: 90 },
	{ prop: 'bollardNoStart', label: '首缆编号', width: 90 },
	{ prop: 'bollardNoEnd', label: '尾缆编号', width: 90 },
	{ prop: 'stopTypeName', label: '停时类型名称', width: 90 },
	{ prop: 'stopName', label: '停工原因', width: 90 },
	{ prop: 'remark', label: '备注', width: 90 },
	{ prop: 'createByName', label: '操作人', width: 90 },
])

const costTableColumns = ref([
  {
    label: '费目',
    prop: 'rateItemName',
  },
  {
    label: '天数/数量',
    prop: 'number',
    alien: 'right',
  },
  {
    label: '船舶净吨',
    prop: 'number2',
    alien: 'right',
  },
  {
    label: '计量单位',
    prop: 'unitName',
    alien: 'left',
  },

  {
    label: '费率/单价',
    prop: 'rate',
  },
  {
    label: '税率（%）',
    prop: 'tax',
  },
  {
    label: '税额',
    prop: 'taxAmount',
    fixed: 'right',
    isThousandth: true,
  },
  {
    label: '金额（元）',
    prop: 'amount',
    fixed: 'right',
    isThousandth: true,
  },
  {
    label: '备注',
    prop: 'remark',
    editType: 'input',
    editRender: {},
  },
])
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
      console.log(imageFiles)
    }else{
      proxy.$modal.msgWarning('没有附件')
    }
  })
}
const row = ref(null)
const changeShip = e => {
	formData.totalWeight = e.totalWeight
	formData.netWeight = e.netWeight
	formData.dwt = e.dwt
	if (e.captainPhone != null && e.captainPhone != undefined) {
		formData.captainPhone = e.captainPhone
	}
	formData.fullLoadWater = e.fullLoadWater
	formData.emptyLoadWater = e.emptyLoadWater
	formData.shipLength = e.shipLength
  if(inFormData.paymentAmount==0||inFormData.paymentAmount=="0"||inFormData.paymentAmount==""||inFormData.paymentAmount==null||inFormData.paymentAmount==undefined){
    changeAmountIn();
  }
  if(outFormData.paymentAmount==0||outFormData.paymentAmount=="0"||outFormData.paymentAmount==""||outFormData.paymentAmount==null||outFormData.paymentAmount==undefined){
    changeAmountOut()
  }
  isLastArrivalType(e.value)
  formData.imo = e.imo;
  formData.callNo = e.callNo;
	formData.shipWidth = e.shipWidth;
}

//是否首次到港
const isLastArrivalType = shipId =>{
  api.lastArrivalType({voyageId: formData.id,shipId: shipId}).then(res=>{
    formData.isLastArrivalType = res.data
  })
}
//是否已经下发通知单
const isTrust = shipVoyageId =>{
  api.listTrustByShipVoyageId({shipVoyageId: shipVoyageId}).then(res=>{
    formData.isTrust = res.data.isTrust=="0"?"未下发通知单":"已下发通知单";
  })
}
//判断预缴金额
const inResidualAmount = ref(null)
const outResidualAmount = ref(null)
const getResidualAmount = async (type,customerId,companyId) =>{
  await api.getBankCustomerPrepayment({
    customerId : customerId,
    companyId : companyId,
    prepaymentTypeCode : "30",
    status : 1,
  }).then(res=>{
    let data = res.data;
    if(type=="IN"){
      inResidualAmount.value = data.residualAmount;
    }else if(type=="OUT"){
      outResidualAmount.value = data.residualAmount;
    }
  })
}

//改变航次信息中的贸别
const changeVoyageAmount= tradeType =>{
  if(formData.impExp == "IN"){
    inFormData.tradeType = tradeType
    changeAmountIn()
  }else if(formData.impExp == "OUT"){
    outFormData.tradeType = tradeType
    changeAmountOut()
  }else if(formData.impExp == "INOUT"){
    inFormData.tradeType = tradeType
    outFormData.tradeType = tradeType
    changeAmountIn()
    changeAmountOut()
  }
}


const changeAmountOut = e => {
	api.changeAmount({ dwt: formData.dwt, tradeType: outFormData.tradeType }).then(res => {
		outFormData.paymentAmount = res.data
		formData.paymentAmount = Math.numAdd(inFormData.paymentAmount, outFormData.paymentAmount).toFixed(2)
	})
  if(outFormData.customerId != null && outFormData.customerId != undefined && outFormData.customerId != ""){
    outFormData.residualAmount = getResidualAmount("OUT",outFormData.customerId);
  }
}
const changeAmountIn = e => {
    api.changeAmount({ dwt: formData.dwt, tradeType: inFormData.tradeType }).then(res => {
      inFormData.paymentAmount = res.data
      formData.paymentAmount = Math.numAdd(inFormData.paymentAmount, outFormData.paymentAmount).toFixed(2)
    })
    if(inFormData.customerId != null && inFormData.customerId != undefined && inFormData.customerId != ""){
      inFormData.residualAmount = getResidualAmount("IN",inFormData.customerId);
    }
}
const radioChange = () => {
	if (formData.isPayment == '0') {
		formData.paymentAmount = ''
		outFormData.paymentAmount = ''
		inFormData.paymentAmount = ''
	} else if (formData.isPayment == '1') {
		changeAmountIn()
		changeAmountOut()
	}
}
const payChange = () => {
	formData.paymentAmount = Math.numAdd(inFormData.paymentAmount, outFormData.paymentAmount).toFixed(2)
  let residualAmount = Math.numAdd(inResidualAmount.value, outResidualAmount.value).toFixed(2)
  // if(inFormData.customerId!=null && inFormData.customerId!=undefined && inFormData.customerId!=''){
  //   getResidualAmount("IN",inFormData.customerId)
  // }
  // if(outFormData.customerId!=null && outFormData.customerId!=undefined && outFormData.customerId!=''){
  //   getResidualAmount("OUT",outFormData.customerId)
  // }
}

const inCustomerChange = (customerId,companyId) =>{
  getResidualAmount("IN", customerId,companyId);
}
const outCustomerChange = (customerId,companyId) =>{
  getResidualAmount("OUT", customerId,companyId);
}

const validate = async () => {
	let flag = false
	const p1 = ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	const p2 =
		formData.impExp !== 'OUT'
			? inRuleForm.value.validate((valid, fields) => {
					if (valid) {
						flag = true
					} else {
						flag = false
						proxy.$modal.msgWarning('请完善进口信息！')
					}
			  })
			: ''
	const p3 =
		formData.impExp !== 'IN'
			? outRuleForm.value.validate((valid, fields) => {
					if (valid) {
						flag = true
					} else {
						flag = false
						proxy.$modal.msgWarning('请完善出口信息！')
					}
			  })
			: ''
	let allP = []
	if (formData.impExp === 'IN') {
		allP = [p1, p2]
	} else if (formData.impExp === 'OUT') {
		allP = [p1, p3]
	} else if (formData.impExp === 'INOUT') {
		allP = [p1, p2, p3]
	}
	const flags = await Promise.all(allP)
	return flags.findIndex(item => item === false) < 0
}
const resetForm = type => {
	const keys = ['totalWeight', 'netWeight', 'dwt', 'fullLoadWater', 'emptyLoadWater', 'shipLength', 'captainPhone']
	if (type === 'add') {
		// 新增全清空
		proxy.resetObj(formData)
    formData.isPayment = '1'
    formData.isStartWork = '1'
    formData.berthingCharge = '1'
    inResidualAmount.value = ""
    outResidualAmount.value = ""
    formData.jieShouRemark = ''
    formData.isTrust = ""
	} else {
		// 编辑清空部分
		for (const key in formData) {
			if (!keys.includes(key)) {
				formData[key] = ''
			}
		}
	}
	inRuleForm.value.resetFields()
	outRuleForm.value.resetFields()
}
const changeBerth = () => {
	formData.bollardNoStart = ''
	formData.bollardNoEnd = ''
}
const DEPT_WORK_COMPANY = ref([])
const CARGO_CATEGORY = ref([])
const BERTH = ref([])
const TRADE_TYPE = ref([])
const SIDE = ref([])
const init = () => {
	publicApi.getLocalSelects({ types: 'DEPT_WORK_COMPANY,CARGO_CATEGORY,BERTH' }).then(res => {
		DEPT_WORK_COMPANY.value = res.data.DEPT_WORK_COMPANY
		CARGO_CATEGORY.value = res.data.CARGO_CATEGORY
		BERTH.value = res.data.BERTH
	})
	publicApi.getDictList({ types: 'TRADE_TYPE,SIDE' }).then(res => {
		TRADE_TYPE.value = [
			{ label: '内贸', value: '内贸' },
			{ label: '外贸', value: '外贸' },
		]
		SIDE.value = res.data.SIDE
	})
}
init()
const initData = () => {
  nextTick(() => {
    isTrust(formData.id);
  })
}
initData()
defineExpose({
	validate,
	resetForm,
	formData,
	inFormData,
	outFormData,
	changeShip,
  initData,
  row,
  inResidualAmount,
  outResidualAmount,
  inCustomerChange,
  outCustomerChange,
  tableData,
	costTableData
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';

::v-deep(.el-input__inner[placeholder|='请输入到港情况']){
  color:red;
}
::v-deep(.el-input__inner[placeholder|='请输入预缴余额']){
  color:red;
}
</style>
