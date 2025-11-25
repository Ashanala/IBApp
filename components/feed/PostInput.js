import IBVideoView from './IBVideoView';
import {useEffect, useState,useContext} from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import ImageView from "./ImageVIew";
import {Ionicons} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {IBTheme, xIBTheme} from "../tools/constants/ThemeFile";
import POST from "../tools/constants/POST";
import {loadVisualMedia} from "../tools/MediaTools";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {fb} from "../tools/firebase/IBFirebase";
import LinkCreatorView from "./LinkCreatorView";
import Link from "../tools/components/Link";
import {AppContext} from "../AppContext"
import {loadRewardAd} from "../tools/AdTools"
import {IBColors,ColorIndex,ColorContext,getColorStyle} from "../IBColors"
export default function PostInput(
  props = {
    user_details: {
      id: "",
      data: {
        username: "",
        email: "",
        password: "",
        photo: "",
        time: Date.now(),
        verified: false,
        quota: {count: ".", time: 0},
      },
    },
  }
) {
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState(POST.default_post);
  const [post_photos, setPostPhotos] = useState([]);
  const [post_videos,setPostVideos] = useState([]);
  const [post_text, setPostText] = useState("");
  const [post_links, setPostLinks] = useState([]);
  const [showLinkCreator, setShowLinkCreator] = useState(false);
  const {user,uploading_progress,setUploadingProgress,uploadPostRef,setShouldUploadPost} = useContext(AppContext)
  const {theme} = useContext(ColorContext)
  const quota_count = user?.data?.quota?.count||0;
  
  const correctMediaSrc = (media_url) => {
    return (
      user.id +
      "/" +
      media_url.substring(media_url.lastIndexOf("/") + 1, media_url.length)
    );
  };

 const correctMediaUri = (media_uri) => {
    const requiredProps = ["uri", "width", "height","type"];
    return Object.assign(
      {},
      ...requiredProps.map((key) => ({
        [key]: key == "uri" ? correctMediaSrc(media_uri[key]) : media_uri[key],
      }))
    );
  };

  const merge = async (key, array) => {
    const result = await AsyncStorage.getItem(key);
    const new_data = {};
    var count = 0;
    if (result) 
      count = Object.keys(JSON.parse(result)).length;
    for (let i = 0; i < array.length; i++) 
      new_data[count + i] = array[i];
    const new_count = count + array.length;
    await AsyncStorage.mergeItem(key, JSON.stringify(new_data));
  };

  const cacheMedia = async () => {
    if(post.photos?.length>0)
    await merge("media_cache", post.photos);
    if(post.videos?.length>0)
    await merge("media_cache",post.videos);
  };

  const cachePost = async () => {
    console.log("Caching Post ... ", post);
    await merge("data_cache", [post]);
  };

  const uploadVisualMedia = async() => {
    const result = await AsyncStorage.getItem("media_cache");
    if (result) {
      const media_list = JSON.parse(result);
      const media_count = Object.keys(media_list).length;
      for (let i = 0; i < media_count; i++) {
        const file_toupload = correctMediaUri(media_list[i]);
        await fb.uploadFile(file_toupload.uri, media_list[i].uri);
        console.log("MEDIA count : ",media_count);
        incrementProgress(0.5/media_count);
        console.log("UPLOADING MEDIA : (",file_toupload.uri,", ",media_list[i].uri);
        delete media_list[i];
        await AsyncStorage.setItem("media_cache",JSON.stringify(media_list));
        incrementProgress(0.5/media_count);
      }
    }
  };

  const uploadPostData = async () => {
    const posts = await AsyncStorage.getItem("data_cache");
    if (posts) {
      const posts_list = JSON.parse(posts);
      const post_count = Object.keys(posts_list).length;
      console.log("Cache : ", posts_list);
      for (let i = 0; i < post_count; i++) {
        const index = i;
        const post = posts_list[index];
        console.log("Post : ", post);
        post.photos = post.photos.map((value, index, array) =>
            correctMediaUri(value)
          );
        post.videos = post.videos.map((value)=> correctMediaUri(value));
        const doc = await fb.addDocument(["posts"],post);
        console.log("DOC : ",doc);
        console.log("Doc ID : ",doc.id);
        let new_quota_count =(quota_count||0) - (post.photos.length||0) - (post.links.length||0) - ((2*post.videos.length||0));
        new_quota_count = new_quota_count > 0 ? new_quota_count : 0;
        console.log("NEW QUOTA COUNT : ",new_quota_count)
        await fb.updateDocument(["users",user.id],{quota:{time:Date.now(),count:new_quota_count}});
        console.log("Quota Updated (After image sent) : ",new_quota_count);
        await fb.setDocument(["users",user.id,"posts",doc.id],{time: Date.now()});
        delete posts_list[index];
        incrementProgress(0.5/post_count);
        await AsyncStorage.setItem("data_cache",JSON.stringify(posts_list));
        incrementProgress(0.5/post_count);
      }
    }
  };

  const getMaxPhotoCount = ()=>{
    let photo_count = 4;
    if(quota_count < 4)
      photo_count = quota_count;
    return photo_count;
  }
  
  const loadMedia =  (is_video)=>{
    setLoading(true);
    loadVisualMedia({
      type: is_video?"videos":"images",
      limit: is_video?1:getMaxPhotoCount(),
      onLoaded: (files) => {
        console.log("Loaded : ",files);
        if(is_video){
          setPostPhotos([]);
          setPostVideos(files);
        }
        else{
          setPostVideos([]);
          setPostPhotos(files);
        }
        setLoading(false);
      },
      onCancel: () => {
        console.log("Cancelled")
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };
  
  const clearProgress = ()=>{
    setUploadingProgress(0);
  }
  
  const incrementProgress = (fraction)=>{
    setUploadingProgress((p)=> {
      return (p+normalized_progress(fraction||1));
    });
  }

  const uploadPost = async ()=>{
    incrementProgress();
    try{
      if (post.photos.length+post.videos.length > 0) {
        await cacheMedia();
        incrementProgress();
        await cachePost();
        incrementProgress();
        await uploadVisualMedia();
        incrementProgress();
        await uploadPostData();
        incrementProgress();
      } else{
        await cachePost();
        incrementProgress();
        await uploadPostData();
        incrementProgress();
      }
      props.onSuccess();
    }catch(reason){
      console.log("CANNOT UPLOAD POST : ",reason);
      props.onError();
    }
    clearProgress();
    props.onFinish();
  }

  useEffect(() => {
    uploadVisualMedia(uploadPost);
  }, []);
  
  useEffect(()=>{
    console.log("Progress : ",uploading_progress);
  },[uploading_progress])
  
  const showAdsAlert = ()=>{
    Alert.alert("Quota Needed","You’ve hit zero quota for adding images or links.\n\n\tWant to watch a quick ad to earn quota and complete this action?",[
      {text:"Cancel",onPress:()=>{}},{text:"Watch AD",onPress:()=>{
        setLoading(true);
        loadRewardAd(()=>{
          setLoading(false);
          fb.setDocument(
            ["users",user.id],
            {quota:{count:quota_count+1,time:Date.now()}},true)
            .finally(()=>{setLoading(false)});
        });
      }}]);
  }
  
  const openMediaPicker = (is_video) => {
    const canAddMedia = checkQuotaFor(1);
    if (canAddMedia) {
      loadMedia(is_video);
    }
    else{
      showAdsAlert();
    }
  }
  
  const checkQuotaFor = (x)=>{
    return (getRemainingQuota() - (x - 1)) > 0;
  }
  
  const getRemainingQuota = () => {
    return (quota_count - post_links.length - post_photos.length - (2*post_videos.length));
  }
                
  const normalized_progress = (value)=>{
    return (value/(post.photos?.length+post.videos?.length>0?6:4));
  }

  const percentage_progress = (
    uploading_progress*100
  )+"%";

  const main_color = getColorStyle(theme,[0]);
  const inner_color = getColorStyle(theme,[0,0])
  const input_color = getColorStyle(theme,[0,1]);
  return (
    <View style={styles.main} pointerEvents={uploading_progress>0 ? "none" : "auto"}>
      <Modal
        visible={showLinkCreator}
        transparent
        onRequestClose={() => {
          setShowLinkCreator(false);
        }}
      >
        <LinkCreatorView
          theme = {theme}
          onCancel={() => {
            setShowLinkCreator(false);
          }}
          onSuccess={(link) => {
            setShowLinkCreator(false);
            console.log("Link : ", link);
            post_links.push(link);
          }}
        />
      </Modal>
      {loading && <ActivityIndicator color={main_color._elm} />}
      <ScrollView>
        <View style={styles.selections}>
          {post_videos.length>0?(
          <IBVideoView
            source={post_videos[0]}/>):(<ImageView
            source={post_photos}
            style={[styles.image_view,{borderColor:main_color._elm}]}
            borderWidth={2}
            padding={2}
            onSelect={(index) => {}}
          />)}
          {post_photos.length+post_videos.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setPostPhotos([]);
                setPostVideos([])
              }}
              style={{margin: 10}}
            >
              <Ionicons name="remove-circle-outline" size={30} color={main_color._elm} />
            </TouchableOpacity>
          )}
        </View>
        <View>
          {post_links.map((link, index, array) => {
            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 5,
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: inner_color.bkg,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                  console.log("Pressing Cancel")
                  const new_post_links = [];
                  for(let i = 0;i<post_links.length;i++){
                    if(i!=index)
                      new_post_links.push(post_links[i]);
                  }
                    console.log("Reduced to : ", new_post_links);
                    
                    setPostLinks(new_post_links);
                  }}
                >
                  <Ionicons
                    name="close"
                    size={30}
                    color={inner_color._elm}
                  />
                </TouchableOpacity>
                <View style={{flex: 1}}>
                  <Link text={link.text} href={link.href} />
                </View>
              </View>
            );
          })}
        </View>
        {uploading_progress>0 ? (
        <View>
          <View style={{
              width:percentage_progress,
              backgroundColor:input_color._bkg,
              height:5,
            }}>
            </View>
          <View style={styles.uploading_view}>
            <Text style={[styles.uploading_view_text,main_color.elm]}>Uploading Post</Text>
            <ActivityIndicator size={"small"} color={main_color._elm} />
          </View>
        </View>
        ) : (
          <View
            style={{
              backgroundColor: input_color._bkg,
              paddingTop: 5,
              paddingLeft: 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              {post_photos.length>=post_videos.length&&(<TouchableOpacity
                style={styles.load_image_icon}
                onPress={()=>openMediaPicker(false)}
              >
                <Ionicons
                  name="image"
                  size={40}
                  color={input_color._elm}
                />
              </TouchableOpacity>)}
              {post_videos.length>=post_photos.length&&(user?.data?.level>1)&&(<TouchableOpacity
                style={styles.load_image_icon}
                onPress={()=>openMediaPicker(true)}
              >
                <Ionicons
                  name="videocam"
                  size={40}
                  color={input_color._elm}
                />
              </TouchableOpacity>)}
              <TouchableOpacity
                styles={styles.load_image_icon}
                onPress={() => {
                  const canAddLink = checkQuotaFor(1);
                  if (canAddLink) {
                    console.log("Link Pressed!");
                    setShowLinkCreator(true);
                  }else{
                    showAdsAlert();
                  }
                }}
              >
                <Ionicons name="link" size={40} color={input_color._elm} />
              </TouchableOpacity>
              <View style={styles.quota_view}>
                <View style={styles.quota_text_view}>
                  <Text style={styles.quota_text_view_text}>
                    {getRemainingQuota()}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.postInputView}>
              <TextInput
                style={[styles.textInput,input_color.elm]}
                placeholder="Post Something ..."
                placeholderTextColor={input_color._elm}
                multiline
                value={post_text}
                onChangeText={setPostText}
              />
              <TouchableOpacity
                style={styles.send_button}
                onPress={() => {
                  if (post_text != "" || post_photos.length != 0) {
                    post.poster = user.id;
                    post.text = post_text;
                    post.photos = post_photos;
                    post.videos = post_videos;
                    post.time = Date.now();
                    post.hearts = 0;
                    post.links = post_links;
                    setPost(post);
                    setPostText("");
                    setPostPhotos([]);
                    setPostVideos([]);
                    setPostLinks([]);
                    setShouldUploadPost(true);
                    uploadPostRef.current = uploadPost;
                  }
                }}
              >
                <Ionicons name="send" size={40} color={input_color._elm} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {marginBottom: 0},
  postInputView: {
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 3,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: IBTheme.postTextColor,
    padding: 5,
    borderRadius: 10,
    color: IBColors.elements[ColorIndex.DISTINCT],
    maxHeight:200
  },
  selections: {flexDirection: "row", justifyContent: "space-between"},
  image_view: {
    borderColor: "white",
    borderRadius: 10,
    margin: 5,
  },
  uploading_view: {flexDirection: "row", justifyContent: "space-around"},
  uploading_view_text: {color: IBColors.elements[ColorIndex.BASIC], fontSize: 18, fontStyle: "italic"},
  load_image_icon: {marginHorizontal: 5},
  quota_view: {
    position: "absolute",
    left: 3,
    top: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  quota_text_view: {
    minWidth: 14,
    minHeight: 14,
    backgroundColor: IBColors.surface[ColorIndex.EXTRA],
    borderRadius: 7,
  },
  quota_text_view_text: {
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "bold",
    color: IBColors.elements[ColorIndex.BASIC],
    textAlign: "center",
  },
  send_button: {marginHorizontal: 5},
});
