import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
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
} from "react-native";
import { Mail } from "react-native-feather";
import { IP } from "../App";

export const ForgetPass = ({ navigation }) => {
  const [email, setEmail] = useState("");
  return (
    <SafeAreaView style={styles.forgetScreen}>
      <Text style={styles.header}>ลืมรหัสผ่าน</Text>
      <View style={styles.box}>
        <View style={styles.inputbox}>
          <Mail margin={10} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            //   style={styles.Emailinput}
            placeholder="Email"
          />
        </View>
        <TouchableOpacity style={styles.send}>
          <Text style={styles.sendText}>ส่งรหัส</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  forgetScreen: {
    flex: 1,
    backgroundColor: "#EEF5FF",
    padding: 20,
    paddingTop: 30,
  },
  inputbox: {
    flexDirection: "row",
    backgroundColor: "#e7e6e6",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 30
  },
  box: {
    flex:0.8,
    justifyContent: "center",
  },
  header: {
    fontSize: 30,
    marginTop: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#176B87",
    marginBottom: 50,
  },
  send: {
    alignItems: "center",
    marginTop:30
  },
  sendText: {
    fontSize: 18,
    color: 'white',
    backgroundColor: "#176B87",
    padding: 12,
    paddingHorizontal: 30,
    borderRadius: 30
  }
});
