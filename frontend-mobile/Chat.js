import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:5000');
    ws.current.onmessage = e => setMessages(msgs => [...msgs, e.data]);
    return () => ws.current.close();
  }, []);

  const send = () => {
    if (input && ws.current) {
      ws.current.send(input);
      setInput('');
    }
  };

  return (
    <View style={{margin:20, borderWidth:1, borderColor:'#ccc', padding:10}}>
      <Text style={{fontWeight:'bold'}}>Chat</Text>
      <ScrollView style={{height:100, backgroundColor:'#fafafa', marginBottom:8}}>
        {messages.map((m,i) => <Text key={i}>{m}</Text>)}
      </ScrollView>
      <TextInput value={input} onChangeText={setInput} placeholder="Scrie un mesaj..." style={{borderWidth:1, marginBottom:8, padding:6}} onSubmitEditing={send} />
      <Button title="Trimite" onPress={send} />
    </View>
  );
}
