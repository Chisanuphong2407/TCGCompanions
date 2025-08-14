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
      result.sort((low, high) => high.TotalScore - low.TotalScore);
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

  useEffect(() => {
    getLeaderboard();
    getRound();
  }, [isLoading]);

  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, leaderboard.length);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ตารางคะแนน</Text>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <ScrollView>
        {/*table header*/}
          <DataTable style={round == 5 ? styles.tableLast : styles.table}>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
              <DataTable.Title style={styles.tableName}>
                ผู้เข้าแข่งขัน
              </DataTable.Title>
              <DataTable.Title style={styles.tableNation}>
                เนชั่น
              </DataTable.Title>
              <DataTable.Title style={styles.tableScore}>คะแนน</DataTable.Title>
              {round == 5 && (
                <DataTable.Title style={styles.tableScore}>
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
                    <DataTable.Cell style={styles.tableNo}>
                      {item.FighterID}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableName}>
                      {item.UserName}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableNation}>
                      {item.Nation}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableScore}>
                      {item.TotalScore}
                    </DataTable.Cell>
                    {round == 5 && (
                      <DataTable.Cell style={styles.tableScore}>
                        {item.solkolf_score}
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
        <TouchableOpacity style={styles.nextButton}>
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
  tableLast: {
    flex: 1,
    minWidth: "60%",
    maxWidth: "90%",
    borderWidth: 1,
    borderColor: "#d3d0d0",
    backgroundColor: "#f4f7fa",
    opacity: 0.8,
    borderRadius: 3,
    borderLeftWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    overflow: "hidden",
    alignSelf: "center",
  },
  tableHeader: {
    backgroundColor: "#c9e2fa",
  },
  tableNo: {
    minWidth: "5%",
    maxWidth: "7%",
    justifyContent: "center",
    marginHorizontal: 1,
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
