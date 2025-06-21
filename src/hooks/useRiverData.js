import { useState, useEffect, useCallback } from 'react';
import { riverDataService } from '../services/riverDataService';

export const useRiverData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 从服务获取河流图数据
      const riverData = await riverDataService.getRiverData();
      setData(riverData);
    } catch (err) {
      setError(err);
      console.error('获取河流图数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

export const useRiverDetailData = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetailData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 从服务获取详情数据
      const detailData = await riverDataService.getRiverDetailData(id);
      setData(detailData);
    } catch (err) {
      setError(err);
      console.error('获取河流图详情数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = useCallback(() => {
    fetchDetailData();
  }, [fetchDetailData]);

  useEffect(() => {
    fetchDetailData();
  }, [fetchDetailData]);

  return {
    data,
    loading,
    error,
    refetch
  };
}; 