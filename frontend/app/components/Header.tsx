import React from 'react';
  import { View, Text, StyleSheet } from 'react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useFonts } from 'expo-font';

  interface HeaderProps {
    title: string;
  }

  const Header: React.FC<HeaderProps> = ({ title }) => {
      useFonts({
          'header': require('../../assets/fonts/header.ttf'),
      });

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{title}</Text>
        </View>
      </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: '#ffffff',
    },
    header: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingLeft: 10,
    },
    headerText: {
      color: '#703EFE',
      fontSize: 36,
      fontWeight: '600',
      fontFamily: 'header',
    },
  });

  export default Header;