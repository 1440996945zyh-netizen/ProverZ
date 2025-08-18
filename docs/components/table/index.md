<script setup>
import BaseTable from '@/components/BaseTable/index.vue'
import RenderTable from './renderTable.vue'
import { ref, reactive, nextTick, onMounted, h } from 'vue'
import { formatMoney } from '@/utils/index.js'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
const baseTable = ref()
const tableData = ref([
  {
    id:10001,
    date: '2016-05-03',
    name: 'Tom',
    age: '179',
  },
  {
    id:10002,
    date: '2016-05-02',
    name: 'Tom',
    age: '189',
  },
  {
    id:10003,
    date: '2016-05-01',
    name: 'angela',
    age: '199',
  }
])
const tableColumns = ref([
    {label:'日期',prop:'date'},
    {label:'姓名',prop:'name'},
    {label:'年龄',prop:'age'},
])
// 使用表尾方法
const footerConfig = reactive({
	columns: [{ prop: 'age', formatter: formatMoney }],
	functions: ['平均值', '合计'],
})
const spanMethodColumns = ref([
    {label:'key',prop:'key'},
    {label:'内容',prop:'content'},
    {label:'语言',prop:'language'},
])
const spanMethodData = ref([
    { id: 10001, key: 'app.label.name', content: '名称', language: 'zh_CN' },
    { id: 10002, key: 'app.label.name', content: 'Name', language: 'en_US' },
    { id: 10003, key: 'app.label.sex', content: '性别', language: 'zh_CN' },
    { id: 10004, key: 'app.label.sex', content: 'Sex', language: 'en_US' },
    { id: 10005, key: 'app.label.age', content: '年龄', language: 'zh_CN' },
    { id: 10006, key: 'app.label.age', content: 'Age', language: 'en_US' },
])

// 通用行合并函数（将相同多列数据合并为一行）
const mergeRowMethod = ({ row, _rowIndex, column, visibleData }) => {
    const fields = ['key']
    const cellValue = row[column.field]
    if (cellValue && fields.includes(column.field)) {
    const prevRow = visibleData[_rowIndex - 1]
    let nextRow = visibleData[_rowIndex + 1]
    if (prevRow && prevRow[column.field] === cellValue) {
        return { rowspan: 0, colspan: 0 }
    } else {
        let countRowspan = 1
        while (nextRow && nextRow[column.field] === cellValue) {
        nextRow = visibleData[++countRowspan + _rowIndex]
        }
        if (countRowspan > 1) {
        return { rowspan: countRowspan, colspan: 1 }
        }
    }
    }
}

const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'id' }
const columnConfig = { isCurrent: true, isHover: true, width: 50 }

const tableTypeColumns = ref([
    {label:'序号',type:'seq'},
    {label:'复选',type:'checkbox'},
    {label:'单选',type:'radio'},
    {label:'展开行',type:'expand'},
    {label:'日期',prop:'date'},
    {label:'姓名',prop:'name'},
    {label:'年龄',prop:'age'},
])

