
import React, {useEffect, useState} from 'react';
import {FlatList, Alert} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {Block, Text, Button} from '../components';

const FinancialYears = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();

  const [data, setData] = useState([
    {
      id: '1',
      name: 'FY 2024-2025',
      start: '01 Apr 2024',
      end: '31 Mar 2025',
      status: 'Active',
    },
    {
      id: '2',
      name: 'FY 2023-2024',
      start: '01 Apr 2023',
      end: '31 Mar 2024',
      status: 'Inactive',
    },
  ]);

  useEffect(() => {
    if (route.params?.newFY) {
      setData((prev) => [route.params.newFY, ...prev]);
    }
  }, [route.params?.newFY]);

  const renderItem = ({item}: any) => (
    <Button
      style={{marginBottom: 14}}
      onPress={() =>
        navigation.navigate('FYHospitalMapping', {fy: item})
      }>

      <Block
        style={{
          backgroundColor: '#fff',
          padding: 16,
          borderRadius: 14,
          elevation: 3,
        }}>

        <Text bold size={16} marginBottom={4}>
          {item.name}
        </Text>

        <Text gray size={13}>
          {item.start} → {item.end}
        </Text>

        <Block row justify="space-between" align="center" marginTop={12}>
          {/* STATUS */}
          <Block
            style={{
              backgroundColor:
                item.status === 'Active' ? '#e8d3ff' : '#e0e0e0',
              paddingHorizontal: 14,
              paddingVertical: 4,
              borderRadius: 20,
            }}>
            <Text size={12} bold>
              {item.status}
            </Text>
          </Block>

          {/* ACTIONS */}
          <Block row>
            <Text
              marginRight={16}
              onPress={() => {
                Alert.alert('Edit', 'Edit ' + item.name);
              }}>
              ✏️
            </Text>

            <Text
              onPress={() => {
                Alert.alert(
                  'Delete',
                  'Delete ' + item.name + '?',
                  [
                    {text: 'Cancel'},
                    {
                      text: 'Delete',
                      onPress: () => {
                        setData((prev) =>
                          prev.filter((fy) => fy.id !== item.id),
                        );
                      },
                    },
                  ],
                );
              }}>
              🗑
            </Text>
          </Block>
        </Block>
      </Block>
    </Button>
  );

  return (
    <Block safe padding={16}>
      {/* HEADER */}
      <Block
        row
        justify="space-between"
        align="center"
        marginBottom={18}>
        <Text bold size={20}>
          Financial Years
        </Text>

        <Button
          style={{
            backgroundColor: '#8e2de2',
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 8,
          }}
          onPress={() => navigation.navigate('AddFinancialYear')}>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>
            + Add
          </Text>
        </Button>
      </Block>

      {/* LIST */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </Block>
  );
};

export default FinancialYears;
