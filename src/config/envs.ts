import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars{
    PORT_INSUMOS: number;
    DATABASE_URL:string;
}

const envsSchema = joi.object({
    PORT_INSUMOS: joi.number().required(),
    DATABASE_URL: joi.string().required()
})
.unknown(true);

const {error, value} = envsSchema.validate(process.env);

if(error){
    throw new Error(`Config validation error: ${error.message}`);
}

const EnvVars: EnvVars = value;

export const envs = {
    port_insumos: EnvVars.PORT_INSUMOS,
    databaseUrl: EnvVars.DATABASE_URL,
}
