import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  fallbackSrc?: string;
  fill?: boolean;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  onLoad,
  fallbackSrc = '/images/options/fallback.jpg',
  fill = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const imageProps = {
    src: error ? fallbackSrc : src,
    alt,
    priority,
    onError: () => setError(true),
    onLoad: handleLoad,
    sizes,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      className
    ),
    style: { objectFit: 'cover' as const },
    ...(fill ? { fill: true } : { width, height }),
  };

  return (
    <div className={cn('relative overflow-hidden', fill ? 'w-full h-full' : '')}>
      <Image {...imageProps} />
      {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
    </div>
  );
}
