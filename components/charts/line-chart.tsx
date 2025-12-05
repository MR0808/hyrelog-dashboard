'use client';

import dynamic from 'next/dynamic';

// Dynamically import LineChart with SSR disabled to fix compatibility issues
const LineChart = dynamic(
    () => import('recharts').then((mod) => mod.LineChart),
    { ssr: false }
);

const Line = dynamic(() => import('recharts').then((mod) => mod.Line), {
    ssr: false
});

const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), {
    ssr: false
});

const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), {
    ssr: false
});

const CartesianGrid = dynamic(
    () => import('recharts').then((mod) => mod.CartesianGrid),
    { ssr: false }
);

const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), {
    ssr: false
});

const ResponsiveContainer = dynamic(
    () => import('recharts').then((mod) => mod.ResponsiveContainer),
    { ssr: false }
);

export {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
};
