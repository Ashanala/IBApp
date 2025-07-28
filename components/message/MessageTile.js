import {View,Text,TouchableOpacity,Alert,ToastAndroid} from "react-native"
import {navigateToUser_ID,navigateToPost_ID} from "../RootNavigator"
import {isIBUser,isIBPost} from "../tools/components/Link"
import {millisecToString} from "../tools/functions/Tools"
import {castSenderName} from "../tools/functions/AppTools"
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useState,useEffect,useContext} from "react"
import {AppContext} from "../AppContext"
import {fb} from "../tools/firebase/IBFirebase"
export default function MessageTile(props){
  console.log("Text : ",props.text)
  const color_value = 4;
  const color = props.color||"#fff";
  console.log("Color : ",color);
  const {user} = useContext(AppContext);
  
  const isMainUserMsg = (props.sender_id==user.id);
  const showMessageOptionsAlert = () => {
    Alert.alert(
      "📨 Message Options", // Title
      "🤔 What would you like to do with this message?\nYou can 🗑️ delete it permanently or 👤 view the sender's details.", // Message
      [
        {
          text: "🗑️ Delete Message",
          onPress: () => {
            console.log("Message deleted"),
            fb.deleteDocument(["users",user.id,"notifications",props.id]).then(()=>{
              ToastAndroid.show("Message Deleted! ",ToastAndroid.SHORT);
            }).catch((reason)=>{
              console.log("Error!! Camnot delete message.");
            });
          },
          style: "destructive",
        },
        {
          text: "👤 View Source",
          onPress: () => {
            if(!isMainUserMsg){
              if(isIBUser(props.text_link))
              navigateToUser_ID(props.text_link.slice(3),false)
              else if(isIBPost(props.text_link))
                navigateToPost_ID(props.text_link.slice(4));
            }
          }
        },
        {
          text:"💬 Reply",
          onPress:()=>{
            if(!isMainUserMsg) props.onRespond()
          },
        }
      ],
      { cancelable: true }
    );
  };
  return (
    <View style={{
      backgroundColor:"#22f5",
      margin:1,
      padding:5,
      paddingRight:isMainUserMsg?5:50,
      paddingLeft:isMainUserMsg?50:5,
    }}>
      <View style={{padding:3, flexDirection:"row",justifyContent:"space-between"}}>
        <Text style={{
          color:"#fff",
          fontStyle:'italic',
          fontSize:15,
          fontWeight:isMainUserMsg?"900":"700",
        }}>{!isMainUserMsg?(castSenderName(props.sender)):("YOU to "+props.receiver)}</Text>
        <Text style={{
          color:"#fff8",
          fontStyle:"italic",
        }}>{millisecToString(Date.now()-props.time)}</Text>
      </View>
      <TouchableOpacity style={{
        backgroundColor: '#55f',
        flexDirection:"row",
        borderRadius:5,
      }} 
      onLongPress={()=>{
      if(!isMainUserMsg) props.onRespond();
      }}
      onPress={showMessageOptionsAlert}>
        <View style={{
          backgroundColor:color,
          width:5,
          borderTopRightRadius:10,
          marginTop:1,
        }}/>
        <View style={{
          flex:1,
          padding:5,
          backgroundColor:color+"2",
        }}>
          <Text style={{color:"#fff"}}>{props.text}</Text>
        </View>
      </TouchableOpacity>
    </View>
    )
}