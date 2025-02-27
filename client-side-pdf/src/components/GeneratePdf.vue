<template>
    <div class="pdf-container">
      <div class="input-block">
        <label>Image URLs (comma-separated):</label>
        <!-- Replaced the <input> with a <textarea> -->
        <textarea
          v-model="rawUrls"
          class="urls-textarea"
          placeholder="https://..., https://..., https://..."
        ></textarea>
      </div>
  
      <div class="input-block">
        <label>image Option:</label>
        <select v-model.number="layoutOption">
          <option :value="1">1 image on 1 page</option>
          <option :value="2">2 images on 1 page</option>
          <option :value="4">4 images on 1 page</option>
          <option :value="8">8 images on 1 page</option>
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
  import '../assets/GeneratePdf.css';
  
  export default {
    setup() {
      const rawUrls = ref('');
      const layoutOption = ref(1);
      const downloadUrl = ref('');
  
      const generatePdf = async () => {
        // Convert comma-separated URLs into an array
        const imageUrls = rawUrls.value
          .split(',')
          .map(url => url.trim())
          .filter(u => u);
  
        if (!imageUrls.length) {
          alert('Please provide at least one image URL');
          return;
        }
  
        try {
          // POST request to your Node server
          const response = await axios.post(
            'http://localhost:3000/generate-pdf',
            { imageUrls, layoutOption: layoutOption.value },
            { responseType: 'blob' } // Expect a PDF file (binary)
          );
  
          // Create a downloadable URL for the Blob
          const file = new Blob([response.data], { type: 'application/pdf' });
          downloadUrl.value = URL.createObjectURL(file);
        } catch (error) {
          console.error(error);
          alert('Error generating PDF');
        }
      };
  
      return {
        rawUrls,
        layoutOption,
        downloadUrl,
        generatePdf,
      };
    },
  };
  </script>
  

  