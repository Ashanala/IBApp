import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ToastAndroid,
  StyleSheet
} from "react-native"
import {Ionicons} from "@expo/vector-icons"
import {useState,useContext} from "react"
import {AppContext} from "../../AppContext"
import {IBColors,ColorIndex,getColorStyle} from "../../IBColors"
export default function NavLink(props){
  const {user} = useContext(AppContext);
  const main_color = getColorStyle(props.theme,[1]);
  return (
  <TouchableOpacity style={[styles.main,main_color.bkg]}
    onPress={props.onPress}>
    {props.children}
    <Ionicons name={props.icon} size={25} color={main_color._elm}/>
   {props.tip_condition&&( <Text style={[styles.text,props.tip_color&&{backgroundColor:
   props.tip_color},main_color.bkg,main_color.elm]}>{props.tip}</Text>)}
  </TouchableOpacity>);
}

const styles = StyleSheet.create({
  main:{
    backgroundColor:IBColors.layer[ColorIndex.DISTINCT],
    borderRadius:25,
    padding:10,
    justifyContent:"center",
    alignItems:"center"
  },
  text:{
    position:"absolute",
    backgroundColor:IBColors.layer[ColorIndex.DISTINCT],
    top:-5,
    left:-5,
    color:"#fff",
    fontSize:10,
    width:20,
    height:20,
    borderRadius:10,
    textAlign:"center",
    fontWeight:"600"
    }
})