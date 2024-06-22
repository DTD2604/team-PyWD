<template>
  <div>
    <h1>Camera Feed</h1>
    <img id="videoElement" title="camera" style="width:100%;"/>
  </div>
</template>

<script>
export default {
  mounted() {
    this.fetchVideoFeed();
  },
  methods: {
    fetchVideoFeed() {
      const videoElement = document.getElementById('videoElement');
      const ws = new WebSocket('ws://localhost:8000/ws');
      ws.binaryType = 'arraybuffer';  // Đảm bảo dữ liệu nhị phân được xử lý đúng cách
      ws.onmessage = (event) => {
        const blob = new Blob([event.data], {type: 'image/jpeg'});
        const url = URL.createObjectURL(blob);
        videoElement.src = url;
        URL.revokeObjectURL(url);  // Dọn dẹp URL object sau khi sử dụng
      };
    },
  },
};
</script>

<style>
/* Add any styles you need here */
</style>