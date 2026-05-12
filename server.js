const express = require("express");
const cors = require("cors");
const multer = require("multer");

const { createClient } = require("@supabase/supabase-js");

const app = express();

// o cors permite a ligação local entre o mesmo sistema
app.use(cors());

// SERVIR PUBLIC PARA O ACESSO PUBLICO
app.use(express.static("public"));

// SERVIR MODELS (MUITO IMPORTANTE) PARA O ACESSO REFERENCIAL
app.use('/models', express.static('models')); 


/*
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".jpg");
  }
});

const upload = multer({ storage });

// endpoint para guardar um ficheiro/foto no local que foi 
// designado na criação de 'storage' e depois como upload através de multer
app.post("/upload", upload.single("photo"), (req, res) => {
  console.log("Foto recebida:", req.file.filename);
  res.json({
    message: "Foto guardada",
    file: req.file.filename
  });

});
*/

const supabase = createClient("https://odcuqrfgyydmorruvxkn.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kY3VxcmZneXlkbW9ycnV2eGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODc4NzgsImV4cCI6MjA5NDE2Mzg3OH0.DiaSko_u9aYA40qY2C6mWgsBAZAXoYnm8E06xMix32U"
);

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("photo"), async (req, res) => {

  try {

    const emotion = req.body.emotion;
    const name = req.body.name;

    const file = req.file;

    const fileName =
      Date.now() + ".jpg";

    // Upload para storage no supabase
    const { data, error } =
      await supabase.storage
        .from("photos")
        .upload(fileName,
          file.buffer,
          {
            contentType: "image/jpeg"
          });

    if (error)
      throw error;

    // Ligar URL pública
    const { data: publicUrl } =
      supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

    // Guardar na tabela
    await supabase
      .from("students")
      .insert([{
        name: name,
        emotion: emotion,
        photo_url:
          publicUrl.publicUrl

      }]);

    res.json({
      message: "Guardado com sucesso"
    });

  }
  catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor a correr em http://localhost:3000");
});