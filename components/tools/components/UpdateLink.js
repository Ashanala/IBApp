
import {
  View,
  TouchableOpacity,
  Linking,
} from "react-native";

import {Ionicons} from "@expo/vector-icons"

export default function UpdateLink(props){
  
  return (
  <View style={{
    width:50,
    height:50,
    borderRadius:25,
    justifyContent:"center",
    alignItems:"center",
  }}>
    <TouchableOpacity onPress={()=>{
      console.log("Updating app with : ",props.app_update_link);
      Linking.openURL(props.app_update_link);
    }}>
      <Ionicons name="cloud-download-outline" size={40} color="#f22"/>
    </TouchableOpacity>
  </View>);
}