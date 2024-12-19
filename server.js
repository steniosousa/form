const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');


app.use(express.json());  // Para lidar com requisições JSON
app.use(express.static('public'));  // Serve arquivos estáticos da pasta 'public'

app.post('/add-form-fields', async (req, res) => {
  try {
    const pdfPath = './Recibo.pdf'; // Caminho para o seu arquivo PDF local

    // Carregar o PDF diretamente do arquivo
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Obter a primeira página do PDF
    const page = pdfDoc.getPages()[0];

    // Obter as dimensões da página (largura e altura)

    // Definir as dimensões do campo de texto
    const fieldWidth = 190;
    const fieldHeight = 20;

    // Calcular a posição para cada campo
    // 1. Nome
    const nomeX = 170; // Posição horizontal para "Nome"
    const nomeY = 200; // Posição vertical para "Nome"

    // 3. Importancia
    const importanciaX = 140; // Posição horizontal para "Importancia"
    const importanciaY = 150; // Posição vertical para "Importancia"


    // 2. Referente a
    const referenteX = 120; // Posição horizontal para "Referente a"
    const referenteY = 100; // Posição vertical para "Referente a"

    // 4. Assinatura
    const assinaturaX = 185; // Posição horizontal para "Assinatura"
    const assinaturaY = 70; // Posição vertical para "Assinatura"

    // Obter o formulário do PDF
    const form = pdfDoc.getForm();

    // Criar os campos de texto vazios
    const nomeField = form.createTextField('nome');
    const referenteField = form.createTextField('referente');
    const importanciaField = form.createTextField('importancia');
    const assinaturaField = form.createTextField('assinatura');

    // Adicionar os campos na página
    nomeField.addToPage(page, { x: nomeX, y: nomeY, width: fieldWidth, height: fieldHeight });
    referenteField.addToPage(page, { x: referenteX, y: referenteY, width: fieldWidth, height: fieldHeight });
    importanciaField.addToPage(page, { x: importanciaX, y: importanciaY, width: fieldWidth, height: fieldHeight });
    assinaturaField.addToPage(page, { x: assinaturaX, y: assinaturaY, width: fieldWidth, height: fieldHeight });

    // Salvar o PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();

    // Caminho para salvar o arquivo no disco
    const outputPath = './withFields.pdf';

    // Salvar o arquivo PDF no disco
    fs.writeFileSync(outputPath, modifiedPdfBytes);

    // Converter para base64
    const modifiedBase64 = modifiedPdfBytes.toString('base64');

    // Retornar o PDF modificado como base64
    res.json({ base64Pdf: modifiedBase64 });

  } catch (err) {
    res.status(500).send('Erro ao adicionar os campos de formulário');
    console.error(err);
  }
});



// Rota para editar o PDF
app.post('/edit-pdf', async (req, res) => {
  try {
     // Obter os dados do cabeçalho
     const encodedFormData = req.headers['x-form-data'];  // "X-Form-Data" é o cabeçalho que você usou
     if (!encodedFormData) {
       return res.status(400).send('Dados não encontrados no cabeçalho');
     }
 
     // Decodificar os dados do cabeçalho
     const formData = JSON.parse(decodeURIComponent(encodedFormData));
 
     const { nome, referente, importancia, assinatura } = formData;
 
    const pdfPath = './withFields.pdf'; // Caminho para o seu arquivo PDF local

    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    const form = pdfDoc.getForm();

    const nomeField = form.getTextField('nome');
    const referenteField = form.getTextField('referente');
    const importanciaField = form.getTextField('importancia');
    const assinaturaField = form.getTextField('assinatura');

    nomeField.setText(nome);
    referenteField.setText(referente);
    importanciaField.setText(importancia);
    assinaturaField.setText(assinatura);

    
    if (nomeField) {
      // Preencher o campo "nome"
      nomeField.setText(nome); // O nome preenchido no formulário
      console.log(`Campo 'nome' preenchido com: ${nome}`);
    } else {
      console.error("Campo 'nome' não encontrado ou não é um campo de texto.");
      return res.status(400).send('Campo "nome" não encontrado ou não é um campo de texto.');
    }

    // Salvar o PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();

    // Salvar o PDF modificado no disco
    const outputPath = './modified.pdf';
    fs.writeFileSync(outputPath, modifiedPdfBytes);

    // Converter para base64
    const modifiedBase64 = modifiedPdfBytes.toString('base64');

    // Retornar o PDF modificado como base64
    res.json({ base64Pdf: modifiedBase64 });
  } catch (err) {
    res.status(500).send('Erro ao editar o PDF');
    console.error(err);
  }
});



app.get('/list-fields', async (req, res) => {
  try {
    const pdfPath = './output-modified.pdf'; // Caminho para o seu arquivo PDF local

    // Carregar o PDF diretamente do arquivo
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Obter os campos do formulário
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    // Listar os nomes dos campos
    const fieldNames = fields.map(field => field.getName());

    // Retornar os nomes dos campos
    res.json({ fields: fieldNames });
  } catch (err) {
    res.status(500).send('Erro ao listar os campos do PDF');
    console.error(err);
  }
});

app.get('/Recibo.pdf', (req, res) => {
  res.sendFile(path.join(__dirname, 'Recibo.pdf'));
});

app.get('/modified.pdf', (req, res) => {
  res.sendFile(path.join(__dirname, 'modified.pdf'));
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
