import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";

const ImageViewer = ({ imageUrls }) => {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      setError("No image URLs provided");
      setLoading(false);
      return;
    }

    // Process the input URLs
    const processedImages = imageUrls.map((item, index) => {
      return {
        id: String(index),
        url: item.url || item,
        count: item.count || null,
      };
    });

    setImages(processedImages);
    setLoading(false);
  }, [imageUrls]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Wrap around to the last image
      setCurrentIndex(images.length - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Wrap around to the first image
      setCurrentIndex(0);
    }
  };

  // For grid view
  const renderGridItem = ({ item, index }) => {
    const screenWidth = Dimensions.get("window").width;
    const itemWidth = screenWidth / 3 - 10; // 3 columns

    return (
      <TouchableOpacity
        style={[styles.gridImageContainer, { width: itemWidth }]}
        onPress={() => setCurrentIndex(index)}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.gridImage}
          resizeMode="cover"
          onError={() => console.log(`Error loading image: ${item.url}`)}
        />
        {item.count !== null && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{item.count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (images.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No images to display</Text>
      </View>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <View style={styles.container}>
      {/* Main image display */}
      <View style={styles.imageViewerContainer}>
        <Image
          source={{ uri: currentImage.url }}
          style={styles.mainImage}
          resizeMode="contain"
        />

        {currentImage.count !== null && (
          <View style={styles.mainCountBadge}>
            <Text style={styles.countText}>{currentImage.count}</Text>
          </View>
        )}

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToPrevious}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.pageIndicator}>
            {currentIndex + 1} / {images.length}
          </Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNext}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Thumbnail grid for quick navigation */}
      <View style={styles.gridContainer}>
        <Text style={styles.gridTitle}>All Images</Text>
        <FlatList
          data={images}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridList}
          horizontal={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  imageViewerContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  mainCountBadge: {
    position: "absolute",
    bottom: 70,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navigationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  navButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  pageIndicator: {
    color: "white",
    fontSize: 16,
  },
  gridContainer: {
    flex: 1,
    padding: 10,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 5,
  },
  gridList: {
    paddingBottom: 10,
  },
  gridImageContainer: {
    margin: 5,
    borderRadius: 8,
    overflow: "hidden",
    aspectRatio: 1,
    backgroundColor: "#e0e0e0",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  countBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default ImageViewer;
