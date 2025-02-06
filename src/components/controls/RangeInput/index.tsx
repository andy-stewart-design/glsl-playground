import type { ComponentProps, Dispatch, SetStateAction } from "react";

type BaseRangeInputProps = Omit<ComponentProps<"input">, "onChange">;
interface RangeInputProps extends BaseRangeInputProps {
  onChange: Dispatch<SetStateAction<number>>;
}

function RangeInput({ onChange, ...rest }: RangeInputProps) {
  return (
    <input
      {...rest}
      type="range"
      onChange={(e) => onChange(e.target.valueAsNumber)}
    />
  );
}

export default RangeInput;
