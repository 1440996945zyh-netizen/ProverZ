let icons = [];

// 终极版处理函数：带日志输出，确保每一步处理生效
function processSvgFill(svgContent, iconName) {
  if (!svgContent) return svgContent;
  
  // console.log(`===== 处理图标 ${iconName} 开始 =====`);
  let processed = svgContent;
  
  // 1. 替换fill为currentColor（带日志验证）
  const fillRegex = /fill=(["']?)([^"'\s]+)\1/g;
  const fillMatches = svgContent.match(fillRegex);
  if (fillMatches) {
    // console.log(`发现${fillMatches.length}处fill属性:`, fillMatches);
    processed = processed.replace(fillRegex, 'fill="$1currentColor$1"');
    // console.log('fill替换后:', processed.match(fillRegex) || '已全部替换为currentColor');
  } else {
    // console.log('未发现fill属性，无需替换');
  }
  
  // 2. 清除darkreader的style属性
  const darkreaderStyleRegex = /\s*style="[^"]*--darkreader-inline-fill:[^"]*"/g;
  const styleMatches = svgContent.match(darkreaderStyleRegex);
  if (styleMatches) {
    // console.log(`发现${styleMatches.length}处darkreader style:`, styleMatches);
    processed = processed.replace(darkreaderStyleRegex, '');
    // console.log('style清理后:', processed.match(darkreaderStyleRegex) || '已清除');
  }
  
  // 3. 清除data-darkreader-inline-fill属性
  const darkreaderAttrRegex = /\s*data-darkreader-inline-fill="[^"]*"/g;
  const attrMatches = svgContent.match(darkreaderAttrRegex);
  if (attrMatches) {
    // console.log(`发现${attrMatches.length}处darkreader属性:`, attrMatches);
    processed = processed.replace(darkreaderAttrRegex, '');
    // console.log('属性清理后:', processed.match(darkreaderAttrRegex) || '已清除');
  }
  
  // 4. 清除darkreader的CSS变量
  const fillCssVarRegex = /\s*--darkreader-background-[a-f0-9]+:[^;]+;/g;
  const varMatches = svgContent.match(fillCssVarRegex);
  if (varMatches) {
    // console.log(`发现${varMatches.length}处darkreader CSS变量:`, varMatches);
    processed = processed.replace(fillCssVarRegex, '');
    // console.log('CSS变量清理后:', processed.match(fillCssVarRegex) || '已清除');
  }
  
  return processed;
}

// 导入第一个目录的SVG文件（原有的图标目录）
const modules1 = import.meta.glob('./../../assets/icons/svg/*.svg');
for (const path in modules1) {
  const iconName = path.split('assets/icons/svg/')[1].split('.svg')[0];
  icons.push(iconName);
}

// 导入第二个目录（同上）
const modules2 = import.meta.glob('./../../assets/icons/systemSvg/*.svg', {
  query: { raw: true },
  eager: true
});
for (const path in modules2) {
  const iconName = path.split('assets/icons/systemSvg/')[1].split('.svg')[0];
  if (!/-/.test(iconName)) {
    const rawSvg = modules2[path].default;
    const processedSvg = processSvgFill(rawSvg, iconName);
    const svgId = `icon-systemSvg-${iconName}`;
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.innerHTML = processedSvg;
    svgElement.setAttribute('id', svgId);
    svgElement.style.display = 'none';
    document.body.appendChild(svgElement);
    icons.push(iconName);
  }
}

export default icons;
    