"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPdfGenerator = runPdfGenerator;
const generatePdf_1 = __importDefault(require("./generatePdf"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const imageUrls = [
    'https://cdn.cognishine.com/language/storysequence/679f1d96b8ae20d28844c74e/content/cognishine_35255441770-hd.jpg',
    'https://cdn.cognishine.com/language/storysequence/679f1d96b8ae20d28844c74e/content/cognishine_35255441770-hd.jpg',
    'https://cdn.cognishine.com/language/storysequence/679f1d96b8ae20d28844c74e/content/cognishine_35255441770-hd.jpg',
    'https://cdn.cognishine.com/language/storysequence/679f1d96b8ae20d28844c74e/content/cognishine_35255441770-hd.jpg',
    'https://cdn.cognishine.com/language/storysequence/679f1d96b8ae20d28844c74e/content/cognishine_35255441770-hd.jpg',
    'https://cdn.cognishine.com/language/storysequence/679f1d96b8ae20d28844c74e/content/cognishine_35255441770-hd.jpg',
    'https://cdn.cognishine.com/language/storysequence/679f1d96b8ae20d28844c74e/content/cognishine_35255441770-hd.jpg',
    'https://cdn.cognishine.com/language/storysequence/679f1d96b8ae20d28844c74e/content/cognishine_35255441770-hd.jpg',
    'https://cdn.cognishine.com/language/storysequence/679f1d96b8ae20d28844c74e/content/cognishine_35255441770-hd.jpg',
];
// Define the absolute output path. Adjust this path as needed.
const outputPath = path_1.default.join('C:', 'Users', 'User', 'Desktop', 'output.pdf');
function runPdfGenerator() {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    console.log('Choose a layout option:');
    console.log('1 - 1 image per page');
    console.log('2 - 2 images per page');
    console.log('3 - 4 images per page');
    console.log('4 - 8 images per page');
    rl.question('Enter your choice (1-4): ', (answer) => {
        const option = parseInt(answer);
        let imagesPerPage;
        switch (option) {
            case 1:
                imagesPerPage = 1;
                break;
            case 2:
                imagesPerPage = 2;
                break;
            case 3:
                imagesPerPage = 4;
                break;
            case 4:
                imagesPerPage = 8;
                break;
            default:
                console.error('Invalid option. Please choose a number between 1 and 4.');
                rl.close();
                return;
        }
        (0, generatePdf_1.default)(imageUrls, imagesPerPage, outputPath)
            .then(() => {
            console.log('PDF generation completed.');
            rl.close();
        })
            .catch((error) => {
            console.error('Error generating PDF:', error);
            rl.close();
        });
    });
}
