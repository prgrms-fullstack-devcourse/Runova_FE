import WebScreen from '@/components/WebScreen';

const ORIGIN = process.env.EXPO_PUBLIC_WEB_ORIGIN;

export default function WebMyPage() {
  return <WebScreen origin={ORIGIN} path="/mypage" />;
}
