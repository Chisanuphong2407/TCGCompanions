import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useEffect, useState, useCallback, BackHandler } from "react";
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
import io from "socket.io-client";
import { DataTable } from "react-native-paper";
import { UserPlus, X } from "react-native-feather";
import { IP } from "../App";

export const eventBegin = (EventID, navigation) => {
  const statusChange = async () => {
    try {
      console.log(EventID);
      const change = await fetch(`${IP}/api/eventbegin/${EventID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await change.json();
      console.log(result);
      if (result.message == "อัพเดตสำเร็จ") {
        Alert.alert(
          "เริ่มต้นเสร็จสิ้น",
          "ท่านสามารถจัดการแข่งขันได้แล้วในขณะนี้",
          [
            {
              text: "ตกลง",
              style: "default",
              onPress: () => {
                navigation.navigate("Eventdetails", EventID);
              },
            },
          ]
        );
      } else {
        Alert.alert("ไม่สำเร็จ");
      }
    } catch (error) {
      Alert.alert("อัพเดตสถานะไม่สำเร็จ", `กรุณาลองใหม่อีกครั้ง ${error}`);
    }
  };

  Alert.alert(
    "ยืนยันจัดการแข่งขัน",
    "หลังยืนยัน สถานะกิจกรรมจะเปลี่ยนเป็น 'กำลังแข่งขัน' และจะไม่สามารถลบกิจกรรมนี้ได้",
    [
      {
        text: "ยืนยัน",
        style: "default",
        onPress: statusChange,
      },
      {
        text: "ยกเลิก",
        style: "cancel",
      },
    ]
  );
};

export const contestants = ({ navigation, route }) => {
  const EventID = route.params.EventID;
  const Eventname = route.params.eventName;
  const tableID = route.params.table;
  const status = route.params.statusNum;
  const owner = route.params.owner.trim();
  const [account, setAccount] = useState("");
  const [fighter, setfighter] = useState([]);
  const itemPerPage = 10;
  const [page, setPage] = useState(0);
  const [isLoading, setIsloading] = useState(true);
  const [Totalpage, setTotalpage] = useState(0);
  const [isOwner, setIsowner] = useState(false);

  const fetchData = async () => {
    try {
      console.log("start fetch");
      console.log(EventID);
      const data = await fetch(`${IP}/api/fetchcontestants/${tableID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await data.json();
      setIsloading(false);
      setfighter(response);
      const vef = await AsyncStorage.getItem("@vef");
      setAccount(vef.trim());
      setTotalpage(Math.ceil(fighter.length / itemPerPage));
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = async () => {
        navigation.navigate("Eventdetails", EventID);
        return true;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [])
  );

  useEffect(() => {
    fetchData();
  }, [isLoading]);

  useEffect(() => {
    const socket = io(IP);

    socket.on("fighter refreshing", (refresh) => {
      console.log("Received real-time contestant update:", refresh);
      setIsloading(refresh);
    });
  });

  useEffect(() => {
    if (account == owner) {
      setIsowner(true);
    }
  }, [account]);

  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, fighter.length);

  console.log(status);
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <View style={styles.menu}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Eventdetails", EventID)}
        >
          <X style={styles.icon} />
        </TouchableOpacity>
        {(status == 0 || status == 1) && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AddFighter", {
                tableID,
                Eventname,
                owner,
                EventID,
                status,
              })
            }
          >
            <UserPlus style={styles.icon} />
          </TouchableOpacity>
        )}
      </View>
      <View>
        <Text style={styles.header}>ผู้เข้าแข่งขัน</Text>
      </View>
      <ScrollView style={styles.Alltable}>
        {/*table header*/}
        <DataTable style={styles.table}>
          <DataTable.Header>
            <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableName}>
              ชื่อผู้เข้าแข่งขัน
            </DataTable.Title>
            {isOwner && (
              <DataTable.Title style={styles.tableNation}>
                เนชัน
              </DataTable.Title>
            )}
          </DataTable.Header>

          {/* table rows */}
          {fighter.slice(from, to).length > 0 &&
            account &&
            fighter.slice(from, to).map((item, index) => {
              const FighterID = item.FighterID;
              return (
                <DataTable.Row
                  key={item.FighterID}
                  style={index % 2 == 0 ? styles.cell1 : styles.cell0}
                  onPress={() => {
                    if (owner == account) {
                      navigation.navigate("ContestantDetail", {
                        FighterID,
                        tableID,
                        userID: item.UserID,
                        Eventname,
                        EventID,
                        status,
                      });
                    }
                  }}
                >
                  <DataTable.Cell style={styles.tableNo}>
                    {item.FighterID}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableName}>
                    {item.UserName}
                  </DataTable.Cell>
                  {isOwner && (
                    <DataTable.Cell style={styles.tableNation}>
                      {item.Nation}
                    </DataTable.Cell>
                  )}
                </DataTable.Row>
              );
            })}

          <DataTable.Pagination
            page={page}
            numberOfPages={Totalpage}
            onPageChange={(page) => setPage(page)}
            label={`${page + 1} of ${Totalpage}`}
            numberOfItemsPerPage={itemPerPage}
            showFastPaginationControls
          />
        </DataTable>
      </ScrollView>
      {status != 3 && owner == account && (
        <View style={styles.manageEvent}>
          <TouchableOpacity
            onPress={() => {
              if (status == 0 || status == 1) {
                eventBegin(EventID, navigation);
              } else if (status == 2) {
                navigation.navigate("Fighterlist", { tableID, EventID });
              }
            }}
          >
            <Text style={styles.manageEventText}>จัดการแข่งขัน</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    justifyContent: "center",
  },
  Alltable: {
    padding: 5,
    alignSelf: "center",
  },
  header: {
    fontSize: 30,
    marginTop: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 20,
  },
  tableNo: {
    minWidth: "5%",
    maxWidth: "10%",
    marginHorizontal: 3,
  },
  tableName: {
    minWidth: "30%",
    marginHorizontal: 3,
  },
  tableNation: {
    minWidth: "25%",
    marginHorizontal: 5,
  },
  menu: {
    flexDirection: "row",
    marginTop: 40,
    padding: 20,
    paddingBottom: 0,
    justifyContent: "space-between",
  },
  icon: {
    color: "#176b87",
  },
  table: {
    flex: 1,
    minWidth: "20%",
    maxWidth: "95%",
    margin: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f4f7fa",
    opacity: 0.8,
    borderRadius: 5,
    overflow: "hidden",
    justifyContent: "space-evenly",
  },
  manageEvent: {
    alignSelf: "flex-end",
    backgroundColor: "#176b87",
    padding: 10,
    borderRadius: 5,
    margin: 30,
    marginLeft: 15,
    minWidth: 100,
  },
  manageEventText: {
    color: "white",
    alignSelf: "center",
  },
  bgIMG: {
    position: "absolute",
    width: 600,
    height: 600,
    right: -200,
    bottom: -200,
    opacity: 0.3,
  },
  cell1: {
    backgroundColor: "#ddd",
  },
  cell0: {
    backgroundColor: "#f4f7fa",
  },
});
