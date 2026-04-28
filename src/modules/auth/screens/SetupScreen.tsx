import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SetupScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Setup Screen</Text>
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
