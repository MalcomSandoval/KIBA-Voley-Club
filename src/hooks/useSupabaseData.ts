import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];
type Player = Tables['players']['Row'] & { group_name?: string };
type Payment = Tables['payments']['Row'] & { player_name?: string };
type Group = Tables['groups']['Row'];

export function useSupabaseData(userId: string | undefined) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (groupsError) throw groupsError;

      // Fetch players with group names
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          *,
          groups(name)
        `)
        .eq('user_id', userId)
        .order('name');

      if (playersError) throw playersError;

      // Fetch payments with player names
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          players(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Process data
      const processedPlayers = playersData?.map(player => ({
        ...player,
        group_name: player.groups?.name || 'Sin grupo'
      })) || [];

      const processedPayments = paymentsData?.map(payment => ({
        ...payment,
        player_name: payment.players?.name || 'Jugador eliminado'
      })) || [];

      setGroups(groupsData || []);
      setPlayers(processedPlayers);
      setPayments(processedPayments);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // CRUD Operations for Groups
  const createGroup = async (groupData: Omit<Tables['groups']['Insert'], 'user_id'>) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('groups')
      .insert({ ...groupData, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    await fetchData();
    return data;
  };

  const updateGroup = async (id: string, groupData: Tables['groups']['Update']) => {
    const { data, error } = await supabase
      .from('groups')
      .update(groupData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    await fetchData();
    return data;
  };

  const deleteGroup = async (id: string) => {
    // Check if group has players
    const { data: playersInGroup } = await supabase
      .from('players')
      .select('id')
      .eq('group_id', id)
      .eq('user_id', userId);

    if (playersInGroup && playersInGroup.length > 0) {
      throw new Error('No puedes eliminar un grupo que tiene jugadores asignados');
    }

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    await fetchData();
  };

  // CRUD Operations for Players
  const createPlayer = async (playerData: Omit<Tables['players']['Insert'], 'user_id'>) => {
    if (!userId) return null;

    // Check if jersey number is already taken
    if (playerData.jersey_number) {
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('jersey_number', playerData.jersey_number)
        .eq('user_id', userId)
        .single();

      if (existingPlayer) {
        throw new Error(`El número de camiseta ${playerData.jersey_number} ya está en uso`);
      }
    }
    const { data, error } = await supabase
      .from('players')
      .insert({ ...playerData, user_id: userId })
      .select()
      .single();

    if (error) throw error;

    // Update group current_players count
    if (playerData.group_id) {
      await updateGroupPlayerCount(playerData.group_id, 1);
    }

    await fetchData();
    return data;
  };

  const updatePlayer = async (id: string, playerData: Tables['players']['Update']) => {
    // Check if jersey number is already taken by another player
    if (playerData.jersey_number) {
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('jersey_number', playerData.jersey_number)
        .eq('user_id', userId)
        .neq('id', id)
        .single();

      if (existingPlayer) {
        throw new Error(`El número de camiseta ${playerData.jersey_number} ya está en uso`);
      }
    }
    // Get current player data to check group changes
    const { data: currentPlayer } = await supabase
      .from('players')
      .select('group_id')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('players')
      .update(playerData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Update group counts if group changed
    if (currentPlayer && currentPlayer.group_id !== playerData.group_id) {
      if (currentPlayer.group_id) {
        await updateGroupPlayerCount(currentPlayer.group_id, -1);
      }
      if (playerData.group_id) {
        await updateGroupPlayerCount(playerData.group_id, 1);
      }
    }

    await fetchData();
    return data;
  };

  const deletePlayer = async (id: string) => {
    // Get player data to update group count
    const { data: player } = await supabase
      .from('players')
      .select('group_id')
      .eq('id', id)
      .single();

    // Delete related payments first
    await supabase
      .from('payments')
      .delete()
      .eq('player_id', id)
      .eq('user_id', userId);

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    // Update group count
    if (player?.group_id) {
      await updateGroupPlayerCount(player.group_id, -1);
    }

    await fetchData();
  };

  // CRUD Operations for Payments
  const createPayment = async (paymentData: Omit<Tables['payments']['Insert'], 'user_id'>) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('payments')
      .insert({ 
        ...paymentData, 
        user_id: userId,
        paid_date: paymentData.status === 'paid' ? new Date().toISOString().split('T')[0] : null
      })
      .select()
      .single();

    if (error) throw error;
    await fetchData();
    return data;
  };

  const updatePayment = async (id: string, paymentData: Tables['payments']['Update']) => {
    const updateData = {
      ...paymentData,
      paid_date: paymentData.status === 'paid' ? new Date().toISOString().split('T')[0] : null
    };

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    await fetchData();
    return data;
  };

  const deletePayment = async (id: string) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    await fetchData();
  };

  const togglePaymentStatus = async (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    const newStatus = payment.status === 'paid' ? 'pending' : 'paid';
    await updatePayment(id, { 
      status: newStatus,
      paid_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
    });
  };

  // Helper function to update group player count
  const updateGroupPlayerCount = async (groupId: string, change: number) => {
    const { data: group } = await supabase
      .from('groups')
      .select('current_players')
      .eq('id', groupId)
      .single();

    if (group) {
      await supabase
        .from('groups')
        .update({ current_players: Math.max(0, group.current_players + change) })
        .eq('id', groupId);
    }
  };

  return {
    players,
    payments,
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    createPlayer,
    updatePlayer,
    deletePlayer,
    createPayment,
    updatePayment,
    deletePayment,
    togglePaymentStatus,
    refetch: fetchData
  };
}