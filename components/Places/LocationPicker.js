import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import OutlinedButton from '../UI/OutlinedButton';
import { Colors } from '../../constants/colors';
import {
  getCurrentPositionAsync,
  PermissionStatus,
  reverseGeocodeAsync,
  useForegroundPermissions,
} from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Text } from 'react-native';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

function LocationPicker({ onPickLocation }) {
  const [pickedLocation, setPickedLocation] = useState();
  const [locationPermissionInformation, requestPermission] =
    useForegroundPermissions();

  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const reverseCodedAddress = await reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseCodedAddress && reverseCodedAddress.length > 0) {
        const address = reverseCodedAddress[0];

        const formattedAddress = `${address.name || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`;

        return {
          lat: latitude,
          lng: longitude,
          address: formattedAddress,
        };
      }
    } catch (e) {
      console.error('Error during reverse geocoding:', e);
    }
  };

  useEffect(() => {
    if (isFocused && route.params) {
      const mapPickedLocation = {
        lat: route.params.pickedLat,
        lng: route.params.pickedLng,
      };
      setPickedLocation(mapPickedLocation);
    }
  }, [route, isFocused]);

  useEffect(() => {
    async function handleLocation() {
      if (pickedLocation) {
        const address = await reverseGeocode(
          pickedLocation.lat,
          pickedLocation.lng
        );
        onPickLocation({ ...pickedLocation, address: address });
      }
    }
    handleLocation();
  }, [pickedLocation, onPickLocation]);

  async function verifyPermission() {
    if (
      locationPermissionInformation.status === PermissionStatus.UNDETERMINED
    ) {
      const permissionResponse = await requestPermission();

      return permissionResponse.granted;
    }

    if (locationPermissionInformation.status == PermissionStatus.DENIED) {
      Alert.alert(
        'Insufficient Permissions!',
        'You need to grant camera permissions to use this app.'
      );

      return false;
    }

    return true;
  }

  async function getLocationHandler() {
    const hasPermission = await verifyPermission();

    if (!hasPermission) {
      return;
    }

    const location = await getCurrentPositionAsync();
    setPickedLocation({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });
  }
  function pickOnMapHandler() {
    navigation.push('Map');
  }

  return (
    <View>
      <View style={styles.mapPreview}>
        {pickedLocation ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: pickedLocation.lat,
              longitude: pickedLocation.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: pickedLocation.lat,
                longitude: pickedLocation.lng,
              }}
            />
          </MapView>
        ) : (
          <Text>No location chosen yet!</Text>
        )}
      </View>
      <View style={styles.actions}>
        <OutlinedButton icon="location" onPress={getLocationHandler}>
          Locate User
        </OutlinedButton>
        <OutlinedButton icon="map" onPress={pickOnMapHandler}>
          Pick on Map
        </OutlinedButton>
      </View>
    </View>
  );
}

export default LocationPicker;

const styles = StyleSheet.create({
  mapPreview: {
    width: '100%',
    height: 200,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
