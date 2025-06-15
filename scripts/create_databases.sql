CREATE DATABASE IF NOT EXISTS codigo_gourmet CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS codigo_gourmet_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON codigo_gourmet.* TO 'desafio'@'%';
GRANT ALL PRIVILEGES ON codigo_gourmet_test.* TO 'desafio'@'%';
FLUSH PRIVILEGES;