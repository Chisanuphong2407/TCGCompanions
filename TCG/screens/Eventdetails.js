import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, BackHandler } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigationContainer,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
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
import Toast from "react-native-toast-message";
import { Trash2, Edit2, Users, Clock } from "react-native-feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { IP } from "../App";
import { eventBegin } from "./contestants";
import io from "socket.io-client";

export const Eventdetails = ({ navigation, route }) => {
  const EventID = route.params;
  const [isLoading, setIsloading] = useState(true);
  const [item, setItem] = useState([]);
  const [status, setStatus] = useState();
  const [statusNum, setStatusNum] = useState();
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
  const [racedate, setRacedate] = useState();
  const [table, setTable] = useState();
  const [contestants, setContestants] = useState([]);

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
        setStatusNum(0);
      } else if (item[0] && item[0].Status === 1) {
        setStatus("ปิดรับสมัคร");
        setStatusNum(1);
        setStatusstyle(styles.status1);
      } else if (item[0] && item[0].Status === 2) {
        setStatus("กำลังแข่งขัน");
        setStatusstyle(styles.status2);
        setStatusNum(2);
      } else if (item[0] && item[0].Status === 3) {
        setStatus("แข่งขันเสร็จสิ้น");
        setStatusstyle(styles.status3);
        setStatusNum(3);
      }
      const data = await fetch(IP + "/api/edetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          EventID: EventID,
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
      setRacedate(item[0] && item[0].RaceDate);
      setTable(item[0] && item[0].Fightertable);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchContestants = async() => {
    try {
      const fetchConts = await fetch(`${IP}/api/fetchcontestants/${table}`,{
        method:"GET",
      });

      const Allcontestants = await fetchConts.json();
      console.log(Allcontestants)
      setContestants(Allcontestants);
    } catch (error) {
      console.log(error);
      Alert.alert("เกิดข้อผิดพลาด","โปรดลองอีกครั้ง",[
        {
          text:"ตกลง",
          onPress: () => setIsloading(true)
        }
      ])
    }
  }

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
    console.log(EventID);
    const deleteEvent = await fetch(`${IP}/api/deleteEvent`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        EventID: EventID,
      }),
    });

    const result = await deleteEvent.json();
    console.log(result);
  };

  const waive = async () => {
    try {
      await fetch(`${IP}/api/waive`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fightertable: table,
          username: account,
        }),
      });

      Alert.alert(
        "สละสิทธิ์สำเร็จ",
        "ท่านสามารถสมัครแข่งในกิจกรรมนี้ได้อีกครั้งหากยังไม่ปิดรับสมัคร"
      );
      navigation.navigate("Home");
    } catch (error) {
      console.log(error);
      Alert.alert("สละสิทธิ์ไม่สำเร็จ", "มีข้อผิดพลาดในการลบ");
    }
  };

  const NavigationWay = async () => {
    const getRound = await fetch(`${IP}/api/getRound/${table}`, {
      method: "GET",
    });

    const resultRound = await getRound.json();

    const getMatchpart = await fetch(`${IP}/api/getAllMatchpart/${table}`, {
      method: "GET",
    });

    const resultMatchpart = await getMatchpart.json();

    const MatchpartLen = resultMatchpart.length;
    if (MatchpartLen == 5) {
      navigation.navigate("Leaderboard", { tableID: table });
    } else if (resultRound == MatchpartLen) {
      navigation.navigate("Fighterlist", { tableID: table });
    } else {
      navigation.navigate("SubmitScore", {
        tableID: table,
        round: resultRound,
      });
    }
  };

  useEffect(() => {
    fetchDetail();
    
    const socket = io(IP);
    
    socket.on("refreshing", (refresh) => {
      console.log("Received real-time event update:", refresh);
      setIsloading(refresh);
    });
  }, [isLoading]);
  
  useEffect(() => {
    contestantCheck();
    fetchContestants();
  }, [table]);

  useEffect(() => {
    availableMenu();
  }, [item]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = async () => {
        navigation.navigate("Home");
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => {
        backHandler.remove();
      };
    }, [IP])
  );

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
                        deleteEvent();
                        navigation.navigate("Home");
                      },
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
                  eventID: EventID,
                  eventName: eventName,
                  condition: condition,
                  rule: rule,
                  time: time,
                  amount: amount,
                  address: address,
                  moredetail: moredetail,
                  closedate: closedate,
                  racedate: racedate,
                  status: statusNum,
                  table: table,
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
                navigation.navigate("contestants", {
                  table,
                  owner,
                  eventName,
                  EventID,
                  statusNum,
                });
              }}
              style={styles.menubox}
            >
              <Users color={"#176B87"} style={styles.menubut} />
            </Pressable>
          </View>
        )}
        {(isContestant || isOwner)&& (
          <Pressable
            onPress={() => {
              navigation.navigate("Leaderboard", { tableID: table });
            }}
          >
            <MaterialCommunityIcons
              name="podium-gold"
              size={25}
              marginHorizontal={20}
              color="#176B87"
              style={styles.menubutLeaderboard}
            />
          </Pressable>
        )}
        {isContestant && !isOwner && (
          <View style={styles.menu}>
            <Pressable
              style={styles.menubox}
              onPress={() => {
                navigation.navigate("History", { table, account });
              }}
            >
              <Clock color={"#176B87"} style={styles.menubut} />
            </Pressable>
            <Pressable
              style={styles.menubox}
              onPress={() => {
                navigation.navigate("contestants", {
                  table,
                  owner,
                  EventID,
                  eventName,
                });
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
        {(isContestant || isOwner) && (
          <TouchableOpacity
            style={styles.schedule}
            onPress={() => navigation.navigate("Pairing", { tableID: table })}
          >
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
        <Text style={styles.header}>วันแข่งขัน:</Text>
        <Text style={styles.content}>{racedate}</Text>
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
        {moredetail ? (
          <Text style={styles.content}>{moredetail}</Text>
        ) : (
          <Text style={styles.content}> - </Text>
        )}
      </View>
      {(status === "ปิดรับสมัคร" || status === "กำลังแข่งขัน") && isOwner && contestants.length >= 4 && (
        <View style={styles.eventBegin}>
          <Pressable
            onPress={() => {
              if (statusNum == 1) {
                eventBegin(EventID, navigation);
              } else if (statusNum == 2) {
                NavigationWay();
              }
            }}
          >
            <Text style={{ color: "white" }}>จัดการแข่งขัน</Text>
          </Pressable>
        </View>
      )}
      {status === "เปิดรับสมัคร" ? (
        account !== null &&
        !isOwner &&
        !isContestant && (
          <View style={styles.apply}>
            <TouchableOpacity
              onPress={() => {
                console.log(EventID);
                navigation.navigate("Apply", {
                  EventID,
                  eventName,
                  table,
                  account,
                });
              }}
            >
              <Text style={styles.applyText}>สมัคร</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View></View>
      )}
      {isContestant && (statusNum == 0 || statusNum == 1) && (
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
  status2: {
    justifyContent: "flex-start",
    backgroundColor: "#03A9F4",
    padding: 5,
    paddingLeft: 15,
    width: 150,
    marginLeft: -20,
    fontSize: 20,
    color: "white",
    marginTop: 20,
  },
  status3: {
    justifyContent: "flex-start",
    backgroundColor: "#9C27B0",
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
    marginHorizontal: 3,
  },
  menubutLeaderboard: {
    maxWidth: 30,
    maxHeight: 30,
    minWidth: 25,
    minHeight: 25,
    marginHorizontal: 13,
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
