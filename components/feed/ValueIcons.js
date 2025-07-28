import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ValueIcons(
  props = { clicked: false, disabled: false, value: 0 || "", onPress: () => {} }
) {
  const size = 25;
  const value = props.value || 0;
  return (
    <TouchableOpacity
      style={[
        styles.main,
        {
          margin: 2,
          borderRadius: 5,
          padding: 5,
        },
      ]}
      disabled={props.disabled}
      onPress={props.onPress}
    >
      <Text
        style={{ color: "white", fontSize: size * 0.6, marginHorizontal: 5 }}
      >
        {value}
      </Text>
      <Ionicons
        name="heart"
        color={props.clicked ? "#0af" : "#02a"}
        size={size}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
  },
});
