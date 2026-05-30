import Fastify from "fastify";
import bcrypt from "bcryptjs";

const app = Fastify({ logger: true });

const Users = [];

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}

const users: User[] = [];


app.get('/', async () => {
    return {users};
});

app.post("/registre", async (request, reply) =>{
    const {name, email, password} = request.body as any;


    const user = users.find((user) => user.email === email);
    if (user) {
        return reply.status(409).send({message: " Email ja cadastrado."})
            }

    const hashedPassword = await bcrypt.hashSync(password, 10);

    const newUser = { id: users.length + 1, name, email, password: hashedPassword };

    users.push(newUser);
    return reply.status(201).send({message: "Usuário cadastrado com sucesso.", user: newUser})

})


const start = async() => {
    try{
        await app.listen({port:3333});

    } catch (err){
        app.log.error(err);
        process.exit(1);
    }
};