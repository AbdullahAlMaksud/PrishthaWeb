'use client';

import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface ParentNavigatorProps {
  onClick?: () => void;
  url?: string;
  tooltipText?: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'filled' | 'outline' | 'plain';
  separatorLeft?: boolean;
  separatorRight?: boolean;
  iconFill?: string;
  iconStroke?: string;
  size?: 'full' | 'standard' | 'compact' | number;
}

const DefaultHomeIcon = ({ 
  fill = 'currentColor', 
  stroke = 'currentColor', 
  style 
}: { 
  fill?: string; 
  stroke?: string; 
  style?: React.CSSProperties 
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none"
    style={style}
  >
    <path 
      d="M5 14.0585C5 13.0494 5 12.5448 5.22166 12.1141C5.44333 11.6833 5.8539 11.3901 6.67505 10.8035L10.8375 7.83034C11.3989 7.42938 11.6795 7.2289 12 7.2289C12.3205 7.2289 12.6011 7.42938 13.1625 7.83034L17.325 10.8035C18.1461 11.3901 18.5567 11.6833 18.7783 12.1141C19 12.5448 19 13.0494 19 14.0585V19C19 19.9428 19 20.4142 18.7071 20.7071C18.4142 21 17.9428 21 17 21H7C6.05719 21 5.58579 21 5.29289 20.7071C5 20.4142 5 19.9428 5 19V14.0585Z" 
      fill={fill} 
      fillOpacity="0.24"
    />
    <path 
      d="M3 12.3866C3 12.6535 3 12.7869 3.0841 12.8281C3.16819 12.8692 3.27352 12.7873 3.48418 12.6234L10.7721 6.95502C11.362 6.49625 11.6569 6.26686 12 6.26686C12.3431 6.26686 12.638 6.49625 13.2279 6.95502L20.5158 12.6234C20.7265 12.7873 20.8318 12.8692 20.9159 12.8281C21 12.7869 21 12.6535 21 12.3866V11.9782C21 11.4978 21 11.2576 20.8983 11.0497C20.7966 10.8418 20.607 10.6944 20.2279 10.3995L13.2279 4.95502C12.638 4.49625 12.3431 4.26686 12 4.26686C11.6569 4.26686 11.362 4.49625 10.7721 4.95502L3.77212 10.3995C3.39295 10.6944 3.20337 10.8418 3.10168 11.0497C3 11.2576 3 11.4978 3 11.9782V12.3866Z" 
      fill={stroke}
    />
    <path 
      d="M12.5 15H11.5C10.3954 15 9.5 15.8954 9.5 17V20.85C9.5 20.9328 9.56716 21 9.65 21H14.35C14.4328 21 14.5 20.9328 14.5 20.85V17C14.5 15.8954 13.6046 15 12.5 15Z" 
      fill={stroke}
    />
    <rect x="16" y="5" width="2" height="4" rx="0.5" fill={stroke} />
  </svg>
);

export function ParentNavigator({
  onClick,
  url = 'https://abdullahalmaksud.com',
  tooltipText = 'Visit Portfolio',
  icon,
  className = '',
  variant = 'filled',
  separatorLeft = false,
  separatorRight = false,
  iconFill,
  iconStroke,
  size = 'standard',
}: ParentNavigatorProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (url) {
      window.open(url, '_blank');
    }
  };

  const variantClasses = {
    filled: 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-700/10 shadow-sm',
    outline: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:text-slate-900 shadow-sm',
    plain: 'bg-transparent text-slate-500 hover:bg-slate-100/80 hover:text-slate-800 border border-transparent',
  }[variant];

  const getSizes = () => {
    const isPlain = variant === 'plain';

    if (typeof size === 'number') {
      const buttonSize = size;
      const iconSize = isPlain ? size : Math.round(size * 0.47);
      return {
        buttonStyle: { width: `${buttonSize}px`, height: `${buttonSize}px` } as React.CSSProperties,
        iconStyle: { width: `${iconSize}px`, height: `${iconSize}px` } as React.CSSProperties,
      };
    }

    switch (size) {
      case 'full':
        return {
          buttonStyle: (isPlain ? { width: '100%', height: '100%' } : { width: '32px', height: '32px' }) as React.CSSProperties,
          iconStyle: { width: '100%', height: '100%' } as React.CSSProperties,
        };
      case 'compact':
        return {
          buttonStyle: (isPlain ? { width: '12px', height: '12px' } : { width: '24px', height: '24px' }) as React.CSSProperties,
          iconStyle: { width: '12px', height: '12px' } as React.CSSProperties,
        };
      case 'standard':
      default:
        return {
          buttonStyle: (isPlain ? { width: '15px', height: '15px' } : { width: '32px', height: '32px' }) as React.CSSProperties,
          iconStyle: { width: '15px', height: '15px' } as React.CSSProperties,
        };
    }
  };

  const { buttonStyle, iconStyle } = getSizes();

  return (
    <div className="flex items-center flex-shrink-0">
      {separatorLeft && <div className="h-4 w-[1px] bg-slate-200/80 mr-3.5 flex-shrink-0" />}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={handleClick}
              role="button"
              tabIndex={0}
              aria-label={tooltipText}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick();
                }
              }}
              style={buttonStyle}
              className={`
                rounded-full flex justify-center items-center cursor-pointer overflow-hidden
                active:scale-95 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                ${variantClasses}
                ${className}
              `}
            >
              {icon ? (
                <div style={iconStyle} className="flex items-center justify-center overflow-hidden">
                  {icon}
                </div>
              ) : (
                <DefaultHomeIcon fill={iconFill} stroke={iconStroke} style={iconStyle} />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[10px] px-2.5 py-1 bg-slate-900 text-white rounded shadow-md border-0">
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {separatorRight && <div className="h-4 w-[1px] bg-slate-200/80 ml-3.5 flex-shrink-0" />}
    </div>
  );
}
