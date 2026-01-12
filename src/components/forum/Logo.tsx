import logoImage from '@/assets/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const heights = {
    sm: 'h-14',
    md: 'h-20',
    lg: 'h-24',
  };

  return (
    <div className="flex items-center">
      <img 
        src={logoImage} 
        alt="Moonwalk Forum" 
        className={`${heights[size]} w-auto mix-blend-multiply dark:mix-blend-screen dark:brightness-150`}
      />
    </div>
  );
}
