import * as echarts from 'echarts'
const comEcharts = {
   option(newData) {
     const option = {
       // backgroundColor: '#05132d',
       color: ['#D9001B', '#F59A23', '#FFFF00', '#02A7F0', '#AAAAAA','#e70a0a'],
       tooltip: {
         trigger: 'item',
         show: true,
         backgroundColor: '#010d25',
         formatter: (params) => {
           const { data, name, value } = params;
           return `
                        <div style="color: ${params.color}; font-size: 10px;">${name}&nbsp;&nbsp;&nbsp;<span style="font-size:10px; color: #FFF; float: right;">${value}量</span></div>
                        <div style="color: #B8DDFF; font-size: 10px;">占比&nbsp;<span style="font-size: 10px; color: #FFF; float: right;">${data.percentage}%</span></div>
                    `;
         },
       },
       title: {
       },
       grid: {
         containLabel: true,
       },
       legend: {
         top: 'center',
         orient: 'vertical',
         right: '8%',
         itemWidth: 16,
         itemHeight: 16,
         icon: 'circle',
         itemGap: 9,
         textStyle: {
           color: '#4E5969',
           fontSize: 11,
           padding: [0, 0, 0, 10],
         },
         data: newData && newData.length > 0 ? newData : [],
       },
       series: [
         // 主要展示层的
         {
           radius: ['40%', '85%'],
           center: ['30%', '43%'],
           type: 'pie',
           label: {
             position: 'inner',
             color: '#6ddcf3',
             fontSize: 14,
             formatter: (item) => {
               return item.data.percentage + '%';
             },
           },
           data: newData && newData.length > 0 ? newData : [],


         }
       ]
     };

     return option;
  }
}

export default comEcharts
