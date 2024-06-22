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
<<<<<<< HEAD

=======
>>>>>>> 6e78306dbe3e420a7fd16ef56c928893e0f49209
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
<<<<<<< HEAD
// Kiểm tra trình duyệt có hỗ trợ SpeechRecognition
if (!('webkitSpeechRecognition' in window)) {
    alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói. Hãy sử dụng Chrome.');
} else {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'vi-VN'; // Đặt ngôn ngữ là tiếng Việt
    recognition.continuous = true; // Tiếp tục nhận dạng
    recognition.interimResults = false; // Chỉ nhận kết quả cuối cùng

    let isRecording = false; // Trạng thái ghi âm

    recognition.onstart = function() {
        console.log('Nhận dạng giọng nói bắt đầu. Hãy nói vào micro.');
    };

    recognition.onerror = function(event) {
        console.error('Lỗi nhận dạng: ' + event.error);
    };

    recognition.onend = function() {
        if (isRecording) {
            console.log('Chờ để tiếp tục ghi âm...');
            recognition.start(); // Tự động khởi động lại nếu đang ghi âm
        } else {
            console.log('Kết thúc nhận dạng giọng nói.');
        }
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        console.log('Văn bản: ' + transcript + '\nĐộ chính xác: ' + confidence);

        // Đưa văn bản vào ô input
        document.getElementById('messageInput').value = transcript;
    };

    // Bật/tắt ghi âm khi nhấn nút
    document.getElementById('toggleRecording').addEventListener('click', function(event) {
        event.preventDefault();
        if (isRecording) {
            recognition.stop();
            isRecording = false;
            console.log('Mic đã tắt.');
        } else {
            recognition.start();
            isRecording = true;
            console.log('Mic đã bật.');
        }
    });
}

// Hàm gửi tin nhắn
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message !== '') {
        const newMessageContainer = document.createElement('div');
        newMessageContainer.classList.add('message-container');
        
        

        const avatar = document.createElement('img');
        avatar.src = 'Image/avatar.jpg'; // Đường dẫn đến ảnh avatar của bạn
        avatar.alt = 'User Avatar';
        avatar.classList.add('avatar');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerText = 'Thu hồi';
        deleteButton.onclick = function() {
            newMessageContainer.remove();
        };
        

        const newMessage = document.createElement('div');
        newMessage.classList.add('message', 'my-message'); // Tùy chỉnh lớp cho tin nhắn của bạn
        newMessage.innerText = message;

        newMessageContainer.appendChild(deleteButton);
        newMessageContainer.appendChild(newMessage);
        newMessageContainer.appendChild(avatar);
        


        const boxChat = document.getElementById('boxChat');
        boxChat.appendChild(newMessageContainer);
        
        messageInput.value = '';
        boxChat.scrollTop = boxChat.scrollHeight;
    }
}

// Lắng nghe phím Enter để gửi tin nhắn
document.getElementById('messageInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault();
    }
});


//  Xử lý hình ảnh

document.getElementById('sendImageBtn').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('imageInput').click();
});

document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            const newMessageContainer = document.createElement('div');
            newMessageContainer.classList.add('message-container');

            const avatar = document.createElement('img');
            avatar.src = 'Image/avatar.jpg'; // Đường dẫn đến ảnh avatar của bạn
            avatar.alt = 'User Avatar';
            avatar.classList.add('avatar');
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.innerText = 'Thu hồi';
            deleteButton.onclick = function() {
                newMessageContainer.remove();

            };

            const newMessage = document.createElement('div');
            newMessage.classList.add('message', 'my-message'); // Tùy chỉnh lớp cho tin nhắn của bạn

            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = 'Sent Image';
            imageElement.style.maxWidth = '100%';
            imageElement.style.padding = '0';

            newMessageContainer.appendChild(deleteButton);
            newMessage.appendChild(imageElement);
            newMessageContainer.appendChild(newMessage);
            newMessageContainer.appendChild(avatar);

            const boxChat = document.getElementById('boxChat');
            boxChat.appendChild(newMessageContainer);

            boxChat.scrollTop = boxChat.scrollHeight;
        };
        reader.readAsDataURL(file);
    }
});


// ================================================================================================================================

=======
>>>>>>> 6e78306dbe3e420a7fd16ef56c928893e0f49209
