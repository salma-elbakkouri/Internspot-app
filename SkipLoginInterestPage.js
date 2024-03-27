import React, { useState, useEffect } from 'react';
// import firestore from '@react-native-firebase/firestore'; // Commented out database fetching
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SkipLoginInterestPage() {
  const navigation = useNavigation(); 


  const [interests, setInterests] = useState([
    'Programming',
    'Web Development',
    'Mobile Development',
    'Cybersecurity',
    'Artificial Intelligence',
    // Add more interests manually here
    'Data Science',
    'Machine Learning',
    'Cloud Computing',
    'Blockchain',
    'UI/UX Design',
  ]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  // useEffect(() => {
  //   const fetchInterests = async () => {
  //     try {
  //       const interestsSnapshot = await firestore().collection('interests').get();
  //       const interestsData = interestsSnapshot.docs.map(doc => doc.data().name);
  //       setInterests(interestsData);
  //     } catch (error) {
  //       console.error('Error fetching :', error);
  //     }
  //   };

  //   fetchInterests();
  // }, []);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const isInterestSelected = (interest) => {
    return selectedInterests.includes(interest);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's choose your interest!</Text>
      <TextInput
        style={styles.input}
        placeholder="Search"
        placeholderTextColor="lightgray"
      />
      <View style={styles.interestsContainer}>
        <View style={styles.checkboxContainer}>
          {interests.map(interest => (
            <TouchableOpacity
              key={interest}
              style={[styles.checkboxButton, isInterestSelected(interest) && styles.selected]}
              onPress={() => toggleInterest(interest)}
            >
              <Text style={[styles.checkboxText, isInterestSelected(interest) && styles.selectedText]}>{interest}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => {
          if (selectedInterests.length > 0) {
            // Navigate to HomePage
            // Replace 'HomePage' with the actual name of your HomePage component
            navigation.navigate('HomePage');
          } else {
            // Show popup
            Alert.alert(
              'Choose at least one interest',
              'Please select at least one interest before continuing.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
          }
        }}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around', // Push elements to the top and bottom
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    marginTop: 70,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2, // Add elevation for shadow
  },
  interestsContainer: {
    width: '100%',
    flexGrow: 1, // Take up remaining space
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  checkboxButton: {
    width: '48%',
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxText: {
    color: 'black',
  },
  selected: {
    backgroundColor: '#0047D2', // Background color when selected
  },
  selectedText: {
    color: '#fff', // text color when selected
  },
  continueButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#0047D2',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  //icon to add when interest is selected (implement later)
  removeIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 50,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    color: 'black',
    fontSize: 14,
  },
});