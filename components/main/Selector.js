import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import THEME from "../tools/constants/THEME";
import {useState} from "react";

export default function Selector(
  props = {
    value: 0,
    onChange: (forward) => {},
    style: StyleSheet.compose(),
    size: 0,
  }
) {
  const value = props.value;
  const size = props.size;
  return (
    <View style={props.style || styles.main}>
      <TouchableOpacity
        onPress={() => {
          props.onChange(false);
        }}
      >
        <Ionicons name="caret-back" size={size} color={THEME.textColor0} />
      </TouchableOpacity>
      <Text style={{fontSize: size, color: THEME.textColor0}}>{value}</Text>
      <TouchableOpacity
        onPress={() => {
          props.onChange(true);
        }}
      >
        <Ionicons name="caret-forward" size={size} color={THEME.textColor0} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});
