
exports.up = knex=> knex.schema.createTable("task",table=>{
  table.increments("id").primary()
  table.text("title").notNullable()
  table.text("description").notNullable()
  table.text("completed_at").default(knex.raw("null"))


  table.timestamp("created_at").default(knex.fn.now())
  table.timestamp("updated_at").default(knex.fn.now())
}) 

exports.down = knex=> knex.schema.dropTable("task")