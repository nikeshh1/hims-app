
import React, {useCallback, useState} from 'react';
import {useNavigation} from '@react-navigation/native';

import {useData, useTheme, useTranslation} from '../hooks/';
import {Block, Input, Text} from '../components/';

const Home = () => {
  const navigation = useNavigation<any>();
  const {t} = useTranslation();
  const [tab, setTab] = useState<number>(0);
  const {following, trending} = useData();
  const [products, setProducts] = useState(following);
  const {assets, colors, fonts, gradients, sizes} = useTheme();

  const handleProducts = useCallback(
    (tab: number) => {
      setTab(tab);
      setProducts(tab === 0 ? following : trending);
    },
    [following, trending],
  );

  return (
    <Block>
      {/* SEARCH BAR */}
      <Block color={colors.card} flex={0} padding={sizes.padding}>
        <Input search placeholder={t('common.search')} />
      </Block>

      {/* SCROLL AREA */}
      <Block
        scroll
        paddingHorizontal={sizes.padding}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: sizes.l}}>

        {/* INFO CARD */}
        <Block
          style={{
            backgroundColor: '#ffffff',
            padding: 16,
            borderRadius: 14,
            marginTop: 16,
            elevation: 3,
          }}>
          <Text bold size={16} marginBottom={6}>
            Welcome 👋
          </Text>
        </Block>

      </Block>
    </Block>
  );
};

export default Home;


