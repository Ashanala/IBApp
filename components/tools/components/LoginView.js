import React, {useEffect, useState,useContext} from "react";
import {IBColors,ColorIndex} from "../../IBColors"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import THEME from "../constants/THEME";
import {Ionicons} from "@expo/vector-icons";
import {IBTheme} from "../constants/ThemeFile";
import {getErrorMessage, Login} from "../firebase/AccountTools";
import {AppContext} from "../../AppContext"
import * as Navigation from "../../RootNavigator"
import {getColorStyle} from "../../IBColors"

export default function LoginView(
  props = {
    onSuccess: () => {},
    onCancel: () => {},
  }
) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [hidePassword, setHidePassword] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loading) {
      const onError = (reason) => {
        props.onError();
        console.log("WE are");
        const error_message = getErrorMessage(reason);
        console.log("Cannot Sign iN : ", reason.code, " : ", reason.message);
        console.log("Message : ", error_message);
        ToastAndroid.show(error_message, ToastAndroid.LONG);
        setLoading(false);
      };
      const onSuccess = async() => {
        try{
          Navigation.reset("IBMain","MainPage");
        }
        catch(reason){
          console.log("AIBOO : ",reason);
        }
        props.onSuccess();
        setLoading(false);
      };
      Login(
        email,
        password,
        {onSuccess: onSuccess, onError: onError},
        username,
        isLoginMode,
        props.navigation
      );
    }
  }, [loading]);

  const _styles = StyleSheet.create({
    login_button: {
      backgroundColor: IBTheme.surfaceColor,
      borderWidth: isLoginMode ? 2 : null,
      borderColor: isLoginMode ? "white" : null,
    },
    create_account_button: {
      backgroundColor: IBTheme.surfaceColor,
      borderWidth: !isLoginMode ? 2 : null,
      borderColor: !isLoginMode ? "white" : null,
    },
  });
  
  const main_style = getColorStyle(props.theme,[0]);
  const inner_style = getColorStyle(props.theme,[0,0]);
  const other_style = getColorStyle(props.theme,[0,1])
  return (
    <View
      style={{flex: 1, justifyContent: "flex-end"}}
      pointerEvents={loading ? "none" : "auto"}
    >
      <View style={{flex: 1}} onTouchStart={props.onCancel}></View>
      <View style={[styles.main,main_style.bkg]}>
        <View style={{flexDirection: "row"}}>
          <TouchableOpacity
            style={[_styles.login_button, styles.mode_select,inner_style.bkg]}
            onPress={() => {
              setIsLoginMode(true);
            }}
          >
            <Text style={[styles.title,inner_style.elm]}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[_styles.create_account_button, styles.mode_select,inner_style.bkg]}
            onPress={() => {
              setIsLoginMode(false);
            }}
          >
            <Text style={[styles.title,inner_style.elm]}>Create Account</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input,main_style.elm]}
          placeholder="Enter Email"
          onChangeText={(email)=>setEmail(email.trim())}
          inputMode="email"
          keyboardType="email-address"
          placeholderTextColor={main_style._elma("88")}
        />
        <View>
          <TextInput
            style={[styles.input,main_style.elm]}
            placeholder="Enter Password"
            secureTextEntry={hidePassword}
            onChangeText={(password)=>setPassword(password.trim())}
            placeholderTextColor={main_style._elma("88")}
          />
          <TouchableOpacity
            style={styles.hide_password}
            onPress={() => {
              setHidePassword(!hidePassword);
            }}
          >
            <Ionicons
              name={hidePassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={main_style._elm}
            />
          </TouchableOpacity>
        </View>
        {!isLoginMode && (
          <TextInput
            style={[styles.input,main_style.elm]}
            placeholder="Enter Username"
            onChangeText={(username)=>setUsername(username.trim())}
            maxLength={10}
            placeholderTextColor={main_style._elma("88")}
          />
        )}
        <TouchableOpacity
          style={[styles.button,other_style.bkg]}
          onPress={() => {
          if(email&&password&&(username||isLoginMode))
            setLoading(true);
          }}
        >
          <Text style={[styles.button_text,other_style.elm]}>Enter</Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <ActivityIndicator
          size="large"
          color={main_style._elm}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 100,
            top: 0,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0af",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    fontStyle: "italic",
    color: IBTheme.defaultTextColor,
  },
  input: {
    borderWidth: 1,
    fontSize: 15,
    padding: 8,
    margin: 10,
    minWidth: "75%",
  },
  button: {
    backgroundColor: THEME.backColor2,
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderRadius: 10,
  },
  button_text: {fontSize: 20, color: THEME.textColor0},
  mode_select: {
    flex: 1,
    margin: 5,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  hide_password: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 20,
    justifyContent: "center",
  },
});
