import React, {useEffect, useState,useContext} from "react";
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
  return (
    <View
      style={{flex: 1, justifyContent: "flex-end"}}
      pointerEvents={loading ? "none" : "auto"}
    >
      <View style={{flex: 1}} onTouchStart={props.onCancel}></View>
      <View style={styles.main}>
        <View style={{flexDirection: "row"}}>
          <TouchableOpacity
            style={[_styles.login_button, styles.mode_select]}
            onPress={() => {
              setIsLoginMode(true);
            }}
          >
            <Text style={styles.title}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[_styles.create_account_button, styles.mode_select]}
            onPress={() => {
              setIsLoginMode(false);
            }}
          >
            <Text style={styles.title}>Create Account</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          onChangeText={setEmail}
          inputMode="email"
          keyboardType="email-address"
        />
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            secureTextEntry={hidePassword}
            onChangeText={setPassword}
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
            />
          </TouchableOpacity>
        </View>
        {!isLoginMode && (
          <TextInput
            style={styles.input}
            placeholder="Enter Username"
            onChangeText={setUsername}
            maxLength={10}
          />
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setLoading(true);
          }}
        >
          <Text style={styles.button_text}>Enter</Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <ActivityIndicator
          size="large"
          color="white"
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
