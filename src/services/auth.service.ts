import jwt, { type JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import ServerError from "../helpers/error.helper.ts";
import type { UserType } from "../models/User.ts";
import { userRepository } from "../repositories/user.repository.ts";
import mailerTransporter from "../config/mailer.config.ts";
import ENVIRONTMENT from "../config/environment.config.ts";

/** `toObject()` includes `_id`; `InferSchemaType` does not list it on plain objects. */
function userDocumentId(user: UserType): string {
  return String((user as UserType & { _id: unknown })._id);
}

function jwtSecret(): string {
  const key = ENVIRONTMENT.JWT_SECRET_KEY;
  if (!key) {
    throw new ServerError({
      message: "JWT secret is not configured",
      status: 500,
    });
  }
  return key;
}

function singleQueryParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = { email: string; password: string };

export type VerifyEmailInput = { verify_email_token?: string | string[] };

export type ResetPasswordRequestInput = { email: string };

export type ResetPasswordInput = {
  reset_password_token: string | string[] | undefined;
  password: string;
};

class AuthService {
  async register({ name, email, password }: RegisterInput) {
    if (!name || !email || !password) {
      throw new ServerError({
        message: "Name, email and password are required",
        status: 400,
      });
    }
    const emailAlreadyInUse = await userRepository.findByEmail(email);

    if (emailAlreadyInUse) {
      throw new ServerError({ message: "Email already exists", status: 400 });
    }
    const verify_email_token = jwt.sign({ email, name }, jwtSecret(), {
      expiresIn: "24h",
    });

    await this.sendVerificationEmail(email, name, verify_email_token);
    await userRepository.create({
      name,
      email,
      password,
    });
  }

  async login({ email, password }: LoginInput) {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new ServerError({ message: "User not found", status: 404 });
    }

    const storedHash = user.password;
    if (typeof storedHash !== "string") {
      throw new ServerError({ message: "Invalid credentials", status: 401 });
    }

    if (!user.isVerified) {
      throw new ServerError({ message: "Email not verified", status: 401 });
    }

    const isSamePassword = await bcrypt.compare(password, storedHash);
    if (!isSamePassword) {
      throw new ServerError({ message: "Invalid credentials", status: 401 });
    }

    const auth_token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        id: userDocumentId(user),
        email_verified: user.isVerified,
        created_at: user.createdAt,
      },
      jwtSecret(),
      { expiresIn: "7d" },
    );

    return auth_token;
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    verify_email_token: string,
  ) {
    await mailerTransporter.sendMail({
      from: ENVIRONTMENT.MAIL_EMAIL,
      to: email,
      subject: "[Proyecto de ExpressNodeMongo] Verificacion de email",
      html: `
          <h1>Hola ${name}, bienvenido a nuestro proyecto de Express, Node y MongoDB</h1>
          <p>Gracias por registrarte en nuestro proyecto. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          <p><a href="${ENVIRONTMENT.URL_FRONTEND}/verify-email?verify_email_token=${verify_email_token}">Click here to verify your email</a></p>
          <p>¡Disfruta de tu experiencia con nuestro proyecto!</p>
        `,
    });
  }

  async verifyEmail({ verify_email_token }: VerifyEmailInput) {
    const token = singleQueryParam(verify_email_token);
    if (!token) {
      throw new ServerError({
        message: "Verification token is required",
        status: 400,
      });
    }

    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, jwtSecret()) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const raw = jwt.decode(token);
        if (
          raw &&
          typeof raw === "object" &&
          "email" in raw &&
          "name" in raw &&
          typeof (raw as JwtPayload).email === "string" &&
          typeof (raw as JwtPayload).name === "string"
        ) {
          const { email, name } = raw as JwtPayload & {
            email: string;
            name: string;
          };
          await this.sendVerificationEmail(email, name, token);
        }
        throw new ServerError({
          message: "Verification token has expired",
          status: 400,
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new ServerError({
          message: "Invalid verification token",
          status: 400,
        });
      }
      throw new ServerError({
        message: "Internal server error",
        status: 500,
      });
    }

    const email = decoded.email;
    if (typeof email !== "string") {
      throw new ServerError({
        message: "Invalid verification token",
        status: 400,
      });
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new ServerError({ message: "User not found", status: 404 });
    }

    if (user.isVerified) {
      throw new ServerError({ message: "Email already verified", status: 400 });
    }

    await userRepository.update(userDocumentId(user), { isVerified: true });

    return {
      message: "Email verified successfully",
      status: 200,
      ok: true,
    };
  }

  async resetPasswordRequest({ email }: ResetPasswordRequestInput) {
    if (!email) {
      throw new ServerError({ message: "Email is required", status: 400 });
    }
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new ServerError({ message: "User not found", status: 404 });
      }

      const reset_password_token = jwt.sign({ email }, jwtSecret(), {
        expiresIn: "1d",
      });

      await mailerTransporter.sendMail({
        from: ENVIRONTMENT.MAIL_EMAIL,
        to: email,
        subject: "Reset Password",
        html: `
            <h1> Reset Password</h1>
            <p>You have requested to reset your password. Click the link below to do so</p>
            <a href="${ENVIRONTMENT.URL_FRONTEND + `/reset-password?reset_password_token=${reset_password_token}`}">Click here to reset</a>
            <span>If you did not request this, please ignore this email.</span>
          `,
      });
    } catch (error) {
      if (error instanceof ServerError) {
        throw error;
      }
      const msg =
        error instanceof Error ? error.message : "Unknown error";
      throw new ServerError({
        message: "Error sending reset password email: " + msg,
        status: 500,
      });
    }
  }

  async resetPassword({
    reset_password_token,
    password,
  }: ResetPasswordInput) {
    const token = singleQueryParam(reset_password_token);
    if (!token || !password) {
      throw new ServerError({ message: "All fields are required", status: 400 });
    }
    try {
      const payload = jwt.verify(token, jwtSecret()) as JwtPayload;
      const email = payload.email;
      if (typeof email !== "string") {
        throw new ServerError({
          message: "Invalid password reset token",
          status: 400,
        });
      }
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new ServerError({ message: "User not found", status: 404 });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await userRepository.update(userDocumentId(user), {
        password: hashedPassword,
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ServerError({
          message: "Invalid password reset token",
          status: 400,
        });
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new ServerError({
          message: "Password reset token has expired",
          status: 400,
        });
      }
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;
