const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = (event) => {
      resolve(event.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const loadImage = (dataURL) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = (e) => {
      resolve(img)
    }
    img.src = dataURL
  })
}

const downloadFile = function (content, filename) {
  var eleLink = document.createElement('a');
  eleLink.download = filename;
  eleLink.style.display = 'none';
  eleLink.target = "_blank";
  eleLink.href = content
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
}

const loadCanvas = (image, w, h) => {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const iW = image.width
  const iH = image.height
  ctx.drawImage(image, (w - iW) / 2, (h - iH) / 2, iW, iH)
  return canvas
}

export {
  readFile,
  loadImage,
  downloadFile,
  loadCanvas
}