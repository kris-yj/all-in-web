function getCameraInfo(cameraList) {
  const cameraValues = [];
  const cameraIds = [];
  cameraList.forEach((cameraItem) => {
    cameraValues.push(cameraItem.name);
    cameraIds.push(cameraItem.cameraId);
  });
  return { cameraValues, cameraIds };
}

export default getCameraInfo;
