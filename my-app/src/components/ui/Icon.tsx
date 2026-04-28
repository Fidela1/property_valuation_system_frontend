import Image from 'next/image';

interface IconProps {
  name: string;
  className?: string;
  width?: number;
  height?: number;
}

const Icon = ({ name, className = '', width = 20, height = 20 }: IconProps) => {
  return (
    <Image
      src={`/icons/${name}.png`}
      alt={name}
      width={width}
      height={height}
      className={className}
    />
  );
};

export default Icon;