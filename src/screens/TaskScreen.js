import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const TaskScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('Low');
  const [filter, setFilter] = useState('All');
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(collection(db, `users/${user.uid}/tasks`), (snapshot) => {
        const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(fetchedTasks);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const addTask = async () => {
    if (newTask.trim() === '') return;
    await addDoc(collection(db, `users/${user.uid}/tasks`), {
      title: newTask,
      priority: priority,
      completed: false,
      createdAt: new Date()
    });
    setNewTask('');
  };

  const toggleTaskCompletion = async (taskId, completed) => {
    await updateDoc(doc(db, `users/${user.uid}/tasks/${taskId}`), {
      completed: !completed
    });
  };

  const deleteTask = async (taskId) => {
    await deleteDoc(doc(db, `users/${user.uid}/tasks/${taskId}`));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Completed') return task.completed;
    if (filter === 'Incomplete') return !task.completed;
    return task.priority === filter;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Tasks</Text>
      <TextInput 
        placeholder="Add a new task"
        value={newTask}
        onChangeText={setNewTask}
        style={styles.input}
      />
      <Picker
        selectedValue={priority}
        style={styles.picker}
        onValueChange={(itemValue) => setPriority(itemValue)}
      >
        <Picker.Item label="Low" value="Low" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="High" value="High" />
      </Picker>
      <TouchableOpacity onPress={addTask} style={styles.addButton}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
      
      <Picker
        selectedValue={filter}
        style={styles.picker}
        onValueChange={(itemValue) => setFilter(itemValue)}
      >
        <Picker.Item label="All" value="All" />
        <Picker.Item label="Completed" value="Completed" />
        <Picker.Item label="Incomplete" value="Incomplete" />
        <Picker.Item label="Low Priority" value="Low" />
        <Picker.Item label="Medium Priority" value="Medium" />
        <Picker.Item label="High Priority" value="High" />
      </Picker>
      
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => toggleTaskCompletion(item.id, item.completed)}>
              <Text style={[styles.taskText, item.completed && styles.completedText]}>{item.title}</Text>
              <Text style={styles.priorityText}>{item.priority}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 5,
    elevation: 3,
  },
  taskText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  priorityText: {
    fontSize: 14,
    color: 'blue',
    fontWeight: 'bold',
  },
});

export default TaskScreen;
