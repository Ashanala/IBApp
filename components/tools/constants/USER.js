export default class USER {
  static users = {
    user0: {
      email: "ashanalaolowojaiye@gmail.com",
      username: "ashanala",
      password: "helloworld",
      stars: 100,
      photo: {
        uri: "file:///storage/emulated/0/DCIM/Camera/IMG_20240817_122906_245~3.jpg",
        width: 1920,
        height: 2560,
      },
      total_posts: 100,
      total_hearts: 18,
      id: "",
    },
    user1: {
      email: "preshilaashboy@gmail.com",
      username: "preshila",
      stars: 500,
      photo: {
        uri: "file:///storage/emulated/0/DCIM/Camera/IMG_20240817_122858_100~3.jpg",
        width: 1920,
        height: 2560,
      },
    },
    user2: {
      email: "daily",
      username: "dailysport",
      stars: 1012,
      photo: {
        uri: "file:///storage/emulated/0/Pictures/Screenshot/Screenshot_20240720-104524.jpg",
        width: 720,
        height: 1612,
      },
    },
    total_posts: 1024,
    total_hearts: 22323,
  };

  static default_user = {};
}

// "overrides": {
//     "@expo/config-plugins": "~9.0.0",
//     "@expo/prebuild-config": "~8.0.0"
//   },