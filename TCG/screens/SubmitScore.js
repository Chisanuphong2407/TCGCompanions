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

export const SubmitScore = ({ navigation, route }) => {
  const tableID = route.params.tableID;
  const round = route.params.round;
  const [schedule, setSchedule] = useState([]);
  const itemPerPage = 10;
  const [page, setPage] = useState(0);
  const [Totalpage, setTotalpage] = useState(0);
  const [firstScore, setFirstscore] = useState([]);
  const [secondScore, setSecondscore] = useState([]);

  const getSchedule = async () => {
    try {
      const result = await fetch(`${IP}/api/getMatch/${tableID}/${round}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const fetchschedule = await result.json();
      setSchedule(fetchschedule);
      setTotalpage(Math.ceil(schedule.length / itemPerPage));
    } catch (error) {
      console.error(error);
    }
  };

  const handle1stScore = (text, index) => {
    const newScore = [...firstScore];
    newScore[index] = text;
    setFirstscore(newScore);
  };

  const handle2ndScore = (text, index) => {
    const newScore = [...secondScore];
    newScore[index] = text;
    setSecondscore(newScore);
  };

  const handleSubmit = async() => {
    try {
      const fetchAPI = await fetch(`${IP}/api/submitScore`,{
        method: "POST",
        headers:{
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schedule: schedule,
          firstScore: firstScore,
          secondScore: secondScore
        })
      });

      const res = await fetchAPI.json();
      Alert.alert("noti",JSON.stringify(res.schedule[0].MatchID));
    } catch (error) {
      
    }
  };

  useEffect(() => {
    if (round !== null) {
      console.log("round:", round);
      getSchedule();
      console.log(schedule);
    }
  }, [round]);

  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, schedule.length);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>บันทึกผลคะแนน</Text>
      <Text>รอบที่: {round}</Text>
      <ScrollView>
        {/*table header*/}
        <DataTable style={styles.table}>
          <DataTable.Header>
            <DataTable.Title style={styles.tableNameLeft}>
              ผู้เข้าแข่งขัน
            </DataTable.Title>
            <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            <DataTable.Title></DataTable.Title>
            <DataTable.Title style={styles.tableVS}>
              <Text>VS.</Text>
            </DataTable.Title>
            <DataTable.Title></DataTable.Title>
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
                  <DataTable.Cell style={styles.tableInput}>
                    <TextInput
                      value={firstScore[index]}
                      onChangeText={(text) => handle1stScore(text, index)}
                      style={styles.inputScore}
                      keyboardType="numeric"
                    />
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableVS}>
                    <Text>-</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableInput}>
                    <TextInput
                      style={styles.inputScore}
                      value={secondScore[index]}
                      onChangeText={(text) => handle2ndScore(text, index)}
                      keyboardType="numeric"
                    />
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNo}>
                    {item.Fighter2nd}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNameRight}>
                    {item.fighter2ndName}
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
      <Text>current 1stScore: {firstScore}</Text>
      <Text>current 2ndScore: {secondScore}</Text>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>บันทึก</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    justifyContent: "center",
    padding: 15,
  },
  header: {
    fontSize: 30,
    marginTop: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 20,
  },
  table: {
    flex: 1,
    minWidth: "70%",
    maxWidth: "95%",
    margin: 5,
    borderWidth: 1,
    borderColor: "#d3d0d0",
    backgroundColor: "#f4f7fa",
    opacity: 0.8,
    borderRadius: 3,
    overflow: "hidden",
    justifyContent: "center",
  },
  tableVS: {
    justifyContent: "center",
  },
  tableInput: {
    justifyContent: "center",
  },
  inputScore: {
    backgroundColor: "#efeded",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "black",
    minWidth: 30,
    textAlign: "center",
  },
  tableNo: {
    justifyContent: "center",
  },
  tableNameLeft: {
    justifyContent: "flex-end",
    minWidth: 30,
  },
  tableNameRight: {
    justifyContent: "flex-start",
    minWidth: 30,
  },
  submitButton: {
    flexDirection: "row-reverse",
    margin: 15,
  },
  submitText: {
    backgroundColor: "#176b87",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    fontSize: 18,
    color: "white",
  },
});
