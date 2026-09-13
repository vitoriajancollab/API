import express from "express";

const cors = require("cors");
const sql = require("mssql");


const app = express();

app.use(express.json());
app.use(cors());

const config = {
    user: "sa",
    password: "M@r10@1979",//"vivimaps",
    server: "localhost",
    database: "CemiterioMap",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

app.get("/", (req, res) => {
    res.send("API CemiterioMap funcionando!");
});

app.get("/falecidos", async (req, res) => {
    try {
        const { nome } = req.query;

        const pool = await sql.connect(config);

        const request = pool.request();

        let resultado;

        if (nome) {
            request.input("nome", sql.VarChar, `%${nome}%`);

            resultado = await request.query(`
                SELECT *
                FROM Falecidos
                WHERE Nome LIKE @nome
                ORDER BY Nome
            `);
        } else {
            resultado = await request.query(`
                SELECT *
                FROM Falecidos
                ORDER BY Nome
            `);
        }

        res.json(resultado.recordset);
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
        let pool: any = await sql.connect(config); if (!Nome) {
            return res.status(400).json({
                erro: "O nome do falecido é obrigatório."
            });
        }



       pool = await sql.connect(config);

        const resultado = await pool.request()
            .input("Nome", sql.VarChar, Nome)
            .input("DataNascimento", sql.Date, nascimento)
            .input("DataFalecimento", sql.Date, falecimento)
            .input("Cemiterio", sql.VarChar, Cemiterio || null)
            .input("Quadra", sql.VarChar, Quadra || null)
            .input("Lote", sql.VarChar, Lote || null)
            .input("Latitude", sql.Decimal(10, 7), Latitude || null)
            .input("Longitude", sql.Decimal(10, 7), Longitude || null)
            .query(`
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
                    @Nome,
                    @DataNascimento,
                    @DataFalecimento,
                    @Cemiterio,
                    @Quadra,
                    @Lote,
                    @Latitude,
                    @Longitude
                )
`);

        res.status(201).json(resultado.recordset[0]);

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

        const pool = await sql.connect(config);

        const resultado = await pool.request()
            .input("Id", sql.Int, id)
            .input("Nome", sql.VarChar, Nome)
            .input("DataNascimento", sql.Date, DataNascimento || null)
            .input("DataFalecimento", sql.Date, DataFalecimento || null)
            .input("Cemiterio", sql.VarChar, Cemiterio || null)
            .input("Quadra", sql.VarChar, Quadra || null)
            .input("Lote", sql.VarChar, Lote || null)
            .input("Latitude", sql.Decimal(10, 7), Latitude || null)
            .input("Longitude", sql.Decimal(10, 7), Longitude || null)
            .query(`
                UPDATE Falecidos
                SET
                    Nome = @Nome,
                    DataNascimento = @DataNascimento,
                    DataFalecimento = @DataFalecimento,
                    Cemiterio = @Cemiterio,
                    Quadra = @Quadra,
                    Lote = @Lote,
                    Latitude = @Latitude,
                    Longitude = @Longitude
                OUTPUT INSERTED.*
                WHERE Id = @Id
            `);


        res.json(resultado.recordset[0]);

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

        const pool = await sql.connect(config);

        const resultado = await pool.request()
            .input("Id", sql.Int, id)
            .query("DELETE FROM Falecidos WHERE Id = @Id");

        if (resultado.rowsAffected[0] === 0) {
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

