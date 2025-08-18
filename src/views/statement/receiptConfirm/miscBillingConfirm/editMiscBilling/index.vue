<!-- 作业指令新增编辑表单 -->
<template>
  <div>
    <el-form :model="billingForm" ref="formRef" label-width="110px" :rules="rules" style="margin: 20px 20px">
      <el-form-item label="作业公司" prop="companyId">
        <Select
          :dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
          v-model:value="billingForm.companyId"
          v-model:label="billingForm.companyName"
          placeholder="作业公司"
        />
      </el-form-item>

      <el-form-item label="计费日期" prop="billDate" v-if="routeType == 1">
        <el-date-picker
          v-model="billingForm.billDate"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          type="date"
          placeholder="计费日期"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="申请开票日期" prop="billDate" v-if="routeType == 2">
        <el-date-picker
          v-model="billingForm.billDate"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          type="date"
          placeholder="计费日期"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="客户" prop="customerId">
        <RemoteSelect
          type="CUSTOMER_ALL"
          v-model:value="billingForm.customerId"/>
      </el-form-item>
      <el-form-item label="费率" prop="rateId">
        <Select
          :selectData="rateList"
          :selectLabel = "'rateItemAndRate'"
          :selectValue = "'id'"
          @change = "changeRate"
          v-model:value="billingForm.rateId"
          v-model:label="billingForm.rateName"/>
      </el-form-item>
      <el-form-item label="作业过程" prop="processName" v-if="routeType == 1">
        <Select
          :selectLabel = "'processName'"
          :selectValue = "'processCode'"
          :selectData="processNameList"
          v-model:value="billingForm.processCode"
          v-model:label="billingForm.processName"
          placeholder="请选择作业过程"
          disabled
        />
      </el-form-item>
      <el-form-item label="船名航次" v-if="routeType == 1">
        <RemoteSelect
          type="VOYAGE"
          v-model:value="billingForm.voyageId"
          v-model:label="billingForm.shipVoyage"
          @change="voyageChange"
        />
      </el-form-item>

      <el-form-item label="客户" prop="customerId">
        <RemoteSelect
          type="CUSTOMER_ALL"
          v-model:value="billingForm.customerId"
          @change="customerChange"
        />
      </el-form-item>
      <el-form-item label="票货" prop="cargoInfoId" >
        <Select
          :selectData="cargoInfoList"
          :selectLabel = "'cargoInfoName'"
          :selectValue = "'id'"
          v-model:value="billingForm.cargoInfoId"
          v-model:label="billingForm.cargoInfoName"/>
      </el-form-item>

      <el-form-item label="数量1" prop="billQuantity">
        <el-input v-model="billingForm.billQuantity" type="number" @change="inputQuantity"/>
      </el-form-item>
      <el-form-item label="数量2" prop="billQuantity2">
        <el-input v-model="billingForm.billQuantity2" type="number" @change="inputQuantity"/>
      </el-form-item>
      <el-form-item label="单位" prop="unitName">
        <el-input v-model="billingForm.unitName" readonly/>
      </el-form-item>

      <el-form-item label="费率" >
       <el-input v-model="billingForm.rate" readonly/>
      </el-form-item>

      <el-form-item label="税率(%)" >
        <el-input v-model="billingForm.taxRate" readonly/>
      </el-form-item>
      <el-form-item label="计费金额"  v-if="routeType == 1"  disabled>
        <el-input v-model="billingForm.amountMoney" type="number"/>
      </el-form-item>
      <el-form-item label="开票金额"  v-if="routeType == 2"  disabled>
        <el-input v-model="billingForm.amountMoney" type="number"/>
      </el-form-item>

      <el-form-item label="税额" >
        <el-input v-model="billingForm.taxAmount" type="number" disabled/>
      </el-form-item>
      <el-form-item label='税务服务发票' prop='taxationInvoiceCode' v-if="routeType == 2">
        <Select
                :dataConfig="{ params: { type: 'DICT', dictType: 'TAX_INVOICE' } }"
                v-model:value='billingForm.taxationInvoiceCode'
                v-model:label='billingForm.taxationInvoiceName'
                placeholder='请选择税务服务发票' />
      </el-form-item>
      <el-form-item label="备注"  v-if="routeType == 1">
        <el-input v-model="billingForm.remark" type="textarea" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="发票备注"  v-if="routeType == 2">
        <el-input v-model="billingForm.remark" type="textarea" placeholder="请输入" />
      </el-form-item>
    </el-form>
  </div>

</template>

