import jwt from "jsonwebtoken";

const encode = (data: any) => {
    return jwt.sign({ data: data }, process.env.JWT_SECRET as string, { expiresIn: "15min" });
};

const decode = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        return decoded;
    } catch (err) {
        return null;
    }
}

export {
    encode,
    decode
}