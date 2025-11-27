import { useState } from 'react'
import { formatCurrency, calculateROI } from '../lib/utils'

export default function ROICalculator() {
  const [inputs, setInputs] = useState({
    revenue: '', cost: '', time: '1', commissionRate: '50', avgOrderValue: '100', conversionRate: '2'
  })

  const revenue = parseFloat(inputs.revenue) || 0
  const cost = parseFloat(inputs.cost) || 0
  const roi = calculateROI(revenue, cost)
  const profit = revenue - cost

  const commissionRate = parseFloat(inputs.commissionRate) / 100 || 0.5
  const avgOrderValue = parseFloat(inputs.avgOrderValue) || 100
  const conversionRate = parseFloat(inputs.conversionRate) / 100 || 0.02
  const avgCommission = avgOrderValue * commissionRate
  const requiredSales = cost > 0 ? Math.ceil(cost / avgCommission) : 0
  const requiredTraffic = conversionRate > 0 ? Math.ceil(requiredSales / conversionRate) : 0

  return (
    <div className="roi-page fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">💰 ROI Calculator</h3></div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group"><label>Total Revenue ($)</label><input type="number" value={inputs.revenue} onChange={(e) => setInputs({ ...inputs, revenue: e.target.value })} placeholder="e.g., 5000" /></div>
            <div className="form-group"><label>Total Costs ($)</label><input type="number" value={inputs.cost} onChange={(e) => setInputs({ ...inputs, cost: e.target.value })} placeholder="e.g., 1000" /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Profit</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: profit >= 0 ? 'var(--success)' : 'var(--error)' }}>{formatCurrency(profit)}</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ROI</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{roi}%</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Revenue</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatCurrency(revenue)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">🎯 Break-Even Calculator</h3></div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group"><label>Commission Rate (%)</label><input type="number" value={inputs.commissionRate} onChange={(e) => setInputs({ ...inputs, commissionRate: e.target.value })} placeholder="50" /></div>
            <div className="form-group"><label>Avg Order Value ($)</label><input type="number" value={inputs.avgOrderValue} onChange={(e) => setInputs({ ...inputs, avgOrderValue: e.target.value })} placeholder="100" /></div>
            <div className="form-group"><label>Conversion Rate (%)</label><input type="number" value={inputs.conversionRate} onChange={(e) => setInputs({ ...inputs, conversionRate: e.target.value })} placeholder="2" /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Avg Commission</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(avgCommission)}</div>
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Sales to Break-Even</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{requiredSales}</div>
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Traffic Needed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{requiredTraffic.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">📚 Affiliate Marketing Formulas</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { name: 'ROI', formula: '((Revenue - Cost) / Cost) × 100', desc: 'Return on Investment percentage' },
              { name: 'Conversion Rate', formula: '(Conversions / Clicks) × 100', desc: 'Percentage of visitors who convert' },
              { name: 'EPC', formula: 'Revenue / Clicks', desc: 'Earnings Per Click' },
              { name: 'CTR', formula: '(Clicks / Impressions) × 100', desc: 'Click-Through Rate' }
            ].map((f, i) => (
              <div key={i} style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{f.name}</h4>
                <code style={{ display: 'block', padding: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{f.formula}</code>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

