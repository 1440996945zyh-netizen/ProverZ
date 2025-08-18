<template xmlns:el-col="http://www.w3.org/1999/xhtml">
	<el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="船舶货物信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="20">
          <!--<el-col :span="6">-->
            <!--<el-form-item label="作业公司" prop="zygsmch" >-->
              <!--<el-select v-model="formData.zygsdm" placeholder="请选择状态" :disabled ="updateShow" size="medium" @change="getKhxxByZygsdmCK('')">-->
                <!--<el-option-->
                  <!--v-for="(item, index)  in zygsOptions"-->
                  <!--:key="item.zygsdm"-->
                  <!--:label="item.zygsmch"-->
                  <!--:value="item.zygsdm">-->
                <!--</el-option>-->
              <!--</el-select>-->
            <!--</el-form-item>-->
          <!--</el-col>-->
          <el-col :span="6">
            <el-form-item label="出口船名"  prop="hc" v-if="chmInsertShow">
              <el-select
                v-model="formData.hc"
                placeholder="请先录入作业公司"
                filterable
                clearable
                @change="changekhxxCK"
                size="medium"
                :disabled="isShowChmCK"
                collapse-tags
                remote
                reserve-keyword
                :remote-method='remoteMethodShipCK'
                @focus="focusShipCK"
              >
                <el-option
                  v-for="item in zhwchmList"
                  :key="item.hc"
                  :label="item.zhwchm"
                  :value="item.hc">
                  <span style="float: left">{{ item.value }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="中文船名"  prop="zhwchm" v-if="chmUpdateShow" >
            <el-input v-model="formData.zhwchm" size="medium" :disabled ="updateShow"></el-input>
          </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="英文船名" prop="ywchm" >
              <el-input v-model="formData.ywchm" size="medium" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="港内货物名称" prop="hwmchXl" v-if="chmInsertShow">
              <el-select
                v-model="formData.hwdmXl"
                placeholder="请先录入作业公司"
                filterable
                clearable
                @change="changeHwInfoCK"
                size="medium"
              >
                <el-option
                  v-for="item in hwdmList"
                  :key="item.hwdmXl"
                  :label="item.hwmchXl"
                  :value="item.hwdmXl">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="港内货物名称" prop="hwmchXl" v-if="chmUpdateShow" >
              <el-input v-model="formData.hwmchXl" size="medium"  :disabled ="updateShow" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="海关放行人" prop="hqcyrid" >
              <el-select
                v-model="formData.hqcyrid"
                placeholder="请选择"
                filterable
                clearable
                collapse-tags
                remote
                reserve-keyword
                :remote-method='remoteMethod'
                @focus="focus"
                size="medium"

              >
                <el-option
                  v-for="item in hqcyrList"
                  :key="item.hqcyrid"
                  :label="item.hqcyr"
                  :value="item.hqcyrid">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="抵港日期" prop="dgrq" >
              <el-date-picker type="date"  value-format="YYYY-MM-DD" placeholder="选择日期" v-model="formData.dgrq" size="medium"   ></el-date-picker>
            </el-form-item>
          </el-col>

				</el-row>
			</el-collapse-item>
      <el-collapse-item title="放行单信息" name="2">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="报关单号" prop="bgdh" >
              <el-input v-model="formData.bgdh" size="medium"  ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申报单位" prop="sbdwmch" >
              <el-input v-model="formData.sbdwmch" size="medium" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="经营单位" prop="jydwmch" >
              <el-input v-model="formData.jydwmch" size="medium" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="提单号" prop="tdh" >
              <el-input v-model="formData.tdh" size="medium"  ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="通关货名" prop="tghwmch" >
              <el-input v-model="formData.tghwmch" size="medium"  ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span ="6">
            <el-form-item label="通关重量" prop="fxshl" >
              <el-input v-model="formData.fxshl" size="medium" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="通关件数" prop="tgjsh" >
              <el-input v-model="formData.tgjsh" size="medium" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="备注" prop="note" >
              <el-select v-model="formData.note" placeholder="请选择状态" size="medium" >
                <el-option label="全部通关" value="全部通关"></el-option>
                <el-option label="" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="放行日期" prop="fxrq" >
              <el-date-picker type="date"  value-format="YYYY-MM-DD" placeholder="选择日期" v-model="formData.fxrq" size="medium"   ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理航次" prop="dlhc" >
              <el-input v-model="formData.dlhc" size="medium" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="IMO" prop="imo" >
              <el-input v-model="formData.imo" size="medium" ></el-input>
            </el-form-item>
          </el-col>
       </el-row>
      </el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="drawer">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
//import Select from '@/components/Select'
//import RemoteSelect from '@/components/RemoteSelect'
import publicApi from '@/api/public/index'
const collapseOpen = ['1', '2'] // 打开的面板
let selectLabel = ref('dictLabel')
let selectValue = ref('dictValue')
const myValue = ref('')
const myLabel = ref('')
const ruleForm = ref()
const myValue1 = ref('')
const myLabel1 = ref('')
const zygsOptions =ref([{ zygsdm: '', zygsmch: '' }])
const zhwchmList = ref([{ zhwchm: '', value: '', cargokey: '', hc: '' }])
const hqcyrList =ref([{ hqcyrid: '', hqcyr: '' }])
const zcListCK = ref([])
const hwListCK = ref([])
const hwdmList =ref( [{ hwdmXl: '', hwmchXl: '' }])
const isShowChmCK = ref(true)
const chmUpdateShow = ref(false)//修改页面显示这个中文船名
const chmInsertShow = ref(true)//默认显示这个中文船名
const  updateShow = ref(false)//新增页面这些都是可操作的，修改的时候改成不可操作为true
const changeSelect1 = val => {
	console.log('远程回显')
	console.log(val, myValue1.value, myLabel1.value) // {"label": "陈学龙","value": "1655753239867559936"} 陈学龙 1655753239867559936
}
const formData = reactive({
  id:null,
  // 船舶货物信息
  hqcyrid: '',
  hqcyr: '',
  zygsdm: '',
  zygsmch: '',
  zhwchm: '',
  hwdmXl: '',
  hwmchXl: '',
  zhl: '',
  dgrq: '',
  cargokey: '',
  tgs: '',
  khfs: '',
  hc: '',
  // 放行单信息
  tdh: '',
  imo: '',
  dlhc: '',
  xcdId: '',
  ywchm: '',
  fxrq: '',
  bgdh: '',
  fxshl: 0,
  note: ''
})
const rules = reactive({
  zygsdm: proxy.getRules({
		required: true,
	}),
  hc: proxy.getRules({
		required: true,
	}),
  dgrq: proxy.getRules({
		required: true,
	}),
  bgdh: proxy.getRules({
		required: true,
	}),
})
/**
 * 初始化
 */
const init = (hqcyrid, hqcyr) => {
  // 海关放行人list
  proxy.$request({
    url: `/hgfx/getHqcyrInfo?hqcyrid=${hqcyrid}&hqcyr=${hqcyr}`,
    method: 'POST'
  }).then(res => {
    if (res.code === '0000') {
      hqcyrList.value = res.data
    }
  })
}
const remoteMethod = (query) => {
  // 输入文字模糊搜索，覆盖旧数据
  init('', query)
}
const focus = (event) => {
  if (!event.sourceCapabilities) return // 如果是勾选或反选下拉选项
  if (!event.target.value) { // 输入框没有搜索条件时触发
    init('', '')
  }
}
/**
 * 作业公司改变，查询该作业公司下对应的船舶
 */
const getKhxxByZygsdmCK = zhwchm => {
  isShowChmCK.value = false
  var lb = '出口'
  proxy.$request({
    url: `/hgfx/getKhxxByZygsdm?zhwchm=${zhwchm}&lb=${lb}`,
    method: 'post'
  }).then(res => {
    if (res.data !== null) {
      zhwchmList.value = res.data
      zcListCK.value = res.data // 暂存数据用于后面过滤
    }
  })
  // 查询货物信息
  proxy.$request({
    url: `/hgfx/getHwInfo?zygsdm=${formData.zygsdm}`,
    method: 'post'
  }).then(res => {
    if (res.data !== null) {
      hwdmList.value = res.data
      hwListCK.value = res.data // 暂存数据用于后面过滤
    }
  })
}
const remoteMethodShipCK = (query) => {
  // 输入文字模糊搜索，覆盖旧数据
  getKhxxByZygsdmCK(query)
}

 const focusShipCK = (event) => {
  if (!event.sourceCapabilities) return // 如果是勾选或反选下拉选项
  if (!event.target.value) { // 输入框没有搜索条件时触发
    // this.getKhxxByZygsdmCK('')
  }
}
/**
 * 选中货物后，自动赋值字段数据
 */
 const changeHwInfoCK = () => {
  const hwForm = JSON.parse(JSON.stringify(hwListCK.value.filter(item => item.hwdmXl === formData.hwdmXl)[0]))
    formData.hwdmXl = JSON.parse(JSON.stringify(hwForm.hwdmXl))
    formData.hwmchXl = JSON.parse(JSON.stringify(hwForm.hwmchXl))
}
/**
 * 选中某一条船（中文船名），自动赋值其他字段数据
 */
  const changekhxxCK = () => {
  const chbForm = JSON.parse(JSON.stringify(zcListCK.value.filter(item => item.hc === formData.hc)[0]))
  // this.insertHgfxJKForm.hqcyrid = JSON.parse(JSON.stringify(chbForm.hqcyrid))
  // this.insertHgfxJKForm.hqcyr = JSON.parse(JSON.stringify(chbForm.hqcyr))
  // this.insertHgfxCKForm.zygsdm = JSON.parse(JSON.stringify(chbForm.zygsdm))
  // this.insertHgfxCKForm.zygsmch = JSON.parse(JSON.stringify(chbForm.zygsmch))
    formData.zhwchm = JSON.parse(JSON.stringify(chbForm.zhwchm))
    formData.ywchm = JSON.parse(JSON.stringify(chbForm.ywchm))
  //   this.insertHgfxJKForm.hwdmXl = JSON.parse(JSON.stringify(chbForm.hwdmXl))
  //   this.insertHgfxJKForm.hwmchXl = JSON.parse(JSON.stringify(chbForm.hwmchXl))

  //   this.insertHgfxJKForm.zhl = JSON.parse(JSON.stringify(chbForm.zhl))
    formData.dgrq = JSON.parse(JSON.stringify(chbForm.dgrq))
  //   this.insertHgfxJKForm.cargokey = JSON.parse(JSON.stringify(chbForm.cargokey))
  //   this.insertHgfxJKForm.tgs = JSON.parse(JSON.stringify(chbForm.tgs))
  //    this.insertHgfxJKForm.khfs = JSON.parse(JSON.stringify(chbForm.khfs))
    formData.imo = JSON.parse(JSON.stringify(chbForm.imo))
    formData.hc = JSON.parse(JSON.stringify(chbForm.hc))
}
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
  chmUpdateShow.value = false //每次重置都要把该显示字段复原
  chmInsertShow.value = true
  updateShow.value = false
}
const changeSelect = val => {
	console.log(val, myValue.value, myLabel.value)
}
//修改的时候修改字段展示
const showUpdate=() =>{
  chmUpdateShow.value = true
  chmInsertShow.value = false
  updateShow.value = true
}
defineExpose({
	validate,
	resetForm,
  showUpdate,
	formData,
  hqcyrList,
  getKhxxByZygsdmCK
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
