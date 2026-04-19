// Budget Plan app screens — all screens in one file for cohesion

const { useRef: _useRef } = React;

// ─── Shared primitives ───────────────────────────────────────────

const BPLogoMark = ({ size = 40, color = "#58a6ff" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect x="9" y="10" width="22" height="4" rx="1" fill={color} />
    <rect x="9" y="18" width="16" height="4" rx="1" fill={color} />
    <rect x="9" y="26" width="10" height="4" rx="1" fill={color} />
    <circle cx="29" cy="28" r="2.5" fill="#3fb950" />
  </svg>
);

const ScreenShell = ({ children, padTop, padBottom = 16, style = {} }) => {
  const platform = usePlatform();
  const defaultPad = platform === 'android' ? 16 : 62;
  return (
  <div style={{
    width: '100%', height: '100%', background: '#0d1117', color: '#e6edf3',
    paddingTop: padTop !== undefined ? padTop : defaultPad,
    paddingBottom: padBottom,
    boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', position: 'relative',
    ...style,
  }}>{children}</div>
  );
};

const Btn = ({ children, primary, onClick, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    appearance: 'none', border: 0,
    padding: '16px 20px', borderRadius: 14,
    background: primary ? (disabled ? '#1f2733' : '#58a6ff') : 'transparent',
    color: primary ? (disabled ? '#6e7681' : '#0d1117') : '#e6edf3',
    fontFamily: 'inherit', fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
    width: '100%', cursor: disabled ? 'default' : 'pointer',
    transition: 'background 0.15s',
    border: primary ? 0 : '1px solid #2a3441',
    ...style,
  }}>{children}</button>
);

const TopBack = ({ onBack, title, right = null }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px', height: 44, flexShrink: 0,
  }}>
    <button onClick={onBack} style={{
      appearance: 'none', border: 0, background: 'transparent',
      color: '#8b949e', fontSize: 22, cursor: 'pointer', padding: 0,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>‹</span>
    </button>
    <div style={{ fontSize: 14, fontWeight: 500, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b949e' }}>{title}</div>
    <div style={{ width: 30 }}>{right}</div>
  </div>
);

// ─── Keypad ─────────────────────────────────────────────────────

const Keypad = ({ value, onChange, onSubmit, submitLabel = 'Done', submitDisabled }) => {
  const push = (d) => {
    if (d === '.' && value.includes('.')) return;
    const parts = value.split('.');
    if (parts[1] && parts[1].length >= 2 && d !== 'back') return;
    onChange(value + d);
  };
  const back = () => onChange(value.slice(0, -1));
  const Key = ({ label, onClick, big }) => (
    <button onClick={onClick} style={{
      appearance: 'none', border: 0, background: 'rgba(255,255,255,0.04)',
      color: '#e6edf3', fontSize: big ? 28 : 26, fontWeight: 500,
      borderRadius: 16, height: 58, cursor: 'pointer',
      fontFamily: 'ui-monospace, monospace', letterSpacing: '-0.02em',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.1s',
    }}>{label}</button>
  );
  return (
    <div style={{ padding: '0 16px 12px', background: '#0d1117' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
        {['1','2','3','4','5','6','7','8','9'].map(d => <Key key={d} label={d} onClick={() => push(d)} />)}
        <Key label="." onClick={() => push('.')} />
        <Key label="0" onClick={() => push('0')} />
        <Key label="⌫" onClick={back} />
      </div>
      <Btn primary onClick={onSubmit} disabled={submitDisabled}>{submitLabel}</Btn>
    </div>
  );
};

// ─── SCREEN: Welcome ─────────────────────────────────────────────

const WelcomeScreen = () => {
  const { setScreen } = useAppState();
  return (
    <ScreenShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>
        <div style={{ marginBottom: 32 }}>
          <BPLogoMark size={48} />
        </div>
        <div style={{ fontSize: 40, lineHeight: 1.02, letterSpacing: '-0.035em', fontWeight: 500, marginBottom: 20 }}>
          Know where<br/>your money<br/><span style={{ color: '#8b949e' }}>goes.</span>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5, color: '#8b949e', marginBottom: 40 }}>
          Zero-based budgeting. Every dollar gets a job. Your data never leaves this phone.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6e7681' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950' }}/>
            Local-only storage
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950' }}/>
            No account, no sync
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950' }}/>
            No tracking, ever
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 8px' }}>
        <Btn primary onClick={() => setScreen('income')}>Get started</Btn>
      </div>
    </ScreenShell>
  );
};

// ─── SCREEN: Income ──────────────────────────────────────────────

const IncomeScreen = () => {
  const { setScreen, income, setIncome } = useAppState();
  const valid = Number(income) > 0;
  return (
    <ScreenShell>
      <TopBack onBack={() => setScreen('welcome')} title="Step 1 of 3" />
      <div style={{ flex: 1, padding: '24px 28px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.025em', fontWeight: 500, marginBottom: 12 }}>
          What do you earn in a typical month?
        </div>
        <div style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.5, marginBottom: 40 }}>
          After taxes. This stays on your phone.
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid #2a3441',
          borderRadius: 14, padding: '22px 20px', display: 'flex', alignItems: 'baseline', gap: 4,
        }}>
          <span style={{ fontSize: 32, color: '#6e7681', fontFamily: 'ui-monospace, monospace' }}>$</span>
          <span style={{ fontSize: 38, fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '-0.02em', color: income ? '#e6edf3' : '#3a4655' }}>
            {income || '0'}
          </span>
          <span style={{ width: 2, height: 34, background: '#58a6ff', marginLeft: 4, animation: 'blink 1s infinite' }}/>
        </div>
        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
      </div>
      <Keypad
        value={income}
        onChange={setIncome}
        onSubmit={() => valid && setScreen('allocate')}
        submitLabel="Continue →"
        submitDisabled={!valid}
      />
    </ScreenShell>
  );
};

