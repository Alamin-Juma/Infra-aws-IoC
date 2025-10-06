import React from 'react';
import ReactECharts from 'echarts-for-react';

const InventorySummaryChart = ({ data }) => {
    const option = {
        title: {
            text: 'Inventory Summary',
            left: 'center',
            textStyle: {
                fontSize: 18, 
                fontWeight: 'bold',
                color: '#333'
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
                name: 'Inventory Summary',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '70%'],
                // adjust the start and end angle
                startAngle: 180,
                endAngle: 360,
                data,
            }
        ]
    };

    return (
        <ReactECharts
            option={option}

        />
    );
};

export default InventorySummaryChart;
