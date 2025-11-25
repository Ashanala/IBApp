import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import THEME from "../tools/constants/THEME";
import {ColorContext,getColorStyle} from '../IBColors'
import {useContext} from 'react'

export default function DateOptionsView(props) {
  const {theme} = useContext(ColorContext)
  const date = props.date || 10;
  const month = props.month || "January";
  const day = props.day || "Sunday, Ebina";
  const year = props.year || 2024;
  const epochMillisec = props.epochMillisec || 0;
  const is_after_launch = props.is_after_launch || false;
  const is_before_tommorow = props.is_before_tommorow || false;
  
  const details_color = getColorStyle(theme,[0,0]);
  const button_color = details_color;
  
  return (
    <View style={{flex: 1}}>
      <TouchableOpacity
        onPress={() => {
          props.dismiss();
        }}
        style={{flex: 1}}
      />
      <View style={styles.content}>
        <View style={[styles.day_details,details_color.bkg]}>
          <View style={{flexDirection: "row"}}>
            <Text style={[styles.date,details_color.elm]}>{date}</Text>
            <Text style={[styles.month,details_color.elm]}>{month}</Text>
          </View>
          <View>
            <Text style={[styles.day,details_color.elm]}>{day}</Text>
            <Text style={[styles.year,details_color.elm]}>{year}</Text>
          </View>
        </View>
        {is_after_launch && is_before_tommorow && (
          <TouchableOpacity
            style={[styles.see_posts,button_color.bkg]}
            onPress={() => {
              props.onSeePostPress(epochMillisec);
            }}
          >
            <Text style={[styles.see_posts_text,button_color.elm]}> See Posts </Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={() => {
          props.dismiss();
        }}
        style={{flex: 1}}
      />
    </View>
  );
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
    margin: 5,
    padding: 5,
    minWidth: "80%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  see_posts_text: {fontSize: 18, fontWeight: "600"},
});
