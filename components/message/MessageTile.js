import {View,Text,TouchableOpacity,Alert,ToastAndroid} from "react-native"
import {navigateToUser_ID,navigateToPost_ID} from "../RootNavigator"
import {isIBUser,isIBPost} from "../tools/components/Link"
import {millisecToString} from "../tools/functions/Tools"
import {castSenderName} from "../tools/functions/AppTools"
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useState,useEffect,useContext} from "react"
import {AppContext} from "../AppContext"
import {fb} from "../tools/firebase/IBFirebase"
import {IBColors,ColorIndex,ColorContext,getColorStyle} from "../IBColors"
export default function MessageTile(props){
  console.log("Text : ",props.text)
  const color_value = 4;
  const color = props.color||"#fff";
  console.log("Color : ",color);
  const {user} = useContext(AppContext);
  const {theme} = useContext(ColorContext)
  const isMainUserMsg = (props.sender_id==user.id);
  const sender = castSenderName(props.sender);
  const showMessageOptionsAlert = () => {
    Alert.alert(
      "📨 Message Options", // Title
      "🤔 What would you like to do with this message?\n", // Message
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
        !isMainUserMsg&&({
          text: "👤 View Source",
          onPress: () => {
            if(!isMainUserMsg){
              if(isIBUser(props.text_link))
              navigateToUser_ID(props.text_link.slice(3),false)
              else if(isIBPost(props.text_link))
                navigateToPost_ID(props.text_link.slice(4));
            }
          }
        }),
        !isMainUserMsg&&!sender.isIBApp&&({
          text:"💬 Reply",
          onPress:()=>{
            if(!isMainUserMsg) props.onRespond()
          },
        })
      ],
      { cancelable: true }
    );
  };
  
  const main_color = getColorStyle(theme,[2]);
  const chat_color = getColorStyle(theme,[2,0]);
  return (
    <View style={[{
      margin:1,
      padding:5,
    },main_color.bkg]}>
      <View style={{padding:3, flexDirection:"row",justifyContent:"space-between"}}>
        <Text style={[{
          fontStyle:'italic',
          fontSize:15,
          fontWeight:isMainUserMsg?"900":"700",
        },main_color.elm]}>{!isMainUserMsg?(sender.name):("YOU to "+props.receiver)}</Text>
        <Text style={[{
          fontStyle:"italic",
        },main_color.elma("88")]}>{millisecToString(Date.now()-props.time)}</Text>
      </View>
      <TouchableOpacity style={[{
        flexDirection:"row",
        borderRadius:5,
        marginLeft:isMainUserMsg&&'auto',
        marginRight: !isMainUserMsg&&'auto',
      },chat_color.bkg]} 
      onLongPress={()=>{
      if(!isMainUserMsg&&!sender.isIBApp) props.onRespond();
      }}
      onPress={showMessageOptionsAlert}>
        {!isMainUserMsg&&<View style={{
          backgroundColor:color,
          width:5,
          borderTopRightRadius:10,
          marginTop:1,
        }}/>}
        <View style={{
          padding:10,
        }}>
          <Text style={chat_color.elm}>{props.text}</Text>
        </View>
        {isMainUserMsg&&<View style={{
          backgroundColor:color,
          width:5,
          borderTopLeftRadius:10,
          marginTop:1,
        }}/>}
      </TouchableOpacity>
    </View>
    )
}