
import React, {useState} from 'react';
import {FlatList, Alert} from 'react-native';
import {Block, Text, Switch, Button} from '../components';
import {useRoute} from '@react-navigation/native';

const FYHospitalMapping = () => {
  const route: any = useRoute();
  const fy = route.params?.fy;

  const [hospitals, setHospitals] = useState([
    {id: '1', name: 'City Hospital', mapped: true},
    {id: '2', name: 'Sunrise Clinic', mapped: false},
    {id: '3', name: 'Care Medical Center', mapped: true},
    {id: '4', name: 'Metro Hospital', mapped: false},
  ]);

  const toggleMap = (id: string) => {
    setHospitals(prev =>
      prev.map(h =>
        h.id === id ? {...h, mapped: !h.mapped} : h,
      ),
    );
  };

  const renderItem = ({item}: any) => (
    <Block
      style={{
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 14,
        borderRadius: 14,
        elevation: 3,
      }}
      row
      justify="space-between"
      align="center">

      <Block>
        <Text bold size={15}>
          {item.name}
        </Text>
        <Text gray size={12}>
          Map to this financial year
        </Text>
      </Block>

      <Switch
        checked={item.mapped}
        onPress={() => toggleMap(item.id)}
      />
    </Block>
  );

  return (
    <Block safe padding={16}>
      {/* HEADER */}
      <Block marginBottom={20}>
        <Text bold size={20}>
          {fy?.name}
        </Text>
        <Text gray size={13}>
          Select hospitals for this financial year
        </Text>
      </Block>

      {/* LIST */}
      <FlatList
        data={hospitals}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />

      {/* SAVE BUTTON UI ONLY */}
      <Button
        style={{
          backgroundColor: '#8e2de2',
          marginTop: 10,
          paddingVertical: 12,
          borderRadius: 10,
        }}
        onPress={() => Alert.alert('Saved (UI only)')}>
        <Text style={{color: '#fff', fontWeight: 'bold', textAlign: 'center'}}>
          Save Mapping
        </Text>
      </Button>
    </Block>
  );
};

export default FYHospitalMapping;
