import { Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";

const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: "1d" as SignOptions["expiresIn"],
  };

  return jwt.sign({ id }, secret, options);
};

export const register = async (req: AuthRequest, res: Response) => {
  console.log("🚀 ~ register ~ req:", req.body);
  try {
    const { fullName, username, password } = req.body;

    if (!fullName || !username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const user = await User.create({
      fullName,
      username,
      password,
    });

    const token = signToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password" });
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
