import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {useEffect, useState,useContext} from "react";
import {IBColors,ColorIndex,ColorContext} from "./IBColors"
import {fb} from "./tools/firebase/IBFirebase"

export default function LoadingPage(props) {
  const [thickIBFade] = useState(new Animated.Value(0));
  const [pointIBFade] = useState(new Animated.Value(1));
  const [titleTranslate] = useState(new Animated.Value(0));
  const [subtitleFade] = useState(new Animated.Value(0));
  
  const {theme_updated} = useContext(ColorContext);

  useEffect(() => {
    const width = Dimensions.get("window").width;
    const duration = 2000;
    Animated.loop(
      Animated.sequence([
        Animated.timing(thickIBFade, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(thickIBFade, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pointIBFade, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(pointIBFade, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.sequence([
      Animated.timing(titleTranslate, {
        toValue: (width - 250) / 2,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      if(theme_updated){
        console.log("End");
        console.log("Loading MainPage...");
        props.navigation.replace("IBMain");
      }
    });
  }, [theme_updated]);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
      }}
    >
      <Animated.View style={[styles.blinkingImage, {opacity: thickIBFade}]}>
        <Image
          source={require("../assets/IBApp(512).png")}
          style={{width: 200, height: 200}}
        />
      </Animated.View>
      <Animated.View style={[styles.blinkingImage, {opacity: pointIBFade}]}>
        <Image
          source={require("../assets/IBAppLogo(Pointilism)(512).png")}
          style={{width: 200, height: 200}}
        />
      </Animated.View>
      <View style={{flex: 1}} />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            width: 250,
            justifyContent: "center",
            alignItems: "center",
            transform: [{translateX: titleTranslate}],
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 25,
              fontWeight: "bold",
              fontStyle: "italic",
              fontFamily: "Roboto",
            }}
          >
            Welcome to IB App
          </Text>
          <Animated.View style={{opacity: subtitleFade}}>
            <Text
              style={{
                color: IBColors.elements[ColorIndex.BASIC],
                fontSize: 15,
                fontWeight: "600",
                fontStyle: "italic",
              }}
            >
              Stay Informed. Stay Organized.
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blinkingImage: {
    position: "absolute",
    bottom: 0,
    top: 0,
    right: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
