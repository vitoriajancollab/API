import express from "express";

import { createClient } from '@libsql/client';


const client = createClient({
  url: "libsql://database-gray-magnet-vercel-icfg-i38iq5kqb4k38moinnsuqptu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTAwNDEwNDIsImlkIjoiMDFhMGM2YzItYWIwMS03YTE0LTk5MjQtOTVkM2IzMjRjYWJlIiwia2lkIjoiczcxXzlfVXhDaDVBWk9MbkUtNEV3ZllsdlFiNi1qU2t4bWUzbHBQbWNjTSIsInJpZCI6IjY0NTU4NGQzLTIzODItNGY3My05OGMzLWU3MTNiNWQ0ZTA3NiJ9.lob2Oh-GBMLjOtjw2Sprjr6lDBY1aOHzbxAaXcD8LcXkvsYUpSYsIPVdicXpau2BWKTp0xoJdobzdrLwSJN_DQ"
});

const cors = require("cors");
//const client = require("msclient");


const app = express();

app.use(express.json());
app.use(cors());

// const config = {
//     user: "sa",
//     password: "M@r10@1979",//"vivimaps",
//     server: "localhost",
//     database: "CemiterioMap",
//     options: {
//         encrypt: false,
//         trustServerCertificate: true
//     }
// };

app.get("/", (req, res) => {
    res.send("API CemiterioMap funcionando!");
});

app.get("/falecidos", async (req, res) => {
    try {
        const { nome } = req.query;

        //const pool = await client.connect(config);

        const request = client;

        let resultado;

        if (nome) {
            

            resultado = await request.execute(`
                SELECT *
                FROM Falecidos
                WHERE Nome LIKE ?
                ORDER BY Nome
            `, [`%${nome}%`]);
        } else {
            resultado = await request.execute(`
                SELECT *
                FROM Falecidos
                ORDER BY Nome
            `);
        }

        res.json(resultado.rows);
    } catch (erro: any) {
        console.error("Erro ao buscar falecidos:", erro);

        res.status(500).json({
            erro: erro.message
        });
    }
});
app.post("/falecidos", async (req, res) => {
    console.log("POST /falecidos FOI CHAMADO!");
    try {
        const {
            Nome,
            DataNascimento,
            DataFalecimento,
            Cemiterio,
            Quadra,
            Lote,
            Latitude,
            Longitude
        } = req.body;
        console.log("Dados recebidos:", req.body);

        function converterData(data: any) {
            if (!data) return null;

            const partes = data.split("/");

            if (partes.length === 3) {
                return new Date(
                    Number(partes[2]),
                    Number(partes[1]) - 1,
                    Number(partes[0])
                );
            }

            return new Date(data);
        }

        const nascimento = converterData(DataNascimento);
        const falecimento = converterData(DataFalecimento);
        //let pool: any = await sql.connect(config); 
        
        if (!Nome) {
            return res.status(400).json({
                erro: "O nome do falecido é obrigatório."
            });
        }



       //pool = await sql.connect(config);

        const resultado = await client.execute(`
                INSERT INTO Falecidos
                (
                    Nome,
                    DataNascimento,
                    DataFalecimento,
                    Cemiterio,
                    Quadra,
                    Lote,
                    Latitude,
                    Longitude
                )
                OUTPUT INSERTED.*
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ? 
                )
`, [Nome, nascimento, falecimento, Cemiterio, Quadra, Lote, Latitude, Longitude]);

        res.status(201).json(resultado.rows[0]);

    } catch (erro: any) {
        console.error("Erro ao cadastrar falecido:", erro);

        res.status(500).json({
            erro: erro.message
        });
    }
});
app.put("/teste", (req, res) => {
    res.json({
        mensagem: "PUT funcionando!"
    });
});

app.put("/falecidos/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            Nome,
            DataNascimento,
            DataFalecimento,
            Cemiterio,
            Quadra,
            Lote,
            Latitude,
            Longitude
        } = req.body;

        if (!Nome) {
            return res.status(400).json({
                erro: "O nome do falecido é obrigatório."
            });
        }

        //const pool = await sql.connect(config);
        
        const resultado = await client.execute(`
                UPDATE Falecidos
                SET
                    Nome = ?,
                    DataNascimento = ?,
                    DataFalecimento = ?,
                    Cemiterio = ?,
                    Quadra = ?,
                    Lote = ?,
                    Latitude = ?,
                    Longitude = ?
                OUTPUT INSERTED.*
                WHERE Id = ?
            `, [Nome, DataNascimento, DataFalecimento, Cemiterio, Quadra, Lote, Latitude, Longitude, id]);


        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error("Erro ao atualizar falecido:", erro);

        res.status(500).json({
            erro: "Erro ao atualizar falecido."
        });
    }
});
app.delete("/teste-delete", (req, res) => {
    res.json({
        mensagem: "DELETE funcionando!"
    });
});


app.delete("/falecidos/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        //const pool = await sql.connect(config);

        const resultado = await client.execute(`
            DELETE FROM Falecidos WHERE Id = ?
        `, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Falecido não encontrado."
            });
        }

        res.json({
            mensagem: "Falecido excluído com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao excluir falecido:", erro);

        res.status(500).json({
            erro: "Erro ao excluir falecido."
        });
    }
});
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});

