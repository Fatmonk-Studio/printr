import { useState, useEffect, useRef } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

export const LazyImage = ({ src, alt, className = "", onError }: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !imageSrc) {
            // Load the image when it comes into view
            loadImage();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before image comes into view
        threshold: 0.01,
      }
    );

    // Observe the image element
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      // Cleanup observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src]);

  const loadImage = () => {
    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      // Try loading without crossOrigin on error
      const img2 = new Image();
      img2.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
      img2.onerror = () => {
        setHasError(true);
        setIsLoading(false);
        if (onError) onError();
      };
      img2.src = src;
    };

    // Try with crossOrigin first
    img.crossOrigin = "anonymous";
    img.src = src;
  };

  return (
    <div ref={imgRef} className={`w-full h-full relative ${className}`}>
      {isLoading && !imageSrc && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
        />
      )}
    </div>
  );
};
