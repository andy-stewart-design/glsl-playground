import GlslCanvas from "./components/GlslCanvas";
import frag from "./shaders/250217-2.frag?raw";
// import BenDaySpotlight from "./components/shaders/BenDaySpotlight";
// import DotMatrix from "./components/shaders/DotMatrix";

function App() {
  return (
    <main>
      {/* <GlslCanvas
        frag={frag}
        uniforms={{
          u_texture: {
            type: "video",
            value:
              "https://res.cloudinary.com/andystewartdesign/video/upload/v1736178932/playbook-animations/playbook-home-image-gallery.mp4",
          },
        }}
      /> */}
      <GlslCanvas frag={frag} uniforms={{ u_webcam: { type: "webcam" } }} />
      {/* <DotMatrix /> */}
      {/* <BenDaySpotlight /> */}
    </main>
  );
}

export default App;
