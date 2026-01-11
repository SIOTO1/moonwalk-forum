import { Moon } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="gradient-accent rounded-lg p-1.5">
          <Moon className={`${iconSizes[size]} text-accent-foreground`} />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-success rounded-full border-2 border-background" />
      </div>
      {showText && (
        <span className={`font-display font-bold ${textSizes[size]}`}>
          <span className="text-foreground">Moonwalk</span>
          <span className="text-gradient"> Forum</span>
        </span>
      )}
    </div>
  );
}
