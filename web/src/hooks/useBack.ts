import { useNavigate } from 'react-router-dom';

/**
 * 뒤로가기 훅
 * - 이전 페이지가 있으면 뒤로가기
 * - 없으면 지정한 경로로 이동
 */
export function useBack(fallback: string = '/') {
  const navigate = useNavigate();

  return () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };
}