// 单选框配置
const radioConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	visibleMethod:({row}) => { // 返回显示的单选框
	  return row.age > 180
	},
	checkMethod: ({ row }) => {
		// 返回可选的单选框
		return row.age > 190
	},
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
const radioChangeEvent = ({ row }) => {
    console.log('单选事件:',row)
}
// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 	开启复选框范围选择功能
	visibleMethod:({row}) => { // 返回显示的单选框
	  return row.age > 180
	},
	checkMethod: ({ row }) => {
		// 返回可选的单选框
		return row.age > 190
	},
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
// 全选事件
const selectAllChangeEvent= ({ checked }) => {
    console.log(checked ? '所有勾选事件' : '所有取消事件')
}
// 复选事件
const checkboxChangeEvent = (data) => {
    console.log('选中数据：', data)
}
// 编辑框配置
const editConfig = reactive({ trigger: 'click', mode: 'cell' })
// 树形表头
const tableTreeColumns = ref([
	{ prop: '', label: '序号', type: 'checkbox', treeNode: true },
    {label:'标题',prop:'label',treeNode:true}
])
const tableTreeData = ref([
	{
		label: 'Level one 1',
		id: 1000,
		children: [
			{
				label: 'Level two 1-1',
				id: 10001000,
				children: [
					{
						label: 'Level three 1-1-1',
						id: 100010001000,
					},
				],
			},
		],
	},
	{
		label: 'Level one 2',
		id: 2000,
		children: [
			{
				label: 'Level two 2-1',
				id: 20002000,
				children: [
					{
						label: 'Level three 2-1-1',
						id: 200020002000,
					},
				],
			},
			{
				label: 'Level two 2-2',
				id: 20001,
				children: [
					{
						label: 'Level three 2-2-1',
						id: 200012001,
					},
				],
			},
		],
	},
])
// 树形配置
const treeConfig = { 
    rowField: 'id',
    line:true, // 树节点的连接线
    expandAll:true, // 默认展开所有节点
    expandRowKeys:null, // 默认展开哪个节点使用哪个row-config.keyField
    accordion:false, // 手风琴
}
</script>

# Table 表格

用于展示多条结构类似的数据，和 `element-plus` 基本一致.

## 基础表格

传入参数 `tableColumns` 和 `tableData`

`tableHeight`高度默认为页面高度，当前文档方便查看默认 200

<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :tableHeight="200"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :tableHeight="200"
/>
const tableData = ref([
  {
    id:10001,
    date: '2016-05-03',
    name: 'Tom',
    age: '179',
  },
  {
    id:10002,
    date: '2016-05-02',
    name: 'Tom',
    age: '189',
  },
  {
    id:10003,
    date: '2016-05-01',
    name: 'angela',
    age: '199',
  }
])
const tableColumns = ref([
    {label:'日期',prop:'date'},
    {label:'姓名',prop:'name'},
    {label:'年龄',prop:'age'},
])
```

:::

## 尺寸大小

可以设置大小尺寸：`medium` / `small` / `mini`
<BaseTable
:tableColumns="tableColumns"
:tableData="tableData"
:size="'mini'"
:tableHeight="200"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :size="'mini'"
    :tableHeight="200"
/>
```

:::

## 斑马条纹

斑马线条纹，通过设置 `stripe` 参数
（注：斑马线条纹不支持树结构）
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :stripe="true"
    :tableHeight="200"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :stripe="true"
    :tableHeight="200"
/>
```

:::

## 边框

通过设置 `border` 默认显示边框
可选值：`default`（默认）, `full | true`（完整边框）, `outer`（外边框）, `inner`（内边框）, `none`（无边框）
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :border="true"
    :tableHeight="200"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :border="true"
    :tableHeight="200"
/>
```

:::

## 是否为圆角边框

通过设置 `round` 默认显示边框
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :round="true"
    :tableHeight="200"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :round="true"
    :tableHeight="200"
/>
```

:::

## 表格高度

-   设置为`normalTableHeight`,`pageTableHeight`,`tabTableHeight`,`drawerNormalTableHeight`,`drawerPageTableHeight`,`drawerHeaderPageTableHeight`字符串则默认走计算好的高度。

具体高度以及含义访问'@/store/modules/tableParams.js'
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    tableHeight="pageTableHeight"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    tableHeight="pageTableHeight"
/>
```

:::

-   设置为 null 则是不设高度，根据数据数量撑开。注意这里是字符串 null
    <BaseTable
        :tableColumns="tableColumns"
        :tableData="tableData"
        tableHeight="null"
    />

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    tableHeight="null"
/>
```

:::

-   设置为 `auto-resize` 响应式就可以自动跟随父容器宽、高动态变化

因为此表格有默认高度，当使用`auto-resize`时，需要同时将`tableHeight`设置为`auto`

<div style="height:300px;border:1px solid red">
    <BaseTable
        :tableColumns="tableColumns"
        :tableData="tableData"
        :auto-resize="true"
        tableHeight="auto"
    />
</div>

::: details Click me to view the code

```js
<div style="height:300px">
    <BaseTable
        :tableColumns="tableColumns"
        :tableData="tableData"
        :auto-resize="true"
        tableHeight="auto"
    />
