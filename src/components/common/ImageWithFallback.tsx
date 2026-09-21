import { useState } from 'react';
import { School, Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  category?: string;
  aspectRatio?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackTitle,
  category,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(!src);
  const [isLoading, setIsLoading] = useState(!!src);

  if (hasError || !src) {
    return (
      <div
        className={`bg-linear-to-br from-blue-900 via-indigo-950 to-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-col items-center max-w-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-3 shadow-inner">
            {category ? <ImageIcon className="w-6 h-6" /> : <School className="w-6 h-6" />}
          </div>
          <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-1">
            {category || 'Vidya Vikas EM School'}
          </span>
          <p className="text-sm font-medium text-slate-200 line-clamp-2">
            {fallbackTitle || alt}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Kotauratla, Anakapalle Dist.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <School className="w-6 h-6 text-slate-400 animate-bounce" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
