import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View  } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User, Lock ,Eye,EyeOff} from "react-native-feather";
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

export const Apply = ({navigation,route}) => {
    const EventID = route.params.ID;
    const Eventname = route.params.Eventname;
  return (
    <View>
      <Text>{EventID}</Text>
      <Text>{Eventname}</Text>
    </View>
  )
}

const styles = StyleSheet.create({})