// ─── SCREEN: Allocate ────────────────────────────────────────────

const AllocateScreen = () => {
  const { setScreen, income, categories, unassigned, totalAllocated, setCompletedOnboarding } = useAppState();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const canProceed = unassigned === 0;

  return (
    <ScreenShell>
      <TopBack onBack={() => setScreen('income')} title="Step 2 of 3" />
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 28, lineHeight: 1.05, letterSpacing: '-0.025em', fontWeight: 500, marginBottom: 4 }}>
          Give every dollar a job.
        </div>
        <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.5, marginBottom: 20 }}>
          Unassigned must read $0.00 before you can start.
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 16px', borderRadius: 12, marginBottom: 4,
          background: unassigned === 0 ? 'rgba(63,185,80,0.12)'
            : unassigned < 0 ? 'rgba(248,81,73,0.12)'
            : 'rgba(88,166,255,0.1)',
          border: `1px solid ${unassigned === 0 ? 'rgba(63,185,80,0.35)'
            : unassigned < 0 ? 'rgba(248,81,73,0.35)'
            : 'rgba(88,166,255,0.3)'}`,
        }}>
          <div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e' }}>Unassigned</div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 20, fontWeight: 500, marginTop: 3, color: unassigned === 0 ? '#3fb950' : unassigned < 0 ? '#f85149' : '#58a6ff' }}>
              ${fmt(unassigned)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e' }}>Income</div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 16, color: '#e6edf3', marginTop: 3 }}>${fmt(income)}</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px 20px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 4,
        }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e' }}>
            Categories ({categories.length})
          </span>
          <button onClick={() => setEditMode(!editMode)} style={{
            appearance: 'none', border: 0, background: 'transparent',
            color: editMode ? '#58a6ff' : '#8b949e',
            fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: 0,
            fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>{editMode ? 'Done' : 'Edit'}</button>
        </div>
        {categories.map(cat => (
          <AllocRow key={cat.id} cat={cat} editMode={editMode} onTap={() => setEditing(cat.id)} />
        ))}
        <button onClick={() => setAdding(true)} style={{
          appearance: 'none', border: 0, background: 'transparent',
          width: '100%', padding: '14px 0', cursor: 'pointer',
          color: '#58a6ff', fontSize: 15, fontWeight: 500,
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 10,
          textAlign: 'left',
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            border: '1.5px solid #58a6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, lineHeight: 1,
          }}>+</span>
          Add category
        </button>
      </div>
      <div style={{ padding: '0 20px 8px' }}>
        <Btn primary
          disabled={!canProceed}
          onClick={() => { setCompletedOnboarding(true); setScreen('dashboard'); }}>
          {canProceed ? 'Start month →' : `$${fmt(unassigned)} left to assign`}
        </Btn>
      </div>
      {editing && <AllocEditSheet catId={editing} onClose={() => setEditing(null)} />}
      {adding && <AddCategorySheet onClose={() => setAdding(false)} />}
    </ScreenShell>
  );
};

