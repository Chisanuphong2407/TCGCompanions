import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer ,useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Search , X,} from "react-native-feather";
import {
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { Login } from "./screens/Login";
import { Register } from "./screens/Register";

const Home = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [isLoading,setIsloading] = useState(true);
  const [event,setEvent] = useState({});

  const fetchEvent = async () => {
    console.log('start')
    try {
     const allEvent = await fetch('http://192.168.1.8:3000/api/events');
     console.log("fetch - Status:", allEvent.status); // Log HTTP Status Code

     if (!allEvent.ok) {
       console.error("Fetch Error:", allEvent.status, allEvent.statusText);
       // จัดการ Error ตามต้องการ เช่น แสดงข้อความผิดพลาดให้ผู้ใช้
       return;
     }

     console.log("Parsing JSON...");
     const event = await allEvent.json();
     console.log("Event Data:", event);
     // setIsloading(false);
   } catch (error) {
     console.error("Fetch Error (Catch):", error);
     // จัดการ Error ที่เกิดจากการ Fetch หรือการ Parse JSON
   }
  };
  

  useEffect(() => {
    fetchEvent()
  },[isLoading])

  return (
    <SafeAreaView style={styles.container}>
      {/* แท็บบนสุด */}
      <View style={styles.TopTab}>
        <TouchableOpacity onPress={() => { navigation.navigate('Login')} }>
          <Text style={styles.RightTab} >เข้าสู่ระบบ</Text>
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

          </View>
      </View>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" >
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={Login} options={
          { headerTitle:'',
            headerLeft: () => {
              const navigation = useNavigation();
              return (
              <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                <X margin={10} color='#176B87' />
              </TouchableOpacity>
            );
            }
          }
        } />
         <Stack.Screen name="Regis" component={Register} options={
          { headerTitle:'',
            headerLeft: () => {
              const navigation = useNavigation();
              return (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <X margin={10} color='#176B87' />
              </TouchableOpacity>
            );
            }
          }
        } />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    backgroundColor: "#EEF5FF",
    alignItems: "Top",
    justifyContent: "Top",
  },
  TopTab: {
    flex: 0.1,
    backgroundColor: "#86B6F6",
    justifyContent: "center",
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
    backgroundColor: "#D3D9E3",
    borderRadius: 10,
    margin:13,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
