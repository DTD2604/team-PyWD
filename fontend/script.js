const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const toggleMicButton = document.getElementById('toggleMic');
const socket = io.connect();

// WebRTC variables
let localStream;
let remoteStream;
let peerConnection;
const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// Get user media
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        localVideo.srcObject = stream;
        localStream = stream;
        socket.emit('join', 'room1');
    })
    .catch(error => console.error('Error accessing media devices.', error));

// Function to toggle microphone
// toggleMicButton.addEventListener('click', () => {
//     if (localStream) {
//         const audioTrack = localStream.getAudioTracks()[0];
//         // if (audioTrack.enabled) {
//         //     audioTrack.enabled = false;
//         //     toggleMicButton.textContent = 'Enable Microphone';
//         // } else {
//         //     audioTrack.enabled = true;
//         //     toggleMicButton.textContent = 'Disable Microphone';
//         // }
//     }
// });

// Socket.IO events
socket.on('ready', () => {
    peerConnection = new RTCPeerConnection(config);

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // Handle remote stream
    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
        remoteStream = event.streams[0];
    };

    // ICE candidates
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('candidate', event.candidate);
        }
    };

    // Create offer
    peerConnection.createOffer()
        .then(offer => {
            peerConnection.setLocalDescription(offer);
            socket.emit('offer', offer);
        })
        .catch(error => console.error('Error creating offer.', error));
});

socket.on('offer', offer => {
    peerConnection = new RTCPeerConnection(config);

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // Handle remote stream
    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
        remoteStream = event.streams[0];
    };

    // ICE candidates
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('candidate', event.candidate);
        }
    };

    peerConnection.setRemoteDescription(offer);
    peerConnection.createAnswer()
        .then(answer => {
            peerConnection.setLocalDescription(answer);
            socket.emit('answer', answer);
        })
        .catch(error => console.error('Error creating answer.', error));
});

socket.on('answer', answer => {
    peerConnection.setRemoteDescription(answer);
});

socket.on('candidate', candidate => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});
// =======================================================================================================================================================

document.addEventListener('DOMContentLoaded', function() {
    const userButton = document.querySelector('.UserButton');
    const nonUserMenu = document.querySelector('.Non-User');

    userButton.addEventListener('click', function(event) {
        event.preventDefault();
        if (nonUserMenu.style.display === 'none' || nonUserMenu.style.display === '') {
            nonUserMenu.style.display = 'block';
        } else {
            nonUserMenu.style.display = 'none';
        }
    });
});
// =======================================================================================================================================================
