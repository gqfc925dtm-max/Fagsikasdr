/**
 * Capacitor bridge. Uses window.Capacitor injected by the native shell.
 * On GitHub Pages this stays a harmless no-op.
 */
const Native = {
  isNative: false,
  platform: "web",
  ready: false,
  async haptic() {},
};

function plugins() {
  return window.Capacitor?.Plugins || {};
}

async function bootNative() {
  const Cap = window.Capacitor;
  Native.isNative = !!(Cap && (Cap.isNativePlatform?.() || Cap.getPlatform?.() !== "web"));
  Native.platform = Cap?.getPlatform?.() || "web";

  if (!Native.isNative) {
    window.OttiskNative = Native;
    return;
  }

  const p = plugins();
  try {
    await p.StatusBar?.setStyle?.({ style: "DARK" });
    await p.StatusBar?.setBackgroundColor?.({ color: "#120d14" });
    await p.SplashScreen?.hide?.();
  } catch (_) {
    // optional plugins
  }

  try {
    await p.App?.addListener?.("appStateChange", ({ isActive }) => {
      document.dispatchEvent(new CustomEvent("ottisk-app-state", { detail: { isActive } }));
    });
  } catch (_) {
    // noop
  }

  Native.haptic = async (style = "light") => {
    const map = { light: "LIGHT", medium: "MEDIUM", heavy: "HEAVY" };
    try {
      await p.Haptics?.impact?.({ style: map[style] || "LIGHT" });
    } catch (_) {
      // noop
    }
  };

  Native.ready = true;
  window.OttiskNative = Native;
}

window.OttiskNative = Native;
bootNative();
