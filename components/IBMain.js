
import React,{useState,useRef,useEffect,useContext} from "react"
import {NavigationContainer,useFocusEffect} from "@react-navigation/native"
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import MainPage from "./main/MainPage"
import Feed from "./feed/Feed"
import UserPage from "./profile/UserPage"
import Nav from "./nav/Nav"
import {
  View,
  Alert,
} from "react-native"

import AsyncStorage from "@react-native-async-storage/async-storage";

import {AppWrapper,AppContext} from "./AppContext"
import {notificationSettings, saveToken} from "./tools/NotificationTools";
import * as Notifications from "expo-notifications";
import {fb} from "./tools/firebase/IBFirebase";
import {getSignedInUser,getSavedUserId,signIn,verifyEmail} from "./tools/functions/UserTools"
import * as NetInfo from "@react-native-community/netinfo";
import {IBTheme} from "./tools/constants/ThemeFile";
import {sendEmailVerification} from "./tools/firebase/AccountTools"
import * as Navigation from "./RootNavigator"
import MessageView from "./message/MessageView"

const Stack = createNativeStackNavigator();

export default function IBMain(props){
  const [is_online,setIsOnline] = useState(false);
  const userAuthUnsubscribe_Ref= useRef();
  const userSnapshot_Ref = useRef();
  const [user,setUser]= useState();
  const [showNav,setShowNav] = useState(false);
  const [showNavHandle,setShowNavHandle] = useState(true);
  const [loading_user,setLoadingUser] = useState(false);
  const [app_update_link,setAppUpdateLink] = useState();
  const [author_request_link,setAuthorRequestLink] = useState(null);
  const [emailVerificationMessageShown,setEmailVerificationMessageShown] = useState(false);
  
  const [uploading_progress,setUploadingProgress] = useState(false);
  const [uploadPost,setUploadPost] = useState();
  
  useEffect(()=>{
    if(typeof uploadPost === "function"){
      uploadPost();
      setUploadPost(undefined);
    }
  },[uploadPost]);
  
const handleNotification = (content) => {
    switch (content.data?.type) {
      case "message":
        {
          const title = content.data.title;
          const message = content.data.message;
          Alert.alert(title, message);
        }
        break;
      case "post":
        {
          //The time the post was made.
          const time = content.data?.time;
          console.log("Data : ", content.data);
          Navigation.navigate(
            {
              name: "Feed",
              params: {
                type: FeedType.DAY,
                data: {epochMillisec: time - 1000},
              },
          });
        }
        break;
      case "none":
        {
          Navigation.navigate(
            {
              name: "Feed",
              params: {type: FeedType.CONNECT},
            });
        }
        break;
      default: {
      }
    }
    Notifications.clearLastNotificationResponseAsync()
      .then((value) => {
        console.log("Cleared!");
      })
      .catch((error) => {
        console.log("Could not clear");
      });
  };
  
  useEffect(()=>{
    //AsyncStorage.clear();
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const content = response.notification.request.content;
      console.log("Content : ", content);
      handleNotification(content);
    });
    Notifications.addNotificationResponseReceivedListener((event) => {
      const content = event.notification.request.content;
      console.log("Content : ", content);
      handleNotification(content);
    });
    Notifications.addPushTokenListener((token) => {
      saveToken(token);
    });
    const netinfo_handle = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });
    
    fb.getDocument(["info","update"])
    .then((update)=>{
      if(update){
        const {version,link} = update.data();
        if(version!="IB0"){
          setAppUpdateLink(link);
          console.log("UPDATE : ",update.data())
        }
      }
    })
    .catch((error)=>{
        console.log("Update Error : ",error);
      }
    );
    
    fb.getDocument(["info","author_request_link"]).then((request_link)=>{
      if(request_link){
        setAuthorRequestLink(request_link.data());
      }
    }).catch((reason)=>{
      console.log("Author Request Link Error : ",reason);
    });
    
    //loadUser();
    return ()=>{
      netinfo_handle();
    }
  },[]);
  
  const unsubscribeUserAuth = ()=>{
    if(userAuthUnsubscribe_Ref.current){
        userAuthUnsubscribe_Ref.current();
        console.log("UNSUBSCRIBING...")
    }else{
      console.log("NO REF");
    }
    if(userSnapshot_Ref.current){
      userSnapshot_Ref.current();
    }
  }
  
  useEffect(()=>{
    if(is_online){
      console.log(" IS ONLINE : ",is_online);
      console.log(" USER : ",user);
      if(!user)
        loadUser();
    }
  },[is_online])
  
  const signInUser = async (user_data)=>{
    const user_auth = await signIn(user_data);
    console.log("Sign In Return : ",user_auth);
    if(user_auth.user){
      if(userAuthUnsubscribe_Ref.current)
        userAuthUnsubscribe_Ref.current();
      userAuthUnsubscribe_Ref.current = fb.getAuth().onAuthStateChanged(async(user_auth)=>{
          console.log(" USER AUTH H : ",user_auth.email);
          loadUser(user_auth);
      });
    }
  }

  const loadUser = async (user_auth)=>{
    setLoadingUser(true);
    const saved_id = await getSavedUserId();
    console.log("SAVED USER ID : ",saved_id);
    const id = user_auth?.uid||saved_id;
    console.log("USER ID : ",id);
    if(id){
      if(userSnapshot_Ref.current){
        console.log("Unsubscribing Old User Snapshot");
        userSnapshot_Ref.current();
      }
      userSnapshot_Ref.current = fb.onUserSnapshot(id,async (snapshot)=>{
        if(snapshot.exists()){
          const user_data = snapshot.data();
          console.log("User Data : ",user_data);
          const user_auth = fb.getAuth();
          if(!user_auth.currentUser){
            await signInUser(user_data);
          }
          else{
            console.log("Verified ? : ",user_auth.currentUser.emailVerified);
            if(!user_auth.currentUser.emailVerified){
              if(!emailVerificationMessageShown){
                sendEmailVerification(true);
                setEmailVerificationMessageShown(true);
              }
            }
            else{
              if(!user_data.verified)
                await verifyEmail({id:id,data:user_data})
              try{
                user_data.photo = {uri:await fb.requestFileUrl(user_data.photo)};
                console.log("Photo Downloaded")
              }
              catch(reason){
                console.log("Cannot Load Photo : ",reason);
                user_data.photo = null;
              }
            }
            const user_details = {id:id,data:user_data};
            setUser(user_details);
          }
          setLoadingUser(false);
        }
        else{
          console.log("Error! User Snapshot");
          setLoadingUser(false);
        }
      });
    }
    else{
      setLoadingUser(false);
    }
  };
  
  return (
    <AppContext.Provider value={{user,is_online,setShowNav,unsubscribeUserAuth,author_request_link,setShowNavHandle,
      setUploadPost,
      uploading_progress,
      setUploadingProgress,
    }}>
  <View style={{flex:1}}>
    <Stack.Navigator
      screenOptions={{
          headerStyle: {backgroundColor: IBTheme.backgroundColor},
          headerTintColor: IBTheme.defaultTextColor,
        }}
    >
      <Stack.Screen
        name="MainPage"
        component={MainPage}
        options={{headerShown: false, popToTopOnEnter: true}}
      />
      <Stack.Screen
        name="Feed"
        component={Feed}
        options={{title: "Feed", headerLeft: null}}
      />
      <Stack.Screen
        name="UserPage"
        component={UserPage}
        options={{title: "User"}}
      />
      <Stack.Screen
        name="MessageView"
        component={MessageView}
        options={{title:"Messages",headerShown:false}}/>
    </Stack.Navigator>
    <Nav showNav={showNav} loading_user={loading_user} app_update_link={app_update_link} showNavHandle={showNavHandle}  uploading_progress={uploading_progress}/>
  </View>
  </AppContext.Provider>);
}