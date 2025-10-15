import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView ,BackHandler} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, useNavigation ,useFocusEffect} from "@react-navigation/native";
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

export const Pairing = ({ navigation, route }) => {
  const tableID = route.params.tableID;
  const [round, setRound] = useState(0);
  const [Totalpage, setTotalpage] = useState(0);
  const itemPerPage = 10;
  const [page, setPage] = useState(0);
  const [isLoading, setIsloading] = useState(true);
  const [schedule, setSchedule] = useState([]);

  const getRound = async () => {
    try {
      const fetchRound = await fetch(`${IP}/api/getRound/${tableID}`, {
        method: "GET",
      });

      const resultRound = await fetchRound.json();
      setRound(resultRound);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "");
    }
  };

  const getSchedule = async () => {
    try {
      const fetchSchedule = await fetch(
        `${IP}/api/getMatch/${tableID}/${round}`,
        {
          method: "GET",
        }
      );

      const resultSchedule = await fetchSchedule.json();
      setSchedule(resultSchedule);
      setIsloading(false);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "");
    }
  };

  useEffect(() => {
    getRound();
    getSchedule();
  }, [isLoading]);

  useEffect(() => {
    setTotalpage(Math.ceil(schedule.length / itemPerPage));
  }, [schedule]);

  useFocusEffect(
      useCallback(() => {
        const onBackPress = async () => {
          const EventID = await fetch(`${IP}/api/getEventID/${tableID}`, {
            method: "GET",
          });
          const ID = await EventID.json();
          navigation.navigate("Eventdetails", ID);
          return true;
        };
  
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress
        );
  
        return () => {
          backHandler.remove();
        };
      }, [IP])
    );
    
  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, schedule.length);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ตารางการแข่งขัน</Text>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      {schedule.length != 0 ? 
       <ScrollView style={styles.content}>
        <Text>รอบที่: {round}</Text>
        {/*table header*/}
        <DataTable style={styles.table}>
          <DataTable.Header>
            <DataTable.Title style={styles.tableNameLeft}>
              ผู้เข้าแข่งขัน
            </DataTable.Title>
            <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableVS}>
              <Text style={styles.fontVS}>โต๊ะที่</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableNameRight}>
              ผู้เข้าแข่งขัน
            </DataTable.Title>
          </DataTable.Header>

          {/* table rows */}
          {schedule.slice(from, to).length > 0 &&
            schedule.slice(from, to).map((item, index) => {
              return (
                <DataTable.Row key={item.MatchID}>
                  <DataTable.Cell style={styles.tableNameLeft}>
                    {item.fighter1stName}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNo}>
                    {item.Fighter1st}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableVS}>
                    <Text style={styles.fontVS}>{index +1}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNo}>
                    {item.Fighter2nd != 0 && item.Fighter2nd}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNameRight}>
                    {item.Fighter2nd == 0 ? "ชนะบาย" : item.fighter2ndName}
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
      :
        <View style={styles.empty}>
          <Text style={styles.emptyText} >ยังไม่มีตารางการแข่งขันในขณะนี้</Text>
        </View>}
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    justifyContent: "center",
  },
  content: {
    margin: 10,
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
    maxWidth: "7%",
    marginHorizontal: 8,
    justifyContent: "center",
  },
  tableNameLeft: {
    minWidth: "20%",
    marginHorizontal: 3,
    justifyContent: "flex-end",
  },
  tableNameRight: {
    minWidth: "20%",
    marginHorizontal: 3,
    justifyContent: "flex-start",
  },
  tableVS: {
    minWidth: "15%",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: 'center'
  },
  fontVS: {
    fontWeight: "bold",
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
    emptyText: {
    fontSize: 20,
    alignSelf: "center",
    opacity: 0.6,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
  },
});
