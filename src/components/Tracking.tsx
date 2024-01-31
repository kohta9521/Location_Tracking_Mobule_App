"use client";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const Tracking = () => {
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        (newLocation) => {
          let { latitude, longitude } = newLocation.coords;
          setLocation(newLocation.coords);
          setMapRegion({
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          });
        }
      );
    })();
  }, []);

  return (
    <View style={styles.container}>
      {mapRegion && (
        <MapView style={styles.map} region={mapRegion}>
          <Marker
            coordinate={{
              latitude: mapRegion.latitude,
              longitude: mapRegion.longitude,
            }}
          />
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default Tracking;
