import GlslCanvas from "./components/GlslCanvas";
import frag from "./shaders/250214-1.frag?raw";
// import DotMatrix from "./components/shaders/DotMatrix";

function App() {
  return (
    <main>
      {/* <DotMatrix /> */}
      <GlslCanvas frag={frag} />
    </main>
  );
}

export default App;
