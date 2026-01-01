/*
  # Agregar número de camiseta a jugadores

  1. Cambios en la tabla
    - Agregar columna `jersey_number` a la tabla `players`
    - Agregar restricción de unicidad por usuario
    - Permitir valores nulos para jugadores existentes

  2. Índices
    - Crear índice único compuesto para (user_id, jersey_number)
*/

-- Agregar columna jersey_number a la tabla players
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'jersey_number'
  ) THEN
    ALTER TABLE players ADD COLUMN jersey_number text;
  END IF;
END $$;

-- Crear índice único compuesto para evitar números duplicados por usuario
CREATE UNIQUE INDEX IF NOT EXISTS players_user_jersey_unique 
ON players(user_id, jersey_number) 
WHERE jersey_number IS NOT NULL;