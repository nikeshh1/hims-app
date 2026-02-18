
import React, {useState} from 'react';
import {Alert, ScrollView} from 'react-native';
import {Block, Button, Input, Text, Switch} from '../components';
import {useNavigation} from '@react-navigation/native';

const AddFinancialYear = () => {
  const navigation: any = useNavigation();

  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [active, setActive] = useState(true);

  const handleSave = () => {
    const newFY = {
      id: Date.now().toString(),
      name,
      start,
      end,
      status: active ? 'Active' : 'Inactive',
    };

    Alert.alert('Success', 'Financial year created successfully');
    navigation.navigate('FinancialYears', {newFY});
  };

  return (
    <ScrollView contentContainerStyle={{padding: 16}}>
      
      {/* HEADER */}
      <Block marginBottom={20}>
        <Text bold size={20}>Add Financial Year</Text>
        <Text gray size={13}>Create and manage financial year</Text>
      </Block>

      {/* CARD */}
      <Block
        style={{
          backgroundColor: '#fff',
          padding: 18,
          borderRadius: 14,
          elevation: 3,
        }}>

        <Input
          placeholder="Financial Year (2024-2025)"
          value={name}
          onChangeText={setName}
          marginBottom={14}
        />

        <Input
          placeholder="Start Date"
          value={start}
          onChangeText={setStart}
          marginBottom={14}
        />

        <Input
          placeholder="End Date"
          value={end}
          onChangeText={setEnd}
          marginBottom={18}
        />

        {/* STATUS */}
        <Block row justify="space-between" align="center" marginBottom={20}>
          <Text bold>Status</Text>
          <Switch checked={active} onPress={() => setActive(!active)} />
        </Block>

        {/* BUTTONS INSIDE CARD */}
        <Block row justify="space-between">
          <Button
            style={{
              backgroundColor: '#e0e0e0',
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 8,
            }}
            onPress={() => navigation.goBack()}>
            <Text bold>Cancel</Text>
          </Button>

          <Button
            style={{
              backgroundColor: '#8e2de2',
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 8,
            }}
            onPress={handleSave}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Save</Text>
          </Button>
        </Block>

      </Block>
    </ScrollView>
  );
};

export default AddFinancialYear;

