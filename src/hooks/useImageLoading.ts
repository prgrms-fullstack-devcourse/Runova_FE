import { useState, useCallback } from 'react';

export function useImageLoading() {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const resetImageState = useCallback(() => {
    setImageError(false);
    setImageLoading(true);
  }, []);

  return {
    imageError,
    imageLoading,
    handleImageError,
    handleImageLoad,
    resetImageState,
  };
}
