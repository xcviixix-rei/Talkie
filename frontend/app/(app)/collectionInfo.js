import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useLocalSearchParams, router } from 'expo-router';
import { getCollection, updateCollection, deleteCollection } from '../../api/collection';

export default function CollectionEdit() {
  const { id } = useLocalSearchParams();
  const [collection, setCollection] = useState(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder-outline');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const icons = [
    { name: 'folder-outline', label: 'Default' },
    { name: 'briefcase-outline', label: 'Work' },
    { name: 'account-outline', label: 'Personal' },
    { name: 'account-multiple', label: 'Team' },
    { name: 'book-outline', label: 'Study' },
    { name: 'star-outline', label: 'Favorite' },
  ];

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }

    fetchCollectionDetails();
  }, [id]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      const collectionData = await getCollection(id);
      setCollection(collectionData);
      setName(collectionData.name || '');

      // Set the initial icon based on the collection's icon
      const iconMapping = {
        'briefcase-outline': 'work',
        'account-outline': 'personal',
        'account-multiple': 'team',
        'book-outline': 'study',
        'star-outline': 'favorite',
        'folder-outline': 'folder',
      };

      setSelectedIcon(iconMapping[collectionData.icon] || 'folder-outline');
    } catch (error) {
      console.error('Error fetching collection details:', error);
      Alert.alert('Error', 'Failed to load collection details');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Collection name cannot be empty');
      return;
    }

    try {
      setSaving(true);

      // Convert the icon name back to the backend format
      const iconMapping = {
        'briefcase-outline': 'work',
        'account-outline': 'personal',
        'account-multiple': 'team',
        'book-outline': 'study',
        'star-outline': 'favorite',
        'folder-outline': 'folder',
      };

      const updateData = {
        name: name.trim(),
        icon: iconMapping[selectedIcon] || 'folder',
      };

      await updateCollection(id, updateData);
      Alert.alert('Success', 'Collection updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating collection:', error);
      Alert.alert('Error', 'Failed to update collection');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete }
      ]
    );
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await deleteCollection(id);
      router.replace('/collections');
    } catch (error) {
      console.error('Error deleting collection:', error);
      Alert.alert('Error', 'Failed to delete collection');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={hp(3)} color="#1E90FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Collection</Text>
        <TouchableOpacity onPress={saveChanges} disabled={saving} style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator size="small" color="#1E90FF" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Collection Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter collection name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconsGrid}>
            {icons.map((icon) => (
              <TouchableOpacity
                key={icon.name}
                style={[
                  styles.iconOption,
                  selectedIcon === icon.name && styles.selectedIconOption
                ]}
                onPress={() => setSelectedIcon(icon.name)}
              >
                <MaterialCommunityIcons
                  name={icon.name}
                  size={hp(3)}
                  color={selectedIcon === icon.name ? 'white' : '#1E90FF'}
                />
                <Text style={[
                  styles.iconLabel,
                  selectedIcon === icon.name && styles.selectedIconLabel
                ]}>
                  {icon.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
          <MaterialCommunityIcons name="delete-outline" size={hp(2.5)} color="white" />
          <Text style={styles.deleteText}>Delete Collection</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: hp(1),
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
  },
  saveButton: {
    padding: hp(1),
    minWidth: wp(15),
    alignItems: 'center',
  },
  saveText: {
    color: '#1E90FF',
    fontSize: hp(2),
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: wp(5),
  },
  formGroup: {
    marginBottom: hp(3),
  },
  label: {
    fontSize: hp(2),
    fontWeight: '600',
    marginBottom: hp(1),
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: hp(1.5),
    fontSize: hp(2),
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: hp(1),
  },
  iconOption: {
    width: wp(28),
    height: hp(12),
    justifyContent: 'center',
    alignItems: 'center',
    margin: wp(1),
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: hp(1),
  },
  selectedIconOption: {
    backgroundColor: '#1E90FF',
  },
  iconLabel: {
    marginTop: hp(1),
    fontSize: hp(1.5),
    color: '#444',
  },
  selectedIconLabel: {
    color: 'white',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4d4d',
    padding: hp(1.5),
    borderRadius: 8,
    marginTop: hp(4),
  },
  deleteText: {
    color: 'white',
    fontSize: hp(2),
    fontWeight: '600',
    marginLeft: wp(2),
  },
});