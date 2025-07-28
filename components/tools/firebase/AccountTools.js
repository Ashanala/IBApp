import {Alert, ToastAndroid} from "react-native";
import {fb} from "./IBFirebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const Login = async (
  email,
  password,
  callbacks = {
    onSuccess: (id, data, userDetails) => {},
    onError: (reason) => {},
  },
  username,
  loginMode,
  navigation
) => {
  try {
    const userDetails = loginMode
      ? await fb.getAuth().signInWithEmailAndPassword(email, password)
      : await fb.getAuth().createUserWithEmailAndPassword(email, password);

    const id = userDetails.user.uid;
    await AsyncStorage.setItem("user_id",id);
    console.log("login ID : ", id);
    const dataRef = ["users",id];
    const token = JSON.parse(await AsyncStorage.getItem("token"));
    const data = loginMode
      ? await fb.getDocument(dataRef)
      : {
          id: id,
          data: () => {
            return {
              username: username,
              email: email,
              password: password,
              photo: "",
              time: Date.now(),
              verified: false,
              token: token.data,
              quota:{count:0},
              level:0,
            };
          },
        };
    if (!loginMode) {
      console.log("Setting data to : ", data.data());
      console.log("HA!! ",dataRef);
      await fb.setDocument(dataRef,data.data());
      console.log("Done setting data.");
    } else {
      console.log("Uploading Token...");
      if (token) await fb.setDocument(dataRef,{token: token.data},true);
      const old_user_id = await AsyncStorage.getItem("user_id");
      if(old_user_id){
        console.log("Clearing Token...");
        await fb.updateDocument(["users",old_user_id],{token:"none"});
      }
    }
    const user_data = {id: data.id, data: data.data()};
    console.log("User data : ", user_data);
    callbacks.onSuccess(user_data);
    ToastAndroid.showWithGravity(
        "Welcome to IBApp, " + user_data.data.username,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
  } catch (reason) {
    console.log("Login Error : ", reason);
    callbacks.onError(reason);
  }
};

export const sendEmailVerification = (shouldAskFirst,login) => {
  const execute = () => {
    fb.getAuth().currentUser.sendEmailVerification()
      .then(() => {
        console.log("SENT EMAIL VERIFICATION");
        Alert.alert(
          "Email Verification Sent!",
          "Check your Gmail for the verification email. Once you’ve verified your email, you can log in to your account. Please note that unverified accounts may be deleted within 2 days."
        );
      })
      .catch((e) => {
        Alert.alert("Error!", "Can't send email verification");
        console.log("Send Verification : ",e);
      });
  };
  if (shouldAskFirst) {
    const title = "🔐 Account Verification Needed";
    const noLogin_text = "To continue, please verify your email address. Unverified accounts may be deleted after 24 hours, so don’t wait too long! \n\t Choose one of the options below: \n\t\t 📧 Send/Resend Verification Email  \n\t\t\t We’ll send a new verification link to your email so you can complete the process.\n\t\t\t Don't see the email? Be sure to check your spam or junk folder.\n"
    const withLogin_text = noLogin_text+"\n\t\t 🔁 Log In to a Different Account  \n\t\t\t Want to switch accounts? You can log in with another email address.\n \n\t\t  ✅ Log In Again  \n\t\t\t If you’ve already verified your email, logging in again may clear this message."
    /*const noLogin_text = "It appears your email hasn't been verified yet—accounts with unverified emails may be deleted after 24 hours. Please click RESEND to receive a new verification email";
    const withLogin_text = noLogin_text+", or if you'd prefer to use another account, simply click LOG IN to proceed"*/
    const text = (login? withLogin_text:noLogin_text)+".";
    const buttons = [
        {text: "Send/Resend", onPress: execute},
        {text: "Cancel", onPress: () => {}, isPreferred: true, style: "cancel"},
      ];
    if(login){
      buttons.push({
        text:"Log In",
        onPress:login
      })
    }
    Alert.alert(
      title,
      text,
      buttons,
    );
  } else execute();
};

export const getErrorMessage = (error) => {
  const error_message = "";
  console.log("Error Code : ", error.code);
  switch (error.code) {
    case "auth/invalid-credential":
      return "How far enter correct details";
    case "auth/invalid-email":
      return "How far, your email no make sense.";

    case "auth/network-request-failed":
      return "See, network no dey";

    case "auth/user-disabled":
      return "Dem don disable this account";

    case "auth/email-already-in-use":
      return "How far, dem don use this email...";

    case "auth/user-not-found":
      return "Sorry! IB App no recognize this user";

    case "auth/wrong-password":
      return "How far, na wrong password you enter";

    default:
      return error.message;
  }
};
