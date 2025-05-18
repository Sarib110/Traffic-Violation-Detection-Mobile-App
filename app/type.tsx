// types.ts

export type RootStackParamList = {
    index: undefined;  // Assuming 'Home' screen does not require params
    AboutUs: { isDarkMode?: boolean };  // Assuming 'AboutUS' screen does not require params
    ContactUs: undefined;
    Contact: undefined;
    reports: undefined;
    login: undefined;
    // Add other screens here with the respective parameter types if needed
  };