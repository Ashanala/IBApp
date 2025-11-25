import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  Linking,
  TextInput
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import THEME from "../tools/constants/THEME";
import {millisecToString, starColor} from "../tools/functions/Tools";
import React,{useState,useEffect,useContext} from "react";
import LoginView from "../tools/components/LoginView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {fb} from "../tools/firebase/IBFirebase";
import {loadVisualMedia} from "../tools/MediaTools";
import CONST from "../tools/constants/CONST";
import {loadRewardAd} from "../tools/AdTools"
import UserDetailTile from "./UserDetailTile";
import {IBTheme} from "../tools/constants/ThemeFile"
import {IBColors,ColorIndex,ColorContext,getColorStyle} from "../IBColors"
import {copyLink} from "../tools/functions/AppTools"

import * as Navigation from "../RootNavigator"
import {AppContext} from "../AppContext"

export default function UserPage(props){
  const {user,setShowNav,author_request_link} = useContext(AppContext)
  const {theme} = useContext(ColorContext)
  
  
  const LOADING_ADS_START = 0;
  const LOADING_ADS_UPDATING_QUOTA = 1;
  const LOADING_ADS_DONE =2;
  
  const [pageUser,setPageUser] = useState(props.route.params.pageUser);
  const isMainUser = user?.id==pageUser?.id;
  const [show_login_modal,setShowLoginModal] = useState(false);
  const [loading_ads,setLoadingAds] = useState(LOADING_ADS_DONE);
  const [post_count,setPostCount] = useState(0);
  const [last_post_time,setLastPostTime] = useState(0);
  const [uploading_image,setLoadingImage] = useState(false);
  const [loading_stars,setLoadingStars] = useState(true);
  const [loading_post_count,setLoadingPostCount] = useState(true);
  const [loading_last_post_time,setLoadingLastPostTime] = useState(true);
  const [starred,setStarred] = useState(false);
  const [first_time,setFirstTime] = useState(true);
  const [user_info,setUserInfo] = useState(pageUser?.data?.info||"");
  const [info_editmode,setInfoEditMode] = useState(true&&isMainUser&&(user_info==""));
  
  const user_id = "IB:"+pageUser.id;
  const pageUser_name = "IB:"+pageUser?.data?.username;
  const userCanPost = user?.data?.level>0;
  const pageUserCanPost = pageUser?.data?.level>0
  
  const setStar = (star)=>{
    //////console.log("Input Star : ",star);
    const new_data = {
      ...pageUser.data,
      stars:star,
    };
    setPageUser({
        id:pageUser.id,
        data:new_data,
      });
    setLoadingStars(false);
  }
  
  const [reload_switch,switchReload] = useState(false);
  useEffect(()=>{
    if(pageUser.data){
      ////console.log("Page User Data Available");
    }else{
      ////console.log("Page User Data UNAVAILABLE");
      fb.getDocument(["users",pageUser.id]).then((doc)=>{
        const data = doc.data();
        setPageUser({id:pageUser.id,data:data});
        setUserInfo(data.info)
        switchReload(!reload_switch);
      })
    }
  },[user])
  
  useEffect(()=>{
    if(pageUser.data){
    const stars_link = ["users",pageUser.id,"stars"];
    fb.getDocument(stars_link).then((value) => {
      ////console.log("Stars : ",value.size);
      setStar(value.size);
    });
    if (user) {
        stars_link.push(user.id);
        fb.getDocument(stars_link)
        .then((doc) => {
          setStarred(doc.exists);
        });
    }
    fb.getDocument(["users",pageUser.id,"posts"])
      .then((value) => {
        setPostCount(value.size);
        setLoadingPostCount(false);
      });
    fb.getDocuments(["users",pageUser.id,"posts"],{field:"time", order:"desc"},1)
      .then((posts) => {
        const time = posts.docs[0].data().time;
        setLastPostTime(time);
        setLoadingLastPostTime(false);
      })
      .catch((reason) => {
        
      });
    fb.requestFileUrl(pageUser.data.photo).then((url)=>{
      setPageUser((pageUser) => {
        return {
          id:pageUser.id,
          data:{
            ...pageUser.data,
            photo:{uri:url}
          }
        }
      })
    })
    }
  },[reload_switch]);

  const starUser = async () => {
    if(user?.id){
      if(user?.data?.verified){
        const pageUser_star_doc = ["users",pageUser.id,"stars",user.id];
        const user_starred_doc = ["users",user.id,"starred",pageUser.id];
        const star_notif_doc = ["users",pageUser.id,"notifications","star_"+user.id+"_"+pageUser.id];
        setLoadingStars(true);
        const unstar = async ()=>{
          ////console.log("UNSTARRING...");
          await fb.deleteDocument(pageUser_star_doc);
          ////console.log("UNSTARRING___");
          await fb.deleteDocument(user_starred_doc);
          await fb.deleteDocument(star_notif_doc);
          ////console.log("DONE!");
          setStar(pageUser.data?.stars-1)
          setLoadingStars(false);
          setStarred(false);
        }
        const star = async ()=>{
          await fb.setDocument(pageUser_star_doc,{time: Date.now()});
          await fb.setDocument(user_starred_doc,{time: Date.now(),id:pageUser.id});
          
          const messages = [
          "⭐ Your account just received a new star!",
          "🌟 A shiny star was added to your account!",
          "✨ Your account got some star-powered love!",
          "💫 Someone starred your profile!"];
          await fb.setDocument(star_notif_doc,{
            time:Date.now(),
            text:messages[Math.floor(Math.random() *4)],
            text_link:"IB:"+user.id,
            sender:"ibapp_star",
          },true)
          fb.incrementField(star_notif_doc.slice(0,2),"notifs",1);
          setStar(pageUser.data?.stars +1);
          setLoadingStars(false);
          setStarred(true);
        }
        if(starred) unstar();
        else star();
      }
    }
  }

  const uploadImage = () => {
    setLoadingImage(true);
    loadVisualMedia({
      type: ['images'],
      allowsEditing: true,
      onLoaded: async (files) => {
        try{
        const filesrc = files[0].uri;
        const profile_photo_location =
        user.id + "/profile_photo/" +
        filesrc.substring(filesrc.lastIndexOf("/") + 1, filesrc.length);
        await fb.uploadFile(profile_photo_location, filesrc);
        await fb.updateDocument(["users",user.id],{photo: profile_photo_location});
        setLoadingImage(false);
          ToastAndroid.showWithGravity("Profile Photo Updated!",ToastAndroid.SHORT,ToastAndroid.BOTTOM);
        }catch(reason){
          setLoadingImage(false);
          ////console.log("CANNOT Update Profile Photo : ",reason);
          ToastAndroid.showWithGravity("Error : Cannot Update Profile Photo",ToastAndroid.SHORT,ToastAndroid.BOTTOM);
        }
      },
      onError:()=>{
        setLoadingImage(false);
      },
      onCancel:()=>setLoadingImage(false)
    });
  };
  
  const setQuota = (quota)=>{
    const new_data = {
      ...pageUser.data,
      quota:quota,
    };
    setPageUser({
      id:pageUser.id,
      data : new_data,
    });
    setLoadingAds(LOADING_ADS_DONE);
  }

  const loadAd = () => {
    setLoadingAds(LOADING_ADS_START);
    const rewardAd_unsubscribe = loadRewardAd(
    async (payload) => {
      ////console.log("HEY");
      const new_quota = {
        ...pageUser.data?.quota,
        count : (pageUser.data?.quota?.count+1)||1,
      };
      ////console.log("New Quota : ",new_quota);
      setLoadingAds(LOADING_ADS_UPDATING_QUOTA);
      await fb.setDocument(["users",user.id],{
          quota: new_quota,
        },true);
      setQuota(new_quota);
    });
    
    
    //UNSUBSCRIBE REWARD AD LISTENER
  };

  const seePosts = () => {
    Navigation.navigate({
      name: "Feed",
      params: {
        type: FeedType.USER,
        data: {
          poster: pageUser.id, 
          title: pageUser_name},
      },
    });
  };
  
  const main_color = getColorStyle(theme)
  const inner_color = getColorStyle(theme,[0]);
  const deep_color = getColorStyle(theme,[0,1]);
  return (
    <View
      style={[styles.main,main_color.bkg]}
      onTouchStart={()=>{setShowNav(false)}}
      pointerEvents={uploading_image ? "none" : "auto"}
      >
      <Modal
        visible={show_login_modal}
        transparent
        onRequestClose={() => {setShowLoginModal(false);}}
      >
        <LoginView
          theme={theme}
          navigation={Navigation}
          onCancel={() =>{ 
            setShowLoginModal(false);
          }}
          onSuccess={async (user_data) =>{ setShowLoginModal(false);
            
          }}
          onError={
            ()=>{
              setShowLoginModal(false);
            }
          }
        />
      </Modal>
      <Image
        source={pageUser.data?.photo|| CONST.default_profile_photo}
        style={styles.background_image}
      />
      <View style={styles.image_view}>
        <Image
          source={pageUser.data?.photo || CONST.default_profile_photo}
          style={styles.background_image}
        />
        <TouchableOpacity
          style={[styles.image_circle,main_color.elm]}
          disabled={!isMainUser}
          onPress={uploadImage}
        >
          <Image
            source={pageUser.data?.photo || CONST.default_profile_photo}
            style={{width: 150, height: 150, borderRadius: 75}}
          />
          {uploading_image && (
            <ActivityIndicator
              style={{position: "absolute"}}
              color={main_color.elm}
              size={"large"}
            />
          )}
        </TouchableOpacity>
      </View>
      <ScrollView>
        {(user_info!=""||isMainUser)&&(<View  style={[styles.item_style, styles.details_view,inner_color.bkga("aa")]}>
          <TouchableOpacity disabled={!isMainUser || info_editmode} style={
          [styles.tagline_view,deep_color.bkg]} onLongPress={()=>{setInfoEditMode(true)}}>
            <TextInput 
            style={[styles.tagline_text,deep_color.elm]}
            value={user_info}
            multiline={true}
            maxLength={80}
            placeholder={isMainUser?"Long press to edit your tagline (max. 80)":undefined}
            editable={info_editmode} 
            onChangeText={setUserInfo}/>
          </TouchableOpacity>
          {info_editmode&&(<TouchableOpacity style={[styles.tagline_save_button]} onPress={()=>{
            setInfoEditMode(false);
            fb.setDocument(["users",user?.id],{info:user_info},true).then(()=>{
              ToastAndroid.show("Tagline Updated!",ToastAndroid.SHORT)
            })
          }}><Ionicons name="save" color={inner_color._elm} size={20}/></TouchableOpacity>)}
        </View>)}
        <View style={[styles.item_style, styles.details_view,inner_color.bkga("aa")]}>
          <TouchableOpacity
            style={[{
              alignSelf: "flex-end",
              borderWidth: starred ? 2 : undefined,
              borderColor: starred ? "blue" : undefined,
            },deep_color.elm]}
            disabled={isMainUser || !user}
            onPress={starUser}
          >
            {!loading_stars&&(<Ionicons
              name="star"
              size={80}
              color={starColor(pageUser.data?.stars)}
            />)}
            {!isMainUser && starred && (
              <Ionicons
                name="checkmark-done"
                color={deep_color._elm}
                size={40}
                style={{position: "absolute", bottom: 0, right: 0}}
              />
            )}
          </TouchableOpacity>
          <View>
            <Text style={[styles.username,inner_color.elm]}>{pageUser_name}</Text>
            {loading_stars? (
              <ActivityIndicator color={inner_color._elm} />
            ) : (
              <Text style={[styles.stars,inner_color.elm]}>{pageUser.data?.stars} Stars</Text>
            )}
          </View>
        </View>
        <View style={[styles.item_style, styles.totals_view,inner_color.bkga("aa")]}>
          {/*<View style={[styles.extra_details,deep_color.bkg]}>
            <Ionicons name="time" size={20} style={{marginHorizontal: 10}}
            color={deep_color._elm}/>
            <Text style={[styles.extra_details_text,deep_color.elm]}>
              Joined {millisecToString(Date.now() - pageUser.data?.time)}
            </Text>
          </View>*/}
          {last_post_time > 0 && (
            <View style={[styles.extra_details,deep_color.bkg]}>
              <Ionicons
                name="timer"
                size={20}
                style={{marginHorizontal: 10}}
                color={deep_color._elm}
              />
              <Text style={[styles.extra_details_text,deep_color.elm]}>
                Last post :{" "}
                {millisecToString(Date.now() - last_post_time)}
              </Text>
            </View>
          )}
          {(pageUserCanPost)&&(
            <Ionicons name="checkmark-circle-outline" size={30} color={inner_color._elm}/>
          )
          }
        </View>

        {isMainUser && (userCanPost)&&(<UserDetailTile
            styles={styles}
            main_color={inner_color}
            inner_color={deep_color}
            buttonTitle="Watch ADs to get more quotas"
            buttonInfo="Get more quotas to post more photos"
            iconName="videocam"
            loadingAds={loading_ads==LOADING_ADS_START}
            quantity={pageUser.data?.quota?.count}
            quantityName="Quota"
            onPress={loadAd}
            is_loading_quantity={loading_ads==LOADING_ADS_UPDATING_QUOTA}
          />
        )}
        {post_count>0?(<UserDetailTile
          styles={styles}
          main_color={inner_color}
          inner_color={deep_color}
          iconName="document"
          quantity={post_count}
          quantityName="Posts"
          buttonTitle={
            ("See " + (isMainUser ? "Your" : pageUser_name) + " Posts")
          }
          buttonInfo="-"
          onPress={seePosts}
          is_loading_quantity={loading_post_count}
        />):((isMainUser)&&(!userCanPost)&&(author_request_link)&&(
          <View style={[styles.item_style, styles.totals_view,inner_color.bkga("aa")]}>
            <TouchableOpacity
              style={[styles.extra_details,deep_color.bkg]}
              onPress={()=>{
                Linking.openURL(author_request_link.link);
              }}>
              <Ionicons name="person-add-outline" size={20} color={deep_color._elm} style={{marginHorizontal:5}}/>
              <Text style={[{
                color:"#00f",
                fontStyle:"italic"
              },deep_color.elm]}>{author_request_link.title||"Join Our Authors"}</Text>
              </TouchableOpacity>
          </View>)
          )}
        <View style={[styles.item_style, styles.totals_view,inner_color.bkga("aa")]}>

          <TouchableOpacity style={[styles.extra_details,deep_color.bkg]}
          onLongPress={()=>{
            copyLink(user_id);
          }}
          >
            <Ionicons name="clipboard-outline" size={20} style={{marginHorizontal:10}} color={deep_color._elm}/>
            <Text style={[{fontSize:15},deep_color.elm]}>{user_id}</Text>
          </TouchableOpacity>
          <Text style={[{fontSize:10,fontStyle:'italic'},inner_color.elm]}> {"Long press to copy "+(isMainUser?"your":"")+" ID"}</Text>
        </View>
        {!isMainUser&&user?.id&&(<View style={[styles.item_style,styles.details_view,inner_color.bkga("aa")]}>
          <TouchableOpacity style={[{margin:5,
            flexDirection:'row',
            borderRadius:5,
            padding:5,
          },deep_color.bkg]} onPress={()=>{
            Navigation.navigateToMessages(user_id,pageUser_name)
          }}>
            <Ionicons name="chatbox" size={25} color={deep_color._elm}/>
            <Text style={[{
              fontSize:15,
              fontWeight:"500",
              fontStyle:'italic'
            },deep_color.elm]}> Send Message </Text>
          </TouchableOpacity>
        </View>)}
        {isMainUser && (
          <View style={[styles.item_style, styles.switch_account,inner_color.bkga("aa")]}>
            <TouchableOpacity
              style={styles.switch_account_button}
              onPress={() => {setShowLoginModal(true);}}
            >
              <Ionicons name="log-out" color={inner_color._elm} size={30} />
              <Text style={{color: inner_color._elm, fontSize: 15}}>
                Switch Account
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: IBColors.background[ColorIndex.DISTINCT],
  },
  image_view: {
    justifyContent: "center",
    alignItems: "center",
  },
  image_circle: {
    justifyContent: "center",
    alignItems: "center",
    width: 158,
    height: 158,
    borderWidth: 8,
    borderRadius: 79,
    borderColor: "#0af",
  },

  details_view: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  
  tagline_text:{fontStyle:"italic",textAlign:'center'},

  username: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderColor: THEME.textColor0,
    color: THEME.textColor0,
  },

  stars: {
    fontSize: 18,
    alignSelf: "center",
    fontStyle: "italic",
    color: THEME.textColor0,
  },

  totals_view: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    padding: 10,
  },

  extra_details: {
    backgroundColor: IBColors.layer[ColorIndex.EXTRA],
    flexDirection: "row",
    margin: 5,
    padding: 5,
    borderRadius: 10,
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  extra_details_text: {
    fontSize: 18,
    color: THEME.textColor1,
    fontStyle: "italic",
    fontWeight: "500",
  },

  switch_account: {
    justifyContent: "center",
    alignItems: "center",
  },
  switch_account_button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  item_style: {
    backgroundColor: IBColors.surface_alpha[ColorIndex.EXTRA],
    margin: 2,
    borderRadius: 15,
    marginBottom:10
  },

  background_image: {
    width: "100%",
    height: "100%",
    position: "absolute",
    opacity: 0.3,
  },
  
  tagline_view:{
    padding:10,
    margin:5,
    borderRadius:10,
    borderTopLeftRadius:0,
    borderBottomRightRadius:30
  },
  
  tagline_save_button : {
    justifyContent:'center',
    alignItems:'center'
  }
  
});
