import React, { useState } from 'react';
import { View, TextInput, Button, Text, Picker } from 'react-native';
import { apiRegister, apiLogin } from './utils/api';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'beneficiar' });
  const [msg, setMsg] = useState('');

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    setMsg('');
    try {
      if (isLogin) {
        const res = await apiLogin({ email: form.email, password: form.password });
        setMsg(res.token ? 'Login reușit!' : res.error);
      } else {
        const res = await apiRegister(form);
        setMsg(res.message || res.error);
      }
    } catch (err) {
      setMsg('Eroare server');
    }
  };

  return (
    <View style={{margin: 20}}>
      <Text style={{fontSize: 20, marginBottom: 10}}>{isLogin ? 'Autentificare' : 'Înregistrare'}</Text>
      {!isLogin && (
        <TextInput placeholder="Nume" value={form.name} onChangeText={v => handleChange('name', v)} style={{borderWidth:1, marginBottom:8, padding:6}} />
      )}
      <TextInput placeholder="Email" value={form.email} onChangeText={v => handleChange('email', v)} style={{borderWidth:1, marginBottom:8, padding:6}} />
      <TextInput placeholder="Parolă" value={form.password} onChangeText={v => handleChange('password', v)} secureTextEntry style={{borderWidth:1, marginBottom:8, padding:6}} />
      {!isLogin && (
        <Picker selectedValue={form.role} onValueChange={v => handleChange('role', v)} style={{marginBottom:8}}>
          <Picker.Item label="Beneficiar" value="beneficiar" />
          <Picker.Item label="Prestator" value="prestator" />
        </Picker>
      )}
      <Button title={isLogin ? 'Login' : 'Înregistrează-te'} onPress={handleSubmit} />
      <Button title={isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Login'} onPress={() => setIsLogin(l => !l)} />
      {!!msg && <Text style={{marginTop:10, color:'green'}}>{msg}</Text>}
    </View>
  );
}
