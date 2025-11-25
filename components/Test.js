import SearchView from "./nav/SearchView"

import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";

export default function Test() {
  
    return (<View style={{flex: 1}}>
      <SearchView/>
    </View>);
}
const styles = StyleSheet.create({
  text: {color: "white", fontWeight: "bold", fontSize: 25},
  div: {
    backgroundColor: "blue",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
