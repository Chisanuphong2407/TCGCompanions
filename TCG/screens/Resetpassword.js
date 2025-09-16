import * as Linking from "expo-linking";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigationContainer,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
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
  Lock,
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

export const Resetpassword = ({ navigation }) => {
  const route = useRoute();
  const token = route.params.token;
  const [email, setEmail] = useState();
  const [isSecure1, setIssecure1] = useState(true);
  const [isSecure2, setIssecure2] = useState(true);
  const [newPassword, setNewpassword] = useState("");
  const [newPasswordConfirm, setNewpasswordConfirm] = useState("");

  console.log("reset");
  console.log(token);

  const verify = async () => {
    const vef = await fetch(IP + "/api/getEmail/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const passvef = await vef.json();
    if (passvef.message == "jwt expired") {
      Alert.alert("ลิ้งก์หมดอายุ", "กรุณาลองอีกครั้ง");
      navigation.navigate("Home");
    } else {
      setEmail(passvef);
      console.log("vef", passvef);
    }
  };

  const resetpassword = async () => {
    if (newPassword == newPasswordConfirm) {
      try {
        const reset = await fetch(`${IP}/api/resetPassword`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newpass: newPassword,
            email: email,
          }),
        });
        const result = await reset.json();
        if (result == "success") {
          navigation.navigate("Home");
          Alert.alert(
            "รีเซ็ตรหัสผ่านสำเร็จ",
            "ท่านสามารถล็อกอินได้ด้วยรหัสผ่านใหม่ได้แล้ว"
          );
        } else {
          Alert.alert("ดำเนินการไม่สำเร็จ", "โปรดลองอีกครั้ง");
        }
      } catch (error) {
        console.log(error);
        Alert.alert(
          "ดำเนินการไม่สำเร็จ",
          // "โปรดลองอีกครั้ง"
          JSON.stringify(error)
        );
      }
    } else {
      Alert.alert("ยืนยันรหัสผ่านไม่สำเร็จ", "โปรดกรอกรหัสผ่านใหม่");
    }
  };

  useEffect(() => {
    verify();
    console.log(email);
  }, [token]);

  return (
    <View style={styles.resetScreen}>
      <Text style={styles.header}>ตั้งรหัสผ่านใหม่</Text>
      <View style={styles.box}>
      <Text style={styles.inputHeader}>รหัสผ่านใหม่</Text>
        <View style={styles.inputbox}>
          <Lock margin={10} />
          <TextInput
            value={newPassword}
            onChangeText={setNewpassword}
            style={styles.input}
            placeholder="กรอกรหัสผ่านใหม่"
            secureTextEntry={isSecure1}
          />
          {isSecure1 ? (
            <Eye
              alignSelf={"center"}
              onPress={() => setIssecure1(!isSecure1)}
            />
          ) : (
            <EyeOff
              alignSelf={"center"}
              onPress={() => setIssecure1(!isSecure1)}
            />
          )}
        </View>
        <Text style={styles.inputHeader}>ยืนยันรหัสผ่านใหม่</Text>
        <View style={styles.inputbox}>
          <Lock margin={10} />
          <TextInput
            value={newPasswordConfirm}
            onChangeText={setNewpasswordConfirm}
            style={styles.input}
            placeholder="ยืนยันรหัสผ่านใหม่"
            secureTextEntry={isSecure2}
          />
          {isSecure2 ? (
            <Eye
              alignSelf={"center"}
              onPress={() => setIssecure2(!isSecure2)}
            />
          ) : (
            <EyeOff
              alignSelf={"center"}
              onPress={() => setIssecure2(!isSecure2)}
            />
          )}
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={resetpassword}>
          <Text style={styles.resetButtontext}>ตั้งรหัสผ่านใหม่</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  resetScreen: {
    flex: 1,
    backgroundColor: "#EEF5FF",
    padding: 20,
    paddingTop: 30,
  },
  header: {
    fontSize: 30,
    marginTop: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 50,
  },
  inputbox: {
    flexDirection: "row",
    backgroundColor: "#e7e6e6",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 50,
  },
  input: {
    minWidth: "75%",
  },
  box: {
    flex: 0.8,
    justifyContent: "center",
  },
  resetButtontext: {
    backgroundColor: "#176B87",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 20,
    padding: 10,
    textAlign: "center",
    fontSize: 16,
  },
  resetButton: {
    minWidth: "20%",
    alignSelf: "center",
  },
  inputHeader: {
    marginBottom: 10,
    fontSize: 15
  }
});
