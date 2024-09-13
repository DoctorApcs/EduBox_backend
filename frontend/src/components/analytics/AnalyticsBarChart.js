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
  ReferenceLine,
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

// Calculate the total average learning time for the whole week
const totalHours = data.reduce(
  (acc, curr) => acc + curr.Math + curr.Science + curr.English,
  0
);
const totalEntries = data.length; // 3 subjects for each day
const totalAverage = totalHours / totalEntries; // Overall average for the week

// Calculate total learning time per course for the PieChart
const totalLearningTime = data.reduce(
  (acc, curr) => {
    acc.Math += curr.Math;
    acc.Science += curr.Science;
    acc.English += curr.English;
    return acc;
  },
  { Math: 0, Science: 0, English: 0 }
);

function hourToHourMin(hour) {
  const hourInt = Math.floor(hour);
  const min = Math.round((hour - hourInt) * 60);
  return `${hourInt}h${min}m`;
}

// Convert total learning time to an array format for the PieChart
const pieData = Object.entries(totalLearningTime).map(([key, value]) => ({
  name: key,
  value,
}));

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const TimeChart = () => {
  return (
    <div className="w-full bg-white p-1.5 shadow-md rounded-md space-y-8">
      <div className="mx-auto p-6 bg-white rounded-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Weekly Learning Time
        </h1>
        <div className='pr-3 pl-10'>
          <h2 className="text-lg font-semibold text-gray-600">Daily Average:</h2>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-medium text-blue-600">
              {hourToHourMin(totalAverage)}
            </span>
            <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-md">
              Increased 6% from last week
            </span>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart with Total Weekly Average Line */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Math" stackId="a" fill="#8884d8" />
            <Bar dataKey="Science" stackId="a" fill="#82ca9d" />
            <Bar dataKey="English" stackId="a" fill="#ffc658" />
            {/* Reference line for total weekly average */}
            <ReferenceLine
              y={totalAverage}
              stroke="#00ff00"
              strokeDasharray="3 3"
              label={{
                value: `avg`,
                position: 'left',
                fill: '#00ff00',
                fontSize: 14,
                fontWeight: 'bold',
                backgroundColor: '#fff',
                borderRadius: 3,
                padding: '0 5px',
              }}
              />
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
        <h2 className="text-lg font-semibold text-gray-600 mt-4">
          Total Learning Time:  
          <span className="text-blue-600 font-medium"> {hourToHourMin(totalHours)}</span>
        </h2>
      </div>
    </div>
  );
};

export default TimeChart;
