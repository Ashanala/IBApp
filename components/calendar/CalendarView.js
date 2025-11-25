import {Text, TouchableOpacity, View} from "react-native";
import CalendarTile from "./calendar_tile";
import IBDate from "./calendar_tools/IBDate";
import {IBColors,ColorIndex} from "../IBColors"

export default function CalendarView(
  props = {
    first_date_of_month: {year: 0, month: 0, date: 0, day: 0, localday: 0},
    width: 0,
    today: new IBDate(),
    onPress: (date, localday) => {},
  }
) {
  const date = new IBDate(props.first_date_of_month);
  const today = props.today;
  const pre_padding = date.day;
  const end_position = pre_padding + IBDate.monthLength(date.month, date.year);
  const width = props.width || 350;
  date.shiftDate(-date.day);

  var view = [];
  var row = [];
  for (let i = 1; i <= 42; i++) {
    const is_today =
      date.year == today.year &&
      date.month == today.month &&
      date.date == today.date;
    const is_osavoh =
      date.month == props.first_date_of_month.month &&
      date.day == 0 &&
      date.localday == 2;

    const today_color = is_osavoh
      ? props.today_osavoh_bg : props.today_bg;
    const regular_color = is_osavoh ? props.osavoh_bg: null;

    row.push(
      <View
        key={i}
        style={{
          width: width / 7,
          aspectRatio: 1,
          backgroundColor: is_today ? today_color : regular_color,
        }}
      >
        {i > pre_padding && i <= end_position ? (
          <CalendarTile
            date={date.date}
            localday={date.localday}
            size={(width * 20) / 350}
            onPress={props.onPress}
            color={props.color}
          />
        ) : null}
      </View>
    );

    if (i % 7 == 0) {
      view.push(
        <View style={{flexDirection: "row"}} key={i / 7}>
          {row}
        </View>
      );

      row = [];
    }
    date.nextDay();
  }
  return <View>{view}</View>;
}
