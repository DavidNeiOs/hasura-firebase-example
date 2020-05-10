import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { User } from 'firebase';
import { ApolloProvider } from '@apollo/client';

import { AppNavigator } from './navigation/AppNavigator';
import { AuthNavigator } from './navigation/AuthNavigator';
import Firebase from './lib/firebase';
import { apolloClient } from './lib/apollo';

export default function App() {
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    Firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // set user if someone is logged in
        setUser(user);
      } else {
        // set user to null, to handle logout
        setUser(null);
      }
    });
  }, []);

  return (
    <NavigationContainer>
      {user && (
        <ApolloProvider client={apolloClient}>
          <AppNavigator />
        </ApolloProvider>
      )}
      {!user && <AuthNavigator />}
    </NavigationContainer>
  );
}
