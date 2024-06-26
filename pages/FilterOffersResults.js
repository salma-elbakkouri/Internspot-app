import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, where, query, getDocs, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore/lite'; // Import where, query, getDocs, doc, updateDoc, setDoc
import { db } from '../config/firebase';
import { auth } from '../config/firebase'; // Import Firebase auth


export default function FilterOffersResults({ navigation, route }) {
  const navigation1 = useNavigation();
  const suggest = route.params.suggest;
  const [searchKeyWord, setSearchKeyWord] = useState(`${suggest.name}`);
  const felterOptions = route.params.filterOptions;
  const [selectedTag, setselectedTag] = useState(['Paid', 'PFE', 'Pre-Employment', 'Unpaid']);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [userSavedOffers, setUserSavedOffers] = useState([]);
  const [user, setUser] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsUserLoggedIn(true);
      } else {
        setIsUserLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        // fetchUserData(user.email);
      } else {
        const fetchInterests = async () => {
          if (skiped) {
            try {
              const interestsJson = await AsyncStorage.getItem('interests');
              if (interestsJson !== null) {
                const interests = JSON.parse(interestsJson);
                // Set your state with the fetched interests
                fetchHomeOffers(interests);
              } else {
                console.log('No interests found in AsyncStorage');
              }
            } catch (error) {
              console.error('Error fetching interests:', error);
            }
          } else {
            console.log('User has not skipped the interests page');
          }
        };

        fetchInterests();
        loadSavedOffers();
      }
    });

    if (felterOptions) {
      fetchOffers();
    }

    return () => unsubscribe(); // Cleanup function
  }, []);

  const loadSavedOffers = async () => {
    if (isUserLoggedIn) {
      const userRef = collection(db, 'users');

      try {
        const userQuerySnapshot = await getDocs(query(userRef, where('email', '==', user.email)));

        if (!userQuerySnapshot.empty) {
          // Assuming there's only one document for each user email
          const userData = userQuerySnapshot.docs[0].data();

          // Use userData as needed
          setUserSavedOffers(userData.savedOffers || []);
        } else {
          console.log('No user found with email:', user.email);
        }
      } catch (error) {
        console.error("Error fetching user offers:", error);
      }
    } else {
      console.log('User is not logged in');
    }
  };

  const toggleSelection = async (id) => {
    try {
      const userRef = collection(db, 'users');
      const userQuerySnapshot = await getDocs(query(userRef, where('email', '==', user.email)));

      if (!userQuerySnapshot.empty) {
        // Assuming there's only one document for each user email
        const userDocRef = userQuerySnapshot.docs[0].ref;
        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();

        if (userData) {
          const savedOffers = userData.savedOffers || [];
          const updatedSavedOffers = savedOffers.includes(id) ? savedOffers.filter(item => item !== id) : [...savedOffers, id];

          await updateDoc(userDocRef, {
            savedOffers: updatedSavedOffers,
          });

          setUserSavedOffers(updatedSavedOffers);
          loadSavedOffers();
        } else {
          console.log('No user data found');
        }
      } else {
        console.log('No user found with email:', user.email);
      }
    } catch (error) {
      console.error("Error updating saved items:", error);
    }
  };

  useEffect(() => {
    loadSavedOffers();
  }, [])

  const handleSaveOffer = (offer) => {
    if (!isUserLoggedIn) {
      Alert.alert(
        'Error',
        'Please login to save this offer.',
        [
          {
            text: 'Login',
            onPress: () => navigation1.navigate('Login'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: false }
      );

    } else {
      toggleSelection(offer.id);
    }
  };

  const updateTag = (type) => {
    const index = selectedTag.indexOf(type);
    if (index === -1) {
      setselectedTag([...selectedTag, type]);
    } else {
      const updatedSelectedTypes = [...selectedTag];
      updatedSelectedTypes.splice(index, 1);
      setselectedTag(updatedSelectedTypes);
    }
  };

  const fetchOffers = async () => {
    try {
      // Fetch offers from Firestore
      const querySnapshot = await getDocs(collection(db, 'offers'));

      // Filter offers based on search keyword and suggested name
      let offersData = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((offer) => {
          const { title, additional_info, description } = offer;
          const includesSearchKeyword =
            title.includes(searchKeyWord) ||
            (additional_info?.Fonction?.includes(searchKeyWord) ||
              additional_info?.Domaine?.includes(searchKeyWord) ||
              title.includes(suggest.name) ||
              description.includes(suggest.name) ||
              description.includes(searchKeyWord) ||
              additional_info?.Fonction?.includes(suggest.name) ||
              additional_info?.Domaine?.includes(suggest.name));
          // const includesSuggestedName = description.includes(suggest.name);
          return includesSearchKeyword;
        });

      if (felterOptions) {
        let filtredOffers = [];
        const cities = felterOptions.city;
        if (cities.length > 0) {
          const offersByCity = [];

          cities.forEach(city => {
            offersData.map(offer => {
              if (offer.general_info.City.includes(city)) {
                offersByCity.push(offer);
              }
            }
            )
          });

          filtredOffers = offersByCity;
        }

        const etudes = felterOptions.etudes;
        if (etudes && etudes.length > 0) {
          const offersByEtude = [];
          filtredOffers.forEach(offer => {
            if (offer.additional_info['Niveau d\'études'] === etudes) {
              offersByEtude.push(offer);
            }
          });

          filtredOffers = offersByEtude;
        } else {
          console.log('etudes is empty');
        }

        const types = felterOptions.internshipType;
        if (types.length > 0) {
          const offersByType = [];

          types.forEach(type => {
            filtredOffers.map(offer => {
              if (offer.description.includes(type) || offer.title.includes(type)) {
                offersByType.push(offer);
              }
            }
            )
          });

          filtredOffers = offersByType;

        }

        if ((types.length <= 0) && (etudes.length <= 0) && (cities.length <= 0)) {
          console.log('No filter options selected');
          filtredOffers = offersData;
        }

        const lastUpdateOption = felterOptions.lastUpdateOption;
        if (lastUpdateOption && lastUpdateOption.length > 0) {
          const offersByLastUpdate = [];

          switch (lastUpdateOption) {
            case 'Last Week':
              filtredOffers.forEach(offer => {
                const postedDate = new Date(offer.general_info.Posted_Date);
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);

                if (postedDate > lastWeek) {
                  offersByLastUpdate.push(offer);
                }
              });
              break;

            case 'Last Month':
              filtredOffers.forEach(offer => {
                const postedDate = new Date(offer.general_info.Posted_Date);
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);

                if (postedDate > lastMonth) {
                  offersByLastUpdate.push(offer);
                }
              });
              break;

            case 'Anytime':
              offersByLastUpdate.push(...filtredOffers);
              break;

            default:
              break;
          }

          filtredOffers = offersByLastUpdate;
        }

        offersData = filtredOffers;
      }

      // Sort offers by Posted_Date from newest to oldest
      offersData.sort((a, b) => new Date(b.general_info.Posted_Date) - new Date(a.general_info.Posted_Date));

      // Set data and loading state after all offers have been fetched and sorted
      setOffers(offersData);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching home offers:', error);
      // Handle error as needed
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    // Fetch offers when filter options change
    if (route.params.filterOptions) {
      setLoading(true);
      fetchOffers();
      setLoading(false);
    }
  }, [route.params.filterOptions]);

  const handleOfferPress = (offer) => {
    navigation1.navigate('OfferdetailPage', { offer });
  };

  const filterPageNavigate = () => {
    navigation1.navigate('FilterOffersPage', { suggest: suggest });
  }

  const navigateToFilterOptionsPage = () => {
    navigation1.navigate('FilterOptionsPage', felterOptions ? {
      suggest: suggest,
      felterOptions: felterOptions,
    } : {
      suggest: suggest,
    });
  };

  const renderItem = ({ item }) => {
    const index = offers.indexOf(item);
    const key = item.id + '-' + index;

    const imagePaths = [
      require('../assets/companies/c19.png'),
      require('../assets/companies/c7.png'),
      require('../assets/companies/c10.png'),
      require('../assets/companies/c16.png'),
      require('../assets/companies/c12.png'),
      require('../assets/companies/c13.png'),
      require('../assets/companies/c14.png'),
      require('../assets/companies/c15.png'),
      require('../assets/companies/c5.png'),
      require('../assets/companies/c17.png'),
      require('../assets/companies/c18.png'),
      require('../assets/companies/c19.png'),
    ];

    const image = imagePaths[index % imagePaths.length];
    // Convert Posted_Date string to Date object
    const postedDate = new Date(item.general_info.Posted_Date);

    // Get the current date and time
    const currentDate = new Date();

    // Calculate the time difference in milliseconds
    const timeDifference = currentDate - postedDate;

    // Convert milliseconds to seconds, minutes, hours, and days
    const secondsDifference = Math.floor(timeDifference / 1000);
    const minutesDifference = Math.floor(secondsDifference / 60);
    const hoursDifference = Math.floor(minutesDifference / 60);
    const daysDifference = Math.floor(hoursDifference / 24);

    // Determine the appropriate time unit to display
    let timeAgo;
    if (daysDifference > 0) {
      timeAgo = `${daysDifference} day${daysDifference > 1 ? 's' : ''} ago`;
    } else if (hoursDifference > 0) {
      timeAgo = `${hoursDifference} hour${hoursDifference > 1 ? 's' : ''} ago`;
    } else if (minutesDifference > 0) {
      timeAgo = `${minutesDifference} minute${minutesDifference > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = `${secondsDifference} second${secondsDifference > 1 ? 's' : ''} ago`;
    }

    return (
      <View style={styles.offerContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveOffer(item)}>
          <FontAwesome name="bookmark" size={22}
            color={userSavedOffers.includes(item.id) ? '#0047D2' : 'lightgray'}
          ></FontAwesome>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOfferPress(item)}>
          <View style={styles.offerContent}>
            <Text style={styles.postedText}>Posted {timeAgo}</Text>
            <Text style={styles.titleText}>{item.title}</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.durationText}>Salaire  -</Text>
              <View style={styles.typeContainer}>
                <Text style={styles.typeText}>{item.additional_info.Salaire}</Text>
              </View>
            </View>
            <View style={styles.companyContainer}>
              <Image source={image} style={styles.logoImage} />
              <View style={styles.companyDetails}>
                <Text style={styles.companyName}>{item.additional_info.Entreprise}</Text>
                <Text style={styles.location}>{item.general_info.City}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation1.goBack()} style={styles.back}>
        <FontAwesome5 name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.header}>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="lightgray"
            value={searchKeyWord}
            onPressIn={filterPageNavigate}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={navigateToFilterOptionsPage}>
          <Image source={require('../assets/filtericon.png')} tintColor={'white'} style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      {felterOptions ? (
        <View style={styles.section}>
          <ScrollView horizontal={true}>
            <View style={styles.optionsTag}>

              {felterOptions.lastUpdateOption.length > 0 ? (
                <TouchableOpacity
                  style={[styles.tag, { backgroundColor: '#0f52d4' }]}>
                  <Text style={[styles.tagText, { color: 'white' }]}>
                    {felterOptions.lastUpdateOption}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {felterOptions.city.length > 0 ? (
                felterOptions.city.map((city, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.tag, { backgroundColor: '#0f52d4' }]}>
                    <Text style={[styles.tagText, { color: 'white' }]}>{city}</Text>
                  </TouchableOpacity>
                ))
              ) : null}

              {felterOptions.internshipType.length > 0 ? (
                felterOptions.internshipType.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.tag, { backgroundColor: '#0f52d4' }]}>
                    <Text style={[styles.tagText, { color: 'white' }]}>{type}</Text>
                  </TouchableOpacity>
                ))
              ) : null}

              {felterOptions.etudes.length > 0 ? (
                <TouchableOpacity
                  style={[styles.tag, { backgroundColor: '#0f52d4' }]}>
                  <Text style={[styles.tagText, { color: 'white' }]}>
                    {felterOptions.etudes}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color="#0047D2" style={[styles.loadingSpin]} />
      ) : (
        offers.length !== 0 ? (
          <FlatList
            data={offers}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 60 }}
          />
        ) : (
          <View style={styles.noResultsBlock}>
            <Image source={require('../assets/Illustrasi.png')} />
            <Text style={styles.noResultsTitle}>No results found</Text>
            <Text style={styles.noResultsText}>
              The search could not be found, please check spelling or write another word.
            </Text>
          </View>
        )
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  back: {
    marginTop: 40,
    marginLeft: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    color: 'black',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  searchButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#0047D2',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#0047D2',
    borderRadius: 10,
  },
  filterIcon: {
    width: 19,
    height: 21,
  },
  saveButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
    borderRadius: 50,
  },
  offerContainer: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    marginBottom: 15,
    borderRadius: 15,
    marginLeft: 5,
    marginRight: 5,
    flexDirection: 'row',
  },
  offerContent: {
    flex: 1,
  },
  postedText: {
    color: '#4A4A4A',
    marginBottom: 5,
  },
  titleText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginRight: 10,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  durationText: {
    color: '#4A4A4A',
    marginRight: 10,
  },
  typeContainer: {
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  typeText: {
    color: '#4A4A4A',
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyDetails: {
    marginLeft: 10,
  },
  companyName: {
    fontWeight: 'bold',
  },
  location: {
    color: '#4A4A4A',
  },

  section: {
    marginBottom: 20,
  },
  optionsTag: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: 'lightgray',
  },
  tagText: {
    color: '#8d8c8e',
    fontSize: 13,
  },
  loadingSpin: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#8d8c8e',
    marginLeft: 20,
    marginRight: 20,
  },
});