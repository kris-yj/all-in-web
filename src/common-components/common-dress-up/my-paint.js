/* eslint-disable */
/*
  实现具体的上色功能
*/
const Mypaint = {
  hexToRgb(hex) {
	    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

	    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
  },
  minusBaseColor(imgData, dstRGB) {
    const newObj = {};
    let maxKey = '';
    let maxNumber = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
      if (imgData.data[i + 3] === 0) continue;
      // if(imgData.data[i]===0&&imgData.data[i+1]===0&&imgData.data[i+2]===0)continue;
      if (newObj[`${imgData.data[i]}--${imgData.data[i + 1]}--${imgData.data[i + 2]}`]) {
        newObj[`${imgData.data[i]}--${imgData.data[i + 1]}--${imgData.data[i + 2]}`] += 1;
      } else {
        newObj[`${imgData.data[i]}--${imgData.data[i + 1]}--${imgData.data[i + 2]}`] = 1;
      }
    }
    // 统计最多的颜色
    for (const key in newObj) {
      if (newObj[key] > maxNumber) {
        maxKey = key;
        maxNumber = newObj[key];
      }
    }
    const maxColor = maxKey.split('--');
    dstRGB.r -= parseInt(maxColor[0], 10);
    dstRGB.g -= parseInt(maxColor[1], 10);
    dstRGB.b -= parseInt(maxColor[2], 10);
    return dstRGB;
  },
  paint(imgData, color, dx, dy) {
    /*
		  染纯色
		*/
    function Add(a, b) {
      a += b;
      if (a > 255)a = 255;
      if (a < 0)a = 0;
      return a;
    }
    let dstRGB = this.hexToRgb(color);
    console.log(dstRGB);
    // 设定了基准点的时候，将目标色减去基准色
    dstRGB = this.minusBaseColor(imgData, dstRGB);
    console.log(dstRGB);

    if (dx !== null && dy !== null) {
      // 设定了基准点的时候，将目标色减去基准色
      // const pos = ((dy * imgData.width) + dx) * 4;

      for (let i = 0; i < imgData.data.length; i += 4) {
        if (imgData.data[i + 3] === 0) continue;
        // if(imgData.data[i]===0&&imgData.data[i+1]===0&&imgData.data[i+2]===0)continue;
        imgData.data[i] = Add(imgData.data[i], dstRGB.r);
        imgData.data[i + 1] = Add(imgData.data[i + 1], dstRGB.g);
        imgData.data[i + 2] = Add(imgData.data[i + 2], dstRGB.b);
      }
    } else {
      for (let i = 0; i < imgData.data.length; i += 4) {
        if (imgData.data[i + 3] === 0) continue;
        if (imgData.data[i] === 0 && imgData.data[i + 1] === 0 && imgData.data[i + 2] === 0) continue;
        imgData.data[i] = dstRGB.r;
        imgData.data[i + 1] = dstRGB.g;
        imgData.data[i + 2] = dstRGB.b;
      }
    }
  },
  paint_horizontal(imgData, color1, color2, width, dx, dy) {
    /*
		  横条
		*/
    function Add(a, b) {
      a += b;
      if (a > 255)a = 255;
      if (a < 0)a = 0;
      return a;
    }
    let dstRGB1 = this.hexToRgb(color1);
    let dstRGB2 = this.hexToRgb(color2);
    // 设定了基准点的时候，将目标色减去基准色
    dstRGB1 = this.minusBaseColor(imgData, dstRGB1);
    dstRGB2 = this.minusBaseColor(imgData, dstRGB2);
    let pos = 0;
    if (dx !== null && dy !== null) {
      for (let i = 0; i < imgData.height; i++) {
        for (let j = 0; j < imgData.width; j++, pos += 4) {
          const dstRGB = (Math.floor((i - dy) / width) % 2) ? dstRGB1 : dstRGB2;
          if (imgData.data[pos + 3] === 0) continue;
          // if(imgData.data[pos]===0&&imgData.data[pos+1]===0&&imgData.data[pos+2]===0)continue;
          imgData.data[pos] = Add(imgData.data[pos], dstRGB.r);
          imgData.data[pos + 1] = Add(imgData.data[pos + 1], dstRGB.g);
          imgData.data[pos + 2] = Add(imgData.data[pos + 2], dstRGB.b);
        }
      }
    } else {
      for (let i = 0; i < imgData.height; i++) {
        for (let j = 0; j < imgData.width; j++, pos += 4) {
          const dstRGB = (Math.floor(i / width) % 2) ? dstRGB1 : dstRGB2;
          if (imgData.data[pos + 3] === 0) continue;
          if (imgData.data[pos] === 0 && imgData.data[pos + 1] === 0 && imgData.data[pos + 2] === 0) continue;
          imgData.data[pos] = dstRGB.r;
          imgData.data[pos + 1] = dstRGB.g;
          imgData.data[pos + 2] = dstRGB.b;
        }
      }
    }
  },
  paint_vertical(imgData, color1, color2, width, dx, dy) {
    /*
		  竖条
		*/
    function Add(a, b) {
      a += b;
      if (a > 255)a = 255;
      if (a < 0)a = 0;
      return a;
    }
    let dstRGB1 = this.hexToRgb(color1);
    let dstRGB2 = this.hexToRgb(color2);
    // 设定了基准点的时候，将目标色减去基准色
    dstRGB1 = this.minusBaseColor(imgData, dstRGB1);
    dstRGB2 = this.minusBaseColor(imgData, dstRGB2);
    let pos = 0;
    if (dx !== null && dy !== null) {
      for (let i = 0; i < imgData.height; i++) {
        for (let j = 0; j < imgData.width; j++, pos += 4) {
          const dstRGB = (Math.floor((j - dx) / width) % 2) ? dstRGB1 : dstRGB2;
          if (imgData.data[pos + 3] === 0) continue;
          // if(imgData.data[pos]===0&&imgData.data[pos+1]===0&&imgData.data[pos+2]===0)continue;
          imgData.data[pos] = Add(imgData.data[pos], dstRGB.r);
          imgData.data[pos + 1] = Add(imgData.data[pos + 1], dstRGB.g);
          imgData.data[pos + 2] = Add(imgData.data[pos + 2], dstRGB.b);
        }
      }
    } else {
      for (let i = 0; i < imgData.height; i++) {
        for (let j = 0; j < imgData.width; j++, pos += 4) {
          const dstRGB = (Math.floor(j / width) % 2) ? dstRGB1 : dstRGB2;
          if (imgData.data[pos + 3] === 0) continue;
          if (imgData.data[pos] === 0 && imgData.data[pos + 1] === 0 && imgData.data[pos + 2] === 0) continue;
          imgData.data[pos] = dstRGB.r;
          imgData.data[pos + 1] = dstRGB.g;
          imgData.data[pos + 2] = dstRGB.b;
        }
      }
    }
  },
  paint_plaid(imgData, color1, color2, width, dx, dy) {
    console.log(imgData, color1, color2, width, dx, dy);
    /*
		  格子
		*/
    function Add(a, b) {
      a += b;
      if (a > 255)a = 255;
      if (a < 0)a = 0;
      return a;
    }
    let dstRGB1 = this.hexToRgb(color1);
    let dstRGB2 = this.hexToRgb(color2);
    // 设定了基准点的时候，将目标色减去基准色
    dstRGB1 = this.minusBaseColor(imgData, dstRGB1);
    dstRGB2 = this.minusBaseColor(imgData, dstRGB2);
    let pos = 0;
    if (dx !== null && dy !== null) {
      for (let i = 0; i < imgData.height; i++) {
        for (let j = 0; j < imgData.width; j++, pos += 4) {
          const dstRGB = ((Math.floor((j - dx) / width) + Math.floor((i - dy) / width)) % 2) ? dstRGB1 : dstRGB2;
          if (imgData.data[pos + 3] === 0) continue;
          // if(imgData.data[pos]===0&&imgData.data[pos+1]===0&&imgData.data[pos+2]===0)continue;
          imgData.data[pos] = Add(imgData.data[pos], dstRGB.r);
          imgData.data[pos + 1] = Add(imgData.data[pos + 1], dstRGB.g);
          imgData.data[pos + 2] = Add(imgData.data[pos + 2], dstRGB.b);
        }
      }
    } else {
      for (let i = 0; i < imgData.height; i++) {
        for (let j = 0; j < imgData.width; j++, pos += 4) {
          const dstRGB = ((Math.floor(j / width) + Math.floor(i / width)) % 2) ? dstRGB1 : dstRGB2;
          if (imgData.data[pos + 3] === 0) continue;
          if (imgData.data[pos] === 0 && imgData.data[pos + 1] === 0 && imgData.data[pos + 2] === 0) continue;
          imgData.data[pos] = dstRGB.r;
          imgData.data[pos + 1] = dstRGB.g;
          imgData.data[pos + 2] = dstRGB.b;
        }
      }
    }
  },
  paint_spot(imgData, color1, color2, radius, distance, dx, dy) {
    console.log(imgData, color1, color2, radius, distance, dx, dy);
    /*
		  斑点：实现方法为在空画布上画平铺斑点，再和原图叠加
		*/
    function Add(a, b) {
      a += b;
      if (a > 255)a = 255;
      if (a < 0)a = 0;
      return a;
    }
    const canv = document.createElement('canvas');
    canv.width = imgData.width;
    canv.height = imgData.height;
    const ctx = canv.getContext('2d');
    ctx.fillStyle = color2;
    ctx.fillRect(0, 0, canv.width, canv.height);
    let flag = false;
    for (let y = dy; y < imgData.height; y += Math.round(distance * 0.866)) {
      const stx = flag ? (dx + Math.round(distance / 2)) : dx;
      for (let x = stx; x < imgData.width; x += distance) {
        ctx.beginPath();
          		ctx.arc(x, y, radius, 0, 2 * Math.PI);
          		ctx.fillStyle = color1;
          		ctx.fill();
      }
      for (let x = stx - distance; x >= 0; x -= distance) {
        ctx.beginPath();
          		ctx.arc(x, y, radius, 0, 2 * Math.PI);
          		ctx.fillStyle = color1;
          		ctx.fill();
      }
      flag = !flag;
    }

    flag = true;

    for (let y = dy - Math.round(distance * 0.866); y >= 0; y -= Math.round(distance * 0.866)) {
      const stx = flag ? (dx + Math.round(distance / 2)) : dx;
      for (let x = stx; x < imgData.width; x += distance) {
        ctx.beginPath();
          		ctx.arc(x, y, radius, 0, 2 * Math.PI);
          		ctx.fillStyle = color1;
          		ctx.fill();
      }
      for (let x = stx - distance; x >= 0; x -= distance) {
        ctx.beginPath();
          		ctx.arc(x, y, radius, 0, 2 * Math.PI);
          		ctx.fillStyle = color1;
          		ctx.fill();
      }
      flag = !flag;
    }
    const imgData2 = ctx.getImageData(0, 0, canv.width, canv.height);

    const dstRGB = this.minusBaseColor(imgData, { r: 0, g: 0, b: 0 });
    for (let i = 0; i < imgData.data.length; i += 4) {
      if (imgData.data[i + 3] === 0) continue;
      imgData.data[i] = Add(imgData.data[i], imgData2.data[i] + dstRGB.r);
      imgData.data[i + 1] = Add(imgData.data[i + 1], imgData2.data[i + 1] + dstRGB.g);
      imgData.data[i + 2] = Add(imgData.data[i + 2], imgData2.data[i + 2] + dstRGB.b);
    }
  }
};
export default Mypaint;
