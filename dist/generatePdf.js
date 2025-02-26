"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const layoutOneImage_1 = require("./layouts/layoutOneImage");
const layoutTwoImages_1 = require("./layouts/layoutTwoImages");
const layoutFourImages_1 = require("./layouts/layoutFourImages");
const layoutEightImages_1 = require("./layouts/layoutEightImages");
const banner_1 = require("./banner");
function generatePdfFromImages(imageUrls, imagesPerPage, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Example: portrait for 8 images, landscape otherwise
        const doc = imagesPerPage === 8
            ? new pdfkit_1.default() // portrait by default
            : new pdfkit_1.default({ layout: 'landscape' });
        // Create a write stream for the final PDF
        const writeStream = fs_1.default.createWriteStream(outputPath);
        doc.pipe(writeStream);
        // Read the logo from a local file
        // (Adjust the path to match your project structure)
        const logoPath = path_1.default.join(__dirname, 'assets', 'cognishine_logo_black.png');
        const logoBuffer = fs_1.default.readFileSync(logoPath);
        // The license text you want at the top of each page
        const licenseText = `The PDF may be used only for non-commercial purposes. They may not be used for any illegal or immoral purpose.
Please refrain from violating any intellectual property rights in or in connection with the images. Failure to comply with this print license agreement may expose you to civil and/or criminal liability.`;
        // Draw the banner on the first page
        (0, banner_1.addBanner)(doc, logoBuffer, licenseText);
        // Also draw the banner whenever a new page is added
        doc.on('pageAdded', () => {
            (0, banner_1.addBanner)(doc, logoBuffer, licenseText);
        });
        // Retrieve page dimensions
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        // Increase margin if you need more space below the banner
        const margin = 80;
        // Determine the correct layout function
        let slots = [];
        switch (imagesPerPage) {
            case 1:
                slots = (0, layoutOneImage_1.layoutOneImage)(pageWidth, pageHeight, margin);
                break;
            case 2:
                slots = (0, layoutTwoImages_1.layoutTwoImages)(pageWidth, pageHeight, margin);
                break;
            case 4:
                slots = (0, layoutFourImages_1.layoutFourImages)(pageWidth, pageHeight, margin);
                break;
            case 8:
                slots = (0, layoutEightImages_1.layoutEightImages)(pageWidth, pageHeight, margin);
                break;
            default:
                throw new Error('Invalid imagesPerPage value. Allowed: 1, 2, 4, 8');
        }
        // Place images in chunks of `imagesPerPage`
        for (let i = 0; i < imageUrls.length; i += imagesPerPage) {
            // Add a new page (except for the very first chunk)
            if (i !== 0) {
                doc.addPage();
            }
            const currentPageUrls = imageUrls.slice(i, i + imagesPerPage);
            for (let j = 0; j < currentPageUrls.length; j++) {
                try {
                    // Download or read the image
                    const response = yield axios_1.default.get(currentPageUrls[j], {
                        responseType: 'arraybuffer',
                    });
                    const imageBuffer = Buffer.from(response.data, 'binary');
                    // Layout slot
                    const { x, y, width, height } = slots[j];
                    doc.image(imageBuffer, x, y, { width, height });
                }
                catch (error) {
                    console.error(`Failed to load image: ${currentPageUrls[j]}`, error);
                }
            }
        }
        // Finalize the PDF
        doc.end();
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                console.log(`PDF generated at: ${outputPath}`);
                resolve();
            });
            writeStream.on('error', reject);
        });
    });
}
exports.default = generatePdfFromImages;
