import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {fb} from "./firebase/IBFirebase";
import * as Application from "expo-application"
import IBDate from "../calendar/calendar_tools/IBDate";
import CONST from "./constants/CONST";

export const saveToken = async (token) => {
  try {
    const token_string = JSON.stringify(token);
    await AsyncStorage.setItem("token", token_string);
    console.log("Token Stored", token);
    const user_id = await AsyncStorage.getItem("user_id");
    if (user_id) {
      fb.updateDocument(["users",user_id],{token: token.data})
        .then(() => {
          console.log("Token Updated on User Server");
        })
        .catch((reason) => {
          console.log("Could not update token in User server");
        });
    }
    const unique_id = Application.getAndroidId();
    console.log("UNIQUE ID : ",unique_id);
    if(unique_id){
      console.log("Uploading token...")
      fb.setDocument(["tokens",unique_id+""],{token:token.data},true)
      .then(()=>{
        console.log("Token Updated to Tokens Server");
      }).catch((reason)=>{
        console.log("Could not upload token : ",reason);
      });
    }
  } catch (error) {
    console.log("Cannot Save Token : ", error);
  }
};

export const notificationSettings = async () => {
  await Notifications.setNotificationChannelAsync("my_channel", {
    name: "My Channel",
    importance: Notifications.AndroidImportance.MAX,
  });
  const getFCMToken = async () => {
    try {
      const token = await Notifications.getDevicePushTokenAsync();
      console.log("fCM Token : ", token);
      await saveToken(token);
    } catch (reason) {
      console.log("FCM Token Request Error : ", reason);
    }
  };
  try {
    let status = null;
    const permission = await Notifications.getPermissionsAsync();
    status = permission.status;
    if (status != Notifications.PermissionStatus.GRANTED) {
      try {
        const request = await Notifications.requestPermissionsAsync();
        status = request.status;
      } catch (reason) {
        console.log("Notification Permission Request Error : ", reason);
      }
    }
    console.log("Status : ", status);
    if (status == Notifications.PermissionStatus.GRANTED) {
      console.log("Granted");
      try{
        await getFCMToken();
      }catch(reason){
        console.log("FCM TOKEN ERROR : ",reason);
      }
      try{
      await Notifications.cancelAllScheduledNotificationsAsync();
      }catch(reason){
        console.log("CANCEL ALL SCH NOTIF ERROR : ",reason);
      }
      const messages = [
        {
          title : "Rise & Shine with IBApp!",
          message:"Your day just got easier—check your calendar, catch up on the latest news, and see what’s new in your feed. All in one tap"
        },
        {
          title : "Mornings Are Better with Memes",
          message: "Open IBApp for today’s events, trending news, and a meme or two to make you laugh."
        },
        {
          title: "Your Morning Just Got Interesting",
          message: "News you need, memes you’ll share, and info you didn’t know you needed. Open IBApp now."
        },
        {
          title: "Serious Info. Silly Memes. One App.",
          message: "IBApp delivers your daily essentials—with a side of laughter. Tap to start your day right."
        },
        {
          title: "What Do Memes & Meetings Have in Common?",
          message: "They’re both in IBApp. Your schedule, news, and a meme that might just make your day."
        }
      ]
      const notifIndex = Math.floor(Math.random()*messages.length);
      let title = messages[notifIndex].title;
      const message = messages[notifIndex].message;
      console.log("TITLE : ",title);
      console.log("MESSAGE : ",message);
      await Notifications.scheduleNotificationAsync({
        content :{
          title:title,
          body :message,
        },
        trigger :{
          type:Notifications.SchedulableTriggerInputTypes.DAILY,
          hour:8,
          minute:0,
          repeats:true,
        }
      });
      console.log("DAILY NOTIFICATION DONE!");
    } else {
      console.log("Push notification denied");
    }
  } catch (reason) {
    console.log("Notification Permission Get Error : ", reason);
  }
  Notifications.addNotificationReceivedListener((event) => {
    // console.log(
    //   "Notification Recieved : ",
    //   event.date,
    //   " => ",
    //   event.request
    // );
  });
  Notifications.addNotificationResponseReceivedListener((event) => {
    console.log("Notification Response Recieved : ", event);
  });
};


