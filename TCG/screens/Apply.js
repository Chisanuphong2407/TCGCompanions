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
import { IP } from "../App";

export const apply = ({ navigation, route }) => {
  const EventID = route.params.ID;
  const Eventname = route.params.eventName;
  console.log(EventID);
  return (
    <View style={styles.container}>
      <Image source={require("../assets/img/bg.png")} style={styles.bgIMG} />
      <View>
        <Text>{Eventname}</Text>
      </View>
      <Text>{EventID}</Text>
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
    right: -300,
    bottom: -100,
    opacity: 0.3,
  },
});
