const chalk = require('chalk');

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const bgColor = (severity) => {
  const color = textColor(severity);
  return 'bg'+ capitalizeFirstLetter(color)
}

const textColor = (serverity) => {
  switch (serverity.toLowerCase()) {
    case 'success': return 'green';
    case 'info': return 'blue';
    case 'note': return 'white';
    case 'warning': return 'yellow';
    case 'error': return 'red';
    default: return 'red';
  }
}

const  formatTitle = (severity, message) => {
  return chalk[bgColor(severity)].black('', message, '');
}

const formatText = (severity, message) => {
  return chalk[textColor(severity)](message);
}

module.exports = {
  bgColor: bgColor,
  textColor: textColor,
  formatTitle: formatTitle,
  formatText: formatText
}