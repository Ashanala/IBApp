import {getApp} from "@react-native-firebase/app"
import {getAuth} from "@react-native-firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  where,
  query,
  getDocs,
  increment,
  startAt,
  endAt,
} from "@react-native-firebase/firestore";
import {getStorage,ref,
  getDownloadURL,
  putFile,
  refFromURL,
  deleteObject} from "@react-native-firebase/storage"
import {getCrashlytics} from "@react-native-firebase/crashlytics"

import FeedType,{FeedQueryMode} from "../../feed/FeedType";

class Firebase {
  constructor(){
    this.app = getApp();
  }
  getAuth() {
    return getAuth(this.app);
  }

  getFireStore() {
    return getFirestore(this.app);
  }

  getStorage() {
    return getStorage(this.app);
  }
  
  getCrashlytics(){
    return getCrashlytics(this.app);
  }

  async uploadFile(path, filesrc) {
    const fileRef = ref(this.getStorage(),path);
    return putFile(fileRef,filesrc); //upload blob to server (at "path")
  }

  async requestFileUrl(path) {
    const fileRef = ref(this.getStorage(),path);
    return getDownloadURL(fileRef);
  }
  
  async deleteFile(url){
    const fileRef = refFromURL(this.getStorage(),url);
    return deleteObject(fileRef);
  }
  
  resolveFieldLink(field_link){
    let docRef = this.getFireStore();
    for(let i = 0;i<field_link.length;i++){
      if(i%2==0){
        docRef = collection(docRef,field_link[i])
      }
      else{
        docRef = doc(docRef,field_link[i]);
      }
    }
    return docRef;
  }
  
  async addDocument(field_link,data){
    const docRef = this.resolveFieldLink(field_link);
    return addDoc(docRef,data);
  }
  
  async getDocument(field_link){
    const docRef = this.resolveFieldLink(field_link);
    try{
      return await getDoc(docRef);
    }
    catch(reason){
      throw reason;
    }
  }
  
  async getDocuments(field_link,order,count){
    const docRef = this.resolveFieldLink(field_link);
    const colQuery = count?query(
      docRef,
      orderBy(order.field,order.order),
      limit(count)):query(
      docRef,
      orderBy(order.field,order.order));
    return getDocs(colQuery);
  }
  
  async setDocument(field_link,data,merge){
    console.log("SEE MEE IN SET")
    try{
      const docRef = this.resolveFieldLink(field_link);
      await setDoc(docRef,data,{merge:merge});
    }catch(reason){
      throw reason;
    }
  }
  
  async updateDocument(field_link,data){
    const docRef = this.resolveFieldLink(field_link);
    return updateDoc(docRef,data);
  }
  
  async deleteDocument(field_link){
    const ref = this.resolveFieldLink(field_link);
    await deleteDoc(ref);
  }

  async onUserSnapshot(id,callback){
    const user = this.resolveFieldLink(["users",id]);
    return onSnapshot(user,callback)
  }
  
  async onPinsSnapshot(callback){
    const pins = this.resolveFieldLink(["pins"]);
    return onSnapshot(pins,callback);
  }
  
  async onCommentsSnapshot(post_id,count,callback){
    const comments = this.resolveFieldLink(["posts",post_id,"comments"]);
    const commentQuery = query(comments,orderBy("time","desc"),limit(count));
    return onSnapshot(commentQuery,callback);
  }
  
  async onMessagesSnapshot(user_id,count,callback){
    const messages = this.resolveFieldLink(["users",user_id,"notifications"]);
    const messageQuery = query(
      messages,
      orderBy("time","desc"),
      limit(count));
    return onSnapshot(messageQuery,callback);
  }
  
  dateFeedQuery(data,count,mode){
    const posts = this.resolveFieldLink(["posts"]);
    const time = data?.epochMillisec||Date.now();
    const order = mode==FeedQueryMode.TOP_ADD?"desc":"asc";
    const rel = mode==FeedQueryMode.TOP_ADD?"<":">";
    return query(
      posts,
      orderBy("time",order),
      where("time",rel,time),
      limit(count)
    );
  }
  
