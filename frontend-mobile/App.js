import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import AuthForm from './AuthForm';
import PingTest from './PingTest';
import Chat from './Chat';
import StripeDemo from './StripeDemo';
import OrderDemo from './OrderDemo';
import StripeWrapper from './StripeWrapper';

export default function App() {
  const userId = "ID_USER_AUTENTIFICAT"; // Înlocuiește cu id-ul real după login
  return (
    <SafeAreaView>
      <Text style={{fontSize: 24, margin: 20}}>MicroJobs Mobile</Text>
      <AuthForm />
      <Chat />
      <StripeDemo />
      <OrderDemo userId={userId} />
      {/* ...restul aplicației... */}
      {active === 'order' && <StripeWrapper userId={userId} />}
    </SafeAreaView>
  );
}