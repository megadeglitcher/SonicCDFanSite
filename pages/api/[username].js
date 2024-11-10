// pages/api/[username].js

export default async function handler(req, res) {
  const { username } = req.query;

  // Example of user data
  const users = {
    SDG: { username: 'SDG', createdAt: '2023-01-01' },
    Garcello: { username: 'Garcello', createdAt: '2023-02-01' },
  };

  const user = users[username];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json(user);
}
