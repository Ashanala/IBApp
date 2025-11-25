import {View,Text,ActivityIndicator,StyleSheet} from "react-native"
import {getColorStyle} from "../IBColors"

export default function LoadIndicator(props){
  const progress = props.progress||0;
  const progress_text = Math.round(progress*100)+"%";
  const main_color = getColorStyle(props.theme,[1]);
  return <View style={[styles.main,main_color.bkg]}>
    <ActivityIndicator size={35} color={main_color._elm}/>
    <Text style={[styles.text,main_color.elm]}> {progress_text} </Text>
  </View>
}

const styles = StyleSheet.create({
  main : {justifyContent:"center",alignItems:"center",backgroundColor:"#22f",padding:10,borderRadius:27.5},
  text : {fontSize:10,position:'absolute',color:"#fff",fontWeight:"500"}
})