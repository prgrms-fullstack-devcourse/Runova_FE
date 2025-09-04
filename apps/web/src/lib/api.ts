import axios, { AxiosHeaders } from 'axios';
import { useNativeBridgeStore } from '@/stores/nativeBridgeStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 매 요청마다 최신 토큰을 읽어 Authorization 추가
api.interceptors.request.use((config) => {
  const token = useNativeBridgeStore.getState().token;
  if (token) {
    // 기존 headers를 AxiosHeaders로 감싸고 set으로 추가
    const h = new AxiosHeaders(config.headers);
    h.set('Authorization', `Bearer ${token}`);
    console.log('Auth 토큰 출력 추가 : ', h);
    console.log('baseURL : ', API_BASE_URL)
    config.headers = h;
  }
  return config;
});

export default api;
