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
  const [round, setRound] = useState(0);
  const [Totalpage, setTotalpage] = useState(0);
  const itemPerPage = 10;
  const [page, setPage] = useState(0);

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
      setTotalpage(Math.ceil(fighter.length / itemPerPage));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllFighter();
  }, []);

  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, fighter.length);

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
            <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableName}>
              ชื่อผู้เข้าแข่งขัน
            </DataTable.Title>
          </DataTable.Header>

          {/* table rows */}
          {fighter.slice(from, to).length > 0 &&
            fighter.slice(from, to).map((item) => {
              const FighterID = item.FighterID;
              return (
                <DataTable.Row key={item.FighterID}>
                  <DataTable.Cell style={styles.tableNo}>
                    {item.FighterID}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableName}>
                    {item.UserName}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNo}>
                    {item.FighterID}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableName}>
                    {item.UserName}
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
    marginHorizontal: 5,
  },
  tableName: {
    minWidth: "25%",
    marginHorizontal: 5,
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
