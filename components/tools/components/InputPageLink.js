import NavLink from './NavLink';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ToastAndroid
} from "react-native"
import {Ionicons} from "@expo/vector-icons"
import PostInput from "../../feed/PostInput"
import {useState,useContext} from "react"
import {AppContext} from "../../AppContext"
import {IBColors,ColorIndex,ColorContext,getColorStyle} from "../../IBColors"
export default function InputPageLink(props){
  const [show_post_tools,setShowPostTools] = useState(false);
  const {user} = useContext(AppContext);
  const {theme} = useContext(ColorContext)
  
  const main_color = getColorStyle(theme,[0]);
  return (
    <NavLink 
    theme={props.theme}
      tip={user?.data?.quota?.count} 
      tip_condition={user?.data?.quota} 
      onPress={()=>{setShowPostTools(true)}} 
      icon="create">
        <Modal
          visible={show_post_tools}
          onRequestClose={()=>{
            setShowPostTools(false);
          }}
          transparent
        >
          <View style={{flex:1}}>
            <View 
              style={{
                flex:1
              }}
              onTouchStart={()=>{
                setShowPostTools(false);
              }}
            ></View>
            {show_post_tools&&(<View style={{
              position:"absolute",
              bottom:0,
              backgroundColor:main_color._bkg,
              width:"100%",
              borderTopWidth:3,
              borderColor:main_color._elm
            }}>
              <PostInput 
                onSuccess={()=>{
                  ToastAndroid.show("Post Submitted!",ToastAndroid.SHORT);
                }}
                onError={()=>{
                  console.log("CANNOT POST");
                }}
                onFinish={()=>{
                  console.log("FINISH");
                  setShowPostTools(false);
                }}
              />
            </View>)}
          </View>
        </Modal>
      </NavLink>);
}