import { createClient } from '@/lib/supabase/client';
import type { Transport, CreateTransportDto, UpdateTransportDto } from '@/types';

export async function getTransports(): Promise<Transport[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Transport[];
}

export async function getTransportById(id: string): Promise<Transport | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transports')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Transport | null;
}

export async function createTransport(dto: CreateTransportDto): Promise<Transport> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transports')
    .insert(dto)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Transport;
}

export async function updateTransport(
  id: string,
  updates: UpdateTransportDto
): Promise<Transport> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transports')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Transport;
}

export async function deleteTransport(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('transports').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
