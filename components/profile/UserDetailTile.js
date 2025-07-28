import {
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import THEME from "../tools/constants/THEME";
import {Ionicons} from "@expo/vector-icons";
import {IBTheme, xIBTheme} from "../tools/constants/ThemeFile";

export default function UserDetailTile(
  props = {
    onPress: () => {},
    styles: {item_style: {}},
    quantity: 0,
    quantityName: "Quantity",
    iconName: "",
    buttonTitle: "",
    buttonInfo: "",
    loadingInfo: "",
    loadingAds: false,
    is_loading_quantity: false,
    hide_button:false,
  }
) {
  const props_styles = props.styles || {item_style: {}};
  const quantity = props.quantity || 0;
  const quantityName = props.quantityName || "Quantity";
  const iconName = props.iconName || "info";
  const buttonTitle = props.buttonTitle || "Button";
  const buttonInfo = props.buttonInfo || "Click Button";
  const loadingInfo = props.loadingInfo || "Loading...";
  const loadingAds = props.loadingAds || false;
  const is_loading_quantity = props.is_loading_quantity || false;
  const hide_button = props.hide_button||false;
  return (
    <View style={[props_styles.item_style, styles.main]}>
      <View style={styles.quantity_view}>
        {is_loading_quantity ? (
          <ActivityIndicator
            color={xIBTheme.tertiaryColor}
            style={{marginTop: 5}}
          />
        ) : (
          <Text style={styles.quantity}>{quantity}</Text>
        )}
        <Text style={styles.quantity_name}>{quantityName}</Text>
      </View>
      <View>
        {loadingAds && (
          <View style={styles.loading_view}>
            <ActivityIndicator size={"small"} color={THEME.textColor0} />
            <Text style={styles.loading_info}>{loadingInfo}</Text>
          </View>
        )}
        {!hide_button&&(<TouchableOpacity style={styles.button} onPress={props.onPress}>
          <Ionicons name={iconName} size={30} />

          <Text style={styles.button_title}>{buttonTitle}</Text>
        </TouchableOpacity>)}
        {!loadingAds && <Text style={styles.button_info}>{buttonInfo}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    flexWrap: "wrap",
  },
  quantity_view: {
    backgroundColor: THEME.textColor0,
    borderRadius: 20,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  quantity: {fontSize: 40, textAlign: "center", fontWeight: "600"},
  quantity_name: {fontStyle: "italic"},
  loading_view: {
    marginBottom: 5,
    alignItems: "center",
  },
  loading_info: {color: THEME.textColor0, fontStyle: "italic"},
  button: {
    flexDirection: "row",
    alignSelf: "flex-end",
    backgroundColor: THEME.textColor0,
    borderRadius: 10,
    padding: 5,
    elevation: 5,
  },
  button_title: {
    alignSelf: "flex-end",
    fontSize: 15,
    fontStyle: "italic",
    marginHorizontal: 2,
  },
  button_info: {color: THEME.textColor0, fontStyle: "italic"},
});
