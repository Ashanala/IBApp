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
export default function InputPageLink(){
  const [show_post_tools,setShowPostTools] = useState(false);
  const {user} = useContext(AppContext);
  return (
    <NavLink 
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
              backgroundColor:"#22f",
              width:"100%",
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