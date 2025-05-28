import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Search, X, MapPin, LogOut, User } from "react-native-feather";
import {
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
  Modal,
  Pressable,
  Image,
  FlatList,
} from "react-native";
import { IP } from "../App";

export const MyProfile = ({ navigation, route }) => {
  const [isLoading, setIsloading] = useState(true);
  // const [profile, setProfile] = useState([]);
  const [fname, setfName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState("");
  const [id, setId] = useState("");

  const getprofile = async () => {
    try {
      const name = await route.params;
      // console.log("name", name);
      const fetchPro = await fetch(IP + "/api/getprofile/" + name, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await fetchPro.json();
      // setProfile(result);
      setEmail(result[0].Email);
      setfName(result[0].FirstName);
      setLastname(result[0].LastName);
      setPhone(result[0].PhoneNumber);
      setUser(result[0].UserName);
      setId(result[0].UserID);
      console.log("det", result[0].UserID);
      setIsloading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async () => {
    if (!user || !email || !fname || !phone || !lastname) {
      Alert.alert("ไม่สำเร็จ", "กรุณากรอกข้อมูลให้ครบถ้วน", [
        {
          text: "ตกลง",
        },
      ]);
      return;
    } else {
      try {
        console.log("start");
        const response = await fetch(IP + "/api/updateprofile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fname,
            lastname: lastname,
            email: email,
            phone: phone,
            user: user,
          }),
        });
        console.log("request");
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          Alert.alert(
            "สำเร็จ",
            "แก้ไขเสร็จสิ้น",
            [
              {
                text: "ตกลง",
              },
            ],
            navigation.navigate("Home")
          );
          console.log("update successful:", data);
        } else {
          Alert.alert("แก้ไขไม่สำเร็จ");
        }
      } catch (error) {
        Alert.alert("Error", "There was a network error.");
        console.error("update error:", error);
      }
    }
  };

  useEffect(() => {
    getprofile();
  }, [isLoading]);

  // console.log(name);
  return (
    <View style={styles.Edit}>
      <Text style={styles.RegisHeader}>แก้ไขข้อมูลส่วนตัว</Text>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <TextInput
        style={styles.RGInput}
        placeholder="ชื่อ"
        value={fname}
        onChangeText={setfName}
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
      <View style={styles.RGBut}>
        <TouchableOpacity onPress={handleEdit}>
          <Text style={styles.RGText}>แก้ไขข้อมูล</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Edit: {
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
