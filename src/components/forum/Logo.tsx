import logoImage from '@/assets/logo.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <div className="flex items-center">
      <img 
        src={logoImage} 
        alt="Moonwalk Forum" 
        className={`${heights[size]} w-auto`}
      />
    </div>
  );
}
