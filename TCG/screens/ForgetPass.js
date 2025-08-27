import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { Mail } from "react-native-feather";
import { IP } from "../App";

export const ForgetPass = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [isVisible, setIsvisible] = useState(false);
  const [time, setTime] = useState(60);
  const [isCountdown,setIscountdown] = useState(false);

  const handleSend = async () => {
    if (email) {
      setEmail("");
      setIsvisible(true);
      setDisabled(true);
      setIscountdown(true);
      setTimeout(() => {
        setDisabled(false);
        setIsvisible(false);
      }, 60000);

      try {
        console.log("sending");
        const sendMail = await fetch(`${IP}/api/fotgetPassword`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        });

        const result = await sendMail.json();
        console.log(result);
        // if(result)
        console.log("sended");
      } catch (error) {
        Alert.alert("เกิดข้อผิดพลาด", "โปรดลองอีกครั้ง");
      }
    } else {
      Alert.alert("", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  useEffect(() => {
    let timer = null
    if(isCountdown && time > 0){
      timer = setInterval(() => {
        setTime(time - 1)
      },1000);
    }else if (time == 0){
      setIscountdown(false);
      clearInterval(timer)
    }

    return () => clearInterval(timer)

  },[isCountdown,time])

  return (
    <SafeAreaView style={styles.forgetScreen}>
      <Text style={styles.header}>ลืมรหัสผ่าน</Text>
      <View style={styles.box}>
        <View style={styles.inputbox}>
          <Mail margin={10} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            //   style={styles.Emailinput}
            placeholder="Email"
          />
        </View>
        <TouchableOpacity
          style={styles.send}
          onPress={handleSend}
          disabled={disabled}
        >
          <Text style={disabled ? styles.sendedText : styles.sendText}>
            ส่งรหัส
          </Text>
        </TouchableOpacity>
        {isVisible && (
          <Text style={styles.resend}>
            คุณสามารถส่งรหัสใหม่ได้ภายใน {time} วินาที
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  forgetScreen: {
    flex: 1,
    backgroundColor: "#EEF5FF",
    padding: 20,
    paddingTop: 30,
  },
  inputbox: {
    flexDirection: "row",
    backgroundColor: "#e7e6e6",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 30,
  },
  box: {
    flex: 0.8,
    justifyContent: "center",
  },
  header: {
    fontSize: 30,
    marginTop: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 50,
  },
  send: {
    alignItems: "center",
    marginTop: 30,
  },
  sendText: {
    fontSize: 18,
    color: "white",
    backgroundColor: "#176B87",
    padding: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  sendedText: {
    fontSize: 18,
    color: "#000000",
    backgroundColor: "#718c96",
    padding: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  resend: {
    textDecorationLine: "underline",
    color: "grey",
    margin: 10,
    textAlign: "center",
  },
});
