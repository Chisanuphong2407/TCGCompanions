import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
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
import { DataTable } from "react-native-paper";
import { Phone, UserPlus, X } from "react-native-feather";
import { IP } from "../App";

export const ContestantDetail = ({ navigation, route }) => {
  const EventID = route.params.EventID;
  const eventName = route.params.EventName;
  const table = route.params.tableID;
  const owner = route.params.owner;
  const FighterID = route.params.FighterID;
  const userID = route.params.userID;
  const Eventname = route.params.Eventname;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nation, setNation] = useState("");
  const [architype, setArchitype] = useState("");
  const [isLoading, setIsloading] = useState();
  const status = route.params.status;

  const fetchData = async () => {
    setIsloading(true);
    console.log(EventID);

    try {
      const contestantProfile = await fetch(`${IP}/api/contestantprofile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table: table,
          fighterID: FighterID,
          userID: userID,
        }),
      });

      const fetchprofile = await contestantProfile.json();
      setName(fetchprofile[0].UserName);
      setPhone(fetchprofile[0].PhoneNumber);
      setNation(fetchprofile[0].Nation);
      setArchitype(fetchprofile[0].Archtype);
      setIsloading(false);
    } catch (error) {
      console.log(error);
      setIsloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      console.log("del");
      const del = await fetch(`${IP}/api/waive/table/${table}/userID/${name}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (del.ok) {
        Alert.alert("ลบสำเร็จ");
        navigation.goBack({ table, eventName: Eventname, owner, EventID,statusNum:status });
      }
    } catch (error) {
      Alert.alert("ลบไม่สำเร็จ", JSON.stringify(error));
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoading]);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <View>
        <Text style={styles.header}>{Eventname}</Text>
        <Text style={styles.topic}>ชื่อผู้เข้าแข่งขัน:</Text>
        <Text style={styles.detail}>{name}</Text>
        <Text style={styles.topic}>โทรศัพท์:</Text>
        <Text style={styles.detail}>{phone}</Text>
        <Text style={styles.topic}>เนชั่นที่ใช้ในการแข่งขัน:</Text>
        <Text style={styles.detail}>{nation}</Text>
        <Text style={styles.topic}>สายที่ใช้ในการแข่งขัน:</Text>
        <Text style={styles.detail}>{architype}</Text>
      </View>
      <View style={styles.delete}>
        {(status == 0 || status == 1) && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "ลบผู้เข้าแข่งขัน",
                "ท่านยืนยันที่จะลบผู้เข้าแข่งขันท่านนี้",
                [
                  {
                    text: "ยืนยัน",
                    style: "destructive",
                    onPress: handleDelete,
                  },
                  {
                    text: "ยกเลิก",
                    style: "cancel",
                  },
                ]
              );
            }}
          >
            <Text style={styles.deleteText}>ลบ</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    padding: 20,
  },
  header: {
    fontSize: 30,
    marginTop: 20,
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 30,
  },
  topic: {
    fontSize: 20,
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 5,
    fontWeight: "bold",
  },
  bgIMG: {
    position: "absolute",
    width: 600,
    height: 600,
    right: -200,
    bottom: -200,
    opacity: 0.3,
  },
  detail: {
    fontSize: 16,
    marginLeft: 5,
  },
  delete: {
    flex: 1,
    marginBottom: 50,
    alignSelf: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "white",
    alignSelf: "center",
    textAlign: "center",
    backgroundColor: "#FF0004",
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
  },
});
