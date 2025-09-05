export default {
  template: {
    panels: [
      {
        index: 0,
        name: "个人信息与数据表格模板",
        paperType: "A4",
        width: 210,
        height: 270,
        paperHeader: 20,
        paperFooter: 250,
        paperNumberContinue: true,
        watermarkOptions: {},
        panelLayoutOptions: {},
        printElements: [
          // 1. 顶部标题
          {
            options: {
              left: 15,
              top: 20,
              width: 180,
              height: 15,
              title: "个人信息与销售数据报表",
              fontSize: 16,
              fontWeight: "bold",
              color: "#2563eb",
              align: "center",
              border: false
            },
            printElementType: { title: "文本", type: "text", editable: true }
          },

          // 2. 姓名文本
          {
            options: {
              left: 15,
              top: 45,
              width: 108,
              height: 12,
              field: "name",
              title: "姓名：",
              fontSize: 14,
              color: "#333",
              align: "left",
              labelWidth: 40
            },
            printElementType: { title: "文本", type: "text", editable: true }
          },

          // 3. 密码文本
          {
            options: {
              left: 15,
              top: 62,
              width: 108,
              height: 12,
              field: "password",
              title: "密码：",
              fontSize: 14,
              color: "#333",
              align: "left",
              labelWidth: 40
            },
            printElementType: { title: "文本", type: "text", editable: true }
          },

          // 4. Logo图片
          {
            options: {
              left: 133,
              top: 45,
              width: 62,
              height: 62,
              field: "logoTest",
              keepAspectRatio: true,
              border: true,
              borderColor: "#e5e7eb",
              borderRadius: 4
            },
            printElementType: { title: "图片", type: "image", editable: true }
          },

          // 5. 长文本
          {
            options: {
              left: 15,
              top: 85,
              width: 180,
              height: 100,
              field: "longText",
              title: "长文本内容：《脏话风波》",
              fontSize: 12,
              color: "#444",
              lineHeight: 1.6,
              align: "left",
              border: true,
              borderColor: "#e5e7eb",
              padding: 8
            },
            printElementType: { title: "长文", type: "longText", editable: true }
          },

          // 6. 条形码
          {
            options: {
              left: 133,
              top: 120,
              width: 62,
              height: 30,
              field: "barcode",
              codeType: "code128",
              showText: true,
              textFontSize: 12,
              border: false
            },
            printElementType: { title: "条形码", type: "barcode", editable: true }
          },

          // 7. 二维码
          {
            options: {
              left: 133,
              top: 155,
              width: 62,
              height: 62,
              field: "qrcode",
              codeType: "qrcode",
              errorCorrectionLevel: "H",
              border: false
            },
            printElementType: { title: "二维码", type: "qrcode", editable: true }
          },

          // 8. 数据表格（核心修复：groupFooterFormatter改为单行）
          {
            options: {
              left: 15,
              top: 195,
              width: 180,
              height: 55,
              field: "table",
              qid: "dataTable",
              columns: [
                [
                  {
                    width: 25,
                    title: "序号",
                    field: "id",
                    checked: true,
                    align: "center",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "bold"
                  },
                  {
                    width: 50,
                    title: "姓名",
                    field: "name",
                    checked: true,
                    align: "center",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "bold"
                  },
                  {
                    width: 30,
                    title: "性别",
                    field: "gender",
                    checked: true,
                    align: "center",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "bold"
                  },
                  {
                    width: 35,
                    title: "销售数量",
                    field: "count",
                    checked: true,
                    align: "center",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "bold"
                  },
                  {
                    width: 40,
                    title: "销售金额",
                    field: "amount",
                    checked: true,
                    align: "center",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "bold"
                  }
                ]
              ],
              // 关键修复：函数字符串改为单行，移除换行和缩进
              groupFooterFormatter: "function(tableData) { const totalCount = tableData.reduce((sum, item) => sum + Number(item.count), 0); return `总行数：${tableData.length} 行 | 销售总量：${totalCount} 件`; }",
              tableBorder: true,
              headerBackgroundColor: "#f3f4f6",
              rowAlternateColor: true,
              alternateColor: "#f9fafb",
              rowHeight: 7,
              footerHeight: 10,
              footerBackgroundColor: "#eff6ff"
            },
            printElementType: {
              title: "表格",
              type: "table",
              editable: true,
              columnDisplayEditable: true,
              isEnableInsertRow: true,
              isEnableDeleteRow: true
            }
          }
        ]
      }
    ],
    // 页码配置
    paperNumberLeft: 105,
    paperNumberTop: 255,
    paperNumberFormat: "第 {page} 页 / 共 {total} 页",
    paperNumberFontSize: 12,
    paperNumberColor: "#666",
    paperNumberAlign: "center"
  }
};