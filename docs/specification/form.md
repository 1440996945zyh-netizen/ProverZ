<script setup>
import { ref, reactive, nextTick, onMounted, h,getCurrentInstance } from 'vue'
import Select from '@/components/Select/index.vue'
import { getRules } from '@/utils/common/form-validation.js'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import '@/assets/styles/formData.scss';
const formData = reactive({
    name:'',
    region:'',
    age:'',
    cityCode:'',
    cityName:'',
    hobby:'',
    sex:''
})
const collapseActiveNames = reactive(['1','2'])
const rules = reactive({
	hobby: getRules({ required: true }),
	sex: getRules({ required: true,trigger:'change' }),
})
const ruleForm = ref(null)
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
	ruleForm.value.resetFields() // 第二个form清空
}
const save = async () => {
    if(await validate()) {
        proxy.$modal.confirm('确定保存？').then(() => {
            alert('这里写你保存的逻辑！')
        })
    }
}
</script>

# 详情页的 form 写法

包括单列 form、多列 form、手风琴下 form 的写法；编辑时如何给 form 赋值；form 的校验规怎么写；
统一引用公共样式：`import '@/assets/styles/formData.scss';`

## 不同种类的 form

1. 单列 form : 使用类为`formData`的`div`包起来

<div class="formData">
    <el-form label-position="left" :model="formData" label-width="100">
        <el-form-item label="Name" prop="name">
            <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="Activity zone" prop="region">
            <el-input v-model="formData.region" />
        </el-form-item>
    </el-form>
</div>

::: details Click me to view the code

```js
<div class="formData">
    <el-form label-position="left" :model="formData" label-width="100">
        <el-form-item label="Name" prop="name">
            <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="Activity zone" prop="region">
            <el-input v-model="formData.region" />
        </el-form-item>
    </el-form>
</div>
const formData = reactive({
    name:'',
    region:'',
})
```

:::

2. 单列 form + 手风琴：
   <el-form label-position="left" :model="formData">
   <el-collapse v-model="collapseActiveNames">
   <el-collapse-item title="作业指令" name="1">
   <el-form-item label="Name" prop="name">
   <el-input v-model="formData.name" />
   </el-form-item>
   <el-form-item label="Activity zone" prop="region">
   <el-input v-model="formData.region" />
   </el-form-item>
   </el-collapse-item>
   <el-collapse-item title="船舶预报" name="2">
   <el-form-item label="我的年龄" prop="age">
   <el-input v-model="formData.age" />
   </el-form-item>
   <el-form-item label="我的城市" prop="cityCode">
   <Select
            :selectData="[{label:'上海',value:'shanghai'},{label:'北京',value:'beijing'}]"
            v-model:value="formData.cityCode"
            v-model:label="formData.cityName"
        />
   </el-form-item>
   </el-collapse-item>
   </el-collapse>
   </el-form>

::: details Click me to view the code

```js
<el-form label-position="left" :model="formData">
    <el-collapse v-model="collapseActiveNames">
        <el-collapse-item title="作业指令" name="1">
            <el-form-item label="Name" prop="name">
                <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item label="Activity zone" prop="region">
                <el-input v-model="formData.region" />
            </el-form-item>
        </el-collapse-item>
        <el-collapse-item title="船舶预报" name="2">
            <el-form-item label="我的年龄" prop="age">
                <el-input v-model="formData.age" />
            </el-form-item>
            <el-form-item label="我的城市" prop="cityCode">
                <Select
                    :selectData="[
                        { label: '上海', value: 'shanghai' },
                        { label: '北京', value: 'beijing' },
                    ]"
                    v-model:value="formData.cityCode"
                    v-model:label="formData.cityName"
                />
            </el-form-item>
        </el-collapse-item>
    </el-collapse>
</el-form>
import Select from '@/components/Select/index.vue'
const formData = reactive({
    name:'',
    region:'',
    age:'',
    cityCode:'',
    cityName:''
})
const collapseActiveNames = reactive(['1','2'])
```

:::

3. 多列 form：`label-position`选择`top`,`inline`选择`true`。

 <div class="formData">
     <el-form :inline="true" label-position="top" :model="formData">
         <el-row>
             <el-col :span="8">
                 <el-form-item label="Name" prop="name">
                     <el-input v-model="formData.name" />
                 </el-form-item>
             </el-col>
             <el-col :span="16">
                 <el-form-item label="Activity zone" prop="region">
                     <el-input v-model="formData.region" />
                 </el-form-item>
             </el-col>
         </el-row>
     </el-form>
 </div>

