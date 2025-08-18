# 命名规范

对该项目常用的命名进行规范，在使用时严格按照该命名规范进行对变量、方法的命名。

## 综合

-   ref 命名：组件名+Ref

## Table 部分

-   数据：tableData
-   表头：tableColumns
-   其他传参与接参名一致，例：rowConfig 的变量名就是 rowConfig
-   传参获取主列表的参数数组：queryParams：`{ page:1,pageSize:10 }`
-   数据总数：total
-   获取主列表数据方法：getList()
-   新增方法：add()
-   编辑方法：edit()
-   删除方法：delete()
-   当前状态是新增还是编辑：status:'add/edit/delete...'
-   根据状态显示不同内容: statusMap:`{add:'新增',edit:'编辑'}`
-   新增时清空调用方法：reset()
-   获取点击行数据方法：:cellClickEvent="cellClickEvent" ==> ({row}) => {}
-   所点击行数据：clickRow
-   获取复选框所选中行数据方法：@checkbox-change="checkboxChangeEvent" ==> (row) => {}
-   复选数据：checkRow
-   获取单选框所选中行数据方法：:radioChangeEvent="radioChangeEvent" ==> ({row}) => {}

## 抽屉

-   打开关闭：xxxVisible
-   title: 新建/编辑
-   size: 默认？%
-   保存方法：save()
-   抽屉下方按钮，取消，保存
-   主子抽屉传值时，子抽屉的按钮统一叫做`确认`
-   仅查看按钮为`关闭`

## form

-   form 数据：formData
-   form 的 ref：ruleForm
-   校验规则：rules
-   placeholder:普通情况 - 请输入 xxx ; 数字类型 - 请输入数字，搭配`@input="formData.字段 = proxy.verify('xxx', formData.字段)"` 仅输入数字
-   是否二选一，使用 radio
