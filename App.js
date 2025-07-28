import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import IBMain from "./components/IBMain"
import LoadingPage from "./components/LoadingPage";
import {StatusBar} from "expo-status-bar";
import * as Notifications from "expo-notifications";
import {IBTheme} from "./components/tools/constants/ThemeFile";
import {navigationRef} from "./components/RootNavigator"
import {notificationSettings} from "./components/tools/NotificationTools"
import {useEffect} from "react"
import Test from "./components/Test"

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldSetBadge: true,
      shouldPlaySound: true,
    };
  },
});

export default function App() {
  useEffect(()=>{
    notificationSettings();
  },[])
  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar translucent />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: IBTheme.backgroundColor},
          headerTintColor: IBTheme.defaultTextColor,
        }}
      >
       {/* <Stack.Screen
          name="Video Test"
          component={Test}/>*/}
        <Stack.Screen
          name="LoadingPage"
          component={LoadingPage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="IBMain"
          component={IBMain}
          options={{headerShown:false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
