export default function Spinner({ label }: { label: string }) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 32,
        color: "#6b7280",
      }}
    >
      <div className="trq-spinner" />
      <span>{label}</span>
    </div>
  );
}
