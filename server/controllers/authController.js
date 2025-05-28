import User from '../models/userModel.js';
import OperationError from '../utils/operationError.js';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'node:util';
import sendEmail from '../utils/email.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, reply) => {
  const token = signToken(user._id);
  user.password = undefined;
  const cookieMaxAge = Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60;
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'lax' : 'strict',
    path: '/',
    maxAge: cookieMaxAge,
  };

  reply.code(statusCode).setCookie('jwt', token, cookieOptions).send({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = async (request, reply) => {
  const { name, email, password, passwordConfirm } = request.body;
  if (!name || !email || !password || !passwordConfirm) {
    throw new OperationError('Please provide all required fields!', 400);
  }
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  createSendToken(newUser, 201, reply);
};

export const login = async (request, reply) => {
  const { email, password } = request.body;

  if (!email || !password) {
    throw new OperationError('Please provide email and password!', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(user.password, password))) {
    throw new OperationError('Incorrect email or password', 401);
  }

  createSendToken(user, 200, reply);
};

export const logout = async (request, reply) => {
  if (!request.user) return;
  request.user.passwordResetToken = undefined;
  request.user.passwordResetExpires = undefined;
  await request.user.save({ validateBeforeSave: false });
  reply
    .clearCookie('jwt', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .code(200)
    .send({
      status: 'success',
      message: 'Logged out successfully!',
    });
};

export const protect = async (request, _reply) => {
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];
  } else if (request.cookies.jwt) {
    token = request.cookies.jwt;
  }

  if (!token) {
    throw new OperationError('You are not logged in! Please log in.', 401);
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new OperationError(
      'The user belonging to this token does no longer exist.',
      401,
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw new OperationError(
      'User recently changed password! Please log in again.',
      401,
    );
  }

  request.user = currentUser;
};

export const restrictTo = (...roles) => {
  return (request, _reply) => {
    if (!roles.includes(request.user.role)) {
      throw new OperationError(
        'You do not have permission to perform this action.',
        403,
      );
    }
  };
};

export const forgotPassword = async (request, reply) => {
  const { email } = request.body;
  if (!email) {
    throw new OperationError('Please provide your email address!', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new OperationError('There is no user with that email address.', 404);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const message = `Forgot your password? Enter your reset token in the form to reset it: ${resetToken}\nIf you didn't request this, please ignore this email.`;
  const html = `
          <!DOCTYPE html><html lang="en"><body>
          <h1 style="margin:0 0 16px">Password reset</h1>
          <p>Enter the token in the form:</p>
          <p style="padding:12px 24px; background:#eee; font-weight:bold">${resetToken}</p>
          <p style="font-size:14px;color:#666">If you didn't request this, please ignore this email.</p>
          </body></html>`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for only 10 min)',
      message,
      html,
    });

    reply.code(200).send({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new OperationError(
      'There was an error sending the email. Try again later!',
      500,
    );
  }
};

export const resetPassword = async (request, reply) => {
  const { password, passwordConfirm } = request.body;
  const { token } = request.params;

  // if (!password || !passwordConfirm) {
  //   throw new OperationError(
  //     'Please provide a new password and confirm it!',
  //     400,
  //   );
  // }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new OperationError('Token is invalid or has expired.', 400);
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, reply);
};

export const updatePassword = async (request, reply) => {
  const { passwordCurrent, password, passwordConfirm } = request.body;

  if (!passwordCurrent || !password || !passwordConfirm) {
    throw new OperationError('Please provide all required fields!', 400);
  }

  const user = await User.findById(request.user.id).select('+password');

  if (!(await user.correctPassword(user.password, passwordCurrent))) {
    throw new OperationError('Your current password is wrong.', 401);
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createSendToken(user, 200, reply);
};
