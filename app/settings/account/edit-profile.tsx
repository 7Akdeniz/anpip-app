// ============================================================================
// 👤 PROFIL BEARBEITEN
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUsername(data.username || '');
          setFullName(data.full_name || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url || '');
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden des Profils:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Berechtigung erforderlich', 'Bitte erlaube den Zugriff auf deine Fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Fehler', 'Benutzername darf nicht leer sein');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({
            username,
            full_name: fullName,
            bio,
            avatar_url: avatarUrl,
          })
          .eq('id', user.id);

        if (error) throw error;

        Alert.alert('Erfolg', 'Profil wurde aktualisiert', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      Alert.alert('Fehler', 'Profil konnte nicht aktualisiert werden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Profil bearbeiten',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FF3B30" />
              ) : (
                <Text style={styles.saveButton}>Speichern</Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Profilbild */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, isDark && styles.avatarPlaceholderDark]}>
                <Ionicons name="person" size={50} color={isDark ? '#FFFFFF' : '#000000'} />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarLabel, isDark && styles.textDark]}>
            Profilbild ändern
          </Text>
        </View>

        {/* Formular */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Benutzername</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={username}
              onChangeText={setUsername}
              placeholder="@benutzername"
              placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Name</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Dein vollständiger Name"
              placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, isDark && styles.inputDark]}
              value={bio}
              onChangeText={setBio}
              placeholder="Erzähle etwas über dich..."
              placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
              multiline
              numberOfLines={4}
              maxLength={150}
            />
            <Text style={[styles.charCount, isDark && styles.charCountDark]}>
              {bio.length}/150
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderDark: {
    backgroundColor: '#1C1C1E',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarLabel: {
    marginTop: 12,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  textDark: {
    color: '#0A84FF',
  },
  form: {
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  labelDark: {
    color: '#8E8E93',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputDark: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
    borderColor: '#38383A',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  charCountDark: {
    color: '#8E8E93',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
