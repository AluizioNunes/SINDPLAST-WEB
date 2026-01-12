-- SQL PARA MARCAR ÓRFÃOS (OPÇÃO A)
-- Execute no SQL Editor do Supabase

-- 1) Criar coluna FlagOrfao (se não existir)
alter table "SINDPLAST"."Dependentes"
  add column if not exists "FlagOrfao" boolean default false;

-- 2) Marcar órfãos
update "SINDPLAST"."Dependentes" d
set "FlagOrfao" = true
where not exists (
  select 1
  from "SINDPLAST"."Socios" s
  where s."Matricula" = d."CodSocio"::text
)
or d."CodSocio" is null;

-- 3) Checks rápidos
select count(*) as dependentes_orfaos from "SINDPLAST"."Dependentes" where "FlagOrfao" = true;
select count(*) as dependentes_sem_empresa from "SINDPLAST"."Dependentes" where "Empresa" is null or trim("Empresa") = '';
