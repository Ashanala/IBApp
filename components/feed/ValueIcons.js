import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {IBColors,ColorIndex} from "../IBColors"

export default function ValueIcons(
  props = { clicked: false, disabled: false, value: 0 || "", onPress: () => {} }
) {
  const size = 25;
  const value = props.value || 0;
  const color = props.color;
  return (
    <TouchableOpacity
      style={[
        styles.main,
        color.bkg,
      ]}
      disabled={props.disabled}
      onPress={props.onPress}
    >
      <Text
        style={[{ fontSize: size * 0.6, marginHorizontal: 5 },color.elm]}
      >
        {value}
      </Text>
      <Ionicons
        name="heart"
        color={props.clicked ? color._elm : color._elm+"33"}
        size={size}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
    backgroundColor: IBColors.surface[ColorIndex.EXTRA],
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderRadius: 5,
    padding: 5,
  },
});
