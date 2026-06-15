import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1718000000000 implements MigrationInterface {
  transaction = false;
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_courses_category_difficulty"
      ON "courses" ("category", "difficulty")
    `);

    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_enrollments_user_course"
      ON "enrollments" ("userId", "courseId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_courses_category_difficulty"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_enrollments_user_course"`);
  }
}