<script setup name="editTrustOrder">
  import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
  import { useRoute } from 'vue-router'
  import publicApi from '@/api/public/index'
  import Select from '@/components/Select/index.vue'
  import RemoteSelect from '@/components/RemoteSelect/index.vue'
  import api from '@/api/statement/miscBilling/index'
  import math from "../../../../../utils/math";
  const { proxy } = getCurrentInstance()
  const rateList = ref([]);//费率集合
  const formRef = ref(null);
  const processNameList = ref([])
  const cargoInfoList = ref([])
  const route = useRoute()
  const routeType = JSON.parse(route.meta.query).id
  const billingForm = ref({
    unitName:'',
    unitCode:'',
    companyId: '',
    companyName: '',
    rateItemCode:'',//费率
    rateId:'',
    rateName: '',
    billDate:'',//计费日期
    shipVoyage:'',//船名航次
    customerId:'',//客户id
    rate:'',
    taxRate:'',//税率
    billQuantity: '',
    billQuantity2: '',
    amountMoney:'',
    taxAmount: '',//税额
    voyageId: '',
    processCode:'',
    processName:'',
    taxationInvoiceCode:'',
    taxationInvoiceName:'',
    cargoInfoId:'',
    cargoInfoName:''
  });

  const rules = ref({
    companyId: [{required: true, message: '作业公司不可为空'}],
    billDate: [{required: true, message: '计费日期不可为空'}],
    rateCode: [{required: true, message: '费率不可为空'}],
    customerId: [{required: true, message: '客户不可为空'}],
    billQuantity: [{required: true, message: '计费量不可为空'}],
  });

  const getRateList = ()=>{
    let query = {
      dataSource: 1,
      routeType:routeType
    };
    api.getRateList(query).then(res=>{
      rateList.value = res.data;
    });
  }
  const customerChange = obj =>{
    if (!obj) {
      return
    }
    cargoInfoList.value = []
    api.getCargoList({customerId:obj.value,shipvoyageItemId:billingForm.value.voyageId}).then(res=>{
      cargoInfoList.value = res.data;
      if (billingForm.value.cargoInfoId) {
        let flag = false;
        cargoInfoList.value.forEach(item => {
          if (item.id == billingForm.value.cargoInfoId) {
            flag = true;
          }
        })
        if (!flag) {
          billingForm.value.cargoInfoId = ''
          billingForm.value.cargoInfoName = ''
        }
      }
      console.log(res.data)
    });
  }
  const voyageChange = val => {
    cargoInfoList.value = []
    let voyageId = '';
    if (val && val.value) {
      voyageId = val.value
    }
    if (billingForm.value.customerId != null && billingForm.value.customerId != undefined
        && billingForm.value.customerId != '') {
      api.getCargoList({customerId:billingForm.value.customerId,shipvoyageItemId:voyageId}).then(res=>{
        cargoInfoList.value = res.data;
        if (billingForm.value.cargoInfoId) {
          let flag = false;
          cargoInfoList.value.forEach(item => {
            if (item.id == billingForm.value.cargoInfoId) {
              flag = true;
            }
          })
          if (!flag) {
            billingForm.value.cargoInfoId = ''
            billingForm.value.cargoInfoName = ''
          }
        }
      });
    }
  }
  const changeRate = rateObj =>{
    if (!rateObj) {
      billingForm.value.rateItemCode = undefined
      billingForm.value.unitName = undefined
      billingForm.value.unitCode = undefined
      billingForm.value.rate = undefined
      billingForm.value.taxRate = undefined
      billingForm.value.amountMoney = undefined
      billingForm.value.taxAmount = undefined
      return
    }
    billingForm.value.rateItemCode = rateObj.rateItemCode;
    billingForm.value.unitName = rateObj.measurementUnitName1;
    billingForm.value.unitCode = rateObj.measurementUnitCode1;
    billingForm.value.rate = rateObj.rate;
    billingForm.value.taxRate = rateObj.taxRate;
    billingForm.value.rateName = rateObj.rateItemName;
    let taxRateTemp = billingForm.value.taxRate/100
    if(billingForm.value.billQuantity!==undefined && billingForm.value.billQuantity!==null && billingForm.value.billQuantity!==''){
      billingForm.value.amountMoney =
        Math.round( Number(billingForm.value.billQuantity)*(billingForm.value.billQuantity2 ? Number(billingForm.value.billQuantity2 ):Number( 1))*Number(billingForm.value.rate)*100)/100
      billingForm.value.taxAmount =
        Math.round((Number(billingForm.value.amountMoney)*Number(taxRateTemp))/(Number(taxRateTemp)+Number(1))*100)/100;
    }
	  billingForm.value.processCode = ''
	  billingForm.value.processName = ''
	  api.getProcessByRateItemCode({rateId:rateObj.id}).then(res=>{
      processNameList.value = res.data;
      console.log(res.data)
      billingForm.value.processCode = res.data[0].processCode
      billingForm.value.processName = res.data[0].processName
    });
  }

  const inputQuantity = val => {
    if(billingForm.value.rateId!==undefined && billingForm.value.rateId!==null && billingForm.value.rateId!==''){
      let taxRateTemp = billingForm.value.taxRate/100
      billingForm.value.amountMoney =
        Math.round( Number(billingForm.value.billQuantity)*(billingForm.value.billQuantity2 ? Number(billingForm.value.billQuantity2 ):Number( 1))*Number(billingForm.value.rate)*100)/100
      billingForm.value.taxAmount =
        Math.round((Number(billingForm.value.amountMoney)*Number(taxRateTemp))/(Number(taxRateTemp)+Number(1))*100)/100;
    }
  }

  const resetForm = ()=>{
    formRef.value.resetFields();

    billingForm.value = {
      rateId:'',//费率
      rateItemCode: '',
      rateName: '',
      billDate:'',//计费日期
      shipVoyage:'',//船名航次
      customerId:'',//客户id
      rate:'',
      taxRate:'',
      billQuantity: '',
      billQuantity2: '',
      amountMoney:'',
      taxAmount: '',
      processCode:'',
      processName:'',
      taxationInvoiceCode:'',
      taxationInvoiceName:'',
      cargoInfoId:'',
      cargoInfoName:''
    };
  }

  const validate = async () => {
    let flag = false
    await formRef.value.validate((valid, fields) => {
      if (valid) {
        flag = true
      } else {
        flag = false
        proxy.$message.warning('请完善表单信息！')
      }
    })

    return flag
  }

  onMounted(()=>{
    getRateList();

  })

  defineExpose({
    validate,
    resetForm,
    billingForm,
	  processNameList,
    cargoInfoList
  })
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
