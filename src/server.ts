import Fastify from "fastify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = Fastify({ logger: true });

const JWT_SECRET = "minha_chave_secreta";

interface JWTUser {
    id: number;
    email: string;
    iat: number;
    ex: number;
}
declare module "fastify" {
    export interface FastifyRequest {
        user?: (id: number, email: string, iat: number, ex: number)
    }
}

async function authenticate(request: FastifyRequest, reply: FastifyReply) {

    try {
    const token = request.headers.authorization?.replace("bearer", "")

    if(!token){
        throw new Error("Token nao fornecido");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTUser;
    request.user = decodedJwt
} catch (error) {
   reply.status(401).send({ message: "Token invalido" });
}
}
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}

const users: User[] = [];

app.get("/", async () => {
    return { users };
});

app.post("/registre", async (request, reply) => {
    const { name, email, password } = request.body as any;




    const exists = users.find((u) => u.email === email);
    if (exists) {
        return reply.status(409).send({ message: "Email ja cadastrado." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser: User = { id: users.length + 1, name, email, password: hashedPassword };
    users.push(newUser);

    return reply.status(201).send({ message: "Usuario cadastrado com sucesso.", user: newUser });
});

app.post("/login", async (request, reply) => {
    const { email, password } = request.body as any;

    const user = users.find((u) => u.email === email);
    if (!user) {
        return reply.status(401).send({ message: "Email ou senha invalidos." });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
        return reply.status(401).send({ message: "Email ou senha invalidos." });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    return reply.send({ token });
});

app.get("/me",{onRequest:[authenticate]}, async (request, reply) => {
   
    return request.user;
});

const start = async () => {
    try {
        await app.listen({ port: 3333 });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
