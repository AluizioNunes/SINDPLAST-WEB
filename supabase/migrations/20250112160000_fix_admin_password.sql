-- Habilitar pgcrypto caso não esteja (necessário para crypt/gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Atualizar ou Inserir o usuário Admin com a senha 'ITFACTsindplast' criptografada
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "SINDPLAST"."Usuarios" WHERE "Usuario" = 'Admin' OR "Email" = 'admin@sindplast.local') THEN
        UPDATE "SINDPLAST"."Usuarios"
        SET "Senha" = crypt('ITFACTsindplast', gen_salt('bf')),
            "Usuario" = 'Admin', -- Garante padronização
            "Email" = 'admin@sindplast.local'
        WHERE "Usuario" = 'Admin' OR "Email" = 'admin@sindplast.local';
    ELSE
        INSERT INTO "SINDPLAST"."Usuarios" ("Nome", "Usuario", "Email", "Perfil", "Cadastrante", "Senha")
        VALUES ('Administrador', 'Admin', 'admin@sindplast.local', 'Administrador', 'Sistema', crypt('ITFACTsindplast', gen_salt('bf')));
    END IF;
END $$;
