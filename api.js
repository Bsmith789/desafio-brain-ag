const client = require('./conexao.js');
const express = require('express');

const app = express();

app.listen(3300, () => {
    console.log('Server está rodando na porta 3300');
})

client.connect();

app.get('/users', (req, res) => {
    client.query('Select * from users', (err, result) => {
        if (!err) {
            res.send(result.rows);
        }
    });
    client.end();
})

app.get('/users/:id', (req, res) => {
    client.query(`Select * from users where id=${req.params.id}`, (err, result) => {
        if (!err) {
            res.send(result.rows);
        }
    });
    client.end();
})

const bodyParser = require("body-parser");
app.use(bodyParser.json());


app.post('/users', (req, res) => {
    const user = req.body;
    const cpfValido = user.cpf.lenght == 11;
    const cnpjValido = user.cpf.lenght == 14;
    const somaAreas = user.areaAgric + user.areaVeget;
    const areaTotalValida = user.areaTotal > somaAreas;


    const validacoes = [{
            nome: 'cpf',
            valido: cpfValido,
            mensagem: 'CPF deve conter 11 números'
        },
        {
            nome: 'cnpj',
            valido: cnpjValido,
            mensagem: 'CNPJ deve conter 14 números'
        },
        {
            nome: 'areaTotal',
            valido: areaTotalValida,
            mensagem: 'Área total deve ser maior que a soma da AreaAgric com a AreaVeget'
        }
    ]

    const erros = validacoes.filter(campo => !campo.valido);
    const existemErros = erros.length;

    if (existemErros) {
        res.status(400).json(erros);
    } else {
        let insertQuery = `insert into users(id,cpf,cnpj,nome,nomeFazenda,cidade,estado,areaTotal,areaAgric,areaVeget,culturas)
                                   values(${user.id},${user.cpf},${user.cnpj},'${user.nome}','${user.nomeFazenda}','${user.cidade}','${user.estado}',${user.areaTotal},${user.areaAgric},${user.areaVeget},'{${user.culturas}}')`
        client.query(insertQuery, (err, result) => {
            if (!err) {
                res.send('Novo client adicionado com sucesso!');
            } else {
                console.log(err.message)
            }
        })
        client.end();
    }
})

app.put('/users/:id', (req, res) => {
    let user = req.body;
    let updateQuery = `update users
                       set cpf = ${user.cpf},
                       cnpj = ${user.cnpj},
                       nome = '${user.nome}',
                       nomeFazenda = '${user.nomeFazenda}'
                       cidade = '${user.cidade}',
                       estado = '${user.estado}',
                       areaTotal = ${user.areaTotal},
                       areaAgric = ${user.areaAgric},
                       areaVeget = ${user.areaVeget},
                       culturas = '{${user.culturas}}',
                       where id = ${user.id}`

    client.query(updateQuery, (err, result) => {
        if (!err) {
            res.send('Atualização feita com sucesso!')
        } else {
            console.log(err.message)
        }
    })
    client.end;
})

app.delete('/users/:id', (req, res) => {
    let insertQuery = `delete from users where id=${req.params.id}`

    client.query(insertQuery, (err, result) => {
        if (!err) {
            res.send('Delete feito com sucesso!')
        } else {
            console.log(err.message)
        }
    })
    client.end;
})