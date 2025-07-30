import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User, Lock, Eye, EyeOff } from "react-native-feather";
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
import { RadioButton } from "react-native-paper";
import { IP } from "../App";

export const Apply = ({ navigation, route }) => {
  const EventID = route.params.EventID;
  const Eventname = route.params.eventName;
  const table = route.params.table;
  const username = route.params.account;
  const [selectNation, setSelectnation] = useState();
  const [architype, setArchitype] = useState();

  const handleRadiobutton = (value) => {
    setSelectnation(value);

    switch (value) {
      case "Dragon Empire":
        console.log("Dragon Empire selected");
        break;
      case "Dark State":
        console.log("Dark State selected");
        break;
      case "Stoicheia":
        console.log("Stoicheia selected");
        break;
      case "Brandt Gate":
        console.log("Brandt Gate selected");
        break;
      case "Keter Sanctuary":
        console.log("Keter Sanctuary selected");
        break;
      case "Lyrical Monasterio":
        console.log("Lyrical Monasterio selected");
        break;
    }
  };

  const submit = () => {
    if (!architype || !selectNation) {
      Alert.alert("สมัครไม่สำเร็จ", "กรุณากรอกข้อมูลให้ครบถ้วน");
    } else {
      Alert.alert(
        "ยืนยันการสมัคร",
        "หากยืนยัน ท่านจะไม่สามารถแก้ไขรายละเอียดได้อีก",
        [
          {
            text: "ยกเลิก",
            style: "cancel",
          },
          {
            text: "ยืนยัน",
            style: "default",
            onPress: handleSubmit,
          },
        ]
      );
    }
  };

  const handleSubmit = async () => {
    const result = await fetch(IP + "/api/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        EventID: EventID,
        table: table,
        nation: selectNation,
        architype: architype,
        username: username,
      }),
    });

    const res = await result.json();

    if (res.message === "สมัครสำเร็จ") {
      Alert.alert(
        "สมัครสำเร็จ",
        "ท่านสามารถตรวจสอบตารางการแข่งขันได้ที่ กิจกรรมของฉัน > กิจกรรมที่ท่านสมัคร > ตารางการแข่งขัน",
        [
          {
            text: "ตกลง",
            onPress: () => {
              navigation.navigate("Eventdetails", EventID);
            },
          },
        ]
      );
    }else{
      Alert.alert("สมัครไม่สำเร็จ",String(res));
    }

    console.log(architype, " ", selectNation);
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <View>
        <Text style={styles.header}>{Eventname}</Text>
        <Text style={styles.topic}>เนชั่นที่ใช้ในการแข่งขัน:</Text>
        <RadioButton.Group
          onValueChange={handleRadiobutton}
          value={selectNation}
        >
          <TouchableOpacity
            onPress={() => handleRadiobutton("Dragon Empire")}
            style={styles.radiobut}
          >
            <RadioButton value="Dragon Empire" />
            <Text style={styles.radiotext}>Dragon Empire</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRadiobutton("Dark State")}
            style={styles.radiobut}
          >
            <RadioButton value="Dark State" />
            <Text style={styles.radiotext}>Dark State</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRadiobutton("Stoicheia")}
            style={styles.radiobut}
          >
            <RadioButton value="Stoicheia" />
            <Text style={styles.radiotext}>Stoicheia</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRadiobutton("Brandt Gate")}
            style={styles.radiobut}
          >
            <RadioButton value="Brandt Gate" />
            <Text style={styles.radiotext}>Brandt Gate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRadiobutton("Keter Sanctuary")}
            style={styles.radiobut}
          >
            <RadioButton value="Keter Sanctuary" />
            <Text style={styles.radiotext}>Keter Sanctuary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRadiobutton("Lyrical Monasterio")}
            style={styles.radiobut}
          >
            <RadioButton value="Lyrical Monasterio" />
            <Text style={styles.radiotext}>Lyrical Monasterio</Text>
          </TouchableOpacity>
        </RadioButton.Group>
        <View>
          <Text style={styles.topic}>สายที่ใช้ในการแข่งขัน</Text>
          <TextInput
            placeholder="กรอกข้อมูลของท่าน"
            value={architype}
            onChangeText={setArchitype}
            style={styles.input}
          />
        </View>
      </View>
      <TouchableOpacity onPress={submit} style={styles.submit}>
        <Text style={{ color: "white", alignSelf: "center" }}>สมัคร</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    padding: 20,
  },
  background: {
    flex: 1,
    backgroundColor: "#EEF5FF",
  },
  header: {
    fontSize: 30,
    marginTop: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 30,
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
    marginTop: 20,
    fontWeight: "bold",
    marginBottom: 30,
    fontSize: 30,
  },
  topic: {
    fontSize: 20,
    marginBottom: 5,
    marginTop: 20,
  },
  radiobut: {
    flexDirection: "row",
  },
  radiotext: {
    fontSize: 16,
    alignSelf: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#176B87",
  },
  submit: {
    marginVertical: 40,
    fontSize: 18,
    backgroundColor: "#176B87",
    alignSelf: "center",
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
  },
});
