// Budget Plan — additional screens (Savings, Loans, Month-end reset) + TabBar

// ─── TabBar ──────────────────────────────────────────────────────

const TabBar = () => {
  const { screen, setScreen } = useAppState();
  // Which tab is active
  const tabFor = {
    dashboard: 'home', category: 'home', 'add-tx': 'home',
    savings: 'savings',
    loans: 'loans',
    settings: 'settings',
  };
  const active = tabFor[screen] || 'home';
  const tabs = [
    { id: 'home',     label: 'Home',     target: 'dashboard', icon: TabHomeIcon },
    { id: 'savings',  label: 'Savings',  target: 'savings',   icon: TabSavingsIcon },
    { id: 'loans',    label: 'Loans',    target: 'loans',     icon: TabLoansIcon },
    { id: 'settings', label: 'Settings', target: 'settings',  icon: TabSettingsIcon },
  ];
  return (
    <div style={{
      display: 'flex', background: '#0d1117',
      borderTop: '1px solid #1c2430',
      padding: '8px 8px 4px',
      flexShrink: 0,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        const Icon = t.icon;
        return (
          <button key={t.id} onClick={() => setScreen(t.target)} style={{
            flex: 1, appearance: 'none', border: 0, background: 'transparent',
            padding: '8px 4px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: isActive ? '#58a6ff' : '#6e7681',
          }}>
            <Icon active={isActive} />
            <span style={{
              fontSize: 10, fontWeight: 500,
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const TabHomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="4" y="5" width="14" height="2.4" rx="0.8" fill={active ? '#58a6ff' : '#6e7681'} />
    <rect x="4" y="9.8" width="10" height="2.4" rx="0.8" fill={active ? '#58a6ff' : '#6e7681'} />
    <rect x="4" y="14.6" width="6" height="2.4" rx="0.8" fill={active ? '#58a6ff' : '#6e7681'} />
  </svg>
);
const TabSavingsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="7" stroke={active ? '#58a6ff' : '#6e7681'} strokeWidth="2" fill="none"/>
    <circle cx="11" cy="11" r="2.2" fill={active ? '#58a6ff' : '#6e7681'}/>
  </svg>
);
const TabLoansIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M4 8h14M4 14h14" stroke={active ? '#58a6ff' : '#6e7681'} strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 5l4 3-4 3" stroke={active ? '#58a6ff' : '#6e7681'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M8 17l-4-3 4-3" stroke={active ? '#58a6ff' : '#6e7681'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);
const TabSettingsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="2.5" stroke={active ? '#58a6ff' : '#6e7681'} strokeWidth="2" fill="none"/>
    <path d="M11 3v2M11 17v2M3 11h2M17 11h2M5.6 5.6l1.4 1.4M15 15l1.4 1.4M16.4 5.6L15 7M7 15l-1.4 1.4" stroke={active ? '#58a6ff' : '#6e7681'} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

// ─── SCREEN: Savings ─────────────────────────────────────────────

const SavingsScreen = () => {
  const { savingsGoals, setSavingsGoals } = useAppState();
  const totalSaved  = savingsGoals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = savingsGoals.reduce((s, g) => s + g.target, 0);
  const monthlyAuto = savingsGoals.reduce((s, g) => s + g.monthly, 0);

  return (
    <ScreenShell padBottom={0}>
      <div style={{ padding: '8px 24px 0', flexShrink: 0 }}>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>
          Savings
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 40, fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '-0.025em' }}>
            ${fmt(totalSaved, { dec: 0 })}
          </span>
          <span style={{ fontSize: 18, color: '#6e7681', fontFamily: 'ui-monospace, monospace' }}>
            / ${fmt(totalTarget, { dec: 0 })}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#3fb950', marginTop: 4, marginBottom: 16 }}>
          ● +${fmt(monthlyAuto, { dec: 0 })}/mo auto-set this month
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 20px 16px' }}>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 10, padding: '0 4px' }}>
          Goals
        </div>
        {savingsGoals.map(g => {
          const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
          const monthsLeft = g.monthly > 0 ? Math.ceil((g.target - g.saved) / g.monthly) : 0;
          return (
            <div key={g.id} style={{
              background: '#151b23', borderRadius: 14, padding: 16, marginBottom: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 3 }}>{g.name}</div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#8b949e' }}>
                    ${fmt(g.saved, { dec: 0 })} / ${fmt(g.target, { dec: 0 })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 20, fontWeight: 500, color: '#58a6ff', letterSpacing: '-0.02em' }}>
                    {Math.round(pct)}%
                  </div>
                  <div style={{ fontSize: 11, color: '#6e7681', marginTop: 1 }}>
                    {monthsLeft} mo left
                  </div>
                </div>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: '#58a6ff', borderRadius: 2 }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: '#8b949e' }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace', color: '#e6edf3' }}>${g.monthly}</span>
                  <span style={{ marginLeft: 4 }}>/mo auto-set</span>
                </span>
                <button style={{
                  appearance: 'none', border: '1px solid #2a3441', background: 'transparent',
                  color: '#8b949e', fontSize: 11, padding: '4px 10px',
                  borderRadius: 999, cursor: 'pointer',
                  fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>Adjust</button>
              </div>
            </div>
          );
        })}
        <button style={{
          appearance: 'none', border: '1px dashed #2a3441', background: 'transparent',
          width: '100%', padding: '18px', borderRadius: 14,
          color: '#8b949e', fontSize: 14, cursor: 'pointer', marginTop: 6,
          fontFamily: 'inherit',
        }}>+ New goal</button>
      </div>
      <TabBar />
    </ScreenShell>
  );
};

// ─── SCREEN: Loans ───────────────────────────────────────────────

const LoansScreen = () => {
  const { loans } = useAppState();
  const owed = loans.filter(l => l.kind === 'owed').reduce((s, l) => s + l.amount, 0);
  const owe  = loans.filter(l => l.kind === 'owe').reduce((s, l) => s + l.amount, 0);
  const self = loans.filter(l => l.kind === 'self').reduce((s, l) => s + l.amount, 0);
  const net = owed - owe;

  const LoanCard = ({ loan }) => {
    const meta = {
      owe:  { label: 'You owe',      tint: '#f85149', sign: '-' },
      owed: { label: 'Owed to you',  tint: '#3fb950', sign: '+' },
      self: { label: 'Loan to self', tint: '#d29922', sign: '↻' },
    }[loan.kind];
    return (
      <div style={{
        background: '#151b23', borderRadius: 12, padding: '14px 16px',
        marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderLeft: `3px solid ${meta.tint}`,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{loan.party}</div>
          <div style={{ fontSize: 12, color: '#8b949e' }}>
            {loan.note}
            {loan.due && <span style={{ fontFamily: 'ui-monospace, monospace', marginLeft: 8 }}>· due {loan.due}</span>}
          </div>
        </div>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 16, fontWeight: 500, color: meta.tint }}>
          {meta.sign}${fmt(loan.amount, { dec: 0 })}
        </div>
      </div>
    );
  };

  const Summary = ({ label, amount, color }) => (
    <div style={{ flex: 1, padding: '12px 14px', background: '#151b23', borderRadius: 10 }}>
      <div style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 16, fontWeight: 500, color }}>${fmt(amount, { dec: 0 })}</div>
    </div>
  );

  return (
    <ScreenShell padBottom={0}>
      <div style={{ padding: '8px 24px 0', flexShrink: 0 }}>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>
          Loans
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 40, fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '-0.025em', color: net >= 0 ? '#e6edf3' : '#f85149' }}>
            {net >= 0 ? '+' : '-'}${fmt(Math.abs(net), { dec: 0 })}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 14 }}>
          Net balance
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          <Summary label="Owed you"   amount={owed} color="#3fb950" />
          <Summary label="You owe"    amount={owe}  color="#f85149" />
          <Summary label="To self"    amount={self} color="#d29922" />
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 16px' }}>
        {['owe', 'owed', 'self'].map(kind => {
          const group = loans.filter(l => l.kind === kind);
          if (group.length === 0) return null;
          const labels = { owe: 'You owe', owed: 'Owed to you', self: 'Loan to self' };
          return (
            <div key={kind} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 8, padding: '0 4px' }}>
                {labels[kind]}
              </div>
              {group.map(l => <LoanCard key={l.id} loan={l} />)}
            </div>
          );
        })}
        <button style={{
          appearance: 'none', border: '1px dashed #2a3441', background: 'transparent',
          width: '100%', padding: '16px', borderRadius: 12,
          color: '#8b949e', fontSize: 14, cursor: 'pointer',
          fontFamily: 'inherit',
        }}>+ Record a loan</button>
      </div>
      <TabBar />
    </ScreenShell>
  );
};

