export const tournamentDocs = {
  query: {},
  mutation: {
    rejectTournamentInvitation: {
      description: `Rejects a tournament invitation for a user. 
Sets the user's status in TournamentPlayer to 'out' and deletes the corresponding invitation from TournamentInvitation. 
Returns the updated TournamentPlayer entity.`,
    },
  },
};
