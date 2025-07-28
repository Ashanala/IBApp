import {
  getMediaLibraryPermissionsAsync,
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";

export function loadVisualMedia(
  props = {
    type: ImagePicker.MediaType.Images,
    onLoaded: (files) => {},
    onCancel: () => {},
    onError: (error) => {},
    limit: 0,
    allowsEditing: false,
  }
) {
  const limit = props.limit || 1;
  const allowsEditing = props.allowsEditing || false;
  //console.log("Loading ", limit, "Media");
  const launchLibrary = async (type) => {
    console.log("Lunching...");
    const img = await launchImageLibraryAsync({
      mediaTypes: type,
      selectionLimit: limit,
      allowsMultipleSelection: !allowsEditing && true,

      allowsEditing: allowsEditing,
    });
    console.log("DONE ...",img);
    if (!img.canceled){
      props.onLoaded(img.assets);
    }
    else {
      console.log("Ho Ho")
      props.onCancel();
    }
  };
  console.log("Ha!");
  getMediaLibraryPermissionsAsync()
    .then(async (value) => {
      console.log(value);
      if (value.granted) launchLibrary(props.type);
      else
        requestMediaLibraryPermissionsAsync()
          .then(async (value) => {
            if (value.granted) launchLibrary(props.type);
            else props.onError("Media Permission Denied!");
          })
          .catch(() => {
            props.onError(e);
          });
    })
    .catch((e) => {
      console.log("Hey Eiiii");
      props.onError(e);
    });
}
