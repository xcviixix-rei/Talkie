import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  widthPercentageToDP,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { translate } from "../api/AI";

export default function TranslatedMessage({ text, from, to }) {
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(true);
  const [sourceLanguage, setSourceLanguage] = useState(from);
  const [targetLanguage, setTargetLanguage] = useState(to);

  // Update internal state when props change
  useEffect(() => {
    setSourceLanguage(from);
    setTargetLanguage(to);
  }, [from, to]);

  useEffect(() => {
    const getTranslation = async () => {
      try {
        setLoading(true);
        const result = await translate(text, sourceLanguage, targetLanguage);
        setTranslated(result.translatedText);
      } catch (error) {
        console.error("Translation error:", error);
        setTranslated("Translation failed");
      } finally {
        setLoading(false);
      }
    };

    if (text) {
      getTranslation();
    }
  }, [text, sourceLanguage, targetLanguage]);

  // Handle swap button press
  const handleSwap = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  return (
    <View style={styles.toolbarContainer}>
      <View style={styles.toolbar}>
        <View style={styles.languageInfo}>
          <Text style={styles.languageLabel}>{sourceLanguage}</Text>

          {/* Swap button */}
          <TouchableOpacity onPress={handleSwap} style={styles.swapButton}>
            <Text style={styles.swapIcon}>⇄</Text>
          </TouchableOpacity>

          <Text style={styles.languageLabel}>{targetLanguage}</Text>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Translating...</Text>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.translatedText}>{translated}</Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbarContainer: {
    position: "absolute",
    bottom: hp(-7.5),
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  toolbar: {
    width: widthPercentageToDP(100),
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    borderRadius: 8,
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    width: "100%",
    marginBottom: 4,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  arrow: {
    fontSize: 16,
    marginHorizontal: 8,
    color: "#666666",
  },
  swapButton: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  swapIcon: {
    fontSize: 18,
    color: "#007AFF",
  },
  loadingText: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
    textAlign: "center",
  },
  scrollView: {
    maxHeight: hp(30),
    width: "100%",
  },
  scrollContent: {
    paddingVertical: 4,
  },
  translatedText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 22,
  },
});
