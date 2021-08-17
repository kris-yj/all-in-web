export default {
  // reorderFaceAnchor accepts an array of 4 points. First two points must be anchors of eyes, last two points must e anchors of mouth.
  // It returns an array of 4 points in special orders: [left_eye, right_eye, mouth_left, mouth_right].
  reorderFaceAnchor(array) {
    const eyeCenter = this.midPoint(array[0], array[1]);
    const mouthCenter = this.midPoint(array[2], array[3]);
    // direction vector is a vector from eye center to mouth center, indicate downward of a face.
    const directionVector = this.minus(mouthCenter, eyeCenter);
    const result = [];
    {
      // vector from p0 to p1.
      const eyeVector = this.minus(array[1], array[0]);
      if (this.crossProduct(directionVector, eyeVector) < 0) {
        // (directionVector X (right eye - left eye)) should < 0, so current eye anchor's order is right.
        result.push(array[0]);
        result.push(array[1]);
      } else {
        result.push(array[1]);
        result.push(array[0]);
      }
    }
    {
      // vector from p2 to p3.
      const mouthVector = this.minus(array[3], array[2]);
      if (this.crossProduct(directionVector, mouthVector) < 0) {
        // (directionVector X (right mouth - left mouth)) should < 0, so current mouth anchor's order is right.
        result.push(array[2]);
        result.push(array[3]);
      } else {
        result.push(array[3]);
        result.push(array[2]);
      }
    }
    return result;
  },
  // p = (p1 + p2) / 2
  midPoint(p1, p2) {
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  },
  // p = p1 - p2
  minus(p1, p2) {
    return [(p1[0] - p2[0]), (p1[1] - p2[1])];
  },

  // Important: We are in left-handed cartesian coordinates, so cross product returns different direction.
  crossProduct(v1, v2) {
    return (v1[0] * v2[1] - v1[1] * v2[0]);
  },
  // 图片扩选(扩选后超出图片边界则超出部分放弃，其他不变)
  FaceRect2Face(rect) {
    return this.enlarge(rect, 0.5, 0.6, 2.0, 2.0);
  },
  EnlargeRect(r, widthScale, heightScale) {
    return this.enlarge(
      r,
      (widthScale - 1) / 2,
      (heightScale - 1) / 2,
      widthScale,
      heightScale
    );
  },
  enlarge(r, rl, rt, rw, rh) {
    return {
      leftPixels: r.leftPixels - r.widthPixels * rl,
      topPixels: r.topPixels - r.heightPixels * rt,
      widthPixels: r.widthPixels * rw,
      heightPixels: r.heightPixels * rh
    };
  },
  // 根据坐标点对图片进行裁切
  getExactImg(sourceBase64Data, rect, widthScale = 0.8, heightScale = 0.8) {
    const that = this;
    return new Promise((resolve) => {
      const img = new Image();
      img.src = sourceBase64Data;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      img.onload = function () {
        const tempArr = that.FaceRect2Face(that.EnlargeRect(rect, widthScale, heightScale));
        // const tempArr = that.FaceRect2Face(rect);
        tempArr.leftPixels = tempArr.leftPixels < 0 ? 0 : tempArr.leftPixels;
        tempArr.topPixels = tempArr.topPixels < 0 ? 0 : tempArr.topPixels;
        canvas.width = tempArr.widthPixels > img.width ? img.width : tempArr.widthPixels;
        canvas.height = tempArr.heightPixels > img.height ? img.height : tempArr.heightPixels;
        ctx.drawImage(img, tempArr.leftPixels, tempArr.topPixels, tempArr.widthPixels, tempArr.heightPixels, 0, 0, tempArr.widthPixels, tempArr.heightPixels);
        resolve(canvas.toDataURL('image/png', 1));
      };
    });
  },
  // 图片转换成canvas填充至操作框并标出质量最高的图像
  dealImg(sourceBaseImg, rectArr, containerWidth = 614, containerHeight = 325, widthScale = 0.8, heightScale = 0.8) {
    const that = this;
    return new Promise((resolve) => {
      const img = new Image();
      img.src = sourceBaseImg;
      const canvas = document.createElement('canvas');
      canvas.id = 'sourceImgCanvas';
      const ctx = canvas.getContext('2d');
      img.onload = function () {
        const persent = img.width / img.height; // 获取图片长宽比
        let dx = 0; // X轴绘图 偏移量
        let dy = 0; // Y轴偏移量
        let mulNum = 0; // 图像的实际放大倍数
        ctx.lineWidth = 3; // 定义选项框绘制线宽度
        if (persent > containerWidth / containerHeight) {
          mulNum = containerWidth / img.width;
          canvas.width = containerWidth;
          canvas.height = img.height * mulNum;
          dy = (containerHeight - mulNum * img.height) / 2;
          ctx.drawImage(img, 0, 0, containerWidth, img.height * mulNum);
        } else {
          mulNum = containerHeight / img.height;
          canvas.width = img.width * mulNum;
          canvas.height = containerHeight;
          dx = (containerWidth - mulNum * img.width) / 2;
          ctx.drawImage(img, 0, 0, img.width * mulNum, containerHeight);
        }
        const newRect = rectArr.map((ele) => {
          // 框选出头像
          const tempArr = that.FaceRect2Face(that.EnlargeRect(ele, widthScale, heightScale));
          tempArr.leftPixels = (tempArr.leftPixels < 0 ? 0 : tempArr.leftPixels) * mulNum + dx;
          tempArr.topPixels = (tempArr.topPixels < 0 ? 0 : tempArr.topPixels) * mulNum + dy;
          tempArr.widthPixels = (tempArr.widthPixels > img.width ? img.width : tempArr.widthPixels) * mulNum;
          tempArr.heightPixels = (tempArr.heightPixels > img.height ? img.height : tempArr.heightPixels) * mulNum;
          return tempArr;
          // str += `<span data-index='${index}' style='left: ${tempArr.leftPixels * mulNum + dx}px;top:${tempArr.topPixels * mulNum + dy
          // +"px;width: "+ tempArr.widthPixels*mulNum +"px;height: "+ tempArr.heightPixels*mulNum +"px;border: 3px solid "+ (index==0?'#cf3f47':'#4c9f67') +"'></span>";
          // }px;width: ${tempSpanWidth * mulNum}px;height: ${tempSpanHeight * mulNum}px;border: 3px solid ${index === 0 ? '#388cf2' : '#ffffff'}'></span>`;
        });
        canvas.style.position = 'absolute';
        canvas.style.left = `${dx}px`;
        canvas.style.top = `${dy}px`;
        resolve([canvas, newRect]);
      };
    });
  },
  // 图片镜像反转
  getMirrorReversalImg(sourceImgData) {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      img.src = sourceImgData;
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        let x;
        let y;
        let p;
        let i;
        let i2;
        let t;
        const h = imgData.height;
        const w = imgData.width;
        const w2 = w / 2;
        // 将imgData的数据水平翻转
        for (y = 0; y < h; y += 1) {
          for (x = 0; x < w2; x += 1) {
            i = (y << 2) * w + (x << 2);  //eslint-disable-line
            i2 = ((y + 1) << 2) * w - ((x + 1) << 2); //eslint-disable-line
            for (p = 0; p < 4; p += 1) {
              t = imgData.data[i + p];
              imgData.data[i + p] = imgData.data[i2 + p];
              imgData.data[i2 + p] = t;
            }
          }
        }
        // 重绘水平翻转后的图片
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png', 1), img.width, img.height);
      };
    });
  },
  // 图片向右旋转
  getTurnRightImg(sourceImgData) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = '';
      const canvas = document.createElement('canvas');
      img.src = sourceImgData;
      img.onload = function () {
        canvas.width = img.naturalHeight;
        canvas.height = img.naturalWidth;
        const ctx = canvas.getContext('2d');
        ctx.translate(0, 0);
        // eslint-disable-next-line no-mixed-operators
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(img, 0, -img.naturalHeight, img.naturalWidth, img.naturalHeight);
        resolve(canvas.toDataURL('image/jpg', 1));
      };
    });
  },
  // 数组降维
  reduceDimension(arr) {
    return Array.prototype.concat.apply([], arr);
  }
};
