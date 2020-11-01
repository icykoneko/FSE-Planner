import L from "leaflet";

// SVG icon for normal airports
function civilSVG3(color, size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" class="cls-1" fill="'+color+'"/><path d="M2.649,10.645 L14.774,3.645 L15.774,5.377 L3.649,12.377 L2.649,10.645 Z" fill="#fff"/><path d="M9.219,3.438 L16.219,15.562 L14.487,16.562 L7.487,4.438 L9.219,3.438 Z" fill="#fff"/></svg>';
}
function civilSVG2(color, size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" class="cls-1" fill="'+color+'"/><path d="M4.343,14.243 L14.642,3.944 L16.056,5.358 L5.757,15.657 L4.343,14.243 Z" fill="#fff"/></svg>';
}
function civilSVG1(color, size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" class="cls-1" fill="none" stroke="'+color+'" stroke-width="4px"/><circle cx="10" cy="10" r="8" class="cls-1" fill="#fff"/></svg>';
}

// SVG icon for military airports
function militarySVG(color, size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" class="cls-1" fill="'+color+'"/><path d="M12.706,5.462 L11.814,5.462 L9.796,11.888 L7.732,5.462 L6.833,5.462 L4.913,15.007 L6.547,15.007 L7.576,9.863 L9.496,15.130 L10.102,15.130 L12.022,9.863 L13.012,15.007 L14.653,15.007 L12.706,5.462 Z" fill="#fff"/></svg>';
}

// SVG icon for marine airports
function waterSVG(color, size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" class="cls-1" fill="'+color+'"/><rect x="9" y="4" width="2" height="13" fill="#fff"/><path d="M5.000,8.000 L5.000,7.000 L15.000,7.000 L15.000,8.000 L5.000,8.000 Z" fill="#fff"/><path d="M4.000,12.000 C4.000,12.000 7.038,15.066 10.000,15.000 C12.763,14.938 15.000,12.000 15.000,12.000 " stroke="#fff" stroke-width="1.5" fill="none"/></svg>';
}

// Build leaflet icon
const Icon = (html, size) => {
  return L.divIcon({
    html: html,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
    className: ''
  });
}


class AirportIcons {
  constructor(color, size) {
    this.icons = {
      civil: [
        Icon(civilSVG1(color, size), size),
        Icon(civilSVG2(color, size), size),
        Icon(civilSVG3(color, size), size)
      ],
      military: [
        Icon(militarySVG(color, size), size),
        Icon(militarySVG(color, size), size),
        Icon(militarySVG(color, size), size)
      ],
      water: [
        Icon(waterSVG(color, size), size),
        Icon(waterSVG(color, size), size),
        Icon(waterSVG(color, size), size)
      ]
    }
  }

  get(type, size) {
    const s = (size >= 3500) ? 2 : (size >= 1000) ? 1 : 0;
    return this.icons[type][s];
  }
}

export default AirportIcons;