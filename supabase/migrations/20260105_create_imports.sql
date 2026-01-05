-- Create tables to record import runs and per-line justifications
create table if not exists import_runs (
  id uuid primary key default gen_random_uuid(),
  filename text,
  uploaded_by uuid,
  created_at timestamptz default now()
);

create table if not exists line_import_changes (
  id uuid primary key default gen_random_uuid(),
  import_run uuid references import_runs(id) on delete cascade,
  line_number text,
  change_type text not null, -- 'added' | 'updated' | 'removed'
  old_data jsonb,
  new_data jsonb,
  justification text,
  created_by uuid,
  created_at timestamptz default now()
);

create index if not exists idx_line_import_changes_line_number on line_import_changes(line_number);
