import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

interface UploadOptionProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
}

function UploadOption({ icon, title, subtitle, onPress }: UploadOptionProps) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.optionCard}>
            <View style={styles.optionIcon}>
                <Ionicons name={icon} size={24} color={Colors.accent} />
            </View>
            <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{title}</Text>
                <Text style={styles.optionSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
    );
}

export default function UploadScreen() {
    const insets = useSafeAreaInsets();

    const handleCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access is required.'); return; }
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.8 });
        if (!result.canceled) Alert.alert('Success', 'Photo captured!');
    };

    const handleGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.8 });
        if (!result.canceled) Alert.alert('Success', 'Image selected!');
    };

    const handleDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'text/plain'] });
        if (!result.canceled) Alert.alert('Success', 'Document uploaded!');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Add Notes</Text>
                <Text style={styles.subtitle}>Upload or capture your study materials</Text>

                <View style={styles.optionsContainer}>
                    <UploadOption icon="camera-outline" title="Take Photo" subtitle="Capture handwritten notes" onPress={handleCamera} />
                    <UploadOption icon="image-outline" title="Photo Library" subtitle="Select from gallery" onPress={handleGallery} />
                    <UploadOption icon="document-text-outline" title="Upload File" subtitle="PDF or text documents" onPress={handleDocument} />
                    <UploadOption icon="create-outline" title="Write Note" subtitle="Type your notes manually" onPress={() => Alert.alert('Coming Soon', 'Manual input coming soon!')} />
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="sparkles-outline" size={18} color={Colors.accent} />
                    <Text style={styles.infoText}>AI will automatically extract text and create study materials from your uploads.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingHorizontal: 24 },
    title: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.semibold, color: Colors.textPrimary },
    subtitle: { fontSize: Typography.sizes.base, color: Colors.textSecondary, marginTop: 4, marginBottom: 32 },
    optionsContainer: { gap: 8 },
    optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: 16, ...Shadows.sm },
    optionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    optionText: { flex: 1 },
    optionTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.medium, color: Colors.textPrimary },
    optionSubtitle: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    infoCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.accentSoft, borderRadius: BorderRadius.md, padding: 16, marginTop: 32, gap: 12 },
    infoText: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
