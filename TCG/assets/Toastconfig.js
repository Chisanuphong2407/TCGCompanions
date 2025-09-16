import { BaseToast, ErrorToast } from "react-native-toast-message";

export const Toastconfig = {
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#EFE307",borderLeftWidth:7,borderRightColor: "#EFE307",borderRightWidth:7,marginTop: 25,minWidth:"80%",minHeight:"10%" }}
      contentContainerStyle={{ backgroundColor: "#fff"}}
      text1Style={{
        fontSize: 20,
        fontWeight: "bold",
        paddingTop:10
      }}
      text2Style={{
        fontSize: 18,
        paddingBottom:10
      }}
    />
  ),
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#7DDA58",borderLeftWidth:7,borderRightColor: "#7DDA58",borderRightWidth:7,marginTop: 25,minWidth:"80%",minHeight:"10%" }}
      contentContainerStyle={{ backgroundColor: "#fff"}}
      text1Style={{
        fontSize: 20,
        fontWeight: "bold",
        paddingTop:10
      }}
      text2Style={{
        fontSize: 18,
        paddingBottom:10
      }}
    />
  ),
};
