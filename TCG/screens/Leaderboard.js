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

export const Leaderboard = ({ navigation, route }) => {
  const tableID = route.params.tableID;
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const itemPerPage = 10;
  const [page, setPage] = useState(0);
  const [Totalpage, setTotalpage] = useState(0);

  const getLeaderboard = async () => {
    try {
      const leaderboardfetch = await fetch(
        `${IP}/api/getLeaderboard/${tableID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await leaderboardfetch.json();
      setLeaderboard(result);
      setTotalpage(Math.ceil(leaderboard.length / itemPerPage));
      setIsloading(false);
    } catch (error) {
      Alert.prompt("failed");
    }
  };

  useEffect(() => {
    getLeaderboard();
  }, [isLoading]);

  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, leaderboard.length);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ตารางคะแนน</Text>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <ScrollView>
        {/*table header*/}
        <DataTable>
          <DataTable.Header>
           <DataTable.Title>No.</DataTable.Title>
           <DataTable.Title>ผู้เข้าแข่งขัน</DataTable.Title>
           <DataTable.Title>เนชั่น</DataTable.Title>
           <DataTable.Title>คะแนน</DataTable.Title>
          </DataTable.Header>

          {/* table rows */}
          {leaderboard.slice(from, to).length > 0 &&
            leaderboard.slice(from, to).map((item, index) => {
              return (
                <DataTable.Row key={item.FighterID}>
                  <DataTable.Cell>{item.FighterID}</DataTable.Cell>
                  <DataTable.Cell>{item.UserName}</DataTable.Cell>
                  <DataTable.Cell>{item.Nation}</DataTable.Cell>
                  <DataTable.Cell>{item.TotalScore}</DataTable.Cell>
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
    opacity: 0.3,
  },
});
