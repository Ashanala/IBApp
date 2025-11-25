import {Linking, Text, TouchableOpacity, View,Image,ActivityIndicator,StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {IBTheme} from "../constants/ThemeFile";
import {AppContext} from "../../AppContext"
import {useContext} from "react"
import {navigateToUser,navigateToPost} from "../../RootNavigator"
import {useState,useEffect} from "react"
import {fb} from "../firebase/IBFirebase"
import {generateVideoThumbnail} from "../functions/AppTools"
import {IBColors,ColorIndex,ColorContext,getColorStyle} from "../../IBColors"

export const isHttp = (href) => {
  return href.startsWith("http://") || href.startsWith("https://");
};

export const isValidDomainOf = (domain, href) => {
  const isHTTP = isHttp(href);
  //console.log("Http (", href, ") : ", isHTTP);
  const firstDotIndex = href.indexOf(".", 0);
  //console.log("first dot index : ", firstDotIndex);
  const secondDotIndex = href.indexOf(".", firstDotIndex + 1);
  // console.log("second dot index : ", secondDotIndex);
  let index = firstDotIndex;
  if (index == -1) return false;
  if (secondDotIndex == -1) index = href.indexOf("/", 0) + 1;
  if (index == -1) return false;
  //console.log("Index : ", index);
  const httpSubString = href.substring(index + 1);
  //console.log("http substring : ", httpSubString);
  const isDomain = httpSubString.startsWith(domain);
  //console.log("isDomain (", href, ") : ", isDomain);
  return isHTTP && isDomain;
};

export  const isIBLink = (link)=>{
  return isIBUser(link)||isIBPost(link);
}

export const isIBUser = (link)=>{
  return link.startsWith("IB")&&link[2]==":"&&link[3]!=":";
}

export const isIBPost = (link)=>{
  return link.startsWith("IB")&&link[2]==":"&&link[3]==":";
}

export const getLogo = (href) => {
  if (isValidDomainOf("facebook.com", href)) return "logo-facebook";
  else if (isValidDomainOf("youtube.com", href)||isValidDomainOf("youtu.be",href)) return "logo-youtube";
  else if (isValidDomainOf("instagram.com", href)) return "logo-instagram";
  else if (isValidDomainOf("soundcloud.com", href)) return "logo-soundcloud";
  else if (isValidDomainOf("twitter.com", href)) return "logo-twitter";
  else if (isValidDomainOf("whatsapp", href)) return "logo-whatsapp";
  else if (isValidDomainOf("audiomack.com", href)) return "musical-note";
  else if (isValidDomainOf("play.google", href)) return "logo-google-playstore";
  else if (isValidDomainOf("tiktok.com", href)) return "logo-tiktok";
  else if (isValidDomainOf("snapchat.com", href)) return "logo-snapchat";
  else if(isIBLink(href)) return "logo-ibapp"
  else return "logo-chrome";
};

export default function Link(props = {text: "", href: "", disabled: false}) {
  const default_icon = require("../../../assets/IBApp(512).png")
  const {user} = useContext(AppContext);
  const {theme} = useContext(ColorContext)
  const logo = getLogo(props.href);
  const [photo,setPhoto] = useState(require("../../../assets/icon.png"));
  const [link_content,setLinkContent] = useState();
  const [loadingLink,setLoadingLink] = useState(false);
  const [is_video,setIsVideo] = useState(false);
  
  useEffect(()=>{
    console.log("HREF : ",props.href);
    setLinkContent(null);
    if(logo=="logo-ibapp"&&isIBLink(props.href)){
      setLoadingLink(true);
      const type = isIBUser(props.href)?"users":"posts";
      const content_id = props.href.substring(type=="users"?3:4);
      fb.getDocument([type,content_id]).then(async (doc)=>{
        const content = {id:content_id,data:doc.data()}
        console.log("Content : ",content);
        if(content.data){
          if(isIBPost(props.href)){
            const poster_id = content.data.poster;
            const poster = await fb.getDocument(["users",poster_id]);
            content.data.poster = {id:poster_id,data:poster.data()};
            const is_video = content?.data?.videos?.length>0;
            console.log("IS VIDEO : ",is_video);
           setIsVideo(is_video||false); 
          }
          
          setPhoto(default_icon)
          setLinkContent(content);
        }
      }).catch((reason)=>{
        console.log("ERROR LOADING LINK ",reason);
      }).finally(()=>{setLoadingLink(false)})
    }
  },[props.href])
  
  useEffect(()=>{
    if(link_content){
      console.log("Loading Media...");
      let dir = "";
      if(isIBUser(props.href)){
        dir = link_content?.data?.photo;
      }
      else{
        dir = is_video?link_content?.data?.videos[0]?.uri:link_content?.data?.photos[0]?.uri;
      }
      console.log("Dir : ",dir);
      fb.requestFileUrl(dir).then(async(url)=>{
        let photo_uri = {uri:url};
        if(isIBUser(props.href)){
          link_content.data.photo = photo_uri;
        }
        else if(isIBPost(props.href)){
          if(is_video){
            photo_uri = {uri:await generateVideoThumbnail(photo_uri.uri)};
            console.log("THUMB : ",photo_uri);
          }
        }
        setPhoto(photo_uri);
      }).catch((reason)=>{
        console.log("Cannot Get Link Photo Url ",reason);
      })
    }
  },[link_content])
  
  const content_color = getColorStyle(theme,[1,0,0]);
  
  const main_color = getColorStyle(theme,[1,0]);
  const link_color = getColorStyle(theme,[1,1,0]);
  const design_color = getColorStyle(theme,[1,1,0,1])
  
  const link_view = ()=>{
    if(link_content){
    const is_ib_user = isIBUser(props.href);
    const title = "IB:"+(is_ib_user?link_content?.data?.username:link_content?.data?.poster?.data?.username)||"user";
    const text = (is_ib_user?link_content  ?.data?.info:link_content?.data?.text)||"I use IBApp.";
    return ( <View style={{flexDirection:"row"}}>
      <View>
        <Image source={photo} style={{width:80,height:80,marginHorizontal:2}}/>
        {is_video&&(<View style={styles.video_play_icon}>
          <Ionicons name="play" size={20} color="#fff8"/>
        </View>)}
        </View>
        <View style={{backgroundColor:content_color._bkg,marginHorizontal:2,padding:7,borderRadius:5,flex:1}}>
          <Text style={content_color.elm}>{title}</Text>
          <Text style={[{borderTopWidth:1},content_color.elm]} numberOfLines={2}>{text}</Text>
        </View>
      </View>)
    }else{
      if(loadingLink&&props.editing){
      return (<View style={content_color.bkg}>
        <ActivityIndicator color={content_color._elm}/>
      </View>);
      }
    }
  }
  
  return ((link_content||!props.hide_invalid)&&(<TouchableOpacity onPress={() => {
          console.log("Ha!");
          if(isIBUser(props.href)){
            const isMainUser = link_content.id==user?.id;
            console.log(link_content.id+" : "+isMainUser);
            navigateToUser(link_content,isMainUser);
          }
          else if(isIBPost(props.href)){
            navigateToPost(link_content.data.time)
          }
          else{
            Linking.openURL(props.href);
          }
        }} style={{backgroundColor:main_color._bkg,padding:2}}
        disabled={props.disabled || ((logo=="logo-ibapp")&&props.editing) || false}>
      {link_view()}
      <View
        style={[styles.text_body,link_color.bkg]}
      >
        {logo=="logo-ibapp"?(<Image source={default_icon} style={styles.icon_image}/>):(<Ionicons name={logo} size={25} color={link_color._elm} />)}
        <View style={{flex: 1, marginLeft: 2}}>
          <Text
            style={[styles.text,link_color.elm]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {" "}
            {props.text}{" "}
          </Text>
          <View
            style={[styles.bottom_design,design_color.bkg,{borderColor:design_color._elm}]}
          ></View>
        </View>
      </View>
    </TouchableOpacity>)
    );
}

const styles = StyleSheet.create({
  text_body:{
          backgroundColor: IBColors.layer[ColorIndex.BASIC],
          padding: 5,
          margin: 5,
          paddingBottom: 0,
          paddingRight: 0,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 10,
        },
  icon_image:{width:25,height:25,borderRadius:10},
  text:{
              color: "blue",
              fontSize: 15,
              fontStyle: "italic",
              borderBottomWidth: 1,

              borderColor: "#eaeaee",
            },
  bottom_design:{
              flex: 1,
              backgroundColor: IBColors.design[ColorIndex.BASIC],
              borderBottomRightRadius: 20,
            },
  video_play_icon:{position:"absolute",left:0,right:0,top:0,bottom:0,justifyContent:"center",alignItems:"center"}
})