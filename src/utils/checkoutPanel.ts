let visible = false;
let closeHandler: (() => void) | null = null;

export function setCheckoutPanelVisible(v: boolean) {
  visible = v;
}

export function isCheckoutPanelVisible() {
  return visible;
}

export function registerCheckoutCloseHandler(fn: (() => void) | null) {
  closeHandler = fn;
}

export function invokeCheckoutCloseHandler() {
  if (closeHandler) {
    try {
      closeHandler();
    } catch (e) {
      // ignore
    }
  }
}

export function clearCheckoutCloseHandler() {
  closeHandler = null;
}
