import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import THEME from "../tools/constants/THEME";

export default class DateOptionsView extends React.Component {
  render() {
    const date = this.props.date || 10;
    const month = this.props.month || "January";
    const day = this.props.day || "Sunday, Ebina";
    const year = this.props.year || 2024;
    const epochMillisec = this.props.epochMillisec || 0;
    const is_after_launch = this.props.is_after_launch || false;
    const is_before_today = this.props.is_before_today || false;
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          onPress={() => {
            this.props.dismiss();
          }}
          style={{flex: 1}}
        />
        <View style={styles.content}>
          <View style={styles.day_details}>
            <View style={{flexDirection: "row"}}>
              <Text style={styles.date}>{date}</Text>
              <Text style={styles.month}>{month}</Text>
            </View>
            <View>
              <Text style={styles.day}>{day}</Text>
              <Text style={styles.year}>{year}</Text>
            </View>
          </View>
          {is_after_launch && is_before_today && (
            <TouchableOpacity
              style={styles.see_posts}
              onPress={() => {
                this.props.onSeePostPress(epochMillisec);
              }}
            >
              <Text style={styles.see_posts_text}> See Posts </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            this.props.dismiss();
          }}
          style={{flex: 1}}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    alignSelf: "center",
  },
  day_details: {
    backgroundColor: "white",
    margin: 5,
    padding: 5,
    minWidth: "80%",
    borderRadius: 5,
  },
  date: {
    fontSize: 50,
    fontWeight: "500",
    alignSelf: "flex-end",
    fontStyle: "italic",
  },
  month: {
    alignSelf: "flex-end",
    fontSize: 20,
    fontStyle: "italic",
  },
  day: {fontSize: 30, fontStyle: "italic"},
  year: {textAlign: "right", fontStyle: "italic"},
  see_posts: {
    backgroundColor: "white",
    margin: 5,
    padding: 5,
    minWidth: "80%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  see_posts_text: {fontSize: 18, fontWeight: "600"},
});
