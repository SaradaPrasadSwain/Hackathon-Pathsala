const socket = io();
const videoGrid = document.getElementById('video-grid');
const joinBtn = document.getElementById('joinBtn');
let myPeerConnection = null;
let myVideoStream;
let roomId;

const myVideo = document.createElement('video');
myVideo.muted = true;

// Get user media when page loads
async function init() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        myVideoStream = stream;
        addVideoStream(myVideo, stream);
    } catch (err) {
        console.error('Failed to get media devices:', err);
    }
}

init();

// Join room handler
joinBtn.addEventListener('click', () => {
    roomId = document.getElementById('roomId').value;
    if (!roomId) {
        alert('Please enter a room ID');
        return;
    }
    
    socket.emit('join-room', roomId);
    setupPeerConnection();
});

function setupPeerConnection() {
    // Create new RTCPeerConnection
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    });

    // Add local stream
    myVideoStream.getTracks().forEach(track => {
        myPeerConnection.addTrack(track, myVideoStream);
    });

    // Handle incoming remote stream
    let remoteStream; // Add this at the top with other global variables

myPeerConnection.ontrack = (event) => {
    // Check if we already have a video element for this peer
    if (!remoteStream) {
        remoteStream = event.streams[0];
        const remoteVideo = document.createElement('video');
        remoteVideo.id = 'remote-video';
        remoteVideo.srcObject = remoteStream;
        remoteVideo.addEventListener('loadedmetadata', () => {
            remoteVideo.play();
        });
        videoGrid.appendChild(remoteVideo);
    }
};

// Also add cleanup on disconnect
socket.on('user-disconnected', () => {
    const remoteVideo = document.getElementById('remote-video');
    if (remoteVideo) {
        remoteVideo.remove();
        remoteStream = null;
    }
});

    // ICE candidate handling
    myPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                candidate: event.candidate,
                roomId: roomId
            });
        }
    };

    // Listen for remote ICE candidates
    socket.on('ice-candidate', async (data) => {
        try {
            await myPeerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
            console.error('Error adding ICE candidate:', err);
        }
    });

    // Handle user connected event
    socket.on('user-connected', async () => {
        try {
            const offer = await myPeerConnection.createOffer();
            await myPeerConnection.setLocalDescription(offer);
            socket.emit('offer', {
                offer: offer,
                roomId: roomId
            });
        } catch (err) {
            console.error('Error creating offer:', err);
        }
    });

    // Handle incoming offer
    socket.on('offer', async (data) => {
        try {
            await myPeerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await myPeerConnection.createAnswer();
            await myPeerConnection.setLocalDescription(answer);
            socket.emit('answer', {
                answer: answer,
                roomId: roomId
            });
        } catch (err) {
            console.error('Error handling offer:', err);
        }
    });

    // Handle incoming answer
    socket.on('answer', async (data) => {
        try {
            await myPeerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
            console.error('Error handling answer:', err);
        }
    });
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.appendChild(video);
}