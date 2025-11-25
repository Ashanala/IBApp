import NavLink from './NavLink';

import {
  TouchableOpacity,
  Image,
  View, 
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import {Ionicons} from "@expo/vector-icons"
import React,{useEffect,useState,useContext} from "react";
import CONST from "../constants/CONST";
import {sendEmailVerification} from "../firebase/AccountTools"
import LoginView from "./LoginView"

import {push,navigateToUser} from "../../RootNavigator"
import {AppContext} from "../../AppContext"

export default function UserPageLink(props){
  const {user} = useContext(AppContext)
  const [show_login_modal,setShowLoginModal] = useState(false);
  
  return (
    <View>
      <Modal
          visible={show_login_modal}
          transparent
          onRequestClose={()=>{
            setShowLoginModal(false);
          }}
        >
          <LoginView
            navigation={props.navigation}
            theme = {props.theme}
            onSuccess={()=>{
              setShowLoginModal(false);
            }
            }
            onCancel={()=>{
              setShowLoginModal(false);
            }}
            onError={()=>{
              setShowLoginModal(false);
            }}
          />
        </Modal>
    {user?.data?(
    <TouchableOpacity
      style={styles.main}
      disabled={!user}
      onPress={()=>{
        if(user?.data?.verified){
            navigateToUser(user,true);
        }
        else{
          sendEmailVerification(true,()=>{
            console.log("LOG IN CALLED!");
            setShowLoginModal(true);
          });
        }
      }}>
        {props.loading_user?(<ActivityIndicator color="#22f" />):(
        <View>
          <Image 
            source={
              user?.data?.photo||
            CONST.default_profile_photo}
            style={styles.image}
          />
          {
            !user?.data?.verified&&
            (<View 
              style={styles.unverified_tag}>
              <Ionicons 
                name="close" 
                size={20} 
                color="#f00"
              />
            </View>
            )
          }
        </View>
        )}
      </TouchableOpacity>):(
        <NavLink 
          theme={props.theme}
          onPress={()=>{
            setShowLoginModal(true);
          }}
          icon="log-in"
        >
                
        </NavLink>)}
        </View>
  );
}

const styles = StyleSheet.create({
  main:{
    width:45,
    height:45,
    justifyContent:"center",
    alignItems:"center",
  },
  image:{
    width:45,
    height:45,
    borderRadius:22.5,
  },
  unverified_tag : {
    position:"absolute",
    bottom:5,
    right:3,
    backgroundColor:"#858a",
    borderRadius:10,
    flexDirection:"row"
  }
})