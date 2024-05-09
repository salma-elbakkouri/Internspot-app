import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function WelcomePage() {
  const navigation = useNavigation();

  const { width } = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';  // Check if the platform is web

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  // Define styles inside the component to use the isWeb flag and responsive layout
  const styles = getStyles(width, isWeb);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Internspot</Text>
      <View style={styles.content}>
        <Image
          source={require('../assets/welcomepic.png')}
          style={styles.image}
          onError={(e) => console.error("Failed to load image:", e.nativeEvent.error)} // Log error
        />
        <View style={styles.textContainer}>
          <Text style={styles.bigText}>
            Find Your <Text style={styles.blueText}>Dream Internship</Text> Here!
          </Text>
          <Text style={styles.smallText}>
          Discover tailored internships matched to your interests and major. Explore diverse opportunities spanning various fields. Start your journey to a rewarding internship experience today!
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
       <Text>Next</Text>
        <AntDesign name="arrowright" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

// Function to dynamically generate responsive styles
function getStyles(width, isWeb) {
  const scale = width < 768 ? (width < 360 ? 1.2 : 1) : 0.8; // Adjust scale based on width thresholds
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: '5%',
      paddingTop: '5%',
      paddingBottom: '5%',
      position: 'relative',
    },
    title: {
      position: 'absolute',
      top: isWeb ? '2%' : '10%',
      right: '5%',
      color: '#0047D2',
      fontSize: 55 * scale,
      fontWeight: 'bold',
    },
    content: {
      flexDirection:'row',
      right: '15%',
      justifyContent: 'flex-end',
    },
    image: {
      width: isWeb ? '300px' : 300,  // Use a fixed width for mobile
      height: isWeb ? '300px' : 200,  // Use a fixed height for mobile
      // resizeMode: 'contain',
      // marginBottom: '20%',
    },
    
    textContainer: {
      marginBottom: '10%',
      marginTop: '9%',
      width: '60%', // Responsive width for text container
      textAlign: 'center', // Center the text within the container
      paddingLeft: '3%',
    },
    // image: {
    //   width: isWeb ? '100%' : width * 0.8, // Adjust width based on the platform
    //   height: isWeb ? '70%' : width * 0.6, // Adjust height based on the platform
    //   resizeMode: 'contain',
    //   marginBottom: isWeb ? '5%' : '2%', // Adjust marginBottom as needed
    // },
    
    // textContainer: {
    //   width: '100%', // Responsive width for text container
    //   textAlign: 'center', // Center the text within the container
    // },
    bigText: {
      fontSize: 35 * scale,
      fontWeight: 'bold',
      marginBottom: '1%',
    },
    blackText: {
      color: 'black',
    },
    blueText: {
      color: '#0047d2',
      fontWeight: 'bold',
    },
    smallText: {
      color: '#524B6B',
      fontSize: 20* scale,
    },
    button: {
      position: 'absolute',
      bottom: '5%',
      right: '5%',
      backgroundColor: '#0047d2',
      borderRadius: 50,
      padding: '1%',
      justifyContent: 'center', // Center content vertically
      alignItems: 'center', // Center content horizontally
      width: 150,  // Define a specific size for the button
      height: 50,  // Define a specific size for the button
      color:'white',
      display: 'flex',  
      flexDirection: 'row',
    },

  });
}