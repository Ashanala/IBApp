import FeedType from "./feed/FeedType";
import {createNavigationContainerRef,CommonActions,StackActions} from "@react-navigation/native"
import {fb} from "./tools/firebase/IBFirebase"
export const navigationRef = createNavigationContainerRef();

export function navigate(name,params){
  if(navigationRef.isReady()){
    navigationRef.navigate(name,params);
  }
  else{
    console.log("CANNOT NAVIGATE TO ",name," : ",params);
  }
}

export function reset(name,sub){
  if(navigationRef.isReady()){
    navigationRef.dispatch(CommonActions.reset({
      index:0,
      routes:[
        {
          name:name,
          routes:[{
              name:sub
              }]
        }]
    }));
  }
}

export function replace(name,params){
  if(navigationRef.isReady()){
    navigationRef.dispatch(StackActions.replace(name,params));
  }
  else{
    console.log("CANNOT REPLACE WITH ",name," : ",params);
  }
}

export function push(name,params){
  if(navigationRef.isReady()){
    navigationRef.dispatch(StackActions.push(name,params));
  }
}

export function navigateToUser(page_user,isMainUser){
    push("IBMain", {
      screen:"UserPage",
      params:{
        pageUser:page_user,
        isMainUser: isMainUser,
      }
    });
}

export function navigateToUser_ID(page_user,isMainUser){
    push("IBMain", {
      screen:"UserPage",
      params:{
        pageUser:{id:page_user},
        isMainUser: isMainUser,
      }
    });
}

export function navigateToPost(time){
  push("IBMain",{
      screen: "Feed",
      params: {
        type: FeedType.DAY,
        data: {epochMillisec: time - 1000},
      },
    });
}

export function navigateToPost_ID(post_id){
  fb.getDocument(["posts",post_id]).then((post)=>{
    if(post.exists){
      navigateToPost(post.data().time);
    }
  });
}

export function navigateToMessages(recepient_id,recepient_name){
  push("IBMain",{
    screen:"MessageView",
    params:{
      recepient:{id:recepient_id,name:recepient_name},
    }
  });
}