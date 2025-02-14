import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { LineChart } from './LineChart';

export default function App() {
  // we keep our csv data in state
  const [data, setData] = useState([]);

  // on mount, we load the csv
  useEffect(() => {
    // adjust the path to match where your csv is located
    d3.csv('/data/ultraviolet_irradiance.csv', d3.autoType).then((loaded) => {
      // make sure we have numeric columns
      const parsed = loaded.map((d) => ({
        year: +d.year,
        i305: +d.i305,
        i310: +d.i310,
        i324: +d.i324,
      }));
      setData(parsed);
    });
  }, []);

  // we render the chart once data is ready
  return (
    <div>
      <h1>i305, i310, i324 irradiance in the USA by Year</h1>
      {data.length > 0 ? <LineChart data={data} /> : <p>loading data...</p>}
    </div>
  );
}
