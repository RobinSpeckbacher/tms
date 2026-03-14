import { createClient } from '@/lib/supabase/client';
import type { Driver } from '@/types';

export async function getDrivers(): Promise<Driver[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Driver[];
}

export async function getDriverById(id: string): Promise<Driver | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Driver | null;
}

export async function getAvailableDrivers(): Promise<Driver[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('status', 'verfügbar');
  if (error) throw new Error(error.message);
  return data as Driver[];
}

export async function updateDriver(
  id: string,
  updates: Partial<Driver>
): Promise<Driver> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('drivers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Driver;
}
