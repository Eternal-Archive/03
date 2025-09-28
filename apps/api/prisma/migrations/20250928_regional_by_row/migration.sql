-- 若表已存在，请先确保 crdb_region 列存在；新表直接按 schema 创建即可
ALTER TABLE IF EXISTS "User" ADD COLUMN IF NOT EXISTS crdb_region STRING NOT NULL DEFAULT 'us-east';

-- 将表设置为 REGIONAL BY ROW，并指定分布列为 crdb_region
ALTER TABLE "User" SET LOCALITY REGIONAL BY ROW AS crdb_region;

-- 限定可选值（根据你的集群 region 命名替换）
ALTER TABLE "User" ADD CONSTRAINT crdb_region_chk CHECK (crdb_region IN ('us-east', 'eu-central'));
