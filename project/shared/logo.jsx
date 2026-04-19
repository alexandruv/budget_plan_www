// Budget Plan Logo — abstract ledger/allocation mark
// Represents rows of allocated budget categories

const BPMark = ({ size = 40, color = "currentColor", bgColor = null }) => {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      {bgColor && <rect width="40" height="40" rx="9" fill={bgColor} />}
      {/* Allocation rows — three bars of decreasing length, like a budget ledger */}
      <rect x="9" y="10" width="22" height="4" rx="1" fill={color} />
      <rect x="9" y="18" width="16" height="4" rx="1" fill={color} />
      <rect x="9" y="26" width="10" height="4" rx="1" fill={color} />
      {/* Status dot — the "every dollar accounted for" signal */}
      <circle cx="29" cy="28" r="2.5" fill="#3fb950" />
    </svg>
  );
};

const BPWordmark = ({ height = 28, color = "currentColor", markColor = null }) => {
  const h = height;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: h * 0.35, color }}>
      <BPMark size={h * 1.15} color={markColor || color} />
      <span style={{
        fontFamily: 'Geist, Inter, sans-serif',
        fontSize: h * 0.82,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        Budget Plan
      </span>
    </div>
  );
};

window.BPMark = BPMark;
window.BPWordmark = BPWordmark;
