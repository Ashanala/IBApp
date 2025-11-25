
export function millisecToString(millisec) {
  if (millisec) {
    const sec = millisec / 1000;

    const minsec = 60;
    const hrsec = minsec * 60;
    const daysec = hrsec * 24;
    const weeksec = daysec * 7;
    const monthsec = daysec * 30;
    const yearsec = daysec * 365;
    if (sec == 0) {
      return "now";
    } else if (sec < minsec) {
      const value = Math.floor(sec);
      return value + " second" + (value > 1 ? "s" : "") + " ago";
    } else if (sec < hrsec) {
      const value = Math.floor(sec / minsec);
      return value + " min" + (value > 1 ? "s" : "") + " ago";
    } else if (sec < daysec) {
      const value = Math.floor(sec / hrsec);
      return value + " hr" + (value > 1 ? "s" : "") + " ago";
    } else if (sec < weeksec) {
      const value = Math.floor(sec / daysec);
      return value + " day" + (value > 1 ? "s" : "") + " ago";
    } else if (sec < monthsec) {
      const value = Math.floor(sec / weeksec);
      return value + " week" + (value > 1 ? "s" : "") + " ago";
    } else if (sec < yearsec) {
      const value = Math.floor(sec / monthsec);
      return value + " month" + (value > 1 ? "s" : "") + " ago";
    } else {
      const value = Math.floor(sec / monthsec);
      return value + " year" + (value > 1 ? "s" : "") + " ago";
    }
  } else {
    return "-";
  }
}

export function reactionToString(reaction) {
  var result = reaction;
  if (reaction < 1000) {
    result = reaction + "";
  } else if (reaction < 1000000) {
    result = reaction / 1000 + "";
    result = result[2] == "." ? result.slice(0, 4) : result.slice(0, 3);
    result = result + "K";
  } else if (reaction < 1000000000) {
    result = result = reaction / 1000000 + "";
    result = result[2] == "." ? result.slice(0, 4) : result.slice(0, 3);
    result = result + "M";
  } else if (reaction < 1000000000000) {
    result = result = reaction / 1000000000 + "";
    result = result[2] == "." ? result.slice(0, 4) : result.slice(0, 3);
    result = result + "B";
  }
  return result;
}

export function singleDigitToHex(number, lowercase) {
  if (number < 10) return number;
  else {
    switch (number) {
      case 10:
        return lowercase ? "a" : "A";
      case 11:
        return lowercase ? "b" : "B";
      case 12:
        return lowercase ? "c" : "C";
      case 13:
        return lowercase ? "d" : "D";
      case 14:
        return lowercase ? "e" : "E";
      case 15:
        return lowercase ? "f" : "F";
    }
  }
}

export function toHex(number) {
  var result = "";
  while (number > 0) {
    result = singleDigitToHex(number % 16) + result;
    number = Math.floor(number / 16);
  }
  return result;
}

export function sixify(value){
  while(value.length!=6){
    if(value.length<6)
    value+="0";
    else
    value.splice(value.length-1);
  }
  return value;
}

//AI : COPILOT
export function generateColor(value) {
  const maxColors = 50;

  // Normalize the value to a cyclic index from 1 to 50
  const index = ((value - 1) % maxColors) + 1;

  // Even hue distribution around the color wheel
  const hue = Math.floor((index / maxColors) * 360);

  // Vary saturation and lightness to add diversity and punch
  const saturation = 60 + (index % 4) * 10; // 60%, 70%, 80%, 90%
  const lightness = 45 + (index % 3) * 10;  // 45%, 55%, 65%

  return hslToHex(hue, saturation, lightness);
}

//AI COPILOT
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export function starColor(value) {
  if (value == 0) return "#87ceeb"; //sky-blue
  else if (value < 10) return "#ff0000"; //red
  else if (value < 30) return "#a52a2a"; //brown
  else if (value < 70) return "#ffc0cb"; //pink
  else if (value < 150) return "#0080000"; //green
  else if (value < 310) return "#ffff00"; //yellow
  else if (value < 630) return "#800080"; //white
  else if (value < 1270) return "#ffffff"; //purple
  else if (value < 2550) return "#ffa500"; //orange
  else if (value < 5110) return "#000000"; //black
  else if (value < 10230) return "#0000ff"; //blue
  else return "#d4af37";
}
