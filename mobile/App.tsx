import { Share } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import Constants from "expo-constants";
import Hyperview from "hyperview";
import { SafeAreaProvider } from "react-native-safe-area-context";

// HXML lives on the quiz worker at /hv.
// Simulator: the default reaches wrangler on this machine.
// Device: BASE_URL=http://<lan-ip>:8787 npm run ios
// Android emulator: BASE_URL=http://10.0.2.2:8787 npm run android
const baseUrl =
  (Constants.expoConfig?.extra as { baseUrl?: string } | undefined)?.baseUrl ??
  "http://127.0.0.1:8787";

const formatDate = (date: Date | null | undefined) =>
  date ? date.toISOString().slice(0, 10) : undefined;

const shareQuiz = {
  action: "share",
  callback: (
    element: Element,
    _onUpdate: unknown,
    getRoot: () => Document | undefined,
    updateRoot: (root: Document) => void,
  ) => {
    const text = element.getAttribute("share-text") ?? "";
    const url = element.getAttribute("share-url") ?? "";
    const message = url ? `${text}\n${url}` : text;
    Share.share({ message }).then((result) => {
      if (result.action !== Share.sharedAction) return;
      const label = element.parentElement?.getElementsByTagName("text")[0];
      if (label?.firstChild) label.firstChild.textContent = "Shared";
      const root = getRoot();
      if (root) updateRoot(root);
    });
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Hyperview
          behaviors={[shareQuiz]}
          entrypointUrl={`${baseUrl}/hv`}
          fetch={fetch}
          formatDate={formatDate}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
