create table if not exists public.menu_likes (
  menu_name text not null check (menu_name in (
    '제육볶음', '돈카츠 정식', '마라탕', '연어 포케',
    '김치찌개', '초밥 세트', '탄탄면', '치킨 샐러드'
  )),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (menu_name, user_id)
);

alter table public.menu_likes enable row level security;

drop policy if exists "Anyone signed in can read menu likes" on public.menu_likes;
create policy "Anyone signed in can read menu likes"
on public.menu_likes for select
to authenticated
using (true);

drop policy if exists "Users can add their own menu likes" on public.menu_likes;
create policy "Users can add their own menu likes"
on public.menu_likes for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their own menu likes" on public.menu_likes;
create policy "Users can remove their own menu likes"
on public.menu_likes for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, delete on table public.menu_likes to authenticated;
