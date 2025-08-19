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
import { DataTable } from "react-native-paper";
import { Users } from "react-native-feather";
import { IP } from "../App";

export const Leaderboard = ({ navigation, route }) => {
  const tableID = route.params.tableID;
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const itemPerPage = 10;
  const [page, setPage] = useState(0);
  const [Totalpage, setTotalpage] = useState(0);
  const [round, setRound] = useState(0);

  const getLeaderboard = async () => {
    try {
      const leaderboardfetch = await fetch(
        `${IP}/api/getLeaderboard/${tableID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await leaderboardfetch.json();
      result.sort((a, b) => {
        if (a.TotalScore > b.TotalScore) {
          return -1;
        } else if (a.TotalScore < b.TotalScore) {
          return 1;
        } else if (a.solkolf_score > b.solkolf_score) {
          return -1;
        } else if (a.solkolf_score < b.solkolf_score) {
          return 1;
        }

        return 0;
      });
      setLeaderboard(result);
      setTotalpage(Math.ceil(leaderboard.length / itemPerPage));
      setIsloading(false);
    } catch (error) {
      Alert.prompt("failed");
    }
  };

  const getRound = async () => {
    try {
      const fetchRound = await fetch(`${IP}/api/getRound/${tableID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resultRound = await fetchRound.json();
      setRound(resultRound);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "แสดงตารางคะแนนไม่สำเร็จ");
    }
  };

  const eventFinish = async () => {
    try {
      const finishEvent = await fetch(`${IP}/api/EventFinish/${tableID}`, {
        method: "PUT",
      });
      const finishResult = await finishEvent.json();
      if (finishResult.message == "success") {
        const fetchEventID = await fetch(`${IP}/api/getEventID/${tableID}`, {
          method: "GET",
        });
        const eventID = await fetchEventID.json();
        console.log(eventID);
        Alert.alert(
          "ดำเนินการเสร็จสิ้น",
          "ท่านยังสามารถดูตารางคะแนนได้หลังการแข่งขันเสร็จสิ้น",
          [
            {
              text: "ตกลง",
              onPress: () => navigation.navigate("Eventdetails", eventID ),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด");
    }
  };

  useEffect(() => {
    getLeaderboard();
    getRound();
  }, [isLoading]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = async () => {
        const EventID = await fetch(`${IP}/api/getEventID/${tableID}`, {
          method: "GET",
        });
        const ID = await EventID.json();
        navigation.navigate("Eventdetails", ID);
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

  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, leaderboard.length);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ตารางคะแนน</Text>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <ScrollView>
        {/*table header*/}
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.tableHeader}>
            {round == 5 ? (
              <DataTable.Title style={styles.tableNo}>อันดับ</DataTable.Title>
            ) : (
              <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            )}
            {/* {feature.map((title,index) => (
              <DataTable.Title key={index} style={index == 4 ? styles.cell0 : styles.cell1}>{title.name}</DataTable.Title>
            ))} */}
            <DataTable.Title style={styles.tableName}>
              ผู้เข้าแข่งขัน
            </DataTable.Title>
            <DataTable.Title style={styles.tableNation}>เนชั่น</DataTable.Title>
            <DataTable.Title style={styles.tableScore}>คะแนน</DataTable.Title>
            {round == 5 && (
              <DataTable.Title style={styles.tableSolkolf}>
                solkolf
              </DataTable.Title>
            )}
          </DataTable.Header>

          {/* table rows */}
          {leaderboard.slice(from, to).length > 0 &&
            leaderboard.slice(from, to).map((item, index) => {
              return (
                <DataTable.Row
                  key={item.FighterID}
                  style={index % 2 == 0 ? styles.cell1 : styles.cell0}
                >
                  {round == 5 ? (
                    <DataTable.Cell style={styles.tableNo}>
                      {index + 1}
                    </DataTable.Cell>
                  ) : (
                    <DataTable.Cell style={styles.tableNo}>
                      {item.FighterID}
                    </DataTable.Cell>
                  )}

                  <DataTable.Cell style={styles.tableName}>
                    {item.UserName}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNation}>
                    {item.Nation}
                  </DataTable.Cell>
                  {round == 5 && (
                    <DataTable.Cell style={styles.tableScore}>
                      {item.solkolf_score}
                    </DataTable.Cell>
                  )}
                  <DataTable.Cell style={styles.tableScore}>
                    {item.TotalScore}
                  </DataTable.Cell>
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
      {round != 5 && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() =>
            navigation.navigate("Table", {
              tableID: leaderboard[0].Fightertable,
            })
          }
        >
          <Text style={styles.nextText}>สร้างตารางรอบถัดไป</Text>
        </TouchableOpacity>
      )}
      {round == 5 && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            Alert.alert("ยืนยันการจบการแข่งขัน", "",[
              {
                text: "ตกลง",
                onPress: eventFinish,
              },
              {
                text: "ยกเลิก",
              },
            ]);
          }}
        >
          <Text style={styles.nextText}>เสร็จสิ้นการแข่งขัน</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    justifyContent: "center",
  },
  header: {
    fontSize: 30,
    marginTop: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 20,
  },
  bgIMG: {
    position: "absolute",
    width: 600,
    height: 600,
    right: -200,
    bottom: -200,
    opacity: 0.3,
  },
  table: {
    flex: 1,
    minWidth: "70%",
    maxWidth: "90%",
    borderWidth: 1,
    borderColor: "#d3d0d0",
    backgroundColor: "#f4f7fa",
    opacity: 0.8,
    borderRadius: 3,
    overflow: "hidden",
    alignSelf: "center",
  },
  tableHeader: {
    backgroundColor: "#c9e2fa",
  },
  tableNo: {
    minWidth: "5%",
    maxWidth: "12%",
    justifyContent: "center",
  },
  tableName: {
    minWidth: "20%",
    maxWidth: "40%",
    justifyContent: "flex-start",
    paddingLeft: 10,
    marginHorizontal: 1,
  },
  tableNation: {
    minWidth: "20%",
    maxWidth: "40%",
    justifyContent: "flex-start",
    paddingLeft: 10,
    marginHorizontal: 1,
  },
  tableScore: {
    minWidth: "10%",
    maxWidth: "15%",
    justifyContent: "center",
    marginHorizontal: 1,
  },
  tableSolkolf: {
    minWidth: "10%",
    maxWidth: "15%",
    justifyContent: "center",
    marginHorizontal: 1,
    // backgroundColor: "#ddd"
  },
  cell1: {
    backgroundColor: "#ddd",
  },
  cell0: {
    backgroundColor: "#f4f7fa",
  },
  nextButton: {
    alignSelf: "flex-end",
    backgroundColor: "#176b87",
    padding: 10,
    borderRadius: 15,
    margin: 20,
    marginBottom: 30,
    minWidth: 100,
  },
  nextText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
});
