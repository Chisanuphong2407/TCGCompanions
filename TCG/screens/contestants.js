import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
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
import { Trash2, Edit2, Users, Clock } from "react-native-feather";
import { IP } from "../App";

export const contestants = ({ navigation, route }) => {
  const tableID = route.params.table;
  const owner = route.params.owner;
  console.log('owner',owner);
  console.log('table',tableID);
  const [fighter, setfighter] = useState([]);
  const itemPerPage = 14;
  const [page, setPage] = useState(0);
  const [isLoading, setIsloading] = useState(true);
  const [Totalpage,setTotalpage] = useState();
  // Math.ceil(data.length / ITEMS_PER_PAGE);

  // คำนวณรายการที่จะแสดงในหน้าปัจจุบัน
  // const from = page * ITEMS_PER_PAGE;
  // const to = Math.min((page + 1) * ITEMS_PER_PAGE, data.length);
  const [displayedItems,setDisplayItems] = useState();
  //data.slice(from, to);

  const fetchData = async () => {
    try {
      console.log("start fetch")
      const data = await fetch(`${IP}/api/fetchcontestants/${tableID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      setIsloading(false);
      setfighter(data[0]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoading]);

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
      <View>
        {/*header*/}
        <View>
          <Text>No.</Text>
          <Text>{fighter}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    justifyContent: "center",
  },
});
