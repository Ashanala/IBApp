import IBVideoView from './IBVideoView';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
  ToastAndroid,
  Modal,
} from "react-native";
import PagerView from "react-native-pager-view";
import {IBTheme, xIBTheme} from "../tools/constants/ThemeFile";
import {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {millisecToString,reactionToString, starColor} from "../tools/functions/Tools";
import Link from "../tools/components/Link";
import IBDate from "../calendar/calendar_tools/IBDate";
import CommentView from "./CommentView";
import CommentTile from "./CommentTile";
import {copyLink} from "../tools/functions/AppTools";
import {useIsFocused} from "@react-navigation/native";
import {fb} from "../tools/firebase/IBFirebase";
import {loadInterstitialAd} from "../tools/AdTools"
import {IBColors,ColorIndex,getColorStyle} from "../IBColors"

export default function PostDetails(props = {photos: [],videos:[]}) {
  const theme = props.theme;
  const post_link = "IB::"+props.post?.id;
  const photos = props.post?.data?.photos;
  const videos = props.post?.data?.videos;
  const window_height = Dimensions.get("window").height;
  const window_width = Dimensions.get("window").width;
  
  const [current_photo_index, setCurrentPhotoIndex] = useState(0);
  
  const inner_styles = StyleSheet.create({
    photo_page: {
      justifyContent: "center",
      alignItems: "center",
    },
  });
  
  const hasMedia = ()=>{
    return (videos?.length>0)||(photos?.length>0);
  }
  
  const hasVideos = ()=>{
      const has =  videos?.length>0;
      return has;
  }
  
  const minMediaHeight = hasMedia()?200:0;
  
  const getMediaHeight = (media) => {
    if (media) {
      const aspect_ratio = media.height ? media.height / media.width : 1;
      const height = window_width * aspect_ratio;
      return height < window_height ? height : window_height;
    } else {
      return minMediaHeight;
    }
  };

  const [mediaHeight, setMediaHeight] = useState(
    props.index >= 0
      ? getMediaHeight(hasVideos()?videos[0]:photos[props.index])
      : hasMedia()
      ? minMediaHeight
      : 0
  );

  const scrollView_height = window_height - mediaHeight;
  
  const string_time = millisecToString(Date.now() - props.post?.data?.time);

  const [optionsIsVisible, setOptionsIsVisible] = useState(false);
  
  const [showComments,setShowComments] = useState(false);
  
  const [traffic,setTraffic] = useState(reactionToString(props.post?.data?.traffic||0));
  const [hearts,setHearts] = useState(reactionToString(props.post?.data?.hearts||0));
  const [comments,setComments] = useState(reactionToString(props.post?.data?.comment_count||0));
  
  const isFocused = useIsFocused();

  useEffect(() => {
    setMediaHeight(
      mediaHeight == minMediaHeight
        ? minMediaHeight
        : getMediaHeight(hasVideos()?videos[0]:photos[current_photo_index])
    );
  }, [current_photo_index]);
  
  useEffect(()=>{
    console.log("Media Height : ",mediaHeight);
    console.log("Media Width : ",window_width);
  },[mediaHeight])
  
  useEffect(()=>{
    if(props.post?.data?.poster?.id!=props.user?.id){
      console.log("Diff user");
    const old_traffic = props.post?.data?.traffic||0;
    const new_traffic = old_traffic+1;
    console.log("New Traffic : ",new_traffic);
    
      fb.setDocument(["posts",props.post?.id],{traffic:new_traffic},true).catch((reason)=>{
        console.log("Traffic Update Error : ",reason)
      })
    }
  },[])
  
  const [peek_comment,setPeekComment] = useState(null);
  useEffect(()=>{
    fb.getDocuments(["posts",props.post?.id,"comments"],{field:"time",order:"desc"},1).then((comments)=>{
      comments.forEach((comment)=>{
        console.log(comment);
        setPeekComment(comment.data());
      });
    }).catch((reason)=>{
      console.log("CANNOT PEEK COMMENTS : ",reason)
    })
  },[])

  const navigateToUser = () => {
    props.navigation.navigate("UserPage", {
      pageUser: props.post?.data?.poster,
      isMainUser: props.post?.data?.poster?.id == props.user?.id,
      user:props.user,
      quota: props.quota,
    });
  };

  const deletePost = () => {
    Alert.alert("Confirm!", "Are you sure you want to delete this post?", [
      {
        text: "Yes",
        onPress: () => {
          console.log("Starting Delete");
          props.onDelete();
        },
      },
      {
        text: "No, don't delete!",
        onPress: () => {},
        isPreferred: true,
      },
    ]);
  };

  const toggleFloatingButton = () => {
    if (mediaHeight == minMediaHeight)
      setMediaHeight(getMediaHeight(hasVideos()?videos[0]:photos[current_photo_index]));
    else setMediaHeight(minMediaHeight);
  };

  const getImages = () => {
    return photos.map((value, index, array) => {
      const height = getMediaHeight(value);
      return (
        <View key={index} style={inner_styles.photo_page}>
          <Image
            source={value}
            style={{
              width: "100%",
              height: height,
            }}
          />
        </View>
      );
    });
  };
  
  useEffect(()=>{
    if(props.post?.data?.poster?.data?.level>2){
      loadInterstitialAd();
    }
  },[])
  

  const main_color = getColorStyle(theme);
  const sub_color = getColorStyle(theme,[0]);
  const panel_color = getColorStyle(theme,[1]);
  const panel_inner_color = getColorStyle(theme,[1,0])
  const other_color = getColorStyle(theme,[2]);
  const other_inner_color = getColorStyle(theme,[2,1])
  return (
    <View style={[styles.main,main_color.bkg]}>
      <Modal
        animation="slide"
        visible={isFocused&&showComments}
        transparent
        onRequestClose={()=>{
          setShowComments(false);
        }}
      >
        <CommentView onClose={()=>{setShowComments(false)}
        }
          user = {props.user}
          post = {props.post}
          navigation={props.navigation}
          onUpdate={
            (count)=>{
              
            }
          }
          theme={theme}
        />
      </Modal>
      {hasMedia() && (
        <Image source={hasVideos()?props.thumbnail:photos[0]} style={styles.background_image} />
      )}
      <View style={{height:mediaHeight, paddingBottom: 5}}>
      {photos?.length > 0 ? (
          <PagerView
            style={styles.top_pagerView}
            initialPage={props.index}
            onPageSelected={(event) =>
              setCurrentPhotoIndex(event.nativeEvent.position)
            }
            children={getImages()}
          />
      ):(
        <IBVideoView source={videos[0]} height={mediaHeight} width={window_width}/>)}
        {photos?.length>1&&(<View style={{position:'absolute',backgroundColor:main_color._bkg+"55"}}>
          <Text style={{color:main_color._elm+"88"}}> {(current_photo_index+1)+"/"+photos?.length} </Text>
        </View>)}
        <TouchableOpacity
            style={[styles.floating_toggle,{borderColor:sub_color._elm+"66",backgroundColor:sub_color._bkg+"88"}]}
            onPress={toggleFloatingButton}
          >
            <Ionicons
              name={mediaHeight == minMediaHeight ? "caret-down" : "caret-up"}
              size={40}
              color={sub_color._elm+"55"}
            />
          </TouchableOpacity>
         </View>
      <View>
        <ScrollView
          style={{
            height: scrollView_height,
          }}
        >
          <View style={[styles.text_view,panel_color.bkg]}>
            <Text style={[styles.text,panel_color.elm]}>{props.post?.data?.text}</Text>
          </View>
          <View style={[styles.links,panel_color.bkg]}>
            {props.post?.data?.links?.map((link, index, array) => {
              return <Link {...link} key={index} />;
            })}
          </View>
          <View
            style={[styles.author_view,panel_color.bkg]}
            pointerEvents={props.post?.data?.poster?.data ? "auto" : "none"}
          >
            <TouchableOpacity
              style={[styles.author_image_button,panel_inner_color.bkg]}
              disabled={props.disableUserPicture}
              onPress={navigateToUser}
            >
              <Image
                source={props.post?.data?.poster?.data?.photo}
                style={styles.author_image}
              />
            </TouchableOpacity>
            <View style={styles.author_details_view}>
              <View>
                <Text style={[styles.author,panel_color.elm]}>Author :</Text>
                <Text style={[styles.author_username,panel_color.elm]}>
                  {props.post?.data?.poster?.data?.username}
                </Text>
              </View>
              <Text style={[styles.time,panel_color.elm]}>{string_time}</Text>
              <Text style={[styles.time,panel_color.elm]}>
                {new IBDate(new Date(props.post?.data?.time)).toText(true)}
              </Text>
              <Text style={[styles.time,panel_color.elm]}>
                {new Date(props.post?.data?.time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Text>
              <Ionicons
                name="star"
                size={40}
                style={{position: "absolute", bottom: 0}}
                color={starColor(props.post?.data?.poster?.data?.stars)}
              />
            </View>
          </View>
          <View style={[{
          margin:5,
          padding:2,
          borderRadius:5
          },panel_color.bkg]}>
          <View
            style={{
              flexDirection:"row",
              justifyContent:"flex-end"
            }}
          >
            <TouchableOpacity style={styles.post_props}>
              <Ionicons name="heart-outline" size={20} color={panel_color._elm}/>
              <Text style={[styles.post_props_text,panel_color.elm]}>{hearts}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.post_props}>
              <Ionicons name="stats-chart-outline" size={20} color={panel_color._elm}/>
              <Text style={[styles.post_props_text,panel_color.elm]}>{traffic}</Text>
            </TouchableOpacity>
          <TouchableOpacity style={styles.post_props}
            onPress={()=>{setShowComments(true)}}
          >
            <Ionicons name="chatbox-outline" color={panel_inner_color._elm} size={20} color={panel_color._elm}/>
            <Text style={[styles.post_props_text,panel_color.elm]}>{"≈"+comments}</Text>
          </TouchableOpacity>
          </View>
          { peek_comment&&(<CommentTile 
            theme={theme}
            comment={peek_comment}
            isDeleting={false}
            user={props.user}
            navigation={props.navigation}
          />)}
          </View>
          <View style={styles.settings_view}>
            <TouchableOpacity
              onPress={() => setOptionsIsVisible(!optionsIsVisible)}
            >
              <Ionicons
                name="settings"
                size={40}
                color={main_color._elm}
              />
            </TouchableOpacity>
            {optionsIsVisible &&(
            <View>
              <View style={[{
                  paddingHorizontal:10,
                  paddingVertical:5,
                },other_color.bkg]}>
                <View style={{
                    borderWidth:1,
                    borderRadius:10,
                    margin:5,
                  }}>
                  <Text style={[{
                    fontSize:10,
                    borderBottomWidth:0.5
                  },other_color.elm]}> Post Link</Text>
                <Text style={[{
                  fontStyle:"italic",
                  marginLeft:20,
                  marginRight:5,
                  marginVertical:10,
                  borderBottomWidth:2,
                },other_color.elm]}> {post_link}</Text>
                </View>
                <View style={{
                  flexDirection:"row",
                  justifyContent:"space-between"
                }}>
                  {props.post?.data?.poster?.id==props.user?.id&&(<TouchableOpacity style={[styles.options_button_text,other_inner_color.bkg]}

                  onPress={deletePost}

                  >
                    <Ionicons name="close" size={20} color={other_inner_color._elm}/>
                    <Text style={other_inner_color.elm}> Delete</Text>
                  </TouchableOpacity>)}
                  <TouchableOpacity style={[styles.options_button_text,other_inner_color.bkg]}
                  onPress={()=>{copyLink(post_link)}}
                  >
                    <Ionicons name="clipboard-outline" size={25} color={other_inner_color._elm}/>
                    <Text style={other_inner_color.elm}>Copy</Text>
                  </TouchableOpacity>
                  
                </View>
              </View>
            </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {flex: 1, backgroundColor: IBColors.background[ColorIndex.BASIC]},
  background_image: {
    width: "100%",
    height: "100%",
    position: "absolute",
    opacity: 0.3,
  },
  top_pagerView: {flex: 1, height: 100},
  floating_toggle: {
    backgroundColor: IBColors.surface_alpha[ColorIndex.BASIC],
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -40,
    right: 0,
    borderWidth: 4,
    zIndex:10,
    borderColor: "#fff9",
  },
  text_view: {
    backgroundColor: IBColors.surface[ColorIndex.DISTINCT],
    margin: 5,
    padding: 5,
    borderRadius: 10,
  },
  text: {borderTopWidth: 1, borderBottomWidth: 1},
  links: {
    backgroundColor: IBColors.surface[ColorIndex.DISTINCT],
    margin: 5,
    padding: 5,
    borderRadius: 10,
  },
  author_view: {
    backgroundColor: IBColors.surface[ColorIndex.DISTINCT],
    margin: 5,
    padding: 5,
    borderRadius: 10,
    flexDirection: "row",
  },
  author_image_button: {
    width: 104,
    height: 104,
    backgroundColor: IBColors.layer[ColorIndex.DISTINCT],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 52,
  },
  author_image: {width: 100, height: 100, borderRadius: 50},
  author_details_view: {marginHorizontal: 10, flex: 1},
  author: {
    fontSize: 18,
    fontStyle: "italic",
    borderBottomWidth: 1,
  },
  author_username: {textAlign: "center", fontSize: 25, fontWeight: "600"},
  time: {fontStyle: "italic", textAlign: "right"},
  settings_view: {
    margin: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  options_button_text:{
    backgroundColor:IBColors.layer[ColorIndex.EXTRA],
    borderRadius:5,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    padding:5,
  },
  delete_button_text: {fontSize: 20, color: IBTheme.defaultTextColor},
  post_props : {
              flexDirection: 'row',
              borderWidth: 1,
              justifyContent: 'center',
              alignItems:'center',
              paddingHorizontal:  8,
            },
  post_props_text:{
    fontSize:20,
    marginHorizontal: 5,
  }
});
