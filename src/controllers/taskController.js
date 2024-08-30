const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const fs = require('fs');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

class TaskController {
  async index(request, response) {
    const { search } = request.query;

    if (search) {
      const tasks = await knex("task")
        .where("title", "like", `%${search}%`)
        .orWhere("description", "like", `%${search}%`);

      return response.json(tasks);
    }

    const tasks = await knex("task").select("*");

    return response.json(tasks);

  }
  async create(request, response) {
    const { title, description } = request.body;

    await knex("task").insert({
      title,
      description
    });
    return response.json({ message: "Task created" });
  }
  async update(request, response) {
    const { id } = request.params;

    const { title, description } = request.body;

    let task = await knex("task").where({ id }).first();

    if (!task) {
      throw new AppError("Task not found", 400);
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.updated_at = knex.fn.now();

    await knex("task").update(task).where({ id });

    return response.json({ message: "Task updated" });
  }
  async delete(request, response) {
    const { id } = request.params;

    let task = await knex("task").where({ id }).first();

    if (!task) {
      throw new AppError("Task not found", 400);
    }

    await knex("task").delete().where({ id });
    return response.json({ message: "Task deleted" });
  }
  async completed(request, response) {
    const { id } = request.params;

    let task = await knex("task").where({ id }).first();

    if (!task) {
      throw new AppError("Task not found", 400);
    }

    if (task.completed_at) {
      task.completed_at = null
    } else {
      task.completed_at = knex.fn.now()
    }

    let updatedTask = await knex("task").update(task).where({ id });

    return response.json({ message: "Updated completed", updatedTask });
  }
  async receiveCsv(request, response) {
    if (!request.file) {
      return response.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }
  
    const fileStream = Readable.from(request.file.buffer);
    let headers = []; // Armazena os cabeçalhos dinamicamente
  
    try {
      fileStream
        .pipe(
          csvParser({
            mapHeaders: ({ header }) => {
              headers.push(header); // Captura os cabeçalhos dinamicamente
              return header;
            },
            skipEmptyLines: true,
          })
        )
        .on('data', async (row) => {
          console.log('Linha lida do CSV:', row);
  
          // Verifica se todos os campos necessários estão presentes na linha
          const missingFields = headers.filter((header) => !row[header]);
          if (missingFields.length > 0) {
            console.error(`Erro: Campos ausentes na linha: ${missingFields.join(', ')}`, row);
            return; // Continua com a próxima linha
          }
  
          try {
            await knex('task').insert(row); // Insere a linha dinamicamente no banco
            console.log('Linha inserida com sucesso:', row);
          } catch (error) {
            console.error('Erro ao inserir a linha:', error);
          }
        })
        .on('end', () => {
          response.json({ message: 'Arquivo CSV processado com sucesso!' });
        })
        .on('error', (error) => {
          console.error('Erro ao processar o CSV:', error);
          response.status(500).json({ message: 'Erro ao processar o arquivo CSV.' });
        });
    } catch (error) {
      console.error('Erro inesperado:', error);
      response.status(500).send('Erro inesperado ao processar o arquivo CSV.');
    }
  }
}

module.exports = TaskController