// ─── SCREEN: Month-end Reset ─────────────────────────────────────

const ResetScreen = () => {
  const { categories, income, setScreen } = useAppState();
  const [step, setStep] = useState(1); // 1=summary, 2=sweep choice, 3=confirm

  const leftovers = categories
    .filter(c => c.id !== 'rent' && c.id !== 'savings')
    .map(c => ({ ...c, leftover: Math.max(0, c.allocated - c.spent) }))
    .filter(c => c.leftover > 0);
  const totalLeft = leftovers.reduce((s, c) => s + c.leftover, 0);
  const overspent = categories.filter(c => c.spent > c.allocated);

  return (
    <ScreenShell>
      <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d29922', marginBottom: 8 }}>
          ● End of month · Apr 30
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.08, letterSpacing: '-0.025em', fontWeight: 500, marginBottom: 14 }}>
          {step === 1 && 'April wrap-up.'}
          {step === 2 && 'Sweep the leftovers.'}
          {step === 3 && 'Ready for May?'}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 24px 20px' }}>
        {step === 1 && (
          <>
            <div style={{
              background: '#151b23', borderRadius: 14, padding: 16, marginBottom: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e' }}>Income</div>
                <div style={{ fontSize: 20, fontFamily: 'ui-monospace, monospace', fontWeight: 500, marginTop: 4 }}>${fmt(income, { dec: 0 })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e' }}>Spent</div>
                <div style={{ fontSize: 20, fontFamily: 'ui-monospace, monospace', fontWeight: 500, marginTop: 4 }}>${fmt(categories.reduce((s, c) => s + c.spent, 0), { dec: 0 })}</div>
              </div>
            </div>

            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginTop: 16, marginBottom: 10, padding: '0 4px' }}>
              Leftovers ({leftovers.length})
            </div>
            {leftovers.map(c => (
              <div key={c.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid #1c2430',
              }}>
                <span style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950' }}/>
                  {c.name}
                </span>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: '#3fb950' }}>+${fmt(c.leftover, { dec: 0 })}</span>
              </div>
            ))}

            {overspent.length > 0 && (
              <>
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginTop: 20, marginBottom: 10, padding: '0 4px' }}>
                  Overspent
                </div>
                {overspent.map(c => (
                  <div key={c.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: '1px solid #1c2430',
                  }}>
                    <span style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f85149' }}/>
                      {c.name}
                    </span>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: '#f85149' }}>-${fmt(c.spent - c.allocated, { dec: 0 })}</span>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.5, marginBottom: 20 }}>
              You have <span style={{ color: '#3fb950', fontFamily: 'ui-monospace, monospace' }}>${fmt(totalLeft, { dec: 0 })}</span> left over.
              Where should it go?
            </div>
            <SweepOption
              title="Emergency fund"
              sub="Current: $6,420 / $10,000"
              amount={totalLeft}
              recommended
            />
            <SweepOption title="Next month's buffer" sub="Roll into May's unassigned" amount={totalLeft} />
            <SweepOption title="Lisbon trip" sub="Current: $1,280 / $3,500" amount={totalLeft} />
            <SweepOption title="Split across all goals" sub="Pro-rated by target size" amount={totalLeft} />
          </>
        )}

        {step === 3 && (
          <>
            <div style={{
              background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.3)',
              borderRadius: 14, padding: 20, marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3fb950', marginBottom: 10 }}>● Sweep queued</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>To Emergency fund</span>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 16, color: '#3fb950' }}>+${fmt(totalLeft, { dec: 0 })}</span>
              </div>
              <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.5 }}>
                New balance: ${fmt(6420 + totalLeft, { dec: 0 })} / $10,000 ({Math.round(((6420 + totalLeft) / 10000) * 100)}%)
              </div>
            </div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b949e', marginBottom: 10, padding: '0 4px' }}>
              May allocations
            </div>
            <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.6, marginBottom: 14 }}>
              We'll copy April's allocations forward. Adjust any category before income lands.
            </div>
            {categories.slice(0, 4).map(c => (
              <div key={c.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid #1c2430',
              }}>
                <span style={{ fontSize: 14 }}>{c.name}</span>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: '#8b949e' }}>${fmt(c.allocated, { dec: 0 })}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ padding: '12px 20px 8px', borderTop: '1px solid #1c2430', display: 'flex', gap: 10, flexShrink: 0 }}>
        {step > 1 && (
          <Btn onClick={() => setStep(step - 1)} style={{ flex: '0 0 38%' }}>Back</Btn>
        )}
        <Btn primary
          onClick={() => step < 3 ? setStep(step + 1) : setScreen('dashboard')}>
          {step === 1 && 'Continue →'}
          {step === 2 && 'Confirm sweep →'}
          {step === 3 && 'Start May'}
        </Btn>
      </div>
    </ScreenShell>
  );
};

const SweepOption = ({ title, sub, amount, recommended }) => {
  const [selected, setSelected] = useState(recommended);
  return (
    <button onClick={() => setSelected(!selected)} style={{
      appearance: 'none', border: selected ? '1px solid #58a6ff' : '1px solid #2a3441',
      background: selected ? 'rgba(88,166,255,0.08)' : '#151b23',
      width: '100%', padding: 16, borderRadius: 14, marginBottom: 8,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      cursor: 'pointer', textAlign: 'left', color: '#e6edf3',
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 3 }}>
          {title}
          {recommended && (
            <span style={{
              marginLeft: 8, fontSize: 9, padding: '2px 6px',
              background: 'rgba(88,166,255,0.15)', color: '#58a6ff',
              borderRadius: 3, fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.1em', textTransform: 'uppercase', verticalAlign: 'middle',
            }}>Recommended</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#8b949e' }}>{sub}</div>
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        border: `2px solid ${selected ? '#58a6ff' : '#3a4655'}`,
        background: selected ? '#58a6ff' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && <span style={{ color: '#0d1117', fontSize: 12, fontWeight: 700 }}>✓</span>}
      </div>
    </button>
  );
};

Object.assign(window, { TabBar, SavingsScreen, LoansScreen, ResetScreen });
