import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import io from "socket.io-client";
import {
  Search,
  X,
  MapPin,
  LogOut,
  User,
  ArrowLeft,
  Plus,
} from "react-native-feather";
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
import * as Linking from "expo-linking";
import { Login } from "./screens/Login";
import { Register } from "./screens/Register";
import { Eventdetails } from "./screens/Eventdetails";
import { MyProfile, RePassword } from "./screens/myProfile";
import { CreateEvent } from "./screens/CreateEvent";
import { Editdetail } from "./screens/Editdetail";
import { Apply } from "./screens/Apply";
import { contestants } from "./screens/contestants";
import { AddFighter } from "./screens/AddFighter";
import { ContestantDetail } from "./screens/ContestantDetail";
import { Fighterlist } from "./screens/Fighterlist";
import { Table } from "./screens/Table";
import { History } from "./screens/History";
import { SubmitScore } from "./screens/SubmitScore";
import { contestantsList } from "./screens/contestantsList";
import { Leaderboard } from "./screens/Leaderboard";
import { Pairing } from "./screens/Pairing";
import { ForgetPass } from "./screens/ForgetPass";
import { Resetpassword } from "./screens/Resetpassword";

export const IP = "http://192.168.1.3:3000";

const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Home: 'Home',
      Resetpassword: "Resetpassword/:token",
    },
  },
};

