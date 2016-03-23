var wellknown = require('wellknown');

module.exports = function (param, type, value) {
  if (type === 'enum') {
    return toArray(value);
  } else if (type === 'boolean') {
    return toBool(value);
  } else if (type === 'date') {
    return toDate(param, value);
  } else {
    return value;
  }
};

function toBool(str) {
  if (str.toLowerCase() === 'true') {
    return true;
  } else if (str.toLowerCase() === 'false') {
    return false;
  } else {
    return str;
  }
}

function toArray(str) {
  return str.split(',');
}

function toDate(param, str) {
  // See if str contains just year
  if (/^\d{4}$/.test(str)) {
    if (param === 'before') {
      return str + '-01-01';
    } else if (param === 'after') {
      return str + '-12-31';
    }
  }

  return str;
}
