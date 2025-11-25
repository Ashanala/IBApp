import React, {useState,useEffect,useRef} from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  Modal,
  ToastAndroid,
  Alert,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import Selector from "./Selector";
import IBDate from "../calendar/calendar_tools/IBDate";
import Calendar from "../calendar/calendar";
import CONST from "../tools/constants/CONST";
import PagerView from "react-native-pager-view";
import THEME from "../tools/constants/THEME";
import PostTile from "../feed/post_tile";
import {fb} from "../tools/firebase/IBFirebase";
import {BannerAd, BannerAdSize} from "react-native-google-mobile-ads";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import DateOptionsView from "./DateOptionsView";
import * as NetInfo from "@react-native-community/netinfo";
import FeedType from "../feed/FeedType";
import {IBTheme, xIBTheme} from "../tools/constants/ThemeFile";
import LoginView from "../tools/components/LoginView"
import {IBColors,ColorIndex,getColorStyle,ColorContext} from "../IBColors"
import {getBannerAdId} from "../tools/AdTools"


import {AppContext} from "../AppContext"
import {useContext,useCallback} from "react"
import {useIsFocused} from "@react-navigation/native"

export default function MainPage(props){
    const {theme} = useContext(ColorContext);
    const isFocused = useIsFocused();
    const {user,is_online,setShowNav} = useContext(AppContext)
    const [date,setDate] = useState(new IBDate(new Date(Date.now())));
    const [isLoading,setIsLoading] = useState(false);
    const [pins,setPins] = useState([]);
    const [current_pin,setCurrentPin] = useState(0);
    const [show_date_options,setShowDateOptions] = useState(false);
    const [clicked_date,setClickedDate] = useState({});
   // const [is_online,setIsOnline] = useState(false);
    const pin_swipe_handle = useRef();
    const resume_swipe_timeout = useRef();
    const [pin_snapshot,setPinSnapshot] = useState();
    const [show_pins,setShowPins] = useState(true);
    const pagerRef = useRef();
    
    useEffect(()=>{
      
    },[isFocused])
    

  const startAutoSwipe = useCallback(()=>{
    clearInterval(pin_swipe_handle.current);
    if (pins.length > 0) {
      pin_swipe_handle.current = setInterval(() => {
          if (pins.length > 0) {
            setCurrentPin((old_pin)=>{
              const next_pin =
              (old_pin + 1) % pins.length;
              console.log("Moving to : ",next_pin);
              return next_pin;
            })
          }
        }, 8000);
    }
  });
  
  const stopAutoSwipe = useCallback(()=>{
    clearInterval(pin_swipe_handle.current);
    if(resume_swipe_timeout.current){
      clearTimeout(resume_swipe_timeout.current)
    }
  })
  
  useEffect(()=>{
    const rand = Math.random();
    console.log("Rand : ",rand);
    console.log("Length : ",pins.length);
    const rand_num = rand*pins.length;
    console.log("Rand Num : ",rand_num);
    const index = Math.floor(rand_num);
    console.log("current : ",index);
    setCurrentPin(index);
    startAutoSwipe();
  },[pins])
  
  useEffect(()=>{
    pagerRef?.current?.setPage(current_pin);
    console.log(" At ",current_pin);
  },[current_pin]);
  
  const getPinsPost = async(docs)=>{
    const post_list = [];
    for (let i = 0; i < docs.length; i++) {
      console.log(i," : ",docs[i].data().post);
      try {
        const doc = await fb
          .getDocument(["posts",docs[i].data().post]);

        const post = {id:doc.id,data:doc.data()};
        const title = docs[i].data().title;
        post_list.push({
          title,
          post,
        });
      } catch (error) {
        console.log("Cannot Get Pin Post : ", error);
      }
    }
    return post_list;
  }
  
  useEffect(() => {
    if(pin_snapshot){
      try{
        pin_snapshot();
        console.log("UNSUBSCRIBING Pins Snapshot")
      }catch(e){
        console.log("Error!!!!!!");
      }
    }
    if (is_online) {
      console.log("IS ONLINE");
      const unsubscribe = fb.onPinsSnapshot(
      async (snapshot) => {
        console.log("PINS SNAPSHOT");
        if(snapshot.empty){
          console.log("EMPTY SNAPSHOT");
        }
        else{
          const pins = await getPinsPost(snapshot.docs);
          setPins(pins);
        }
      });
      setPinSnapshot(unsubscribe);
    }
  },[is_online]);

  const navigateToDayFeed = (time) => {
    setShowDateOptions(false);
    console.log("TIME : ",time);
    props.navigation.navigate({
      name: "Feed",
      params: {
        type: FeedType.DAY,
        data: {epochMillisec: time - 1000},
      },
    });
  }
  
  const navigateToTopFeed = ()=>{
    props.navigation.navigate({
      name:"Feed",
      params:{
        type:FeedType.TOP,
      }
    })
  }
  
  const navigateToLatestFeed = ()=>{
    props.navigation.navigate({
      name:"Feed",
      params:{
        type:FeedType.LATEST,
      }
    })
  }

  const selectPinPost = (event) => {
    if (pins.length>0) {
      setCurrentPin(event.nativeEvent.position);
    }
  };

 const datePressed = (in_date, localday) => {
   console.log("IN DATE : (",in_date,",",localday,")");
    const new_clicked_date = new Date(
      date.year,
      date.month - 1,
      in_date,
      1,
      0,
      0,
      0
    );
    clicked_date.epochMillisec = new_clicked_date.getTime();
    console.log("TIME : ",clicked_date.epochMillisec);
    clicked_date.date = new_clicked_date.getDate();
    clicked_date.day =
      CONST.Day[new_clicked_date.getDay()] + ", " + CONST.LocalDay[localday];
    clicked_date.year = new_clicked_date.getFullYear();
    clicked_date.month = CONST.Month[new_clicked_date.getMonth()];
    clicked_date.is_after_launch = new IBDate(
      new_clicked_date
    ).isGreaterThan(new IBDate({...CONST.lauchDate}));
    clicked_date.is_before_tommorow = new IBDate(
      new_clicked_date
    ).isLesserThan(new IBDate(new Date(Date.now()+1000*60*60*24)));
    
    setClickedDate({...clicked_date});
    setShowDateOptions(true);
  };

  const changeMonth = (forward) => {
    const year = date.year;
    if (date.month == 1 && !forward) date.shiftMonth(11);
    else if (date.month == 12 && forward)
      date.shiftMonth(-11);
    else{
      date.shiftMonth(forward ? 1 : -1);
    }
    setDate(new IBDate(date));
  };

  const changeYear = (forward) => {
    date.shiftMonth(forward ? 12 : -12);
    setDate(new IBDate(date));
  }

  const dismissDateOptionsView = () => {
    setShowDateOptions(false);
  };
    const calendar_width = Dimensions.get("window").width * 0.135;
    date.firstDay();
    const today = new IBDate(new Date(Date.now()));

    const offline_pinview_text =
      "You are offline. \n Go online to see What's Up in Ibillo.";
    const loading_pinview_text = "Loading...";
    const online_info = "Explore Posts";
    const offline_info = "You're offline";

    const banner_ad_id = getBannerAdId(false);

    const main_color = getColorStyle(theme);
    const panel_color = getColorStyle(theme,[0]);
    const panel_inner_color = getColorStyle(theme,[0,0]);
    const panel_other_color = getColorStyle(theme,[0,1]);
    const feed_color = getColorStyle(theme,[1]);
    const feed_element_color = getColorStyle(theme,[1,0]);
    return (
      <View style={[styles.main,main_color.bkg]} onTouchStart={()=> setShowNav(false)}>
        <Modal
          visible={show_date_options}
          transparent
          onRequestClose={dismissDateOptionsView}
        >
          <DateOptionsView
            dismiss={dismissDateOptionsView}
            {...clicked_date}
            onSeePostPress={()=>navigateToDayFeed(clicked_date.epochMillisec)}
          />
        </Modal>
        <SafeAreaView
          style={styles.bannerAdView}
          edges={["left", "right", "top"]}
        >
          <BannerAd unitId={banner_ad_id} size={BannerAdSize.BANNER} />
        </SafeAreaView>
        <Selector
          value={date.year}
          style={[styles.year_selector,panel_color.bkg]}
          onChange={changeYear}
          color = {panel_color._elm}
        />
        <Selector
          value={CONST.Month[date.month - 1]}
          style={[styles.year_selector,panel_color.bkg]}
          onChange={changeMonth}
          color={panel_color._elm}
        />
        <View style={[styles.calendar_view,panel_color.bkg]}>
          <Calendar
            date={Object.assign({},date)}
            width={calendar_width}
            today={today}
            onPress={datePressed}
            color = {panel_color._elm}
            today_bg = {panel_inner_color._bkg}
            osavoh_bg = {panel_other_color._bkga("55")}
            today_osavoh_bg={panel_other_color._bkg}
          />
        </View>
        <View style={styles.bottom_panel}>
          <View style={[styles.today,panel_color.bkg]}>
            <Text style={[styles.today_text,panel_color.elm]}>{today.toText()}</Text>
            <TouchableOpacity style={[styles.pin_hider,feed_color.bkg]}
            onPress={()=>{
              setShowPins((prev_show)=>{
                return !prev_show;
              })
            }}
            >
              <Ionicons name={show_pins?"close":"chevron-down"} size={20} color={feed_color._elm}/>
            </TouchableOpacity>
          </View>
          {show_pins&&(<SafeAreaView
            style={styles.bottom_feed_panel}
            edges={["left", "right", "bottom"]}
          >
            <PagerView
              style={[styles.pinview,feed_color.bkg]}
              ref={pagerRef}
              onPageSelected={selectPinPost}
              onTouchStart={stopAutoSwipe}
              onTouchEnd={()=>{
                resume_swipe_timeout.current = setTimeout(()=>{
                  startAutoSwipe();
                },3000)
              }}
            >
              {pins.length == 0 ? (is_online ? (
                  <View style={styles.loading_pinview}>
                    <Text style={[styles.loading_pinview_text,feed_color.elm]}>
                      {loading_pinview_text}
                    </Text>
                    <ActivityIndicator color={feed_color._elm} />
                  </View>
                ) : (
                  <View style={[styles.offline_pinview,feed_element_color.bkg]}>
                    <Ionicons name="cloud-offline" size={50} color={feed_element_color._elm}/>
                    <Text style={[styles.offline_pinview_text,feed_element_color.elm]}>
                      {offline_pinview_text}
                    </Text>
                  </View>
                )
              ) : (
                pins.map((value, index, array) => {
                  return (
                    <PostTile
                      pin
                      post = {value.post}
                      title={value.title}
                      disabled={!is_online}
                      key={index}
                      onPress={() =>navigateToDayFeed(value.post?.data?.time)}
                    />
                  );
                })
              )}
            </PagerView>
            {!is_online?
            (<View
              style={[styles.feed_button,feed_color.bkg]}
            >
              <Ionicons
                name={"cloud-offline"}
                color={feed_color._elm}
                size={50}
              />
              <Text style={[styles.feed_button_text,feed_color.elm]}>
                {offline_info}
              </Text>
            </View>):(
            <View style={[styles.feed_button,feed_color.bkg]}>
              <TouchableOpacity style={[styles.feed_inner_button,feed_element_color.bkg]} onPress={navigateToTopFeed}>
                <Ionicons name="flame" size={30} color="#fc5"/>
                <Text style={[styles.feed_inner_button_text,feed_element_color.elm]}> Top 🔥 </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.feed_inner_button,feed_element_color.bkg]} onPress={navigateToLatestFeed}>
                <Ionicons name="flash" size={30} color="#5cf"/>
                <Text style={[styles.feed_inner_button_text,feed_element_color.elm]}> Latest 🆕 </Text>
              </TouchableOpacity>
            </View>)}
          </SafeAreaView>)}
        </View>
      </View>
    );
  }

