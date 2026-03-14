import { createClient } from '@/lib/supabase/client';
import type { Vehicle } from '@/types';

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Vehicle[];
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Vehicle | null;
}

export async function getAvailableVehicles(): Promise<Vehicle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('status', 'verfügbar');
  if (error) throw new Error(error.message);
  return data as Vehicle[];
}

export async function updateVehicle(
  id: string,
  updates: Partial<Vehicle>
): Promise<Vehicle> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Vehicle;
}
