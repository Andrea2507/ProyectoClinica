import { useCallback, useEffect, useState } from 'react';
import { fetchJson } from '../services/api.js';

export function useApiData(path, autoLoad = true) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState('');

  const load = useCallback(async (nextPath = path) => {
    setLoading(true);
    setError('');

    try {
      const result = await fetchJson(nextPath);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (autoLoad) {
      load(path);
    }
  }, [autoLoad, load, path]);

  return { data, setData, loading, error, setError, load };
}
