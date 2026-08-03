export const generateJoinCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TEAM-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const generateUniqueJoinCode = async (TeamModel) => {
  let code;
  let exists = true;
  while (exists) {
    code = generateJoinCode();
    const team = await TeamModel.findOne({ joinCode: code });
    exists = !!team;
  }
  return code;
};
