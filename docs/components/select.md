<script setup>
import Select from '../../src/components/Select/index.vue'
import RemoteSelect from '../../src/components/RemoteSelect/index.vue'
import { ref, reactive, nextTick, watch,onMounted, h } from 'vue'
const myValue = ref('')
const myLabel = ref('')
let selectLabel = ref('dictLabel')
let selectValue = ref('dictValue')
const myValue1 = ref('2')
const myLabel1 = ref('')
let dataConfigRadio = ref('url')
let dataConfig = reactive({url:'/api/internal/public/getDictListByType/CARGO_CATEGORY'})

watch(dataConfigRadio,newV => {
    console.log(newV,'newVVVV')
    if(newV === 'url') {
        dataConfig = {url:'/api/internal/public/getDictListByType/CARGO_CATEGORY'}
        selectLabel.value = 'dictLabel'
        selectValue.value = 'dictValue'
    } else if(newV === 'urlDict'){
        dataConfig = {url: '/api/internal/public/getDictList?types=FEE_ITEM_TYPE',dictType:'FEE_ITEM_TYPE'}
        selectLabel.value = 'dictLabel'
        selectValue.value = 'dictValue'
    } else if(newV === 'type'){
        dataConfig = {type:'CARGO_CATEGORY'}
        selectLabel.value = 'label'
        selectValue.value = 'value'
    }
})

const changeSelect = val => {
	console.log(val,myValue.value,myLabel.value, 'val')
}
const changeSelect1 = val => {
	console.log(val,myValue1.value,myLabel1.value, 'val')
}
</script>

# Select 下拉框

当选项过多时，使用下拉菜单展示并选择内容，常用的大小、禁用、清空、多选、本地筛选和 `element-plus` 一致，使用即传入，不做过多描述。可查看 [Element Plus 官网](https://element-plus.org/zh-CN/component/select.html)

默认可清空、可本地筛选。

## 基本用法

传入参数 `dataConfig`或者`selectData`来获取 options

通过`v-model:value`和`v-model:label`来绑定值，如果不绑定值的话，会选不上值哦！

如果是编辑模式下需要默认值，则直接给你绑定的`value`值赋值即可，也就是给例子中的`myValue`赋值。

`selectLabel`和`selectValue`为遍历显示`label`和`value`的字段名称。默认为`label`和`value`，如和默认一致无需传入。
`@change`为回显方法，返回 label,value 对象

<el-radio-group v-model="dataConfigRadio" class="ml-4">
    <el-radio label="url">dataConfig的Url（数据结构为res.data）</el-radio>
    <el-radio label="urlDict">dataConfig的Url（数据结构为res.data）</el-radio>
    <el-radio label="type">dataConfig的type</el-radio>
</el-radio-group>

<Select
:dataConfig="dataConfig"
v-model:value="myValue"
v-model:label="myLabel"
:selectLabel="selectLabel"
:selectValue="selectValue"
@change="changeSelect"
/>

::: details Click me to view the code

```js
<el-radio-group v-model="dataConfigRadio" class="ml-4">
    <el-radio label="url">dataConfig的Url（数据结构为res.data）</el-radio>
    <el-radio label="urlDict">dataConfig的Url（数据结构为res.data）</el-radio>
    <el-radio label="type">dataConfig的type</el-radio>
</el-radio-group>

<Select
    :dataConfig="dataConfig"
    v-model:value="myValue"
    v-model:label="myLabel"
    :selectLabel="selectLabel"
    :selectValue="selectValue"
    @change="changeSelect"
/>
const myValue = ref('')
const myLabel = ref('')
let selectLabel = ref('dictLabel')
let selectValue = ref('dictValue')
let dataConfigRadio = ref('url')
let dataConfig = reactive({url:'/api/internal/public/getDictListByType/CARGO_CATEGORY'})

watch(dataConfigRadio,newV => {
    if(newV === 'url') {
        dataConfig = {url:'/api/internal/public/getDictListByType/CARGO_CATEGORY'}
        selectLabel.value = 'dictLabel'
        selectValue.value = 'dictValue'
    } else if(newV === 'urlDict'){
        dataConfig = {url: '/api/internal/public/getDictList?types=FEE_ITEM_TYPE',dictType:'FEE_ITEM_TYPE'}
        selectLabel.value = 'dictLabel'
        selectValue.value = 'dictValue'
    } else if(newV === 'type'){
        dataConfig = {type:'CARGO_CATEGORY'}
        selectLabel.value = 'label' // 这种的selectLabel和selectValue可以不传，默认就是label和value
        selectValue.value = 'value'
    }
})

const changeSelect = val => {
	console.log(val,myValue.value,myLabel.value) // {"label": "A","value": "1"} 'A' '1'
}
```

:::

## 远程搜索

传入参数 `type` 或 `dataConfig`，`type`为后端定义。初始为空，输入查询。

通过`v-model:value`和`v-model:label`来绑定值。如果不绑定值的话，会选不上值哦！

如果是编辑模式下需要默认值，则直接给你绑定的`value`值赋值即可，也就是给例子中的`myValue1`赋值。

`changeSelect`为回显方法，返回 label,value 对象.

<RemoteSelect
type="USER_INFO"
v-model:value="myValue1"
v-model:label="myLabel1"
@change="changeSelect1"
/>

::: details Click me to view the code

```js
<RemoteSelect
    type="USER_INFO"
    v-model:value="myValue1"
    v-model:label="myLabel1"
    @change="changeSelect1"
/>
const myValue1 = ref('')
const myLabel1 = ref('')
const changeSelect1 = val => {
	console.log(val,myValue1.value,myLabel1.value) // {"label": "陈学龙","value": "1655753239867559936"} 陈学龙 1655753239867559936
}
```

:::
