import logoImage from '@/assets/logo.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const heights = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-20',
  };

  return (
    <div className="flex items-center">
      <img 
        src={logoImage} 
        alt="Moonwalk Forum" 
        className={`${heights[size]} w-auto mix-blend-multiply dark:mix-blend-screen dark:invert`}
      />
    </div>
  );
}