const Home = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [isLoading, setIsloading] = useState(true);
  const [event, setEvent] = useState([]);
  const [isVisiblelogin, setIsvisiblelogin] = useState(true);
  const [isVisiblelogout, setIsvisiblelogout] = useState(false);
  const [modal, setModal] = useState(false);
  const [pMenu, setPmenu] = useState(styles.Menu);
  const [myMenu, setMymenu] = useState(styles.CMenu);
  const [cMenu, setCmenu] = useState(styles.CMenu);
  const [ismyMenu, setIsmyMenu] = useState(true);
  const [iscmenu, setIscmenu] = useState(true);
  const [isCreateEvent, setIsCreate] = useState(false);
  const [user, setUser] = useState();
  const [searchStyle, setSearchStyle] = useState(styles.Search);

  //verify token
  const verify = async () => {
    try {
      const token = await AsyncStorage.getItem("@accessToken");
      console.log(token);
      const vef = await fetch(IP + "/api/profile/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const passvef = await vef.json();
      console.log("vef", passvef);
      if (token === null) {
        setIsvisiblelogin(true);
        setIsvisiblelogout(false);
        AsyncStorage.removeItem("@accessToken");
        AsyncStorage.removeItem("@vef");
      } else if (passvef.message === "jwt expired") {
        setIsvisiblelogin(true);
        setIsvisiblelogout(false);
        AsyncStorage.removeItem("@accessToken");
        AsyncStorage.removeItem("@vef");
        Alert.alert("เซสชันหมดอายุ", "โปรดเข้าสู่ระบบใหม่อีกครั้ง");
      } else {
        setIsvisiblelogin(false);
        setIsvisiblelogout(true);
        setIsmyMenu(false);
        setIscmenu(false);
        setUser(passvef);
      }
      await AsyncStorage.setItem("@vef", passvef);
      return passvef;
    } catch (error) {
      console.log(error);
    }
  };

  //query event ออกมา
  const fetchEvent = async () => {
    console.log("start");
    try {
      const Efetch = await fetch(IP + "/api/events");
      const Edata = await Efetch.json();
      setIsloading(false);
      Edata.sort((a, b) => {
        if (a.Status < b.Status) {
          return -1;
        } else if (a.Status > b.Status) {
          return 1;
        } else {
          return 0;
        }
      });
      setEvent(Edata);
      const vef = await AsyncStorage.getItem("@vef");
      // console.log(event);
      verify();
      setSearch("");
    } catch (error) {
      console.error("Fetch Error (Catch):", error);
    }
  };

  const fetchCEvent = async () => {
    try {
      const vef = await AsyncStorage.getItem("@vef");
      console.log("vef", vef);
      const Cfetch = await fetch(IP + "/api/fetchcreateevent/" + vef, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const Cdata = await Cfetch.json();
      Cdata.sort((a, b) => {
        if (a.Status < b.Status) {
          return -1;
        } else if (a.Status > b.Status) {
          return 1;
        } else {
          return 0;
        }
      });
      if (Cdata.length > 0) {
        setIsCreate(false);
      } else {
        setIsCreate(true);
      }
      setEvent(Cdata);
      setIsloading(false);
      // console.log(Cdata);
    } catch (error) {}
  };

  const fetchMyEvent = async () => {
    try {
      const vef = await AsyncStorage.getItem("@vef");
      console.log("vef", vef);
      const myfetch = await fetch(IP + "/api/fetchmyevent/" + vef, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const mydata = await myfetch.json();
      mydata.sort((a, b) => {
        if (a.Status < b.Status) {
          return -1;
        } else if (a.Status > b.Status) {
          return 1;
        } else {
          return 0;
        }
      });
      // console.log(Cdata.length);
      setEvent(mydata);
      setIsloading(false);
      console.log(mydata);
    } catch (error) {}
  };

  const onSearch = async () => {
    try {
      // console.log(search);
      if (!search) {
        Alert.alert(null, "กรอกข้อมูลให้ครบถ้วน");
        return false;
      }
      console.log(search);
      if (pMenu === styles.Menu) {
        const event = await fetch(IP + "/api/search/" + search, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        // console.log(event);
        const result = await event.json();
        console.log(result);
        setEvent(result);
      } else if (cMenu === styles.Menu) {
        fetchCEvent();
      } else if (myMenu === styles.Menu) {
        const event = await fetch(`${IP}/api/Mysearch/${search}/${user}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        // console.log(event);
        const result = await event.json();
        console.log(result);
        setEvent(result);
      }
      setSearch("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleProfile = () => {
    const passvef = verify();
    if (isVisiblelogin) {
      navigation.navigate("Login");
    } else {
      console.log("passvef", passvef[0]);
      navigation.navigate("MyProfile", passvef);
    }
  };
  //สร้าง item ไว้แสดงกิจกรรม
  const Item = ({ EventID, UserName, EventName, Address }) => (
    <TouchableOpacity
      onPress={() => {
        // console.log(EventID);
        navigation.navigate("Eventdetails", EventID);
      }}
    >
      <View style={styles.item}>
        <Text style={styles.title}>{UserName}</Text>
        <Text style={styles.EventName}>{EventName}</Text>
        <View style={styles.Address}>
          <MapPin size={0.1} opacity={0.25} />
          <Text style={styles.Addresstext}>{Address}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const setP = () => {
    setPmenu(styles.Menu);
    setMymenu(styles.CMenu);
    setCmenu(styles.CMenu);
    setIsCreate(false);
    setSearchStyle(styles.Search);
  };
  const setMy = () => {
    setPmenu(styles.CMenu);
    setMymenu(styles.Menu);
    setCmenu(styles.CMenu);
    setIsCreate(false);
    setSearchStyle(styles.Search);
  };
  const setC = () => {
    setPmenu(styles.CMenu);
    setMymenu(styles.CMenu);
    setCmenu(styles.Menu);
    setSearchStyle(styles.DisabledSearch);
  };

  useEffect(() => {
    if (pMenu === styles.Menu) {
      fetchEvent();
    } else if (cMenu === styles.Menu) {
      fetchCEvent();
    } else if (myMenu === styles.Menu) {
      fetchMyEvent();
    }
  }, [isLoading]);

  //refresh หน้าเมื่ออัพเดตข้อมูล
  useEffect(() => {
    const socket = io(IP);

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("refreshing", (refresh) => {
      console.log("Received real-time event update:", refresh);
      setIsloading(refresh);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err.message);
      console.error("Error description:", err.description); // อาจมีข้อมูลเพิ่มเติม
      console.error("Error context:", err.context); // อาจมีข้อมูลเพิ่มเติม
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* แท็บบนสุด */}
      <View style={styles.TopTab}>
        {/* log in */}
        {/* <Button title="Open Deep Link" onPress={() => navigation.navigate("Resetpassword",{event})} /> */}
        <TouchableOpacity onPress={handleProfile}>
          {isVisiblelogin ? (
            <Text style={styles.RightTab}>เข้าสู่ระบบ</Text>
          ) : (
            <View style={{ flexDirection: "row-reverse" }}>
              <User color={"white"} marginRight={15} />
              <Text style={styles.RightTab}>{user}</Text>
            </View>
          )}
        </TouchableOpacity>
        {/*log out*/}
        {isVisiblelogout && (
          <TouchableOpacity
            onPress={() => {
              setModal(!modal);
            }}
          >
            <LogOut marginLeft={15} color={"white"} />
          </TouchableOpacity>
        )}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modal}
          onRequestClose={() => {
            setModal(!modal);
          }}
        >
          <View style={styles.centered}>
            <View style={styles.logoutModal}>
              <Text style={styles.modaltext}>ออกจากระบบ ?</Text>
              <View style={styles.modalmenu}>
                <Pressable
                  onPress={() => {
                    setModal(!modal);
                    // console.log("pressห")
                  }}
                >
                  <Text style={styles.modalbut}>ยกเลิก</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    AsyncStorage.removeItem("@accessToken");
                    setIsloading(true);
                    setModal(!modal);
                    navigation.navigate("Login");
                    // console.log("pressห")
                  }}
                >
                  <Text style={styles.modalbut}>ตกลง</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* แท็บเมนู */}
      <View style={styles.MenuTab}>
        <TouchableOpacity
          onPress={() => {
            setP();
            fetchEvent();
          }}
        >
          <Text style={pMenu}>กิจกรรมทั่วไป</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setMy();
            fetchMyEvent();
          }}
          disabled={ismyMenu}
        >
          <Text style={myMenu}>กิจกรรมของฉัน</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setC();
            fetchCEvent();
            if (!event) {
              setIsCreate(true);
            }
          }}
          disabled={iscmenu}
        >
          <Text style={cMenu}>กิจกรรมที่สร้าง</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.Content}>
        {/* แท็บค้นหา */}
        {cMenu === styles}
        <View style={searchStyle}>
          <TextInput
            style={styles.input}
            placeholder="ค้นหากิจกรรม"
            value={search}
            onChangeText={setSearch}
            editable={cMenu === styles.CMenu}
          />
          <Pressable onPress={onSearch}>
            <Search justifyContent="center" margin={5} />
          </Pressable>
        </View>
        {/* แท็บกิจกรรม */}
        <View style={styles.Event}>
          {event.length > 0 ? (
            <FlatList
              data={event}
              renderItem={({ item }) => (
                <Item
                  EventID={item.EventID}
                  UserName={item.UserName}
                  EventName={item.EventName}
                  Address={item.Address}
                />
              )}
              keyExtractor={(item) => item.EventID}
              refreshing={isLoading}
              onRefresh={() => setIsloading(true)}
            />
          ) : (
            <View>
              <Text
                style={{ color: "#626366", textAlign: "center", fontSize: 16 }}
              >
                ไม่พบกิจกรรม
              </Text>
              <Pressable
                onPress={() => {
                  setIsloading(true);
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#1163ED",
                    textDecorationLine: "underline",
                    textAlign: "center",
                  }}
                >
                  รีเฟรช
                </Text>
              </Pressable>
            </View>
          )}
        </View>
        {isCreateEvent && (
          <TouchableOpacity
            onPress={() => {
              // console.log("press")
              navigation.navigate("CreateEvent");
            }}
            style={{ position: "absolute", right: 30, bottom: 50 }}
          >
            <Plus
              height={60}
              width={60}
              color={"#fff"}
              strokeWidth={2}
              style={{
                backgroundColor: "#86B6F6",
                borderRadius: 50,
                padding: 10,
              }}
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const App = () => {  
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerTitle: "",
            headerLeft: () => {
              const navigation = useNavigation();
              return (
                <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                  <X margin={10} color="#176B87" />
                </TouchableOpacity>
              );
            },
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="Regis"
          component={Register}
          options={{
            headerTitle: "",
            headerBackVisible: false,
            headerLeft: () => {
              const navigation = useNavigation();
              return (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <X margin={10} color="#176B87" />
                </TouchableOpacity>
              );
            },
          }}
        />
        <Stack.Screen
          name="Eventdetails"
          component={Eventdetails}
          options={({ navigation }) => ({
            headerTitle: "",
            headerLeft: () => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Home");
                  }}
                >
                  <ArrowLeft />
                </TouchableOpacity>
              );
            },
          })}
        />
        <Stack.Screen
          name="MyProfile"
          component={MyProfile}
          options={{
            headerTitle: "",
            headerBackVisible: false,
            headerLeft: () => {
              const navigation = useNavigation();
              return (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "ละทิ้งการเปลี่ยนแปลง",
                      "หากยืนยัน การเปลี่ยนแปลงนี้จะหายไป",
                      [
                        {
                          text: "ยืนยัน",
                          style: "default",
                          onPress: () => {
                            navigation.goBack();
                          },
                        },
                        {
                          text: "ยกเลิก",
                          style: "cancel",
                        },
                      ]
                    )
                  }
                >
                  <X size={5} />
                </TouchableOpacity>
              );
            },
          }}
        />
        <Stack.Screen
          name="RePassword"
          component={RePassword}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="CreateEvent"
          component={CreateEvent}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="Editdetail"
          component={Editdetail}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="Apply"
          component={Apply}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="contestants"
          component={contestants}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddFighter"
          component={AddFighter}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="ContestantDetail"
          component={ContestantDetail}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="Fighterlist"
          component={Fighterlist}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="History"
          component={History}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="Table"
          component={Table}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SubmitScore"
          component={SubmitScore}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="contestantsList"
          component={contestantsList}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={Leaderboard}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="Pairing"
          component={Pairing}
          options={{ headerTitle: "" }}
        />
        <Stack.Screen
          name="ForgetPass"
          component={ForgetPass}
          options={({ navigation }) => ({
            headerTitle: "",
            headerLeft: () => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                  }}
                >
                  <X />
                </TouchableOpacity>
              );
            },
          })}
        />
        <Stack.Screen
          name="Resetpassword"
          component={Resetpassword}
          options={{ headerTitle: "" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    backgroundColor: "#F7FAFF",
    justifyContent: "center",
  },
  TopTab: {
    flex: 0.1,
    flexDirection: "row-reverse",
    backgroundColor: "#86B6F6",
    justifyContent: "space-between",
    alignItems: "center",
  },
  RightTab: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
    paddingRight: 15,
    color: "white",
  },
  MenuTab: {
    flex: 0.1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 10,
  },
  Menu: {
    fontSize: 10,
    fontWeight: "bold",
    color: "black",
    margin: 10,
    backgroundColor: "#86B6F6",
    padding: 10,
    borderRadius: 5,
    borderColor: "#176B87",
    borderWidth: 1,
  },
  CMenu: {
    fontSize: 10,
    fontWeight: "bold",
    color: "black",
    backgroundColor: "#D3D9E3",
    margin: 10,
    padding: 10,
    borderRadius: 5,
    borderColor: "#176B87",
    borderWidth: 1,
  },
  Content: {
    flex: 0.8,
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 10,
    marginLeft: 13,
    marginRight: 13,
  },
  input: {
    flex: 0.97,
    height: 40,
    paddingLeft: 10,
  },
  Search: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: "#D3D9E3",
    backgroundColor: "#fff",
    borderRadius: 25,
    flexDirection: "row",
  },
  DisabledSearch: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: "#D3D9E3",
    backgroundColor: "#E8E9EB",
    borderRadius: 25,
    flexDirection: "row",
  },
  Event: {
    flex: 1,
    borderRadius: 10,
    margin: 13,
    justifyContent: "center",
  },
  item: {
    backgroundColor: "#EEF5FF",
    borderColor: "#86B6F6",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    opacity: 0.6,
  },
  EventName: {
    fontWeight: "bold",
    fontSize: 20,
  },
  Address: {
    flexDirection: "row",
    marginTop: 3,
  },
  Addresstext: {
    fontSize: 10,
    paddingLeft: 5,
    alignSelf: "center",
  },
  logoutModal: {
    width: 250,
    height: 250,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modaltext: {
    fontSize: 20,
    fontWeight: "black",
    margin: 30,
  },
  modalmenu: {
    fontSize: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalbut: {
    margin: 10,
    backgroundColor: "#176B87",
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 10,
    color: "white",
  },
  create: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
});

export default App;
