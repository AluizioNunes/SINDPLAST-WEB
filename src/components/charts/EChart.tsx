'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import { useTheme } from 'next-themes';

interface EChartProps {
    options: any;
    height?: string;
    onEvents?: Record<string, (params: any) => void>;
}

export default function EChart({ options, height = '300px', onEvents }: EChartProps) {
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const instanceRef = useRef<echarts.EChartsType | null>(null);

    const finalOptions = useMemo(() => ({
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
        },
    }), [options, theme]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let ro: ResizeObserver | null = null;

        try {
            const inst = echarts.init(el, theme === 'dark' ? 'dark' : undefined, { renderer: 'canvas' });
            instanceRef.current = inst;

            ro = new ResizeObserver(() => {
                try {
                    inst.resize();
                } catch (e) {
                    void e;
                }
            });
            ro.observe(el);
        } catch (e) {
            void e;
        }

        return () => {
            try {
                ro?.disconnect();
            } catch (e) {
                void e;
            }

            const inst = instanceRef.current;
            instanceRef.current = null;
            if (!inst) return;
            try {
                inst.dispose();
            } catch (e) {
                void e;
            }
        };
    }, [theme]);

    useEffect(() => {
        const inst = instanceRef.current;
        if (!inst) return;
        try {
            inst.setOption(finalOptions, { notMerge: true, lazyUpdate: true });
        } catch (e) {
            void e;
        }
    }, [finalOptions]);

    useEffect(() => {
        const inst = instanceRef.current;
        if (!inst || !onEvents) return;
        try {
            Object.entries(onEvents).forEach(([eventName, handler]) => {
                inst.on(eventName as any, handler as any);
            });
        } catch (e) {
            void e;
        }

        return () => {
            const inst2 = instanceRef.current;
            if (!inst2) return;
            try {
                Object.entries(onEvents).forEach(([eventName, handler]) => {
                    inst2.off(eventName as any, handler as any);
                });
            } catch (e) {
                void e;
            }
        };
    }, [onEvents]);

    return (
        <div ref={containerRef} style={{ height, width: '100%' }} />
    );
}
