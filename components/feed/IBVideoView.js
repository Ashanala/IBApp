import {View,Text,TouchableOpacity} from "react-native";
import {useVideoPlayer,VideoView} from "expo-video";
import ImageView from "./ImageVIew"

export default function IBVideoView(props){
  
  console.log("Video : ",props.source)
  const player = useVideoPlayer(props.source,()=>{
    player.loop = true;
    player.play();
  })
  return (props.source && (<View style={[props.style,{flex:1}]}>
    <VideoView
      player={player}
      style={{width:250,height:250}}
      allowsFullscreen
      allowsPictureInPicture
      nativeControls={true}
      />
  </View>));
}