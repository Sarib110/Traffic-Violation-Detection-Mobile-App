// myLinking.js
import { Platform } from 'react-native';

// Create a fallback linking implementation
const Linking = {
  openURL: async (url) => {
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
        return true;
      } else {
        console.warn('Linking.openURL fallback used');
        return false;
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      return false;
    }
  },
  
  getInitialURL: async () => {
    console.warn('Linking.getInitialURL fallback used');
    return null;
  },
  
  createURL: (path, queryParams = {}) => {
    console.warn('Linking.createURL fallback used');
    const scheme = 'obscuraclone://';
    return scheme + path;
  },
  
  prefixes: ['obscuraclone://'],
};

export default Linking;