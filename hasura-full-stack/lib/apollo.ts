import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/link-context';
// Make sure you create a new environment variable
// that points to your graphql endpoint
import { GRAPHQL_API_URL } from 'react-native-dotenv';

import Firebase from './firebase';

// This is where the magic happens, this function
// is called every time we make a request to our Hasura
// database. And because of that, we always get a fresh
// token. This way, we never run into issues with expired tokens
const asyncAuthLink = setContext(async () => {
  return {
    headers: {
      // added the exclamation mark since we only ping hasura if the user is logged in
      Authorization: `Bearer ${await Firebase.auth().currentUser!.getIdToken()}`,
    },
  };
});

const httpLink = new HttpLink({
  uri: GRAPHQL_API_URL,
});

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: asyncAuthLink.concat(httpLink),
});
