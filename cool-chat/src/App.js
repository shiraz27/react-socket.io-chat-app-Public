import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';
import { fetchUsers } from './api/api';
import io from 'socket.io-client';

const socket = io('http://localhost:8002');

const UsersList = ({ users, selectedUserLogin, handleSelectedUser }) => {
	console.log(users);
	return (
		<div
			style={{
				marginTop: 32,
				paddingHorizontal: 24,
			}}
		>
			{selectedUserLogin
				? users
						?.filter((user_) => user_?.id != selectedUserLogin)
						.map((user) => (
							<p
								onClick={() => handleSelectedUser(user)}
								style={{ margin: 15, fontSize: 24 }}
							>
								{user?.name}
							</p>
						))
				: users?.map((user) => (
						<p
							onClick={() => handleSelectedUser(user)}
							style={{ margin: 15, fontSize: 24 }}
						>
							{user?.name}
						</p>
				  ))}
		</div>
	);
};

const App = () => {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [users, setUsers] = useState(null);
	const [selectedUserLogin, setSelectedUserLogin] = useState(null);
	const [userToTalkTo, setUserToTalkTo] = useState();
	const [messagesList, setMessagesList] = useState([]);
	const [text, setText] = useState('');
	function handleChange(e) {
		setText(e.target.value);
	}
	useEffect(() => {
		fetchUsers().then((users) => setUsers(users));
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
		socket.on('message', (message) => {
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
				messageData
			);
			setMessagesList((prev_msgs) => [...prev_msgs, messageData]);
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
		setText('');
	};

	return (
		<div contentInsetAdjustmentBehavior="automatic">
			{!selectedUserLogin && (
				<>
					<p style={{ margin: 15, fontSize: 24, color: 'red' }}>
						select a user to login as
					</p>
					<UsersList
						users={users}
						handleSelectedUser={(user) => {
							setSelectedUserLogin(user);
							socket.emit('sign-in', user);
						}}
					/>
				</>
			)}
			{selectedUserLogin ? (
				<p style={{ margin: 15, fontSize: 24, color: 'green' }}>
					you're logged in as {selectedUserLogin?.name} {selectedUserLogin?.id}
				</p>
			) : null}
			{selectedUserLogin && !userToTalkTo ? (
				<>
					<p
						style={{
							margin: 15,
							marginBottom: -15,
							fontSize: 24,
							color: 'red',
						}}
					>
						select a user to talk to
					</p>
					<UsersList
						users={users}
						selectedUserLogin={selectedUserLogin?.id}
						handleSelectedUser={(user) => setUserToTalkTo(user)}
					/>
				</>
			) : null}
			{selectedUserLogin ? (
				<>
					<p style={{ margin: 15, fontSize: 24, color: 'blue' }}>
						You're talking to {userToTalkTo?.name} {userToTalkTo?.id}
					</p>
				</>
			) : null}
			{messagesList?.map((msg) => (
				<p
					style={{
						margin: 15,
						fontSize: 24,
						color: 'black',
						backgroundColor: 'white',
						textAlign: msg?.position,
					}}
				>
					{msg?.text}
				</p>
			))}
			{userToTalkTo ? (
				<div
					style={{
						flexDirection: 'row',
						backgroundColor: 'white',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<input onChange={(e) => handleChange(e)} value={text} type="text" />
					<button type="submit" onClick={() => sendMessage()}>
						SEND
					</button>
				</div>
			) : null}
		</div>
	);
};

export default App;
