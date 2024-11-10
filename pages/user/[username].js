// pages/user/[username].js

import { useEffect, useState } from 'react';

const UserProfile = ({ username }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from the API route
    fetch(`/api/${username}`)
      .then((response) => response.json())
      .then((data) => setUserData(data))
      .catch((error) => console.error('Error fetching user data:', error));
  }, [username]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{userData.username}'s Profile</h1>
      <p>Account created on: {userData.createdAt}</p>
    </div>
  );
};

// This function extracts the username from the URL
UserProfile.getInitialProps = ({ query }) => {
  return { username: query.username };
};

export default UserProfile;
