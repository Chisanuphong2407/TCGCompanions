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

export const Table = ({ route, navigation }) => {
  const tableID = route.params.tableID;
  const [fighter, setFighter] = useState([]);
  const [fighterLength, setFighterlength] = useState(0);
  const [round, setRound] = useState(0);
  const [Totalpage, setTotalpage] = useState(0);
  const itemPerPage = 10;
  const [page, setPage] = useState(0);
  const fighter1st = [];
  const fighter2nd = [];
  const [isLoading, setIsloading] = useState(true);
  const [schedule, setSchedule] = useState([]);

  const fetchAllFighter = async () => {
    try {
      const fetchFighter = await fetch(
        `${IP}/api/fetchcontestants/${tableID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await fetchFighter.json();

      setFighter(result);
      setFighterlength(fighter.length);
      setTotalpage(Math.ceil(Math.ceil(fighter.length/2) / itemPerPage));
      setIsloading(false);
      console.log("fetch Finish");
      // console.log("len", fighter.length);
      // console.log(fighterLength);
    } catch (error) {
      console.error(error);
    }
  };

  const match = async () => {
    // console.log("fighterlen", fighterLength);
    for (let index = 0; index < fighterLength; index++) {
      console.warn("round", index + 1);
      console.log("len", fighter.length);
      const randomIndex = Math.floor(Math.random() * fighter.length);
      console.log("Random", randomIndex);
      if (index % 2 == 0) {
        fighter1st.push(fighter[randomIndex].FighterID);
      } else {
        fighter2nd.push(fighter[randomIndex].FighterID);
      }
      fighter.splice(randomIndex, 1);
    }
    console.log("match finish");
    // console.log("result", fighter1st, fighter2nd);
    const insert = await fetch(`${IP}/api/insertTable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Fightertable: tableID,
        fighter1st: fighter1st,
        fighter2nd: fighter2nd,
      }),
    });

    const res = await insert.json();
    if (res.message == "failed") {
      Alert.alert("เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง");
    } else {
      Alert.alert("สร้างตารางสำเร็จ");
      console.log("1stround", res.round);
      const thisRound = res.round;
      setRound(thisRound);
    }
  };

  const getSchedule = async () => {
    try {
      const result = await fetch(`${IP}/api/getMatch/${tableID}/${round}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const fetchschedule = await result.json();
      console.log(fetchschedule);
      setSchedule(fetchschedule);
      console.log("schedule", schedule);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (fighterLength == 0) {
      fetchAllFighter();
    } else {
      match();
    }
  }, [isLoading, fighterLength]);

  useEffect(() => {
    if (round !== null) {
      console.log("round (updated in useEffect):", round);
      getSchedule();
    }
  }, [round]);

  useEffect(() => {
    if (schedule !== null) {
      console.log("schedule :", schedule);
    }
  }, [schedule]);

  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, fighterLength);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <View style={styles.icon}>
        <Users color={"#176b87"} width={35} height={35} />
      </View>
      <View>
        <Text style={styles.header}>ตารางการแข่งขัน</Text>
        <Text style={styles.round}>รอบที่ {round}</Text>
      </View>
      <ScrollView>
        {/*table header*/}
        <DataTable style={styles.table}>
          <DataTable.Header>
            <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableName}>
              ชื่อผู้เข้าแข่งขัน
            </DataTable.Title>
            <DataTable.Title style={styles.tableVS}>
              <Text style={styles.fontVS}>VS.</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableName}>
              ชื่อผู้เข้าแข่งขัน
            </DataTable.Title>
          </DataTable.Header>

          {/* table rows */}
          {schedule.slice(from, to).length > 0 &&
            schedule.slice(from, to).map((item) => {
              return (
                <DataTable.Row key={item.FighterID}>
                  <DataTable.Cell style={styles.tableNo}>
                    {item.Fighter1st}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableName}>
                    {item.fighter1stName}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableVS}>
                    <Text style={styles.fontVS}>VS.</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNo}>
                    {item.Fighter2nd}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableName}>
                    {item.fighter2ndName}
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
    </SafeAreaView>
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
  tableNo: {
    minWidth: "5%",
    marginHorizontal: 3,
    justifyContent: "flex-start",
  },
  tableName: {
    minWidth: "25%",
    marginHorizontal: 3,
    justifyContent: "flex-start",
  },
  tableVS: {
    minWidth: "15%",
    justifyContent: "center",
  },
  fontVS: {
    fontWeight: "bold",
  },
  table: {
    flex: 0.8,
    minWidth: "60%",
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
  bgIMG: {
    position: "absolute",
    width: 600,
    height: 600,
    right: -200,
    bottom: -200,
    opacity: 0.3,
  },
  icon: {
    flexDirection: "row",
    marginTop: 40,
    padding: 20,
    paddingBottom: 0,
    justifyContent: "flex-end",
  },
  header: {
    fontSize: 30,
    marginTop: 30,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 20,
  },
  round: {
    marginLeft: 20,
    marginBottom: 10,
  },
});
