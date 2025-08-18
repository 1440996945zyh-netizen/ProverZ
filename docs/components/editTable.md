<script setup>
import EditTable from '../../src/components/EditTable/index.vue'
import { ref, reactive, nextTick, onMounted, h,computed } from 'vue'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
const editTable = ref()
const tableData = ref([
  {id:10001,date: '2016-05-03',name: 'Tom',sex: 'man',},
  {id:10002,date: '2016-05-02',name: 'Tom',sex: 'women',},
  {id:10003,date: '2016-05-01',name: 'angela',sex: 'man',}
])
const tableColumns = ref([
	{ label: '日期', prop: 'date',editType: 'date', editRender: {} },
	{ label: '姓名', prop: 'name', editType: 'input', editRender: {} },
    {
		prop: 'sex',
		label: '性别',
		editType: 'select',
		editRender: {},
        modelLabel:'myLabel',
		selectData: [
			{ label: '男', value: 'man' },
			{ label: '女', value: 'women' },
		],
	},
])
const editConfig = reactive({ trigger: 'click', mode: 'cell', autoClear: false })
const editRules = ref({
    name: [
    { required: true, message: '姓名必须填写' }
    ],
    sex: [
    { required: true, message: '性别必须填写' }
    ],
    date: [
    { required: true, message: '日期必须填写' }
    ]
})
const save = async () => {
    console.log(await editTable.value.validAllEvent(),'???')
}
const tableDisData = ref([
  {id:10001,date: '2016-05-03',name: 'Tom',sex: 'man',dis:true},
  {id:10002,date: '2016-05-02',name: 'Tom',sex: 'women',},
  {id:10003,date: '2016-05-01',name: 'angela',sex: 'man',}
])
</script>

## 可编辑表格基本用法

在原有基础上，传`editConfig`来增加可编辑功能；在`tableColumns`中传`editType`和`editRender`来开启当前列编辑功能.

<EditTable
    ref="editTable"
    :tableHeight="300"
    :tableColumns="tableColumns"
    :tableData="tableData"
    :editConfig="editConfig"
    :loading="false"
/>

::: details Click me to view the code

```js
<EditTable
    ref="editTable"
    :tableHeight="300"
    :tableColumns="tableColumns"
    :tableData="tableData"
    :editConfig="editConfig"
    :loading="false"
/>
const tableData = ref([
  {id:10001,date: '2016-05-03',name: 'Tom',sex: 'man',},
  {id:10002,date: '2016-05-02',name: 'Tom',sex: 'women',},
  {id:10003,date: '2016-05-01',name: 'angela',sex: 'man',}
])
// 需要配置editType来定义编辑类型，editRender必传
const tableColumns = ref([
	{ label: '日期', prop: 'date',editType: 'date', editRender: {} },
	{ label: '姓名', prop: 'name', editType: 'input', editRender: {} },
    {
		prop: 'sex',
		label: '性别',
		editType: 'select',
		editRender: {},
        modelLabel:'myLabel', // 选中label绑定的字段
		selectData: [
			{ label: '男', value: 'man' },
			{ label: '女', value: 'women' },
		],
	},
])
const editConfig = reactive({ trigger: 'click', mode: 'cell', autoClear: false })
```

:::

## 可编辑的校验

需要校验方法`:editRules="editRules"`;调用组件方法`validAllEvent`。

<EditTable
    ref="editTable"
    :tableHeight="300"
    :tableColumns="tableColumns"
    :tableData="tableData"
    :editConfig="editConfig"
    :editRules="editRules"
    :loading="false"
/>
<el-button @click="save">保存</el-button>

::: details Click me to view the code

```js
<EditTable
    ref="editTable"
    :tableHeight="300"
    :tableColumns="tableColumns"
    :tableData="tableData"
    :editConfig="editConfig"
    :editRules="editRules"
    :loading="false"
/>
const tableData = ref([
  {id:10001,date: '2016-05-03',name: 'Tom',sex: '男',},
  {id:10002,date: '2016-05-02',name: 'Tom',sex: '女',},
  {id:10003,date: '2016-05-01',name: 'angela',sex: '男',}
])
// 需要配置editType来定义编辑类型，editRender必传
const tableColumns = ref([
	{ label: '日期', prop: 'date',editType: 'date', editRender: {} },
	{ label: '姓名', prop: 'name', editType: 'input', editRender: {} },
    {
		prop: 'sex',
		label: '性别',
		editType: 'select',
		editRender: {},
        selectLabel:'', // options绑定的值，默认为label，和默认一致则不用传。
        selectValue:'', // options绑定的值，默认为value，和默认一致则不用传。
		selectData: [
			{ label: '男', value: 'man' },
			{ label: '女', value: 'women' },
		],
	},
])
const editConfig = reactive({ trigger: 'click', mode: 'cell' })
const editRules = ref({
    name: [
    { required: true, message: '姓名必须填写' }
    ],
    sex: [
    { required: true, message: '性别必须填写' }
    ],
    date: [
    { required: true, message: '日期必须填写' }
    ]
})
const editTable = ref()
const save = async () => {
    // 如果校验通过为true，未通过为false
    if(await editTable.value.validAllEvent()) {
        console.log('可以保存')
    }
}
```

