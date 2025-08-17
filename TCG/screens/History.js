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
  const name = route.params.account;
  const tableID = route.params.table;
  const [userID, setUserID] = useState();
  const [history, setHistory] = useState([]);

  const getProfile = async () => {
    // console.log(name);
    try {
      const profile = await fetch(`${IP}/api/getprofile/${name}`, {
        method: "GET",
      });

      const resultProfile = await profile.json();

      setUserID(resultProfile[0].UserID);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", JSON.stringify(error));
    }
  };

  const getHistory = async () => {
    try {
      const historyFetch = await fetch(`${IP}/api/getHistory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fighterID: userID,
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
    getProfile();
    console.log(userID);
    getHistory();
    console.log(history);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <ScrollView>
        <Text style={styles.header}>ประวัติการแข่งขัน</Text>
        {history.length > 0 &&
          history.map((item) => <Text>รอบที่ {item.Round}</Text>)}

        <View>
          <DataTable style={styles.Alltable}>
            {/*header */}
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
            {/*row */}
            {history.length > 0 &&
              history.map((item, index) => {
                return (
                  <DataTable.Row key={item.MatchID}>
                    <DataTable.Cell style={styles.tableNameHeader}>
                      {item.firstName}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableScoreHeader}>
                      {item.Fighter1st_Score}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.dat}>-</DataTable.Cell>
                    <DataTable.Cell style={styles.tableScoreHeader}>
                      {item.Fighter2nd_Score}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableNameHeader}>
                      {item.secondName}
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
          </DataTable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    padding: 20,
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
  Alltable: {
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
  tableNameHeader: {
    justifyContent: "center",
    // marginHorizontal: 2,
    minWidth: "20%",
  },
  tableScoreHeader: {
    justifyContent: "center",
    // marginHorizontal: 2,
    minWidth: "10%",
  },
  tableHeaderRight: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 2,
    maxWidth: 50,
  },
  dat: {
    justifyContent: "center",
    fontWeight: "bold",
  },
});
