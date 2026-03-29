import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth, getToken } from '../services/api';

export function useLedger(year, month) {
  const [ledgerData, setLedgerData] = useState({ expenses: {}, cashin: {} });
  const [prevBalance, setPrevBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLedger = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
        const res = await fetchWithAuth(`/ledger/?year=${year}&month=${month}`);
        if(res.ok) {
            const data = await res.json();
            setLedgerData(data.ledger);
            setPrevBalance(data.prev_balance);
        } else {
            setError("Failed to load ledger data");
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const addEntry = async (type, payload) => {
    const endpoint = type === 'expense' ? '/expenses/' : '/cashin/';
    const res = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    
    if(res.ok) {
        await fetchLedger();
        return true;
    }
    return false;
  };

  const updateEntry = async (type, id, payload) => {
    const endpoint = type === 'expense' ? `/expenses/${id}/` : `/cashin/${id}/`;
    const res = await fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    if (res.ok) {
        await fetchLedger();
        return true;
    }
    return false;
  };

  const deleteEntry = async (type, id) => {
    const endpoint = type === 'expense' ? `/expenses/${id}/` : `/cashin/${id}/`;
    const res = await fetchWithAuth(endpoint, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
        await fetchLedger();
        return true;
    }
    return false;
  };

  return { ledgerData, prevBalance, loading, error, addEntry, updateEntry, deleteEntry, refetch: fetchLedger };
}
