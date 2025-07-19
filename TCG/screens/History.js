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
  const name = route.params;
  return (
    <View style={styles.container}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <ScrollView>
        <Text style={styles.header}>ประวัติการแข่งขัน</Text>
        <Text>รอบที่</Text>
        <View style={styles.Alltable}>
          <DataTable>
            {/*header */}
            <DataTable.Header>
              <DataTable.Title style={styles.tableHeaderLeft}>
                No.
              </DataTable.Title>
              <DataTable.Title style={styles.tableHeaderLeft}>
                ชื่อผู้เข้าแข่งขัน
              </DataTable.Title>
              <DataTable.Title></DataTable.Title>
              <DataTable.Title></DataTable.Title>
              <DataTable.Title></DataTable.Title>
              <DataTable.Title style={styles.tableHeaderRight}>
                No.
              </DataTable.Title>
              <DataTable.Title style={styles.tableHeaderRight}>
                ชื่อผู้เข้าแข่งขัน
              </DataTable.Title>
            </DataTable.Header>
            {/*row */}
            <DataTable.Row>
              <DataTable.Cell style={styles.tableHeaderLeft}>
                testNo.
              </DataTable.Cell>
              <DataTable.Cell style={styles.tableHeaderLeft}>0</DataTable.Cell>
              <DataTable.Cell>-</DataTable.Cell>
              <DataTable.Cell style={styles.tableHeaderRight}>0</DataTable.Cell>
              <DataTable.Cell style={styles.tableHeaderRight}>
                testName
              </DataTable.Cell>
            </DataTable.Row>
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
    flex: 1,
    justifyContent: "center",
  },
  tableWrap: {
    flex: 1,
    justifyContent: "space-around",
  },
  tableHeaderLeft: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 2,
    maxWidth: 50,
  },
  tableHeaderRight: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 2,
    maxWidth: 50,
  },
});
