import Link from '../tools/components/Link';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  ToastAndroid,
  StyleSheet
} from "react-native";
import React,{useContext,useState,useEffect,useRef} from "react";
import {AppContext} from "../AppContext"
import MessageTile from "./MessageTile"
import {fb} from "../tools/firebase/IBFirebase"
import AsyncStorage from "@react-native-async-storage/async-storage";
import {generateColor} from "../tools/functions/Tools"
import {BannerAd, BannerAdSize} from "react-native-google-mobile-ads";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons"
import {IBColors,ColorIndex,ColorContext,getColorStyle} from "../IBColors"

export default function MessageView(props){
  const {user,setShowNavHandle} = useContext(AppContext);
  const {theme} = useContext(ColorContext)
  console.log("Hey World!")
  const [messages,setMessages] = useState([]);
  const [message_count,setMessageCount] = useState(10);
  const message_unsubscribe = useRef();
  const [loading_messages,setLoadingMessages] = useState(true);
  const scrollRef = useRef();
  
  const [recepient,setRecepient] = useState(props.route.params?.recepient)
  const [message_text,setMessageText] = useState();
  const [sendingMessage,setSendingMessage] = useState(false)
  const [first_time,setFirstTime] = useState(true);
  const banner_ad_id = "ca-app-pub-9335898231322005/8503385594";
  const test_banner_ad_id = "ca-app-pub-3940256099942544/9214589741";
  
  useEffect(()=>{
    setShowNavHandle(false) 
  })
  
  const getMessageColor = async (sender)=>{
      console.log("Sender : ",sender);
      const c = await AsyncStorage.getItem(sender);
      if(c==null){
        console.log("Creating New Color... : ",sender);
        const color_index = await AsyncStorage.getItem("message_color");
        var new_color_index = 1;
        if(color_index!=null){
          new_color_index = parseInt(color_index)+1;
        }
        await AsyncStorage.setItem("message_color",new_color_index.toString());
        const new_color = generateColor(new_color_index);
        await AsyncStorage.setItem(sender,new_color);
        console.log("New Color : ",new_color);
        return new_color;
      }
      else{
        console.log("OLD COLOR : ",c);
        return c;
      }
    }
  
  useEffect(()=>{
    if(user){
      console.log("USER ID MSG : ",user?.id);
      if(typeof message_unsubscribe.current === "function")
        message_unsubscribe.current();
      setLoadingMessages(true);
      message_unsubscribe.current = fb.onMessagesSnapshot(user.id,message_count,async(snapshot)=>{
        const message_list = [];
        console.log("Hello")
        const docs = snapshot.docs;
        setLoadingMessages(false);
        for(let i = 0;i<docs.length;i++){
          const doc = docs[i];
          console.log(" Doc : ",doc.data());
          const message = doc.data();
          message.color = await getMessageColor(message.sender);
          message.id = doc.id;
          message_list.push(message);
        }
        setMessages(message_list);
      });
    }
  },[message_count,user])
  
  useEffect(()=>{
    if(user){
      if(first_time){
        if(user.data.notifs>0)
          fb.setDocument(["users",user?.id],{notifs:0},true);
      if(messages.length>0&&scrollRef.current)
      scrollRef.current.scrollToEnd({animated:true})
      setFirstTime(false);
      }
    }
  },[user])
  
  const main_color = getColorStyle(theme)
  const header_color = getColorStyle(theme,[0]);
  const ext_color = getColorStyle(theme,[1])
  
  return (<View style={[styles.main,main_color.bkg,{borderColor:main_color._elm}]}>
    <SafeAreaView
      style={styles.banner_ad}
      edges={["left", "right", "top"]}
    >
      <BannerAd unitId={banner_ad_id} size={BannerAdSize.BANNER} />
    </SafeAreaView>
    <View style={[styles.header,header_color.bkg]}>
      <Text style={[styles.header_text,header_color.elm]}> Messages </Text>
      {sendingMessage&&(<ActivityIndicator style={{marginRight:5}} color={header_color._elm} />)}
    </View>
    {!loading_messages?(messages.length>0?(
    <ScrollView ref={scrollRef} onTouchStart={()=>{setRecepient(undefined)}}>
      <TouchableOpacity style={[styles.see_more,ext_color.bkg]} onPress={()=>{
        setMessageCount((msg_count)=>msg_count+5);
      }}>
        <Text style={{color:ext_color._elm}}> See more...</Text>
      </TouchableOpacity>
      {
        messages.map((message,index)=>{
          return <MessageTile key={index} {...message}  onRespond = {()=>{
            setRecepient({
              id:"IB:"+message.sender_id,
              name:message.sender});
          }}/>
        }).reverse()
      }
      <View style={{height:50}}/>
    </ScrollView>):(<View style={styles.no_message}>
      <Text style={[styles.no_message_text,main_color.elm]}> No Messages</Text>
    </View>)):(
    <View style={styles.loading_message}>
      <ActivityIndicator color={main_color._elm}/>
      <Text style={[styles.loading_message_text,main_color.elm]}>Loading Messages...</Text>
    </View>)}
    {recepient?.id&&(<View style={{}}>
      <Link href={recepient.id||""} text="See Profile Page"/>
      <View style={[styles.input_view,ext_color.bkg]}>
      <TextInput style={[styles.input,{borderColor:ext_color._elm,color:ext_color._elm}]} multiline onChangeText={setMessageText}/>
      <TouchableOpacity onPress={()=>{
        if(message_text!=""){
        const msg = message_text;
        setSendingMessage(true);
        setMessageText("");
        setRecepient(undefined);
          const msg_time = Date.now().toString();
          const recepient_id = recepient.id.slice(3);
          const recepient_name = recepient.name;
          console.log("Recepient_id : ",recepient_id);
          fb.sendMessage(user.id,user.data?.username,recepient_id,recepient_name,msg,msg_time).then(async()=>{
          await fb.sendMessage(
            user.id,
            user.data?.username,
            user.id,
            recepient_name,
            msg,msg_time);
            ToastAndroid.show("Message Sent!",ToastAndroid.SHORT)
            setSendingMessage(false);
          }).catch((reason)=>{
            console.log("Can't send message : ",reason);
            ToastAndroid.show("Can't Send Message!!!",ToastAndroid.SHORT);
            setSendingMessage(false);
          });
        }
      }}>
        <Ionicons name="send" color={ext_color._elm} size={50}/>
      </TouchableOpacity>
    </View></View>)}
  </View>)
}

const styles = StyleSheet.create({
  main :{
    flex:1,
  },
  banner_ad:{
    justifyContent:"center",
    alignItems:"center"
  },
  header : {
      height:50,
      justifyContent: 'space-between',
      alignItems:"center",
      flexDirection: 'row',
      borderBottomWidth: 2,
    },
  header_text:{
        fontSize:20,
        fontWeight:'600',
      },
  see_more : {
        justifyContent: 'center',
        alignItems:'center',
        },
  no_message : {
      justifyContent: 'center',
      alignItems:'center',
      flex:1,
    },
  no_message_text:{
        fontWeight:"500"
      },
  loading_message:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },
  loading_message_text:{
    fontWeight:"500",
    fontStyle:"italic"
  },
  input_view:{
    flexDirection:'row',
    alignItems:'center',
    marginTop:5,
    paddingBottom:5
  },
  input : {
        flex:1,
        borderWidth:1,
        borderRadius:5, 
        padding:10,
        margin:5,
        borderColor:"#fff",
        maxHeight:100,
      }
})