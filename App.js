import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Button, Text, Card, Title, Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'chromebook_counts';

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function App() {
  const [counts, setCounts] = useState({});
  const [todayCount, setTodayCount] = useState(0);
  const [average, setAverage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editCount, setEditCount] = useState('');
  const [isAddMode, setIsAddMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        const parsed = JSON.parse(data);
        setCounts(parsed);
        setTodayCount(parsed[getToday()] || 0);
        updateAverage(parsed);
      }
    });
  }, []);

  function updateAverage(data) {
    const values = Object.values(data);
    if (values.length === 0) {
      setAverage(0);
    } else {
      setAverage((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
    }
  }

  async function handleTap() {
    const today = getToday();
    const newCount = (counts[today] || 0) + 1;
    const newCounts = { ...counts, [today]: newCount };
    setCounts(newCounts);
    setTodayCount(newCount);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCounts));
    updateAverage(newCounts);
  }

  function openEditModal(date, count) {
    setEditDate(date);
    setEditCount(count.toString());
    setIsAddMode(false);
    setModalVisible(true);
  }

  function openAddModal() {
    setEditDate('');
    setEditCount('');
    setIsAddMode(true);
    setModalVisible(true);
  }

  async function saveEdit() {
    if (!editDate || isNaN(Number(editCount))) return;
    const newCounts = { ...counts, [editDate]: Number(editCount) };
    setCounts(newCounts);
    if (editDate === getToday()) setTodayCount(Number(editCount));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCounts));
    updateAverage(newCounts);
    setModalVisible(false);
  }

  async function saveAdd() {
    if (!editDate || isNaN(Number(editCount))) return;
    const newCounts = { ...counts, [editDate]: Number(editCount) };
    setCounts(newCounts);
    if (editDate === getToday()) setTodayCount(Number(editCount));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCounts));
    updateAverage(newCounts);
    setModalVisible(false);
  }

  async function deleteDay(date) {
    const newCounts = { ...counts };
    delete newCounts[date];
    setCounts(newCounts);
    if (date === getToday()) setTodayCount(0);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCounts));
    updateAverage(newCounts);
  }

  function renderItem({ item }) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.date}</Title>
          <Text>Count: {item.count}</Text>
          <Button mode="outlined" onPress={() => openEditModal(item.date, item.count)} style={styles.editButton}>
            Edit
          </Button>
          <Button mode="text" onPress={() => deleteDay(item.date)} style={styles.deleteButton}>
            Delete
          </Button>
        </Card.Content>
      </Card>
    );
  }

  const data = Object.entries(counts)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, count]) => ({ date, count }));

return (
  <PaperProvider>
    <View style={styles.container}>
      <Text style={styles.header}>Chromebook Counter</Text>
      <Text>Today's Count: {todayCount}</Text>
      <TouchableOpacity style={styles.circleButton} onPress={handleTap}>
        <Text style={styles.circleButtonText}>Add One</Text>
      </TouchableOpacity>
      <Text style={styles.average}>Average per day: {average}</Text>
      <Button mode="contained" onPress={openAddModal} style={[styles.addButton, styles.buttonShadow]}>
        Add Day
      </Button>
      <Text style={styles.subheader}>History</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.date}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isAddMode ? 'Add Day' : 'Edit Count'}</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={editDate}
              onChangeText={setEditDate}
              editable={isAddMode}
            />
            <TextInput
              style={styles.input}
              placeholder="Count"
              value={editCount}
              onChangeText={setEditCount}
              keyboardType="numeric"
            />
            <Button mode="contained" onPress={isAddMode ? saveAdd : saveEdit} style={styles.buttonShadow}>
              Save
            </Button>
            <Button mode="text" onPress={() => setModalVisible(false)} style={styles.buttonShadow}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  </PaperProvider>
);
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#121212' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#fff'},
  subheader: { fontSize: 18, marginTop: 20, marginBottom: 5 , color: '#fff' },
  average: { fontSize: 16, marginVertical: 10, color:'#fff'},
  card: { marginVertical: 4 , color: '#ff63ea'},
  circleButton: {
    width: 174,
    height: 174,
    borderRadius: 87,
    backgroundColor: '#ff63ea',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  circleButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: { marginVertical: 10 },
  editButton: { marginTop: 8 },
  deleteButton: {
    marginTop: 4,
    color: '#ff63ea',
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84, 
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    margin: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 6,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
}); //
