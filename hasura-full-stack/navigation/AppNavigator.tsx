import React from 'react';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Home } from '../screens/Home';

export type AppParamList = {
  Home: undefined;
};

export type AppNavProps<T extends keyof AppParamList> = {
  navigation: StackNavigationProp<AppParamList, T>;
  route: RouteProp<AppParamList, T>;
};
const Stack = createStackNavigator<AppParamList>();

export const AppNavigator: React.FC<{}> = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Home' component={Home} />
    </Stack.Navigator>
  );
};
