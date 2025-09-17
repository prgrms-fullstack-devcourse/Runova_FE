export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance * 100) / 100}m`;
  }
  return `${Math.round((distance / 1000) * 100) / 100}km`;
};

export const formatTime = (time: number): string => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.round((time % 60) * 100) / 100;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 ${seconds}초`;
  }
  if (minutes > 0) {
    return `${minutes}분 ${seconds}초`;
  }
  return `${seconds}초`;
};

export const formatPace = (paceSeconds: number): string => {
  if (paceSeconds === 0) return '0\'00"';

  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.round((paceSeconds % 60) * 100) / 100;
  return `${minutes}'${seconds.toFixed(2).padStart(5, '0')}"`;
};
