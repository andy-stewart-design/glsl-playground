import GlslCanvas from "./components/GlslCanvas";
import frag from "./shaders/250215-2.frag?raw";
// import BenDaySpotlight from "./components/shaders/BenDaySpotlight";
// import DotMatrix from "./components/shaders/DotMatrix";

function App() {
  return (
    <main>
      <GlslCanvas frag={frag} />
      {/* <DotMatrix /> */}
      {/* <BenDaySpotlight /> */}
    </main>
  );
}

export default App;
