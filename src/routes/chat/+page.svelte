<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_STUN_SERVER1, PUBLIC_STUN_SERVER2, PUBLIC_WS_URL } from '$env/static/public';
	import { siteTitle } from '$lib/stores';
	import type { PageData } from './$types';
	import { GeneratePostId } from '$lib';
	import { dbb } from '$lib/dbb';
	import { liveQuery } from 'dexie';
	import { browser } from '$app/environment';

	let { data }: { data: PageData } = $props();
	siteTitle.set('P2P Chat with Auto-Discovery');

	let ws;
	const connections = new Map();
	const dataChannels = new Map();
	let pendingCandidates = new Map();

	let local_id: HTMLElement;
	let messagesDiv: HTMLElement;
	let peerList: HTMLElement;
	let messageInput: HTMLElement;

	// let userId = Math.random().toString(36).slice(2, 10);
	const USER_ID_KEY_IN_LOCAL_STORAGE = 'chat-user-id-v1';
	let userId = $state();
	if (data.user && data.user.username !== 'guest') {
		userId = data.user.username;
	}

	function sendMessage() {
		const message = messageInput.value.trim();
		if (!message) return;

		let sentToAnyPeer = false;
		let to_send = {
			id: GeneratePostId(),
			sender: `user:${userId}`,
			receiver: 'channel:default',
			msg: message,
			created_at: Date.now()
		};
		let to_send_str = JSON.stringify(to_send);
		dataChannels.forEach((channel, peerId) => {
			if (channel.readyState === 'open') {
				channel.send(to_send_str);
				sentToAnyPeer = true;
			}
		});

		if (sentToAnyPeer) {
			displayMessage(to_send);
			storeMessage(to_send);
			messageInput.value = '';
		} else {
			displayStatus('No connected peers to send message to');
		}
	}

	function storeMessage(obj) {
		// const messages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
		// messages.push({ user_id, message });
		// localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
		console.log('to store msg', obj);
		dbb.msgs.add(obj);
	}

	// let msgs = liveQuery(() =>
	// 	dbb.msgs.orderBy('created_at').filter(t => t.receiver === 'channel:default').toArray()
	// );
	// let msgs = [];

	function displayStoredMessages() {
		dbb.msgs.orderBy('created_at').filter(t => t.receiver === 'channel:default').each(msg => {
			displayMessage(msg);
		});
	}

	function displayMessage(obj) {
		const messageElement = document.createElement('div');
		messageElement.className = 'message';
		let display_sender = obj.sender === `user:${userId}` ? 'You' : obj.sender;
		messageElement.innerHTML = `
                <span class="text-gray-500 text-sm">${new Date(obj.created_at).toLocaleString()}</span>
                <strong>${display_sender}:</strong> ${obj.msg}
            `;

		messagesDiv.appendChild(messageElement);
		messagesDiv.scrollTop = messagesDiv.scrollHeight;
		console.log('displayed message:', obj);
	}

	function displayStatus(message) {
		if (!messagesDiv) return;
		const statusElement = document.createElement('div');
		statusElement.className = 'status text-gray-600 italic';
		statusElement.textContent = message;
		messagesDiv.appendChild(statusElement);
		messagesDiv.scrollTop = messagesDiv.scrollHeight;
	}

	const rtc_peer_conn_config = {
		iceServers: [
			{ urls: `stun:${PUBLIC_STUN_SERVER1}` },
			{ urls: `stun:${PUBLIC_STUN_SERVER2}` },
			{ urls: 'stun:stun.cloudflare.com:3478' },
			{ urls: 'stun:stun.l.google.com:19302' }
		]
	};

	function connectToSignalingServer() {
		ws = new WebSocket(PUBLIC_WS_URL);

		ws.onopen = () => {
			displayStatus('Connected to signaling server');
			ws.send(JSON.stringify({
				type: 'register',
				userId: userId
			}));
		};

		ws.onmessage = async (event) => {
			const message = JSON.parse(event.data);

			switch (message.type) {
				case 'peers':
					// Connect to all existing peers
					for (const peerId of message.peers) {
						if (!connections.has(peerId)) {
							await initiatePeerConnection(peerId);
						}
					}
					break;

				case 'peer-joined':
					displayStatus(`Peer ${message.userId} joined`);
					break;

				case 'peer-left':
					displayStatus(`Peer ${message.userId} left`);
					cleanupPeerConnection(message.userId);
					updatePeerList();
					break;

				case 'offer':
					await handleOffer(message);
					break;

				case 'answer':
					await handleAnswer(message);
					// Process any pending candidates
					const candidates = pendingCandidates.get(message.from) || [];
					for (const candidate of candidates) {
						await handleIceCandidate({ from: message.from, data: candidate });
					}
					pendingCandidates.delete(message.from);
					break;

				case 'ice-candidate':
					const peerConnection = connections.get(message.from);
					if (peerConnection?.remoteDescription) {
						await handleIceCandidate(message);
					} else {
						// Store candidate for later
						if (!pendingCandidates.has(message.from)) {
							pendingCandidates.set(message.from, []);
						}
						pendingCandidates.get(message.from).push(message.data);
					}
					break;
			}
		};

		ws.onclose = () => {
			displayStatus('Disconnected from signaling server. Retrying in 5 seconds...');
			setTimeout(connectToSignalingServer, 5000);
		};
	}

	async function initiatePeerConnection(peerId) {
		console.log(`Initiating connection to peer ${peerId}`);
		const peerConnection = new RTCPeerConnection(rtc_peer_conn_config);
		connections.set(peerId, peerConnection);

		const dataChannel = peerConnection.createDataChannel('chat');
		setupDataChannel(dataChannel, peerId);

		peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				ws.send(JSON.stringify({
					type: 'ice-candidate',
					target: peerId,
					data: event.candidate
				}));
			}
		};

		peerConnection.oniceconnectionstatechange = () => {
			console.log(`ICE connection state with ${peerId}: ${peerConnection.iceConnectionState}`);
			updatePeerList();
		};

		try {
			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);
			ws.send(JSON.stringify({
				type: 'offer',
				target: peerId,
				data: offer
			}));
		} catch (error) {
			console.error('Error creating offer:', error);
			cleanupPeerConnection(peerId);
		}
	}

	async function handleOffer(message) {
		console.log(`Handling offer from peer ${message.from}`);
		const peerConnection = new RTCPeerConnection(rtc_peer_conn_config);
		connections.set(message.from, peerConnection);

		peerConnection.ondatachannel = (event) => {
			setupDataChannel(event.channel, message.from);
		};

		peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				ws.send(JSON.stringify({
					type: 'ice-candidate',
					target: message.from,
					data: event.candidate
				}));
			}
		};

		peerConnection.oniceconnectionstatechange = () => {
			console.log(`ICE connection state with ${message.from}: ${peerConnection.iceConnectionState}`);
			updatePeerList();
		};

		try {
			await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
			const answer = await peerConnection.createAnswer();
			await peerConnection.setLocalDescription(answer);
			ws.send(JSON.stringify({
				type: 'answer',
				target: message.from,
				data: answer
			}));
		} catch (error) {
			console.error('Error handling offer:', error);
			cleanupPeerConnection(message.from);
		}
	}

	async function handleAnswer(message) {
		console.log(`Handling answer from peer ${message.from}`);
		const peerConnection = connections.get(message.from);
		if (peerConnection) {
			try {
				await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
			} catch (error) {
				console.error('Error handling answer:', error);
				cleanupPeerConnection(message.from);
			}
		}
	}

	async function handleIceCandidate(message) {
		const peerConnection = connections.get(message.from);
		if (peerConnection) {
			try {
				await peerConnection.addIceCandidate(new RTCIceCandidate(message.data));
			} catch (error) {
				console.error('Error handling ICE candidate:', error);
			}
		}
	}

	function setupDataChannel(channel, peerId) {
		dataChannels.set(peerId, channel);

		channel.onopen = () => {
			displayStatus(`Connected to peer ${peerId}`);
			updatePeerList();
		};

		channel.onclose = () => {
			displayStatus(`Disconnected from peer ${peerId}`);
			cleanupPeerConnection(peerId);
			updatePeerList();
		};

		channel.onmessage = event => {
			let data_recv = JSON.parse(event.data);
			displayMessage(data_recv);
			storeMessage(data_recv);
		};
	}

	function cleanupPeerConnection(peerId) {
		console.log(`Cleaning up connection with peer ${peerId}`);
		const connection = connections.get(peerId);
		if (connection) {
			connection.close();
			connections.delete(peerId);
		}
		const channel = dataChannels.get(peerId);
		if (channel) {
			channel.close();
			dataChannels.delete(peerId);
		}
		updatePeerList();
	}

	function updatePeerList() {
		if (!peerList) return;
		peerList.innerHTML = '';

		connections.forEach((connection, peerId) => {
			const peerDiv = document.createElement('div');
			peerDiv.className = 'peer flex items-center mb-2';
			const isConnected = connection.iceConnectionState === 'connected';
			peerDiv.innerHTML = `
                    <span class="${isConnected ? 'connected text-green-500' : 'disconnected text-red-500'}">●</span>
                    ${peerId} (${connection.iceConnectionState})
                `;
			peerList.appendChild(peerDiv);
		});

		if (connections.size === 0) {
			peerList.innerHTML = '<div class="p-1 my-0.5">No peers connected</div>';
		}
	}

	onMount(() => {

		if (browser) {
			// if( !( navigator.getUserMedia || navigator.webkitGetUserMedia ||
			// 	 navigator.msGetUserMedia) ) {
			if (window.RTCPeerConnection === undefined) {
				alert("Chat requires WebRTC, which is not supported by your browser.");
				return
			}
			if (!userId) {
				userId = localStorage.getItem(USER_ID_KEY_IN_LOCAL_STORAGE);
				if (!userId) {
					userId = Math.random().toString(36).slice(2, 10);
					userId = `Guest-${userId}`;
					localStorage.setItem(USER_ID_KEY_IN_LOCAL_STORAGE, userId);
				}
			}
			messageInput.addEventListener('keypress', event => {
				if (event.key === 'Enter') {
					sendMessage();
				}
			});
			displayStoredMessages();
			connectToSignalingServer();
		}
	});
