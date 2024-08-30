const express = require('express');
const app = express();
const routes = require("./routes")


app.use(express.json());
app.use(routes)


app.use((error,request,response, next)=>{
  console.error(error);
  if(error instanceof AppError){
    return response.status(error.statusCode).json({
      status: "error",
      message: error.message
    })
  }
  return response.status(500).json({
    status: "error",
    message: "Internal server error"
  })
})

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
