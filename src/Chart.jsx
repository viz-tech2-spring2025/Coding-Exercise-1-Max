import * as d3 from 'd3';
import { useState, useRef } from 'react';

export function Chart({ data }) {
  // establishing some state for tooltips & hovers
  const [hoveredData, setHoveredData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });

  // containers
  const containerRef = useRef(null);

  // general dims
  const margin = { top: 50, right: 20, bottom: 50, left: 60 };
  const width = 800;
  const height = 600;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // filter for validity (no NaNs)
  const filteredData = data.filter(d => {
    const isCountry = d['Country Code']?.length === 3;
    return (
      isCountry &&
      d['1990'] !== undefined && !isNaN(d['1990']) &&
      d['2020'] !== undefined && !isNaN(d['2020'])
    );
  });

  // draw some scales
  const xMax = d3.max(filteredData, d => d['1990']) || 0;
  const yMax = d3.max(filteredData, d => d['2020']) || 0;

  const xScale = d3.scaleLinear()
    .domain([0, Math.max(xMax, 100)])
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, Math.max(yMax, 100)])
    .range([innerHeight, 0]);

  // mouse hover handler
  const handleMouseEnter = (event, d) => {
    setHoveredData(d);
  };


  // fixing tooltip distance
  const handleMouseMove = (event, d) => {
    // Position tooltip near the cursor
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    setTooltipPos({
      left: localX + 10, // offset so the tooltip isn't under the cursor
      top: localY + 10
    });
  };

  // removing tooltip from DOM (fixes flicker bug)
  const handleMouseLeave = () => {
    setHoveredData(null);
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <h3>Protected Areas: 1990 vs. 2020</h3>

      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* x axis */}
          <g
            transform={`translate(0, ${innerHeight})`}
            ref={node => {
              const axis = d3.axisBottom(xScale).tickFormat(d => d + '%');
              d3.select(node).call(axis);
            }}
          />
          <text
            x={innerWidth / 2}
            y={innerHeight + 35}
            textAnchor="middle"
            fill='white'
          >
            1990 (% protected)
          </text>

          {/* y axis */}
          <g
            ref={node => {
              const axis = d3.axisLeft(yScale).tickFormat(d => d + '%');
              d3.select(node).call(axis);
            }}
          />
          <text
            transform={`translate(-40, ${innerHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            fill='white'
          >
            2020 (% protected)
          </text>

          {/* ref line where y=x, better allows drawing comparison */}
          <line
            x1={xScale(0)}
            y1={yScale(0)}
            x2={xScale(100)}
            y2={yScale(100)}
            stroke="gray"
            strokeDasharray="3 2"
          />

          {/* country circle  */}
          {filteredData.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d['1990'])}
              cy={yScale(d['2020'])}
              r={5}
              fill="steelblue"
              opacity={0.8}
              onMouseEnter={(event) => handleMouseEnter(event, d)}
              onMouseMove={(event) => handleMouseMove(event, d)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </g>
      </svg>

      {/* tooltip styling*/}
      {hoveredData && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            backgroundColor: '#000',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '8px',
            fontSize: '0.9rem',
            left: tooltipPos.left,
            top: tooltipPos.top
          }}
        >
          <strong>{hoveredData['Country Name']}</strong>
          <div>1990: {hoveredData['1990']}%</div>
          <div>2020: {hoveredData['2020']}%</div>
        </div>
      )}
    </div>
  );
}
