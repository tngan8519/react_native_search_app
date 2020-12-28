import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Header() {
  return (
    <View>
      <Text style={styles.header}>Search Colleges/Universities</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 32,
    color: "#f97068",
    textAlign: "center",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 20,
  },
});
