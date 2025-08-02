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

export const SubmitScore = ({ navigation, route }) => {
  const tableID = route.params.tableID;
  const round = route.params.round;
  const [schedule, setSchedule] = useState([]);
  const itemPerPage = 10;
  const [page, setPage] = useState(0);

  const getSchedule = async () => {
    try {
      const result = await fetch(`${IP}/api/getMatch/${tableID}/${round}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const fetchschedule = await result.json();
      setSchedule(fetchschedule);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (round !== null) {
      console.log("round:", round);
      getSchedule();
      console.log(schedule);
    }
  }, [round]);

  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, schedule.length);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>บันทึกผลคะแนน</Text>
      <Text>รอบที่: {round}</Text>
      <ScrollView>
        {/*table header*/}
        <DataTable style={styles.table}>
          <DataTable.Header>
            <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableName}>
              ผู้เข้าแข่งขัน
            </DataTable.Title>
            <DataTable.Title style={styles.inputSpace}></DataTable.Title>
            <DataTable.Title style={styles.tableVS}>
              <Text style={styles.fontVS}>VS</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.inputSpace}></DataTable.Title>
            <DataTable.Title style={styles.tableNoRight}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableNameRight}>
              ผู้เข้าแข่งขัน
            </DataTable.Title>
          </DataTable.Header>

          {/* table rows */}
          {schedule.slice(from, to).length > 0 &&
            schedule.slice(from, to).map((item) => {
              return (
                <DataTable.Row key={item.MatchID}>
                  <DataTable.Cell style={styles.tableNo}>
                    {item.Fighter1st}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableName}>
                    {item.fighter1stName}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableInput}>
                    <TextInput style={styles.inputScore} />
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tabledat}>
                    <Text style={styles.fontVS}>-</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableInput}>
                    <TextInput style={styles.inputScore} />
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
        </DataTable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    justifyContent: "center",
    padding: 15,
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
    flex: 0.2,
    minWidth: "6%",
    marginHorizontal: 1,
    justifyContent: "flex-start",
  },
  tableNoRight: {
    flex: 0.2,
    minWidth: "6%",
    marginHorizontal: 1,
    justifyContent: "flex-end",
  },
  tableName: {
    flex: 0.2,
    minWidth: "20%",
    marginHorizontal: 2,
    justifyContent: "flex-start",
  },
  tableNameRight: {
    flex: 0.2,
    minWidth: "20%",
    marginHorizontal: 2,
    justifyContent: "flex-end",
  },
  tableInput: {
    flex: 0.1,
    minWidth: "20%",
    marginHorizontal: 3,
    justifyContent: "center",
  },
  tableVS: {
    minWidth: "5%",
    justifyContent: "center",
    marginHorizontal: 1,
  },
  tabledat: {
    minWidth: "1%",
    justifyContent: "center",
    marginHorizontal: 1,
  },
  inputSpace: {
    flex: 0.1,
    minWidth: "10%",
    marginHorizontal: 1,
    alignSelf: "center",
    backgroundColor: "#9b9a9a",
  },
  inputScore: {
    flex: 0.1,
    backgroundColor: "#9b9a9a",
    minWidth: "10%",
    marginHorizontal: 1,
    alignSelf: "center",
  },
  fontVS: {
    fontWeight: "bold",
  },
  table: {
    flex: 1,
    minWidth: "70%",
    maxWidth: "95%",
    margin: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f4f7fa",
    opacity: 0.8,
    borderRadius: 5,
    overflow: "hidden",
    justifyContent: "center",
  },
});
