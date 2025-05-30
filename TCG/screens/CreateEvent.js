import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Search,
  X,
  MapPin,
  LogOut,
  User,
  ArrowLeft,
  Plus,
} from "react-native-feather";
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

export const CreateEvent = () => {
  const [Ename, setEname] = useState("");
  const [condition, setCondition] = useState("");
  const [time, setTime] = useState();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [closedate, setClosedate] = useState("");
  const [moredetail, setMoredetail] = useState("");

  return (
    <View style={styles.background}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <ScrollView>
        <View style={{ margin: 20, marginTop: 0 }}>
          <Text style={styles.header}>สร้างกิจกรรม</Text>
          <View>
            <Text style={styles.topic}>ชื่อกิจกรรม :</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="ตั้งชื่อกิจกรรมของท่าน"
              value={Ename}
              onChangeText={setEname}
            />
          </View>
          <View>
            <Text style={styles.topic}>เงื่อนไขการแข่งขัน :</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="เช่น แข่งเดี่ยว เป็นต้น"
              value={condition}
              onChangeText={setCondition}
            />
          </View>
          <View>
            <Text style={styles.topic}>กติกาการแข่งขัน :</Text>
            <Text style={styles.inputBoxswiss}>swiss</Text>
          </View>
          <View>
            <Text style={styles.topic}>
              เวลาในการแข่งขันแต่ละรอบ{" (นาที)"} :
            </Text>
            <TextInput
              style={styles.inputBoxTime}
              placeholder="เวลา"
              value={time}
              onChangeText={setTime}
            />
          </View>
          <View>
            <Text style={styles.topic}>จำนวนที่เปิดรับ{" (คน,ทีม)"} :</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="จำนวนที่เปิดรับ"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View>
            <Text style={styles.topic}>สถานที่จัด :</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="สถานที่จัดกิจกรรมของท่าน"
              value={address}
              onChangeText={setAddress}
            />
          </View>
          <View>
            <Text style={styles.topic}>รายละเอียดอื่นๆ :</Text>
            <TextInput
              style={styles.inputBoxDetail}
              placeholder="รายละเอียดอื่นๆ (ไม่จำเป็น)"
              multiline={true}
              value={moredetail}
              onChangeText={setMoredetail}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#EEF5FF",
  },
  header: {
    fontSize: 30,
    marginTop: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 30,
  },
  bgIMG: {
    position: "absolute",
    width: 600,
    height: 600,
    left: -300,
    bottom: -100,
    opacity: 0.3,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#86B6F6",
    backgroundColor: "#E1E7EF",
    minHeight: 45,
    paddingLeft: 10,
    marginBottom: 20,
  },
    inputBoxDetail: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#86B6F6",
    backgroundColor: "#E1E7EF",
    minHeight: 100,
    paddingLeft: 10,
    marginBottom: 20,
    textAlignVertical: 'top'
  },
  inputBoxTime: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#86B6F6",
    backgroundColor: "#E1E7EF",
    minHeight: 45,
    marginBottom: 20,
    maxWidth: 70,
    textAlign: "center",
  },
  inputBoxswiss: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#86B6F6",
    backgroundColor: "#CED1D7",
    minHeight: 45,
    textAlignVertical: "center",
    paddingLeft: 10,
    marginBottom: 20,
  },
  topic: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
  },
});
