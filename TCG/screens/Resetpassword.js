import * as Linking from "expo-linking";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, useNavigation,useRoute } from "@react-navigation/native";
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
} from "react-native"

export const Resetpassword = ({navigation}) => {
    const route = useRoute();
    const token = route.params?.token;
    console.log("reset");
  return (
    <View>
      <Text>Resetpassword</Text>
    </View>
  )
}

const styles = StyleSheet.create({})