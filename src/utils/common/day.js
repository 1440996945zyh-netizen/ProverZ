/**
 * @Author: zhangsd
 * @Date: 2025-09-03 11:32:10
 * @LastEditTime: 2025-09-03 11:32:10
 * @LastEditors: zhangsd
 * @Description: 日期时间处理工具
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\common\day.js
 */
/**
 * 日期时间处理工具
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/zh-cn'

// 扩展插件
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
// 设置默认语言
dayjs.locale('zh-cn')

/**
 * 格式化日期（支持本地化格式）
 * @param {Date|string|number} date - 日期值
 * @param {string} [format='L LTS'] - 格式化字符串
 * @returns {string} 格式化后的日期字符串
 * 
 * 支持的格式：
 * - 'YYYY-MM-DD HH:mm:ss' - 完整日期时间
 * - 'YYYY-MM-DD' - 日期
 * - 'HH:mm:ss' - 时间
 * - 'YYYY年MM月DD日' - 中文日期
 * - 'L LTS' - 本地化格式（默认）
 * - 其他dayjs支持的格式
 */
export const formatDate = (date, format = 'L LTS') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 计算相对时间（如：3分钟前）
 * @param {Date|string|number} date - 日期值
 * @returns {string} 相对时间描述
 * 
 * 例如：
 * - "刚刚"（30秒内）
 * - "5分钟前"（30秒到1小时内）
 * - "2小时前"（1小时到24小时内）
 * - "1天前"（24-48小时内）
 * - 其他使用dayjs的fromNow()方法
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * 日期加减
 * @param {Date|string|number} date - 基准日期
 * @param {number} amount - 加减的数量
 * @param {string} unit - 时间单位（year, month, day, hour, minute, second）
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - 格式化字符串
 * @returns {string} 加减后的日期字符串
 * 
 * 示例：
 * addDate(new Date(), 1, 'day') // 返回明天的日期
 * addDate(new Date(), -2, 'month', 'YYYY-MM-DD') // 返回2个月前的日期
 */
export const addDate = (date, amount, unit, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date || !unit) return ''
  return dayjs(date).add(amount, unit).format(format)
}

/**
 * 两个日期相差时间
 * @param {Date|string|number} date1 - 第一个日期
 * @param {Date|string|number} date2 - 第二个日期
 * @param {string} unit - 时间单位（year, month, day, hour, minute, second）
 * @returns {number} 两个日期的差值
 */
export const dateDiff = (date1, date2, unit) => {
  if (!date1 || !date2 || !unit) return 0
  return dayjs(date1).diff(dayjs(date2), unit)
}

/**
 * 获取指定日期所在周的第一天（周一）
 * @param {Date|string|number} date - 日期值
 * @returns {string} 周一的日期字符串（YYYY-MM-DD格式）
 */
export const getWeekStart = (date) => {
  return dayjs(date).startOf('week').add(1, 'd').format('YYYY-MM-DD')
}

/**
 * 获取指定日期所在周的最后一天（周日）
 * @param {Date|string|number} date - 日期值
 * @returns {string} 周日的日期字符串（YYYY-MM-DD格式）
 */
export const getWeekEnd = (date) => {
  return dayjs(date).endOf('week').add(1, 'd').format('YYYY-MM-DD')
}

/**
 * 获取当前时间前后N天的日期
 * @param {string} direction - 方向（before: 前，after: 后）
 * @param {number} num - 天数
 * @param {string} [format='YYYY-MM-DD'] - 格式化字符串
 * @returns {string} 格式化后的日期字符串
 * 
 * 示例：
 * getDaysBeforeAfter('before', 7) // 返回7天前的日期
 * getDaysBeforeAfter('after', 3, 'YYYY-MM-DD HH:mm:ss') // 返回3天后的日期
 */
export const getDaysBeforeAfter = (direction, num, format = 'YYYY-MM-DD') => {
  let now = dayjs()
  if (direction === 'before') {
    now = now.subtract(num, 'day')
  } else if (direction === 'after') {
    now = now.add(num, 'day')
  } else {
    return ''
  }
  return now.format(format)
}

/**
 * 获取当前日期时间
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - 格式化字符串
 * @returns {string} 格式化后的当前日期
 * 
 * 示例：
 * getCurrentDate() // 返回当前日期时间
 * getCurrentDate('YYYY-MM-DD') // 返回当前日期
 */
export const getCurrentDate = (format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs().format(format)
}

/**
 * 获取时间戳
 * @param {string} type - 类型（start: 90天前，其他: 当前时间）
 * @returns {number} 时间戳（毫秒）
 * 
 * 示例：
 * getTime() // 返回当前时间戳
 * getTime('start') // 返回90天前的时间戳
 */
export const getTime = (type) => {
  if (type === 'start') {
    return dayjs().subtract(90, 'day').valueOf()
  } else {
    return dayjs().valueOf()
  }
}

/**
 * 时间段计算时长
 * @param {string} type - 计算类型（hour, date, min, hourMin）
 * @param {Array} timeList - 两个时间点组成的数组 [startTime, endTime]
 * @returns {number} 时长
 * 
 * 示例：
 * getDuration('hour', [startTime, endTime]) // 返回小时数（保留一位小数）
 * getDuration('hourMin', [startTime, endTime]) // 返回小时数（保留两位小数）
 */
export const getDuration = (type, timeList) => {
  if (timeList.length !== 2) return
  const beginTime = dayjs(timeList[0])
  const endTime = dayjs(timeList[1])

  const duration = endTime.diff(beginTime, 'millisecond')
  
  switch (type) {
    case 'hour':
      return (duration / (1000 * 60 * 60)).toFixed(1)
    case 'date':
      return (duration / (1000 * 60 * 60 * 24)).toFixed(1)
    case 'min':
      return (duration / (1000 * 60)).toFixed(1)
    case 'hourMin':
      return (duration / (1000 * 60 * 60)).toFixed(2)
    default:
      return duration
  }
}

/**
 * 添加日期范围参数
 * @param {Object} params - 请求参数对象
 * @param {Array} dateRange - 日期范围数组 [startDate, endDate]
 * @param {string} [propName] - 属性名前缀
 * @returns {Object} 添加了日期参数后的对象
 * 
 * 示例：
 * addDateRange({ page: 1 }, [startDate, endDate]) 
 * // 返回 { page: 1, beginTime: startDate, endTime: endDate }
 * 
 * addDateRange({ page: 1 }, [startDate, endDate], 'create')
 * // 返回 { page: 1, beginCreateTime: startDate, endCreateTime: endDate }
 */
export const addDateRange = (params, dateRange, propName) => {
  let search = { ...params }
  dateRange = Array.isArray(dateRange) ? dateRange : []
  
  if (typeof propName === 'undefined') {
    search['beginTime'] = dateRange[0]
    search['endTime'] = dateRange[1]
  } else {
    search[`begin${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = dateRange[0]
    search[`end${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = dateRange[1]
  }
  return search
}