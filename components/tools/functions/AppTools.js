import * as Clipboard from "expo-clipboard";
import {ToastAndroid} from "react-native";

export function copyLink(post_link,too_long){
    Clipboard.setStringAsync(post_link).then(()=>{
      ToastAndroid.showWithGravity("Copied "+(too_long?"Text":post_link),ToastAndroid.LONG,ToastAndroid.BOTTOM);
    }).catch(()=>{
      ToastAndroid.showWithGravity("ERROR:CANNOT COPY",ToastAndroid.LONG,ToastAndroid.BOTTOM);
    });
  }
  
  export function castSenderName(name){
    switch(name){
      case "ibapp_heart":
      case "ibapp_comment":
      case "ibapp_star":
        return "IBApp";
      default :
        return name;
    }
  }
  
 export function createCommentNotification(name, text) {
  const messages = [
    `💬 ${name} commented on your post:`,
    `📬 You just got a reply from ${name} on your post:`,
    `🔔 ${name} responded to your recent post:`,
    `🗣️ ${name} left a comment on what you shared:`
  ];
  
  const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
  return `${selectedMessage}\n\n\t “${text}”`;
}