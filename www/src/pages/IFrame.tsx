import { PUBLIC_URL, SERVER } from "env";
import { useEffect, useState } from "react";

export const IFrame = ({ relurl }: { relurl: string }) => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight - 54 });
  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight - 54 });
  }, [window.innerHeight, window.innerWidth]);
  // const url = `${SERVER}${relurl}`;
  const url = `https://dev.minmod.isi.edu${relurl}`;
  return <iframe src={url} style={{ width: size.width, height: size.height, border: "none", marginLeft: -44, marginRight: -44 }} />;
};
