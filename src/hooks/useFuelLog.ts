import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface FuelEntry {
  id: string;
  date: string;
  km: number;
  liters: number;
  pricePerLiter: number;
  user_id?: string;
}

export interface CalculatedEntry extends FuelEntry {
  totalCost: number;
  distance?: number;
  consumption?: number; // L/100km
  pricePer100km?: number;
}

export interface Stats {
  totalKm: number;
  totalLiters: number;
  totalSpent: number;
  avgConsumption: number;
  avgPricePer100km: number;
}

export const useFuelLog = (userId?: string, dateFilter?: { start?: Date; end?: Date }) => {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    // Only set loading if it's not already true to avoid redundant renders
    setLoading(prev => !prev ? true : prev);
    
    const { data, error } = await supabase
      .from('fuel_entries')
      .select('id, date, km, liters, price_per_liter, user_id')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching entries:', error);
    } else {
      const mappedData = (data || []).map(item => ({
        id: item.id,
        date: item.date,
        km: item.km,
        liters: item.liters,
        pricePerLiter: item.price_per_liter,
        user_id: item.user_id
      }));
      setEntries(mappedData);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchEntries();
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [userId, fetchEntries]);

  // Intermediate step: Calculate values for ALL entries to maintain calculation continuity
  const allCalculatedEntries = useMemo((): CalculatedEntry[] => {
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sorted.map((entry, index) => {
      const totalCost = entry.liters * entry.pricePerLiter;
      
      let distance: number | undefined;
      let consumption: number | undefined;
      let pricePer100km: number | undefined;

      if (index > 0) {
        distance = entry.km - sorted[index - 1].km;
        if (distance > 0) {
          consumption = (entry.liters / distance) * 100;
          pricePer100km = (totalCost / distance) * 100;
        }
      }

      return {
        ...entry,
        totalCost,
        distance,
        consumption,
        pricePer100km,
      };
    });
  }, [entries]);

  // Final step: Filter calculated entries based on the date range
  const filteredCalculatedEntries = useMemo((): CalculatedEntry[] => {
    let filtered = allCalculatedEntries;

    if (dateFilter?.start) {
      const start = new Date(dateFilter.start).getTime();
      filtered = filtered.filter(e => new Date(e.date).getTime() >= start);
    }
    if (dateFilter?.end) {
      const end = new Date(dateFilter.end).getTime();
      filtered = filtered.filter(e => new Date(e.date).getTime() <= end);
    }

    return [...filtered].reverse(); // Latest first for UI
  }, [allCalculatedEntries, dateFilter]);

  const stats = useMemo((): Stats => {
    const rangeEntries = [...filteredCalculatedEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (rangeEntries.length === 0) {
      return { totalKm: 0, totalLiters: 0, totalSpent: 0, avgConsumption: 0, avgPricePer100km: 0 };
    }

    if (rangeEntries.length < 2) {
      const totalSpent = rangeEntries.reduce((acc, curr) => acc + curr.totalCost, 0);
      const totalLiters = rangeEntries.reduce((acc, curr) => acc + curr.liters, 0);
      return { totalKm: 0, totalLiters, totalSpent, avgConsumption: 0, avgPricePer100km: 0 };
    }

    const totalKm = rangeEntries[rangeEntries.length - 1].km - rangeEntries[0].km;
    // For stats logic: distance/consumption within the range is the sum of their individual calculations
    const totalLiters = rangeEntries.slice(1).reduce((acc, curr) => acc + curr.liters, 0);
    const totalSpent = rangeEntries.slice(1).reduce((acc, curr) => acc + curr.totalCost, 0);

    const avgConsumption = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;
    const avgPricePer100km = totalKm > 0 ? (totalSpent / totalKm) * 100 : 0;

    return {
      totalKm,
      totalLiters,
      totalSpent,
      avgConsumption,
      avgPricePer100km,
    };
  }, [filteredCalculatedEntries]);

  const addEntry = async (entry: Omit<FuelEntry, 'id' | 'user_id'>) => {
    if (!userId) return;
    
    // Map camelCase from UI to snake_case for DB
    const dbEntry = {
      date: entry.date,
      km: entry.km,
      liters: entry.liters,
      price_per_liter: entry.pricePerLiter,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('fuel_entries')
      .insert([dbEntry])
      .select();

    if (error) {
      console.error('Error adding entry:', error);
    } else if (data && data[0]) {
      // Map back to camelCase for the UI state
      const mappedNewEntry = {
        id: data[0].id,
        date: data[0].date,
        km: data[0].km,
        liters: data[0].liters,
        pricePerLiter: data[0].price_per_liter,
        user_id: data[0].user_id
      };
      setEntries([...entries, mappedNewEntry]);
    }
  };

  const updateEntry = async (id: string, entry: Omit<FuelEntry, 'id' | 'user_id'>) => {
    if (!userId) return;

    // Map camelCase from UI to snake_case for DB
    const dbEntry = {
      date: entry.date,
      km: entry.km,
      liters: entry.liters,
      price_per_liter: entry.pricePerLiter,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('fuel_entries')
      .update(dbEntry)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating entry:', error);
    } else if (data && data[0]) {
      // Map back to camelCase for the UI state
      const mappedUpdatedEntry = {
        id: data[0].id,
        date: data[0].date,
        km: data[0].km,
        liters: data[0].liters,
        pricePerLiter: data[0].price_per_liter,
        user_id: data[0].user_id
      };
      setEntries(entries.map(e => e.id === id ? mappedUpdatedEntry : e));
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('fuel_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
    } else {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const importData = async (data: Omit<FuelEntry, 'id' | 'user_id'>[]) => {
    if (!userId) return;
    const formattedData = data.map(e => ({
      date: e.date,
      km: e.km,
      liters: e.liters,
      price_per_liter: e.pricePerLiter,
      user_id: userId
    }));

    const { error } = await supabase
      .from('fuel_entries')
      .insert(formattedData);

    if (error) {
      console.error('Error importing data:', error);
    } else {
      fetchEntries();
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `fuel_log_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  return {
    entries: filteredCalculatedEntries,
    stats,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    importData,
    exportData,
  };
};
