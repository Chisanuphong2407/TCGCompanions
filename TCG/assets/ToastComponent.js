import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { IP } from "../App";
import { useNavigation } from "@react-navigation/native";
import { SocketContext } from "../App";

export const ToastComponent = () => {
  const socket = useContext(SocketContext);
  const navigation = useNavigation();
  useEffect(() => {
    if (socket) {
      socket.on("matched", (table) => {
        checkContestants(navigation, table);
        console.log("Matched");
      });

      socket.on("Deleted", async (username, table) => {
        const user = await AsyncStorage.getItem("@vef");

        if (user.trim() == username.trim()) {
          const eventID = await fetch(`${IP}/api/getEventID/${table}`, {
            method: "GET",
          });

          const ID = await eventID.json();

          deleteNoti(navigation, ID);
        }
      });

      return () => {
        socket.off("matched");
      };
    }
  }, [socket, navigation]);
};

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

export const deleteNoti = async (navigation, ID) => {
  const eventName = await fetch(`${IP}/api/edetails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      EventID: ID,
    }),
  });
  const name = await eventName.json();

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  playSound();
  Toast.show({
    position: "top",
    type: "info",
    text1: "รายชื่อของคุณถูกลบจาก",
    text2: `${name[0].EventName}`,
    duration: 10000,
    onPress: () => {
      navigation.navigate("Eventdetails", ID);
      Toast.hide();
    },
  });
};

export const newMatchNoti = (navigation, table) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  console.log(table);
  playSound();
  Toast.show({
    position: "top",
    type: "success",
    text1: "ตารางการแข่งขันมาแล้ว",
    text2: "ตรวจสอบตารางการแข่งขันใหม่ได้เลย",
    duration: 10000,
    onPress: () => {
      navigation.navigate("Pairing", { tableID: table });
      Toast.hide();
    },
  });
};

export const checkContestants = async (navigation, table) => {
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
      newMatchNoti(navigation, table);
    }
  } catch (error) {
    console.error("fetch failed", error);
  }
};
