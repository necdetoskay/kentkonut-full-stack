import React from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  color?: string;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 20,
  color,
  label
}) => {
  // Renk belirleme
  const getColor = () => {
    if (color) return color;
    
    if (percentage <= 25) return '#ff4d4f';
    if (percentage <= 50) return '#faad14';
    if (percentage <= 75) return '#52c41a';
    return '#1890ff';
  };

  return (
    <div className="progress-container" style={{ marginBottom: '15px' }}>
      {label && (
        <div className="progress-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>{label}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div
        className="progress-background"
        style={{
          height: `${height}px`,
          backgroundColor: '#e9e9e9',
          borderRadius: `${height / 2}px`,
          overflow: 'hidden'
        }}
      >
        <div
          className="progress-bar"
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: getColor(),
            borderRadius: `${height / 2}px`,
            transition: 'width 0.5s ease-in-out'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;