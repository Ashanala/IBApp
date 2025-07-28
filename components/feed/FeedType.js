export default FeedType = {
  CONNECT: "connect", //regular feed for chatting
  DAY: "day", //feed for viewing the day
  USER: "user", //feed for viewing the posts of a particular user
};

export const FeedQueryMode = {
  SNAPSHOT : "snapshot",
  TOP_ADD : "top_add",
  BOTTOM_ADD : "bottom_add",
}

export const getFeedTypeReverse = (type)=>{
  switch(type){
    case FeedType.CONNECT : return true;
    case FeedType.DAY: return false;
    case FeedType.USER: return true;
  }
}