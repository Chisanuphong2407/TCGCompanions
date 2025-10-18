import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, BackHandler } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigationContainer,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
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
  const [fighterLength, setFighterlength] = useState(0);
  const [round, setRound] = useState(0);
  const [Totalpage, setTotalpage] = useState(0);
  const itemPerPage = 8;
  const [page, setPage] = useState(0);
  const fighter1st = [];
  const fighter2nd = [];
  const [isLoading, setIsloading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [account, setAccount] = useState("");

  const fetchAllFighter = async () => {
    setAccount(await AsyncStorage.getItem("@vef"));
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
      console.log(result);

      setFighter(result);
      setFighterlength(fighter.length);
      setTotalpage(Math.ceil(Math.ceil(fighter.length / 2) / itemPerPage));
      setIsloading(false);
      console.log("fetch Finish");
      // console.log("len", fighter.length);
      // console.log(fighterLength);
    } catch (error) {
      console.error(error);
    }
  };

  const match = async () => {
    console.log(tableID);

    const getRound = await fetch(`${IP}/api/getRound/${tableID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await getRound.json();
    console.log("get round", result);

    if (result == 0) {
      await fetch(`${IP}/api/createLeaderboard/${tableID}`);

      for (let index = 0; index < fighterLength; index++) {
        console.warn("round", index + 1);
        console.log("len", fighter.length);
        const randomIndex = Math.floor(Math.random() * fighter.length);
        console.log("Random", randomIndex);
        if (index % 2 == 0) {
          fighter1st.push(fighter[randomIndex].FighterID);
        } else {
          fighter2nd.push(fighter[randomIndex].FighterID);
        }
        fighter.splice(randomIndex, 1);
      }
      console.log(fighter.length);
      if (fighter1st.length > fighter2nd.length) {
        fighter2nd.push(0);
      }
      console.log("match finish");
    } else {
      // console.log("fetchh");
      const fetchboard = await fetch(`${IP}/api/getLeaderboard/${tableID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("board");
      console.log(tableID);
      const board = await fetchboard.json();
      const sortFighter = [...board].sort((a, b) => {
        if (a.TotalScore != b.TotalScore) {
          return b.TotalScore - a.TotalScore;
        }

        return Math.random() - 0.5;
      });

      // console.log("fighter", sortFighter);
      // console.log(fighter.length);
      if (sortFighter.length >= 12) {
        //match แบบไม่ซ้ำคู่
        console.log("match");
        try {
          let i = 1;
          while (sortFighter.length > 0) {
            console.log(i);
            console.warn("Fighter", sortFighter.length);
            if (sortFighter.length < 2) {
              fighter1st.push(fighter[0].FighterID);
              fighter2nd.push(0);
              break;
            }

            const currentFighter = sortFighter[0];
            let nextFighter = sortFighter[i];

            const fetchHistory = await fetch(`${IP}/api/getHistory`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                account: currentFighter.UserName,
                tableID: tableID,
              }),
            });

            const history = await fetchHistory.json();
            console.log(history);

            const hasFight = history.some((history) => {
              return (
                (history.firstName == currentFighter.UserName &&
                  history.secondName == nextFighter.UserName) ||
                (history.firstName == nextFighter.UserName &&
                  history.secondName == currentFighter.UserName)
              );
            });

            console.log("fight", hasFight);
            console.log("current", currentFighter.FighterID);
            console.log("next", nextFighter.FighterID);

            if (
              hasFight &&
              (sortFighter.length == 2 || sortFighter.length - 1 == i)
            ) {
              console.log("เหลือ");
              nextFighter = sortFighter[1];
              const prevFighter1st = fighter1st.pop();
              const prevFighter2nd = fighter2nd.pop();
              const lastRandom = [
                prevFighter1st,
                prevFighter2nd,
                currentFighter.FighterID,
                nextFighter.FighterID,
              ];

              let j = 4;
              for (let k = 0; k < 2; k++) {
                const matchResult = [];
                const random1 = Math.floor(Math.random() * j) + 1;
                matchResult.push(lastRandom[random1]);
                lastRandom.splice(random1, 1);
                console.log(lastRandom);
                j = lastRandom.length - 1;

                const random2 = Math.floor(Math.random() * j) + 1;
                if (lastRandom.length == 1) {
                  matchResult.push(lastRandom[0]);
                } else {
                  matchResult.push(lastRandom[random2]);
                  lastRandom.splice(random2, 1);
                  console.log(lastRandom);
                  j = lastRandom.length - 1;
                }

                fighter2nd.push(matchResult.pop());
                fighter1st.push(matchResult.pop());
              }
              sortFighter.splice(i - 1, 1);
              sortFighter.splice(0, 1);

              i = 1;
            } else if (hasFight && sortFighter.length != 2) {
              console.log("ปกติ");
              i++;
              continue;
            } else {
              fighter1st.push(currentFighter.FighterID);
              fighter2nd.push(nextFighter.FighterID);
              sortFighter.splice(0, 1);
              sortFighter.splice(i - 1, 1);
              i = 1;
              console.log("All", fighter);
            }
          }
          console.log(fighter1st);
          console.log(fighter2nd);
        } catch (error) {
          console.warn(error);
        }
      } else {
        //จับแบบซ้ำคู่ได้
        for (let index = 0; index < fighterLength; index++) {
          console.warn("Round:", index);
          console.log("ID", sortFighter[index].FighterID);
          if (index % 2 == 0) {
            fighter1st.push(sortFighter[index].FighterID);
          } else {
            fighter2nd.push(sortFighter[index].FighterID);
          }
        }
        if (fighter1st.length > fighter2nd.length) {
          fighter2nd.push(0);
        }
      }

      sortFighter.map((item) => [
        console.log( "ID:", item.FighterID ,"score:" ,item.TotalScore)
      ]);

      console.log(fighter1st);
      console.log(fighter2nd);
      console.log("match finish");
    }

    const insert = await fetch(`${IP}/api/insertTable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Fightertable: tableID,
        fighter1st: fighter1st,
        fighter2nd: fighter2nd,
      }),
    });

    const res = await insert.json();
    if (res.message == "failed") {
      Alert.alert("เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง");
    } else {
      Alert.alert("สร้างตารางสำเร็จ");
      console.log("1stround", res.round);
      const thisRound = res.round;
      setRound(thisRound);
    }
  };

  const getSchedule = async () => {
    try {
      const result = await fetch(`${IP}/api/getMatch/${tableID}/${round}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const fetchschedule = await result.json();
      console.log(fetchschedule);
      setSchedule(fetchschedule);
      console.log("schedule", schedule);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (fighterLength == 0) {
      fetchAllFighter();
    } else if (!isLoading == true) {
      match();
    }
    console.log(isLoading);
    console.log(fighterLength);
  }, [isLoading, fighterLength]);

  useEffect(() => {
    if (round !== 0) {
      console.log("round (updated in useEffect):", round);
      getSchedule();
    }
  }, [round]);

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
    }, [])
  );

  const from = page * itemPerPage;
  const to = Math.min((page + 1) * itemPerPage, fighterLength);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <View style={styles.icon}>
        <TouchableOpacity
          onPress={() => navigation.navigate("contestantsList", { tableID })}
        >
          <Users color={"#176b87"} width={35} height={35} />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.header}>ตารางการแข่งขัน</Text>
        <Text style={styles.round}>รอบที่ {round}</Text>
      </View>
      <ScrollView>
        {/*table header*/}
        <DataTable style={styles.table}>
          <DataTable.Header>
            <DataTable.Title style={styles.tableNameLeft}>
              ชื่อผู้เข้าแข่งขัน
            </DataTable.Title>
            <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableVS}>
              <Text style={styles.fontVS}>โต๊ะที่</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.tableNo}>No.</DataTable.Title>
            <DataTable.Title style={styles.tableNameRight}>
              ชื่อผู้เข้าแข่งขัน
            </DataTable.Title>
          </DataTable.Header>

          {/* table rows */}
          {schedule.slice(from, to).length > 0 &&
            schedule.slice(from, to).map((item, index) => {
              return (
                <DataTable.Row
                  key={item.MatchID}
                  style={index % 2 == 0 ? styles.cell1 : styles.cell0}
                >
                  <DataTable.Cell style={styles.tableNameLeft}>
                    {item.fighter1stName}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNo}>
                    {item.Fighter1st}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableVS}>
                    <Text style={styles.fontVS}>
                      {index + 1 + page * itemPerPage}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNo}>
                    {item.Fighter2nd == 0 && <Text></Text>}
                    {item.Fighter2nd != 0 && item.Fighter2nd}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.tableNameRight}>
                    {item.Fighter2nd == 0 && "ชนะบาย"}
                    {item.Fighter2nd != 0 && item.fighter2ndName}
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
      <View>
        <TouchableOpacity
          style={styles.submitScore}
          onPress={() => {
            navigation.navigate("SubmitScore", { tableID, round });
          }}
        >
          <Text style={styles.submitScoreText}>ลงคะแนน</Text>
        </TouchableOpacity>
      </View>
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
    marginHorizontal: 3,
    justifyContent: "center",
  },
  tableNameLeft: {
    minWidth: "25%",
    marginHorizontal: 3,
    justifyContent: "flex-end",
  },
  tableNameRight: {
    minWidth: "25%",
    marginHorizontal: 3,
    justifyContent: "flex-start",
  },
  tableVS: {
    minWidth: "15%",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e0e0e0",
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
  submitScore: {
    alignSelf: "flex-end",
    backgroundColor: "#176b87",
    padding: 10,
    borderRadius: 15,
    margin: 20,
    minWidth: 100,
  },
  submitScoreText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  cell1: {
    backgroundColor: "#ddd",
  },
  cell0: {
    backgroundColor: "#f4f7fa",
  },
});
