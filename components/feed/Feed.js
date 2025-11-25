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
  Dimensions,
  FlatList
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
import FeedType,{FeedQueryMode} from "./FeedType";
import {IBTheme} from "../tools/constants/ThemeFile";
import PostInput from "./PostInput";
import {Ionicons} from "@expo/vector-icons";
import {AppContext} from "../AppContext";
import {IBColors,ColorIndex,ColorContext,getColorStyle} from "../IBColors"

export default function Feed(props){
  const {user,setShowNav} = useContext(AppContext);
  const {theme} = useContext(ColorContext)
  const {type,data} = props.route.params;
  const [post_loading,setPostLoading] = useState(true);
  const [postLoad_error,setPostLoadError] = useState(false);
  const [adding_new_posts,setAddingNewPosts] = useState("NONE"); //[NONE,ADDING,FINISHED]
  const [post_list,setPostList] = useState([]);
  const [show_postInput,setShowPostInput] = useState(false);
    
  const loadInitial = () => {
    const size = 5;
    console.log("DATA : ",data);
    console.log("TYPE : ",type);
    return fb.onPostSnapshot(type,data,5,(snapshot) => {
      ////console.log("PoSt List : ",post_list);
      const postLoadError = false;
      setPostList((old_list)=>{
        let new_list = [...old_list];
        snapshot.docChanges().forEach((value, index, array) => {
          const post = {id:value.doc?.id, data:value.doc?.data()};
          switch (value.type) {
            case "added":
              if(!new_list.find(item=> (item.id==post.id))){
                  new_list.push(post);
              }
              break;
            case "removed":
              new_list = new_list.filter(item=>(item.id!=post.id));
              break;
          }
        });
        //console.log("Post List : ",post_list);
        //console.log("Old List : ",old_list);
        //console.log("List : ", new_list);
        if(post_loading)
        setPostLoading(false);
        return new_list;
      })
    });
  };

  useEffect(() => {
    const unsubscribe_post = loadInitial();
    const unsubscribe_ad  = loadInterstitialAd();
    
    if(user?.id&&data?.poster){
      fb.updateDocument(["users",user.id,"starred",data.poster],{time:Date.now()}).then(()=>{
        console.log("Updated User Starred!");
      }).catch((error)=>{
        console.log("Cannot Update User Starred : ",error);
      });
    }
    return ()=>{
      unsubscribe_ad();
      if(typeof unsubscribe_post === 'function')
      unsubscribe_post();
    }
  },[]);
  
  const renderItem = ({item,index})=>{
    const value = item;
    return (<View style={{margin: 5}}>
          <PostTile
            theme = {theme}
            post = {value}
            disable={adding_new_posts!="ADDING"}
            navigation={props.navigation}
            user = {user}
            disableUserPicture={type == FeedType.USER}
            onDelete={() => {
              const updatedList = post_list.filter((_,i)=>i!=index);
              setPostList(updatedList);
            }}
          />
        </View>);
  }

  const addNewPosts = (top) => {
    if (top||adding_new_posts=="NONE") {
      setAddingNewPosts("ADDING");
      const top_post_time = post_list[0].data.time;
      const bottom_post = post_list[post_list.length - 1].data;
      const bottom_post_time =
      bottom_post.time;
      const new_data = {...data,epochMillisec : top?top_post_time:bottom_post_time,traffic:bottom_post.traffic};
      //console.log("New Data : ",new_data);
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
            setAddingNewPosts("NONE");
        } else {
          console.log("Empty Query");
          setAddingNewPosts("FINISHED")
        }
        setPostList(post_list);
      })
      .catch((reason) => {
        setAddingNewPosts("NONE");
      });
    }
  };
  
  const main_color = getColorStyle(theme);
  const content_color = getColorStyle(theme,[1]);
  
  const addNewPostsView = (top, key) => {
    return post_list.length > 0 ? (
      <TouchableOpacity
        style={{
          backgroundColor: content_color._bkg,
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
        <Text style={{fontStyle: "italic", fontWeight: "600",color:content_color._elm}}>
          See more...
        </Text>
        {adding_new_posts=="ADDING" && <ActivityIndicator color={content_color._elm} />}
      </TouchableOpacity>
    ) : null;
  };
  return (
    <View
      style={[styles.main,main_color.bkg]}
      onTouchStart={()=>{setShowNav(false)}}
      pointerEvents={post_loading ? "none" : "auto"}
    >
      {!post_loading &&
        (post_list.length > 0 ? (
          <FlatList
            data={post_list}
            keyExtractor={(item)=>item.id}
            renderItem={renderItem}
            ListHeaderComponent={type==FeedType.DAY&&addNewPostsView(true)}
            ListFooterComponent={(adding_new_posts!="FINISHED")&&addNewPostsView(false)}
            contentContainerStyle={{paddingBottom:5}}
            onEndReached={()=>{
              addNewPosts(false);
            }}
            onEndReachedThreshold={0.5}
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
      {post_loading && (
        <View
          style={[styles.post_loading,content_color.bkg]}
        >
          <ActivityIndicator color={content_color._elm+"33"} size="large" />
          <Text style={{color: content_color._elm}}>Loading posts ...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: IBColors.background[ColorIndex.BASIC],
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
    backgroundColor: IBColors.background_alpha[ColorIndex.BASIC],
  },
  no_posts:{
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: IBColors.alert[ColorIndex.BASIC],
    justifyContent: "center",
    alignItems: "center",
  }
});
