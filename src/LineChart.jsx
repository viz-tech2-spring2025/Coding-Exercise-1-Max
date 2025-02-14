import * as d3 from 'd3';
import { useState, useRef } from 'react';

export function LineChart({ data }) {
  // we track the hovered point, e.g. { year, value, label } or null
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // we also track where the tooltip should appear within the container
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // this ref helps us figure out the container’s position for tooltip offsets
  const containerRef = useRef(null);

  // basic chart dimensions
  const margin = { top: 40, right: 100, bottom: 50, left: 60 };
  const width = 800;
  const height = 500;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // x scale covers the range of years in the data
  const xDomain = d3.extent(data, (d) => d.year);
  const xScale = d3.scaleLinear().domain(xDomain).range([0, innerWidth]);

  // y scale goes from 0 up to the max among i305, i310, i324
  const yMax = d3.max(data, (d) => Math.max(d.i305, d.i310, d.i324));
  const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]).nice();

  // line generators for each column
  const line305 = d3.line().x((d) => xScale(d.year)).y((d) => yScale(d.i305));
  const line310 = d3.line().x((d) => xScale(d.year)).y((d) => yScale(d.i310));
  const line324 = d3.line().x((d) => xScale(d.year)).y((d) => yScale(d.i324));

  // colors for each line
  const color305 = 'steelblue';
  const color310 = 'crimson';
  const color324 = 'green';

  // we store hovered circle info when the mouse enters
  const handleMouseEnter = (event, circleData) => {
    setHoveredPoint(circleData);
  };

  // update tooltip position as the mouse moves
  const handleMouseMove = (event) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left + 10;
    const y = event.clientY - rect.top + 10;
    setTooltipPos({ x, y });
  };

  // clear hovered state when the mouse leaves
  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* x axis */}
          <g
            transform={`translate(0, ${innerHeight})`}
            ref={(node) => {
              d3.select(node).call(d3.axisBottom(xScale).tickFormat(d3.format('d')));
            }}
          />
          <text
            x={innerWidth / 2}
            y={innerHeight + 40}
            textAnchor="middle"
            fill="white"
          >
            year
          </text>

          {/* y axis */}
          <g
            ref={(node) => {
              d3.select(node).call(d3.axisLeft(yScale));
            }}
          />
          <text
            transform={`translate(-40, ${innerHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            fill="white"
          >
            exposure value
          </text>

          {/* three lines */}
          <path d={line305(data)} fill="none" stroke={color305} strokeWidth={2} />
          <path d={line310(data)} fill="none" stroke={color310} strokeWidth={2} />
          <path d={line324(data)} fill="none" stroke={color324} strokeWidth={2} />

          {/* circles for i305 */}
          {data.map((d, i) => {
            const hovered = hoveredPoint?.label === 'i305' && hoveredPoint?.year === d.year;
            return (
              <circle
                key={`i305-${i}`}
                cx={xScale(d.year)}
                cy={yScale(d.i305)}
                r={hovered ? 6 : 3}
                fill={color305}
                stroke="white"
                strokeWidth={hovered ? 1 : 0}
                onMouseEnter={(event) =>
                  handleMouseEnter(event, { year: d.year, value: d.i305, label: 'i305' })
                }
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}

          {/* circles for i310 */}
          {data.map((d, i) => {
            const hovered = hoveredPoint?.label === 'i310' && hoveredPoint?.year === d.year;
            return (
              <circle
                key={`i310-${i}`}
                cx={xScale(d.year)}
                cy={yScale(d.i310)}
                r={hovered ? 6 : 3}
                fill={color310}
                stroke="white"
                strokeWidth={hovered ? 1 : 0}
                onMouseEnter={(event) =>
                  handleMouseEnter(event, { year: d.year, value: d.i310, label: 'i310' })
                }
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}

          {/* circles for i324 */}
          {data.map((d, i) => {
            const hovered = hoveredPoint?.label === 'i324' && hoveredPoint?.year === d.year;
            return (
              <circle
                key={`i324-${i}`}
                cx={xScale(d.year)}
                cy={yScale(d.i324)}
                r={hovered ? 6 : 3}
                fill={color324}
                stroke="white"
                strokeWidth={hovered ? 1 : 0}
                onMouseEnter={(event) =>
                  handleMouseEnter(event, { year: d.year, value: d.i324, label: 'i324' })
                }
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}

          {/* legend */}
          <g transform={`translate(${innerWidth + 10}, 0)`}>
            <rect x={0} y={0} width={10} height={10} fill={color305} />
            <text x={15} y={10} fontSize={12} fill="white">
              i305
            </text>

            <rect x={0} y={20} width={10} height={10} fill={color310} />
            <text x={15} y={30} fontSize={12} fill="white">
              i310
            </text>

            <rect x={0} y={40} width={10} height={10} fill={color324} />
            <text x={15} y={50} fontSize={12} fill="white">
              i324
            </text>
          </g>
        </g>
      </svg>

      {/* tooltip appears when hoveredPoint is set */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPos.x,
            top: tooltipPos.y,
            pointerEvents: 'none',
            background: '#333',
            color: '#fff',
            padding: '6px',
            borderRadius: '4px',
            fontSize: '0.9rem',
          }}
        >
          <div>
            <strong>{hoveredPoint.label}</strong>
          </div>
          <div>year: {hoveredPoint.year}</div>
          <div>value: {hoveredPoint.value.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
