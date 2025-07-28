import {Alert} from "react-native"
import {fb} from "../firebase/IBFirebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {sendEmailVerification} from "../firebase/AccountTools"

export async function verifyEmail (user) {

    try{
      user.data.verified = true;
      await AsyncStorage.setItem("user", JSON.stringify(user));
      Alert.alert("Email Verified!", "Your account is being updated...");
      await fb.setDocument(["users",user.id],{verified: true},true);
          Alert.alert("Account Updated!", "Welcome to IB App");
    }catch(reason) {
        console.log("Verification Error : ", reason);
        Alert.alert(
          "Account Update Error!",
          "You may need to verify your email again. Please contact Phleim if the problem persists."
        );
      }
      return user;
  };
  
  export async function signIn(user_data){
    try {
      console.log(" Signing In :(",user_data.email,",",user_data.password,")");
      return await fb.getAuth().signInWithEmailAndPassword(user_data.email, user_data.password);
    } catch (reason) {
      console.log(" Sign IN Error : ",reason.code);
      if (reason.code == "auth/network-request-failed") {
        return "network_error";
      } else if (reason.code == "auth/internal-error") {
        return "server_error";
      }
      return "signin_error";
    }
  };
  
export async function getSignedInUser(user_auth){
    const user_string = await AsyncStorage.getItem("user");
    if(user_string){
      const user = JSON.parse(user_string)
      if(!user_auth){
        try{
          const auth = await signIn(user.data);
          user_auth = auth.user;
        }catch(reason){
          return null;
        }
      }
      if (user_auth.emailVerified) {
        if(!user.data.verified)
          await verifyEmail(user);
      }
      else{
        await sendEmailVerification(true);
      }
      return user_auth;
    }
    else{
      console.log("NO SAVED USER");
      return null;
    }
  };
  
  export async function getUser(){
    return await AsyncStorage.getItem("user");
  }
  
  export async function getSavedUserId(){
    return await AsyncStorage.getItem("user_id");
  }