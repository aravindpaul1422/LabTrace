import React from 'react';

interface SecondMedicLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const SecondMedicLogo: React.FC<SecondMedicLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 42 : 32;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const subTextSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-[11px]' : 'text-[10px]';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon SVG: Cross with cardiogram heartbeat pulse */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-1.5 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30"
        style={{ width: iconSize + 10, height: iconSize + 10 }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Stylized rounded Medical Cross with Stethoscope / Heart Pulse */}
          <path
            d="M12 4C12 2.89543 12.8954 2 14 2H18C19.1046 2 20 2.89543 20 4V10H26C27.1046 10 28 10.8954 28 12V16C28 17.1046 27.1046 18 26 18H20V26C20 27.1046 19.1046 28 18 28H14C12.8954 28 12 27.1046 12 26V18H6C4.89543 18 4 17.1046 4 16V12C4 10.8954 4.89543 10 6 10H12V4Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
          {/* Dynamic ECG / Pulse line across the cross */}
          <path
            d="M5 15H10L12.5 9L16 21L19.5 12L21.5 16H27"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glow dot */}
          <circle cx="27" cy="16" r="1.5" fill="#38BDF8" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className={`font-extrabold tracking-tight leading-none ${textSize}`}>
          <span className="text-white">Second</span>
          <span className="text-cyan-400">Medic</span>
        </div>
        {showSubtitle && (
          <div className={`flex items-center gap-1.5 font-medium tracking-wider uppercase text-cyan-200/70 mt-0.5 ${subTextSize}`}>
            <span>Diagnostics Network</span>
            <span className="inline-block w-1 h-1 rounded-full bg-cyan-400"></span>
            <span className="text-emerald-400 font-semibold">OS</span>
          </div>
        )}
      </div>
    </div>
  );
};
