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

export default function PostDetails(props = {photos: []}) {
  const post_link = "IB::"+props.post?.id;
  const photos = props.post?.data?.photos;
  const window_height = Dimensions.get("window").height;
  const [current_photo_index, setCurrentPhotoIndex] = useState(0);
  const inner_styles = StyleSheet.create({
    photo_page: {
      justifyContent: "center",
      alignItems: "center",
    },
  });
  const minImageHeight = photos.length>0?200:0;
  const getPhotoHeight = (photo) => {
    if (photo) {
      const aspect_ratio = photo.height ? photo.height / photo.width : 1;
      const height = Dimensions.get("screen").width * aspect_ratio;
      return height < window_height ? height : window_height;
    } else {
      return minImageHeight;
    }
  };

  const [imageHeight, setImageHeight] = useState(
    props.index >= 0
      ? getPhotoHeight(photos[props.index])
      : photos.length > 0
      ? minImageHeight
      : 0
  );

  const scrollView_height = window_height - imageHeight;
  const string_time = millisecToString(Date.now() - props.post?.data?.time);

  const [optionsIsVisible, setOptionsIsVisible] = useState(false);
  
  const [showComments,setShowComments] = useState(false);
  
  const [traffic,setTraffic] = useState(reactionToString(props.post?.data?.traffic||0));
  const [hearts,setHearts] = useState(reactionToString(props.post?.data?.hearts||0));
  const [comments,setComments] = useState(reactionToString(props.post?.data?.comment_count||0));
  
  const isFocused = useIsFocused();

  useEffect(() => {
    setImageHeight(
      imageHeight == minImageHeight
        ? minImageHeight
        : getPhotoHeight(photos[current_photo_index])
    );
  }, [current_photo_index]);
  
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
    if (imageHeight == minImageHeight)
      setImageHeight(getPhotoHeight(photos[current_photo_index]));
    else setImageHeight(minImageHeight);
  };

  const getImages = () => {
    return photos.map((value, index, array) => {
      const height = getPhotoHeight(value);
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
    if(props.post?.data?.poster?.data?.level>1){
      loadInterstitialAd();
    }
  },[])

  return (
    <View style={styles.main}>
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
        />
      </Modal>
      {photos.length > 0 && (
        <Image source={photos[0]} style={styles.background_image} />
      )}
      {photos.length > 0 && (
        <View style={{height: imageHeight, paddingBottom: 5}}>
          <PagerView
            style={styles.top_pagerView}
            initialPage={props.index}
            onPageSelected={(event) =>
              setCurrentPhotoIndex(event.nativeEvent.position)
            }
            children={getImages()}
          />
          <TouchableOpacity
            style={styles.floating_toggle}
            onPress={toggleFloatingButton}
          >
            <Ionicons
              name={imageHeight == minImageHeight ? "caret-down" : "caret-up"}
              size={40}
              color={"#fff5"}
            />
          </TouchableOpacity>
        </View>
      )}
      <View>
        <ScrollView
          style={{
            height: scrollView_height,
          }}
        >
          <View style={styles.text_view}>
            <Text style={styles.text}>{props.post?.data?.text}</Text>
          </View>
          <View style={styles.links}>
            {props.post?.data?.links?.map((link, index, array) => {
              return <Link {...link} key={index} />;
            })}
          </View>
          <View
            style={styles.author_view}
            pointerEvents={props.post?.data?.poster?.data ? "auto" : "none"}
          >
            <TouchableOpacity
              style={styles.author_image_button}
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
                <Text style={styles.author}>Author :</Text>
                <Text style={styles.author_username}>
                  {props.post?.data?.poster?.data?.username}
                </Text>
              </View>
              <Text style={styles.time}>{string_time}</Text>
              <Text style={styles.time}>
                {new IBDate(new Date(props.post?.data?.time)).toText(true)}
              </Text>
              <Text style={styles.time}>
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
          <View style={{
          backgroundColor:"#fff",
          margin:5,
          padding:2,
          borderRadius:5
          }}>
          <View
            style={{
              flexDirection:"row",
              justifyContent:"flex-end"
            }}
          >
            <TouchableOpacity style={styles.post_props}>
              <Ionicons name="heart-outline" size={20}/>
              <Text style={styles.post_props_text}>{hearts}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.post_props}>
              <Ionicons name="stats-chart-outline" size={20}/>
              <Text style={styles.post_props_text}>{traffic}</Text>
            </TouchableOpacity>
          <TouchableOpacity style={styles.post_props}
            onPress={()=>{setShowComments(true)}}
          >
            <Ionicons name="chatbox-outline" color="#22f" size={20}/>
            <Text style={styles.post_props_text}>{"≈"+comments}</Text>
          </TouchableOpacity>
          </View>
          { peek_comment&&(<CommentTile 
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
                color={IBTheme.defaultTextColor}
              />
            </TouchableOpacity>
            {optionsIsVisible &&(
            <View>
              <View style={{
                  backgroundColor:"#cdf",
                  paddingHorizontal:10,
                  paddingVertical:5,
                }}>
                <View style={{
                    borderWidth:1,
                    borderRadius:10,
                    margin:5,
                  }}>
                  <Text style={{
                    fontSize:10,
                    borderBottomWidth:0.5
                  }}> Post Link</Text>
                <Text style={{
                  fontStyle:"italic",
                  marginLeft:20,
                  marginRight:5,
                  marginVertical:10,
                  borderBottomWidth:2,
                }}> {post_link}</Text>
                </View>
                <View style={{
                  flexDirection:"row",
                  justifyContent:"space-between"
                }}>
                  {props.post?.data?.poster?.id==props.user?.id&&(<TouchableOpacity style={styles.options_button_text}

                  onPress={deletePost}

                  >
                    <Ionicons name="close" size={20}/>
                    <Text> Delete</Text>
                  </TouchableOpacity>)}
                  <TouchableOpacity style={styles.options_button_text}
                  onPress={()=>{copyLink(post_link)}}
                  >
                    <Ionicons name="clipboard-outline" size={25}/>
                    <Text>Copy</Text>
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
  main: {flex: 1, backgroundColor: IBTheme.backgroundColor},
  background_image: {
    width: "100%",
    height: "100%",
    position: "absolute",
    opacity: 0.3,
  },
  top_pagerView: {flex: 1, height: 100},
  floating_toggle: {
    backgroundColor: "#02f5",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 4,
    borderColor: "#fff5",
  },
  text_view: {
    backgroundColor: "white",
    margin: 5,
    padding: 5,
    borderRadius: 10,
  },
  text: {borderTopWidth: 1, borderBottomWidth: 1},
  links: {
    backgroundColor: "white",
    margin: 5,
    padding: 5,
    borderRadius: 10,
  },
  author_view: {
    backgroundColor: "white",
    margin: 5,
    padding: 5,
    borderRadius: 10,
    flexDirection: "row",
  },
  author_image_button: {
    width: 104,
    height: 104,
    backgroundColor: "blue",
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
  delete_button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: xIBTheme.tertiaryColor,
    margin: 5,
    padding: 5,
    borderRadius: 10,
  },
  options_button_text:{
    backgroundColor:"#fff",
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
