import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Points from './WildBeestPoints';

let arr = [];

for(let i=0; i<Points.features.length; i++){
  let item = Points.features[i].properties;
  let ndvi = item.ndvi.toFixed(2);
  let timestamp = item.timestamp;

  let chunk = {ndvi: ndvi, name: timestamp };

  arr.push(chunk);
}


export default class NDVIStatistics extends PureComponent {
  render() {
    return (
      <ResponsiveContainer width="100%" height="92%">
        <LineChart
          width={280}
          height={150}
          data={arr}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ndvi" stroke="#8884d8" dot="" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}