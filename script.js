const startBtn = document.getElementById('startBtn');
const stripButtons = document.querySelectorAll('.stripOption');
const snapBtn = document.getElementById('snap');

const startScreen = document.getElementById('startScreen');
const stripSelection = document.getElementById('stripSelection');
const photoBooth = document.getElementById('photoBooth');
const previewSection = document.getElementById('previewSection');

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const result = document.getElementById('result');
const downloadLink = document.getElementById('download');
const colorPicker = document.getElementById('colorPicker');
const retryBtn = document.getElementById('retryBtn');

let selectedStripCount = 0;
let currentShot = 0;
let shotsData = [];
let stream = null;
let selectedColor = null;

startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  stripSelection.style.display = 'block';
});

stripButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedStripCount = parseInt(btn.dataset.strip);
    stripSelection.style.display = 'none';
    photoBooth.style.display = 'block';
    snapBtn.textContent = `Jepret Foto Strip 1`;
    shotsData = [];
    currentShot = 0;
    selectedColor = null;
    startCamera();
    downloadLink.style.display = 'none';
    previewSection.style.display = 'none';
  });
});

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (e) {
    alert('Tidak bisa akses kamera: ' + e.message);
  }
}

snapBtn.addEventListener('click', () => {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  shotsData.push(canvas.toDataURL('image/png'));
  currentShot++;

  if (currentShot < selectedStripCount) {
    snapBtn.textContent = `Jepret Foto Strip ${currentShot + 1}`;
  } else {
    stopCamera();
    photoBooth.style.display = 'none';
    showPreview();
  }
});

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

function showPreview() {
  previewSection.style.display = 'block';
  selectedColor = null;
  downloadLink.style.display = 'none';

  const borderWidth = 20;
  const paddingBottom = 60;
  const paddingTop = borderWidth;

  const width = video.videoWidth;
  const height = (video.videoHeight * shotsData.length) + paddingTop + paddingBottom;

  canvas.width = width + borderWidth * 2;
  canvas.height = height;

  let loadedCount = 0;
  const ctx = canvas.getContext('2d');

  shotsData.forEach((data, index) => {
    const img = new Image();
    img.src = data;
    img.onload = () => {
      const yPos = paddingTop + index * video.videoHeight;
      ctx.drawImage(img, borderWidth, yPos, width, video.videoHeight);

      loadedCount++;
      if (loadedCount === shotsData.length) {
        updatePreviewCanvas();
      }
    };
  });
}

function updatePreviewCanvas() {
  const ctx = canvas.getContext('2d');
  const borderWidth = 20;
  const paddingTop = borderWidth;
  const paddingBottom = 60;
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  shotsData.forEach((data, index) => {
    const img = new Image();
    img.src = data;
    img.onload = () => {
      const yPos = paddingTop + index * video.videoHeight;
      ctx.drawImage(img, borderWidth, yPos, video.videoWidth, video.videoHeight);

      if (index > 0 && selectedColor) {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(borderWidth, yPos - (borderWidth / 2), video.videoWidth, borderWidth);
      }

      if (index === shotsData.length - 1) {
        if (selectedColor) {
          ctx.lineWidth = borderWidth;
          ctx.strokeStyle = selectedColor;
          ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);
        }

        ctx.fillStyle = selectedColor || "#000";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PickMyBooth", width / 2, height - 30);

        result.innerHTML = '';
        const previewImg = new Image();
        previewImg.src = canvas.toDataURL('image/png');
        previewImg.style.borderRadius = '8px';
        previewImg.style.width = '100%';
        previewImg.style.border = selectedColor ? `12px solid ${selectedColor}` : 'none';
        result.appendChild(previewImg);

        if (selectedColor) {
          downloadLink.href = canvas.toDataURL('image/png');
          downloadLink.style.display = 'inline-block';
        }
      }
    };
  });
}

colorPicker.addEventListener('click', (e) => {
  if(e.target.classList.contains('colorBox')) {
    document.querySelectorAll('.colorBox').forEach(box => box.classList.remove('selected'));
    e.target.classList.add('selected');
    selectedColor = e.target.dataset.color;
    updatePreviewCanvas();
  }
});

retryBtn.addEventListener('click', () => {
  previewSection.style.display = 'none';
  photoBooth.style.display = 'block';
  shotsData = [];
  currentShot = 0;
  selectedColor = null;
  snapBtn.textContent = `Jepret Foto Strip 1`;
  downloadLink.style.display = 'none';
  startCamera();
});
