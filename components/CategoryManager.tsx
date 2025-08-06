import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { 
  Card, 
  Button, 
  TextInput,
  IconButton,
  Dialog,
  Portal,
  FAB,
} from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { Category } from '../types';

interface CategoryManagerProps {
  onRefresh?: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ onRefresh }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState('#6750a4');
  
  const colors = [
    '#6750a4', '#2196F3', '#4CAF50', '#FF9800', 
    '#F44336', '#E91E63', '#9C27B0', '#00BCD4',
    '#009688', '#8BC34A', '#FFC107', '#795548'
  ];

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        if (error.code === 'PGRST200' || error.message?.includes('categories')) {
          // テーブルが存在しない場合のデフォルトカテゴリ
          const defaultCategories: Category[] = [
            {
              id: '1',
              name: '全て',
              slug: 'all',
              color: '#6750a4',
              order_index: 0,
              is_active: true,
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              name: '政治',
              slug: 'politics',
              color: '#2196F3',
              order_index: 1,
              is_active: true,
              created_at: new Date().toISOString(),
            },
            {
              id: '3',
              name: '経済',
              slug: 'economy',
              color: '#4CAF50',
              order_index: 2,
              is_active: true,
              created_at: new Date().toISOString(),
            },
            {
              id: '4',
              name: 'スポーツ',
              slug: 'sports',
              color: '#FF9800',
              order_index: 3,
              is_active: true,
              created_at: new Date().toISOString(),
            },
            {
              id: '5',
              name: 'エンタメ',
              slug: 'entertainment',
              color: '#E91E63',
              order_index: 4,
              is_active: true,
              created_at: new Date().toISOString(),
            },
          ];
          setCategories(defaultCategories);
        } else {
          console.error('Error fetching categories:', error);
          setCategories([]);
        }
        return;
      }

      if (data) {
        setCategories(data as Category[]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };

    loadCategories();
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setColor('#6750a4');
    setEditing(null);
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditing(category);
      setName(category.name);
      setSlug(category.slug);
      setColor(category.color);
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      Alert.alert('エラー', 'カテゴリ名とスラッグを入力してください。');
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        // 更新
        const { error } = await supabase
          .from('categories')
          .update({
            name: name.trim(),
            slug: slug.trim(),
            color,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editing.id);

        if (error) {
          Alert.alert('エラー', 'カテゴリの更新に失敗しました。');
        } else {
          Alert.alert('成功', 'カテゴリを更新しました。');
          setShowDialog(false);
          resetForm();
          await fetchCategories();
          onRefresh?.();
        }
      } else {
        // 新規作成
        const maxOrder = Math.max(...categories.map(c => c.order_index), -1);
        
        const { error } = await supabase
          .from('categories')
          .insert([
            {
              name: name.trim(),
              slug: slug.trim(),
              color,
              order_index: maxOrder + 1,
              is_active: true,
            },
          ]);

        if (error) {
          if (error.code === 'PGRST200' || error.message?.includes('categories')) {
            Alert.alert('エラー', 'カテゴリ機能はまだ準備中です。');
          } else {
            Alert.alert('エラー', 'カテゴリの作成に失敗しました。');
          }
        } else {
          Alert.alert('成功', 'カテゴリを作成しました。');
          setShowDialog(false);
          resetForm();
          await fetchCategories();
          onRefresh?.();
        }
      }
    } catch (error) {
      console.error('Save category error:', error);
      Alert.alert('エラー', 'カテゴリの保存に失敗しました。');
    }

    setSaving(false);
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          is_active: !category.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', category.id);

      if (error) {
        Alert.alert('エラー', 'ステータスの更新に失敗しました。');
      } else {
        await fetchCategories();
        onRefresh?.();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      Alert.alert('エラー', 'ステータスの更新に失敗しました。');
    }
  };

  const handleDelete = async (category: Category) => {
    Alert.alert(
      'カテゴリ削除',
      `「${category.name}」を削除しますか？このカテゴリを使用している記事がある場合、カテゴリなしになります。`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', category.id);

              if (error) {
                Alert.alert('エラー', 'カテゴリの削除に失敗しました。');
              } else {
                Alert.alert('成功', 'カテゴリを削除しました。');
                await fetchCategories();
                onRefresh?.();
              }
            } catch (error) {
              console.error('Delete category error:', error);
              Alert.alert('エラー', 'カテゴリの削除に失敗しました。');
            }
          },
        },
      ]
    );
  };

  const handleMoveUp = async (category: Category) => {
    const index = categories.findIndex(c => c.id === category.id);
    if (index <= 0) return;

    const prevCategory = categories[index - 1];
    
    try {
      await supabase
        .from('categories')
        .update({ order_index: category.order_index })
        .eq('id', prevCategory.id);
      
      await supabase
        .from('categories')
        .update({ order_index: prevCategory.order_index })
        .eq('id', category.id);

      await fetchCategories();
    } catch (error) {
      console.error('Move up error:', error);
    }
  };

  const handleMoveDown = async (category: Category) => {
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= categories.length - 1) return;

    const nextCategory = categories[index + 1];
    
    try {
      await supabase
        .from('categories')
        .update({ order_index: category.order_index })
        .eq('id', nextCategory.id);
      
      await supabase
        .from('categories')
        .update({ order_index: nextCategory.order_index })
        .eq('id', category.id);

      await fetchCategories();
    } catch (error) {
      console.error('Move down error:', error);
    }
  };

  const renderCategory = ({ item, index }: { item: Category; index: number }) => {
    return (
      <Card style={styles.categoryCard}>
        <Card.Content>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <View>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categorySlug}>/{item.slug}</Text>
              </View>
            </View>
            <View style={styles.categoryActions}>
              <IconButton
                icon="arrow-up"
                size={20}
                onPress={() => handleMoveUp(item)}
                disabled={index === 0}
              />
              <IconButton
                icon="arrow-down"
                size={20}
                onPress={() => handleMoveDown(item)}
                disabled={index === categories.length - 1}
              />
              <Button
                mode="text"
                onPress={() => handleToggleActive(item)}
                compact
              >
                {item.is_active ? '有効' : '無効'}
              </Button>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleOpenDialog(item)}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDelete(item)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading && categories.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>カテゴリがありません</Text>
            <Text style={styles.emptySubText}>
              右下の＋ボタンから新しいカテゴリを作成してください
            </Text>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => handleOpenDialog()}
        label="カテゴリ追加"
      />

      <Portal>
        <Dialog 
          visible={showDialog} 
          onDismiss={() => {
            setShowDialog(false);
            resetForm();
          }}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {editing ? 'カテゴリを編集' : '新しいカテゴリを作成'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="カテゴリ名"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              disabled={saving}
              placeholder="例: スポーツ"
            />
            
            <TextInput
              label="スラッグ（URL用）"
              value={slug}
              onChangeText={(text) => setSlug(text.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              mode="outlined"
              style={styles.input}
              disabled={saving}
              placeholder="例: sports"
              autoCapitalize="none"
            />
            
            <Text style={styles.colorLabel}>カラー</Text>
            <View style={styles.colorGrid}>
              {colors.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c },
                    color === c && styles.colorSelected,
                  ]}
                />
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => {
                setShowDialog(false);
                resetForm();
              }}
              disabled={saving}
            >
              キャンセル
            </Button>
            <Button 
              onPress={handleSave}
              loading={saving}
              disabled={saving || !name.trim() || !slug.trim()}
            >
              {editing ? '更新' : '作成'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  categoryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categorySlug: {
    fontSize: 12,
    color: '#666',
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6750a4',
  },
  dialog: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#333',
  },
});