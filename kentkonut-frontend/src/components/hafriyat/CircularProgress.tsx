import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color,
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (percentage * circumference) / 100;

  // Renk belirleme
  const getColor = () => {
    if (color) return color;
    
    if (percentage <= 25) return '#ff4d4f';
    if (percentage <= 50) return '#faad14';
    if (percentage <= 75) return '#52c41a';
    return '#1890ff';
  };

  return (
    <div className="circular-progress" style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Arka plan daire */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e9e9e9"
          strokeWidth={strokeWidth}
        />
        
        {/* İlerleme dairesi */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - dash}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Yüzde göstergesi */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: size / 4, fontWeight: 'bold' }}>%{percentage}</div>
        {label && <div style={{ fontSize: size / 8, marginTop: 5 }}>{label}</div>}
      </div>
    </div>
  );
};

export default CircularProgress;