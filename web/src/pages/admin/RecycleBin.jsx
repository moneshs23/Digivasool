import { useEffect, useState } from 'react';
import { Trash2, RotateCcw, XCircle } from 'lucide-react';
import { apiFetch } from '../../utils/api';

const money = value => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

export default function RecycleBin() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    apiFetch('/api/loans/deleted')
      .then(r => r.json())
      .then(data => setLoans(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function restoreLoan(loan) {
    setBusyId(loan.id);
    try {
      const res = await apiFetch(`/api/loans/${loan.id}/restore`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Restore failed');
      setLoans(current => current.filter(item => item.id !== loan.id));
    } catch (err) {
      alert('Error restoring borrower: ' + err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteForever(loan) {
    const confirmed = window.confirm(
      `Permanently delete ${loan.customer_name}'s loan? This cannot be undone and will remove all payment history.`
    );
    if (!confirmed) return;
    setBusyId(loan.id);
    try {
      const res = await apiFetch(`/api/loans/${loan.id}/permanent`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Delete failed');
      setLoans(current => current.filter(item => item.id !== loan.id));
    } catch (err) {
      alert('Error deleting borrower: ' + err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="customer-page animate-fadeUp">
      <div className="customer-page-header">
        <div>
          <div className="page-title">Recycle Bin</div>
          <div className="page-subtitle">{loans.length} deleted borrower{loans.length === 1 ? '' : 's'}</div>
        </div>
      </div>

      <div className="table-wrap customer-table-card">
        {loading ? (
          <div className="customer-skeleton-list">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton customer-skeleton-row" />)}
          </div>
        ) : loans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Trash2 size={36} /></div>
            <div className="empty-title">Recycle bin is empty</div>
            <p>Borrowers you delete will show up here so you can restore them if needed.</p>
          </div>
        ) : (
          <div className="recycle-bin-list">
            {loans.map(loan => (
              <div key={loan.id} className="recycle-bin-row">
                <div className="customer-avatar">{loan.customer_name.charAt(0).toUpperCase()}</div>
                <div className="recycle-bin-info">
                  <strong>{loan.customer_name}</strong>
                  <span>{loan.customer_phone || 'No phone'} · Outstanding {money(loan.pending_amount)}</span>
                  <span className="recycle-bin-date">
                    Deleted {loan.deleted_at ? new Date(loan.deleted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'recently'}
                  </span>
                </div>
                <div className="recycle-bin-actions">
                  <button className="btn btn-secondary" disabled={busyId === loan.id} onClick={() => restoreLoan(loan)}>
                    <RotateCcw size={14} /> Restore
                  </button>
                  <button className="btn btn-danger" disabled={busyId === loan.id} onClick={() => deleteForever(loan)}>
                    <XCircle size={14} /> Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