const AllocRow = ({ cat, onTap, editMode }) => {
  const { removeCategory } = useAppState();
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      borderBottom: '1px solid #1c2430',
      paddingRight: editMode ? 0 : 0,
    }}>
      {editMode && (
        <button onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); }} style={{
          appearance: 'none', border: 0, background: 'transparent',
          width: 28, height: 28, borderRadius: '50%',
          marginRight: 10, cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#f85149', fontSize: 20, lineHeight: 1,
          border: '1.5px solid #f85149',
        }} aria-label={`Remove ${cat.name}`}>
          <span style={{ fontSize: 16, marginTop: -2 }}>−</span>
        </button>
      )}
      <button onClick={editMode ? undefined : onTap} disabled={editMode} style={{
        appearance: 'none', border: 0, background: 'transparent',
        flex: 1, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '14px 0',
        cursor: editMode ? 'default' : 'pointer',
        color: '#e6edf3',
      }}>
        <span style={{ fontSize: 16, fontWeight: 400 }}>{cat.name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, color: cat.allocated > 0 ? '#e6edf3' : '#6e7681' }}>
            ${fmt(cat.allocated, { dec: 0 })}
          </span>
          {!editMode && <span style={{ color: '#3a4655', fontSize: 18 }}>›</span>}
        </span>
      </button>
    </div>
  );
};

const AllocEditSheet = ({ catId, onClose }) => {
  const { categories, updateAllocation, unassigned } = useAppState();
  const cat = categories.find(c => c.id === catId);
  const [val, setVal] = useState(String(cat.allocated));
  // How much could this category take on without going negative?
  // current unassigned already excludes cat.allocated's effect, so:
  // projected unassigned = unassigned + cat.allocated - Number(val)
  const proposed = Number(val) || 0;
  const projectedUnassigned = unassigned + cat.allocated - proposed;
  const overBy = projectedUnassigned < 0 ? -projectedUnassigned : 0;
  const isOver = overBy > 0;
  const save = () => {
    if (isOver) return;
    updateAllocation(catId, proposed);
    onClose();
  };
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#151b23', borderRadius: '20px 20px 0 0',
        padding: '20px 0 12px',
        border: '1px solid #2a3441',
      }}>
        <div style={{ width: 36, height: 4, background: '#2a3441', borderRadius: 2, margin: '0 auto 16px' }}/>
        <div style={{ padding: '0 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8b949e' }}>Allocate to</div>
            <div style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6e7681' }}>
              Available <span style={{ color: isOver ? '#f85149' : '#58a6ff', marginLeft: 4 }}>${fmt(projectedUnassigned)}</span>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', marginBottom: 16 }}>{cat.name}</div>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${isOver ? 'rgba(248,81,73,0.55)' : '#2a3441'}`,
            borderRadius: 12, padding: '16px 18px', marginBottom: isOver ? 10 : 4,
            display: 'flex', alignItems: 'baseline', gap: 4,
            transition: 'border-color 0.15s',
          }}>
            <span style={{ fontSize: 22, color: '#6e7681', fontFamily: 'ui-monospace, monospace' }}>$</span>
            <span style={{ fontSize: 26, fontFamily: 'ui-monospace, monospace', fontWeight: 500, color: val ? (isOver ? '#f85149' : '#e6edf3') : '#3a4655' }}>
              {val || '0'}
            </span>
          </div>
          {isOver && (
            <div style={{
              background: 'rgba(248,81,73,0.1)',
              border: '1px solid rgba(248,81,73,0.3)',
              borderRadius: 10, padding: '10px 12px',
              fontSize: 12, color: '#ffb3ad', lineHeight: 1.45,
              marginBottom: 4,
            }}>
              <span style={{ fontFamily: 'ui-monospace, monospace', color: '#f85149', fontWeight: 500 }}>${fmt(overBy)} over.</span> You don't have enough unassigned income. Lower this amount or go back and adjust another category.
            </div>
          )}
        </div>
        <Keypad value={val} onChange={setVal} onSubmit={save} submitLabel={isOver ? 'Over budget' : 'Save'} submitDisabled={isOver} />
      </div>
    </div>
  );
};

