import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];
type Player = Tables['players']['Row'] & { group_name?: string; group_category?: string };
type Payment = Tables['payments']['Row'] & { player_name?: string };
type Group = Tables['groups']['Row'];

export function useSupabaseData(userId: string | undefined) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // ========================================
  // FETCH ALL DATA - COOPERATIVO (SIN FILTROS user_id)
  // ========================================
  const fetchData = async () => {
    if (!userId) {
      setPlayers([]);
      setPayments([]);
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch groups - SIN FILTRO user_id
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (groupsError) throw groupsError;

      // Extract unique categories from groups
      const uniqueCategories = Array.from(
        new Set(
          groupsData
            ?.map(group => group.category)
            .filter(Boolean) || []
        )
      ).sort();

      // Fetch players with group names - SIN FILTRO user_id
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          *,
          groups(name, category)
        `)
        .order('name');

      if (playersError) throw playersError;

      // Fetch payments with player names - SIN FILTRO user_id
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          players(name)
        `)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Process data
      const processedPlayers = playersData?.map(player => ({
        ...player,
        group_name: player.groups?.name || 'Sin grupo',
        group_category: player.groups?.category || ''
      })) || [];

      const processedPayments = paymentsData?.map(payment => ({
        ...payment,
        player_name: payment.players?.name || 'Jugador eliminado'
      })) || [];

      setGroups(groupsData || []);
      setPlayers(processedPlayers);
      setPayments(processedPayments);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();

    // ========================================
    // REALTIME SUBSCRIPTIONS - COOPERATIVAS
    // ========================================
    const groupsChannel = supabase
      .channel('groups-all-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'groups' },
        () => {
          console.log('Group changed, refetching...');
          fetchData();
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel('players-all-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        () => {
          console.log('Player changed, refetching...');
          fetchData();
        }
      )
      .subscribe();

    const paymentsChannel = supabase
      .channel('payments-all-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          console.log('Payment changed, refetching...');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      groupsChannel.unsubscribe();
      playersChannel.unsubscribe();
      paymentsChannel.unsubscribe();
    };
  }, [userId]);

  // ========================================
  // CRUD OPERATIONS FOR GROUPS - COOPERATIVO
  // ========================================
  const createGroup = async (groupData: Omit<Tables['groups']['Insert'], 'user_id'>) => {
    if (!userId) return null;

    // SIN user_id en el insert
    const { data, error } = await supabase
      .from('groups')
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;
    await fetchData();
    return data;
  };

  const updateGroup = async (id: string, groupData: Tables['groups']['Update']) => {
    // SIN filtro user_id
    const { data, error } = await supabase
      .from('groups')
      .update(groupData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchData();
    return data;
  };

  const deleteGroup = async (id: string) => {
    // Check if group has players - SIN FILTRO user_id
    const { data: playersInGroup } = await supabase
      .from('players')
      .select('id')
      .eq('group_id', id);

    if (playersInGroup && playersInGroup.length > 0) {
      throw new Error('No puedes eliminar un grupo que tiene jugadores asignados');
    }

    // SIN filtro user_id
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchData();
  };

  // ========================================
  // CRUD OPERATIONS FOR PLAYERS - COOPERATIVO
  // ========================================
  const createPlayer = async (playerData: Omit<Tables['players']['Insert'], 'user_id'>) => {
    if (!userId) return null;

    // Check if jersey number is already taken - SIN FILTRO user_id
    if (playerData.jersey_number) {
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('jersey_number', playerData.jersey_number)
        .single();

      if (existingPlayer) {
        throw new Error(`El número de camiseta ${playerData.jersey_number} ya está en uso`);
      }
    }

    // SIN user_id en el insert
    const { data, error } = await supabase
      .from('players')
      .insert(playerData)
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
    // Check if jersey number is already taken - SIN FILTRO user_id
    if (playerData.jersey_number) {
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('jersey_number', playerData.jersey_number)
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

    // SIN filtro user_id
    const { data, error } = await supabase
      .from('players')
      .update(playerData)
      .eq('id', id)
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

    // Delete related payments first - SIN FILTRO user_id
    await supabase
      .from('payments')
      .delete()
      .eq('player_id', id);

    // SIN filtro user_id
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update group count
    if (player?.group_id) {
      await updateGroupPlayerCount(player.group_id, -1);
    }

    await fetchData();
  };

  // ========================================
  // CRUD OPERATIONS FOR PAYMENTS - COOPERATIVO
  // ========================================
  const createPayment = async (paymentData: Omit<Tables['payments']['Insert'], 'user_id'>) => {
    if (!userId) return null;

    // SIN user_id en el insert
    const { data, error } = await supabase
      .from('payments')
      .insert({ 
        ...paymentData,
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

    // SIN filtro user_id
    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchData();
    return data;
  };

  const deletePayment = async (id: string) => {
    // SIN filtro user_id
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

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

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
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
    categories,
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