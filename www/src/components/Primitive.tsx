import { useMemo } from "react";

const removeTrailingZeros = (num: string) => {
  if (num.includes(".")) {
    return num.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }
  return num;
};

export const Tonnage = ({ tonnage }: { tonnage?: number }) => {
  const s = useMemo(() => {
    if (tonnage !== undefined) {
      // display million tonnages with 6 decimal places
      return removeTrailingZeros(tonnage.toFixed(6));
    }
    return "";
  }, [tonnage]);

  return <span>{s}</span>;
};

export const Grade = ({ grade }: { grade?: number }) => {
  const s = useMemo(() => {
    if (grade !== undefined) {
      // display percent grade with 4 decimal places
      return removeTrailingZeros(grade.toFixed(4));
    }
    return "";
  }, [grade]);

  return <span>{s}</span>;
};

export const Empty = () => <></>;

export const MayEmptyString = ({ value }: { value?: string }) => {
  if (value !== undefined) {
    return <span>{value}</span>;
  }
  return <></>;
};
