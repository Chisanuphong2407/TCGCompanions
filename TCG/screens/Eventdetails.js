import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";
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
import { Trash2, Edit2, Users, Clock } from "react-native-feather";
import { IP } from "../App";

export const Eventdetails = ({ navigation, route }) => {
  const ID = route.params;
  const [isLoading, setIsloading] = useState(true);
  const [item, setItem] = useState([]);
  const [status, setStatus] = useState();
  const [statusStyle, setStatusstyle] = useState();
  const [isOwner, setIsowner] = useState(false);
  const owner = item[0] && item[0].UserName;
  const [account, setAccount] = useState(null);

  const [eventName, setEventName] = useState();
  const [condition, setCondition] = useState();
  const [rule, setRule] = useState();
  const [time, setTime] = useState();
  const [amount, setAmount] = useState();
  const [address, setAddress] = useState();
  const [moredetail, setMoredetail] = useState();
  const [closedate, setClosedate] = useState();
  const [table, setTable] = useState();

  const [isContestant, setIscontestant] = useState(false);

  const contestantCheck = async () => {
    try {
      // console.log(table);
      const check = await fetch(IP + "/api/contestants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fightertable: table,
          username: account,
        }),
      });
      const resultCheck = await check.json();
      if (resultCheck.message == "สมัครแล้ว") {
        setIscontestant(true);
      }
      // console.log(isContestant);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDetail = async () => {
    try {
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
      const vef = await AsyncStorage.getItem("@vef");
      vef ? setAccount(vef.trim()) : setAccount(null);
      setIsloading(false);
      setEventName(item[0] && item[0].EventName);
      setCondition(item[0] && item[0].Condition);
      setRule(item[0] && item[0].Rule);
      setTime(item[0] && item[0].Time);
      setAmount(item[0] && item[0].Amount);
      setAddress(item[0] && item[0].Address);
      setMoredetail(item[0] && item[0].MoreDetail);
      setClosedate(item[0] && item[0].CloseDate);
      setTable(item[0] && item[0].Fighter);
    } catch (error) {
      console.log(error);
    }
  };

  const availableMenu = async () => {
    try {
      if (owner === account) {
        setIsowner(true);
      } else {
        setIsowner(false);
      }
    } catch (error) {
      return error;
    }
  };

  const deleteEvent = async () => {
    console.log("start del");
    const deleteEvent = await fetch(IP + "/api/deleteEvent/"+ ID,{
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await deleteEvent.json();
    console.log(result);
  };

  const waive = async () => {
    try {
      await fetch(`${IP}/api/waive/table/${table}/userID/${account}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      Alert.alert(
        "สละสิทธิ์สำเร็จ",
        "ท่านสามารถสมัครแข่งในกิจกรรมนี้ได้อีกครั้งหากยังไม่ปิดรับสมัคร"
      );
    } catch (error) {
      console.log(error);
      Alert.alert("สละสิทธิ์ไม่สำเร็จ", "มีข้อผิดพลาดในการลบ");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [isLoading]);

  useEffect(() => {
    contestantCheck();
  }, [table]);

  useEffect(() => {
    availableMenu();
  }, [item]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.menu}>
        {status === "เปิดรับสมัคร" && isOwner && (
          <View style={styles.menu}>
            <Pressable
              onPress={() => {
                console.log("delete");
                Alert.alert(
                  "ยืนยันการลบกิจกรรม",
                  "หลังยืนยัน ข้อมูลผู้สมัครก่อนหน้าจะถูกลบไปด้วย",
                  [
                    {
                      text: "ยกเลิก",
                      style: "cancel",
                    },
                    {
                      text: "ตกลง",
                      onPress: () => {
                        deleteEvent()
                        navigation.navigate("Home");
                      }
                    },
                  ],
                  {
                    cancelable: true,
                  }
                );
              }}
              style={styles.menubox}
            >
              <Trash2 color={"#C40424"} style={styles.menubut} />
            </Pressable>
            <Pressable
              onPress={() => {
                console.log("edit");
                navigation.navigate("Editdetail", {
                  eventID: ID,
                  eventName: eventName,
                  condition: condition,
                  rule: rule,
                  time: time,
                  amount: amount,
                  address: address,
                  moredetail: moredetail,
                  closedate: closedate,
                });
              }}
              style={styles.menubox}
            >
              <Edit2 color={"#176B87"} style={styles.menubut} />
            </Pressable>
          </View>
        )}
        {isOwner && (
          <View style={styles.menu}>
            <Pressable
              onPress={() => {
                navigation.navigate("contestants", { table, owner,eventName,ID });
              }}
              style={styles.menubox}
            >
              <Users color={"#176B87"} style={styles.menubut} />
            </Pressable>
          </View>
        )}
        {isContestant && !isOwner && (
          <View style={styles.menu}>
            <Pressable style={styles.menubox}>
              <Clock color={"#176B87"} style={styles.menubut} />
            </Pressable>
            <Pressable
              style={styles.menubox}
              onPress={() => {
                navigation.navigate("contestants", { table, owner });
              }}
            >
              <Users color={"#176B87"} style={styles.menubut} />
            </Pressable>
          </View>
        )}
      </View>
      <Text style={styles.Eventname}>{eventName}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={statusStyle}>{status}</Text>
        {isContestant && (
          <TouchableOpacity style={styles.schedule}>
            <Text style={styles.scheduleText}>ตารางการแข่งขัน</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.owner}>
        <Text style={styles.ownerName}>ผู้จัด:</Text>
        <Text style={styles.ownerName}>{owner}</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>วันปิดรับสมัคร:</Text>
        <Text style={styles.content}>{closedate}</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>เงื่อนไขการแข่งขัน:</Text>
        <Text style={styles.content}>{condition}</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>กติกาการแข่งขัน:</Text>
        <Text style={styles.content}>{rule}</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>เวลาในการแข่งขันแต่ละรอบ:</Text>
        <Text style={styles.content}>{time} นาที</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>จำนวนที่เปิดรับ:</Text>
        <Text style={styles.content}>{amount} คน</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>สถานที่จัด:</Text>
        <Text style={styles.content}>{address}</Text>
      </View>
      <View style={styles.head}>
        <Text style={styles.header}>รายละเอียดอื่นๆ:</Text>
        <Text style={styles.content}>{moredetail}</Text>
      </View>
      {status === "ปิดรับสมัคร" && isOwner && (
        <View style={styles.eventBegin}>
          <Pressable>
            <Text style={{ color: "white" }}>เริ่มการแข่งขัน</Text>
          </Pressable>
        </View>
      )}
      {status === "เปิดรับสมัคร" &&
        account !== null &&
        !isOwner &&
        !isContestant && (
          <View style={styles.apply}>
            <TouchableOpacity
              onPress={() => {
                console.log(ID);
                navigation.navigate("Apply", { ID, eventName, table, account });
              }}
            >
              <Text style={styles.applyText}>สมัคร</Text>
            </TouchableOpacity>
          </View>
        )}
      {isContestant && (
        <View style={styles.waive}>
          <TouchableOpacity
            onPress={() => {
              console.log("สละสิทธิ์");
              Alert.alert(
                "ยืนยันการสละสิทธิ์",
                "หลังยืนยัน ข้อมูลการสมัครของคุณจะถูกลบ",
                [
                  {
                    text: "ยกเลิก",
                    style: "cancel",
                  },
                  {
                    text: "ตกลง",
                    onPress: () => waive(),
                  },
                ],
                {
                  cancelable: true,
                }
              );
            }}
          >
            <Text style={styles.waiveText}>สละสิทธิ์</Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontSize: 17,
  },
  header: {
    fontSize: 17,
    fontWeight: "bold",
  },
  content: {
    fontSize: 15,
    marginTop: 5,
  },
  head: {
    marginTop: 20,
  },
  menu: {
    flexDirection: "row-reverse",
  },
  menubut: {
    maxWidth: 30,
    maxHeight: 30,
    minWidth: 25,
    minHeight: 25,
  },
  menubox: {
    marginHorizontal: 10,
  },
  apply: {
    alignSelf: "flex-end",
    backgroundColor: "#176B87",
    padding: 10,
    borderRadius: 5,
    marginBottom: 50,
    minWidth: 100,
  },
  applyText: {
    color: "white",
    alignSelf: "center",
  },
  schedule: {
    maxWidth: 80,
    minHeight: 30,
    backgroundColor: "#176B87",
    borderRadius: 5,
  },
  scheduleText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    paddingVertical: 5,
  },
  waive: {
    alignSelf: "flex-end",
    backgroundColor: "#FF0004",
    padding: 10,
    borderRadius: 5,
    marginBottom: 50,
    minWidth: 100,
  },
  waiveText: {
    color: "white",
    alignSelf: "center",
  },
  eventBegin: {
    alignSelf: "flex-end",
    backgroundColor: "#176B87",
    padding: 10,
    borderRadius: 5,
    marginBottom: 50,
    minWidth: 100,
  },
});
