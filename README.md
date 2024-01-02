# Mongoose Plugin Model Paginate

## Descripción

El plugin Mongoose Model Paginate es una extensión para el framework Mongoose que proporciona funcionalidad de paginación para consultas a modelos de base de datos.

## Instalación

1. Instala el paquete npm del plugin ejecutando el siguiente comando:

    ```shell
    npm install mongoose-plugin-model-paginate
    ```

2. Importa el plugin en tu archivo de configuración de Mongoose:

    ```javascript
    const mongoose = require('mongoose');
    const modelPaginatePlugin = require('mongoose-plugin-model-paginate');

    mongoose.plugin(modelPaginatePlugin);
    ```

## Uso

Una vez que hayas instalado y configurado el plugin, puedes utilizar la funcionalidad de paginación en tus consultas a modelos de Mongoose de la siguiente manera:

    ```javascript
    import GroupModel from "../db/group.model"

    const data = await GroupModel.paginate({name:"test"},  {page:1, page_size:25});
    return data;
    ```