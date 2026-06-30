import { MnemonicOnboardingScreen } from "./components/MnemonicOnboardingScreen";
import { useTernent } from "./hooks/useTernent";

export default function App() {
  const api = useTernent();

  if (!api) {
    return <p style={{ padding: "2rem" }}>Booting workspace runtime...</p>;
  }

  return (
    <main>
      <MnemonicOnboardingScreen
        mnemonicWords={["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"]}
      />
      <section style={{ padding: "1.5rem" }}>
        <h2>Workspace tasks</h2>
        <pre>{JSON.stringify(api.tasks.all(), null, 2)}</pre>
      </section>
    </main>
  );
}
