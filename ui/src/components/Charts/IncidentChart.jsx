import React from 'react';
import ReactECharts from 'echarts-for-react';

const IncidentChart = ({ data,months }) => {
    const option = {
        title: {
            text: 'Monthly Requests Trend', 
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
            top: '0%',
            left: 'center'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: months
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data,
                type: 'line',
                smooth: true,  
                areaStyle: {
                    color: '#77b634', 
                    opacity: 0.2 
                },
                lineStyle: {
                    color: '#77b634' 
                }
            }
        ]
    };

    return (
        <ReactECharts
            option={option}

        />
    );
};

export default IncidentChart;
