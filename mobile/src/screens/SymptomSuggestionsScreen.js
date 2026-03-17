import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';

const SymptomSuggestionsScreen = ({ navigation }) => {
  const suggestions = [
    {
      id: 1,
      title: 'Stay Hydrated',
      description: 'Drink plenty of water to help with cramps and bloating.',
      icon: '💧',
    },
    {
      id: 2,
      title: 'Exercise Regularly',
      description: 'Light exercise like walking or yoga can ease discomfort.',
      icon: '🏃',
    },
    {
      id: 3,
      title: 'Get Enough Sleep',
      description: 'Aim for 7-9 hours of sleep each night.',
      icon: '😴',
    },
    {
      id: 4,
      title: 'Eat Iron-Rich Foods',
      description: 'Include spinach, beans, and red meat in your diet.',
      icon: '🥩',
    },
    {
      id: 5,
      title: 'Manage Stress',
      description: 'Practice meditation, deep breathing, or relaxation techniques.',
      icon: '🧘',
    },
    {
      id: 6,
      title: 'Take Supplements',
      description: 'Consider magnesium and calcium supplements.',
      icon: '💊',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Symptom Suggestions</Text>
      </View>

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionIcon}>{item.icon}</Text>
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionTitle}>{item.title}</Text>
              <Text style={styles.suggestionDescription}>
                {item.description}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    color: '#8b5cf6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
  },
  suggestionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default SymptomSuggestionsScreen;
