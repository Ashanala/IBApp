import * as Clipboard from "expo-clipboard";
import * as VideoThumbnails from 'expo-video-thumbnails';
import {ToastAndroid} from "react-native";

export function copyLink(post_link,too_long){
    Clipboard.setStringAsync(post_link).then(()=>{
      ToastAndroid.showWithGravity("Copied "+(too_long?"Text":post_link),ToastAndroid.LONG,ToastAndroid.BOTTOM);
    }).catch(()=>{
      ToastAndroid.showWithGravity("ERROR:CANNOT COPY",ToastAndroid.LONG,ToastAndroid.BOTTOM);
    });
  }
  
  
  
  export function castSenderName(name){
    let isIBApp = false;
    switch(name){
      case "ibapp_heart":
      case "ibapp_comment":
      case "ibapp_star":
        name = "IBApp";
        isIBApp = true;
    }
    return {name,isIBApp};
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

/**
 * Generates a thumbnail image from a video URI.
 *
 * @param {string} videoUri - The URI of the video file.
 * @param {number} [time=0] - The time (in ms) from which to extract the frame.
 * @returns {Promise<string|null>} - Returns the thumbnail URI, or null if failed.
 */
export async function generateVideoThumbnail(videoUri, time = 0) {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time,
    });
    return uri;
  } catch (error) {
    console.warn('Failed to generate thumbnail:', error);
    return null;
  }
}