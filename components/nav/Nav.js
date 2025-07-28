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

export default function Nav(props){
  const {user,setShowNav,uploading_progress} = useContext(AppContext);
  useEffect(()=>{
    console.log("User: ",user)
  },[user])
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
      {props.uploading_progress>0&&(<View style={styles.nav}>
        <LoadIndicator progress={props.uploading_progress}/>
      </View>)}
      {user?.data?.verified&&(<View style={styles.nav}>
        <NotifPageLink/>
      </View>)}
      {props.app_update_link&&(<View style={styles.nav}>
        <UpdateLink app_update_link={props.app_update_link}/>
      </View>)}
      {user?.data?.verified&&(user?.data?.level>0)&&(<View style={styles.nav}>
        <InputPageLink />
      </View>)}
      <View style={styles.nav}>
        <UserPageLink 
          user={user}
          pageUser={user}
          loading_user={props.loading_user}
        />
      </View>
    </View>)}
   {props.showNavHandle&&(<TouchableOpacity
      onPress={()=>{
        setShowNav(!props.showNav)
      }}
      style={{
        backgroundColor:"#22f8",
        borderRadius:10
      }}
    >
      <Ionicons name="expand" size={50} color="#fff8" />
    </TouchableOpacity>)}
  </View>);
}

const styles = StyleSheet.create({
  nav:{
    width:60,
    height:60,
    backgroundColor:"#fff",
    borderRadius:30,
    marginVertical:5,
    justifyContent:"center",
    alignItems:"center"
  }
})