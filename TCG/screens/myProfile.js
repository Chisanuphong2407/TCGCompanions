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
      // console.log('det',result[0].Email);
      setIsloading(false);
    } catch (error) {
      console.log(error);
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