</script>

<div class="max-w-2xl mx-auto my-0.5 p-5">
	<div class="bg-secondary-100 dark:bg-primary-950 p-3 mb-2 rounded">
		Your ID: <strong>{userId}</strong>
	</div>
	<div class="max-h-40 bg-gray-100 dark:bg-gray-900 p-3 mb-2 rounded overflow-y-auto">
		<h3 class="font-semibold mb-2">Active Peers</h3>
		<div bind:this={peerList}></div>
	</div>
	<h3 class="font-semibold mb-2">Messages</h3>
	<div bind:this={messagesDiv} class="min-h-32 max-h-64 border border-gray-300 overflow-y-auto mb-3 p-3">
		<!--{#each $msgs as msg}-->
		<!--	<div class="message">-->
		<!--		<span class="text-gray-500 text-sm">{new Date(msg.created_at).toLocaleString()}</span>-->
		<!--		<strong>{msg.sender === `user:${userId}` ? 'You' : msg.sender}</strong>-->
		<!--		{msg.msg}-->
		<!--	</div>-->
		<!--{/each}-->
	</div>
	<div class="w-full mb-1 mt-auto">
		<input type="text" bind:this={messageInput} placeholder="Type a message..." class="flex-grow p-2 border
		border-gray-300 rounded-l dark:bg-gray-800">
		<button onclick={sendMessage} class="p-2 bg-secondary-200 dark:bg-secondary-800 rounded-r">Send</button>
	</div>
</div>

<style>
    :global {
        .message:nth-child(odd) {
            background: #f9f9f9;
        }

        .dark {
            .message:nth-child(odd) {
                background: #272e39;
            }
        }

        .message {
            margin: 5px 0;
            padding: 5px;
            border-radius: 4px;
        }
    }
</style>
