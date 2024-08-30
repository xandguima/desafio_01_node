const { Router } = require('express');
const multer = require('multer'); // Importa o multer para o upload de arquivos
const TaskController = require('../controllers/taskController');

const taskRoutes = Router();
const taskController = new TaskController();

// Configura o multer para lidar com uploads de arquivos
const upload = multer({ storage: multer.memoryStorage() }); // Usa o memoryStorage para acessar o buffer do arquivo

// Rota de exemplo
taskRoutes.get('/', (request, response) => {
  return response.json({ message: "Hello World" });
});

// Rotas para CRUD de tarefas
taskRoutes.get('/tasks', taskController.index);
taskRoutes.post('/tasks', taskController.create);
taskRoutes.put('/tasks/:id', taskController.update);
taskRoutes.delete('/tasks/:id', taskController.delete);
taskRoutes.patch('/tasks/:id/completed', taskController.completed);

// Rota para receber e processar o CSV
taskRoutes.post('/tasks/upload-csv', upload.single('file'), taskController.receiveCsv.bind(taskController));

module.exports = taskRoutes;
