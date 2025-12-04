
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import IBMain from "./components/IBMain"
import LoadingPage from "./components/LoadingPage";
import {StatusBar} from "expo-status-bar";
import * as Notifications from "expo-notifications";
import {IBTheme} from "./components/tools/constants/ThemeFile";
import {navigationRef} from "./components/RootNavigator"
import {notificationSettings} from "./components/tools/NotificationTools"
import {useEffect,useState} from "react"
import Test from "./components/Test"
import {DefaultScheme,DefaultScheme1,DefaultScheme2,DefaultScheme3,ColorContext,getColorStyle} from "./components/IBColors"
import * as Application from "expo-application"
import {fb} from "./components/tools/firebase/IBFirebase"
import AsyncStorage from "@react-native-async-storage/async-storage";
//import {useFonts} from "expo-font"
import * as Font from "expo-font"
import {Ionicons} from "@expo/vector-icons"

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
  const [theme,setTheme] = useState(DefaultScheme1);
  const [theme_updated,setThemeUpdated] = useState(false);
  const [font_loaded,setFontLoaded] = useState(false);
  
  /*const [font_loaded] = useFonts({
    ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  });*/
  
  useEffect(()=>{
    notificationSettings().then(async ()=>{
      const device_id = Application.getAndroidId();
      const theme = await fb.getTheme(device_id)
      if(theme){
        
        const theme_string = JSON.stringify(theme);
        console.log("Web Theme : ",theme_string);
        await AsyncStorage.setItem("theme",theme_string);
        setTheme(JSON.parse(theme_string));
      }
      else{
        const stored_theme = await AsyncStorage.getItem("theme");
        if(stored_theme){
          console.log("Local Theme : ",stored_theme);
          const theme = JSON.parse(stored_theme);
          setTheme(theme)
        }
        else console.log("No THEME!!");
      }
      
    }).finally(()=>{
      setThemeUpdated(true);
      console.log("Device ID : ",device_id);
      console.log("THEME UPDATED!!!");
    })
  },[])
  
/*  useEffect(()=>{
    async function loadFonts (){
      await Font.loadAsync({...Ionicons.font});
      setFontLoaded(true);
    }
    loadFonts();
  },[])*/
  
  useEffect(() => {
    async function loadFonts() {
      try {
        // THIS IS THE CRITICAL PART - Manually load the Ionicons font
        await Font.loadAsync({
          Ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
        });
        console.log('✅ Fonts loaded successfully');
      } catch (error) {
        console.error('❌ Font loading error:', error);
      } finally {
        setFontLoaded(true);
        //SplashScreen.hideAsync();
      }
    }
    
    loadFonts();
  }, []);
  
  useEffect(()=>{
    console.log("THEME : ",theme);
  },[theme])
  
  useEffect(()=>{
    console.log("FONTS : ",font_loaded);
  },[font_loaded])
  
  const header_color = getColorStyle(theme);
  
  return (
    <ColorContext.Provider value={{theme,setTheme,theme_updated,font_loaded}}>
    <NavigationContainer ref={navigationRef}>
      <StatusBar translucent />
      <Stack.Navigator
        screenOptions={{
          headerStyle: header_color.bkg,
          headerTintColor: header_color._elm,
        }}>
       {/*<Stack.Screen
          name="Search Test"
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
    </ColorContext.Provider>
  );
}