</div>
```

:::

## 是否显示表头

通过设置 `show-header` ，默认显示表头。

<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :show-header="false"
    tableHeight="200"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :show-header="false"
    tableHeight="200"
/>
```

:::

## 是否显示表尾

通过设置 `show-footer` ，配合`footer-method`使用，默认不显示表尾。

<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :show-footer="true"
    :footerConfig="footerConfig"
    tableHeight="300"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :show-footer="true"
    :footerConfig="footerConfig"
    tableHeight="200"
/>
import { formatMoney } from '@/utils/index.js'
// 脚函数
const footerConfig = reactive({
	columns: [{ prop: 'age', formatter: formatMoney }], // 哪一列使用表尾函数，是否需要格式化处理
	functions: ['平均值', '合计'], // 表尾使用方法名
})
```

:::

## 合并单元格

-   通过设置 `span-method` 自定义方法，使用方法与 element-plus 一致。

-   下面例子为较为常见的合并相同数据的方法.

-   （注：span-method ，不能用于虚拟滚动、树形结构、展开行、固定列，合并的逻辑都是自行实现的，该示例仅供参考）
    <BaseTable
        :tableColumns="spanMethodColumns"
        :tableData="spanMethodData"
        :span-method="mergeRowMethod"
        tableHeight="200"
    />

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="spanMethodColumns"
    :tableData="spanMethodData"
    :span-method="mergeRowMethod"
    tableHeight="200"
/>
const spanMethodColumns = ref([
    {label:'key',prop:'key'},
    {label:'内容',prop:'content'},
    {label:'语言',prop:'language'},
])
const spanMethodData = ref([
    { id: 10001, key: 'app.label.name', content: '名称', language: 'zh_CN' },
    { id: 10002, key: 'app.label.name', content: 'Name', language: 'en_US' },
    { id: 10003, key: 'app.label.sex', content: '性别', language: 'zh_CN' },
    { id: 10004, key: 'app.label.sex', content: 'Sex', language: 'en_US' },
    { id: 10005, key: 'app.label.age', content: '年龄', language: 'zh_CN' },
    { id: 10006, key: 'app.label.age', content: 'Age', language: 'en_US' },
])

// 通用行合并函数（将相同多列数据合并为一行）
const mergeRowMethod = ({ row, _rowIndex, column, visibleData }) => {
    const fields = ['key']
    const cellValue = row[column.field]
    if (cellValue && fields.includes(column.field)) {
    const prevRow = visibleData[_rowIndex - 1]
    let nextRow = visibleData[_rowIndex + 1]
    if (prevRow && prevRow[column.field] === cellValue) {
        return { rowspan: 0, colspan: 0 }
    } else {
        let countRowspan = 1
        while (nextRow && nextRow[column.field] === cellValue) {
        nextRow = visibleData[++countRowspan + _rowIndex]
        }
        if (countRowspan > 1) {
        return { rowspan: countRowspan, colspan: 1 }
        }
    }
    }
}
```

:::

## 行配置

通过设置 `row-config` 来进行行配置。

```js
{
    useKey:boolean, //是否需要为每一行的 VNode 设置 key 属性（非特殊情况下不需要使用）,默认为false
    keyField:string,// 自定义行数据唯一主键的字段名（默认自动生成）
    isCurrent:boolean, // 当鼠标点击行时，是否要高亮当前行,默认为true
    isHover:boolean,//	当鼠标移到行时，是否要高亮当前行,默认为true
    height:number, // 	只对 show-overflow 有效，每一行的高度
}
```

<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    tableHeight="200"
    :row-config="rowConfig"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :row-config="rowConfig"
    tableHeight="200"
/>
const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'id' }