:::

## 指定某行不可编辑

传入`disabledKey`来指定根据什么`key`判断是否可编辑

<EditTable
    ref="editTable"
    :tableHeight="300"
    :tableColumns="tableColumns"
    :tableData="tableDisData"
    :editConfig="editConfig"
    :loading="false"
    disabledKey="dis"
/>

::: details Click me to view the code

```js
<EditTable
    ref="editTable"
    :tableHeight="300"
    :tableColumns="tableColumns"
    :tableData="tableDisData"
    :editConfig="editConfig"
    :loading="false"
    disabledKey="dis"
/>
const tableDisData = ref([
  {id:10001,date: '2016-05-03',name: 'Tom',sex: 'man',dis:true},
  {id:10002,date: '2016-05-02',name: 'Tom',sex: 'women',},
  {id:10003,date: '2016-05-01',name: 'angela',sex: 'man',}
])
// 需要配置editType来定义编辑类型，editRender必传
const tableColumns = ref([
	{ label: '日期', prop: 'date',editType: 'date', editRender: {} },
	{ label: '姓名', prop: 'name', editType: 'input', editRender: {} },
    {
		prop: 'sex',
		label: '性别',
		editType: 'select',
		editRender: {},
        modelLabel:'myLabel', // 选中label绑定的字段
		selectData: [
			{ label: '男', value: 'man' },
			{ label: '女', value: 'women' },
		],
	},
])
const editConfig = reactive({ trigger: 'click', mode: 'cell', autoClear: false })
```

:::

## 查看状态全不可编辑

传入`isGet`为 true

<EditTable
    ref="editTable"
    :tableHeight="300"
    :tableColumns="tableColumns"
    :tableData="tableData"
    :editConfig="editConfig"
    :loading="false"
    :isGet="true"
/>

::: details Click me to view the code

```js
<EditTable
    ref="editTable"
    :tableHeight="300"
    :tableColumns="tableColumns"
    :tableData="tableData"
    :editConfig="editConfig"
    :loading="false"
    :isGet="true"
/>
const tableData = ref([
  {id:10001,date: '2016-05-03',name: 'Tom',sex: 'man'},
  {id:10002,date: '2016-05-02',name: 'Tom',sex: 'women',},
  {id:10003,date: '2016-05-01',name: 'angela',sex: 'man',}
])
// 需要配置editType来定义编辑类型，editRender必传
const tableColumns = ref([
	{ label: '日期', prop: 'date',editType: 'date', editRender: {} },
	{ label: '姓名', prop: 'name', editType: 'input', editRender: {} },
    {
		prop: 'sex',
		label: '性别',
		editType: 'select',
		editRender: {},
        modelLabel:'myLabel', // 选中label绑定的字段
		selectData: [
			{ label: '男', value: 'man' },
			{ label: '女', value: 'women' },
		],
	}
])
const editConfig = reactive({ trigger: 'click', mode: 'cell', autoClear: false })
```

:::

## 最后一列新增功能

传入`hasAdd`为 true

<EditTable
    ref="editTable"
    :tableHeight="300"
    :tableColumns="tableColumns"
    :tableData="tableData"
    :editConfig="editConfig"
    :loading="false"
    :hasAdd="true"
/>

::: details Click me to view the code

```js
<EditTable
    ref="editTable"
    :tableHeight="300"
    :tableColumns="tableColumns"
    :tableData="tableData"
    :editConfig="editConfig"
    :loading="false"
    :hasAdd="true"
/>
const tableData = ref([
  {id:10001,date: '2016-05-03',name: 'Tom',sex: 'man'},
  {id:10002,date: '2016-05-02',name: 'Tom',sex: 'women',},
  {id:10003,date: '2016-05-01',name: 'angela',sex: 'man',}
])
// 需要配置editType来定义编辑类型，editRender必传
const tableColumns = ref([
	{ label: '日期', prop: 'date',editType: 'date', editRender: {} },
	{ label: '姓名', prop: 'name', editType: 'input', editRender: {} },
    {
		prop: 'sex',
		label: '性别',
		editType: 'select',
		editRender: {},
        modelLabel:'myLabel', // 选中label绑定的字段
		selectData: [
			{ label: '男', value: 'man' },
			{ label: '女', value: 'women' },
		],
	},
])
const editConfig = reactive({ trigger: 'click', mode: 'cell', autoClear: false })
```

:::
