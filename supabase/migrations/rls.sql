-- Row Level Security and policies for Solvis Line Manager
-- NOTE: Review carefully and test in a staging environment before applying to production.

-- Helper to check master admin
create or replace function public.is_master_admin() returns boolean language sql stable as $$
  select exists(select 1 from public.users u where u.user_id = auth.uid() and u.role = 'master_admin');
$$;

-- USERS table policies
alter table public.users enable row level security;

-- allow users to insert their own profile
create policy users_insert_own on public.users for insert with check (user_id = auth.uid());

-- allow users to select their own profile or master admins to select all
create policy users_select on public.users for select using (
  user_id = auth.uid() or public.is_master_admin()
);

-- allow users to update their own profile (but role changes should be done by master admin)
create policy users_update_own on public.users for update using (user_id = auth.uid() or public.is_master_admin()) with check (
  user_id = auth.uid() or public.is_master_admin()
);

-- LINES table policies
alter table public.lines enable row level security;

-- Select: allow authenticated users (adjust if you want more restrictions)
create policy lines_select on public.lines for select using (auth.role() is not null);

-- Insert/Update/Delete: master admin only
create policy lines_modify_admin on public.lines for all using (public.is_master_admin()) with check (public.is_master_admin());

-- REQUESTS table policies
alter table public.requests enable row level security;

-- Allow any authenticated user to insert requests (created_by should be set to auth.uid())
create policy requests_insert on public.requests for insert with check (created_by = auth.uid());

-- Allow creator or master admin to select
create policy requests_select on public.requests for select using (created_by = auth.uid() or public.is_master_admin());

-- Allow creator to update their request (notes), master admin to update status
create policy requests_update on public.requests for update using (created_by = auth.uid() or public.is_master_admin()) with check (created_by = auth.uid() or public.is_master_admin());

-- INVOICES table policies (restrict modifications to admins)
alter table public.invoices enable row level security;
create policy invoices_select on public.invoices for select using (auth.role() is not null);
create policy invoices_modify_admin on public.invoices for all using (public.is_master_admin()) with check (public.is_master_admin());

-- LINE_MOVEMENTS (logs) - allow insert by authenticated users, select by admins or those involved
alter table public.line_movements enable row level security;
create policy line_movements_insert on public.line_movements for insert with check (auth.role() is not null);
create policy line_movements_select on public.line_movements for select using (auth.role() is not null);

-- CRITERIA and EVALUATION - admin only
alter table public.cancel_criteria enable row level security;
create policy cancel_criteria_admin on public.cancel_criteria for all using (public.is_master_admin()) with check (public.is_master_admin());

alter table public.cancel_evaluation enable row level security;
create policy cancel_evaluation_admin on public.cancel_evaluation for select using (public.is_master_admin());

-- Clients/Units basic policies
alter table public.clients enable row level security;
create policy clients_select on public.clients for select using (auth.role() is not null);
create policy clients_modify_admin on public.clients for all using (public.is_master_admin()) with check (public.is_master_admin());

alter table public.units enable row level security;
create policy units_select on public.units for select using (auth.role() is not null);
create policy units_modify_admin on public.units for all using (public.is_master_admin()) with check (public.is_master_admin());

-- End of RLS policies
