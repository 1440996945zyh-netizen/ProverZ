/**
 * 针对 https://github.com/xaboy/form-create-designer 封装的工具类
 * 适配 Vue3 + JavaScript 环境
 */
import { isRef } from 'vue'
import formCreate from '@form-create/element-ui'

/** 编码表单 Conf */
export const encodeConf = (designerRef) => {
  // 关联案例：https://gitee.com/yudaocode/yudao-ui-admin-vue3/pulls/834/
  return formCreate.toJson(designerRef.value.getOption())
}

/** 解码表单 Conf */
export const decodeConf = (conf) => {
  return formCreate.parseJson(conf)
}

/** 编码表单 Fields */
export const encodeFields = (designerRef) => {
  const rule = designerRef.value.getRule()
  const fields = []
  rule.forEach((item) => {
    fields.push(formCreate.toJson(item))
  })
  return fields
}

/** 解码表单 Fields */
export const decodeFields = (fields) => {
  const rule = []
  fields.forEach((item) => {
    rule.push(formCreate.parseJson(item))
  })
  return rule
}

/** 设置表单的 Conf 和 Fields，适用 FcDesigner 场景 */
export const setConfAndFields = (designerRef, conf, fields) => {
  designerRef.value.setOption(decodeConf(conf))
  designerRef.value.setRule(decodeFields(fields))
}

/** 设置表单的 Conf 和 Fields，适用 form-create 场景 */
export const setConfAndFields2 = (detailPreview, conf, fields, value) => {
  if (isRef(detailPreview)) {
    detailPreview = detailPreview.value
  }

  detailPreview.option = decodeConf(conf)
  detailPreview.rule = decodeFields(fields)

  if (value) {
    detailPreview.value = value
  }
}