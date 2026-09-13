import React, { useState } from "react";

interface PieChartItem {
  label: string;
  score: number;
}

interface PieChartProps {
  data: PieChartItem[];
  size?: number;
  palette?: string[];
}

const DEFAULT_PALETTE = ["#2b2b2b", "#5a5a5a", "#828282", "#a8a8a8", "#c9c9c9"];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 240,
  palette = DEFAULT_PALETTE,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.score, 0);
  if (total <= 0) return null;

  const radius = size / 2;
  const center = radius;
  const chartRadius = radius * 0.85;

  let cumulativeAngle = -Math.PI / 2; // start from top (12 o'clock)

  const slices = data.map((item, idx) => {
    const fraction = item.score / total;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const x1 = center + chartRadius * Math.cos(startAngle);
    const y1 = center + chartRadius * Math.sin(startAngle);
    const x2 = center + chartRadius * Math.cos(endAngle);
    const y2 = center + chartRadius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${chartRadius} ${chartRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const midAngle = startAngle + angle / 2;
    const labelRadius = chartRadius * 0.65;
    const lx = center + labelRadius * Math.cos(midAngle);
    const ly = center + labelRadius * Math.sin(midAngle);

    const color = palette[idx % palette.length];
    const percentage = (fraction * 100).toFixed(1);

    return {
      item,
      pathData,
      color,
      percentage,
      lx,
      ly,
      fraction,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, idx) => (
            <path
              key={idx}
              d={slice.pathData}
              fill={slice.color}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-all duration-200 cursor-pointer"
              style={{
                opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.6,
                transformOrigin: `${center}px ${center}px`,
                transform: hoveredIdx === idx ? "scale(1.03)" : "scale(1)",
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {slices.map((slice, idx) => {
            // Only show percentage on slice if wedge is large enough
            if (slice.fraction < 0.08) return null;
            return (
              <text
                key={`txt-${idx}`}
                x={slice.lx}
                y={slice.ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11"
                fill="#ffffff"
                fontWeight="500"
                className="pointer-events-none drop-shadow-xs"
              >
                {slice.percentage}%
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 min-w-[180px]">
        {slices.map((slice, idx) => (
          <div
            key={`leg-${idx}`}
            className={`flex items-center justify-between text-xs py-1 px-2 rounded-md transition-colors cursor-pointer ${
              hoveredIdx === idx ? "bg-black/5 dark:bg-white/5" : ""
            }`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-xs shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-[#2b2b2b] dark:text-zinc-200 truncate max-w-[130px]">
                {slice.item.label}
              </span>
            </div>
            <span className="text-[#6b6b6b] dark:text-zinc-400 tabular-nums ml-3 font-mono">
              {Number(slice.item.score).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
