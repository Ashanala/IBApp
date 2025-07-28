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
export default function NavLink(props){
  const {user} = useContext(AppContext);
  return (
  <TouchableOpacity style={styles.main}
    onPress={props.onPress}>
    {props.children}
    <Ionicons name={props.icon} size={30} color={"#fff"}/>
   {props.tip_condition&&( <Text style={[styles.text,props.tip_color&&{backgroundColor:
   props.tip_color}]}>{props.tip}</Text>)}
  </TouchableOpacity>);
}

const styles = StyleSheet.create({
  main:{
    backgroundColor:"#22f",
    borderRadius:25,
    padding:10,
    justifyContent:"center",
    alignItems:"center"
  },
  text:{
    position:"absolute",
    backgroundColor:"#22f",
    top:-5,
    left:-5,
    color:"#fff",
    fontSize:15,
    width:24,
    height:24,
    borderRadius:12,
    textAlign:"center",
    fontWeight:"600"
    }
})