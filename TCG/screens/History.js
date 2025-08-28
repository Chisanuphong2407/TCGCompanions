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
import { UserPlus, X } from "react-native-feather";
import { IP } from "../App";

export const History = ({ route, navigation }) => {
  const name = route.params.account.trim();
  const tableID = route.params.table;
  const [history, setHistory] = useState([]);

  const getHistory = async () => {
    try {
      const historyFetch = await fetch(`${IP}/api/getHistory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: name,
          tableID: tableID,
        }),
      });

      const resultHistory = await historyFetch.json();
      setHistory(resultHistory);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด");
      console.error(error);
    }
  };

  useEffect(() => {
    // console.log(name);
    // console.log(tableID);
    getHistory();
    console.log(history);
    console.log(history.length);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <ScrollView>
        <Text style={styles.header}>ประวัติการแข่งขัน</Text>
        {history.length > 0 ? (
          <DataTable>
            {history.map((item, index) => {
              return (
                <View style={styles.Alltable}>
                  <Text style={styles.Round}>รอบที่ {item.Round}</Text>
                  <DataTable.Header>
                    <DataTable.Title style={styles.tableNameHeader}>
                      ชื่อผู้เข้าแข่งขัน
                    </DataTable.Title>
                    <DataTable.Title style={styles.tableScoreHeader}>
                      คะแนน
                    </DataTable.Title>
                    <DataTable.Title style={styles.dat}></DataTable.Title>
                    <DataTable.Title style={styles.tableScoreHeader}>
                      คะแนน
                    </DataTable.Title>
                    <DataTable.Title style={styles.tableNameHeader}>
                      ชื่อผู้เข้าแข่งขัน
                    </DataTable.Title>
                  </DataTable.Header>

                  {/* rows */}
                  <DataTable.Row>
                    <DataTable.Cell style={name == item.firstName ? styles.tableNameHeaderFocus :styles.tableNameHeader}>
                      <Text style={(name == item.firstName ? styles.focus: null)}>{item.firstName}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={name == item.firstName ? styles.tableScoreHeaderFocus :styles.tableScoreHeader}>
                      <Text style={(name == item.firstName ? styles.focus: null)}>{item.Fighter1st_Score}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.dat}> - </DataTable.Cell>
                    <DataTable.Cell style={name == item.secondName ? styles.tableScoreHeaderFocus :styles.tableScoreHeader}>
                      <Text style={(name == item.secondName ? styles.focus: null)}>{item.Fighter2nd_Score}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={name == item.secondName ? styles.tableNameHeaderFocus :styles.tableNameHeader}>
                      <Text style={(name == item.secondName ? styles.focus: null)}>{item.secondName}</Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                </View>
              );
            })}
          </DataTable>
        ) : (
          <Text style={styles.noContent}>
            ยังไม่มีประวัติการแข่งขันในขณะนี้
          </Text>
        )}
      </ScrollView>
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
    opacity: 0.1,
  },
  Alltable: {
    flex: 1,
    minWidth: "60%",
    maxWidth: "100%",
    margin: 20,
    marginBottom: 10,
    overflow: "hidden",
    justifyContent: "space-evenly",
    opacity: 0.8,
  },
  tableNameHeader: {
    justifyContent: "center",
    // marginHorizontal: 2,
    minWidth: "20%",
  },
  tableNameHeaderFocus: {
    justifyContent: "center",
    // marginHorizontal: 2,
    minWidth: "20%",
    backgroundColor:"#ddd",
    opacity:0.8
  },
  tableScoreHeader: {
    justifyContent: "center",
    // marginHorizontal: 2,
    minWidth: "10%",
  },
  tableScoreHeaderFocus: {
    justifyContent: "center",
    // marginHorizontal: 2,
    minWidth: "10%",
    fontWeight: 'bold',
    backgroundColor: '#ddd',
    opacity:0.8
  },
  dat: {
    justifyContent: "center",
    fontWeight: "bold",
  },
  noContent: {
    flex: 3,
    fontSize: 16,
    opacity: 0.5,
    textAlign: "center",
  },
  focus: {
    fontWeight: 'bold'
  }
});
