-- ============================================================
-- PulsePay — Storage do Checkout Builder: bucket "checkout-assets" + RLS
-- ============================================================
-- COMO APLICAR: rode este arquivo no Supabase Dashboard → SQL Editor.
-- (As policies em storage.objects exigem o papel supabase_storage_admin;
--  a role "postgres" do pooler NÃO consegue criá-las — por isso Dashboard.)
--
-- O bucket já pode ter sido criado via SQL pelo app; este INSERT é idempotente.
-- ============================================================

-- 1) Bucket público (leitura pública; escrita só via signed URL do servidor)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'checkout-assets', 'checkout-assets', true,
  52428800, -- 50MB (limite do vídeo; imagem/logo limitados na aplicação)
  array['image/png','image/jpeg','image/webp','image/svg+xml','video/mp4','video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2) RLS (já habilitado por padrão em storage.objects no Supabase)

-- 2a) Leitura pública dos assets do bucket (para a página pública de checkout)
drop policy if exists "checkout-assets public read" on storage.objects;
create policy "checkout-assets public read"
  on storage.objects for select
  using ( bucket_id = 'checkout-assets' );

-- 2b) Escrita/edição/remoção: apenas na PRÓPRIA pasta {userId}/... (defense-in-depth).
--     Observação: o app usa NextAuth (não Supabase Auth), então o caminho de
--     escrita real é a signed upload URL gerada no servidor com a service_role
--     (que bypassa RLS). Estas policies protegem contra escrita direta e ficam
--     prontas caso o app passe a usar Supabase Auth (auth.uid()).
drop policy if exists "checkout-assets user insert own folder" on storage.objects;
create policy "checkout-assets user insert own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'checkout-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "checkout-assets user update own folder" on storage.objects;
create policy "checkout-assets user update own folder"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'checkout-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "checkout-assets user delete own folder" on storage.objects;
create policy "checkout-assets user delete own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'checkout-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
