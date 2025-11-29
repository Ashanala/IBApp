import IBVideoView from './IBVideoView';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import ValueIcons from "./ValueIcons";
import ImageView from "./ImageVIew";
import USER from "../tools/constants/USER";
import React,{useState,useEffect,useContext} from "react";
import {
  millisecToString,
  reactionToString,
  starColor,
} from "../tools/functions/Tools";
import {fb} from "../tools/firebase/IBFirebase";
import CONST from "../tools/constants/CONST";
import {IBTheme} from "../tools/constants/ThemeFile";
import Link from "../tools/components/Link";
import PostDetails from "./PostContextMenu";
import {useIsFocused} from "@react-navigation/native"
import {copyLink,generateVideoThumbnail} from "../tools/functions/AppTools"
import {IBColors,ColorIndex,ColorContext,getColorStyle} from "../IBColors"
export default function PostTile(props){
  const {theme} = useContext(ColorContext);
  const isFocused = useIsFocused();
  const [post,setPost] = useState(props.post);
  const [showContextMenu,setShowContextMenu] = useState({});
  
  const [deleting_post,setDeletingPost] = useState(false);
  const [hearting_post,setHeartingPost] = useState(false);
  const [showPhoto,setShowPhoto] = useState(-1);
  const [hasHeart,setHasHeart] = useState(false);
  const [video_thumbnail,setVideoThumbnail] = useState("");
  
  const hasMedia = ()=>{
    return (post?.data.photos?.length>0)||(post?.data.videos?.length > 0);
  }
  const hasVideo = ()=>{
    return post?.data.videos?.length>0;
  }

  const loadPhotos = async ()=>{
    for (let i = 0; i < post?.data?.photos?.length; i++) {
      const path = post?.data?.photos[i];
      try {
        const url = await fb.requestFileUrl(path.uri);
        const web_photo = Object.assign({}, post?.data?.photos[i]);
        web_photo.uri = url;
        post.data.photos[i] = web_photo;
        setPost(Object.assign({},post));
      } catch {
        (reason) => {
          //CANNOT LOAD POST PHOTOS
        };
      }
    }
  }
  
  const loadVideos = async ()=>{
    if(post?.data?.videos?.length>0){
      const video = post?.data?.videos[0];
      const url = await fb.requestFileUrl(video.uri);
      const web_video = Object.assign({},video);
      web_video.uri = url;
      post.data.videos[0] = web_video;
      setPost(Object.assign({},post));
      const thumbnail = await generateVideoThumbnail(web_video.uri);
      
      setVideoThumbnail({uri:thumbnail})
    }
  }
  
  useEffect(()=>{
    
  },[isFocused])

  useEffect(()=>{
    const posterID = (post?.data?.poster?.id)||post?.data?.poster;
    fb.getDocument(["users",posterID])
      .then((doc) => {
        const poster_id = doc.id;
        const poster_data = doc.data();
        fb.requestFileUrl(poster_data.photo)
          .then(async (url) => {
            poster_data.photo = {uri: url};
            post.data.poster = {id:poster_id,data:poster_data};
            const star_list = await fb.getDocument(["users",poster_id,"stars"]);
            post.data.poster.data.stars = star_list.size;
            setPost(Object.assign({},post));
          })
          .catch((e) => {
            //CANNOT LOAD POSTER PHOTO
            poster_data.photo = CONST.default_profile_photo;
            post.data.poster = {id:poster_id,data:poster_data};
            setPost(Object.assign({},post));
          });
      })
      .catch((reason) => {
        //CANNOT GET POSTER
        post.data.poster = USER.default_user;
        setPost(Object.assign({},post));
      });
    loadPhotos();
    loadVideos();
    const hearts_link = ["posts",post?.id,"hearts"];
    fb.getDocument(hearts_link)
      .then((hearts_list) => {
        post.data.hearts = hearts_list.size;
        //console.log("Hearts : ",post?.data?.hearts);
        setPost(Object.assign({},post));
      })
      .catch((reason) => {
        //CANNOT LOAD HEARTS
      });
    if (props.user?.id) {
      hearts_link.push(props.user?.id);
        fb.getDocument(hearts_link)
        .then((doc) => {
          //console.log("Has Hearts : ",doc.exists);
          setHasHeart(doc.exists)
        })
        .catch((reason) => {
          //CANNOT CHECK HEART
        });
    }
  },[]);

  const pinPostTile = () => {
    const text_color = getColorStyle(theme,[1]);
    return (
      <TouchableOpacity
        style={pin_style.main}
        onPress={props.onPress}
        disabled={props.disabled}
      >
        <View style={[pin_style.title,{borderColor:text_color._elm}]}>
          <Text style={[{fontWeight: "800", fontStyle: "italic"},text_color.elm]}>
            {props.title}
          </Text>
        </View>
        <View style={pin_style.content}>
          {hasMedia() && (
            <View style={pin_style.image_view}>
              <Image
                source={hasVideo()?video_thumbnail:post?.data?.photos[0]}
                style={{width: "100%", height: "100%"}}
              />
              {hasVideo()&&(<View style={{position:"absolute",justifyContent:"center",alignItems:"center",left:0,right:0,top:0,bottom:0}}>
                <Ionicons name="play" size={30} color={"#fff8"}/>
              </View>)}
            </View>
          )}
          <View style={pin_style.writings}>
            <Text ellipsizeMode="tail" numberOfLines={7} style={text_color.elm}>
              {post?.data?.text}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[pin_style.poster_name,text_color.elm,{borderColor:text_color.elm}]}
            >
              {"IB:" + post?.data?.poster?.data?.username}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const navigateToUser = () => {
    props.navigation.navigate("UserPage", {
      pageUser: post?.data?.poster,
      user:props.user,
      unusubscribeUserAuth:props.unsubscribeUserAuth,
      isMainUser: post?.data?.poster?.id == props.user?.id,
    });
  };
  
  useEffect(()=>{
    const hearting = async () => {
      const poster_id = post?.data?.poster?.id;
      console.log("POSTER ID : ",poster_id);
      const heart_link = ["posts",post?.id,"hearts",props.user?.id];
      const heart_notif_doc = ["users",poster_id,"notifications","heart_"+props.user?.id+"_"+post?.id];
      const user_heart_notif_ref = ["users",poster_id];
      if (hasHeart) {
        try{
        await fb.deleteDocument(heart_link);
        await fb.deleteDocument(heart_notif_doc);
          setHasHeart(false);
          post.data.hearts = post?.data?.hearts - 1;
          setPost(Object.assign({},post));
        }
        catch(reason) {
            //CANNOT UNHEART
          }
        setHeartingPost(false);
      }
      else {
        try{
        await fb.setDocument(heart_link,{date: Date.now()});
          if(poster_id!=props.user?.id){
            const messages = [
              "❤️ Your post just got a new heart!",
              "💖 Someone loved your post!",
              "💘 New heart reaction received!",
              "💓 Another heart landed on your post!"
              ];
            await fb.setDocument(heart_notif_doc,{
              time:Date.now(),
              text:messages[Math.floor(Math.random()*4)],
              text_link:"IB::"+post?.id,
              sender:"ibapp_heart",
            },true);
            fb.incrementField(heart_notif_doc.slice(0,2),"notifs",1)
          }
            setHasHeart(true);
            post.data.hearts = post?.data?.hearts+1;
        }
        catch(error) {
            //CANNOT HEART
          }
        setHeartingPost(false);
      }
    }
    if(hearting_post) hearting();
  },[hearting_post]);

  const heartPost = () => {
    setHeartingPost(true);
  };
  
  useEffect(()=>{
    const deleting = async () => {
      try{
        console.log("Deleting...");
        await fb.deleteDocument(["posts",post?.id]);
        try{
          console.log("Clearing...");
          try{
          await fb.deleteDocument(["users",post?.data?.poster?.id,"posts",post?.id]);
          console.log("Cleared ",post.id, " from ",post?.data.poster?.id, " posts");
          }
          catch(reason){
            console.log("Error : ",reason);
          }
          console.log("Clearing Done!");
          for (let i = 0; i < post?.data?.photos?.length; i++) {
            try {
              const photo_uri = post?.data?.photos[i].uri;
              console.log("Deleting Image : ",photo_uri)
              await fb.deleteFile(photo_uri);
            } catch (error) {
              //CANNOT DELETE IMAGES
              console.log("Cannot Delete Images : ",error);
            }
            props.onDelete();
          }
        }catch(reason){
          //CANNOT CLEAR POST FROM USER
          console.log("Cannot Clear Post from user");
        }
      }catch(reason){
        //CANNOT DELETE POST
        console.log("Cannot delete post");
      }
      setDeletingPost(false);
    }
    if(deleting_post) deleting();
  },[deleting_post])
  
  const deletePost = ()=>{
    setShowContextMenu(-2);
    setDeletingPost(true);
  }

  const string_time = millisecToString(Date.now() - post?.data?.time);
  
  
  const main_color = getColorStyle(theme,[1]);
  const inner_color = getColorStyle(theme,[1,0]);
  const other_color = getColorStyle(theme,[0]);
  const other_inner_color = getColorStyle(theme);
  
  const post_available = (post?.data?.text && (post?.data?.photos || video_thumbnail));
    return (
      <View
        style={{flex: 1}}
        pointerEvents={props.disabled ? "none" : "auto"}
      >
        <Modal
          visible={isFocused&&(showContextMenu > -2)}
          onRequestClose={() => {
            setShowContextMenu(-2);
          }}
          transparent
        >
          <PostDetails
            theme={theme}
            post={post}
            user={props.user}
            index={showContextMenu}
            navigation={props.navigation}
            disableUserPicture={props.disableUserPicture}
            onDelete={deletePost}
            thumbnail={video_thumbnail}
          />
        </Modal>
        {!props.pin ? (
          <TouchableNativeFeedback
            onLongPress={() => {
              
            }}
          >
            <View style={{justifyContent: "center", alignItems: "center"}}>
              <View style={styles.body}>
                <View style={[styles.main,main_color.bkg]}>
                  <View style={[styles.header,{borderColor:main_color._elm}]}>
                    <Text style={[styles.username,main_color.elm]}>
                      {"IB:" + (post?.data?.poster?.data?.username || "ibuser")}
                    </Text>
                    <Text style={[styles.time,main_color.elm]}>{string_time}</Text>
                  </View>
                  {post?.data?.text != "" && (
                    <TouchableOpacity
                      style={[styles.text_view,inner_color.bkg]}
                      onPress={() => {
                        setShowContextMenu(-1)}}
                      onLongPress={()=>{
                        if(props.user?.id==post?.data?.poster?.id){
                        copyLink(post?.data?.text,true);
                      }}
                      }
                      disabled={!post_available}
                    >
                      <Text
                        style={[styles.text,inner_color.elm]}
                        numberOfLines={10}
                        ellipsizeMode="tail"
                      >
                        {post?.data?.text}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <ImageView
                    style={{margin: 5}}
                    source={hasVideo()?[video_thumbnail]:post?.data?.photos}
                    onSelect={(index) => {
                      setShowContextMenu(index);}}
                    thumbnail={hasVideo()}
                    disabled={!post_available}
                  />
                  {post?.data?.photos?.length>1&&<View style={{alignItems:'flex-start',marginLeft:5}}>
                    <Text style={[{fontStyle:'italic',fontWeight:'500'},main_color.elm]}>{post?.data?.photos.length+" photos."}</Text>
                  </View>}
                  <View>
                    {post?.data?.links?.map((link, index, array) => {
                      return (
                        <Link text={link.text} href={link.href} key={index} />
                      );
                    })}
                  </View>
                </View>
                <View
                  style={[styles.footer,{backgroundColor:other_color._bkg+"88"}]}
                  pointerEvents={post?.data?.poster?.data ? "auto" : "none"}
                >
                  <TouchableOpacity
                    style={[styles.details,{borderColor:other_color._elm}]}
                    disabled={props.disableUserPicture}
                    onPress={navigateToUser}
                  >
                    <Image
                      source={
                        post?.data?.poster?.data?.photo ||
                        CONST.default_profile_photo
                      }
                      style={styles.user_image}
                    />
                    <Ionicons
                      name="star"
                      size={30}
                      color={starColor(post?.data?.poster?.data?.stars)}
                      style={{position: "absolute", right: 0, bottom: 0}}
                    />
                  </TouchableOpacity>
                  <View>
                    <ValueIcons
                      color={other_inner_color}
                      clicked={hasHeart}
                      value={reactionToString(post?.data?.hearts)}
                      onPress={heartPost}
                      disabled={hearting_post||(!props.user?.data?.verified)}
                    />
                    {hearting_post && (
                      <ActivityIndicator
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: 0,
                          right: 0,
                        }}
                        color={other_inner_color._elm}
                      />
                    )}
                  </View>
                </View>
              </View>
              {deleting_post && (
                <ActivityIndicator
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: main_color._bkg+"33",
                    borderRadius: 10,
                  }}
                  size={"large"}
                  color={main_color._elm}
                />
              )}
            </View>
          </TouchableNativeFeedback>
        ) : (pinPostTile())}
      </View>
    );
}

