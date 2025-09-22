import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Records from '@/pages/Records';
import RecordDetail from '@/pages/RecordDetail';

export type RecordsStackParamList = {
  RecordsMain: undefined;
  RecordDetail: { recordId: number };
};

const Stack = createNativeStackNavigator<RecordsStackParamList>();

export default function RecordsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecordsMain" component={Records} />
      <Stack.Screen name="RecordDetail" component={RecordDetail} />
    </Stack.Navigator>
  );
}
