import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, BackHandler } from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigationContainer,
  useNavigation,
  useFocusEffect,
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
import { X } from "react-native-feather";
import { IP } from "../App";

export const Leaderboard = ({ navigation, route }) => {
  const tableID = route.params.tableID;
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const itemPerPage = 5;
  const [page, setPage] = useState(0);
  const [Totalpage, setTotalpage] = useState(0);
  const [round, setRound] = useState(0);
  const [owner, setOwner] = useState("");
  const [account, setAccount] = useState("");
  const [isFinish, setIsfinish] = useState(false);
  const [myRank, setMyrank] = useState();
  const [myscore, setMyscore] = useState();
  const [otherRank, setOtherrank] = useState();
  const [otherscore, setOtherscore] = useState();
  const [search, setSearch] = useState("");
  const [searchresult, setSearchresult] = useState();
  let buttonComponent = null;
  const countdownTimer = useRef(null);
  const [searched, setSearched] = useState(false);

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
      result.sort((a, b) => {
        if (a.TotalScore != b.TotalScore) {
          return b.TotalScore - a.TotalScore;
        } else {
          return b.solkolf_score - a.solkolf_score;
        }
      });
      setLeaderboard(result);
      setTotalpage(Math.ceil(leaderboard.length / itemPerPage));
      setIsloading(false);
    } catch (error) {
      Alert.prompt("failed");
    }
  };

  const getRound = async () => {
    try {
      const fetchRound = await fetch(`${IP}/api/getRound/${tableID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resultRound = await fetchRound.json();
      setRound(resultRound);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "แสดงตารางคะแนนไม่สำเร็จ");
    }
  };

  const eventFinish = async () => {
    try {
      const finishEvent = await fetch(`${IP}/api/EventFinish/${tableID}`, {
        method: "PUT",
      });
      const finishResult = await finishEvent.json();
      if (finishResult.message == "success") {
        const fetchEventID = await fetch(`${IP}/api/getEventID/${tableID}`, {
          method: "GET",
        });
        const eventID = await fetchEventID.json();
        console.log(eventID);
        Alert.alert(
          "ดำเนินการเสร็จสิ้น",
          "ท่านยังสามารถดูตารางคะแนนได้หลังการแข่งขันเสร็จสิ้น",
          [
            {
              text: "ตกลง",
              onPress: () => navigation.navigate("Eventdetails", eventID),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด");
    }
  };

  const getOwner = async () => {
    try {
      const eventID = await fetch(`${IP}/api/getEventID/${tableID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resultID = await eventID.json();

      const eventDet = await fetch(`${IP}/api/edetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          EventID: resultID,
        }),
      });
      const resultEvent = await eventDet.json();

      if (resultEvent[0].Status == 3) {
        setIsfinish(true);
      } else {
        setIsfinish(false);
      }

      setOwner(resultEvent[0].UserName);

      setAccount(await AsyncStorage.getItem("@vef"));
    } catch (error) {
      setIsloading(!isLoading);
    }
  };

  const handlesearch = (text) => {
    console.log("Countdown");
    setSearch(text);
    clearTimeout(countdownTimer.current);
    countdownTimer.current = setTimeout(() => {
      console.log("time's up");
      rankSearch(text);
    }, 1500);
  };

  const rankSearch = (text) => {
    console.log(text);
    const otherindex = leaderboard.findIndex(
      (user) => user.UserName.trim() == text.trim()
    );

    if (otherindex != -1) {
      const otherPoint = leaderboard[otherindex].TotalScore;
      setSearchresult(leaderboard[otherindex].UserName);
      setOtherrank(otherindex + 1);
      setOtherscore(otherPoint);
    } else {
      setSearched(true);
      console.log("not found");
    }
  };

  console.log("round", round);
  // console.log(round != 5);
  // console.log(owner.trim() == account.trim() && !isFinish);

  if (owner.trim() == account.trim() && !isFinish) {
    if (round < 5) {
      buttonComponent = (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() =>
            navigation.navigate("Table", {
              tableID: leaderboard[0].Fightertable,
            })
          }
        >
          <Text style={styles.nextText}>สร้างตารางรอบถัดไป</Text>
        </TouchableOpacity>
      );
    } else if (round == 5) {
      buttonComponent = (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            Alert.alert(
              "ยืนยันการจบการแข่งขัน",
              "ท่านจะไม่สามารถแก้ไขข้อมูลใดๆ ได้อีกหลังยืนยัน",
              [
                {
                  text: "ตกลง",
                  onPress: eventFinish,
                },
                {
                  text: "ยกเลิก",
                },
              ]
            );
          }}
        >
          <Text style={styles.nextText}>เสร็จสิ้นการแข่งขัน</Text>
        </TouchableOpacity>
      );
    }
  }

  const ranking = () => {
    if (owner.trim() != account.trim() && round != 0) {
      const rankindex = leaderboard.findIndex(
        (user) => user.UserName.trim() == account.trim()
      );
      const point = leaderboard[rankindex].TotalScore;
      setMyscore(point);
      setMyrank(rankindex + 1);
    }
  };

  useEffect(() => {
    getLeaderboard();
    getRound();
    getOwner();
  }, [isLoading]);

  useEffect(() => {
    ranking();
  }, [account]);

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
  const to = Math.min((page + 1) * itemPerPage, leaderboard.length);

  // console.log("account", account);
  // console.log(owner);
  // console.log(owner.trim() == account.trim());
  return (
    <View style={styles.container}>
      <TouchableOpacity
      style={styles.X}
        onPress={async () => {
          const EventID = await fetch(`${IP}/api/getEventID/${tableID}`, {
            method: "GET",
          });
          const ID = await EventID.json();
          navigation.navigate("Eventdetails", ID);
        }}
      >
        <X />
      </TouchableOpacity>
      <Text style={styles.header}>ตารางคะแนน</Text>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />

      {round < 1 ? (
        <ScrollView>
          <Text style={styles.noContent}>ยังไม่มีตารางคะแนนในขณะนี้</Text>
        </ScrollView>
      ) : (
        <ScrollView>
          <View style={styles.ranking}>
            <Text style={styles.rankingText}>รอบปัจจุบัน : {round}</Text>
          </View>
          {/*table header*/}
          <DataTable style={styles.table}>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title style={styles.tableNo}>อันดับ</DataTable.Title>
              {/* {feature.map((title,index) => (
              <DataTable.Title key={index} style={index == 4 ? styles.cell0 : styles.cell1}>{title.name}</DataTable.Title>
            ))} */}
              <DataTable.Title style={styles.tableName}>
                ผู้เข้าแข่งขัน
              </DataTable.Title>
              <DataTable.Title style={styles.tableNation}>
                เนชั่น
              </DataTable.Title>
              {round == 5 && (
                <DataTable.Title style={styles.tableSolkolf}>
                  solkolf
                </DataTable.Title>
              )}
              <DataTable.Title style={styles.tableScore}>
                <Text style={styles.scoreText}>คะแนนรวม</Text>
              </DataTable.Title>
            </DataTable.Header>

            {/* table rows */}
            {leaderboard.slice(from, to).length > 0 &&
              leaderboard.slice(from, to).map((item, index) => {
                return (
                  <DataTable.Row
                    key={item.FighterID}
                    style={index % 2 == 0 ? styles.cell1 : styles.cell0}
                  >
                    <DataTable.Cell style={styles.tableNo}>
                      {index + 1 + page * itemPerPage}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableName}>
                      {item.UserName}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.tableNation}>
                      {item.Nation}
                    </DataTable.Cell>
                    {round == 5 && (
                      <DataTable.Cell style={styles.tableSolkolf}>
                        {item.solkolf_score}
                      </DataTable.Cell>
                    )}
                    <DataTable.Cell style={styles.tableScore}>
                      <Text style={styles.scoreText}>{item.TotalScore}</Text>
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
          {owner.trim() != account.trim() && (
            <View style={styles.ranking}>
              <Text style={styles.rankingText}>
                คุณอยู่อันดับที่ : {myRank}
              </Text>
              <Text style={styles.rankingText}>คะแนนรวม : {myscore}</Text>
            </View>
          )}
          <View style={styles.searchbox}>
            <TextInput
              style={styles.search}
              placeholder="กรอกชื่อเพื่อค้นหาข้อมูลคะแนนผู้เข้าแข่งขัน"
              value={search}
              onChangeText={handlesearch}
            />
          </View>
          <View style={styles.ranking}>
            {searched && <Text>ไม่พบผู้เข้าแข่งขัน</Text>}
            <View>
              <Text style={styles.rankingText}>
                {searchresult} อยู่อันดับที่ : {otherRank}
              </Text>
              <Text style={styles.rankingText}>คะแนนรวม : {otherscore}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {buttonComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    justifyContent: "center",
    marginTop: 30,
  },
  header: {
    fontSize: 30,
    // marginTop: 10,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 10,
  },
  bgIMG: {
    position: "absolute",
    width: 600,
    height: 600,
    right: -200,
    bottom: -200,
    opacity: 0.3,
  },
  table: {
    flex: 1,
    minWidth: "65%",
    maxWidth: "90%",
    borderWidth: 1,
    borderColor: "#d3d0d0",
    backgroundColor: "#f4f7fa",
    opacity: 0.8,
    borderRadius: 3,
    alignSelf: "center",
  },
  tableHeader: {
    backgroundColor: "#c9e2fa",
  },
  tableNo: {
    minWidth: "11%",
    maxWidth: "15%",
    justifyContent: "center",
  },
  tableName: {
    minWidth: "20%",
    maxWidth: "35%",
    justifyContent: "flex-start",
    paddingLeft: 5,
    marginHorizontal: 1,
  },
  tableNation: {
    minWidth: "20%",
    maxWidth: "40%",
    justifyContent: "flex-start",
    paddingLeft: 10,
    marginHorizontal: 1,
  },
  tableScore: {
    minWidth: "15%",
    maxWidth: "23%",
    justifyContent: "center",
    marginHorizontal: 1,
    // backgroundColor: '#b3b2b2'
  },
  tableSolkolf: {
    minWidth: "10%",
    maxWidth: "15%",
    justifyContent: "center",
    marginHorizontal: 1,
    // backgroundColor: "#ddd"
  },
  cell1: {
    backgroundColor: "#ddd",
  },
  cell0: {
    backgroundColor: "#f4f7fa",
  },
  nextButton: {
    alignSelf: "flex-end",
    backgroundColor: "#176b87",
    padding: 10,
    borderRadius: 15,
    margin: 20,
    marginBottom: 30,
    minWidth: 100,
  },
  nextText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  scoreText: {
    fontWeight: "bold",
  },
  noContent: {
    fontSize: 20,
    alignSelf: "center",
    opacity: 0.6,
  },
  ranking: {
    paddingLeft: 20,
    marginVertical: 10,
  },
  rankingText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  menubut: {
    maxWidth: 30,
    maxHeight: 30,
    minWidth: 25,
    minHeight: 25,
    marginHorizontal: 3,
    marginBottom: 5,
  },
  searchbox: {
    backgroundColor: "#ddd",
    margin: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  search: {
    flex: 1,
  },
  X: {
    margin: 15,
    width:20,
    color: "#176b87"
  }
});
