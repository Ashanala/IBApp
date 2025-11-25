
import Link,{isIBUser} from '../tools/components/Link';
import {View,Text,TouchableOpacity,TextInput,StyleSheet,FlatList,ActivityIndicator} from "react-native"
import {Ionicons} from "@expo/vector-icons"
import {useState,useEffect,useContext} from 'react';
import {fb} from "../tools/firebase/IBFirebase"

import {BannerAd, BannerAdSize} from "react-native-google-mobile-ads";
import {getBannerAdId} from "../tools/AdTools"
import {SafeAreaView} from "react-native-safe-area-context";

import {AppContext} from "../AppContext.js"
import {IBColors,ColorIndex,ColorContext,getColorStyle} from "../IBColors"

export default function SearchView(props){
  const [users_list,setUsersList] = useState([]);
  const [search_text,setSearchText] = useState("");
  const [loading_users,setLoadingUsers] = useState(false);
  const [count,setCount] = useState(5);
  const [is_id,setIsID] = useState(false);
  const [has_reached_end,setHasReachedEnd] = useState(false);
  
  const {user} = useContext(AppContext);
  const {theme} = useContext(ColorContext);
  const banner_ad_id = getBannerAdId(false);
  
  useEffect(()=>{
    getUsers();
  },[count])
  const getUsers = async ()=>{
    if(search_text!=""){
      setLoadingUsers(true);
      const list = [];
      try{
        if(is_id){
          list.push({id:search_text});
        }
        else{
          const snap = await fb.getUsers(search_text,count);
          snap.docs.forEach((data)=>{
            const user = data.data();
            const user_id = "IB:"+data.id;
            console.log("User : ",user_id," (",user.username,")");
            list.push({id:user_id,username:user.username});
          })
        }
        setUsersList((prev)=>{
          setHasReachedEnd(prev.length==list.length);
           return list;
          });
      }catch(error){
        console.log("Cannot get users : ",error);
      }
      setLoadingUsers(false);
    }
    else{
      const list = [];
      console.log("USER ID : ",user?.id);
      if(user?.id){
        fb.getStarredUsers(user.id,count).then((snap)=>{
          const docs = snap.docs;
          console.log("Snap : ",snap, " => ",snap.exists);
          docs.forEach((doc)=>{
            console.log(" User : ",doc);
            const user_id = "IB:"+doc.data().id;
            list.push({id:user_id});
          })
          setUsersList((prev)=>{
          setHasReachedEnd(prev.length==list.length);
           return list;
          });
        }).catch((error)=>{
          console.log("Cannot Get Starred  Users : ",error);
        })
      }
      else{
        setUsersList([]);
      }
    }
  }
  
  const renderItem = ({item,index})=>{
    return <View style={{margin:10}}>
      <Link href={item.id} text={"User"} hide_invalid/>

    </View>
  }
  
  const main_color = getColorStyle(theme);
  const sub_color = getColorStyle(theme,[0]);
  const result_color = getColorStyle(theme,[1]);
  const see_more_color = getColorStyle(theme,[1,0]);
  return <View style={{flex:1,backgroundColor:(main_color._bkg+"ee")}}>
        <SafeAreaView
      style={{justifyContent:"center",alignItems:"center"}}
      edges={["left", "right", "top"]}
    >
      <BannerAd unitId={banner_ad_id} size={BannerAdSize.BANNER} />
    </SafeAreaView>
    <View style={{margin:10,padding:10}}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
        <Ionicons name="search" size={40} color={main_color._elm}/>
        <Text style={{fontSize:25,color:main_color._elm}}> Search IBApp </Text>
      </View>
      <View style={{flexDirection:'row'}}>
      <TextInput style={{borderWidth:1,borderRadius:5,padding:8,margin:5,fontSize:15, flex:1,color:main_color._elm}} placeholder="Search..." onChangeText={(text)=>{
            const v = isIBUser(text);
            console.log(" IS ID : ",v);
            setIsID(v);
            setSearchText(text.trim());
          }
      }/>
      <TouchableOpacity style={[styles.button,sub_color.bkg]} onPress={()=>{
        if(count==5) getUsers();
        else setCount(5);
      }
      }>
          <Ionicons name="person" size={30} color={sub_color._elm}/>
          <Text style={[styles.button_text,sub_color.elm]}> User</Text></TouchableOpacity>
      </View>
    </View>
    <View style={[{margin:10,flex:1,height:"100%"},result_color.bkg]}>
      <FlatList
        data={users_list}
        keyExtractor={(item)=>item.id}
        renderItem={renderItem}
        contentContainerStyle={{padding:5}}
        ListFooterComponent={()=>{
          return ((users_list.length>1)&&(!has_reached_end))?(<TouchableOpacity style={{backgroundColor:see_more_color._bkg, justifyContent: 'center',alignItems:'center',borderTopLeftRadius:10,borderTopRightRadius:10,padding:5,flexDirection:'row'}} onPress={()=>{
            setCount(count+5);
          }}>
            <Text style={{color:see_more_color._elm,fontStyle:'italic',fontWeight:'500',marginLeft:10}}> See More</Text>
            {loading_users&&(<ActivityIndicator color={see_more_color._elm}/>)}
          </TouchableOpacity>):(
            <View style={{
              justifyContent:'center',
              alignItems:'center'
            }}>
              {loading_users?(<ActivityIndicator color={main_color._elm}/>):(<Text style={{fontStyle:'italic',fontWeight:'500',color:result_color._elm}}> {is_id?"User ID":(users_list.length>0?((users_list.length)+" Result"+(users_list.length>1?"s":"")):"No Users")}</Text>)}
            </View>
          )
        }}/>
    </View>
  </View>
}

const styles = StyleSheet.create({
  button : {
    flexDirection:'row',
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:IBColors.surface[ColorIndex.BASIC],
    padding:5,
    borderRadius:2,
    margin:5,
  },
  button_text : {
    fontSize:15,
    color:'#fff',
    fontStyle:'italic',
    fontWeight:'500'
  }
})