const AddCategorySheet = ({ onClose }) => {
  const { addCategory } = useAppState();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const canSave = name.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    addCategory(name.trim(), Number(amount) || 0);
    onClose();
  };
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#151b23', borderRadius: '20px 20px 0 0',
        padding: '20px 0 12px',
        border: '1px solid #2a3441',
      }}>
        <div style={{ width: 36, height: 4, background: '#2a3441', borderRadius: 2, margin: '0 auto 16px' }}/>
        <div style={{ padding: '0 28px' }}>
          <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 8 }}>New category</div>
          <input
            autoFocus
            placeholder="e.g. Coffee, Gym, Gifts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              appearance: 'none', border: '1px solid #2a3441',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 12, padding: '14px 16px',
              fontSize: 17, fontWeight: 500,
              color: '#e6edf3', outline: 'none',
              marginBottom: 10,
            }}
          />
          <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 8, marginTop: 6 }}>Amount</div>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid #2a3441',
            borderRadius: 12, padding: '16px 18px', marginBottom: 4,
            display: 'flex', alignItems: 'baseline', gap: 4,
          }}>
            <span style={{ fontSize: 22, color: '#6e7681', fontFamily: 'ui-monospace, monospace' }}>$</span>
            <span style={{ fontSize: 26, fontFamily: 'ui-monospace, monospace', fontWeight: 500, color: amount ? '#e6edf3' : '#3a4655' }}>
              {amount || '0'}
            </span>
          </div>
        </div>
        <Keypad value={amount} onChange={setAmount} onSubmit={save} submitLabel="Add category" submitDisabled={!canSave} />
      </div>
    </div>
  );
};

// ─── SCREEN: Dashboard ───────────────────────────────────────────

