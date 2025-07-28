export default class POST {
  static default_post = {
    poster: "",
    text: "",
    // photos: [{ uri: "", width: 0, height: 0 }],
    photos: [],
    hearts: 0,
    time: 0,
  };
  static posts = {
    post1: {
      poster: "user0",
      text: "A spiritual gift is a special divine empowerment bestowed on a believer by the Holy Spirit to accomplish a given ministry.",
      photos: [
        {
          uri: "file:///storage/emulated/0/DCIM/Camera/IMG_20240817_122858_100~3.jpg",
          width: 1920,
          height: 2560,
        },
        {
          uri: "file:///storage/emulated/0/DCIM/Camera/IMG_20240817_122906_245~3.jpg",
          width: 1920,
          height: 2560,
        },
      ],
      hearts: 11234,
      time: 1727707248439,
    },
    post2: {
      poster: "user1",
      text: "How far guys",
      hearts: 100,
      time: 1727910027294,
    },
    post3: {
      poster: "user2",
      text: "Chelsea vs Man U => 2 : 0",
      hearts: 720,
      time: 1727912738502,
    },
    post4: {
      poster: "user1",
      text: "How far everybody.",
      hearts: 1000,
      time: 1728827519949,
    },
  };
}
