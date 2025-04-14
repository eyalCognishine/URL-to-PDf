<template>
  <div class="pdf-container">
    <!-- בוחר את סוג התוכן -->
    <div class="input-block">
      <label>Content Type:</label>
      <select v-model="contentType">
        <option value="images">Images only</option>
        <option value="text">Text only (a simple list of words)</option>
        <option value="imagesAndText">Images + text</option>
      </select>
    </div>

    <!-- במצב של "Images only" מציגים רק את תיבת הטקסט לכתובות תמונה -->
    <div v-if="contentType === 'images'">
      <div class="input-block">
        <label>Image URLs (each on a new line):</label>
        <textarea
          v-model="rawUrls"
          class="urls-textarea"
          placeholder="https://image1.jpg
https://image2.jpg
https://image3.jpg"
        ></textarea>
      </div>
    </div>

    <!-- במצב של "Text only" מציגים רק תיבת טקסט אחרת (למילים/טקסט) -->
    <div v-else-if="contentType === 'text'">
      <div class="input-block">
        <label>Words (each on a new line):</label>
        <textarea
          v-model="textList"
          class="urls-textarea"
          placeholder="word1
word2
word3"
        ></textarea>
      </div>
    </div>

    <!-- במצב "Images + text" מציגים את שתי התיבות -->
    <div v-else-if="contentType === 'imagesAndText'">
      <div class="input-block">
        <label>Image URLs (each on a new line):</label>
        <textarea
          v-model="rawUrls"
          class="urls-textarea"
          placeholder="https://image1.jpg
https://image2.jpg"
        ></textarea>
      </div>

      <div class="input-block">
        <label>Words (each on a new line):</label>
        <textarea
          v-model="textList"
          class="urls-textarea"
          placeholder="word1
word2"
        ></textarea>
      </div>
    </div>

    <!-- בחירת מספר התמונות בעמוד -->
    <div class="input-block">
      <label>Image Option:</label>
      <select v-model.number="layoutOption">
        <option :value="1">1 item on 1 page</option>
        <option :value="2">2 item on 1 page</option>
        <option :value="4">4 item on 1 page (2x2)</option>
        <option :value="8">8 item on 1 page (4x2)</option>
        <option :value="12">12 item on 1 page (4x3)</option>
        <option :value="16">16 item on 1 page (4x4)</option>
        <option :value="20">20 item on 1 page (5x5)</option>
      </select>
    </div>

    <button @click="generatePdf">Generate PDF</button>

    <div v-if="downloadUrl" class="pdf-link">
      <h2>PDF Ready</h2>
      <a :href="downloadUrl" download="output.pdf">Download PDF</a>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import './GeneratePdf.css'; 

export default {
  setup() {
    const contentType = ref('images'); // ערך ברירת מחדל
    const rawUrls = ref('');
    const textList = ref('');
    const layoutOption = ref(1);
    const downloadUrl = ref('');

    const generatePdf = async () => {
      let imageUrls: string[] = [];
      let words: string[] = [];

      // אם התוכן כולל תמונות
      if (contentType.value === 'images' || contentType.value === 'imagesAndText') {
        imageUrls = rawUrls.value
          .split(/\r?\n/)
          .map((url) => url.trim())
          .filter((url) => url);
      }

      // אם התוכן כולל טקסט
      if (contentType.value === 'text' || contentType.value === 'imagesAndText') {
        words = textList.value
          .split(/\r?\n/)
          .map((w) => w.trim())
          .filter((w) => w);
      }

      // ולידציה בסיסית
      if (!imageUrls.length && !words.length) {
        alert('No input provided.');
        return;
      }

      try {
        const response = await axios.post(
          'http://localhost:3000/generate-pdf',
          {
            contentType: contentType.value,
            imageUrls,
            words,
            layoutOption: layoutOption.value
          },
          { responseType: 'blob' }
        );

        const file = new Blob([response.data], { type: 'application/pdf' });
        downloadUrl.value = URL.createObjectURL(file);
      } catch (error) {
        console.error(error);
        alert('Error generating PDF');
      }
    };

    return {
      contentType,
      rawUrls,
      textList,
      layoutOption,
      downloadUrl,
      generatePdf,
    };
  },
};
</script>