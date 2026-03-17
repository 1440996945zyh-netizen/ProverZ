- 1. 1. # BaseTable 组件使用手册（完善版）

        ## 1. 组件概述

        **BaseTable** 是一个基于 `vxe-table` 封装的通用表格组件，集成了搜索头部、工具栏、分页、列拖拽、列宽记忆、高级查询等功能。适用于大多数后台管理系统的列表页，可快速搭建包含筛选、表格展示、分页的标准页面。通过 `v-model:pagination` 可双向绑定分页参数，支持自定义每页条数记忆。

        ## 2. 参数说明

        组件通过 props 接收配置，所有参数如下表所示（按功能分组）：

        ### 2.1 基础配置


        | 参数名                   | 类型           | 必传 | 默认值                               | 说明                                                                                           |
        | ------------------------ | -------------- | ---- | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
        | `name`                   | String         | 否   | -                                    | **表格唯一标识**，用于缓存列宽、列显隐等配置到 localStorage，若需记忆功能必须传入              |
        | `tableColumns`           | Array          | 是   | `[]`                                 | 表格列配置数组，每项对象详见[列配置](#列配置)                                                  |
        | `tableData`              | Array          | 是   | `[]`                                 | 表格数据源                                                                                     |
        | `total`                  | Number         | 否   | `0`                                  | 数据总条数，用于分页显示                                                                       |
        | `loading`                | Boolean        | 否   | `false`                              | 表格加载状态，`true` 时显示加载中动画                                                          |
        | `size`                   | String         | 否   | `null`                               | 表格尺寸，可选`medium` / `small` / `mini`，默认使用 vxe-table 默认值                           |
        | `stripe`                 | Boolean        | 否   | `false`                              | 是否显示斑马纹                                                                                 |
        | `border`                 | String/Boolean | 否   | `true`                               | 边框模式：`true`（完整边框）、`'outer'`（仅外边框）、`'inner'`（仅内边框）、`'none'`（无边框） |
        | `round`                  | Boolean        | 否   | `null`                               | 是否使用圆角边框                                                                               |
        | `autoResize`             | Boolean        | 否   | `false`                              | 是否自动监听父元素大小变化并重新计算表格布局                                                   |
        | `syncResize`             | Boolean/String | 否   | `false`                              | 是否在数据变化时自动刷新表格，可传入事件名（如`'sync'`）                                       |
        | `showHeader`             | Boolean        | 否   | `true`                               | 是否显示表头                                                                                   |
        | `showFooter`             | Boolean        | 否   | `false`                              | 是否显示表尾                                                                                   |
        | `footerMethod`           | Function       | 否   | `null`                               | 自定义表尾内容的方法，接收`{ columns, data }`，返回二维数组                                    |
        | `footerConfig`           | Object         | 否   | `null`                               | 快捷表尾配置，用于自动计算平均值/合计，详见[表尾配置](#表尾配置)                               |
        | `spanMethod`             | Function       | 否   | `null`                               | 合并单元格的方法，接收`{ row, column, rowIndex, columnIndex }`，返回合并信息                   |
        | `rowConfig`              | Object         | 否   | `{ isCurrent: true, isHover: true }` | 行配置，参考 vxe-table[row-config](https://vxetable.cn/#/table/row/row-config)                 |
        | `columnConfig`           | Object         | 否   | `{ resizable: true }`                | 列配置，常用`resizable`（是否可调整列宽）                                                      |
        | `treeConfig`             | Object         | 否   | `null`                               | 树形表格配置，参考 vxe-table[tree-config](https://vxetable.cn/#/table/tree/tree-config)        |
        | `editRules`              | Object         | 否   | `null`                               | 可编辑表格校验规则                                                                             |
        | `editConfig`             | Object         | 否   | `null`                               | 可编辑表格配置                                                                                 |
        | `exportConfig`           | Object         | 否   | `null`                               | 导出配置，参考 vxe-table[export-config](https://vxetable.cn/#/table/export/export-config)      |
        | `scrollY`                | Object         | 否   | `{ enabled: true, gt: 10 }`          | 纵向虚拟滚动配置                                                                               |
        | `height` / `tableHeight` | Number/String  | 否   | 动态计算                             | 表格高度，可传入数字或预定义字符串（见下方说明）                                               |
        | `maxHeight`              | Number/String  | 否   | `null`                               | 表格最大高度                                                                                   |
        | `minHeight`              | Number         | 否   | `150`                                | 表格最小高度（当高度计算值小于此值时使用）                                                     |

        **高度预定义字符串**（由 store 提供）：


        - `'normalTableHeight'`：普通表格高度
        - `'pageTableHeight'`：带分页表格高度
        - `'tabTableHeight'`：选项卡内表格高度
        - `'drawerNormalTableHeight'`：抽屉内普通表格
        - `'drawerPageTableHeight'`：抽屉内带分页表格
        - `'drawerHeaderPageTableHeight'`：抽屉内带表头带分页表格
        - `'tabTableHeightTwo'`、`'tabTableHeight1'`、`'tabTableSummary'` 等其他内部预定义值

        ### 2.2 搜索头部相关


        | 参数名                | 类型          | 必传 | 默认值  | 说明                                                                                          |
        | --------------------- | ------------- | ---- | ------- | --------------------------------------------------------------------------------------------- |
        | `showSearchHeader`    | Boolean       | 否   | `false` | 是否显示搜索头部（SearchHeader 组件）                                                         |
        | `selectData`          | Array         | 否   | `[]`    | 搜索表单项配置，传递给 SearchHeader 组件，格式见下方示例                                      |
        | `buttonList`          | Array         | 否   | -       | 搜索头部右侧操作按钮，如`[{ label: '新建', type: 'primary', icon: 'Plus', click: () => {} }]` |
        | `defaultWidth`        | Number/String | 否   | `25`    | 搜索框宽度比例（配合布局使用）                                                                |
        | `showNum`             | Number/String | 否   | `3`     | 搜索框默认显示个数，超出折叠                                                                  |
        | `isShowAdvancedQuery` | Boolean       | 否   | `false` | 是否显示高级查询按钮                                                                          |
        | `queryAdvancedParams` | Object        | 否   | `{}`    | 高级查询参数                                                                                  |
        | `searchClick`         | Function      | 否   | -       | **查询按钮点击回调**，接收搜索参数对象，通常在此触发数据请求                                  |

        ### 2.3 工具栏与分页


        | 参数名             | 类型    | 必传 | 默认值                                             | 说明                                                                                                                                                      |
        | ------------------ | ------- | ---- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
        | `showToolBar`      | Boolean | 否   | `false`                                            | 是否显示右侧工具栏（列显隐、自定义等）                                                                                                                    |
        | `showPagination`   | Boolean | 否   | `true`                                             | 是否显示分页组件                                                                                                                                          |
        | `pagination`       | Object  | 否   | `undefined`                                        | **受控分页参数**，支持 `v-model` 双向绑定，格式 `{ startPage: 1, pageSize: 20 }`。若传入，组件内部将完全受控，分页变化时会触发 `update:pagination` 事件。 |
        | `useStorePageSize` | Boolean | 否   | `true`                                             | 是否使用 Vuex 中 userStore 的`pageNum` 作为默认每页条数（仅在未传入 `pagination` 时生效）                                                                 |
        | `pageFieldMap`     | Object  | 否   | `{ startPage: 'startPage', pageSize: 'pageSize' }` | 分页参数与后端字段映射，用于请求时转换                                                                                                                    |

        ### 2.4 选择功能（单选/多选）


        | 参数名                 | 类型     | 必传 | 默认值     | 说明                                                                                   |
        | ---------------------- | -------- | ---- | ---------- | -------------------------------------------------------------------------------------- |
        | `radioConfig`          | Object   | 否   | `null`     | 单选配置，参考 vxe-table[radio-config](https://vxetable.cn/#/table/radio/radio-config) |
        | `radioChangeEvent`     | Function | 否   | `() => {}` | 单选行变化回调，接收`{ row }`                                                          |
        | `checkboxConfig`       | Object   | 否   | `null`     | 多选配置                                                                               |
        | `selectAllChangeEvent` | Function | 否   | `() => {}` | 全选/取消全选回调，接收`{ checked }`                                                   |
        | `isSelectTable`        | Boolean  | 否   | `false`    | 是否为下拉选择模式（此时表格列会渲染为`<el-option>`，用于自定义下拉框）                |
        | `selectLabel`          | String   | 否   | `'label'`  | 下拉选项显示字段名（配合`isSelectTable`）                                              |
        | `selectValue`          | String   | 否   | `'value'`  | 下拉选项值字段名（配合`isSelectTable`）                                                |

        ### 2.5 单元格事件回调

        以下 props 对应 vxe-table 的同名事件，用于监听表格交互：


        | 参数名                       | 类型     | 说明               |
        | ---------------------------- | -------- | ------------------ |
        | `headerCellClickEvent`       | Function | 表头单元格点击     |
        | `headerCellDblclickEvent`    | Function | 表头单元格双击     |
        | `headerCellContextMenuEvent` | Function | 表头单元格右键菜单 |
        | `cellClickEvent`             | Function | 单元格点击         |
        | `cellDBLClickEvent`          | Function | 单元格双击         |
        | `cellMouseenterEvent`        | Function | 单元格鼠标移入     |
        | `cellMouseleaveEvent`        | Function | 单元格鼠标移出     |
        | `cellContextMenuEvent`       | Function | 单元格右键菜单     |
        | `footerCellClickEvent`       | Function | 表尾单元格点击     |
        | `footerCellDblclickEvent`    | Function | 表尾单元格双击     |
        | `footerCellContextMenuEvent` | Function | 表尾单元格右键菜单 |
        | `scrollEvent`                | Function | 滚动事件           |

        ### 2.6 样式定制


        | 参数名                | 类型     | 说明                                                  |
        | --------------------- | -------- | ----------------------------------------------------- |
        | `headerCellClassName` | Function | 动态设置表头单元格类名，接收`{ column, columnIndex }` |
        | `rowClassName`        | Function | 动态设置行类名，接收`{ row, rowIndex }`               |
        | `cellClassName`       | Function | 动态设置单元格类名                                    |
        | `headerCellStyle`     | Function | 动态设置表头单元格样式                                |
        | `rowStyle`            | Function | 动态设置行样式                                        |
        | `cellStyle`           | Function | 动态设置单元格样式                                    |
        | `allAlign`            | String   | 统一设置列对齐方式，可选`left` / `center` / `right`   |

        ### 2.7 其他


        | 参数名        | 类型    | 必传 | 默认值  | 说明                                                     |
        | ------------- | ------- | ---- | ------- | -------------------------------------------------------- |
        | `id`          | String  | 否   | `null`  | 表格 DOM id                                              |
        | `htmlContent` | String  | 否   | `null`  | 分页左侧自定义 HTML 内容                                 |
        | `hasAdd`      | Boolean | 否   | `false` | 是否启用“快速添加行”功能（最后一列表头点击时添加空行） |

        ---

        ### 列配置（tableColumns 每项）


        | 属性名               | 类型          | 说明                                                                                       |
        | -------------------- | ------------- | ------------------------------------------------------------------------------------------ |
        | `prop`               | String        | **必填**，字段名，对应数据中的 key                                                         |
        | `label`              | String        | **必填**，表头显示文本                                                                     |
        | `type`               | String        | 列类型，如`'selection'`（多选）、`'radio'`（单选）、`'seq'`（序号），参考 vxe-table 列类型 |
        | `width`              | Number/String | 列宽度，可传入数字或预定义字符串（如`'time'`、`'operate'`，组件内部映射为具体数值）        |
        | `minWidth`           | Number        | 最小宽度                                                                                   |
        | `fixed`              | String        | 固定列，可选`left` / `right`                                                               |
        | `align`              | String        | 列对齐方式，覆盖`allAlign`                                                                 |
        | `sortable`           | Boolean       | 是否可排序（默认`true`，设为 `false` 可禁用）                                              |
        | `formatter`          | Function      | 格式化函数，接收`{ row, column, cellValue }`，返回显示内容                                 |
        | `filters`            | Array         | 筛选选项，参考 vxe-table 筛选                                                              |
        | `filterMethod`       | Function      | 自定义筛选方法                                                                             |
        | `editRender`         | Object        | 可编辑渲染配置，参考 vxe-table 编辑                                                        |
        | `treeNode`           | Boolean       | 是否为树形节点列                                                                           |
        | `isHidden`           | Boolean       | 是否初始隐藏该列                                                                           |
        | `showOverFlow`       | Boolean       | 是否显示溢出省略（默认`true`）                                                             |
        | `showHeaderOverflow` | Boolean       | 表头溢出省略（默认`true`）                                                                 |
        | `showFooterOverflow` | Boolean       | 表尾溢出省略（默认`true`）                                                                 |
        | `isThousandth`       | Boolean       | 是否使用千分位格式化（内部使用`<el-statistic>`）                                           |
        | `vHtml`              | Boolean       | 是否将单元格内容作为 HTML 渲染（需确保数据安全）                                           |
        | `render`             | Function      | 自定义渲染函数，返回 VNode，接收`{ row }` 参数                                             |
        | `headerSlot`         | String        | 自定义表头 HTML 内容                                                                       |

        ---

        ### 表尾配置（footerConfig）

        用于快速计算平均值或合计，格式示例：

        ```javascript
        footerConfig: {
          functions: ['合计', '平均值'], // 要计算的函数名称（可自定义）
          columns: [
            { prop: 'amount', formatter: (value) => `￥${value.toFixed(2)}` },
            { prop: 'count' }
          ]
        }
        ```
        组件内部预定义了 `平均值`、`合计` 两个函数，可扩展。

        ---

        ## 3. 事件说明

        组件通过 `defineEmits` 声明了以下事件：


        | 事件名              | 触发时机                        | 参数                      | 说明                                                    |
        | ------------------- | ------------------------------- | ------------------------- | ------------------------------------------------------- |
        | `checkbox-change`   | 复选框选中状态变化时            | `records` (Array)         | 当前选中的行数据数组                                    |
        | `rowSelect-change`  | （未实际使用，保留）            | -                         | -                                                       |
        | `update:pagination` | 分页变化时（页码/每页条数改变） | `{ startPage, pageSize }` | 用于同步父组件的分页状态，配合`v-model:pagination` 使用 |

        此外，所有单元格交互事件均可通过对应的 props 回调接收（如 `cellClickEvent`），这些回调不会触发 emit，而是直接调用父组件传入的函数。

        ---

        ## 4. 插槽说明

        组件**未定义具名插槽**，但提供了多种自定义单元格渲染方式，通过列配置实现：

        - **HTML 渲染**：设置 `vHtml: true`，单元格内容会作为 HTML 渲染（注意 XSS 风险）。
        - **千分位格式化**：设置 `isThousandth: true`，内部使用 `<el-statistic>` 显示，自动加千分位并保留两位小数。
        - **自定义渲染函数**：设置 `render` 函数，返回 VNode（可使用 `h` 函数或 JSX），接收 `{ row }` 参数。
        - **表头自定义 HTML**：设置 `headerSlot` 字符串，会插入到表头。

        示例：

        ```javascript
        {
          prop: 'custom',
          label: '操作',
          render: ({ row }) => h('el-button', { onClick: () => handle(row) }, '编辑')
        }
        ```
        ---

        ## 5. 样式定制方式

        ### 5.1 通过 className/style 函数

        - `headerCellClassName`、`rowClassName`、`cellClassName`：返回字符串类名。
        - `headerCellStyle`、`rowStyle`、`cellStyle`：返回样式对象。

        ### 5.2 全局覆盖 CSS

        组件内部样式使用 scoped，可通过 `:deep()` 穿透覆盖：

        ```css
        :deep(.vxe-table--body .custom-row) {
          background-color: #f5f7fa;
        }
        ```
        ### 5.3 列宽记忆

        组件会自动保存用户调整后的列宽到 localStorage，键名为 `{name}_columnWidths`，需传入 `name` 属性。

        ### 5.4 工具栏自定义

        工具栏按钮文本、图标可通过 CSS 调整，例如修改“保存”按钮文本已在组件内处理。

        ---

        ## 6. 依赖说明

        - **核心依赖**：
          - `vxe-table`：^4.x（表格核心）
          - `element-plus`：^2.x（用于 el-statistic、el-option）
          - `sortablejs`：^1.x（列拖拽功能）
          - `vue`：^3.2.x
        - **内部依赖**：
          - `SearchHeader`：搜索头部组件（需实现）
          - `RenderDom`：渲染函数组件（用于 `render` 属性）
          - `Pagination`：分页组件（基于 element-plus 二次封装）
          - Vuex stores：`appStore`、`tableParamsStore`、`userStore`（需提供）
        - **环境要求**：
          - 浏览器支持 ES6、localStorage
          - 需引入 vxe-table 样式及 element-plus 样式

        ---

        ## 7. 使用示例

        ### 7.1 基础使用（最简可运行代码）

        ```vue
        <template>
          <BaseTable
            name="userList"
            :tableColumns="columns"
            :tableData="tableData"
            :total="total"
            :loading="loading"
            :searchClick="handleSearch"
            showSearchHeader
            :selectData="searchFields"
            v-model:pagination="queryParams"
          />
        </template>

        <script setup>
        import { ref, reactive, onMounted } from 'vue'
        import BaseTable from '@/components/BaseTable'

        const columns = [
          { prop: 'name', label: '姓名', width: 120 },
          { prop: 'age', label: '年龄', width: 100 },
          { prop: 'address', label: '地址' }
        ]
        const tableData = ref([])
        const total = ref(0)
        const loading = ref(false)

        // 分页参数（双向绑定）
        const queryParams = reactive({
          startPage: 1,
          pageSize: 20
        })

        const searchFields = [
          { name: '姓名', type: 'input', modelValue: 'name', span: 6 },
          { name: '年龄', type: 'input', modelValue: 'age', span: 6 }
        ]

        const handleSearch = (params) => {
          // params 是搜索表单数据 + 分页参数
          console.log('搜索参数:', params)
          fetchData(params)
        }

        const fetchData = async (params) => {
          loading.value = true
          try {
            const res = await api.getList(params)
            tableData.value = res.data.list
            total.value = res.data.total
          } finally {
            loading.value = false
          }
        }

        onMounted(() => {
          fetchData(queryParams) // 初始化加载
        })
        </script>
        ```
        ### 7.2 完整示例（结合实际项目：常用审批语配置）

        该示例展示了：

        - `v-model:pagination` 双向绑定分页
        - `selectData` 配置搜索项（支持字典、静态选项）
        - `buttonList` 配置顶部按钮（带权限）
        - 列自定义渲染（状态标签、操作按钮、时间格式化）
        - 在 `onMounted` 中初始化字典和表格数据
        - 使用 `ref` 调用组件方法（如 `buildQueryParams` 构建请求参数）

        ```vue
        <template>
          <div class="app-container">
            <!-- ✅ 表格组件 -->
            <BaseTable
              ref="languageTableRef"

              <!-- 基础配置 -->
              :tableColumns="tableColumns"
              :tableData="tableData"
              :loading="tableLoading"
              name="processLanguageTable"  <!-- ✅ 唯一标识，用于缓存列配置 -->

              <!-- 搜索区域 -->
              :showSearchHeader="true"
              :selectData="selectData"
              :searchClick="getList"       <!-- ✅ 搜索/分页时自动调用 -->

              <!-- 分页控制（高级模式）-->
              v-model:pagination="queryParams"  <!-- ✅ 双向绑定分页参数 -->
              :total="total"
              :showPagination="true"

              <!-- 工具栏按钮 -->
              :buttonList="buttonList"

              <!-- 高度适配 -->
              :tableHeight="tableHeight"
            />

            <!-- 详情弹窗 -->
            <ProcessLanguageDetail 
              ref="detailDialogRef" 
              @success="handleDialogSuccess" 
              @close="handleDialogClose" 
            />
          </div>
        </template>

        <script setup>
        defineOptions({ name: 'BpmProcessLanguage' })

        // ========== 1. 导入依赖 ==========
        import BaseTable from '@/components/BaseTable/index.vue'
        import { ProcessLanguageApi } from '@/api/system/bpm/processLanguage'
        import tableParamsStore from '@/store/modules/tableParams'
        import { formatDate } from '@/utils/common/date'
        import ProcessLanguageDetail from './detail/index.vue'
        import publicApi from '@/api/public/index.js'
        import { reactive, ref, computed, onMounted } from 'vue'
        import { getCurrentInstance, nextTick, toRefs } from 'vue'
        import { CommonStatusEnumLabel } from '@/utils/bpm/constantEnumeration'
        import { h } from 'vue'
        import { ElTag, ElButton } from 'element-plus'

        // ========== 2. 基础配置 ==========
        const { proxy } = getCurrentInstance()
        const storeHeight = computed(() => tableParamsStore().normalTableHeight)

        // ========== 3. 响应式数据 ==========
        const data = reactive({
          // ✅ 分页参数（v-model 模式必须包含 startPage/pageSize）
          queryParams: {
            startPage: 1,
            pageSize: 30,
            // 搜索条件
            content: undefined,
            expressionType: undefined,
            status: undefined,
          },
          tableData: [],
          total: 0,
          tableLoading: false,
        })
        // 解构为 ref，方便模板使用
        const { queryParams, tableData, total, tableLoading } = toRefs(data)

        // 表格高度（适配不同场景）
        const tableHeight = computed(() => storeHeight.value - 15)

        // 组件 ref
        const detailDialogRef = ref(null)
        const languageTableRef = ref(null)

        // ========== 4. 搜索配置 ==========
        const selectData = reactive([
          {
            name: '快捷语内容',
            type: 'input',
            modelValue: 'content',  // ✅ 对应 queryParams.content
            span: 8,
            placeholder: '请输入快捷语内容',
          },
          {
            name: '类型',
            type: 'select',
            modelValue: 'expressionType',
            span: 8,
            placeholder: '请选择类型',
            // ✅ 动态字典加载配置
            dataConfig: { 
              params: { type: 'DICT', dictType: 'COMMON_PHRASES_TYPE' } 
            },
          },
          {
            name: '状态',
            type: 'select',
            modelValue: 'status',
            span: 8,
            placeholder: '请选择状态',
            // ✅ 静态选项
            selectData: [
              { label: '全部', value: '' },
              { label: '开启', value: '0' },
              { label: '禁用', value: '1' },
            ],
            selectLabel: 'label',
            selectValue: 'value',
          },
        ])

        // ========== 5. 按钮配置 ==========
        const buttonList = reactive([
          {
            label: '新增',
            type: 'primary',
            icon: 'Plus',
            click: () => openForm('create', undefined),
            permission: 'bpm:processLanguage:create',  // ✅ 权限控制
          },
        ])

        // ========== 6. 列配置 ==========
        const tableColumns = ref([
          // 序号列
          { prop: '', label: '编号', align: 'center', width: 80, type: 'seq' },

          // 普通文本列
          { prop: 'content', label: '快捷语内容', align: 'left', minWidth: 150 },
          { prop: 'expressionTypeName', label: '类型', align: 'center', width: 120 },

          // ✅ 自定义渲染：状态标签
          {
            prop: 'status',
            label: '状态',
            align: 'center',
            width: 100,
            render: row => {
              const statusItem = CommonStatusEnumLabel.find(item => item.value == row.status)
              return h(ElTag, { type: statusItem?.type || 'info' }, {
                default: () => statusItem?.label || '未知状态',
              })
            },
          },

          // ✅ 自定义渲染：日期格式化
          {
            prop: 'createTime',
            label: '创建时间',
            align: 'center',
            width: 180,
            render: row => [h('span', {}, formatDate(row.createTime))],
          },

          { prop: 'createByName', label: '创建人', align: 'center', width: 120 },

          // ✅ 操作列：多个按钮 + 权限控制
          {
            label: '操作',
            align: 'center',
            width: 240,
            fixed: 'right',  // ✅ 固定右侧
            render: row => {
              return [
                h(ElButton, {
                  onClick: () => openForm('update', row.id),
                  type: 'primary',
                  link: true,
                  icon: 'Edit',
                  style: 'margin-right: 8px',
                  permission: 'bpm:processLanguage:update',
                }, { default: () => '编辑' }),

                h(ElButton, {
                  onClick: () => handleDelete(row.id),
                  type: 'danger',
                  link: true,
                  icon: 'Delete',
                  permission: 'bpm:processLanguage:delete',
                }, { default: () => '删除' }),
              ]
            },
          },
        ])

        // ========== 7. 核心方法 ==========

        /**
         * 查询列表（搜索/分页时自动调用）
         * @param {Object} e - 搜索条件（不含分页参数）
         */
        const getList = async (e) => {
          // ✅ 方式1：直接使用 e + 组件内部的分页参数（推荐）
          // ✅ 方式2：使用 buildQueryParams 构建完整参数（需要额外参数时用）
          const extraParams = languageTableRef.value?.buildQueryParams()

          console.log('查询参数:', { search: e, pagination: extraParams })

          const params = {
            ...e,              // 搜索条件
            ...extraParams,    // 分页参数 + 高级查询
          }

          tableLoading.value = true
          try {
            const res = await ProcessLanguageApi.getList(params)
            tableData.value = res.data.pages || []
            total.value = res.data.totalNum
          } catch (error) {
            proxy.$modal.msgError('获取列表失败')
          } finally {
            tableLoading.value = false
          }
        }

        /**
         * 打开表单弹窗
         */
        const openForm = (type, id) => {
          if (!detailDialogRef.value) {
            proxy?.$modal?.msgError?.('表单组件未加载，请刷新页面')
            return
          }
          nextTick(() => {
            detailDialogRef.value.open({
              type,  // 'create' | 'update'
              id: type === 'update' ? id : undefined,
            })
          })
        }

        /**
         * 删除操作
         */
        const handleDelete = async (id) => {
          try {
            await proxy.$modal.confirm('确定要删除该常用审批语吗？')
            await ProcessLanguageApi.deleteProcessLanguage(id)
            proxy.$modal.msgSuccess('删除成功')
            getList()  // ✅ 删除后刷新列表
          } catch (error) {
            if (error !== 'cancel') {
              proxy.$modal.msgError('删除失败')
            }
          }
        }

        /**
         * 表单提交成功回调
         */
        const handleDialogSuccess = (payload) => {
          proxy?.$modal?.msgSuccess?.(payload.action === 'add' ? '新增成功' : '修改成功')

          // ✅ 重置到第 1 页（避免新增后停留在末页）
          queryParams.value.startPage = 1
          getList()
        }

        /**
         * 初始化字典等基础数据
         */
        const initBaseInfo = () => {
          publicApi.getLocalSelect({ 
            type: 'DICT', 
            dictType: 'COMMON_PHRASES_TYPE' 
          }).then(res => {
            // 如需在搜索中使用，可赋值给 selectData 的 selectData 字段
          })
        }

        // ========== 8. 生命周期 ==========
        onMounted(() => {
          initBaseInfo()  // 1. 先加载字典
          getList()       // 2. ✅ 再加载表格数据（关键！）
        })
        </script>

        <style lang="scss" scoped>
        .app-container {
          margin: 0 auto;
          height: 100% !important;
          box-sizing: border-box;
          padding: 16px;
        }
        </style>
        ```
        ### 7.3 常见场景示例

        #### 7.3.1 自定义每页条数记忆

        - 通过 `v-model:pagination` 绑定父组件的响应式对象，组件内部分页变化时会自动更新该对象。
        - 如果需要将用户选择的每页条数保存到后端或 Vuex，可监听 `update:pagination` 事件并调用相应接口。

        #### 7.3.2 使用 `buildQueryParams` 构建请求参数

        在 `searchClick` 回调中，可以通过 `ref` 调用 `buildQueryParams()` 获取当前分页参数，与搜索参数合并后发送请求。示例中已展示。

        #### 7.3.3 重置搜索并刷新

        调用组件暴露的 `resetSearch()` 方法可重置搜索条件并触发查询：

        ```javascript
        languageTableRef.value?.resetSearch()
        ```
        #### 7.3.4 手动触发查询

        ```javascript
        languageTableRef.value?.query() // 使用当前条件查询
        ```
        ---

        ## 8. 注意事项

        ### 8.1 常见坑点

        1. **name 属性必须唯一**：用于 localStorage 存储列宽和列显隐，若多个表格使用相同 name 会导致配置覆盖。
        2. **分页参数优先级**：
           - 若传入 `pagination`（含 `v-model`），组件完全受控，分页变化触发 `update:pagination`，父组件需更新传入的对象。
           - 若未传入 `pagination`，则内部维护分页状态，可通过 `useStorePageSize` 决定默认每页条数。
        3. **必须使用 `buildQueryParams` 构建请求参数**：在 `searchClick` 回调中，不能直接使用传入的 `e` 作为请求参数，因为它**不包含分页信息**。应通过 `ref` 调用 `buildQueryParams()` 获取完整分页参数，再与搜索参数合并。
        4. **onMounted 中必须初始化数据**：因为组件内部不会自动触发首次查询，父组件需在 `onMounted` 中调用查询方法（如 `getList(queryParams)`）。
        5. **搜索条件重置**：调用 `resetSearch()` 后，搜索头部表单会清空，但分页会重置为第一页，并触发查询。
        6. **列自定义渲染函数**：`render` 必须返回 VNode，且注意不要使用已被废弃的语法。组件内部使用 `RenderDom` 组件包裹，可保证响应式。
        7. **权限控制**：按钮和操作列的权限标识（如 `permission` 属性）需配合自定义指令或权限函数使用，组件本身不处理权限，但推荐在模板中添加 `v-permission` 或在渲染函数中判断。

        ### 8.2 兼容性说明

        - **Vue 版本**：需 Vue 3.2+（使用 `<script setup>`）
        - **vxe-table 版本**：推荐 4.x（与当前代码兼容）
        - **浏览器**：支持 ES6、localStorage，不支持 IE
        - **移动端**：未适配，建议在桌面端使用

        ### 8.3 依赖缺失提示

        若未安装 `element-plus` 或 `vxe-table`，组件会报错，请确保已安装并引入相应样式：

        ```javascript
        import 'element-plus/dist/index.css'
        import 'vxe-table/lib/style.css'
        import VXETable from 'vxe-table'
        app.use(VXETable)
        ```
        ---

        ## 附录：暴露的方法

        通过 ref 可调用以下方法：


        | 方法名                              | 参数             | 说明                                       |
        | ----------------------------------- | ---------------- | ------------------------------------------ |
        | `exportDataEvent()`                 | -                | 导出表格数据（CSV）                        |
        | `importDataEvent()`                 | -                | 导入数据（需 vxe-table 插件）              |
        | `setRadioRow(row)`                  | `row`            | 设置单选选中行                             |
        | `clearRadioRow()`                   | -                | 清空单选选中                               |
        | `setCheckboxRow(arr)`               | `arr`            | 设置多选选中行（传入数据数组）             |
        | `setAllCheckboxRow()`               | -                | 全选                                       |
        | `clearCheckboxRow()`                | -                | 清空多选                                   |
        | `getSelectEvent()`                  | -                | 获取多选选中行数据                         |
        | `getRadioRecord()`                  | -                | 获取单选选中行数据                         |
        | `removeCheckboxRow()`               | -                | 删除选中行（仅从表格数据移除，不触发请求） |
        | `colDrop()`                         | -                | 手动启用列拖拽（一般自动调用）             |
        | **`resetSearch()`**                 | -                | **重置搜索条件并刷新**                     |
        | `hideColEvent(field)`               | `field`          | 隐藏指定列                                 |
        | `showColEvent(field)`               | `field`          | 显示指定列                                 |
        | `resetColEvent()`                   | -                | 重置列显隐为初始状态                       |
        | `clearCurrentColumn()`              | -                | 清空当前高亮行                             |
        | `toggleTreeEvent()`                 | -                | 展开/收缩所有树节点                        |
        | `clearTreeExpand()`                 | -                | 收起所有树节点                             |
        | `getSavedColumnWidths()`            | -                | 获取本地保存的列宽对象                     |
        | `resetColumnWidths()`               | -                | 重置列宽为默认值                           |
        | `initColumnWidth(force)`            | `force`          | 从本地恢复列宽                             |
        | **`query()`**                       | -                | **触发查询（使用当前条件）**               |
        | **`refresh()`**                     | -                | **刷新（同 query）**                       |
        | **`getPagination()`**               | -                | **获取当前分页参数**                       |
        | **`setPagination(page, pageSize)`** | `page, pageSize` | **设置分页并查询**                         |
        | **`buildQueryParams(override)`**    | `override`       | **构建请求参数对象（包含分页和搜索条件）** |

        **特别说明**：

        - `buildQueryParams()` 返回的对象包含当前分页和搜索条件，可直接用于接口请求。
        - `query()` 和 `refresh()` 本质相同，都会触发 `searchClick` 回调（使用当前搜索条件）。

        ---
