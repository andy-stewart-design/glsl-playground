import DotMatrix from "./components/shaders/DotMatrix";

function App() {
  return (
    <main>
      <DotMatrix />
      {/* <section ref={containerRef} className={s.section} />
      <div className={s.controls}>
        <label>
          Row count
          <input
            type="range"
            name="rows"
            defaultValue={13}
            min={3}
            max={23}
            step={2}
            onChange={(e) => {
              glRef.current?.setUniform("u_rows", {
                type: "float",
                value: e.target.valueAsNumber,
              });
            }}
          />
        </label>

        <label>
          Accent color
          <select
            name="color"
            defaultValue="teal"
            onChange={(e) => {
              let value: number[];

              switch (e.target.value) {
                case "grayscale":
                  value = [1, 1, 1];
                  break;
                case "teal":
                  value = [0, 1, 1];
                  break;
                case "blue":
                  value = [0, 0.3, 1];
                  break;
                case "green":
                  value = [0, 1, 0];
                  break;
                case "red":
                  value = [1, 0.2, 0];
                  break;
                case "yellow":
                  value = [1, 1, 0];
                  break;
                case "purple":
                  value = [1, 0, 1];
                  break;
                default:
                  value = [1, 1, 1];
              }

              glRef.current?.setUniform("u_color", {
                type: "vec3",
                value,
              });
            }}
          >
            <option value="grayscale">Grayscale</option>
            <option value="teal">Teal</option>
            <option value="yellow">Yellow</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
          </select>
        </label>
      </div> */}
    </main>
  );
}

export default App;