```

:::

## 列配置

通过设置 `column-config` 来进行行配置。

```js
{
    useKey:boolean, //是否需要为每一行的 VNode 设置 key 属性（非特殊情况下不需要使用）
    isCurrent:boolean, // 当鼠标点击行时，是否要高亮当前行,默认为false
    isHover:boolean,//	当鼠标移到行时，是否要高亮当前行,默认为false
    width:auto, px, %, // 每一列的宽度
    minWidth:auto, px, %, // 每一列的最小宽度
    resizable:boolean, // 每一列是否启用列宽调整，默认为true
}
```

<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    tableHeight="200"
    :column-config="columnConfig"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableColumns"
    :tableData="tableData"
    :column-config="columnConfig"
    tableHeight="200"
/>
const columnConfig = { isCurrent: true, isHover: true, width: 50 }

```

:::

## 特殊列

通过设置 `tableColumns`中的`type` 来进行特殊列配置。

<BaseTable
    :tableColumns="tableTypeColumns"
    :tableData="tableData"
    tableHeight="200"
/>

::: details Click me to view the code

```js
<BaseTable
    :tableColumns="tableTypeColumns"
    :tableData="tableData"
    tableHeight="200"
/>
const tableTypeColumns = ref([
    { label:'序号',type:'seq'},
    { label:'复选',type:'checkbox'},
    { label:'单选',type:'radio'},
    { label:'展开行',type:'expand'},
    {label:'日期',prop:'date'},
    {label:'姓名',prop:'name'},
    {label:'年龄',prop:'age'},
])

```

:::

## 单选框

-   通过设置 `radio-config` 来进行单选配置；通过配置`radio-change` 来触发选中事件,使用`radio-change`最好通过`row-config`设置`keyField`.
-   通过调 BaseTable 中的`setRadioRow`和`clearRadioRow`来设置和清空选中状态

<el-button @click="baseTable.setRadioRow(tableData[2])">设置第三个数据选中</el-button>
<el-button @click="baseTable.clearRadioRow()">清空选中状态</el-button>
<BaseTable
    ref="baseTable"
    :tableColumns="tableTypeColumns"
    :tableData="tableData"
    tableHeight="200"
    :row-config="rowConfig"
    :radio-config="radioConfig"
    :radioChangeEvent="radioChangeEvent"
/>

::: details Click me to view the code

```js
<el-button @click="baseTable.setRadioRow(tableData[2])">设置第三个数据选中</el-button>
<el-button @click="baseTable.clearRadioRow()">清空选中状态</el-button>
<BaseTable
    ref="baseTable"
    :tableColumns="tableTypeColumns"
    :tableData="tableData"
    tableHeight="200"
    :row-config="rowConfig"
    :radio-config="radioConfig"
    :radioChangeEvent="radioChangeEvent"
/>
const radioConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	visibleMethod:({row}) => { // 返回显示的单选框
	  return row.age > 190
	},
	checkMethod: ({ row }) => {
		// 返回可选的单选框
		return row.age > 180
	},
	checkRowKey: 10003, // 默认选中行，需要在row.config中设置keyField
}
const radioChangeEvent = ({ row }) => {
    console.log('单选事件:',row)
}
```

:::

## 复选框

-   通过设置 `checkbox-config` 来进行复选配置；通过配置`checkbox-change` 来触发选中事件,使用`checkbox-change`最好通过`row-config`设置`keyField`.
-   通过调 BaseTable 中的`setCheckboxRow`和`clearCheckboxRow`来设置和清空选中状态，调`setAllCheckboxRow`设置全选。**注意：通过上述方法设置可以将禁选的选中**

<el-button @click="baseTable.setCheckboxRow([tableData[2]])">设置第三个数据选中</el-button>
<el-button @click="baseTable.clearCheckboxRow()">清空选中状态</el-button>
<el-button @click="baseTable.setAllCheckboxRow()">全选</el-button>

