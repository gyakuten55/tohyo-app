import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';

interface SignUpScreenProps {
  navigation: any;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUp } = useAuth();

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateNickname = (nickname: string) => {
    return nickname.length >= 2 && nickname.length <= 20;
  };

  const handleSignUp = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !nickname) {
      Alert.alert('エラー', 'すべての項目を入力してください。');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください。');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください。');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません。');
      return;
    }

    if (!validateNickname(nickname)) {
      Alert.alert('エラー', 'ニックネームは2文字以上20文字以下で入力してください。');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, nickname);
    setLoading(false);

    if (error) {
      Alert.alert('登録エラー', error);
    } else {
      Alert.alert(
        '登録完了',
        'アカウントが作成されました。メールを確認してアカウントを有効化してください。',
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
          <Text style={styles.title}>新規登録</Text>
          <Text style={styles.subtitle}>アカウントを作成</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="ニックネーム"
              value={nickname}
              onChangeText={setNickname}
              mode="outlined"
              style={styles.input}
              disabled={loading}
              error={nickname.length > 0 && !validateNickname(nickname)}
            />
            <HelperText type="info" visible={true}>
              2文字以上20文字以下で入力してください
            </HelperText>

            <TextInput
              label="メールアドレス"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              disabled={loading}
              error={email.length > 0 && !validateEmail(email)}
            />

            <RNTextInput
              placeholder="パスワード"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.debugInput}
              editable={!loading}
            />
            <HelperText type="info" visible={true}>
              6文字以上で入力してください
            </HelperText>

            <RNTextInput
              placeholder="パスワード（確認）"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={styles.debugInput}
              editable={!loading}
            />

            <Button
              mode="contained"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              登録
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>すでにアカウントをお持ちの場合</Text>
          <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
            <Text style={styles.loginLink}>ログイン</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 4,
  },
  debugInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    marginRight: 8,
  },
  loginLink: {
    color: '#6750a4',
    fontWeight: 'bold',
  },
});