import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('エラー', 'メールアドレスを入力してください。');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください。');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      Alert.alert('エラー', error);
    } else {
      Alert.alert(
        'パスワードリセット',
        'パスワードリセットのメールを送信しました。メールをご確認ください。',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>パスワードリセット</Text>
          <Text style={styles.subtitle}>
            登録済みのメールアドレスを入力してください
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="メールアドレス"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              disabled={loading}
            />

            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              リセットメールを送信
            </Button>

            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.linkContainer}
              disabled={loading}
            >
              <Text style={styles.linkText}>ログインに戻る</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkContainer: {
    alignItems: 'center',
  },
  linkText: {
    color: '#6750a4',
    fontSize: 14,
  },
});