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
    /*const data = await fetch(filesrc); // get file data
    const blob = await data.blob(); // convert file data to blob*/
    const fileRef = ref(this.getStorage(),path);
    return fileRef.putFile(filesrc); //upload blob to server (at "path")
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
  
  feedQuery(type,data,count,mode){
    console.log("He he ",type);
    const posts = this.resolveFieldLink(["posts"]);
    console.log("Ha : ",type);
    const time = data?.epochMillisec||Date.now();
    switch(type){
      case FeedType.CONNECT:{
        const order = mode==FeedQueryMode.BOTTOM_ADD?"asc":"desc";
        const rel = mode==FeedQueryMode.BOTTOM_ADD?">":"<";
        console.log(order,"  ",rel,"  ",time)
        return query(
          posts,
          orderBy("time",order),
          where("time",rel,time),
          limit(count));
      }
      case FeedType.DAY :{
        const order = mode==FeedQueryMode.TOP_ADD?"desc":"asc";
        const rel = mode==FeedQueryMode.TOP_ADD?"<":">";
        return query(
          posts,
          orderBy("time",order),
          where("time",rel,time),
          limit(count))
      }
      case FeedType.USER :{
        const order = mode==FeedQueryMode.BOTTOM_ADD?"asc":"desc";
        const rel = mode==FeedQueryMode.BOTTOM_ADD?">":"<";
        return query(
            posts,
            where("poster","==",data.poster),
            orderBy("time",order),
            where("time",rel,time),
            limit(count)
          );
      }
    }
  }
  
  async onPostSnapshot(type,data,count,callback){
    try{
      console.log("Here : ",type);
      const postsQuery = this.feedQuery(type,data,count,FeedQueryMode.SNAPSHOT);
      console.log("Query : ",query);
      return onSnapshot(postsQuery,callback);
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
      const postsQuery = this.feedQuery(type,data,count,mode);
      return getDocs(postsQuery);
    }
    catch(reason){
      this.crash_log(`getMorePosts Error : ${reason}`);
      throw reason;
    }
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
}

export const fb = new Firebase();
