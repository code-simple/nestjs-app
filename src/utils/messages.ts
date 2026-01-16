export default {
  SUCCESS_MESSAGE: 'Operation successfull',
  INVALID_CREDENTIALS: 'Email or password in incorrect',
  VERIFY_YOUR_EMAIL:
    'You are successfully registered. Please check your email to verify your account',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  NOT_FOUND: 'Record not found',
  USER_NOT_FOUND_BY_USER_ID: (userId: number) => `User with ID ${userId} not found`,
  EMAIL_VERIFICATION_OTP_EXPIRED: 'OTP expired. A new OTP has been sent to your email',
  EMAIL_VERIFICATION_SUCCESSFULL: 'Email has been verified',
  ROLE_NOT_FOUND: 'Role not found',
  VERIFICATION_OTP_EXPIRED: 'OTP expired. A new OTP has been sent to your email',
  OTP_VERIFIED_SUCCESSFULLY: 'OTP verified successfully',
  FORGOT_PASSWORD_EMAIL_SENT: 'Forgot Password Email Sent',
  PASSWORD_RESET_SUCCESSFULLY: 'Password has been reset successfully',
  UNAUTHORIZED: 'You are not authorized to perform this action',
};

export const emailMessages = {
  userRegistration: {
    welcomeText: 'Welcome to Our App!',
  },
  tournamentInvitation: {
    subject: 'You are invited to a tournament',
  },
  forgotPassword: {
    subject: 'Reset Your Password',
  },
};
