import { Button } from "antd";

export const MyButton = ({
  onClick,
  title,
}: {
  onClick: () => void;
  title: string;
}) => {
  return (
    <Button
      type="default"
      onClick={onClick} // Handle ungroup functionality
      style={{
        background: "#005b84", // Ungroup button background
        borderColor: "#005b84",
        color: "white",
        padding: "6px 12px",
        borderRadius: "4px",
        width: "100%",
        textAlign: "center",
      }}
    >
      {title}
    </Button>
  );
};
