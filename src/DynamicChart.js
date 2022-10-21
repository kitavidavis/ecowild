import React, { PureComponent } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function NDVIStatistics2({ndvi, prev,  name}){
    const data = [
        {
          name: name,
          ndvi: ndvi,
          prev: prev,
        },
      ];
    return (
        <ResponsiveContainer width="100%" height="90%">
          <BarChart width={300} height={40} data={data}>
            <XAxis dataKey="name" />
            <YAxis type="number" domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Bar dataKey="ndvi" fill="#8884d8" />
            <Bar dataKey="prev" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      );
}
