if (! /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
  window.onload=fiveui.chrome.options.init;
}