::: details Click me to view the code

```js
 <div class="formData">
     <el-form :inline="true" label-position="top" :model="formData">
         <el-row>
             <el-col :span="8">
                 <el-form-item label="Name" prop="name">
                     <el-input v-model="formData.name" />
                 </el-form-item>
             </el-col>
             <el-col :span="16">
                 <el-form-item label="Activity zone" prop="region">
                     <el-input v-model="formData.region" />
                 </el-form-item>
             </el-col>
         </el-row>
     </el-form>
 </div>
const formData = reactive({
    name:'',
    region:'',
})
```

:::

4. 多列 form+手风琴：
   <el-form :inline="true" label-position="top" :model="formData" :rules="rules">
   <el-collapse v-model="collapseActiveNames">
   <el-collapse-item title="作业指令" name="1">
   <el-row>
   <el-col :span="8">
   <el-form-item label="Name" prop="name">
   <el-input v-model="formData.name" />
   </el-form-item>
   </el-col>
   <el-col :span="16">
   <el-form-item label="Activity zone" prop="region">
   <el-input v-model="formData.region" />
   </el-form-item>
   </el-col>
   </el-row>
   </el-collapse-item>
   <el-collapse-item title="船舶预报" name="2">
   <el-row>
   <el-col :span="8">
   <el-form-item label="我的年龄" prop="age">
   <el-input v-model="formData.age" />
   </el-form-item>
   </el-col>
   <el-col :span="16">
   <el-form-item label="我的城市" prop="cityCode">
   <Select
           :selectData="[{label:'上海',value:'shanghai'},{label:'北京',value:'beijing'}]"
           v-model:value="formData.cityCode"
           v-model:label="formData.cityName"
       />
   </el-form-item>
   </el-col>
   </el-row>
   </el-collapse-item>
   </el-collapse>
   </el-form>

::: details Click me to view the code

```js
<el-form :inline="true" label-position="top" :model="formData" :rules="rules">
    <el-collapse v-model="collapseActiveNames">
        <el-collapse-item title="作业指令" name="1">
            <el-row>
                <el-col :span="8">
                    <el-form-item label="Name" prop="name">
                        <el-input v-model="formData.name" />
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item label="Activity zone" prop="region">
                        <el-input v-model="formData.region" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-collapse-item>
        <el-collapse-item title="船舶预报" name="2">
            <el-row>
                <el-col :span="8">
                    <el-form-item label="我的年龄" prop="age">
                        <el-input v-model="formData.age" />
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item label="我的城市" prop="cityCode">
                        <Select
                            :selectData="[
                                { label: '上海', value: 'shanghai' },
                                { label: '北京', value: 'beijing' },
                            ]"
                            v-model:value="formData.cityCode"
                            v-model:label="formData.cityName"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-collapse-item>
    </el-collapse>
</el-form>
import Select from '@/components/Select/index.vue'

const formData = reactive({
    name:'',
    region:'',
    age:'',
    cityCode:'',
    cityName:''
})
const collapseActiveNames = reactive(['1','2'])
```

:::

## form 的校验规则 rules 写法 以及 保存时校验

<div class="formData">
    <el-form label-position="left" :model="formData" label-width="100" :rules="rules" ref="ruleForm">
        <el-form-item label="爱好" prop="hobby">
            <el-input v-model="formData.hobby" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
            <Select
                :selectData="[
                    { label: '男', value: 'man' },
                    { label: '女', value: 'women' },
                ]"
                v-model:value="formData.sex"
            />
        </el-form-item>
    </el-form>
</div>

<el-button @click="save">保存</el-button>
::: details Click me to view the code

```js
<div class="formData">
    <el-form label-position="left" :model="formData" label-width="100" :rules="rules" ref="ruleForm">
        <el-form-item label="爱好" prop="hobby">
            <el-input v-model="formData.hobby" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
            <Select
                :selectData="[
                    { label: '男', value: 'man' },
                    { label: '女', value: 'women' },
                ]"
                v-model:value="formData.sex"
            />
        </el-form-item>
    </el-form>
</div>

<el-button @click="save">保存</el-button>
const rules = reactive({
	hobby: proxy.getRules({ required: true }),
	sex: proxy.getRules({ required: true,trigger:'change' }),
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
	console.log(ruleForm, 'ruleForm')
	ruleForm.value.resetFields() // 第二个form清空
}

```

:::

## 编辑时父组件给 formData 赋值方法

详情可以参照快速上手中的例子
