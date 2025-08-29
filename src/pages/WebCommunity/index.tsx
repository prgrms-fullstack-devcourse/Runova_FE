import WebScreen from '@/components/WebScreen';

const ORIGIN = process.env.EXPO_PUBLIC_WEB_ORIGIN;

export default function WebCommunity() {
  return <WebScreen origin={ORIGIN} path="/community" />;
}
