import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Keyboard,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import listMajor from "../listMajor";
import axios from "axios";

export default function Content() {
  const rootURL =
    "https://api.data.gov/ed/collegescorecard/v1/schools.json?fields=id,school.name,school.state,location.lat,location.lon,2018.cost.tuition,2018.academics.program_percentage";
  const API_KEY = "YOUR_API_KEY";

  const [data, setData] = useState([]);
  const [start, setStart] = useState(false);
  const [search, setSearch] = useState({ zipcode: "", major: "", cost: 50000 });

  const handleChangeZip = (text) => {
    if (+text || text === "") {
      setSearch({ ...search, zipcode: text });
      setStart(false);
    }
  };
  const handleChangeCost = (text) => {
    setStart(false);
    setSearch({ ...search, cost: +text });
  };
  const handleChangeMajor = (text) => {
    setStart(false);
    setSearch({ ...search, major: text });
  };
  const handleSubmit = () => {
    Keyboard.dismiss();
    setStart(true);
    searchUniversities(search.zipcode, search.major, search.cost);
  };

  const searchUniversities = async (zipcode, major, cost) => {
    if ((zipcode === "") & (major === "")) {
      await axios(`${rootURL}&api_key=${API_KEY}`)
        .then((response) => {
          let found = response.data.results;
          let result = [];
          for (let i = 0; i < found.length; i++) {
            if (found[i]["2018.cost.tuition.in_state"] <= cost) {
              result.push(found[i]);
            }
          }
          setData(result);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (zipcode & !major) {
      await axios(`${rootURL}&zip=${zipcode}&distance=10mi&api_key=${API_KEY}`)
        .then((response) => {
          let found = response.data.results;
          let result = [];
          for (let i = 0; i < found.length; i++) {
            if (found[i]["2018.cost.tuition.in_state"] <= cost) {
              result.push(found[i]);
            }
          }
          setData(result);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (!zipcode & major) {
      await axios(`${rootURL}&api_key=${API_KEY}`)
        .then((response) => {
          let result = createResult(response, major, cost);
          setData(result);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      await axios(`${rootURL}&zip=${zipcode}&distance=10mi&api_key=${API_KEY}`)
        .then((response) => {
          let result = createResult(response, major, cost);
          setData(result);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const createResult = (response, major, cost) => {
    let found = response.data.results;
    let result = [];
    for (let i = 0; i < found.length; i++) {
      for (let key in found[i]) {
        if (
          key === `2018.academics.program_percentage.${major}` &&
          found[i][key] > 0 &&
          found[i]["2018.cost.tuition.in_state"] <= cost
        ) {
          result.push(found[i]);
        }
      }
    }
    return result;
  };

  const renderItem = ({ item }) => (
    <ScrollView>
      <Text> {item["school.name"]}</Text>
      <Text>State: {item["school.state"]}</Text>
      <Text>
        Tuition-in-state:
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(item["2018.cost.tuition.in_state"])}
      </Text>
    </ScrollView>
  );

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.label}>Zip code</Text>
        <TextInput
          style={styles.zip}
          onChangeText={(text) => handleChangeZip(text)}
          value={search.zipcode}
          placeholder="zipcode"
          maxLength={5}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Major</Text>
        <Picker
          selectedValue={search.major}
          onValueChange={(itemValue, itemIndex) => handleChangeMajor(itemValue)}
        >
          <Picker.Item label="---select major---" value="" />
          {listMajor.map((major, index) => (
            <Picker.Item key={index} label={major} value={major} />
          ))}
        </Picker>
        <Text style={styles.label}>Cost</Text>
        <View style={styles.slideContainer}>
          <Slider
            style={styles.slide}
            minimumValue={0}
            maximumValue={100000}
            minimumTrackTintColor="black"
            maximumTrackTintColor="red"
            value={search.cost}
            onValueChange={(text) => handleChangeCost(text)}
          />
        </View>
        <Text style={styles.detail}>
          {search.cost > 0 &&
            search.cost < 100000 &&
            "less than" +
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(search.cost)}
        </Text>
        <Button
          onPress={handleSubmit}
          title="Submit"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />

        {start && (
          <View>
            <Text>
              {data.length > 0
                ? `Universities found for zip code ${search.zipcode}, major ${
                    search.major !== "" ? search.major : "not select"
                  } and tutition ${search.cost}:`
                : `No university found for zip code ${search.zipcode}, major ${
                    search.major !== "" ? search.major : "not select"
                  } and tutition ${search.cost}`}
            </Text>

            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item["school.name"]}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  label: {
    color: "blue",
    marginVertical: 10,
  },
  zip: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
  },
  slideContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  slide: {
    width: 250,
    height: 40,
  },
  detail: {
    textAlign: "center",
  },
});
