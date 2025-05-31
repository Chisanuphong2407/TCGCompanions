import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View ,ScrollView} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  FlatList,
} from "react-native";
import { IP } from "../App";

export const Eventdetails = ({ navigation, route }) => {
  const ID = route.params;
  const [isLoading, setIsloading] = useState(true);
  const [item, setItem] = useState([]);
  const [status, setStatus] = useState();
  const [statusStyle,setStatusstyle] = useState();
  // console.log(ID);

  const fetchDetail = async () => {
    try {
      // console.log(item[0] && item[0].Status);
      if (item[0] && item[0].Status === 0) {
        setStatus("เปิดรับสมัคร");
        setStatusstyle(styles.status0);
      } else {
        setStatus("ปิดรับสมัคร");
        setStatusstyle(styles.status1);
      }
      const data = await fetch(IP + "/api/edetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          EventID: ID,
        }),
      });
      const responseData = await data.json();
      setItem(responseData);
      console.log(item);
      setIsloading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [isLoading]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.Eventname}>{item[0] && item[0].EventName}</Text>
      <Text style={statusStyle}>{status}</Text>
      <View style={styles.owner}>
        <Text style={styles.ownerName}>ผู้จัด:</Text>
        <Text style={styles.ownerName}>{item[0] && item[0].UserName}</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>เงื่อนไขการแข่งขัน:</Text>
        <Text style={styles.content}>{item[0] && item[0].Condition}</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>กติกาการแข่งขัน:</Text>
        <Text style={styles.content}>{item[0] && item[0].Rule}</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>เวลาในการแข่งขันแต่ละรอบ:</Text>
        <Text style={styles.content}>{item[0] && item[0].Time} นาที</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>จำนวนที่เปิดรับ:</Text>
        <Text style={styles.content}>{item[0] && item[0].Amount} คน</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>สถานที่จัด:</Text>
        <Text style={styles.content}>{item[0] && item[0].Address}</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>รายละเอียดอื่นๆ:</Text>
        <Text style={styles.content}>{item[0] && item[0].MoreDetail}</Text>
      </View>
    </ScrollView>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    padding: 20,
  },
  Eventname: {
    fontSize: 40,
    fontWeight: "bold",
  },
  status0: {
    justifyContent: "flex-start",
    backgroundColor: "#3EC404",
    padding: 5,
    paddingLeft: 15,
    width: 150,
    marginLeft: -20,
    fontSize: 20,
    color: "white",
    marginTop: 20,
  },
  status1: {
    justifyContent: "flex-start",
    backgroundColor: "#C40424",
    padding: 5,
    paddingLeft: 15,
    width: 150,
    marginLeft: -20,
    fontSize: 20,
    color: "white",
    marginTop: 20,
  },
  owner: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#86B6F6",
    borderRadius: 10,
    justifyContent: "space-between",
    marginTop: 20,
    
  },
  ownerName: {
    fontSize: 17
  },
  header: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 15,
    marginTop: 5
  },
  head: {
    marginTop: 20
  }
});
