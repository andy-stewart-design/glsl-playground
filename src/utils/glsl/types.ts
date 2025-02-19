interface UniformNumber {
  type: "float" | "int";
  value: number;
}

interface UniformVector {
  type: "vec2" | "vec3" | "vec4";
  value: number[];
}

interface UniformBoolean {
  type: "bool";
  value: boolean;
}

interface UniformTexture {
  type: "sampler2D";
  value: string; // URL of the texture
}

type UniformValue =
  | UniformNumber
  | UniformVector
  | UniformBoolean
  | UniformTexture;

interface UniformConfig {
  [key: string]: UniformValue;
}

export type {
  UniformNumber,
  UniformVector,
  UniformBoolean,
  UniformTexture,
  UniformValue,
  UniformConfig,
};
