import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
const { width } = Dimensions.get('window');

interface HelpSection {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  content: string[];
}

const Help: React.FC = () => {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'play-circle-outline',
      content: [
        'Welcome to the Traffic Violation Reporting System. This app allows you to report traffic violations and help make roads safer.',
        'To get started, ensure you have a stable internet connection and camera permissions enabled.',
        'Your reports will be analyzed by AI and forwarded to relevant authorities for action.'
      ]
    },
    {
      id: 'report-violation',
      title: 'How to Report a Violation',
      icon: 'camera-outline',
      content: [
        '1. Tap the "Report" button on the home screen',
        '2. Point your camera at the traffic violation',
        '3. Capture a clear photo or video (minimum 10 seconds)',
        '4. Select the violation type from the dropdown menu',
        '5. Add location details and any additional notes',
        '6. Submit your report for AI verification'
      ]
    },
    {
      id: 'evidence-tips',
      title: 'Evidence Best Practices',
      icon: 'checkmark-circle-outline',
      content: [
        'Ensure the license plate is clearly visible',
        'Capture the violation as it occurs in real-time',
        'Include traffic signs or signals in the frame when relevant',
        'Maintain good lighting - avoid shadows or glare',
        'Keep your phone steady while recording',
        'Do not put yourself in danger to capture evidence'
      ]
    },
    {
      id: 'track-reports',
      title: 'Tracking Your Reports',
      icon: 'list-outline',
      content: [
        'Access "My Reports" from the main menu to view all submissions',
        'Reports show real-time status: Submitted, Under Review, Approved, or Rejected',
        'You\'ll receive push notifications for important status updates',
        'Approved reports contribute to your reward points',
        'View detailed feedback on why reports may have been rejected'
      ]
    },
    {
      id: 'ai-verification',
      title: 'AI Verification Process',
      icon: 'scan-outline',
      content: [
        'All submitted evidence undergoes automated AI analysis',
        'Our system checks for image quality, authenticity, and violation validity',
        'Machine learning models verify license plates and violation types',
        'Processing typically takes 2-5 minutes for most submissions',
        'Only verified reports are forwarded to law enforcement agencies'
      ]
    },
    {
      id: 'rewards',
      title: 'Rewards & Recognition',
      icon: 'trophy-outline',
      content: [
        'Earn points for each successfully verified report',
        'Bonus points awarded for high-quality evidence',
        'Monthly leaderboards recognize top contributors',
        'Redeem points for various rewards and recognition',
        'Special badges for consistent quality reporting'
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-checkmark-outline',
      content: [
        'Your personal information is protected with industry-standard encryption',
        'Location data is only used for violation context and then anonymized',
        'You can control what personal information is shared',
        'All data transmission uses secure protocols',
        'We comply with relevant privacy regulations and data protection laws'
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const renderHelpSection = (section: HelpSection) => {
    const isExpanded = expandedSection === section.id;
    
    return (
      <View key={section.id} style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section.id)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name={section.icon} size={22} color="#007AFF" />
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#8E8E93"
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {section.content.map((paragraph, index) => (
              <Text key={index} style={styles.contentText}>
                {paragraph}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/settings")}>
          <Feather name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={() => router.replace("/ContactUs")}>
              <Ionicons name="call-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText} >Contact Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="videocam-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Video Tutorial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}
            onPress={() => router.replace("/Chat")}>
              <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Live Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help Sections */}
        <View style={styles.helpSectionsContainer}>
          <Text style={styles.helpSectionsTitle}>Frequently Asked Questions</Text>
          {helpSections.map(renderHelpSection)}
        </View>

        {/* Contact Information */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>Still Need Help?</Text>
          <Text style={styles.contactDescription}>
            Our support team is available 24/7 to assist you with any questions or issues.
          </Text>
          
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => router.replace("/ContactUs")}
            >
            <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
 headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  
  quickActionsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  helpSectionsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingTop: 20,
  },
  helpSectionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3C3C43',
    marginBottom: 12,
  },
  contactContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default Help;