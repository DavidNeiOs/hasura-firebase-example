import React from 'react';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Signup } from '../screens/Signup';
import { Login } from '../screens/Login';

export type AuthParamList = {
  Signup: undefined;
  Login: undefined;
};

export type AuthNavProps<T extends keyof AuthParamList> = {
  navigation: StackNavigationProp<AuthParamList, T>;
  route: RouteProp<AuthParamList, T>;
};
const Stack = createStackNavigator<AuthParamList>();

export const AuthNavigator: React.FC<{}> = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Signup' component={Signup} />
      <Stack.Screen name='Login' component={Login} />
    </Stack.Navigator>
  );
};
