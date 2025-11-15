import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  data: number[];
  trend: "up" | "down";
  height?: number;
};

const MiniChart = ({ data, trend, height = 60 }: Props) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((max - value) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="relative">
      <svg 
        viewBox={`0 0 100 ${height}`} 
        className="w-full overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" className={trend === "up" ? "text-success" : "text-destructive"} stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" className={trend === "up" ? "text-success" : "text-destructive"} stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <polygon
          points={`0,${height} ${points} 100,${height}`}
          fill="url(#chartGradient)"
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={trend === "up" ? "text-success" : "text-destructive"}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      
      <div className="absolute -top-2 -right-2">
        {trend === "up" ? (
          <TrendingUp className="h-4 w-4 text-success" />
        ) : (
          <TrendingDown className="h-4 w-4 text-destructive" />
        )}
      </div>
    </div>
  );
};

export default MiniChart;
