interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2">
      {showText && (
        <span className={`font-display font-bold ${textSizes[size]}`}>
          <span className="text-foreground">Moonwalk</span>
          <span className="text-primary"> Forum</span>
        </span>
      )}
    </div>
  );
}
