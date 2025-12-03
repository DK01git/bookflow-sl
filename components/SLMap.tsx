import React from 'react';

// Simplified coordinate mapping for visual representation (0-100 scale)
const DISTRICT_COORDS: Record<string, { x: number; y: number }> = {
  'Jaffna': { x: 45, y: 10 },
  'Kilinochchi': { x: 50, y: 18 },
  'Mullaitivu': { x: 60, y: 22 },
  'Mannar': { x: 35, y: 25 },
  'Vavuniya': { x: 50, y: 28 },
  'Trincomalee': { x: 65, y: 35 },
  'Anuradhapura': { x: 48, y: 38 },
  'Puttalam': { x: 30, y: 45 },
  'Polonnaruwa': { x: 60, y: 42 },
  'Kurunegala': { x: 40, y: 50 },
  'Matale': { x: 52, y: 50 },
  'Batticaloa': { x: 70, y: 50 },
  'Kandy': { x: 50, y: 58 },
  'Kegalle': { x: 42, y: 60 },
  'Ampara': { x: 75, y: 60 },
  'Nuwara Eliya': { x: 55, y: 65 },
  'Badulla': { x: 62, y: 65 },
  'Gampaha': { x: 35, y: 62 },
  'Colombo': { x: 32, y: 68 },
  'Kalutara': { x: 35, y: 75 },
  'Ratnapura': { x: 45, y: 72 },
  'Monaragala': { x: 68, y: 70 },
  'Galle': { x: 38, y: 85 },
  'Matara': { x: 50, y: 88 },
  'Hambantota': { x: 65, y: 85 },
};

interface SLMapProps {
  requestCounts: Record<string, number>;
  onDistrictClick?: (district: string) => void;
}

export const SLMap: React.FC<SLMapProps> = ({ requestCounts, onDistrictClick }) => {
  return (
    <div className="relative w-full h-96 bg-blue-50/50 rounded-3xl overflow-hidden shadow-inner border border-blue-100 flex items-center justify-center">
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-600">High Demand</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal-500"></span>
          <span className="text-xs font-semibold text-gray-600">Requests Active</span>
        </div>
      </div>

      {/* Simplified Abstract SVG Map Shape */}
      <svg viewBox="0 0 100 100" className="h-full w-auto drop-shadow-xl" style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.1))' }}>
        <path
          d="M45 5 L55 5 L60 15 L55 25 L65 30 L70 40 L65 55 L75 65 L70 80 L65 90 L50 95 L35 90 L30 80 L25 60 L25 45 L35 30 L40 15 Z"
          fill="#e2e8f0"
          stroke="#cbd5e1"
          strokeWidth="1"
          className="transition-all duration-300"
        />
        {/* Render District Dots */}
        {Object.entries(DISTRICT_COORDS).map(([name, coords]) => {
          const count = requestCounts[name] || 0;
          const isHighlighted = count > 0;
          const isFloodArea = ['Colombo', 'Galle', 'Matara', 'Kalutara', 'Ratnapura'].includes(name);

          return (
            <g key={name} onClick={() => onDistrictClick && onDistrictClick(name)} className="cursor-pointer group">
              {isHighlighted && (
                <circle cx={coords.x} cy={coords.y} r="6" fill={isFloodArea ? "#ef4444" : "#14b8a6"} opacity="0.2" className="animate-ping" />
              )}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={isHighlighted ? 2.5 : 1.5}
                fill={isHighlighted ? (isFloodArea ? "#ef4444" : "#0d9488") : "#94a3b8"}
                className="transition-all duration-300 group-hover:r-3"
              />
              {/* Tooltip Label */}
              <text
                x={coords.x}
                y={coords.y - 5}
                fontSize="3.5"
                textAnchor="middle"
                className={`pointer-events-none font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 fill-slate-800`}
                style={{
                  paintOrder: 'stroke',
                  stroke: 'rgba(255,255,255,0.9)',
                  strokeWidth: '2px',
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round'
                }}
              >
                {name} {count > 0 ? `(${count})` : ''}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};