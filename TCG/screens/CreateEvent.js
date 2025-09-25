import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
import { IP } from "../App";
import DateTimePicker from "@react-native-community/datetimepicker";

export const CreateEvent = ({ navigation }) => {
  const [Ename, setEname] = useState("");
  const [condition, setCondition] = useState("");
  const [time, setTime] = useState();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [moredetail, setMoredetail] = useState("");
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [selectText, setSelectText] = useState("เลือกวันปิดรับสมัคร");
  const [date, setDate] = useState(new Date());

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  const setFirstdate = () => {
    const firstformat = minDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit", // หรือ "numeric", "short"
      day: "2-digit",
    });
    const [firstmonth, firstday, firstyear] = firstformat.split("/");
    setSendtext(`${firstyear}-${firstmonth}-${firstday}`);
  }
  //onchange handle
  const onChange = (event, selectDate) => {
    console.log("re rendered");
    const currentDate = selectDate || date;
    setDate(currentDate);

    const format = currentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit", // หรือ "numeric", "short"
      day: "2-digit",
    });
    const [month, day, year] = format.split("/");
    setSelectText(`${day}-${month}-${year}`);
    setShowDatepicker(false);
  };

  const showDatepick = () => {
    setShowDatepicker(true);
  };

  const alertcreate = () => {
    Alert.alert(
      "ยืนยันการสร้าง",
      "หลังยืนยัน ท่านยังสามารถแก้ไขกิจกรรมได้ภายหลัง",
      [
        {
          text: "ยกเลิก",
          style: "cancel",
        },
        {
          text: "ยืนยัน",
          onPress: handleCreate,
        },
      ]
    );
  };

  const handleCreate = async () => {
    try {
      if (!Ename || !condition || !time || !amount || !address) {
        Alert.alert("สร้างไม่สำเร็จ", "กรอกข้อมูลให้ครบถ้วน");
        return false;
      }
      const username = await AsyncStorage.getItem("@vef");
      // console.log(username);
      const submitevent = await fetch(IP + "/api/createevent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Username: username,
          eventname: Ename,
          condition: condition,
          time: time,
          amount: amount,
          address: address,
          closedate: date,
          moredetail: moredetail,
        }),
      });
      const result = await submitevent.json();
      if (result[0].affectedRows === 1) {
        Alert.alert(
          "สร้างสำเร็จ",
          "สามารถแก้ไขรายละเอียดได้ที่ กิจกรรมที่ฉันสร้าง > เลือกกิจกรรมที่ต้องการ",
          [
            {
              text: "Ok",
              onPress: () => {
                navigation.navigate("Home");
              },
            },
          ]
        );
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  useEffect(() => {
    setFirstdate();
  })
  return (
    <View style={styles.background}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <ScrollView>
        <View style={{ margin: 20, marginTop: 0 }}>
          <Text style={styles.header}>สร้างกิจกรรม</Text>
          <View>
            <Text style={styles.topic}><Text style={styles.mustHave}>* </Text>ชื่อกิจกรรม :</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="ตั้งชื่อกิจกรรมของท่าน"
              value={Ename}
              onChangeText={setEname}
            />
          </View>
          <View>
            <Text style={styles.topic}><Text style={styles.mustHave}>* </Text>เงื่อนไขการแข่งขัน :</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="เช่น แข่งเดี่ยว เป็นต้น"
              value={condition}
              onChangeText={setCondition}
            />
          </View>
          <View>
            <Text style={styles.topic}>กติกาการแข่งขัน :</Text>
            <Text style={styles.inputBoxswiss}>swiss</Text>
          </View>
          <View>
            <Text style={styles.topic}>
              <Text style={styles.mustHave}>* </Text>เวลาในการแข่งขันแต่ละรอบ{" (นาที)"} :
            </Text>
            <TextInput
              style={styles.inputBoxTime}
              placeholder="เวลา"
              value={time}
              onChangeText={setTime}
              keyboardType="numeric"
            />
          </View>
          <View>
            <Text style={styles.topic}><Text style={styles.mustHave}>* </Text>จำนวนที่เปิดรับ{" (คน,ทีม)"} :</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="จำนวนที่เปิดรับ"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          <View>
            <Text style={styles.topic}><Text style={styles.mustHave}>* </Text>สถานที่จัด :</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="สถานที่จัดกิจกรรมของท่าน"
              value={address}
              onChangeText={setAddress}
            />
          </View>
          <View>
            <Text style={styles.topic}>รายละเอียดอื่นๆ :</Text>
            <TextInput
              style={styles.inputBoxDetail}
              placeholder="รายละเอียดอื่นๆ (ไม่จำเป็น)"
              multiline={true}
              value={moredetail}
              onChangeText={setMoredetail}
            />
          </View>
          <View>
            <Text style={styles.topic}><Text style={styles.mustHave}>* </Text>วันปิดรับสมัคร :</Text>
            <TouchableOpacity onPress={showDatepick}>
              <TextInput
                style={styles.inputBox}
                value={selectText}
                placeholder="เลือกวันปิดรับสมัคร"
                editable={false}
              />
            </TouchableOpacity>
            {showDatepicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date} // ค่าเริ่มต้น
                mode="date" //'date', 'time', หรือ 'datetime'
                display="spinner" // 'default', 'spinner', 'calendar', 'clock'
                onChange={onChange}
                minimumDate={minDate}
              />
            )}
          </View>
        </View>
        <TouchableOpacity onPress={alertcreate}>
          <Text style={styles.submit}>สร้างกิจกรรม</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
    left: -300,
    bottom: -100,
    opacity: 0.3,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#86B6F6",
    backgroundColor: "#E1E7EF",
    minHeight: 45,
    paddingLeft: 10,
    marginBottom: 20,
    fontSize: 15,
  },
  inputBoxDetail: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#86B6F6",
    backgroundColor: "#E1E7EF",
    minHeight: 100,
    paddingLeft: 10,
    marginBottom: 20,
    textAlignVertical: "top",
    fontSize: 15,
  },
  inputBoxTime: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#86B6F6",
    backgroundColor: "#E1E7EF",
    paddingLeft: 10,
    minHeight: 45,
    marginBottom: 20,
    maxWidth: 70,
    minWidth: 60,
    textAlignVertical: "center",
    fontSize: 15,
  },
  inputBoxswiss: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#86B6F6",
    backgroundColor: "#CED1D7",
    minHeight: 45,
    textAlignVertical: "center",
    paddingLeft: 10,
    marginBottom: 20,
    fontSize: 15,
  },
  topic: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
  },
  submit: {
    backgroundColor: "#176B87",
    color: "white",
    borderRadius: 30,
    padding: 15,
    marginBottom: 10,
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  mustHave: {
    color:'red',
    fontWeight:'300'
  }
});
