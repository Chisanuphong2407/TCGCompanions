import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
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

export const Register = ({ navigation }) => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [Vpassword, setVPassword] = useState("");

  const handleRegister = async () => {
    if (
      !user ||
      !email ||
      !password ||
      !name ||
      !phone ||
      !lastname ||
      !Vpassword
    ) {
      Alert.alert("ไม่สำเร็จ", "กรุณากรอกข้อมูลให้ครบถ้วน",[{
        text: "ตกลง"
      }
      ]);
      return;
    } else if (password !== Vpassword) {
      Alert.alert("รหัสผ่านไม่ตรงกัน", "กรุณากรอกรหัสผ่านใหม่",[{
        text: "ตกลง"
      }
      ]);
    } else {
      try {
        console.log("start");
        const response = await fetch(IP + "/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            lastname: lastname,
            email: email,
            phone: phone,
            user: user,
            password: password,
          }),
        });
        console.log("request");
        const data = await response.json();

        if (response.ok) {
          Alert.alert(
            "สำเร็จ",
            "สมัครสมาชิกเสร็จสิ้น",[{
        text: "ตกลง"
      }
      ],
            navigation.navigate("Login")
          );
          console.log("Registration successful:", data);
        } else {
          Alert.alert(
            "สมัครสมาชิกไม่สำเร็จ",
            "Email หรือ Username นี้มีผู้ใช้งานแล้ว"
          );
        }
      } catch (error) {
        Alert.alert("Error", "There was a network error.");
        console.error("Registration error:", error);
      }
    }
  };

  return (
    <View style={styles.RegisScreen}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <Text style={styles.RegisHeader}>สมัครสมาชิก</Text>
      <View>
        <TextInput
          style={styles.RGInput}
          placeholder="ชื่อ"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.RGInput}
          placeholder="นามสกุล"
          value={lastname}
          onChangeText={setLastname}
        />
        <TextInput
          style={styles.RGInput}
          placeholder="อีเมล์"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.RGInput}
          placeholder="โทรศัพท์"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.RGInput}
          placeholder="username"
          value={user}
          onChangeText={setUser}
        />
        <TextInput
          style={styles.RGInput}
          placeholder="รหัสผ่าน"
          value={password}
          secureTextEntry={true}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.RGInput}
          placeholder="ยืนยันรหัสผ่าน"
          value={Vpassword}
          secureTextEntry={true}
          onChangeText={setVPassword}
        />
      </View>
      <View style={styles.RGBut}>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.RGText}>สมัครสมาชิก</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  RegisScreen: {
    flex: 1,
    backgroundColor: "#EEF5FF",
  },
  bgIMG: {
    position: "absolute",
    width: 600,
    height: 600,
    left: -300,
    bottom: -100,
    opacity: 0.3,
  },
  RegisHeader: {
    fontSize: 30,
    marginTop: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
  },
  RGInput: {
    marginLeft: 20,
    fontSize: 20,
    marginTop: 20,
    marginRight: 20,
    paddingBottom: 5,
    borderBottomColor: "#176B87",
    borderBottomWidth: 1,
  },
  RGText: {
    backgroundColor: "#176B87",
    color: "white",
    borderRadius: 30,
    padding: 15,
    marginTop: 20,
    alignSelf: "center",
    fontSize: 20,
  },
});