const styles = StyleSheet.create({
  main: {
    justifyContent: "center",
    flex: 1,
    backgroundColor: IBColors.background[ColorIndex.BASIC],
  },
  calendar_view: {
    minHeight: 350,
    backgroundColor: IBColors.surface[ColorIndex.BASIC],
    marginVertical: 2,
  },
  year_selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: IBColors.surface[ColorIndex.BASIC],
    borderRadius: 10,
    margin: 1,
  },
  today_text: {
    fontSize: 18,
    fontStyle: "italic",
    color: THEME.textColor0,
    textAlign: "center",
  },
  today: {
    backgroundColor: IBColors.surface[ColorIndex.BASIC],
    marginBottom: 2,
  },
  feed_button: {
    backgroundColor: IBColors.surface[ColorIndex.DISTINCT],
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderRadius: 10,
    flex: 1,
  },
  bannerAdView: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    paddingBottom: 5,
  },
  feed_button_text: {
    fontWeight: "800",
    fontStyle: "italic",
    borderWidth: 1,
    padding: 2,
    borderRadius: 3,
    textAlign: "center",
    marginBottom: 2,
  },

  offline_pinview_text: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "white",
  },
  offline_pinview: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: IBColors.surface[ColorIndex.EXTRA],
    minWidth: "60%",
    padding: 10,
    flex: 1,
  },
  loading_pinview_text: {fontStyle: "italic", fontWeight: "600"},
  loading_pinview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pinview: {
    flex: 3,
    margin: 10,
    backgroundColor: IBColors.surface[ColorIndex.DISTINCT],
  },
  bottom_feed_panel: {flexDirection: "row", flex: 1},
  bottom_panel: {flex: 1},
  feed_inner_button:{
                backgroundColor:IBColors.layer[ColorIndex.DISTINCT],
                justifyContent:'center',
                alignItems: 'center',
                padding:8,
                borderRadius:5,
                marginVertical:3
  },
  feed_inner_button_text:{
                  color:'#fff',
                  fontStyle:'italic',
                  fontWeight: '500',
                },
  pin_hider : {
              position:'absolute',
              top:-10,
              right:10,
              width:20,
              height:20,
              justifyContent: 'center',
              borderRadius:15
            }
});
