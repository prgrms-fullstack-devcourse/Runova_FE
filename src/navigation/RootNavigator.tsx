import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Details from "@/pages/Details/Details";
import Home from "@/pages/Home/Home";

import type { RootStackParamList } from "../types/navigation.types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShadowVisible: false }}
      initialRouteName="Home"
    >
      <Stack.Screen name="Home" component={Home} options={{ title: "Home" }} />
      <Stack.Screen
        name="Details"
        component={Details}
        options={{ title: "Details" }}
      />
    </Stack.Navigator>
  );
}
