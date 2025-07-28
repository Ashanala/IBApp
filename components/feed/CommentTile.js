import React from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableHighlight,
  StyleSheet
} from "react-native"
import {millisecToString} from "../tools/functions/Tools";
import CONST from "../tools/constants/CONST";
import {fb} from "../tools/firebase/IBFirebase";
import {useState,useEffect} from "react";

export default function CommentTile(props){
  const [comment_user,setCommentUser] = useState({})
  const [commentUser_name,setCommentUserName] = useState("ibuser");
  const [commentUser_photo,setCommentUserPhoto] = useState(CONST.default_profile_photo);
  const [finishedLoading,setFinishedLoading] = useState(false);
  
  useEffect(()=>{
    let isCurrent = true;
    fb.getDocument(["users",props.comment?.user]).then(async(doc)=>{
      const data = doc.data();
      console.log("Data : ",data);
      setCommentUserName(data.username);
      console.log("Photo : ",data.photo);
      if(data.photo){
        console.log("Loading Uri : ",data.photo);
        const photo_uri = await fb.requestFileUrl(data.photo);
        console.log("Photo Uri : ",photo_uri);
        data.photo = {uri:photo_uri};
        if(isCurrent)
        setCommentUserPhoto(data.photo);
      }
      setCommentUser({
        id:doc.id,
        data:data
      });
      setFinishedLoading(true);
    })
  },[])
  
  const navigateToUser = ()=>{
    props.navigation.navigate("UserPage",
    {
      pageUser:comment_user,
      user:props.user,
      isMainUser:comment_user.id==props.user?.id
    })
  }
  
  return (
  <View style={styles.main}>
    <View style={{
        flexDirection:"row"
      }}>
      <TouchableHighlight disabled={!finishedLoading} onPress={navigateToUser}>
      <Image source={commentUser_photo} style={styles.commentUser_photo}/>
      </TouchableHighlight>
      <TouchableHighlight 
        disabled={comment_user.id!=props.user?.id} 
        onLongPress={props.onDelete}
        style={{flex:1}}
        >
        <View
        style={styles.comment_content}>
        <View style={styles.header}>
          <Text style={styles.header_text}>
            {commentUser_name}
          </Text>
          <Text style={{color:"#fff"}}> {millisecToString(Date.now()-props.comment.time)}
          </Text>
        </View>
        <View style={{flexDirection:"row",justifyContent:"flex-start"}}>
        <View style={styles.content}>
          <Text style={{color:"#fff"}}>{props.comment.text}</Text>
        </View>
        </View>
        </View>
      </TouchableHighlight>
    </View>
    {props.isDeleting&&(<ActivityIndicator style={{
      position:"absolute",
      left:0,
      right:0,
      top:0,
      bottom:0,
      backgroundColor:"#0008"
    }} color="#fff"/>)}
  </View>);
}

const styles = StyleSheet.create({
  main : {
      margin:5,
      padding:3,
      borderRadius:5,
      backgroundColor:"#00f5",
      flex:1,
  },
  commentUser_photo:{
        width:50,
        height:50,
        borderRadius:25,
        margin:5,
      },
  comment_content:{
        flex:1,
        //justifyContent:"flex-start",
      },
  header:{
          flexDirection:"row",
          justifyContent:"space-between",
          borderColor:"#fff",
          borderBottomWidth:1,
          backgroundColor:"#00aa",
          borderTopLeftRadius:5,
          borderTopRightRadius:5,
          flex:1,
        },
  header_text:{
            marginHorizontal:5,
            paddingLeft:5,
            color:"#fff",
            fontWeight:"600"
          },
  content:{
          backgroundColor:"#00aa",
          margin:5,
          padding:5,
          borderLeftWidth:1,
          borderBottomWidth:1,
          borderRadius:5,
          borderColor:"#fff",
        },
})