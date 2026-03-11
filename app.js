const imageInput = document.getElementById("imageInput");
const previewGrid = document.getElementById("previewGrid");
const convertBtn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");
const message = document.getElementById("message");
const imageCount = document.getElementById("imageCount");
const pdfNameInput = document.getElementById("pdfName");
const pageSizeSelect = document.getElementById("pageSize");

let selectedFiles = [];

if (imageInput) {
  imageInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    selectedFiles = [...selectedFiles, ...validFiles];
    renderPreview();
    imageInput.value = "";
  });
}

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    selectedFiles = [];
    renderPreview();
    showMessage("All selected images were cleared.", "success");
  });
}

if (convertBtn) {
  convertBtn.addEventListener("click", async () => {
    if (selectedFiles.length === 0) {
      showMessage("Please select at least one image first.", "error");
      return;
    }

    try {
      showMessage("Creating PDF...", "success");

      const { PDFDocument } = PDFLib;
      const pdfDoc = await PDFDocument.create();

      for (const file of selectedFiles) {
        const bytes = await file.arrayBuffer();
        const imageType = getImageType(file);
        let embeddedImage;

        if (imageType === "jpg") {
          embeddedImage = await pdfDoc.embedJpg(bytes);
        } else if (imageType === "png") {
          embeddedImage = await pdfDoc.embedPng(bytes);
        } else {
          showMessage(`Unsupported image format: ${file.name}`, "error");
          return;
        }

        const { width, height } = embeddedImage.scale(1);

        if (pageSizeSelect.value === "fit") {
          const page = pdfDoc.addPage([width, height]);
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width,
            height,
          });
        } else {
          const pageDimensions = getPageDimensions(pageSizeSelect.value);
          const page = pdfDoc.addPage([
            pageDimensions.width,
            pageDimensions.height,
          ]);

          const margin = 20;
          const maxWidth = pageDimensions.width - margin * 2;
          const maxHeight = pageDimensions.height - margin * 2;
          const scaled = scaleToFit(width, height, maxWidth, maxHeight);

          const x = (pageDimensions.width - scaled.width) / 2;
          const y = (pageDimensions.height - scaled.height) / 2;

          page.drawImage(embeddedImage, {
            x,
            y,
            width: scaled.width,
            height: scaled.height,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const fileName = (pdfNameInput.value.trim() || "my-images") + ".pdf";

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();

      URL.revokeObjectURL(url);
      showMessage("PDF created successfully. Download started.", "success");
    } catch (error) {
      console.error(error);
      showMessage("Something went wrong while creating the PDF.", "error");
    }
  });
}

function renderPreview() {
  if (!previewGrid || !imageCount) return;

  previewGrid.innerHTML = "";

  if (selectedFiles.length === 0) {
    imageCount.textContent = "0 images";
    return;
  }

  imageCount.textContent = `${selectedFiles.length} image${
    selectedFiles.length > 1 ? "s" : ""
  }`;

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const item = document.createElement("div");
      item.className = "preview-item";

      item.innerHTML = `
        <img class="preview-image" src="${e.target.result}" alt="${file.name}">
        <div class="preview-info">
          <div class="preview-name">${file.name}</div>
          <div class="preview-actions">
            <span class="preview-index">#${index + 1}</span>
            <button class="remove-btn" data-index="${index}">Remove</button>
          </div>
        </div>
      `;

      previewGrid.appendChild(item);

      const removeBtn = item.querySelector(".remove-btn");
      removeBtn.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        renderPreview();
      });
    };

    reader.readAsDataURL(file);
  });
}

function showMessage(text, type = "") {
  if (!message) return;

  message.textContent = text;
  message.className = "message";

  if (type) {
    message.classList.add(type);
  }
}

function getImageType(file) {
  const type = file.type.toLowerCase();

  if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
  if (type.includes("png")) return "png";

  return "unknown";
}

function getPageDimensions(type) {
  if (type === "letter") {
    return { width: 612, height: 792 };
  }

  return { width: 595.28, height: 841.89 };
}

function scaleToFit(originalWidth, originalHeight, maxWidth, maxHeight) {
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: originalWidth * ratio,
    height: originalHeight * ratio,
  };
}