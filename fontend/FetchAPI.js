function sendUserData(conversationId, user, query) {
    // Dữ liệu người dùng
    const data = {
        conversation_id: conversationId,
        user: user,
        query: query
    };

    // URL của API endpoint
    const apiUrl = '/chat'; // Thay bằng URL endpoint thực tế của bạn

    // Sử dụng Fetch API để gửi yêu cầu POST
    fetch(apiUrl, {
        method: 'POST', // Phương thức HTTP
        headers: {
            'Content-Type': 'user/json', // Định dạng dữ liệu là JSON
        },
        body: JSON.stringify(data) // Chuyển đổi dữ liệu thành chuỗi JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); // Chuyển đổi phản hồi thành JSON
    })
    .then(data => {
        console.log('Success:', data); // Xử lý dữ liệu phản hồi
    })
    .catch((error) => {
        console.error('Error:', error); // Xử lý lỗi
    });
}

