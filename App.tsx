import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";

const targetRegion = {
  latitude: 35.62784471732802,
  longitude: 139.72293269718367,
  radius: 100,
};

const App = () => {
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (location) {
      checkIfWithinRegion(location);
    }
  }, [location]);

  async function registerForPushNotificationsAsync() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Push notifications permission was denied");
      return;
    }
  }

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "位置情報へのアクセス許可",
        "位置情報のアクセスを許可してください。",
        [
          { text: "許可しない", style: "cancel" },
          { text: "許可する", onPress: () => getCurrentLocation() },
        ]
      );
      return;
    }
    getCurrentLocation();
  };

  const getCurrentLocation = async () => {
    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setMapRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      });

      // Check if within the target region
      const distance = getDistanceFromLatLonInKm(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        targetRegion.latitude,
        targetRegion.longitude
      );

      if (distance <= targetRegion.radius) {
        sendPushNotification();
      }
    } catch (error) {
      Alert.alert("エラー", "現在地の取得に失敗しました。");
      console.log(error);
    }
  };

  const checkIfWithinRegion = (currentLocation) => {
    const distance = getDistanceFromLatLonInKm(
      currentLocation.latitude,
      currentLocation.longitude,
      targetRegion.latitude,
      targetRegion.longitude
    );

    if (distance <= targetRegion.radius) {
      sendPushNotification();
    }
  };

  const sendPushNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "出勤スタンプゲット！",
          body: "今日も一日頑張りましょう！",
        },
        trigger: null, // 即時通知の設定
      });
      console.log("2024/01/31成功wwwwwwwww!!");
    } catch (error) {
      console.error("通知送信エラー:", error);
    }
  };

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={mapRegion} showsUserLocation={true}>
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="現在地"
          />
        )}
        <Circle
          center={targetRegion}
          radius={targetRegion.radius}
          strokeColor="rgba(158, 158, 255, 0.5)"
          fillColor="rgba(158, 158, 255, 0.3)"
        />
      </MapView>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={requestLocationPermission}
      >
        <Ionicons name="locate" size={24} color="white" />
      </TouchableOpacity>
      <Button title="通知テスト" onPress={sendPushNotification} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  locationButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#00bfff",
    borderRadius: 20,
    padding: 10,
  },
});

export default App;
