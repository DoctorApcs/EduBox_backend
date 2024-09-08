// components/TimeChart.js
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Sample data
const data = [
  { day: 'Mon', Math: 2, Science: 1, English: 1.5 },
  { day: 'Tue', Math: 1, Science: 2, English: 2 },
  { day: 'Wed', Math: 1.5, Science: 2.5, English: 1 },
  { day: 'Thu', Math: 2, Science: 1, English: 2 },
  { day: 'Fri', Math: 1.5, Science: 2, English: 1.5 },
  { day: 'Sat', Math: 2, Science: 1.5, English: 1 },
  { day: 'Sun', Math: 1, Science: 2, English: 2 },
];

// Calculate total learning time per course
const totalLearningTime = data.reduce(
  (acc, curr) => {
    acc.Math += curr.Math;
    acc.Science += curr.Science;
    acc.English += curr.English;
    return acc;
  },
  { Math: 0, Science: 0, English: 0 }
);

// Convert total learning time to an array format for the PieChart
const pieData = Object.entries(totalLearningTime).map(([key, value]) => ({
  name: key,
  value,
}));

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const TimeChart = () => {
  return (
    <div className="w-full bg-white p-4 shadow-md rounded-md space-y-8">
      {/* Stacked Bar Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Math" stackId="a" fill="#8884d8" />
            <Bar dataKey="Science" stackId="a" fill="#82ca9d" />
            <Bar dataKey="English" stackId="a" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="w-full h-64 flex items-center justify-center">
        <ResponsiveContainer width="50%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeChart;
