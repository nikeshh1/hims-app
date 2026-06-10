import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { API_URL } from '../../config/api';
import { Block, Text, Input } from '../../components';
import { useTheme } from '../../hooks';
import { useVendors } from '../../context/VendorContext';

const TrashVendors = () => {
    const { refreshVendors } = useVendors();

    const navigation = useNavigation<any>();

    const { sizes } = useTheme();



    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');



    const fetchTrash = () => {

        setLoading(true);

        fetch(`${API_URL}/vendors/deleted`)
            .then(res => res.json())
            .then(json => {
                setVendors(json.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch deleted vendors:', err);
                setVendors([]);
                setLoading(false);
            });

    };



    useEffect(() => {
        fetchTrash();
    }, []);



    const filteredVendors = useMemo(() => {

        if (!searchQuery.trim()) return vendors;

        const q = searchQuery.toLowerCase();

        return vendors.filter(v =>

            v.vendor_name.toLowerCase().includes(q)
            ||
            (v.phone_number && v.phone_number.includes(q))
            ||
            (v.email && v.email.toLowerCase().includes(q))

        );

    }, [vendors, searchQuery]);



    const restoreVendor = (id: number) => {

        Alert.alert(
            "Restore Vendor",
            "Restore this vendor?",
            [
                { text: "Cancel" },
                {
                    text: "Restore",
                    onPress: () => {

                        fetch(`${API_URL}/vendors/${id}/restore`, {
                            method: 'PUT'
                        })
                            .then(() => {

                                fetchTrash();          // reload trash list
                                refreshVendors();      // reload vendor list

                                Alert.alert("Success", "Vendor restored");

                            })
                            .catch((err) => {
                                console.error('Failed to restore vendor:', err);
                                Alert.alert("Error", "Failed to restore vendor");
                            });

                    }
                }
            ]);

    };



    const deleteVendor = (id: number) => {

        Alert.alert(
            "Permanent Delete",
            "Delete permanently?",
            [
                { text: "Cancel" },
                {
                    text: "Delete",
                    onPress: () => {

                        fetch(`${API_URL}/vendors/${id}/force-delete`, {
                            method: 'DELETE'
                        })
                            .then(() => {

                                fetchTrash();
                                refreshVendors();

                                Alert.alert("Deleted", "Vendor permanently deleted");

                            })
                            .catch((err) => {
                                console.error('Failed to delete vendor:', err);
                                Alert.alert("Error", "Failed to delete vendor");
                            });

                    }
                }
            ]);

    };



    const renderItem = ({ item }: any) => (

        <View style={styles.card}>


            <View style={styles.cardHeader}>

                <Text bold size={15} style={{ flex: 1 }}>
                    {item.vendor_name}
                </Text>


                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                item.status === 'Active'
                                    ? '#e6f4ea'
                                    : '#fce8e6'
                        }
                    ]}
                >

                    <Text
                        bold
                        size={11}
                        color={
                            item.status === 'Active'
                                ? '#1e8e3e'
                                : '#d93025'
                        }
                    >

                        {item.status}

                    </Text>

                </View>

            </View>



            {item.phone_number && (
                <Text gray size={13} style={{ marginTop: 4 }}>
                    📞 {item.phone_number}
                </Text>
            )}

            {item.email && (
                <Text gray size={13} style={{ marginTop: 2 }}>
                    ✉️ {item.email}
                </Text>
            )}

            {item.address && (
                <Text gray size={13} style={{ marginTop: 2 }}>
                    📍 {item.address}
                </Text>
            )}



            <View style={styles.cardActions}>


                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#e8f5e9' }]}
                    onPress={() => restoreVendor(item.id)}
                >

                    <Text bold size={12} color="#2e7d32">
                        Restore
                    </Text>

                </TouchableOpacity>



                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#fce4ec' }]}
                    onPress={() => deleteVendor(item.id)}
                >

                    <Text bold size={12} color="#c62828">
                        Delete
                    </Text>

                </TouchableOpacity>



            </View>

        </View>

    );



    return (

        <Block safe>

            <Block paddingHorizontal={sizes.padding} style={{ flex: 1 }}>


                {/* HEADER */}

                <View style={styles.header}>

                    <Text bold size={20}>
                        Deleted Vendors
                    </Text>

                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >

                        <Text bold color="#fff">
                            Back
                        </Text>

                    </TouchableOpacity>

                </View>



                {/* SEARCH */}

                <View style={styles.searchBox}>

                    <Input
                        search
                        placeholder="Search deleted vendors..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />

                </View>



                {/* LIST */}

                {loading ?

                    <View style={styles.center}>

                        <ActivityIndicator size="large" color="#cb0c9f" />

                        <Text gray style={{ marginTop: 10 }}>
                            Loading deleted vendors...
                        </Text>

                    </View>

                    :

                    filteredVendors.length === 0 ?

                        <View style={styles.center}>

                            <Text gray size={16}>
                                No deleted vendors
                            </Text>

                        </View>

                        :

                        <FlatList
                            data={filteredVendors}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />

                }


            </Block>

        </Block>

    )

}



const styles = StyleSheet.create({

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 10
    },

    backBtn: {
        backgroundColor: '#6c757d',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8
    },

    searchBox: {
        marginBottom: 10,
        backgroundColor: '#f7f7f7',
        borderRadius: 10,
        paddingHorizontal: 6
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12
    },

    cardActions: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8
    },

    actionBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }

});


export default TrashVendors;