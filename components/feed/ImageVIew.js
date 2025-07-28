import {Image, StyleSheet, TouchableHighlight, View} from "react-native";

export default function ImageView(
  props = {
    style: StyleSheet.compose(),
    source: [],
    onSelect: (index) => {},
    padding: 0,
    borderWidth: 0,
  }
) {
  const style = props.style || {};
  const padding = props.padding || 0;
  const borderWidth = props.borderWidth || 0;
  const source = props.source || [];
  var aspect_ratio = 1;
  if (props.source) {
    aspect_ratio =
      props.length > 0 ? props.source[0].width / props.source[1].height : 1;
  }

  let width = 250;
  const height = width / aspect_ratio;
  const cell_width = source.length == 1 ? width : width / source.length;
  const cell_height = height;
  if (source.length == 1) width = cell_width;

  return (
    props.source &&
    props.source.length > 0 && (
      <View
        style={[
          style,
          styles.main,
          {
            width: width + 2 * (padding + borderWidth),
            minHeight: height + padding + borderWidth,
            padding: padding,
            borderWidth: borderWidth,
          },
        ]}
      >
        {source.map((value, index, array) => {
          return (
            <TouchableHighlight
              key={index}
              onPress={() => {
                props.onSelect(index);
              }}
            >
              <Image
                source={
                  value?.uri == ""
                    ? require("../../assets/IBApp(512).png")
                    : value
                }
                style={{width: cell_width, height: cell_height}}
                key={index}
              />
            </TouchableHighlight>
          );
        })}
      </View>
    )
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
