import React, { FC } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Linking,
  ScrollView,
  Platform
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './type';
import { FontAwesome5 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ThemeColors {
  background: string;
  text: string;
  subtext: string;
  cardBackground: string;
  borderColor: string;
  accent: string;
}

const LIGHT_THEME: ThemeColors = {
  background: '#f4f6f9',
  text: '#1a2d4a',
  subtext: '#4a5568',
  cardBackground: '#ffffff',
  borderColor: '#e2e8f0',
  accent: '#2c5282',
};

const DARK_THEME: ThemeColors = {
  background: '#121d2f',
  text: '#e2e8f0',
  subtext: '#a0aec0',
  cardBackground: '#1f2937',
  borderColor: '#2d3748',
  accent: '#3182ce',
};

interface SocialLink {
  icon: string;
  url: string;
  platform: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    icon: 'linkedin',
    url: 'https://www.linkedin.com/in/syed-sarib-naveed',
    platform: 'LinkedIn',
  },
  {
    icon: 'github',
    url: 'https://github.com/saribnaveed',
    platform: 'GitHub',
  },
  {
    icon: 'stack-overflow',
    url: 'https://stackoverflow.com/users/yourprofile',
    platform: 'Stack Overflow',
  },
];

type AboutScreenProps = {
  route: RouteProp<RootStackParamList, 'AboutUs'>;
};

const AboutScreen: FC<AboutScreenProps> = ({ route }) => {
  const isDarkMode = route?.params?.isDarkMode || false;
  const colors = isDarkMode ? DARK_THEME : LIGHT_THEME;
  const router = useRouter();

  const openSocialLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
    });
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.cardBackground,
        borderBottomColor: colors.borderColor 
      }]}>
        <TouchableOpacity onPress={() => router.replace("/settings")}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About Us</Text>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={[styles.profileSection, { 
          borderBottomColor: colors.borderColor 
        }]}>
          <View style={[styles.avatarContainer, { 
            borderColor: colors.accent 
          }]}>
            <Image
              style={styles.avatar}
              source={{
                uri: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
              }}
            />
          </View>

          <Text style={[styles.name, { color: colors.text }]}>
            Syed Sarib Naveed
          </Text>
          <Text style={[styles.role, { color: colors.subtext }]}>
            Senior Mobile Application Architect
          </Text>
        </View>

        <View style={[styles.card, { 
          backgroundColor: colors.cardBackground,
          borderColor: colors.borderColor
        }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Professional Overview
          </Text>
          <Text style={[styles.cardContent, { color: colors.subtext }]}>
            A strategic mobile application developer with comprehensive expertise in React Native, 
            specializing in designing scalable, high-performance architectural solutions. 
            Committed to delivering innovative technological experiences that drive digital transformation.
          </Text>
        </View>

        <View style={styles.professionalSkillsCard}>
          <Text style={[styles.skillsTitle, { color: colors.text }]}>
            Core Competencies
          </Text>
          <View style={styles.skillsList}>
            {[
              'React Native Architecture',
              'Performance Optimization',
              'Cross-Platform Development',
              'State Management',
              'UI/UX Design Principles'
            ].map((skill, index) => (
              <View key={index} style={styles.skillItem}>
                <FontAwesome5 
                  name="check-circle" 
                  size={16} 
                  color={colors.accent} 
                  style={styles.skillIcon}
                />
                <Text style={[styles.skillText, { color: colors.subtext }]}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.socialTitle, { color: colors.text }]}>
          Professional Networks
        </Text>

        <View style={styles.socialLinks}>
          {SOCIAL_LINKS.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.socialButton, 
                { backgroundColor: colors.cardBackground }
              ]}
              onPress={() => openSocialLink(link.url)}
            >
              <FontAwesome5
                name={link.icon as any}
                size={40}
                color={colors.accent}
                style={styles.socialIcon}
              />
              <Text style={[styles.socialPlatform, { color: colors.subtext }]}>
                {link.platform}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
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
  container: {
    flex: 1,
  },
  scrollViewContent: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingBottom: 30,
    borderBottomWidth: 1,
    marginBottom: 25,
    width: '100%',
  },
  avatarContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  avatar: {
    width: 190,
    height: 190,
    borderRadius: 95,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  role: {
    fontSize: 18,
    fontWeight: '500',
  },
  card: {
    width: '85%',
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  cardContent: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  professionalSkillsCard: {
    width: '85%',
    padding: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    marginBottom: 25,
  },
  skillsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  skillsList: {
    alignItems: 'flex-start',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillIcon: {
    marginRight: 12,
  },
  skillText: {
    fontSize: 16,
  },
  socialTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    width: '100%',
  },
  socialButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  socialIcon: {
    marginBottom: 10,
  },
  socialPlatform: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AboutScreen;