import React from "react"
import {View,Text,TouchableOpacity} from "react-native";
import {VideoView,useVideoPlayer} from "expo-video"
import ImageView from "./ImageVIew"
import {Ionicons} from "@expo/vector-icons"

export default function IBVideoView(props){
  const {source} = props;
  const width = props.width||250;
  const height= props.height||250;
  const player = useVideoPlayer({
    ...source,
    useCaching:true,
    },(player)=>{
      player.loop = true;
      player.play();
  })
  console.log("(",width,",",height,")");
  return (<View style={[props.style,{justifyContent:"center",alignItems:"center",width:width,minHeight:height}]}>
    <View>
      <VideoView
        style={{width:width,height:height,backgroundColor:"#0005"}}
        player={player}
        nativeControls={true}
      />
      </View>
  </View>);
}