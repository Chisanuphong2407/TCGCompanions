import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View ,ScrollView} from "react-native";
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
  Eye,
  EyeOff,
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

export const MyProfile = ({ navigation, route }) => {
  const [isLoading, setIsloading] = useState(true);
  // const [profile, setProfile] = useState([]);
  const [fname, setfName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const getprofile = async () => {
    try {
      const name = await route.params;
      // console.log("name", name);
      const fetchPro = await fetch(IP + "/api/getprofile/" + name, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await fetchPro.json();
      // setProfile(result);
      setEmail(result[0].Email);
      setfName(result[0].FirstName);
      setLastname(result[0].LastName);
      setPhone(result[0].PhoneNumber);
      setUser(result[0].UserName);
      setId(result[0].UserID);
      setPassword(result[0].Password);
      console.log("det", result[0].Password);
      setIsloading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async () => {
    if (!user || !email || !fname || !phone || !lastname) {
      Alert.alert("ไม่สำเร็จ", "กรุณากรอกข้อมูลให้ครบถ้วน", [
        {
          text: "ตกลง",
        },
      ]);
      return;
    } else {
      try {
        console.log("start");
        const response = await fetch(IP + "/api/updateprofile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fname,
            lastname: lastname,
            email: email,
            phone: phone,
            user: user,
            id: id,
            password: password,
          }),
        });
        console.log("request");

        if (!response.ok) {
          // ถ้าไม่สำเร็จ ให้อ่าน response เป็น text เพื่อดูข้อความผิดพลาดจากเซิร์ฟเวอร์
          const errorText = await response.text();
          console.error("Server error response text:", errorText);
          Alert.alert(
            "แก้ไขไม่สำเร็จ",
            "username หรือ email นี้มีผู้ใช้งานแล้ว"
          );
          return; // หยุดการทำงานต่อ
        }
        if (response.ok) {
          const token = await response.json();
          console.log(token);
          Alert.alert(
            "สำเร็จ",
            "แก้ไขเสร็จสิ้น",
            [
              {
                text: "ตกลง",
              },
            ],
            await AsyncStorage.setItem("@accessToken", token),
            navigation.navigate("Home")
          );
          console.log("update successful:", token);
        } else {
          Alert.alert(
            "แก้ไขไม่สำเร็จ",
            "username หรือ email นี้มีผู้ใช้งานแล้ว"
          );
        }
      } catch (error) {
        Alert.alert("Error", "There was a network error.");
        console.error("update error:", error);
      }
    }
  };

  const handlePassword = () => {
    navigation.navigate("RePassword", id);
  };

  useEffect(() => {
    getprofile();
  }, [isLoading]);

  // console.log(name);
  return (
    <ScrollView style={styles.Edit}>
      <Text style={styles.RegisHeader}>แก้ไขข้อมูลส่วนตัว</Text>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>username:</Text>
        <TextInput
          style={styles.RGInput}
          placeholder="username"
          value={user}
          onChangeText={setUser}
        />
      </View>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>ชื่อ:</Text>
        <TextInput
          style={styles.RGInput}
          placeholder="ชื่อ"
          value={fname}
          onChangeText={setfName}
        />
      </View>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>นามสกุล:</Text>
        <TextInput
          style={styles.RGInput}
          placeholder="นามสกุล"
          value={lastname}
          onChangeText={setLastname}
        />
      </View>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>อีเมล์:</Text>
        <TextInput
          style={styles.RGInput}
          placeholder="อีเมล์"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>โทรศัพท์:</Text>
        <TextInput
          style={styles.RGInput}
          placeholder="โทรศัพท์"
          value={phone}
          onChangeText={setPhone}
        />
      </View>
      <View>
        <View>
          <TouchableOpacity onPress={handleEdit}>
            <Text style={styles.RGText}>แก้ไขข้อมูล</Text>
          </TouchableOpacity>
        </View>
        <Pressable onPress={handlePassword}>
          <Text style={styles.rePassword}>แก้ไขรหัสผ่าน</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export const RePassword = ({ navigation, route }) => {
  const [OPassword, setOpassword] = useState("");
  const [Oeye, setOeye] = useState(true);
  const [NewPassword, setNewpassword] = useState("");
  const [Neye, setNeye] = useState(true);
  const [Vpassword, setVpassword] = useState("");
  const [Veye, setVeye] = useState(true);

  const id = route.params;
  // console.log(OPassword);

  const changePassword = async () => {
    if (!OPassword || !NewPassword || !Vpassword) {
      Alert.alert("", "โปรดกรอกข้อมูลให้ครบถ้วน");
    } else if (NewPassword !== Vpassword) {
      Alert.alert("เปลี่ยนรหัสผ่านไม่สำเร็จ", "โปรดยืนยันรหัสผ่านใหม่");
    } else {
      try {
        console.log(OPassword);
        console.log(NewPassword);
        console.log(Vpassword);
        const changePass = await fetch(IP + "/api/changepass", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Npass: NewPassword,
            Opass: OPassword,
            id: id,
          }),
        });
        const result = await changePass.json();
        if (result.message === "ท่านกรอกรหัสผ่านเดิม") {
          Alert.alert("เปลี่ยนรหัสผ่านไม่สำเร็จ", result.message);
        } else if (result.message === "รหัสผ่านเดิมไม่ถูกต้อง") {
          Alert.alert("เปลี่ยนรหัสผ่านไม่สำเร็จ", result.message);
        } else {
          Alert.alert("เปลี่ยนรหัสผ่านสำเร็จ", navigation.navigate("Home"));
        }
        console.log(result.message);
      } catch (error) {}
    }
  };

  const setOsecure = () => {
    setOeye(!Oeye);
  };
  const setNsecure = () => {
    setNeye(!Neye);
  };
  const setVsecure = () => {
    setVeye(!Veye);
  };
  return (
    <View style={styles.Edit}>
      <Text style={styles.RegisHeader}>เปลี่ยนรหัสผ่าน</Text>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
        <Text style={styles.inputText}>รหัสผ่านเดิม</Text>
      <View style={styles.border}>
        <TextInput
          style={styles.passwordInput}
          placeholder="กรอกรหัสผ่านเดิม"
          value={OPassword}
          onChangeText={setOpassword}
          secureTextEntry={Oeye}
        />
        {Oeye ? (
          <Eye
            Size={5}
            marginTop={30}
            alignItem={"strech"}
            onPress={setOsecure}
          />
        ) : (
          <EyeOff
            Size={5}
            marginTop={30}
            alignItem={"strech"}
            onPress={setOsecure}
          />
        )}
      </View>
      <Text style={styles.inputText}>รหัสผ่านใหม่</Text>
      <View style={styles.border}>
        <TextInput
          style={styles.passwordInput}
          placeholder="กรอกรหัสผ่านใหม่"
          value={NewPassword}
          onChangeText={setNewpassword}
          secureTextEntry={Neye}
        />
        {Neye ? (
          <Eye
            Size={5}
            marginTop={30}
            alignItem={"strech"}
            onPress={setNsecure}
          />
        ) : (
          <EyeOff
            Size={5}
            marginTop={30}
            alignItem={"strech"}
            onPress={setNsecure}
          />
        )}
      </View>
      <Text style={styles.inputText}>ยืนยันรหัสผ่านใหม่</Text>
      <View style={styles.border}>
        <TextInput
          style={styles.passwordInput}
          placeholder="ยืนยันรหัสผ่านใหม่"
          value={Vpassword}
          onChangeText={setVpassword}
          secureTextEntry={Veye}
        />
        {Veye ? (
          <Eye
            Size={5}
            marginTop={30}
            alignItem={"strech"}
            onPress={setVsecure}
          />
        ) : (
          <EyeOff
            Size={5}
            marginTop={30}
            alignItem={"strech"}
            onPress={setVsecure}
          />
        )}
      </View>

      <View>
        <TouchableOpacity onPress={changePassword}>
          <Text style={styles.RGText}>เปลี่ยนรหัสผ่าน</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Edit: {
    flex: 1,
    backgroundColor: "#EEF5FF",
  },
  bgIMG: {
    position: "absolute",
    width: 600,
    height: 600,
    left: -300,
    bottom: -100,
    opacity: 0.3,
  },
  RegisHeader: {
    fontSize: 30,
    marginTop: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 20,
  },
  RGInput: {
    marginLeft: 30,
    fontSize: 20,
    marginRight: 20,
    borderBottomColor: "#176B87",
    borderBottomWidth: 1,
  },
  inputBox: {
    marginVertical: 5,
  },
  inputText: {
    marginLeft: 20,
    marginTop:15,
    fontSize: 16,
    color: "#176B87",
    fontWeight:'600'
  },
  RGText: {
    backgroundColor: "#176B87",
    color: "white",
    borderRadius: 30,
    padding: 15,
    marginTop: 20,
    alignSelf: "center",
    fontSize: 20,
  },
  rePassword: {
    alignSelf: "center",
    color: "gray",
    marginTop: 20,
    textDecorationLine: "underline",
    fontSize: 15,
  },
  passwordInput: {
    flex: 0.9,
    marginLeft: 20,
    fontSize: 20,
    // marginTop: 20,
    marginRight: 20,
    paddingBottom: 10,
    borderBottomColor: "#176B87",
    borderBottomWidth: 1,
  },
  border: {
    flexDirection: "row",
    marginBottom: 15
  },
});
