export type Place = {
  id: string;
  name: string;
  created_at: string;
  pending_count?: number;
  completed_count?: number;
  total_pending?: number;
  total_completed?: number;
};

export type Bill = {
  id: string;
  place_id: string;
  bill_number: string;
  amount: number;
  status: 'pending' | 'completed';
  notes?: string | null;
  due_date?: string | null;
  created_at: string;
  completed_at?: string | null;
};

export type ActivityLog = {
  id: string;
  action_type: string;
  bill_id?: string;
  place_id?: string;
  place_name?: string;
  bill_number?: string;
  amount?: number;
  status?: string;
  modified_by?: string;
  timestamp: string;
};

export type SyncEvent = {
  type: 'place_created' | 'place_updated' | 'place_deleted' |
        'bill_created' | 'bill_updated' | 'bill_deleted' | 'bill_completed';
  place?: Place;
  bill?: Bill;
};