const styles = StyleSheet.create({
  main: {
    width: "95%",
    borderRadius: 10,
    borderBottomRightRadius: 0,
    padding: 3,
    paddingBottom: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  text_view: {
    margin: 5,
    borderRadius: 10,
  },
  text: {
    textAlign: "left",
    padding: 5,
  },
  footer: {
    justifyContent: "flex-end",
    flexDirection: "row",
    alignSelf: "flex-end",
    paddingLeft: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    height: 40,
  },
  details: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    top: -15,
  },
  user_image:{
    width:50,
    height:50,
    borderRadius:25,
    position:'absolute'
  },

  body: {
    justifyContent: "center",
    alignItems: "center",
    width:"100%"
  },
  username: {
    fontStyle: "italic",
  },
  time: {
    fontStyle: "italic",
  },
});

const pin_style = StyleSheet.create({
  main: {
    flex: 1,
    borderRadius: 10,
  },
  title: {
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    margin: 2,
    marginBottom: 5,
  },
  content: {
    flexDirection: "row",
    flex: 1,
    padding: 2,
  },
  image_view: {
    height: "100%",
    flex: 1,
  },
  writings: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "column",
    flex: 1,
  },
  poster_name: {
    fontStyle: "italic",
    borderBottomWidth: 1,
    alignSelf: "flex-end",
  },
});
