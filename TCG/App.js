import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Search, X, MapPin, LogOut, User } from "react-native-feather";
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
import { Login } from "./screens/Login";
import { Register } from "./screens/Register";
import { Eventdetails } from "./screens/Eventdetails";

export const IP = "http://192.168.1.8:3000";

const Home = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [isLoading, setIsloading] = useState(true);
  const [event, setEvent] = useState([]);
  const [isVisiblelogin, setIsvisiblelogin] = useState(true);

  //verify token
  const verify = async () => {
    try {
      const token = await AsyncStorage.getItem('@accessToken');
      console.log(token);
      const vef = await fetch(IP + "/api/profile/", {
        method: "GET",
        headers: {
          'Authorization' : `Bearer ${token}`
        }
      });
      if (token !== undefined ){
        setIsvisiblelogin(!isVisiblelogin);
      }
      console.log(vef.status);
    } catch (error) {
      console.log (error);
    }
  };

  //query event ออกมา
  const fetchEvent = async () => {
    console.log("start");
    try {
      const Efetch = await fetch(IP + "/api/events");
      const Edata = await Efetch.json();
      setIsloading(false);
      setEvent(Edata);
      // console.log(event);
      verify();
    } catch (error) {
      console.error("Fetch Error (Catch):", error);
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
          <MapPin size={0.1} />
          <Text style={styles.Addresstext}>{Address}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchEvent();
  }, [isLoading]);

  return (
    <SafeAreaView style={styles.container}>
      {/* แท็บบนสุด */}
      <View style={styles.TopTab}>
        {/*log out*/}
        <TouchableOpacity 
        onPress={() => {
          // <Modal></Modal>
          // AsyncStorage.removeItem('@accessToken');
          // setIsloading(true);
        }}
        >
          <LogOut marginLeft={15} size={15} color={'white'} />
        </TouchableOpacity>
        {/* log in */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Login");
          }}
        >
          {isVisiblelogin ? 
          <Text style={styles.RightTab}>เข้าสู่ระบบ</Text> 
          : 
          <User color={'white'} marginRight={15} size={15} />
          }
        </TouchableOpacity>
      </View>

      {/* แท็บเมนู */}
      <View style={styles.MenuTab}>
        <TouchableOpacity>
          <Text style={styles.Menu}>กิจกรรมทั่วไป</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.Content}>
        {/* แท็บค้นหา */}
        <View style={styles.Search}>
          <TextInput
            style={styles.input}
            placeholder="ค้นหากิจกรรม"
            value={search}
            onChangeText={setSearch}
          />
          <Search size={5} justifyContent="center" margin={5} />
        </View>
        {/* แท็บกิจกรรม */}
        <View style={styles.Event}>
          {/* <Text>test</Text> */}
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
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
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
          }}
        />
        <Stack.Screen
          name="Regis"
          component={Register}
          options={{
            headerTitle: "",
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
    alignItems: "Top",
    justifyContent: "Top",
  },
  TopTab: {
    flex: 0.1,
    flexDirection: 'row',
    backgroundColor: "#86B6F6",
    justifyContent: "space-between",
    alignItems: 'center'
  },
  RightTab: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "right",
    paddingRight: 15,
    color: "white",
  },
  MenuTab: {
    flex: 0.1,
    flexDirection: "row",
    justifyContent: "center",
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
});

export default App;
