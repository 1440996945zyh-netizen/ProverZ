/**
 * @Author: zhangsd
 * @Date: 2025-09-03 11:34:05
 * @LastEditTime: 2025-09-03 11:34:05
 * @LastEditors: zhangsd
 * @Description: 动态修改标题
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\common\dynamicTitle.js
 */
import store from '@/store'
import defaultSettings from '@/settings'
import useSettingsStore from '@/store/modules/settings'

/**
 * 动态修改标题
 */
export function useDynamicTitle() {
  const settingsStore = useSettingsStore();
  if (settingsStore.dynamicTitle) {
    document.title = settingsStore.title + ' - ' + defaultSettings.title;
  } else {
    document.title = defaultSettings.title;
  }
}