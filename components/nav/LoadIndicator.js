import {View,Text,ActivityIndicator} from "react-native"

export default function LoadIndicator(props){
  const progress = props.progress||0;
  const progress_text = Math.round(progress*100)+"%";
  return <View style={{justifyContent:"center",alignItems:"center",backgroundColor:"#22f",padding:10,borderRadius:27.5}}>
    <ActivityIndicator size={35} />
    <Text style={{fontSize:10,position:'absolute',color:"#fff",fontWeight:"500"}}> {progress_text} </Text>
  </View>
}