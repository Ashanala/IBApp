
import NavLink from '../tools/components/NavLink';
import SearchViewLink from '../tools/components/SearchViewLink';
import LoadIndicator from './LoadIndicator';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import {Ionicons} from "@expo/vector-icons"
import React,{useContext,useState,useEffect} from "react"
import {AppContext} from "../AppContext"

import UserPageLink from "../tools/components/UserPageLink"
import InputPageLink from "../tools/components/InputPageLink"
import UpdateLink from "../tools/components/UpdateLink";
import NotifPageLink from "../tools/components/NotifPageLink"
import {ColorContext,getColorStyle} from "../IBColors"

export default function Nav(props){
  const {user,setShowNav,uploading_progress} = useContext(AppContext);
  const {theme} = useContext(ColorContext)
  useEffect(()=>{
    console.log("User: ",user)
  },[user])
  const nav_handle_color = getColorStyle(theme,[0]);
  const nav_color = getColorStyle(theme,[1]);
  const nav_style = [styles.nav,nav_color.bkg];
  return (
  <View style={{
    position:"absolute",
    bottom:10,
    left:10,
  }}
  >
    {props.showNav&&(<View
      style={{
        marginBottom:100,
      }}
    >
      <View style={nav_style}>
        <SearchViewLink theme={theme}/>
      </View>
      {props.uploading_progress>0&&(<View style={nav_style}>
        <LoadIndicator progress={props.uploading_progress} theme={theme}/>
      </View>)}
      {user?.data?.verified&&(<View style={nav_style}>
        <NotifPageLink theme={theme}/>
      </View>)}
      {props.app_update_link&&(<View style={nav_style}>
        <UpdateLink app_update_link={props.app_update_link} theme={theme}/>
      </View>)}
      {user?.data?.verified&&(uploading_progress==0)&&(user?.data?.level>0)&&(<View style={nav_style}>
        <InputPageLink theme={theme} />
      </View>)}
      <View style={nav_style}>
        <UserPageLink 
          user={user}
          pageUser={user}
          loading_user={props.loading_user}
          theme={theme}
        />
      </View>
    </View>)}
   {props.showNavHandle&&(<TouchableOpacity
      onPress={()=>{
        setShowNav(!props.showNav)
      }}
      style={{
        backgroundColor:nav_handle_color._bkg+"aa",
        borderRadius:10
      }}
    >
      <Ionicons name="expand" size={50} color={nav_handle_color._elm+"8"} />
    </TouchableOpacity>)}
  </View>);
}

const styles = StyleSheet.create({
  nav:{
    width:50,
    height:50,
    backgroundColor:"#fff",
    borderRadius:25,
    marginVertical:5,
    justifyContent:"center",
    alignItems:"center"
  }
})