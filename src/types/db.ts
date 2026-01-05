export type Operator = {
  id: string;
  name: "Claro" | "Vivo" | "Tim" | "Salvy" | "Datatem";
  created_at?: string;
};

export type Client = {
  id: string;
  name: string;
  cnpj?: string;
  created_at?: string;
};

export type Unit = {
  id: string;
  client_id: string;
  name: string;
  created_at?: string;
};

export type Line = {
  id: string;
  number: string;
  operator_real: string;
  operator_current: string;
  client_id?: string | null;
  unit_id?: string | null;
  monthly_cost?: number | null;
  status?: string;
  last_movement_at?: string | null;
  created_at?: string;
};

export type Invoice = {
  id: string;
  line_id: string;
  file_path: string;
  amount?: number | null;
  uploaded_at?: string;
};

export type LineMovement = {
  id: string;
  line_id: string;
  type: string;
  user_id: string;
  notes?: string;
  created_at?: string;
};

export type CancelCriteria = {
  id: string;
  name: string;
  field: string;
  operator: string;
  value: string;
  active: boolean;
};
