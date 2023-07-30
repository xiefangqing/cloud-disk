//大文件切割
export function cutBlob(file) {
  //切片大小(2M)
  const chunkSize = 2 * 1024 * 1024
  //切片总数
  const chunkNums = Math.ceil(file.size / chunkSize)

  let chunkArr = [],
      startIndex,
      endIndex,
      content

  //文件切割
  return new Promise((resolve, reject) => {
    for (let i = 0; i < chunkNums; i++) {
      startIndex = i * chunkSize
      endIndex = startIndex + chunkSize
      endIndex > file.size && (endIndex = file.size)

      content = file.slice(startIndex, endIndex)
      chunkArr.push(content)

    }
    resolve({
      chunkArr,
      fileInfo: {
        total: chunkNums,
        name: file.name,
        size: file.size,
        type: file.type,
        extensionName: file.name.split('.')[1]
      }
    })
  })
}

//生成迷你图
export async function mkMini(file) {
  const url = URL.createObjectURL(file)
  //file的MIME类型包含image
  if (/image/.test(file.type)) {
    //制作图片迷你图
    function foo() {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = () => {
          //获得图片真实宽高
          const width = img.width
          const height = img.height
          //生成画布
          const canvas = document.createElement('canvas')
          canvas.width = 200
          canvas.height = 200 * (height / width)
          //等比缩放
          canvas
            .getContext('2d')
            .drawImage(img, 0, 0, canvas.width, canvas.height)
          //生成base64格式图片
          let base64 = canvas.toDataURL('image/png')
          resolve(base64)
        }
      })
    }
    return await foo()
  } else {
    //制作视频迷你图
    function foo() {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.src = url
        //监听视频资源首帧加载完毕，可以截图
        video.onloadeddata = () => {
          //获取视频真实宽高
          const width = video.videoWidth
          const height = video.videoHeight
          const canvas = document.createElement('canvas')
          canvas.width = 200
          canvas.height = 200 * (height / width)
          canvas
            .getContext('2d')
            .drawImage(video, 0, 0, canvas.width, canvas.height)
          let base64 = canvas.toDataURL('image/png')
          resolve(base64)
        }
      })
    }
    return await foo()
  }
}

//文件大小格式化(转MB)
export function formatToMB(value) {
  const num = Number(value)
  const size = 1024 * 1024
  const a = num / size
  const b = a.toString()
  if (!b.includes('.') || b.indexOf('.') === b.length - 2) {
    //整数或一位小数直接返回
    return a
  }else{
    //四舍五入的保留2位小数（toFixed在有些情况下5不会入）
    return a.toFixed(2)
  }
}
