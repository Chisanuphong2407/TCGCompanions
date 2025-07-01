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

export const contestants = ({ navigation, route }) => {
  const tableID = route.params.table;
  const owner = route.params.owner.trim();
  const [account, setAccount] = useState("");
  const [fighter, setfighter] = useState([]);
  const itemPerPage = 14;
  const [page, setPage] = useState(0);
  const [isLoading, setIsloading] = useState(true);
  const [Totalpage, setTotalpage] = useState(0);
  const [displayedItems, setDisplayItems] = useState([]);
  const [isOwner, setIsowner] = useState(false);

  const fetchData = async () => {
    try {
      console.log("start fetch");
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
      const from = page * itemPerPage;
      const to = Math.min((page + 1) * itemPerPage, fighter.length);
      setDisplayItems(fighter.slice(from, to));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoading]);

  useEffect(() => {
    if (account == owner) {
      setIsowner(true);
    }
  }, [account]);

  useEffect(() => {
    const from = page * itemPerPage;
    const to = Math.min((page + 1) * itemPerPage, fighter.length);
    const slicedItems = fighter.slice(from, to);
    setDisplayItems(slicedItems);
    console.log("display", displayedItems);
  }, [fighter]);

  const Nextpage = () => {
    if (page < Totalpage) {
      setPage(page + 1);
    }
  };

  const Previouspage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menu}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <UserPlus style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.header}>ผู้เข้าแข่งขัน</Text>
      </View>
      <ScrollView horizontal contentContainerStyle={styles.tableOverall}>
        {/*table header*/}
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={styles.tableTitleNo}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableTitleName}>
              ชื่อผู้เข้าแข่งขัน
            </DataTable.Title>
            {isOwner && (
              <DataTable.Title style={styles.tableTitleNation}>
                เนชัน
              </DataTable.Title>
            )}
            {isOwner && (
              <DataTable.Title style={styles.tableTitleArchtype}>
                สายการเล่น
              </DataTable.Title>
            )}
          </DataTable.Header>

          {/* table rows */}
          {displayedItems.length > 0 &&
            account &&
            displayedItems.map((item) => {
              return (
                <DataTable.Row key={item.FighterID}>
                  <DataTable.Cell style={styles.tableCellNo}>
                    {item.FighterID}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableCellName}>
                    {item.UserName}
                  </DataTable.Cell>
                  {isOwner && (
                    <DataTable.Cell style={styles.tableCellNation}>
                      {item.Nation}
                    </DataTable.Cell>
                  )}
                  {isOwner && (
                    <DataTable.Cell style={styles.tableCellArchtype}>
                      {item.Archtype}
                    </DataTable.Cell>
                  )}
                </DataTable.Row>
              );
            })}
        </DataTable>
      </ScrollView>
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
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
  tableOverall: {
    flex: 1,
    minWidth: "100%",
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center",
  },
  tableTitleNo: {
    minWidth: 20,
    marginHorizontal: 5,
  },
  tableTitleName: {
    minWidth: 100,
    marginHorizontal: 5,
  },
  tableTitleNation: {
    minWidth: 100,
    marginHorizontal: 5,
  },
  tableTitleArchtype: {
    minWidth: 100,
    marginHorizontal: 5,
  },
  tableCellNo: {
    minWidth: 20,
    marginHorizontal: 5,
  },
  tableCellName: {
    minWidth: 100,
    marginHorizontal: 5,
  },
  tableCellNation: {
    minWidth: 100,
    marginHorizontal: 5,
  },
  tableCellArchtype: {
    minWidth: 100,
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
    color: "#176B87",
  },
});