<BaseTable
ref="baseTable"
:tableColumns="tableTypeColumns"
:tableData="tableData"
tableHeight="200"
:row-config="rowConfig"
:checkbox-config="checkboxConfig"
:selectAllChangeEvent="selectAllChangeEvent"
@checkbox-change="checkboxChangeEvent"
/>

::: details Click me to view the code

```js
<BaseTable
    ref="baseTable"
    :tableColumns="tableTypeColumns"
    :tableData="tableData"
    tableHeight="200"
    :row-config="rowConfig"
    :checkbox-config="checkboxConfig"
    :selectAllChangeEvent="selectAllChangeEvent"
    @checkbox-change="checkboxChangeEvent"
/>
// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 	开启复选框范围选择功能
	visibleMethod:({row}) => { // 返回显示的单选框
	  return row.age > 180
	},
	checkMethod: ({ row }) => {
		// 返回可选的单选框
		return row.age > 190
	},
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
// 全选事件
const selectAllChangeEvent= ({ checked }) => {
    console.log(checked ? '所有勾选事件' : '所有取消事件')
}
// 复选事件
const checkboxChangeEvent = (data) => {
    console.log('选中数据：', data)
}
```

:::

## 树形结构

-   通过设置 `tree-config` 来进行树形配置；
-   通过设置列中的`treeNode`来配置展开行

<BaseTable
ref="baseTable"
:tableColumns="tableTreeColumns"
:tableData="tableTreeData"
tableHeight="200"
:tree-config="treeConfig"
/>

::: details Click me to view the code

```js
<BaseTable
    ref="baseTable"
    :tableColumns="tableTreeColumns"
    :tableData="tableTreeData"
    tableHeight="200"
    :tree-config="treeConfig"
/>
// 树形表头，在需要展开的列上传treeNode。如果在checkbox列上展开，则可以多选节点
const tableTreeColumns = ref([
    { label: '序号', prop: '', type: 'checkbox', treeNode: true },
    { label: '标题', prop: 'label', treeNode: true }
])
// 树形数据
const tableTreeData = ref([
	{
		label: 'Level one 1',
		id: 1000,
		children: [
			{
				label: 'Level two 1-1',
				id: 10001000,
				children: [
					{
						label: 'Level three 1-1-1',
						id: 100010001000,
					},
				],
			},
		],
	},
	{
		label: 'Level one 2',
		id: 2000,
		children: [
			{
				label: 'Level two 2-1',
				id: 20002000,
				children: [
					{
						label: 'Level three 2-1-1',
						id: 200020002000,
					},
				],
			},
			{
				label: 'Level two 2-2',
				id: 20001,
				children: [
					{
						label: 'Level three 2-2-1',
						id: 200012001,
					},
				],
			},
		],
	},
])
// 树形配置 需要配置rowField；
const treeConfig = {
    rowField: 'id',
    line:true, // 树节点的连接线
    expandAll:true, // 默认展开所有节点
    expandRowKeys:null, // 默认展开哪个节点使用哪个row-config.keyField
    accordion:false, // 手风琴
}
```

:::

## 初始隐藏 table 显示问题

多传一个`syncResize`为`true`

## table 的 render 使用

<RenderTable />

::: details Click me to view the code

```js
<BaseTable ref="baseTable" :tableColumns="tableColumns" :tableData="tableData" tableHeight="300" />
const tableColumns = ref([
	{ label: '货类名称', prop: 'cargoTypeName' },
	{ label: '货种名称', prop: 'cargoCategoryName' },
	{ label: '排序', prop: 'sortNum', sortable: true, align: 'right', width: 100 },
	{
		prop: '',
		label: '操作',
		width: 'operate',
		fixed: 'right',
		align: 'center',
		render: row => {
			return [ // 返回的一定是一个数组
				h(
					ElButton, // 渲染的dom，可以是自己写的组件
					{ // 第二个参数是这个组件要传的属性，方法on+使用
						onClick: () => {
							console.log(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'test',
					},
					{ // 第三个参数为显示内容
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'test',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

```

:::
