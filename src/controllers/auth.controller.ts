import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";

export type RegisterBody = {
  email: string;
  password: string;
  username: string;
}

export type LoginBody = {
  email?: string;
  password: string;
  username?: string;
}

export const register = async (req: Request, res: Response) => {
  console.log(req.body);
  const { email, password, username } = req.body as RegisterBody;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      }
    })
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, username, password } = req.body as LoginBody;
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ]
      }
    })

    console.log(user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ message: "Logged in successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error logging in" });
  }
}

// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
//     res.status(200).json({ token });
//   } catch (error) {
//     res.status(500).json({ message: "Error logging in" });
//   }
// };

// export const logout = async (req: Request, res: Response) => {
//   res.clearCookie("token");
//   res.status(200).json({ message: "Logged out" });

// };


