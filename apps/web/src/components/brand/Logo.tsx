import * as React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: { icon: 'w-8 h-8', text: 'text-lg', full: 'h-8' },
  md: { icon: 'w-10 h-10', text: 'text-xl', full: 'h-10' },
  lg: { icon: 'w-12 h-12', text: 'text-2xl', full: 'h-12' },
  xl: { icon: 'w-16 h-16', text: 'text-3xl', full: 'h-16' },
};

/**
 * Fry Exchange Logo Component
 *
 * The logo features a 3D red paper airplane/arrow shape
 * representing speed, direction, and forward momentum.
 */
export function Logo({ variant = 'full', size = 'md', className }: LogoProps) {
  const sizes = sizeClasses[size];

  // SVG representation of the Fry Networks paper airplane logo
  const LogoIcon = ({ className: iconClass }: { className?: string }) => (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizes.icon, iconClass)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Paper airplane shape with 3D effect */}
      <defs>
        <linearGradient id="fryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF0000" />
          <stop offset="100%" stopColor="#CC0000" />
        </linearGradient>
        <linearGradient id="fryGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CC0000" />
          <stop offset="100%" stopColor="#660000" />
        </linearGradient>
        <linearGradient id="fryGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3333" />
          <stop offset="100%" stopColor="#FF0000" />
        </linearGradient>
      </defs>

      {/* Main triangular shape - pointing upper right */}
      <polygon
        points="20,50 80,15 50,85"
        fill="url(#fryGradient)"
      />

      {/* Left face - darker shade */}
      <polygon
        points="20,50 50,85 45,55"
        fill="url(#fryGradientDark)"
      />

      {/* Right face - lighter shade */}
      <polygon
        points="80,15 50,85 55,45"
        fill="url(#fryGradientLight)"
      />

      {/* Center fold line */}
      <line
        x1="45"
        y1="40"
        x2="50"
        y2="85"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
    </svg>
  );

  const LogoText = ({ className: textClass }: { className?: string }) => (
    <span className={cn('font-bold text-fry-red-500', sizes.text, textClass)}>
      Fry<span className="text-foreground">Exchange</span>
    </span>
  );

  if (variant === 'icon') {
    return <LogoIcon className={className} />;
  }

  if (variant === 'text') {
    return <LogoText className={className} />;
  }

  return (
    <div className={cn('flex items-center gap-2', sizes.full, className)}>
      <LogoIcon />
      <LogoText />
    </div>
  );
}

/**
 * Full Fry Networks Logo with network orbits
 */
export function FryNetworksLogo({ size = 'md', className }: Omit<LogoProps, 'variant'>) {
  const sizes = sizeClasses[size];

  return (
    <svg
      viewBox="0 0 150 150"
      className={cn(sizes.icon, 'w-auto', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fryGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF0000" />
          <stop offset="100%" stopColor="#CC0000" />
        </linearGradient>
        <linearGradient id="fryGradientDarkFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CC0000" />
          <stop offset="100%" stopColor="#660000" />
        </linearGradient>
        <linearGradient id="fryGradientLightFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3333" />
          <stop offset="100%" stopColor="#FF0000" />
        </linearGradient>
      </defs>

      {/* Network orbit lines */}
      <ellipse
        cx="75"
        cy="75"
        rx="55"
        ry="25"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        transform="rotate(-45 75 75)"
        className="text-fry-dark-900 dark:text-fry-dark-100"
      />

      {/* Network nodes */}
      <circle cx="30" cy="120" r="5" fill="currentColor" className="text-fry-dark-900 dark:text-fry-dark-100" />
      <circle cx="120" cy="30" r="5" fill="currentColor" className="text-fry-dark-900 dark:text-fry-dark-100" />
      <circle cx="25" cy="45" r="5" fill="currentColor" className="text-fry-dark-900 dark:text-fry-dark-100" />
      <circle cx="125" cy="105" r="5" fill="currentColor" className="text-fry-dark-900 dark:text-fry-dark-100" />

      {/* Node connection lines */}
      <line x1="30" y1="115" x2="55" y2="90" stroke="currentColor" strokeWidth="2" className="text-fry-dark-900 dark:text-fry-dark-100" />
      <line x1="115" y1="35" x2="95" y2="55" stroke="currentColor" strokeWidth="2" className="text-fry-dark-900 dark:text-fry-dark-100" />
      <line x1="30" y1="50" x2="50" y2="60" stroke="currentColor" strokeWidth="2" className="text-fry-dark-900 dark:text-fry-dark-100" />
      <line x1="120" y1="100" x2="100" y2="90" stroke="currentColor" strokeWidth="2" className="text-fry-dark-900 dark:text-fry-dark-100" />

      {/* Main paper airplane - centered */}
      <g transform="translate(45, 35)">
        <polygon
          points="10,35 60,5 35,60"
          fill="url(#fryGradientFull)"
        />
        <polygon
          points="10,35 35,60 30,40"
          fill="url(#fryGradientDarkFull)"
        />
        <polygon
          points="60,5 35,60 40,30"
          fill="url(#fryGradientLightFull)"
        />
        <line
          x1="30"
          y1="28"
          x2="35"
          y2="60"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

export function FryExchangeWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-bold', className)}>
      <span className="text-fry-red-500">Fry</span>
      <span className="text-foreground">Exchange</span>
    </span>
  );
}
