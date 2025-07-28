import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  ToastAndroid,
  Alert,
  ActivityIndicator
} from "react-native"
import CommentTile from "./CommentTile"
import {Ionicons} from "@expo/vector-icons";
import {fb} from "../tools/firebase/IBFirebase";
import {createCommentNotification} from "../tools/functions/AppTools"
import {useState,useEffect,useRef} from "react";

export default function CommentView(props){
  const [comment_count,setCommentCount] = useState(5);
  const comment_unsubscribe = useRef();
  const [count_max_reached,setCountMaxReached] = useState(false);
  const [comment_text,setCommentText] = useState("");
  const [comment,setComment] = useState({
    user:props.user?.id,
    text:"",
    time:Date.now()
  });
  const [isLoading,setIsLoading] = useState(true);
  const [isLoadingMore,setIsLoadingMore] = useState(false);
  
  const [post_comments,setPostComments] = useState([]);
  
  const [is_deleting, setIsDeleting] = useState(-1);
  
  const comment_notif_doc = ["users",props.post?.data?.poster?.id,"notifications","comment_"+props.user?.id+"_"+props.post?.id]
  
  useEffect(()=>{
    if(typeof comment_unsubscribe.current==="function")
    comment_unsubscribe.current();
    comment_unsubscribe.current = fb.onCommentsSnapshot(props.post?.id,comment_count,(snapshot)=>{
        setIsLoading(false);
        setIsLoadingMore(false);
        if(snapshot?.docs.length>0){
          props.onUpdate(snapshot.docs.length);
          let p_comments = [];
          snapshot.docs.forEach((comment)=>{
            let new_comment = comment.data();
            new_comment.id = comment.id;
            console.log("Id ",new_comment.id)
            p_comments.push(new_comment);
          })
          setPostComments(p_comments);
          if(comment_count>snapshot.docs.length){ setCountMaxReached(true);
          }
          else{
            setCountMaxReached(false);
          }
        }
        else{
          setCountMaxReached(true);
          console.log("No Comments!");
        }
    });
  },[comment_count])
  
  useEffect(()=>{
    if(count_max_reached){
      console.log("COUNT MAX REACHED!");
    }
  },[count_max_reached]);
  
  const updateCommentCount = (amount)=>{
    fb.incrementField(["posts",props.post?.id],"comment_count",amount).then(()=>{
        console.log("Comment Cleared : ",new_comment_count)
      
    })
    .catch((reason)=>{
      console.log("Clear Comment Error : ",reason);
    })
  }
  
  const deleteComment = (index)=>{
    Alert.alert(
      "Delete Comment!",
      "Are you sure you want to delete this comment?",
      [
        {
          text:"Yes",
          onPress:()=>{
            console.log("Deleting");
            setIsDeleting(index);
            fb.deleteDocument(["posts",props.post?.id,"comments",post_comments[index].id]).then(()=>{
              console.log("Deleted!")
              updateCommentCount(-1);
              fb.deleteDocument(comment_notif_doc);
            }).catch(()=>{
              console.log("Error : Can't Delete!");
            }).finally(()=>{
              setIsDeleting(-1);
            })
          }
        },
        {
          text:"No, don't delete.",
          onPress:()=>{
            console.log("Delete Cancel");
          }
        }
      ]
    );
  }
          
  
  const height = Dimensions.get("screen").height;
  return (<View style={{
  flex:1}}>
    <View style={{flex:1}} onTouchStart={()=>{
    props.onClose();
    }}></View>
    <View style={styles.comment_section}>
    <ScrollView>
      {
        post_comments.map((comment,index)=>{
          return (
              <CommentTile 
                key={comment.id}
                comment={comment}
                isDeleting={index==is_deleting}
                user={props.user}
                navigation={props.navigation}
                onDelete={()=>{deleteComment(index)}}
                />
          )
        })
      }
      {!count_max_reached&&(<TouchableOpacity
        style={{
          backgroundColor:"#fff",
          justifyContent:"center",
          flexDirection:"row"
        }}
        onPress={()=>{
          setIsLoadingMore(true);
          setCommentCount(comment_count+5)
        }}
      >
        <Text style={{
          fontWeight:"600",
          fontStyle:"italic",
          marginHorizontal:5,
        }}> See more</Text>
        {isLoadingMore&&<ActivityIndicator color="#00f" />}
      </TouchableOpacity>)}
    </ScrollView>
    {props.user?.data?.verified&&(<View style={{justifyContent:"flex-end"}}>
      <View style={{flexDirection:"row",margin:5}}>
        <TextInput placeholder="Comment..."
          placeholderTextColor="#fff"
          style={styles.text_input}
          multiline
          value={comment_text}
          onChangeText = {setCommentText}
        />
        <TouchableOpacity
          onPress={()=>{
            comment.text=comment_text;
            setCommentText("");
            comment.time=Date.now();
            setComment(comment);
            console.log(comment);
            fb.addDocument(["posts",props.post?.id,"comments"],comment).then(()=>{
            updateCommentCount(1);
            const message = createCommentNotification(props.user?.data?.username,comment_text);
            fb.setDocument(comment_notif_doc,{
              time:Date.now(),
              text:message,
              text_link:"IB::"+props.post?.id,
              sender : "ibapp_comment",
            },true)
            fb.incrementField(comment_notif_doc.slice(0,2),"notifs",1);
              ToastAndroid.showWithGravity(
            "Comment Submitted!",
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM);
            }).catch((reason)=>{
            console.log("Comment Error : ",reason);
              ToastAndroid.showWithGravity(
            "Error: Cannot Submit Comment.",
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM);
            })
            
          }}
        >
          <Ionicons name="send" size={40} color="#fff"/>
        </TouchableOpacity>
      </View>
      </View>)}
    </View>
    {isLoading&&(<ActivityIndicator 
      size="large" 
      color="#fff"
      style={{
      position:"absolute",
      left:0,
      right:0,
      top:(0.2*height),
      bottom:0,
    }}
      />)}
  </View>);
}

const styles = StyleSheet.create({
  text_input : {
            borderWidth:1,
            borderColor:"#fff",
            flex:1,
            borderRadius:5,
            padding:10,
            marginBottom:5,
            marginRight:5,
            color:"#fff"
          },
  comment_section : {
      flex:4,
      justifyContent:"flex-end",
      backgroundColor:"#002a",
      borderTopLeftRadius:20,
      borderTopRightRadius:20,
      paddingTop:10,}
})