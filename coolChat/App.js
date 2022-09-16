/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  Button,
  View,
  TextInput,
} from 'react-native';
import {fetchUsers} from './api/api';
import io from 'socket.io-client';

const socket = io('http://localhost:8002');

const UsersList = ({users, selectedUserLogin, handleSelectedUser}) => {
  console.log(users);
  return (
    <View style={styles.sectionContainer}>
      {selectedUserLogin
        ? users
            ?.filter(user_ => user_?.id != selectedUserLogin)
            .map(user => (
              <Text
                onPress={() => handleSelectedUser(user)}
                style={{margin: 15, fontSize: 24}}>
                {user?.name}
              </Text>
            ))
        : users?.map(user => (
            <Text
              onPress={() => handleSelectedUser(user)}
              style={{margin: 15, fontSize: 24}}>
              {user?.name}
            </Text>
          ))}
    </View>
  );
};

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [users, setUsers] = useState(null);
  const [selectedUserLogin, setSelectedUserLogin] = useState(null);
  const [userToTalkTo, setUserToTalkTo] = useState();
  const [messagesList, setMessagesList] = useState([]);
  const [text, onChangeText] = useState('');

  useEffect(() => {
    fetchUsers().then(users => setUsers(users));
    return () => {};
  }, []);

  useEffect(() => {
    socket.on('connection', () => {
      console.log('connection!');
    });
    socket.on('disconnect', () => {
      console.log('disconnected');
    });
    socket.on('reconnect', () => {
      socket.emit('sign-in', selectedUserLogin);
    });

    return () => {
      socket.off('connect');
      socket.off('reconnect');
      socket.off('disconnect');
    };
  }, []);

  useEffect(() => {
    socket.on('message', message => {
      let messageData = message.message;
      if (message.from == selectedUserLogin?.id) {
        messageData.position = 'right';
      } else {
        messageData.position = 'left';
      }
      console.log(
        'message received : ',
        message,
        'formatted message',
        messageData,
      );
      setMessagesList(prev_msgs => [...prev_msgs, messageData]);
    });

    return () => {
      socket.off('message');
    };
    // because useeffect reference old value of selectedUserLogin, it is always only the initial state
  }, [selectedUserLogin]);

  const sendMessage = () => {
    let message = {
      to: userToTalkTo.id,
      message: {
        type: 'text',
        text: text,
        date: +new Date(),
        className: 'message',
      },
      from: selectedUserLogin?.id,
    };
    console.log('message sent', message);
    socket.emit('message', message);
    onChangeText('');
  };

  return (
    <SafeAreaView>
      <StatusBar barStyle={'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {!selectedUserLogin && (
          <>
            <Text style={{margin: 15, fontSize: 24, color: 'red'}}>
              select a user to login as
            </Text>
            <UsersList
              users={users}
              handleSelectedUser={user => {
                setSelectedUserLogin(user);
                socket.emit('sign-in', user);
              }}
            />
          </>
        )}
        {selectedUserLogin ? (
          <Text style={{margin: 15, fontSize: 24, color: 'green'}}>
            you're logged in as {selectedUserLogin?.name}{' '}
            {selectedUserLogin?.id}
          </Text>
        ) : null}
        {selectedUserLogin && !userToTalkTo ? (
          <>
            <Text
              style={{
                margin: 15,
                marginBottom: -15,
                fontSize: 24,
                color: 'red',
              }}>
              select a user to talk to
            </Text>
            <UsersList
              users={users}
              selectedUserLogin={selectedUserLogin?.id}
              handleSelectedUser={user => setUserToTalkTo(user)}
            />
          </>
        ) : null}
        {selectedUserLogin ? (
          <>
            <Text style={{margin: 15, fontSize: 24, color: 'blue'}}>
              You're talking to {userToTalkTo?.name} {userToTalkTo?.id}
            </Text>
          </>
        ) : null}
        {messagesList?.map(msg => (
          <Text
            style={{
              margin: 15,
              fontSize: 24,
              color: 'black',
              backgroundColor: 'pink',
              textAlign: msg?.position,
            }}>
            {msg?.text}
          </Text>
        ))}
        {userToTalkTo ? (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TextInput
              style={styles.input}
              onChangeText={onChangeText}
              value={text}
            />
            <Button title="Send" onPress={() => sendMessage()} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '50%',
  },
});

export default App;
