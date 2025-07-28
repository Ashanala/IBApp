
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
    <TouchableOpacity
      style={styles.main}
      onPress={()=>{
        if(user?.data?.verified){
          navigateToUser(user,true);
        }
        else{
          sendEmailVerification(true,()=>{
            setShowLoginModal(true);
          });
        }
      }}>
      <Modal
          visible={show_login_modal}
          transparent
          onRequestClose={()=>{
            setShowLoginModal(false);
          }}
        >
          <LoginView
            navigation={props.navigation}
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
        {props.loading_user?(<ActivityIndicator color="#22f" />):(user?.data?(
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
        ):(
        <TouchableOpacity
          style={{
            backgroundColor:"#22f",
            justifyContent:"center",
            alignItems:"center",
            borderRadius:25,
            width:50,
            height:50,
          }}
          onPress={()=>{
            setShowLoginModal(true);
          }}
        >
          <Ionicons name="log-in" color="#fff" size={40}/>
        </TouchableOpacity>))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  main:{
    width:50,
    height:50,
    justifyContent:"center",
    alignItems:"center",
  },
  image:{
    width:50,
    height:50,
    borderRadius:25,
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