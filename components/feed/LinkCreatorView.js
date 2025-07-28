
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import {IBTheme, xIBTheme} from "../tools/constants/ThemeFile";
import {Ionicons} from "@expo/vector-icons";
import Link, {getLogo, isHttp, isValidDomainOf} from "../tools/components/Link";
import {useEffect, useState} from "react";

export default function LinkCreatorView(
  props = {onCancel: () => {}, onSuccess: () => {}}
) {
  const [text, setText] = useState("Link");
  const [href, setHref] = useState("");
  const [checkingLink, setCheckingLink] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);

  useEffect(() => {
    if (checkingLink) {
      console.log("Checking Link...");
      if (href != "" && text != "") {
        const logo = getLogo(href);
        if (logo != "logo-chrome") {
          console.log("Is valid link with domain : ", logo);
          setIsValidLink(true);
        } else {
          if (isHttp(href)) {
            console.log("Is valid link (no domain)");
            setIsValidLink(true);
          } else {
            setIsValidLink(false);
          }
        }
        setCheckingLink(false);
      } else {
        setIsValidLink(false);
        setCheckingLink(false);
      }
    } else {
      console.log("Done Checking Link : ", isValidLink ? "VALID" : "INVALID");
    }
  }, [checkingLink]);

  return (
    <View style={styles.main}>
      <TouchableOpacity style={styles.cancel} onPress={props.onCancel} />
      <View style={styles.body}>
        <View style={styles.title_view}>
          <Ionicons name="link" size={40} color={IBTheme.defaultTextColor} />
          <Text style={styles.title}>Create Link</Text>
        </View>
        <TextInput
          style={styles.link_input}
          placeholder="Enter Link"
          value={href}
          onFocus={(e) => {
            console.log("Focus");
          }}
          onChangeText={setHref}
          onEndEditing={() => {
            setCheckingLink(true);
          }}
          cursorColor={IBTheme.defaultTextColor}
        />
        <TextInput
          style={styles.link_text_input}
          value={text}
          cursorColor={IBTheme.defaultTextColor}
          onEndEditing={() => {
            setCheckingLink(true);
          }}
          onChangeText={setText}
        />
        <Link text={text} href={href} disabled={!isValidLink} editing={true}/>
        <View style={styles.bottom}>
          {checkingLink ? (
            <ActivityIndicator color={IBTheme.defaultTextColor} />
          ) : isValidLink ? (
            <Ionicons
              name="checkmark"
              size={30}
              color={IBTheme.defaultTextColor}
            />
          ) : (
            <Ionicons name="close" size={30} color={"#ff22aa"} />
          )}
          <TouchableOpacity
            style={[
              styles.done_button,
              {
                opacity: isValidLink ? 1 : 0.5,
              },
            ]}
            disabled={!isValidLink}
            onPress={() => {
              const link = {text: text, href: href};
              props.onSuccess(link);
            }}
          >
            <Text style={{color: "white"}}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.cancel} onPress={props.onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    justifyContent: "center",
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000000aa",
  },
  cancel: {flex: 1, width: "100%"},
  body: {
    backgroundColor: xIBTheme.tertiaryColor,
    justifyContent: "center",
    borderRadius: 10,
  },
  title_view: {flexDirection: "row", justifyContent: "center"},
  title: {
    fontSize: 20,
    fontWeight: "600",
    margin: 5,
    color: IBTheme.defaultTextColor,
  },
  link_input: {
    borderWidth: 1,
    width: 300,
    margin: 10,
    padding: 5,
    borderColor: IBTheme.defaultTextColor,
    borderRadius: 10,
    color: IBTheme.defaultTextColor,
  },
  link_text_input: {
    borderWidth: 1,
    width: 300,
    margin: 10,
    padding: 5,
    borderColor: IBTheme.defaultTextColor,
    borderRadius: 10,
    fontStyle: "italic",
    color: IBTheme.defaultTextColor,
    fontWeight: "600",
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  done_button: {
    backgroundColor: "blue",
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
});
