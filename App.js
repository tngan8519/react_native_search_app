import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "react-native";
import Header from "./components/Header";
import Content from "./components/Content";

export default function App() {
  return (
    <View>
      <Header />
      <Content />
    </View>
  );
}
