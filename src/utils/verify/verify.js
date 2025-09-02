const filter = (type, value) => {
	switch (type) {
		case 'duty':
			//只能输入数字字母
			value = value.replace(/[^\w]/g, '')
			return value
			break
		case 'charemach*':
			value = value.replace(/[`～ ~!@$%^&()\+=<>?:"{}|,/;'\\[\]·~！@￥%……&（）\+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'charemach':
			// 过滤特殊字符泊位
			value = value.replace(/[`～ *~!@$%^&*()\+=<>?:"{}|,./;'\\[\]·~！@￥%……&*（）\+={}|《》？：“”【】、；‘'，。、]/g, '')

			return value
			break
		case 'chareBO':
			// 过滤特殊字符泊位
			value = value.replace(/[`～ *~!$%^&*()_\+=<>?:"{}|,./;'\\[\]·~！@￥%……&*（）——\+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'chareOperation':
			// 过滤特殊字符操作过程
			value = value.replace(/[`～ *~!$%^&*()_\-+=<>?:"{}|,.;'\\[\]·~！@￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'char':
			// 过滤特殊字符
			value = value.replace(/[`～ *~!@#$%^&*_\-+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*——\-+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'char1':
			// 过滤特殊字符
			value = value.replace(/[`～ *~!@#$^&*_\-+=<>?:"{}|,/;'\\[\]·~！@#￥……&*——\-+={}|《》？：“”【】；‘'，。]/g, '')
			return value
			break
		case 'charPoint':
			// 过滤特殊字符.
			value = value.replace(/[`～ *~!@#$%^&*_\-+=<>?:"{}|,/;'\\[\]·~！@#￥%……&*——\-+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'charSpace':
			// 过滤特殊字符-不包括空格
			value = value.replace(/[`～*~!@#$%^&*_\-+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*——\-+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'char#':
			// 过滤特殊字符
			value = value.replace(/[`～ *~!@#$%^&*()_\+=<>?:"{}|,./;'\\\·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'char_':
			// 过滤特殊字符
			value = value.replace(/[`～ *~!@#$%^&*()\+=<>?:"{}|,./;'\\\·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'spaceChar':
			// 过滤特殊字符 包括空格
			value = value.replace(/[`～ *~!@#$%^&*()_\-+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、 ]/g, '')
			return value
			break
		case 'chineseOnly':
			// 只能中文输入
			value.replace(/[^\u4E00-\u9FA5]/g, '')
			break
		case 'number':
			// 正负任意位数-整数
			value = value.replace(/[^0-9|-]/g, '')
			return value
			break
		case 'positiveNumber':
			// 只能正整数
			value = value.replace(/[^0-9]/g, '')
			return value
			break
		case 'decimal':
			// 正负任意位数-小数
			value =
				('' + value) // 第一步：转成字符串
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^[-|\d]\d*(?:\.\d{0,99})?/)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点
			return value
			break
		case 'positiveDecimal':
			// 正小数
			value =
				('' + value) // 第一步：转成字符串
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^\d*(?:\.\d{0,99})?/)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点
			return value
			break
		case 'numChinese':
			// 只能输入数字和中文
			value = value.replace(/[^0-9|^\u4E00-\u9FA5]/g, '')
			return value
			break
		case 'cardNum':
			// 只能输入数字和xX
			value = value.replace(/[^0-9|x|X]/g, '')
			return value
			break
		case 'latin':
			// 只能输入大小写字母下划线
			value = value.replace(/[^a-z|A-Z|0-9|\-|_|\.#]/g, '')
			return value
			break
		case 'latinSpace':
			// 只能输入大小写字母下划线空格
			value = value.replace(/[^a-z|A-Z|0-9|\-|_|\.#| ]/g, '')
			return value
			break
		case 'float2':
			value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
			return value
			break
		case 'double':
			//只能输入正负数（小数，整数）
			value = value.replace(/[^(\-?)\d+(\.\d+)?$]/g, '')
			return value
			break
		case 'digit':
			// 只能输入正数
			value = value.replace(/[^0-9|^\.]/g, '')
			var tmp = value.split('.')
			var first = tmp[0]
			tmp.shift()
			value = tmp.length > 0 ? first + '.' + tmp.join('') : first
			return value
			break
		case 'posInteger':
			// 只能输入正整数
			if (value.length == 1) {
				value = value.replace(/[^1-9]/g, '')
			} else {
				value = value.replace(/\D/g, '')
			}
			return value
			break
		case 'exactDecimal':
			// 精确到两位小数
			value = value.replace(/[^0-9|^\.]/g, '')
			var tmp = value.split('.')
			var first = tmp[0]
			tmp.shift()
			value = tmp.length > 0 ? first + '.' + tmp.join('').slice(0, 2) : first
			return value
			break
			case 'sixDecimal':
			// 精确到六位小数
			value = value.replace(/[^0-9|^\.]/g, '')
			var tmp = value.split('.')
			var first = tmp[0]
			tmp.shift()
			value = tmp.length > 0 ? first + '.' + tmp.join('').slice(0, 6) : first
			return value
			break
		case 'digitThree':
			// 只能输入正数
			value = value.replace(/[^0-9|^\.]/g, '')
			var tmp = value.split('.')
			var first = tmp[0]
			tmp.shift()
			value = tmp.length > 0 ? first + '.' + tmp.join('').slice(0, 3) : first
			return value
			break
		case 'doubleExactDecimal':
			// 只能输入正负两位小数
			value = value ? value.toString().match(/^[-|\d]\d*(?:\.\d{0,2})?/)[0] : ''
			return value
			break
		case 'onePoint':
			// 可以输入小数但是只能输入一位小数
			value =
				('' + value) // 第一步：转成字符串
					.replace(/[^\d^\.]+/g, '') // 第二步：把不是数字，不是小数点的过滤掉
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^\d*(\.?\d{0,1})/g)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
			return value
			break
		case 'twoPoint':
			value =
				('' + value) // 第一步：转成字符串
					.replace(/[^\d^\.]+/g, '') // 第二步：把不是数字，不是小数点的过滤掉
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^\d*(\.?\d{0,2})/g)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
			return value
			break
		case 'threePoint':
			value =
				('' + value) // 第一步：转成字符串
					.replace(/[^\d^\.]+/g, '') // 第二步：把不是数字，不是小数点的过滤掉
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^\d*(\.?\d{0,3})/g)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
			return value
			break
		case 'fourPoint':
			value =
				('' + value) // 第一步：转成字符串
					.replace(/[^\d^\.]+/g, '') // 第二步：把不是数字，不是小数点的过滤掉
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^\d*(\.?\d{0,4})/g)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
			return value
			break
		default:
			break
	}
}
export default filter
