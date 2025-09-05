import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { IP } from "../App";
import { useNavigation } from "@react-navigation/native";

export const playSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/sound/notification.mp3")
    );
    await sound.playAsync();
  } catch (error) {
    console.log("Caon't play sound!!", error);
  }
};

export const deleteNoti = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  playSound();
  Toast.show({
    position: "top",
    type: "info",
    text1: "รายชื่อของคุณถูกลบ",
    text2: "รายชื่อของคุณถูกลบจาก....",
    duration: 5000,
  });
};

export const newMatchNoti = (navigation,table) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  console.log(table);
  playSound();
  Toast.show({
    position: "top",
    type: "success",
    text1: "ตารางการแข่งขันมาแล้ว",
    text2: "ตรวจสอบตารางการแข่งขันใหม่ได้เลย",
    duration: 5000,
    onPress: () => {
        navigation.navigate("Pairing", { tableID: table })
        Toast.hide();
    },
  });
};

export const checkContestants = async (navigation,table) => {
  console.log("Check");
  const user = await AsyncStorage.getItem("@vef");
  try {
    const contestants = await fetch(`${IP}/api/contestants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fightertable: table,
        username: user,
      }),
    });

    const result = await contestants.json();
    if (result.message == "สมัครแล้ว") {
      newMatchNoti(navigation,table);
    }
  } catch (error) {
    console.error("fetch failed", error);
  }
};
