const fs = require('fs');
const express = require('express');
const { Router } = express;
const validateData = require('./middlewares/middlewares');

const routerProducto = new Router();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

class Contenedor {

    constructor(fileName) {
        this.fileName=fileName;
        this.id = 0;
        this.data =[];
    }

    async save(objeto) {
        await this.getAll();
        this.id++;
        this.data.push({
            id:this.id,
            product: objeto
        })
        await fs.promises.writeFile(`./src/Productos/${this.fileName}`,JSON.stringify(this.data, null, 2));
        return ({
            id:this.id,
            product: objeto
        });
    }

    async getById(id) {
        await this.getAll();
        return this.data.find((producto) => producto.id === parseInt(id))
    }

    async updateById(id,productoRecibido) {
        id = parseInt(id);

        await this.getAll();
        await fs.promises.unlink(`./src/Productos/${this.fileName}`);

        const productoActualizado = this.data.find((producto) => producto.id === id);
        productoActualizado.product = productoRecibido;

        const data = this.data.map((producto) => producto.id === id ? productoActualizado : producto);
        await fs.promises.writeFile(`./src/Productos/${this.fileName}`,JSON.stringify(data, null, 2));
        return productoActualizado
    }

    async getAll() {
        try {
            const data = await fs.promises.readFile(`./src/Productos/${this.fileName}`, 'utf-8')
            if (data) {
                this.data = JSON.parse(data);
                this.data.map((producto) => {
                    if (this.id < producto.id) {
                        this.id = producto.id
                    }
                })
                return this.data;
            }
        } catch (error) {
            return 
        }
    }

    async deleteById(id) {
        id = parseInt(id);
        await this.getAll();
        await fs.promises.unlink(`./src/Productos/${this.fileName}`);
        const data = this.data.filter((producto) => producto.id !== id);
        await fs.promises.writeFile(`./src/Productos/${this.fileName}`,JSON.stringify(data, null, 2));
    }

    async deleteAll() {
        await fs.promises.unlink(`./src/Productos/${this.fileName}`);
        this.id = 0;
        this.data =[];
    }

}

const productos = new Contenedor('productos.txt');

routerProducto.get('/', async (req, res) => {
    const listaProductos = await productos.getAll();
    if (listaProductos) {
        res.status(200).json(listaProductos)
    } else {
        res.status(200).json({error:'productos no encontrados,agregue un producto'})
    }
    
})

routerProducto.get('/:id', async (req, res) => {
    const producto = await productos.getById(req.params.id);
    if (producto) {
        res.status(200).json(producto)
    } else {
        res.status(200).json({error:'producto no encontrado'})
    }
    
})

routerProducto.post('/',validateData, async (req, res) => {
    if (req.body.title && req.body.price && req.body.thumbnail) {
        res.status(200).json(await productos.save(req.body))
    } else {
        res.status(200).json({error:'revise el body y los headers'})
    }
})

routerProducto.put('/:id', async (req, res) => {
    const producto = await productos.getById(req.params.id);
    if (req.body.title && req.body.price && req.body.thumbnail) {
        if (producto) {
            res.status(200).json(await productos.updateById(req.params.id,req.body))
        } else {
            res.status(200).json({error:'producto no encontrado'})
        }
    } else {
        res.status(200).json({error:'revise el body y los headers'})
    }

})

routerProducto.delete('/:id', async (req, res) => {
    const producto = await productos.getById(req.params.id);
    if (producto) {
        await productos.deleteById(req.params.id)
        res.status(200).json('Producto borrado');
    } else {
        res.status(200).json({error:'producto no encontrado'})
    }
    
    
})

app.use('/api/productos', routerProducto)

app.get('/', (req, res) => {
	// eslint-disable-next-line no-undef
	res.sendFile(__dirname + '/files/index.html')
})

// app.use('/', async (req, res) => {
//     res.status(200).send('service its wake up!')
// })

const PORT = 8080

app.listen(PORT, () => {
	console.log(`Server on port ${PORT}`)
})


