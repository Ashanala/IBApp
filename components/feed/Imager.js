import { Dimensions, Image, Text, View } from "react-native";
import PagerView from "react-native-pager-view";

export default function Imager(
  props = { photos: [], index: 0, onCancel: () => {} }
) {
  const images = props.photos || [];
  const index = props.index || 0;
  return (
    <View style={{ flex: 1, backgroundColor: "#00000088" }}>
      <View style={{ flex: 1 }} onTouchStart={props.onCancel}></View>
      <View style={{ flex: 3 }}>
        <PagerView
          style={{ flex: 1 }}
          initialPage={index}
          children={images.map((value, index, array) => {
            return (
              <View
                key={index}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={value}
                  style={{
                    width: "100%",
                    height:
                      Dimensions.get("screen").width *
                      (value.height / value.width),
                  }}
                />
              </View>
            );
          })}
        />
      </View>
      <View style={{ flex: 1 }} onTouchStart={props.onCancel}></View>
    </View>
  );
}
