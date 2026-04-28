import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SendScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Send Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});
