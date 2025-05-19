import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View  } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User, Lock } from "react-native-feather";
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

export const Login = ({ navigation}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // console.log(IP);
  const handleLogin = async () => {
    try{
      if (!username || !password) {
        Alert.alert('ไม่สำเร็จ','กรุณากรอกข้อมูลให้ครบ');
        return false;
      }
    const FetchLogin = await fetch(IP + '/api/login',{
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
      })
    });
    const accessToken = await FetchLogin.json();
    console.log(accessToken);
    // console.log(accessToken);
    if ( accessToken === 'รหัสไม่ถูกต้อง' ){
      Alert.alert("รหัสผ่านไม่ถูกต้อง","โปรดกรอกรหัสผ่านใหม่",[{
        text: "ตกลง"
      }
      ])
      console.log("not have token");
    }else{
      await AsyncStorage.setItem('@accessToken',accessToken)
      await navigation.navigate("Home");
    }
    }catch (error) {
      console.log(error);
      return res.status(409).json(error);
    };
  };

  return (
    <View style={styles.LoginScreen}>
      <View style={styles.LoginPro}>
        <Image
          source={require("../assets/img/logo.jpeg")}
          style={styles.Profile}
        />
      </View>
      <View style={styles.inputBox}>
        <View style={styles.Box}>
          <User size={1} margin={5} />
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        <View style={styles.Box}>
          <Lock size={1} margin={5} />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>
      </View>
      <View style={styles.LogBut}>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.LogText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </View>
      <Pressable
      onPress={() => {navigation.navigate('Regis')}}>
        <Text
          style={{
            textDecorationLine: "underline",
            opacity: 0.5,
            alignSelf: "center",
            marginTop: 10,
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
    borderRadius: 25,
    padding: 5,
    paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: "#EFEFEF",
    flexDirection: "row",
  },
  LogBut: {
    flex: 0.1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  LogText: {
    color: "white",
    fontSize: 20,
    backgroundColor: "#176B87",
    padding: 15,
    paddingLeft: 18,
    paddingRight: 18,
    borderRadius: 30,
  },
});
