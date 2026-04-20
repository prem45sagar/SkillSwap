class VideoConference {
    constructor() {
        this.socket = io();
        this.localStream = null;
        this.peers = new Map();
        this.roomId = null;
        this.userName = null;
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.isChatOpen = false;

        // ICE servers for WebRTC - Adding more STUN/TURN servers for better NAT traversal
        this.iceServers = {
            iceServers: [
                // Google STUN servers
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                
                // Additional STUN servers for better connectivity
                { urls: 'stun:stun.stunprotocol.org:3478' },
                { urls: 'stun:stun.ekiga.net' },
                { urls: 'stun:stun01.sipphone.com' },
                
                // Free TURN servers (note: these are public and may have limitations)
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                }
            ],
            iceCandidatePoolSize: 10
        };

        this.initializeEventListeners();
        this.setupSocketListeners();
    }

    initializeEventListeners() {
        // Landing page
        document.getElementById('new-meeting-btn').addEventListener('click', () => this.showCreateForm());
        document.getElementById('join-meeting-btn').addEventListener('click', () => this.showJoinForm());
        
        // Create meeting form
        document.getElementById('create-btn').addEventListener('click', () => this.createMeeting());
        document.getElementById('back-from-create').addEventListener('click', () => this.showLandingPage());
        document.getElementById('create-user-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createMeeting();
        });

        // Join meeting form
        document.getElementById('join-btn').addEventListener('click', () => this.joinRoom());
        document.getElementById('back-from-join').addEventListener('click', () => this.showLandingPage());
        document.getElementById('user-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });
        document.getElementById('room-id').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });

        // Controls
        document.getElementById('toggle-video').addEventListener('click', () => this.toggleVideo());
        document.getElementById('toggle-audio').addEventListener('click', () => this.toggleAudio());
        document.getElementById('toggle-chat').addEventListener('click', () => this.toggleChat());
        document.getElementById('share-room').addEventListener('click', () => this.shareRoom());
        document.getElementById('connection-help-btn').addEventListener('click', () => this.showConnectionHelp());
        document.getElementById('leave-room').addEventListener('click', () => this.leaveRoom());

        // Chat
        document.getElementById('close-chat').addEventListener('click', () => this.toggleChat());
        
        // Help panel
        document.getElementById('close-help').addEventListener('click', () => this.hideConnectionHelp());
        document.getElementById('send-message').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    setupSocketListeners() {
        this.socket.on('room-joined', (data) => {
            console.log('Room joined:', data);
            this.roomId = data.roomId;
            this.currentUserId = data.yourId;
            
            // Create peer connections for existing users
            console.log(`Creating peer connections for ${data.users.length} existing users`);
            data.users.forEach(user => {
                if (user.id !== this.currentUserId) {
                    console.log(`Creating peer connection for existing user: ${user.name} (${user.id})`);
                    this.createPeerConnection(user.id, user.name, true);
                }
            });
        });

        this.socket.on('user-joined', (user) => {
            console.log('User joined:', user);
            // Only create peer connection if we don't already have one for this user
            if (!this.peers.has(user.id)) {
                this.showToast(`${user.name} joined the meeting`);
                console.log(`Creating peer connection for new user: ${user.name} (${user.id})`);
                this.createPeerConnection(user.id, user.name, false);
            } else {
                console.log(`Peer connection already exists for ${user.id}`);
            }
        });

        this.socket.on('user-left', (data) => {
            this.showToast(`${data.name} left the meeting`);
            this.removePeer(data.id);
        });

        this.socket.on('participants-updated', (users) => {
            this.updateParticipantsList(users);
        });

        this.socket.on('offer', async (data) => {
            console.log(`Received offer from ${data.sender}`);
            const peer = this.peers.get(data.sender);
            if (peer) {
                try {
                    await peer.connection.setRemoteDescription(data.offer);
                    const answer = await peer.connection.createAnswer();
                    await peer.connection.setLocalDescription(answer);
                    this.socket.emit('answer', {
                        answer: answer,
                        target: data.sender
                    });
                    console.log(`Answer sent to ${data.sender}`);
                } catch (error) {
                    console.error(`Error handling offer from ${data.sender}:`, error);
                }
            } else {
                console.warn(`No peer connection found for ${data.sender}`);
            }
        });

        this.socket.on('answer', async (data) => {
            console.log(`Received answer from ${data.sender}`);
            const peer = this.peers.get(data.sender);
            if (peer) {
                try {
                    await peer.connection.setRemoteDescription(data.answer);
                    console.log(`Answer processed from ${data.sender}`);
                } catch (error) {
                    console.error(`Error handling answer from ${data.sender}:`, error);
                }
            } else {
                console.warn(`No peer connection found for ${data.sender}`);
            }
        });

        this.socket.on('ice-candidate', async (data) => {
            const peer = this.peers.get(data.sender);
            if (peer && data.candidate) {
                try {
                    await peer.connection.addIceCandidate(data.candidate);
                    console.log(`ICE candidate added from ${data.sender}`);
                } catch (error) {
                    console.error(`Error adding ICE candidate from ${data.sender}:`, error);
                }
            }
        });

        this.socket.on('user-video-toggle', (data) => {
            this.updatePeerMediaStatus(data.userId, 'video', data.videoEnabled);
        });

        this.socket.on('user-audio-toggle', (data) => {
            this.updatePeerMediaStatus(data.userId, 'audio', data.audioEnabled);
        });

        this.socket.on('chat-message', (data) => {
            this.displayChatMessage(data);
        });
    }

    showLandingPage() {
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('create-form').style.display = 'none';
        document.getElementById('join-form').style.display = 'none';
    }

    showCreateForm() {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('create-form').style.display = 'block';
        document.getElementById('join-form').style.display = 'none';
        document.getElementById('create-user-name').focus();
    }

    showJoinForm() {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('create-form').style.display = 'none';
        document.getElementById('join-form').style.display = 'block';
        document.getElementById('user-name').focus();
    }

    async createMeeting() {
        const userName = document.getElementById('create-user-name').value.trim();

        if (!userName) {
            this.showToast('Please enter your name', 'error');
            return;
        }

        try {
            // Create new room
            const response = await fetch('/api/video/create-room');
            const data = await response.json();
            const roomId = data.roomId;

            // Test ICE connectivity
            this.showToast('Testing network connectivity...', 'info');
            const candidateCount = await this.testICEConnectivity();
            console.log(`ICE connectivity test: ${candidateCount} candidates found`);
            
            if (candidateCount === 0) {
                this.showToast('Warning: Limited network connectivity detected. Video calls may not work across different networks.', 'error');
            } else {
                this.showToast(`Network connectivity OK (${candidateCount} routes found)`, 'success');
            }

            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            this.userName = userName;
            this.roomId = roomId;

            // Create local video element
            this.createLocalVideo();

            // Join the room
            this.socket.emit('join-room', roomId, userName);

            // Update UI
            this.hideAllForms();
            document.getElementById('conference-area').style.display = 'block';
            document.getElementById('room-id-display').textContent = `Meeting ID: ${roomId}`;

            // Set up beforeunload handler
            this.setupBeforeUnloadHandler();

        } catch (error) {
            console.error('Error creating meeting:', error);
            this.showToast('Unable to create meeting', 'error');
        }
    }

    async joinRoom() {
        const userName = document.getElementById('user-name').value.trim();
        const roomId = document.getElementById('room-id').value.trim().toUpperCase();

        if (!userName) {
            this.showToast('Please enter your name', 'error');
            return;
        }

        if (!roomId) {
            this.showToast('Please enter a meeting ID', 'error');
            return;
        }

        try {
            // Check if room exists (informational only; server auto-creates on join)
            const response = await fetch(`/api/video/room/${roomId}`);
            const roomData = await response.json();

            if (!roomData.exists) {
                console.log('Room does not exist yet, will act as first participant and create it implicitly via socket.');
            }

            // Test ICE connectivity
            this.showToast('Testing network connectivity...', 'info');
            const candidateCount = await this.testICEConnectivity();
            console.log(`ICE connectivity test: ${candidateCount} candidates found`);
            
            if (candidateCount === 0) {
                this.showToast('Warning: Limited network connectivity detected. Video calls may not work across different networks.', 'error');
            } else {
                this.showToast(`Network connectivity OK (${candidateCount} routes found)`, 'success');
            }

            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            this.userName = userName;
            this.roomId = roomId;

            // Create local video element
            this.createLocalVideo();

            // Join the room
            this.socket.emit('join-room', roomId, userName);

            // Update UI
            this.hideAllForms();
            document.getElementById('conference-area').style.display = 'block';
            document.getElementById('room-id-display').textContent = `Meeting ID: ${roomId}`;

            // Set up beforeunload handler
            this.setupBeforeUnloadHandler();

        } catch (error) {
            console.error('Error joining meeting:', error);
            this.showToast('Unable to join meeting', 'error');
        }
    }

    hideAllForms() {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('create-form').style.display = 'none';
        document.getElementById('join-form').style.display = 'none';
    }

    setupBeforeUnloadHandler() {
        window.addEventListener('beforeunload', () => {
            this.socket.emit('beforeunload');
        });
    }

    createLocalVideo() {
        const videoGrid = document.getElementById('video-grid');
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-item local';
        videoContainer.id = 'local-video-container';

        videoContainer.innerHTML = `
            <video id="local-video" autoplay muted playsinline></video>
            <div class="video-info">
                <span class="user-name">${this.userName} (You)</span>
                <div class="media-status">
                    <span class="video-status active">📹</span>
                    <span class="audio-status active">🎤</span>
                </div>
            </div>
        `;

        videoGrid.appendChild(videoContainer);
        const localVideo = document.getElementById('local-video');
        localVideo.srcObject = this.localStream;
    }

    async createPeerConnection(peerId, peerName, isInitiator) {
        // Check if peer connection already exists
        if (this.peers.has(peerId)) {
            console.log(`Peer connection for ${peerId} already exists`);
            return;
        }

        const peerConnection = new RTCPeerConnection(this.iceServers);
        
        const peer = {
            connection: peerConnection,
            name: peerName,
            videoElement: null
        };

        this.peers.set(peerId, peer);

        // Add local stream tracks
        if (this.localStream) {
            console.log(`Adding ${this.localStream.getTracks().length} tracks to peer ${peerId}`);
            this.localStream.getTracks().forEach(track => {
                console.log(`Adding track: ${track.kind} to peer ${peerId}`);
                peerConnection.addTrack(track, this.localStream);
            });
        } else {
            console.error('No local stream available when creating peer connection');
        }

        // Handle incoming stream
        peerConnection.ontrack = (event) => {
            console.log(`Received track from ${peerId}`, event);
            if (event.streams && event.streams[0]) {
                this.createRemoteVideo(peerId, peerName, event.streams[0]);
            }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`Sending ICE candidate to ${peerId}`);
                this.socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    target: peerId
                });
            }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state with ${peerId}: ${peerConnection.connectionState}`);
            if (peerConnection.connectionState === 'failed') {
                console.log(`Connection failed with ${peerId}, attempting to restart ICE`);
                peerConnection.restartIce();
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            console.log(`ICE connection state with ${peerId}: ${peerConnection.iceConnectionState}`);
            const state = peerConnection.iceConnectionState;
            
            if (state === 'connected' || state === 'completed') {
                console.log(`✅ ICE connection established with ${peerId}`);
                this.showToast(`Connected to ${peerName}`, 'success');
                this.updateConnectionStatus('connected', 'Connected');
            } else if (state === 'disconnected') {
                console.log(`⚠️ ICE connection disconnected with ${peerId}`);
                this.showToast(`Connection issues with ${peerName}`, 'error');
                this.updateConnectionStatus('error', 'Connection Issues');
            } else if (state === 'failed') {
                console.log(`❌ ICE connection failed with ${peerId}`);
                this.showToast(`Failed to connect to ${peerName}`, 'error');
                this.updateConnectionStatus('error', 'Connection Failed');
            } else if (state === 'checking') {
                this.updateConnectionStatus('', 'Connecting...');
            }
        };

        peerConnection.onicegatheringstatechange = () => {
            console.log(`ICE gathering state with ${peerId}: ${peerConnection.iceGatheringState}`);
        };

        peerConnection.onsignalingstatechange = () => {
            console.log(`Signaling state with ${peerId}: ${peerConnection.signalingState}`);
        };

        // Create offer if initiator
        if (isInitiator) {
            try {
                console.log(`Creating offer for ${peerId}`);
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                this.socket.emit('offer', {
                    offer: offer,
                    target: peerId
                });
                console.log(`Offer sent to ${peerId}`);
            } catch (error) {
                console.error(`Error creating offer for ${peerId}:`, error);
            }
        }
    }

    createRemoteVideo(peerId, peerName, stream) {
        console.log(`Creating remote video for ${peerName} (${peerId})`, stream);
        
        // Check if video element already exists
        const existingVideo = document.getElementById(`video-${peerId}`);
        if (existingVideo) {
            console.log(`Video element for ${peerId} already exists, updating stream`);
            const video = existingVideo.querySelector('video');
            if (video) {
                video.srcObject = stream;
                console.log(`Stream assigned to existing video element for ${peerId}`);
            }
            return;
        }

        const videoGrid = document.getElementById('video-grid');
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-item remote';
        videoContainer.id = `video-${peerId}`;

        videoContainer.innerHTML = `
            <video autoplay playsinline></video>
            <div class="video-info">
                <span class="user-name">${peerName}</span>
                <div class="media-status">
                    <span class="video-status active">📹</span>
                    <span class="audio-status active">🎤</span>
                </div>
            </div>
        `;

        videoGrid.appendChild(videoContainer);
        const video = videoContainer.querySelector('video');
        video.srcObject = stream;
        console.log(`Remote video element created and stream assigned for ${peerName} (${peerId})`);

        const peer = this.peers.get(peerId);
        if (peer) {
            peer.videoElement = videoContainer;
        }
    }

    removePeer(peerId) {
        const peer = this.peers.get(peerId);
        if (peer) {
            if (peer.videoElement) {
                peer.videoElement.remove();
            }
            peer.connection.close();
            this.peers.delete(peerId);
        }
    }

    toggleVideo() {
        this.isVideoEnabled = !this.isVideoEnabled;
        const videoTrack = this.localStream.getVideoTracks()[0];
        
        if (videoTrack) {
            videoTrack.enabled = this.isVideoEnabled;
        }

        // Update UI
        const button = document.getElementById('toggle-video');
        const localVideoStatus = document.querySelector('#local-video-container .video-status');
        
        if (this.isVideoEnabled) {
            button.classList.add('active');
            localVideoStatus.classList.add('active');
        } else {
            button.classList.remove('active');
            localVideoStatus.classList.remove('active');
        }

        // Notify other users
        this.socket.emit('toggle-video', this.isVideoEnabled);
    }

    toggleAudio() {
        this.isAudioEnabled = !this.isAudioEnabled;
        const audioTrack = this.localStream.getAudioTracks()[0];
        
        if (audioTrack) {
            audioTrack.enabled = this.isAudioEnabled;
        }

        // Update UI
        const button = document.getElementById('toggle-audio');
        const localAudioStatus = document.querySelector('#local-video-container .audio-status');
        
        if (this.isAudioEnabled) {
            button.classList.add('active');
            localAudioStatus.classList.add('active');
        } else {
            button.classList.remove('active');
            localAudioStatus.classList.remove('active');
        }

        // Notify other users
        this.socket.emit('toggle-audio', this.isAudioEnabled);
    }

    updatePeerMediaStatus(peerId, mediaType, enabled) {
        const videoContainer = document.getElementById(`video-${peerId}`);
        if (videoContainer) {
            const statusElement = videoContainer.querySelector(`.${mediaType}-status`);
            if (statusElement) {
                if (enabled) {
                    statusElement.classList.add('active');
                } else {
                    statusElement.classList.remove('active');
                }
            }
        }
    }

    toggleChat() {
        this.isChatOpen = !this.isChatOpen;
        const chatPanel = document.getElementById('chat-panel');
        const button = document.getElementById('toggle-chat');
        
        if (this.isChatOpen) {
            chatPanel.classList.add('open');
            button.classList.add('active');
        } else {
            chatPanel.classList.remove('open');
            button.classList.remove('active');
        }
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.socket.emit('chat-message', message);
            input.value = '';
        }
    }

    displayChatMessage(data) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        const isOwnMessage = data.id === this.socket.id;
        if (isOwnMessage) {
            messageElement.classList.add('own');
        }

        messageElement.innerHTML = `
            <div class="message-header">
                <span class="sender-name">${data.name}</span>
                <span class="timestamp">${data.timestamp}</span>
            </div>
            <div class="message-content">${this.escapeHtml(data.message)}</div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Show notification if chat is closed
        if (!this.isChatOpen && !isOwnMessage) {
            this.showToast(`New message from ${data.name}`);
        }
    }

    shareRoom() {
        const url = `${window.location.origin}/?room=${this.roomId}`;
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Room link copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Room link copied to clipboard!');
        });
    }

    leaveRoom() {
        if (confirm('Are you sure you want to leave the meeting?')) {
            // Notify server about leaving
            this.socket.emit('leave-room');
            
            // Stop local stream
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
            }

            // Close all peer connections
            this.peers.forEach(peer => peer.connection.close());
            this.peers.clear();

            // Reset UI
            document.getElementById('conference-area').style.display = 'none';
            document.getElementById('video-grid').innerHTML = '';
            document.getElementById('chat-messages').innerHTML = '';
            document.getElementById('participants-list').innerHTML = '';
            
            // Reset form values
            document.getElementById('user-name').value = '';
            document.getElementById('room-id').value = '';
            document.getElementById('create-user-name').value = '';

            // Show landing page
            this.showLandingPage();
            
            // Reset variables
            this.roomId = null;
            this.userName = null;
            this.currentUserId = null;
            this.isVideoEnabled = true;
            this.isAudioEnabled = true;
            this.isChatOpen = false;
        }
    }

    updateParticipantsList(users) {
        const participantsList = document.getElementById('participants-list');
        const chatUserCount = document.getElementById('chat-user-count');
        const headerUserCount = document.getElementById('user-count');
        
        // Clear existing participants
        participantsList.innerHTML = '';
        
        // Add participants
        users.forEach(user => {
            const isCurrentUser = user.id === this.currentUserId;
            const participantElement = document.createElement('div');
            participantElement.className = 'participant-item';
            
            participantElement.innerHTML = `
                <div class="participant-info">
                    <span class="participant-name">${user.name}${isCurrentUser ? ' (You)' : ''}</span>
                    <div class="participant-status">
                        <span class="status-icon ${user.videoEnabled ? 'active' : ''}" title="${user.videoEnabled ? 'Video on' : 'Video off'}">📹</span>
                        <span class="status-icon ${user.audioEnabled ? 'active' : ''}" title="${user.audioEnabled ? 'Audio on' : 'Audio off'}">🎤</span>
                    </div>
                </div>
            `;
            
            participantsList.appendChild(participantElement);
        });
        
        // Update counts
        const count = users.length;
        const countText = `${count} participant${count !== 1 ? 's' : ''}`;
        chatUserCount.textContent = countText;
        headerUserCount.textContent = countText;
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateConnectionStatus(status, message) {
        const statusElement = document.getElementById('connection-status');
        const dotElement = statusElement.querySelector('.status-dot');
        const textElement = statusElement.querySelector('.status-text');
        
        if (statusElement && dotElement && textElement) {
            dotElement.className = `status-dot ${status}`;
            textElement.textContent = message;
        }
    }

    showConnectionHelp() {
        const helpPanel = document.getElementById('connection-help');
        const ngrokUrl = document.getElementById('ngrok-url');
        
        // Try to detect if we're already using ngrok
        if (window.location.hostname.includes('ngrok')) {
            ngrokUrl.textContent = window.location.origin;
        } else {
            ngrokUrl.textContent = 'Run "ngrok http 3000" to get external URL';
        }
        
        helpPanel.style.display = 'flex';
    }

    hideConnectionHelp() {
        const helpPanel = document.getElementById('connection-help');
        helpPanel.style.display = 'none';
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Remove toast after appropriate time
        const duration = type === 'error' ? 5000 : 3000;
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    // Test ICE connectivity
    async testICEConnectivity() {
        console.log('Testing ICE server connectivity...');
        const testConnection = new RTCPeerConnection(this.iceServers);
        
        return new Promise((resolve) => {
            let candidateCount = 0;
            let timer = setTimeout(() => {
                testConnection.close();
                resolve(candidateCount);
            }, 5000);

            testConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    candidateCount++;
                    console.log(`ICE candidate ${candidateCount}:`, event.candidate.type, event.candidate.candidate);
                } else {
                    clearTimeout(timer);
                    testConnection.close();
                    resolve(candidateCount);
                }
            };

            testConnection.createDataChannel('test');
            testConnection.createOffer().then(offer => {
                return testConnection.setLocalDescription(offer);
            });
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new VideoConference();

    // Check for room ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    const nameFromUrl = urlParams.get('name');
    
    if (roomFromUrl) {
        document.getElementById('room-id').value = roomFromUrl;
        if (nameFromUrl) {
            document.getElementById('user-name').value = nameFromUrl;
            // Hide everything immediately to prevent flashing
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('create-form').style.display = 'none';
            document.getElementById('join-form').style.display = 'none';
            // Directly join instantly
            app.joinRoom();
        } else {
            app.showJoinForm();
        }
    }
});