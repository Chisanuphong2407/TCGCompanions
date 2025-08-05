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
import io from "socket.io-client";
import { DataTable } from "react-native-paper";
import { UserPlus, X } from "react-native-feather";
import { IP } from "../App";

export const contestantsList = ({ navigation, route }) => {
  const tableID = route.params.tableID;
  const [fighter, setfighter] = useState([]);
  const itemPerPage = 10;
  const [page, setPage] = useState(0);
  const [isLoading, setIsloading] = useState(true);
  const [Totalpage, setTotalpage] = useState(0);

  const fetchData = async () => {
    try {
      console.log("start fetch");
        console.log(tableID);
      const data = await fetch(`${IP}/api/fetchcontestants/${tableID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await data.json();
      setIsloading(false);
      setfighter(response);
      setTotalpage(Math.ceil(fighter.length / itemPerPage));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoading]);

  useEffect(() => {
    const socket = io(IP);

    socket.on("refreshing", (refresh) => {
      console.log("Received real-time contestant update:", refresh);
      setIsloading(refresh);
    });
  });

  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, fighter.length);

  return (
    <SafeAreaView style={styles.container}>
          <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
          <View>
            <Text style={styles.header}>ผู้เข้าแข่งขัน</Text>
          </View>
          <ScrollView>
            {/*table header*/}
            <DataTable style={styles.table}>
              <DataTable.Header>
                <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
                <DataTable.Title style={styles.tableName}>
                  ชื่อผู้เข้าแข่งขัน
                </DataTable.Title>
                  <DataTable.Title style={styles.tableNation}>
                    เนชัน
                  </DataTable.Title>
                  <DataTable.Title style={styles.tableArchtype}>
                    สายการเล่น
                  </DataTable.Title>
              </DataTable.Header>
    
              {/* table rows */}
              {fighter.slice(from, to).length > 0 &&
                fighter.slice(from, to).map((item) => {
                  const FighterID = item.FighterID;
                  return (
                    <DataTable.Row
                      key={item.FighterID}
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
                        <DataTable.Cell style={styles.tableArchtype}>
                          {item.Archtype}
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
  tableNation: {
    minWidth: "20%",
    marginHorizontal: 5,
  },
  tableArchtype: {
    minWidth: "15%",
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
});
