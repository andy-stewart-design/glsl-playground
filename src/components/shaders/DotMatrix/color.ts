const colorArray = [
  { name: "Grayscale", value: "grayscale", rgb: [1, 1, 1] },
  { name: "Teal", value: "teal", rgb: [0, 1, 1] },
  { name: "Blue", value: "blue", rgb: [0, 0.3, 1] },
  { name: "Green", value: "green", rgb: [0, 1, 0] },
  { name: "Red", value: "red", rgb: [1, 0.2, 0] },
  { name: "Yellow", value: "yellow", rgb: [1, 1, 0] },
  { name: "Purple", value: "purple", rgb: [1, 0, 1] },
] as const;

type ColorOption = (typeof colorArray)[number]["value"];

const colorOptions = colorArray.reduce<string[]>(
  (acc, curr) => [...acc, curr.value],
  [] as string[]
);

function isColor(str: string): str is ColorOption {
  return colorOptions.includes(str);
}

const colorObject = colorArray.reduce<Record<ColorOption, number[]>>(
  (acc, curr) => ({
    ...acc,
    [curr.value]: curr.rgb,
  }),
  {} as Record<ColorOption, number[]>
);

export { colorArray, colorObject, isColor, type ColorOption };
