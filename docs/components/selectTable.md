<script setup>
import SelectTable from '../../src/components/SelectTable/index.vue'
import RemoteSelectTable from '../../src/components/RemoteSelectTable/index.vue'
import { ref, reactive, nextTick, onMounted, h } from 'vue'
const myValue = ref('')
const myLabel = ref('')
const myValue1 = ref('')
const myLabel1 = ref('')
const dataConfig = {url:'/api/internal/public/getDictListByType/CARGO_CATEGORY'}

const tableColumns = ref([
    {prop:'dictLabel',label:'标题'},
    {prop:'dictValue',label:'值'},
])
const tableColumns1 = ref([
    {prop:'label',label:'标题'},
    {prop:'value',label:'值'},
])
const changeSelect = val => {
	console.log(val,myValue.value,myLabel.value, 'val')
}
const changeSelect1 = val => {
	console.log(val,myValue1.value,myLabel1.value, 'val')
}
</script>

# Select—Table 下拉表格

常用的大小、清空、多选、本地筛选和 `element-plus` 一致，使用即传入，不做过多描述。可查看 [Element Plus 官网](https://element-plus.org/zh-CN/component/select.html)

默认可清空、可本地筛选。

## 基本用法

传入参数 `dataConfig` 或 `selectData`来获取 options，传入`tableColumns`表头数据

通过`v-model:value`和`v-model:label`来绑定值。

如果是编辑模式下需要默认值，则直接给你绑定的`value`值赋值即可，也就是给例子中的`myValue`赋值。

`selectLabel`和`selectValue`为遍历显示`label`和`value`的字段名称。默认为`label`和`value`，如和默认一致无需传入。

`@change`为回显方法，返回 label,value 对象

<SelectTable
:dataConfig="dataConfig"
v-model:value="myValue"
v-model:label="myLabel"
selectLabel="dictLabel"
selectValue="dictValue"
:tableColumns="tableColumns"
@change="changeSelect"
/>

::: details Click me to view the code

```js
<SelectTable
    :dataConfig="dataConfig"
    v-model:value="myValue"
    v-model:label="myLabel"
    selectLabel="dictLabel"
    selectValue="dictValue"
    :tableColumns="tableColumns"
    @change="changeSelect"
/>
const myValue = ref('')
const myLabel = ref('')
const dataConfig = {url:'/api/internal/public/getDictListByType/CARGO_CATEGORY'}
// 该测试接口获取到的options为:
options:[
    {
        "dictValue": "0100",
        "dictLabel": "煤炭及制品",
        "id": "1599700809115900000",
        "dictType": "CARGO_CATEGORY",
        "DICTNAME": "货物类型"
    },
    {
        "dictValue": "0200",
        "dictLabel": "石油天然气制品",
        "id": "1599700896709740000",
        "dictType": "CARGO_CATEGORY",
        "DICTNAME": "货物类型"
    },
]
const tableColumns = ref([
    {prop:'dictLabel',label:'标题'},
    {prop:'dictValue',label:'值'},
])
const changeSelect = val => {
	console.log(val,myValue.value,myLabel.value, 'val') // {"label": "A","value": "1"} A 1
}
```

:::

## 远程搜索

传入参数 `type` 或 `dataConfig` 获取下拉框数据，`type`为后端定义；传入`tableColumns`为表头数据。初始为空，输入查询。该例使用`type`，`dataConfig`和本地使用一致。

通过`v-model:value`和`v-model:label`来绑定值

如果是编辑模式下需要默认值，则直接给你绑定的`value`值赋值即可，也就是给例子中的`myValue1`赋值。

`@change`为回显方法，返回 label,value 对象.

<RemoteSelectTable
type="USER_INFO"
v-model:value="myValue1"
v-model:label="myLabel1"
selectLabel="label"
selectValue="value"
:tableColumns="tableColumns1"
@change="changeSelect1"
/>

::: details Click me to view the code

```js
<RemoteSelectTable
    type="USER_INFO"
    v-model:value="myValue1"
    v-model:label="myLabel1"
    selectLabel="label"
    selectValue="value"
    :tableColumns="tableColumns"
    @change="changeSelect1"
/>
const myValue1 = ref('')
const myLabel1 = ref('')
const tableColumns1 = ref([
    {prop:'label',label:'标题'},
    {prop:'value',label:'值'},
])
const changeSelect1 = val => {
	console.log(val,myValue1.value,myLabel1.value, 'val') // {"label": "陈学龙","value": "1655753239867559936"} 陈学龙 1655753239867559936
}
```

:::
