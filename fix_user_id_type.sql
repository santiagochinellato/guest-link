-- Modificar tabla user para que id sea text (UUID) en lugar de integer
ALTER TABLE "user" 
  DROP CONSTRAINT IF EXISTS "user_pkey" CASCADE,
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE text USING "id"::text,
  ADD PRIMARY KEY ("id");

-- Recrear foreign keys con el nuevo tipo
ALTER TABLE "account" 
  DROP CONSTRAINT IF EXISTS "account_userId_user_id_fk",
  ALTER COLUMN "userId" SET DATA TYPE text USING "userId"::text,
  ADD CONSTRAINT "account_userId_user_id_fk" 
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;

ALTER TABLE "session" 
  DROP CONSTRAINT IF EXISTS "session_userId_user_id_fk",
  ALTER COLUMN "userId" SET DATA TYPE text USING "userId"::text,
  ADD CONSTRAINT "session_userId_user_id_fk" 
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;

-- Drop la secuencia ya que no se usa más
DROP SEQUENCE IF EXISTS user_id_seq;
