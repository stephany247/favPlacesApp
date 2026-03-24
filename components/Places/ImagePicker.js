import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker';
import { Button, StyleSheet, View } from 'react-native';

export default function ImagePicker() {
  async function takeImageHandler() {
    let image = await launchCameraAsync({
      // mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });
    console.log(image);
  }

  return (
    <View>
      <View></View>
      <Button title="Take Image" onPress={takeImageHandler} />
    </View>
  );
}

const styles = StyleSheet.create({});