const DashboardScreen = () => {
  const { categories, income, incomeNum, setScreen, setActiveCategory } = useAppState();
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const pct = incomeNum > 0 ? Math.round((totalSpent / incomeNum) * 100) : 0;
  const dayOfMonth = 22;

  return (
    <ScreenShell padTop={62}>
      <div style={{ padding: '8px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <BPLogoMark size={28} />
          <button onClick={() => setScreen('settings')} style={{
            appearance: 'none', border: 0, background: 'rgba(255,255,255,0.05)',
            width: 36, height: 36, borderRadius: 18, color: '#8b949e',
            fontSize: 16, cursor: 'pointer',
          }}>⚙</button>
        </div>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>
          April · Day {dayOfMonth} of 30
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 40, fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '-0.025em' }}>
            ${fmt(totalSpent, { dec: 0 })}
          </span>
          <span style={{ fontSize: 20, color: '#6e7681', fontFamily: 'ui-monospace, monospace' }}>
            / ${fmt(incomeNum, { dec: 0 })}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#3fb950', marginTop: 3, marginBottom: 18 }}>
          ● {pct}% spent · on pace
        </div>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 10 }}>
          Categories
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 12px' }}>
        {categories.filter(c => c.id !== 'savings').map(cat => {
          const st = statusFor(cat.spent, cat.allocated);
          const s = STATUS[st];
          const barPct = cat.allocated > 0 ? Math.min(100, (cat.spent / cat.allocated) * 100) : 0;
          const overBar = cat.spent > cat.allocated;
          return (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setScreen('category'); }} style={{
              appearance: 'none', border: 0, background: '#151b23',
              borderRadius: 14, padding: 14, marginBottom: 8,
              width: '100%', textAlign: 'left', cursor: 'pointer',
              color: '#e6edf3', display: 'block',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }}/>
                  {cat.name}
                </span>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: '#8b949e' }}>
                  ${fmt(cat.spent, { dec: 0 })} / ${fmt(cat.allocated, { dec: 0 })}
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${barPct}%`, background: s.color, borderRadius: 2 }}/>
              </div>
              {overBar && <div style={{ fontSize: 11, color: '#f85149', marginTop: 8, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>
                ${fmt(cat.spent - cat.allocated, { dec: 0 })} over · tap to borrow
              </div>}
            </button>
          );
        })}
      </div>
      <div style={{ padding: '8px 20px 4px', borderTop: '1px solid #1c2430', background: '#0d1117', flexShrink: 0 }}>
        <Btn primary onClick={() => setScreen('add-tx')}>+ Log a transaction</Btn>
      </div>
      <TabBar />
    </ScreenShell>
  );
};

// ─── SCREEN: Category detail / Borrow ────────────────────────────

const CategoryScreen = () => {
  const { categories, activeCategory, setScreen } = useAppState();
  const cat = categories.find(c => c.id === activeCategory);
  if (!cat) return null;
  const over = cat.spent > cat.allocated;
  const diff = cat.spent - cat.allocated;
  const st = statusFor(cat.spent, cat.allocated);
  const s = STATUS[st];

  const [borrowing, setBorrowing] = useState(false);

  // Dummy transactions for this category
  const txs = [
    { merchant: 'Trader Joes', amount: 42.18, day: 'Apr 21' },
    { merchant: 'Safeway', amount: 68.94, day: 'Apr 18' },
    { merchant: 'Whole Foods', amount: 14.22, day: 'Apr 14' },
  ];

  return (
    <ScreenShell>
      <TopBack onBack={() => setScreen('dashboard')} title={cat.name} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: s.color, marginBottom: 8 }}>
            ● {s.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 44, fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '-0.025em', color: over ? '#f85149' : '#e6edf3' }}>
              ${fmt(cat.spent, { dec: 0 })}
            </span>
            <span style={{ fontSize: 18, color: '#6e7681', fontFamily: 'ui-monospace, monospace' }}>
              / ${fmt(cat.allocated, { dec: 0 })}
            </span>
          </div>
          {over && (
            <div style={{ fontSize: 14, color: '#f85149', marginBottom: 20 }}>
              ${fmt(diff, { dec: 0 })} over budget
            </div>
          )}
          {!over && (
            <div style={{ fontSize: 14, color: s.color, marginBottom: 20 }}>
              ${fmt(cat.allocated - cat.spent, { dec: 0 })} remaining
            </div>
          )}
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ height: '100%', width: `${Math.min(100, (cat.spent / cat.allocated) * 100)}%`, background: s.color, borderRadius: 3 }}/>
          </div>
        </div>

        {over && !borrowing && (
          <div style={{ padding: '0 20px', marginBottom: 24 }}>
            <div style={{
              background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.3)',
              borderRadius: 14, padding: 16,
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Where's it coming from?</div>
              <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.5, marginBottom: 14 }}>
                Every dollar has to come from somewhere. Borrow from another category or log it as a loan to yourself.
              </div>
              <Btn primary onClick={() => setBorrowing(true)}>Resolve overage →</Btn>
            </div>
          </div>
        )}

        {borrowing && (
          <div style={{ padding: '0 20px', marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 10 }}>
              Borrow ${fmt(diff, { dec: 0 })} from
            </div>
            {categories.filter(c => c.id !== cat.id && (c.allocated - c.spent) >= diff && c.id !== 'savings').map(c => (
              <div key={c.id} style={{
                background: '#151b23', borderRadius: 12, padding: 14, marginBottom: 8,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2, fontFamily: 'ui-monospace, monospace' }}>${fmt(c.allocated - c.spent, { dec: 0 })} available</div>
                </div>
                <span style={{ color: '#58a6ff', fontSize: 18 }}>→</span>
              </div>
            ))}
            <div style={{
              background: '#151b23', borderRadius: 12, padding: 14, marginBottom: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderLeft: '3px solid #d29922',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>Log as loan to self</div>
                <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>Pay back next month</div>
              </div>
              <span style={{ color: '#d29922', fontSize: 18 }}>→</span>
            </div>
          </div>
        )}

        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 12 }}>
            Recent
          </div>
          {txs.map((t, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 0', borderBottom: i < txs.length - 1 ? '1px solid #1c2430' : 'none',
            }}>
              <div>
                <div style={{ fontSize: 15 }}>{t.merchant}</div>
                <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{t.day}</div>
              </div>
              <div style={{ fontSize: 15, fontFamily: 'ui-monospace, monospace' }}>-${fmt(t.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
};

// ─── SCREEN: Add Transaction ─────────────────────────────────────

const AddTxScreen = () => {
  const { setScreen, categories, txAmount, setTxAmount, txCategory, setTxCategory, addTransaction } = useAppState();
  const valid = Number(txAmount) > 0;
  const submit = () => {
    if (!valid) return;
    addTransaction(txCategory, Number(txAmount));
    setTxAmount('');
    setScreen('dashboard');
  };
  const activeCat = categories.find(c => c.id === txCategory);
  return (
    <ScreenShell>
      <TopBack onBack={() => setScreen('dashboard')} title="Log spend" />
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 10 }}>
          Amount
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
          <span style={{ fontSize: 36, color: '#6e7681', fontFamily: 'ui-monospace, monospace' }}>$</span>
          <span style={{ fontSize: 56, fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '-0.03em', color: txAmount ? '#e6edf3' : '#3a4655' }}>
            {txAmount || '0'}
          </span>
        </div>
        <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 10 }}>
          Category
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginRight: -24, paddingRight: 24 }}>
          {categories.filter(c => c.id !== 'savings').map(c => (
            <button key={c.id} onClick={() => setTxCategory(c.id)} style={{
              appearance: 'none',
              padding: '8px 14px', borderRadius: 999,
              background: c.id === txCategory ? '#58a6ff' : 'rgba(255,255,255,0.04)',
              border: c.id === txCategory ? 0 : '1px solid #2a3441',
              color: c.id === txCategory ? '#0d1117' : '#e6edf3',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0,
            }}>{c.name}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}/>
      <Keypad value={txAmount} onChange={setTxAmount} onSubmit={submit} submitLabel={`Log to ${activeCat?.name || ''}`} submitDisabled={!valid}/>
    </ScreenShell>
  );
};

// ─── SCREEN: Settings ────────────────────────────────────────────

const SettingsScreen = () => {
  const { setScreen, resetPrototype } = useAppState();
  const Row = ({ title, value, accent }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 0', borderBottom: '1px solid #1c2430',
    }}>
      <span style={{ fontSize: 15 }}>{title}</span>
      <span style={{ fontSize: 13, color: accent || '#8b949e', fontFamily: accent ? 'ui-monospace, monospace' : 'inherit' }}>{value}</span>
    </div>
  );
  return (
    <ScreenShell padBottom={0}>
      <TopBack onBack={() => setScreen('dashboard')} title="Settings" />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3fb950', marginBottom: 10 }}>● Privacy</div>
        <Row title="Data location" value="On this device" accent="#3fb950" />
        <Row title="Cloud sync" value="Never" accent="#3fb950" />
        <Row title="Third-party trackers" value="0" accent="#3fb950" />
        <Row title="Export backup" value="Encrypted file" />
        <div style={{ height: 32 }} />
        <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 10 }}>Budget</div>
        <Row title="Monthly reset day" value="1st" />
        <Row title="Auto-sweep leftovers" value="On" />
        <Row title="Currency" value="USD" />
        <div style={{ height: 32 }} />
        <Btn onClick={() => setScreen('reset')}>Trigger month-end reset</Btn>
        <div style={{ height: 12 }} />
        <Btn onClick={resetPrototype}>Reset prototype</Btn>
      </div>
      <TabBar />
    </ScreenShell>
  );
};

// ─── Router ──────────────────────────────────────────────────────

const ScreenRouter = () => {
  const { screen, toast } = useAppState();
  const Screen = {
    welcome: WelcomeScreen,
    income: IncomeScreen,
    allocate: AllocateScreen,
    dashboard: DashboardScreen,
    category: CategoryScreen,
    'add-tx': AddTxScreen,
    settings: SettingsScreen,
    savings: SavingsScreen,
    loans: LoansScreen,
    reset: ResetScreen,
  }[screen] || WelcomeScreen;
  return (
    <>
      <Screen />
      {toast && (
        <div style={{
          position: 'absolute', bottom: 80, left: 20, right: 20,
          background: '#151b23', border: '1px solid #2a3441',
          borderRadius: 12, padding: '14px 18px',
          fontSize: 14, color: '#e6edf3', zIndex: 200,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950' }}/>
          {toast}
        </div>
      )}
    </>
  );
};

Object.assign(window, {
  ScreenRouter, WelcomeScreen, IncomeScreen, AllocateScreen,
  DashboardScreen, CategoryScreen, AddTxScreen, SettingsScreen,
});
