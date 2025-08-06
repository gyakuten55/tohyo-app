import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Category } from '../types';
import { COLORS } from '../constants/colors';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.categoryContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelectCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipSelected,
              { borderColor: category.color }
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected,
                { color: selectedCategory === category.id ? COLORS.TEXT_WHITE : category.color }
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    backgroundColor: COLORS.COMIC_PANEL_BG,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.PRIMARY,
    shadowColor: COLORS.SHADOW_COMIC,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 0,
    marginRight: 10,
    borderWidth: 2,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    transform: [{ skewX: '-5deg' }],
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.SECONDARY,
    shadowColor: COLORS.SHADOW_RED,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    transform: [{ skewX: '5deg' }],
  },
  categoryTextSelected: {
    color: COLORS.TEXT_WHITE,
    textShadowColor: COLORS.SHADOW,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});