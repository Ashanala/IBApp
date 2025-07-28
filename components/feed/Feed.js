import {
  ActivityIndicator,
  Linking,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";
import THEME from "../tools/constants/THEME";
import PostTile from "./post_tile";
import POST from "../tools/constants/POST";
import React, {useRef,useState,useEffect,useContext} from "react";
import LoginView from "../tools/components/LoginView";
import {fb} from "../tools/firebase/IBFirebase";
import {sendEmailVerification} from "../tools/firebase/AccountTools";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CONST from "../tools/constants/CONST";
import {loadInterstitialAd} from "../tools/AdTools"
import {feedQuery} from "../tools/functions/Tools";
import FeedType,{FeedQueryMode,getFeedTypeReverse} from "./FeedType";
import {IBTheme} from "../tools/constants/ThemeFile";
import PostInput from "./PostInput";
import {Ionicons} from "@expo/vector-icons";
import {AppContext} from "../AppContext";
  
  export default function Feed(props){
    const {user,setShowNav} = useContext(AppContext);
    const {type,data} = props.route.params;
    const [post_loading,setPostLoading] = useState(true);
    const [postLoad_error,setPostLoadError] = useState(false);
    const [adding_new_posts,setAddingNewPosts] = useState(false);
    const [post_list,setPostList] = useState([]);
    const [show_postInput,setShowPostInput] = useState(false);
    
  const loadInitial = () => {
    const size = 5;
    console.log("DATA : ",data);
    console.log("TYPE : ",type);
    const reverse = getFeedTypeReverse(type);
    return fb.onPostSnapshot(type,data,5,(snapshot) => {
      console.log("PoSt List : ",post_list);
      const postLoadError = false;
      setPostList((old_list)=>{
        let new_list = [...old_list];
        snapshot.docChanges().forEach((value, index, array) => {
          const post = {id:value.doc?.id, data:value.doc?.data()};
          switch (value.type) {
            case "added":
              if(!new_list.find(item=> (item.id==post.id))){
                if(reverse)
                  new_list.unshift(post);
                else
                  new_list.push(post);
              }
              break;
            case "removed":
              new_list = new_list.filter(item=>(item.id!=post.id));
              break;
          }
        });
        console.log("Post List : ",post_list);
        console.log("Old List : ",old_list);
        console.log("List : ", new_list);
        if(post_loading)
        setPostLoading(false);
        return new_list;
      })
    });
  };

  useEffect(() => {
    const unsubscribe_post = loadInitial();
    const unsubscribe_ad=loadInterstitialAd();
    return ()=>{
      unsubscribe_ad();
      if(typeof unsubscribe_post === 'function')
      unsubscribe_post();
    }
  },[]);

  const postList = () => {
    const length = post_list.length;
    return post_list.map((value, index, array) => {
      const post = value.data;
      return (
        <View key={value.id} style={{margin: 5}}>
          <PostTile
            post = {value}
            disable={adding_new_posts}
            navigation={props.navigation}
            user = {user}
            disableUserPicture={type == FeedType.USER}
            key={value.id + "Post"}
            onDelete={() => {
              post_list.splice(index, 1);
              setPostList(post_list);
            }}
          />
        </View>
      );
    });
  };

  const addNewPosts = (top) => {
    if (!adding_new_posts) {
      setAddingNewPosts(true);
      const top_post_time = post_list[0].data.time;
      const bottom_post_time =
      post_list[post_list.length - 1].data.time;
      const new_data = {...data,epochMillisec : top?top_post_time:bottom_post_time};
      console.log("New Data : ",new_data);
      fb.getMorePosts(type,new_data,5,top?FeedQueryMode.TOP_ADD:FeedQueryMode.BOTTOM_ADD).then((value) => {
        if (!value.empty) {
          value.docs.map((value, index, array) => {
            const post = {
              id: value.id,
              data: value.data(),
            };
            if(!post_list.find(item=>item.id==post.id)){
            if (top) post_list.unshift(post);
            else post_list.push(post);
            }
              
            });
        } else {
          console.log("Empty Query");
        }
        setAddingNewPosts(false);
        setPostList(post_list);
      })
      .catch((reason) => {
        setAddingNewPosts(false);
      });
    }
  };

  const addNewPostsView = (top, key) => {
    return post_list.length > 0 ? (
      <TouchableOpacity
        style={{
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
          padding: 5,
          borderBottomLeftRadius: top ? 20 : undefined,
          borderBottomRightRadius: top ? 20 : undefined,
          borderTopLeftRadius: top ? undefined : 20,
          borderTopRightRadius: top ? undefined : 20,
        }}
        onPress={() => {
          addNewPosts(top);
        }}
        key={key}
      >
        <Text style={{fontStyle: "italic", fontWeight: "600"}}>
          See more...
        </Text>
        {adding_new_posts && <ActivityIndicator color={"blue"} />}
      </TouchableOpacity>
    ) : null;
  };
  return (
    <View
      style={styles.main}
      onTouchStart={()=>{setShowNav(false)}}
      pointerEvents={post_loading ? "none" : "auto"}
    >
      {!post_loading &&
        (post_list.length > 0 ? (
          <ScrollView
            style={{height: "100%"}}
            children={[addNewPostsView(true, "TOP")]
              .concat(<View 
              key="posts_view"
              style={{
                minHeight:Dimensions.get("window").height-100}}>{postList()}</View>)
              .concat([addNewPostsView(false, "BOTTOM")])}
          />
        ) : (
          <View
            style={styles.no_posts}
          >
            <Text style={{fontSize: 20, color: "white", fontStyle: "italic"}}>
              No Posts
            </Text>
          </View>
        ))}
      {!post_loading &&
        type == FeedType.CONNECT && (
          <View>
            {show_postInput && (
              <PostInput user_details={user} />
            )}
          </View>
        )}
      {post_loading && (
        <View
          style={styles.post_loading}
        >
          <ActivityIndicator color="white" size="large" />
          <Text style={{color: "white"}}>Loading posts ...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: IBTheme.backgroundColor,
    flex: 1,
  },
  post_loading:{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000033",
  },
  no_posts:{
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  }
});
