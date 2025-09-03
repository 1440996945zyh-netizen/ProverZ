/**
 * @Author: zhangsd
 * @Date: 2025-09-03 11:33:23
 * @LastEditTime: 2025-09-03 11:33:23
 * @LastEditors: zhangsd
 * @Description: 数据字典处理工具
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\common\dict.js
 */

import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/master/dict/data'

/**
 * 获取字典数据
 * @param {*} dictType 字典类型
 */
export function useDict(...args) {
  const res = ref({});
  return (() => {
    args.forEach((dictType, index) => {
      res.value[dictType] = [];
      const dicts = useDictStore().getDict(dictType);
      if (dicts) {
        res.value[dictType] = dicts;
      } else {
        getDicts(dictType).then(resp => {
          res.value[dictType] = resp.data.map(p => ({ label: p.dictLabel, value: p.dictValue, elTagType: p.listClass, elTagClass: p.cssClass }))
          useDictStore().setDict(dictType, res.value[dictType]);
        })
      }
    })
    return toRefs(res.value);
  })()
}

// 回显数据字典
export function selectDictLabel(datas, value) {
	if (value === undefined) {
		return ''
	}
	var actions = []
	Object.keys(datas).some(key => {
		if (datas[key].value == '' + value) {
			actions.push(datas[key].label)
			return true
		}
	})
	if (actions.length === 0) {
		actions.push(value)
	}
	return actions.join('')
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas, value, separator) {
	if (value === undefined || value.length === 0) {
		return ''
	}
	if (Array.isArray(value)) {
		value = value.join(',')
	}
	var actions = []
	var currentSeparator = undefined === separator ? ',' : separator
	var temp = value.split(currentSeparator)
	Object.keys(value.split(currentSeparator)).some(val => {
		var match = false
		Object.keys(datas).some(key => {
			if (datas[key].value == '' + temp[val]) {
				actions.push(datas[key].label + currentSeparator)
				match = true
			}
		})
		if (!match) {
			actions.push(temp[val] + currentSeparator)
		}
	})
	return actions.join('').substring(0, actions.join('').length - 1)
}