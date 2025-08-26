import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

const ORIGIN = process.env.EXPO_PUBLIC_WEB_ORIGIN ?? 'http://192.168.0.2:5173/';

export default function WebCommunity() {
  return (
    <View style={styles.container}>
      <WebView source={{ uri: `${ORIGIN}/community` }} style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
