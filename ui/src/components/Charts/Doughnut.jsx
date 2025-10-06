import React from 'react';
import ReactECharts from 'echarts-for-react';

const DonutChart = ({ data }) => {
  const option = {
    title: {
      text: 'Devices Condition', 
      left: 'center',
      textStyle: {
          fontSize: 18, 
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '20px',
      }
  },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        name: 'Device Condition',
        type: 'pie',
        radius: ['40%', '75%'],
        avoidLabelOverlap: false,
        padAngle: 2,
        itemStyle: {
          borderRadius: 10
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data
      }
    ],
  };

  return (
    <ReactECharts
      option={option}
     
    />
  );
};

export default DonutChart;
