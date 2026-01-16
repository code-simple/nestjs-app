export const authDocs = {
  query: {},
  mutation: {
    register: {
      description: `Registers a new user. 
If a user with the provided email already exists and is not a ghost user, registration fails with a conflict error.
If a ghost user with the email exists, their information is updated and they are converted to a regular user.
Sends a verification email and creates onboarding steps for the user.`,
    },
  },
};
