interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-describedby="confirm-dialog-message"
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "28px 24px 20px",
          width: "min(320px, 88vw)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <p
          id="confirm-dialog-message"
          style={{
            margin: "0 0 24px",
            fontSize: "15px",
            fontWeight: 600,
            color: "#111",
            lineHeight: "1.55",
            textAlign: "center",
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: "10px",
              border: "none",
              background: "#e0e0e0",
              color: "#555",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            아니오
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: "10px",
              border: "none",
              background: "#e74c3c",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            예
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
