import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import CONST from "../tools/constants/CONST";
import CalendarView from "./CalendarView";
import IBDate from "./calendar_tools/IBDate";
import THEME from "../tools/constants/THEME";

export default function Calendar(
  props = {
    date: IBDate.prototype,
    width: 0,
    style: StyleSheet.create(),
    today: new IBDate(),
    onPress: (date, localday) => {},
  }
) {
  const first_day = new IBDate({
    year: props.date.year,
    month: props.date.month,
    date: props.date.date,
  });
  const today = props.today;
  const width = props.width || 50;
  return (
    <View style={{alignItems: "center", flex: 1}}>
      <View style={{flexDirection: "row"}}>
        {CONST.Day_Abv.map((value, index, array) => {
          return (
            <TouchableOpacity
              key={index}
              style={[styles.days_of_week, {width: width}]}
            >
              <Text
                style={{fontSize: (width * 20) / 50, color: props.color}}
              >
                {value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <CalendarView
        first_date_of_month={first_day}
        width={width * 7}
        today={today}
        onPress={props.onPress}
        color={props.color}
        today_bg={props.today_bg}
        osavoh_bg={props.osavoh_bg}
        today_osavoh_bg={props.today_osavoh_bg}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  days_of_week: {
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
