CREATE OR REPLACE FUNCTION "SINDPLAST".get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = "SINDPLAST", public
AS $$
DECLARE
  v_socios bigint;
  v_empresas bigint;
  v_dependentes bigint;
  v_funcionarios bigint;
  v_usuarios bigint;
  v_total_mensalidades numeric;
BEGIN
  SELECT count(*) INTO v_socios FROM "Socios";
  SELECT count(*) INTO v_empresas FROM "Empresas";
  SELECT count(*) INTO v_dependentes FROM "Dependentes";
  SELECT count(*) INTO v_funcionarios FROM "Funcionarios";
  SELECT count(*) INTO v_usuarios FROM "Usuarios";

  SELECT COALESCE(sum("ValorMensalidade"), 0)
  INTO v_total_mensalidades
  FROM "Socios"
  WHERE "Status" IN ('ATIVO', 'Ativo');

  RETURN json_build_object(
    'counts', json_build_object(
      'socios', v_socios,
      'empresas', v_empresas,
      'dependentes', v_dependentes,
      'funcionarios', v_funcionarios,
      'usuarios', v_usuarios
    ),
    'financials', json_build_object(
      'totalMensalidades', v_total_mensalidades
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION "SINDPLAST".get_dashboard_analytics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = "SINDPLAST", public
AS $$
DECLARE
  v_socios json;
  v_dependentes_by_parentesco json;
  v_empresas_by_status json;
BEGIN
  SELECT COALESCE(json_agg(t), '[]'::json)
  INTO v_socios
  FROM (
    SELECT "Sexo", "Status", "ValorMensalidade"
    FROM "Socios"
  ) t;

  SELECT COALESCE(
    json_agg(
      json_build_object('name', d.parentesco, 'value', d.cnt)
      ORDER BY d.cnt DESC
    ),
    '[]'::json
  )
  INTO v_dependentes_by_parentesco
  FROM (
    SELECT COALESCE("Parentesco", 'Outros') AS parentesco, count(*) AS cnt
    FROM "Dependentes"
    GROUP BY 1
  ) d;

  SELECT COALESCE(
    json_agg(
      json_build_object('name', e.status, 'value', e.cnt)
      ORDER BY e.cnt DESC
    ),
    '[]'::json
  )
  INTO v_empresas_by_status
  FROM (
    SELECT COALESCE("UF", 'N/I') AS status, count(*) AS cnt
    FROM "Empresas"
    GROUP BY 1
  ) e;

  RETURN json_build_object(
    'raw', json_build_object(
      'socios', v_socios
    ),
    'charts', json_build_object(
      'dependentesByParentesco', v_dependentes_by_parentesco,
      'empresasByStatus', v_empresas_by_status
    )
  );
END;
$$;

GRANT USAGE ON SCHEMA "SINDPLAST" TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION "SINDPLAST".get_dashboard_stats() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION "SINDPLAST".get_dashboard_analytics() TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
