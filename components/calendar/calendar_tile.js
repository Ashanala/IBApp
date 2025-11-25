import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import CONST from "../tools/constants/CONST";
import {useTheme} from "@react-navigation/native";
import THEME from "../tools/constants/THEME";
import {IBColors,ColorIndex} from "../IBColors"

export default function CalendarTile(
  props = {size: 50, date: 27, localday: 0, onPress: (date, localday) => {}}
) {
  const size = props.size || 20;
  const date = props.date || 27;
  const localday = props.localday;
  return (
    <TouchableOpacity
      style={[styles.main,{borderColor:props.color}]}
      onPress={() => {
        props.onPress(date, localday);
      }}
    >
      <Text style={{fontSize: size, color:props.color}}>{date}</Text>
      <Text style={{fontSize: (size * 25) / 50, color: props.color}}>
        {CONST.LocalDay[localday]}
      </Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  main: {
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
  },
});
