import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../../config/api';
import { Block, Text } from '../../components';
import { useTheme } from '../../hooks';

const ViewVendor = () => {

    const navigation = useNavigation<any>();
    const route: any = useRoute();

    const { sizes } = useTheme();

    const { id } = route.params;

    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        fetch(`${API_URL}/vendors/${id}`)
            .then(res => res.json())
            .then(json => {
                setVendor(json.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch vendor:', err);
                setLoading(false);
            });

    }, [id]);



    if (loading) {

        return (

            <Block safe center>

                <ActivityIndicator size="large" color="#cb0c9f" />

            </Block>

        )

    }



    return (

        <Block safe>

            <Block paddingHorizontal={sizes.padding}>

                <Text bold size={20} marginTop={16}>
                    Vendor Details
                </Text>



                <View style={styles.card}>


                    <View style={styles.cardHeader}>

                        <Text bold size={16} style={{ flex: 1 }}>
                            {vendor.vendor_name}
                        </Text>


                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor:
                                        vendor.status === 'Active'
                                            ? '#e6f4ea'
                                            : '#fce8e6'
                                }
                            ]}
                        >

                            <Text
                                bold
                                size={11}
                                color={
                                    vendor.status === 'Active'
                                        ? '#1e8e3e'
                                        : '#d93025'
                                }
                            >

                                {vendor.status}

                            </Text>

                        </View>

                    </View>



                    <Text gray marginTop={6}>
                        📞 {vendor.phone_number}
                    </Text>

                    <Text gray marginTop={4}>
                        ✉️ {vendor.email}
                    </Text>

                    <Text gray marginTop={4}>
                        📍 {vendor.address}
                    </Text>



                    <View style={styles.cardActions}>

                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]}
                            onPress={() => navigation.navigate('AddVendor', { editData: vendor })}
                        >

                            <Text bold size={12} color="#1565c0">
                                Edit
                            </Text>

                        </TouchableOpacity>



                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#eee' }]}
                            onPress={() => navigation.goBack()}
                        >

                            <Text bold size={12}>
                                Cancel
                            </Text>

                        </TouchableOpacity>



                    </View>

                </View>

            </Block>

        </Block>

    )

}



const styles = StyleSheet.create({

    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        elevation: 2
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12
    },

    cardActions: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 8
    },

    actionBtn: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 6
    }

})

export default ViewVendor;