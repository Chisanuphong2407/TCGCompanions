import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User, Lock, Eye, EyeOff } from "react-native-feather";
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
import { IP } from "../App";

export const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  // console.log(IP);
  const handleLogin = async () => {
    try {
      const FetchLogin = await fetch(IP + "/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      const accessToken = await FetchLogin.json();
      console.log(accessToken === "ชื่อผู้ใช้ไม่ถูกต้อง");
      if (
        accessToken.message === "รหัสไม่ถูกต้อง" ||
        accessToken.message === "ชื่อผู้ใช้ไม่ถูกต้อง"
      ) {
        Alert.alert("รหัสผ่านหรือชื่อผู้ใช้ไม่ถูกต้อง", "โปรดลองอีกครั้ง", [
          {
            text: "ตกลง",
          },
        ]);
        console.log("not have token");
      } else {
        await AsyncStorage.setItem("@accessToken", accessToken);
        await navigation.navigate("Home");
      }
    } catch (error) {
      console.log(error);
      return res.status(409).json(error);
    }
  };

  const setEye = () => {
    setSecure(!secure);
  };
  return (
    <View style={styles.LoginScreen}>
      <View style={styles.LoginPro}>
        <Image
          source={require("../assets/img/logo.png")}
          style={styles.Profile}
        />
      </View>
      <View style={styles.inputBox}>
        <View style={styles.Box}>
          <User margin={10} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        <View style={styles.Box}>
          <Lock margin={10} />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            style={styles.password}
          />
          {secure ? (
            <Pressable onPress={setEye}>
              <Eye size={1} margin={10} alignSelf={"center"} />
            </Pressable>
          ) : (
            <Pressable onPress={setEye}>
              <EyeOff size={1} margin={10} />
            </Pressable>
          )}
        </View>
      </View>
      <Pressable
        style={styles.forgetBut}
        onPress={() => navigation.navigate("ForgetPass")}
      >
        <Text
          style={{
            textDecorationLine: "underline",
            opacity: 0.5,
            alignSelf: "center",
            marginTop: 10,
          }}
        >
          ลืมรหัสผ่าน?
        </Text>
      </Pressable>
      <View style={styles.LogBut}>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.LogText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </View>
      <Pressable
        onPress={() => {
          navigation.navigate("Regis");
        }}
      >
        <Text
          style={{
            textDecorationLine: "underline",
            alignSelf: "center",
            marginTop: 10,
            color: "#176B87",
            fontWeight: "black",
          }}
        >
          สมัครสมาชิก
        </Text>
      </Pressable>
    </View>
  );
};

export const styles = StyleSheet.create({
  LoginScreen: {
    flex: 1,
    backgroundColor: "#FBFBFB",
  },
  LoginPro: {
    flex: 0.3,
    margin: 13,
    alignItems: "center",
  },
  Profile: {
    height: 150,
    width: 150,
    borderRadius: 100,
    margin: 15,
  },
  inputBox: {
    flex: 0.2,
    marginLeft: 30,
    marginRight: 30,
  },
  Box: {
    flexDirection: "row",
    backgroundColor: "#e7e6e6",
    borderRadius: 25,
    marginBottom: 10,
  },
  LogBut: {
    flex: 0.1,
    alignItems: "center",
    marginTop: 40,
  },
  forgetBut: {
    flex: 0.1,
    alignItems: "center",
    marginBottom: 40,
  },
  LogText: {
    color: "white",
    fontSize: 20,
    backgroundColor: "#176B87",
    padding: 15,
    paddingLeft: 18,
    paddingRight: 18,
    borderRadius: 30,
    minWidth: "50%",
    textAlign: "center",
  },
  password: {
    flex: 1,
  },
  input: {
    flex:1
  }
});
