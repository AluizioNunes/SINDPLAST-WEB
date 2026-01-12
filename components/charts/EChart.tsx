'use client';

import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';

interface EChartProps {
    options: any;
    height?: string;
    onEvents?: Record<string, (params: any) => void>;
}

export default function EChart({ options, height = '300px', onEvents }: EChartProps) {
    const { theme } = useTheme();
    const chartRef = useRef<ReactECharts>(null);

    // Dynamic theme adjustment
    const chartTheme = theme === 'dark' ? 'dark' : 'light';
    
    // Inject common styles or config based on theme
    const finalOptions = {
        backgroundColor: 'transparent',
        ...options,
        tooltip: {
            backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
            textStyle: {
                color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
            },
            ...options.tooltip,
        },
        legend: {
            textStyle: {
                color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
            },
            ...options.legend,
        }
    };

    return (
        <ReactECharts
            ref={chartRef}
            option={finalOptions}
            style={{ height, width: '100%' }}
            theme={chartTheme}
            onEvents={onEvents}
            opts={{ renderer: 'svg' }}
        />
    );
}
