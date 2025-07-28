import NavLink from './NavLink';
import {View,Text,TouchableOpacity} from "react-native"
import {useState,useContext} from "react"
import {AppContext} from "../../AppContext"
import {navigateToMessages} from "../../RootNavigator"

export default function NotifPageLink(props){
  const {user} = useContext(AppContext);
  return (<NavLink 
    icon="chatbox" 
    tip={user?.data?.notifs} 
    tip_condition={user?.data?.notifs>0} 
    tip_color={"#f28"} 
    onPress={()=>{
      navigateToMessages();
    }}/>)
}