import { Platform, PermissionsAndroid, Alert } from "react-native";
import * as Location from "expo-location"; // Using Expo's location API for compatibility

class LocationService {
  constructor() {
    this.watchId = null;
    this.lastKnownLocation = null;
    this.listeners = [];
    this.isPermissionRequested = false;
  }

  /**
   * Request location permissions based on platform
   * @returns {Promise<boolean>} - Whether permission was granted
   */
  async requestPermissions() {
    try {
      if (this.isPermissionRequested) {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status === "granted";
      }

      this.isPermissionRequested = true;
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Allow location access to share your location in messages",
          [{ text: "OK" }]
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error requesting location permission:", err);
      return false;
    }
  }

  /**
   * Get current location one time
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Location data
   */
  async getCurrentLocation(options = {}) {
    try {
      const hasPermission = await this.requestPermissions();

      if (!hasPermission) {
        throw new Error("Location permission not granted");
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      };

      const location = await Location.getCurrentPositionAsync({
        ...defaultOptions,
        ...options,
      });

      this.lastKnownLocation = this.formatLocationData(location);
      return this.lastKnownLocation;
    } catch (error) {
      console.error("Error getting current location:", error);
      throw error;
    }
  }

  /**
   * Start watching location updates
   * @param {Function} callback - Function to call with location updates
   * @param {Object} options - Configuration options
   * @returns {Promise<number>} - Watch ID to use when stopping updates
   */
  async startLocationUpdates(callback, options = {}) {
    try {
      const hasPermission = await this.requestPermissions();

      if (!hasPermission) {
        callback(null, new Error("Location permission not granted"));
        return null;
      }

      // Clear any existing watch
      this.stopLocationUpdates();

      const defaultOptions = {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      };

      this.watchId = await Location.watchPositionAsync(
        { ...defaultOptions, ...options },
        (location) => {
          this.lastKnownLocation = this.formatLocationData(location);
          callback(this.lastKnownLocation, null);

          // Notify all listeners
          this.notifyListeners(this.lastKnownLocation);
        }
      );

      return this.watchId;
    } catch (error) {
      console.error("Error starting location updates:", error);
      callback(null, error);
      return null;
    }
  }

  /**
   * Stop watching location updates
   */
  stopLocationUpdates() {
    if (this.watchId !== null) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  /**
   * Format raw position data into a cleaner object
   * @param {Object} position - Raw position data from Location API
   * @returns {Object} - Formatted location data
   */
  formatLocationData(position) {
    if (!position || !position.coords) return null;

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    };
  }

  /**
   * Get the last known location without requesting an update
   * @returns {Object|null} - Last known location or null
   */
  getLastKnownLocation() {
    return this.lastKnownLocation;
  }

  /**
   * Add a listener for location updates
   * @param {Function} listener - Function to call with location updates
   * @returns {Function} - Function to remove the listener
   */
  addLocationListener(listener) {
    this.listeners.push(listener);

    // Return a function to remove this listener
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of a location update
   * @param {Object} location - The new location data
   */
  notifyListeners(location) {
    this.listeners.forEach((listener) => {
      try {
        listener(location);
      } catch (err) {
        console.error("Error in location listener:", err);
      }
    });
  }

  /**
   * Send location to a server
   * @param {Object} location - Location data to send
   * @param {string} endpoint - Server endpoint URL
   * @returns {Promise<Response>} - Fetch API response
   */
  async sendLocationToServer(location = null, endpoint) {
    const locationData = location || this.lastKnownLocation;

    if (!locationData) {
      throw new Error("No location data available to send");
    }

    if (!endpoint) {
      throw new Error("Server endpoint is required");
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: locationData,
          timestamp: new Date().toISOString(),
          deviceInfo: {
            platform: Platform.OS,
            version: Platform.Version,
          },
        }),
      });

      return response;
    } catch (error) {
      console.error("Error sending location to server:", error);
      throw error;
    }
  }

  /**
   * Calculate distance between two coordinates in kilometers
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} - Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} deg - Degrees
   * @returns {number} - Radians
   */
  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

// Create and export a singleton instance
const locationService = new LocationService();
export default locationService;
