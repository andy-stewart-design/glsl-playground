import GlslCanvas from "./components/GlslCanvas";
import frag from "./shaders/250217.frag?raw";
// import BenDaySpotlight from "./components/shaders/BenDaySpotlight";
// import DotMatrix from "./components/shaders/DotMatrix";

function App() {
  return (
    <main>
      <GlslCanvas
        frag={frag}
        uniforms={{
          u_texture: {
            type: "sampler2D",
            value:
              "https://images.unsplash.com/photo-1739382122868-841cb1e669df?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
        }}
      />
      {/* <DotMatrix /> */}
      {/* <BenDaySpotlight /> */}
    </main>
  );
}

export default App;

// https://images.unsplash.com/photo-1739382122868-841cb1e669df?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
