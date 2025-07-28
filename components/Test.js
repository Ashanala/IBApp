import IBVideoView from './feed/IBVideoView';

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
      <IBVideoView source={"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}/>
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
