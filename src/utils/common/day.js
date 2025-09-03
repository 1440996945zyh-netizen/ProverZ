/**
 * @Author: zhangsd
 * @Date: 2025-09-03 11:32:10
 * @LastEditTime: 2025-09-03 11:32:10
 * @LastEditors: zhangsd
 * @Description:  日期时间处理工具
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

// 格式化日期（支持本地化格式）
export const formatDayjs = (date, format = 'L LTS') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

// 计算相对时间（如：3分钟前）
export const fromNowDayjs = (date) => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

// 日期加减
export const addDayjs = (date, amount, unit) => {
  if (!date || !unit) return ''
  return dayjs(date).add(amount, unit).format('L LTS')
}

// 两个日期相差时间
export const diffDayjs = (date1, date2, unit) => {
  if (!date1 || !date2 || !unit) return 0
  return dayjs(date1).diff(dayjs(date2), unit)
}

// 获取指定日期所在周的第一天（周一）
export const getWeekStart = (date) => {
  return dayjs(date).startOf('week').add(1, 'd').format('YYYY-MM-DD')
}

// 获取指定日期所在周的最后一天（周日）
export const getWeekEnd = (date) => {
  return dayjs(date).endOf('week').add(1, 'd').format('YYYY-MM-DD')
}

// 时间戳格式化（兼容多种格式）
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) return null
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time
        .replace(/-/gm, '/')
        .replace('T', ' ')
        .replace(/\.[\d]{3}/gm, '')
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['日', '一', '二', '三', '四', '五', '六'][value]
    if (result.length > 0 && value < 10) value = '0' + value
    return value || 0
  })
  return time_str
}

// 相对时间格式化（刚刚/xx分钟前等）
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()
  const diff = (now - d) / 1000

  if (diff < 30) return '刚刚'
  else if (diff < 3600) return Math.ceil(diff / 60) + '分钟前'
  else if (diff < 3600 * 24) return Math.ceil(diff / 3600) + '小时前'
  else if (diff < 3600 * 24 * 2) return '1天前'
  
  if (option) return parseTime(time, option)
  else return `${d.getMonth() + 1}月${d.getDate()}日${d.getHours()}时${d.getMinutes()}分`
}

// 日期格式化（支持自定义格式）
export function parseDate(time, cFormat) {
  if (!time) return ''
  const format = cFormat || '{yyyy}-{mm}-{dd} {hh}:{ii}:{ss}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (parseInt(time) + ''.length === 10) {
      time = parseInt(time) * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) value = '0' + value
    return value || 0
  })
  return time_str
}

// 时间段计算时长
export const getDuration = (type, timeList) => {
  if (timeList.length !== 2) return
  const beginTime = new Date(timeList[0])
  const endTime = new Date(timeList[1])
  
  if (type === 'hour') {
    const hours = (endTime - beginTime) / (1000 * 60 * 60)
    return Math.round(hours * 10) / 10
  } else if (type === 'date') {
    const date = (endTime - beginTime) / (1000 * 60 * 60 * 24)
    return Math.round(date * 10) / 10
  } else if (type === 'min') {
    const min = (endTime - beginTime) / (1000 * 60)
    return Math.round(min * 10) / 10
  } else if (type === 'hourMin') {
    const timeDifference = endTime - beginTime
    const hoursWithDecimal = timeDifference / (1000 * 60 * 60)
    return hoursWithDecimal.toFixed(2)
  }
}

// 获取当前日期时间
export const getNowDate = dateType => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const min = now.getMinutes().toString().padStart(2, '0')
  const sec = now.getSeconds().toString().padStart(2, '0')

  switch (dateType) {
    case 'YYYY-MM-DD hh:mm:ss': return `${year}-${month}-${day} ${hour}:${min}:${sec}`
    case 'YYYY-MM-DD hh:mm': return `${year}-${month}-${day} ${hour}:${min}`
    case 'YYYY-MM-DD hh': return `${year}-${month}-${day} ${hour}`
    case 'YYYY-MM-DD': return `${year}-${month}-${day}`
    case 'YYYY-MM': return `${year}-${month}`
    case 'YYYY': return `${year}`
    default: return ''
  }
}

// 获取当前时间前后N天
export const getBeforeAfter = (dateType, num, type) => {
  let now
  if (dateType === 'before') {
    now = new Date(new Date().getTime() - num * 1000 * 60 * 60 * 24)
  } else if (dateType === 'after') {
    now = new Date(new Date().getTime() + num * 1000 * 60 * 60 * 24)
  } else {
    return ''
  }

  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const min = now.getMinutes().toString().padStart(2, '0')
  const sec = now.getSeconds().toString().padStart(2, '0')

  switch (type) {
    case 'YYYY-MM-DD hh:mm:ss': return `${year}-${month}-${day} ${hour}:${min}:${sec}`
    case 'YYYY-MM-DD hh:mm': return `${year}-${month}-${day} ${hour}:${min}`
    case 'YYYY-MM-DD hh': return `${year}-${month}-${day} ${hour}`
    case 'YYYY-MM-DD': return `${year}-${month}-${day}`
    case 'YYYY-MM': return `${year}-${month}`
    case 'YYYY': return `${year}`
    default: return ''
  }
}