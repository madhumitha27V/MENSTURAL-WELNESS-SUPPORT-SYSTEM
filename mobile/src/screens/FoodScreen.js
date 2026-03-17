import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';

const FoodScreen = ({ navigation }) => {
  const mealRecommendations = [
    { id: 1, meal: 'Spinach Salad', icon: '🥗', nutrients: 'Iron, Calcium' },
    { id: 2, meal: 'Salmon', icon: '🐟', nutrients: 'Omega-3, Protein' },
    { id: 3, meal: 'Dark Chocolate', icon: '🍫', nutrients: 'Magnesium' },
    { id: 4, meal: 'Berries', icon: '🫐', nutrients: 'Antioxidants' },
    { id: 5, meal: 'Nuts & Seeds', icon: '🥜', nutrients: 'Zinc, Vitamin E' },
    { id: 6, meal: 'Leafy Greens', icon: '🥬', nutrients: 'Folate' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nutrient Diet</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🍽️ Meal Recommendations</Text>
          <Text style={styles.description}>
            Foods recommended for your current cycle phase.
          </Text>
        </View>

        <FlatList
          scrollEnabled={false}
          data={mealRecommendations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.mealCard}>
              <Text style={styles.mealIcon}>{item.icon}</Text>
              <View style={styles.mealContent}>
                <Text style={styles.mealName}>{item.meal}</Text>
                <Text style={styles.mealNutrients}>{item.nutrients}</Text>
              </View>
            </View>
          )}
        />

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Full Meal Plan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mealNutrients: {
    fontSize: 12,
    color: '#999',
  },
  actionButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FoodScreen;
