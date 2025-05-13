import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { fetchTheme } from "../../../api/theme";
import { editTheme } from "../../../api/conversation";

const ThemeSelection = () => {
  const navigation = useNavigation();
  const [selectedTheme, setSelectedTheme] = useState();
  const { rawItem } = useLocalSearchParams();
  const conversationId = JSON.parse(rawItem).id;
  const [themeData, setThemeData] = useState();

  // Load current theme on component mount
  const loadTheme = async () => {
    const tmpTheme = await fetchTheme();
    setThemeData(tmpTheme.reverse());
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const handleThemeSelect = (themeName) => {
    setSelectedTheme(themeName);

    Alert.alert(
      "Theme Selected",
      `You have chosen the ${themeName.replace(/-/g, " ")} theme`,
      [
        {
          text: "OK",
          onPress: () => {
            // Save the selected theme
            //saveSelectedTheme(themeName, conversationId);
            // Navigate back to conversation
            editTheme(conversationId, themeName);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const saveSelectedTheme = (themeName, conversationId) => {
    // Implement actual theme saving logic
    console.log(
      `Theme ${themeName} selected for conversation ${conversationId}`
    );
    // This would typically update a state store or make an API call
  };

  const renderThemeItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.themeItem]}
      onPress={() => handleThemeSelect(item.theme_name)}
    >
      {item.url ? (
        <Image
          source={{ uri: item.url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnail, { backgroundColor: item.ui_color }]} />
      )}
      <Text style={styles.themeName} numberOfLines={1}>
        {item.theme_name.replace(/-/g, " ")}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={themeData}
        renderItem={renderThemeItem}
        keyExtractor={(item) => item.theme_name}
        numColumns={3}
        contentContainerStyle={styles.themeGrid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  themeGrid: {
    padding: 12,
  },
  themeItem: {
    flex: 1 / 3,
    aspectRatio: 0.75,
    margin: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "85%",
    borderRadius: 8,
  },
  themeName: {
    color: "#000",
    textAlign: "center",
    marginTop: 6,
    fontSize: 12,
  },
});

export default ThemeSelection;
