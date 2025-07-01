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
  const ID = route.params.EventID;
  const eventName = route.params.EventName;
  const table = route.params.tableID;
  const owner = route.params.owner.trim();
  const FighterID = route.params.FighterID;

  const fetchData = async () => {
    try {
      console.log("start fetch");
      const data = await fetch(`${IP}/api/fetchcontestants/${table}`, {
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

  return (
    <View>
        <Text>incoming</Text>
    </View>
      )
    }

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