  topFeedQuery(data,count){
    const posts = this.resolveFieldLink(["posts"]);
    const traffic = data?.traffic||Number.MAX_SAFE_INTEGER;
    const poster = data?.poster;
    if(poster){
      return query(
        posts,
        where("poster","==",poster),
        orderBy("traffic","desc"),
        where("traffic","<",traffic),
        limit(count)
      );
    }
    else{
      return query(
        posts,
        orderBy("traffic","desc"),
        where("traffic","<",traffic),
        limit(count)
      );
    }
  }
  
  latestFeedQuery(data,count){
    const posts = this.resolveFieldLink(["posts"]);
    const time = data?.epochMillisec||Date.now();
    const poster = data?.poster;
    console.log(" Time : ",time);
    console.log(" Poster : ",poster);
    if(poster){
      console.log("Poster here");
      return query(
        posts,
        where("poster","==",poster),
        orderBy("time","desc"),
        where("time","<",time),
        limit(count)
      )
    }
    else{
      console.log("No Poster here")
      return query(
        posts,
        orderBy("time","desc"),
        where("time","<",time),
        limit(count)
      );
    }
  }
  
  async onPostSnapshot(type,data,count,callback){
    const onError = (error)=>{
      console.log("Get Posts Error : ",error);
    }
    try{
      console.log("Here : ",type);
      switch(type){
        case FeedType.DAY : 
        getDocs(this.dateFeedQuery(data,count,FeedQueryMode.INITIAL)).then(callback).catch(onError);
        break;
        case FeedType.TOP :
          getDocs(this.topFeedQuery(data,count)).then(callback).catch(onError);
          break;
        default : //FeedType.LATEST
          getDocs(this.latestFeedQuery(data,count)).then(callback).catch(onError);
      }
    }
    catch(reason){
      return ()=>{
        console.log("On Post Snapshot Error : ",reason);
      }
    }
  }
  
  async sendMessage(
    sender_id,
    sender_name,
    receiver_id,
    receiver_name,
    text,
    time){
    const msg_link = ["users",receiver_id,"notifications","message_"+sender_id+"_"+receiver_id+"_"+time]
    const message = this.resolveFieldLink(msg_link);
    const promise = setDoc(message,{
      time:Date.now(),
      sender:sender_name,
      receiver:receiver_name,
      sender_id:sender_id,
      receiver_id:receiver_id,
      text:text,
      text_link:"IB:"+sender_id,
    },{merge:true});
    const user_link = msg_link.slice(0,2);
    if(sender_id!=receiver_id)
    this.incrementField(user_link,"notifs",1);
  }
  
  async getMorePosts(type,data,count,mode){
    try{
      switch(type){
        case FeedType.DAY:
          return getDocs(this.dateFeedQuery(data,count,mode));
        case FeedType.TOP:
          return getDocs(this.topFeedQuery(data,count));
        default : //FeedType.LATEST
          return getDocs(this.latestFeedQuery(data,count));
      }
    }
    catch(reason){
      this.crash_log(`getMorePosts Error : ${reason}`);
      throw reason;
    }
  }
  
  async getUsers(text,count){
    const users = this.resolveFieldLink(["users"]);
    const usersQuery = query(
        users,
        where("verified","==",true),
        orderBy("username_lowercase"),
        startAt(text.toLowerCase()),
        endAt(text.toLowerCase()+"\uf8ff"),
        limit(count)
      );
    return getDocs(usersQuery);
  }
  
  async getStarredUsers(user_id,count){
    const starred_users = this.resolveFieldLink(["users",user_id,"starred"]);
    const starredUsersQuery = query(
        starred_users,
        orderBy("time","desc"),
        limit(count)
      );
    return getDocs(starredUsersQuery);
  }
  
  async incrementField(field_link,doc_field,amount){
    const docRef = this.resolveFieldLink(field_link);
    return updateDoc(docRef,{
      [doc_field] : increment(amount)
    });
  }
  
  async crash_log(text){
    this.getCrashlytics().log(text);
    console.log(text);
  }
  
  async getTheme(device_id){
    const device_ref = this.resolveFieldLink(["tokens",device_id]);
    const device_doc = await getDoc(device_ref);
    const data = device_doc.data();
     console.log("Device Data : ",data);
    if(data.theme){
      const name = data.theme;
      const theme_ref = this.resolveFieldLink(["themes",name]);
      const theme_doc = await getDoc(theme_ref);
      const theme = theme_doc.data();
      return theme?.theme;
    }
    return null;
  }
}

export const fb = new Firebase();
