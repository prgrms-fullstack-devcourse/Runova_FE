import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text,View } from "react-native";

import type { RootStackParamList } from "@/types/navigation.types";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;

export default function Details({ route, navigation }: Props) {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Details #{route.params.id}</Text>
      <Text onPress={() => navigation.goBack()}>Back</Text>
    </View>
  );
}
