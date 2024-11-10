// pages/user/[username].js

import { useEffect, useState } from 'react';

const UserProfile = ({ username }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from the API route
    fetch(`/api/${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('User not found');
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);  // Set the user data in state
        setLoading(false);   // Set loading to false
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setUserData(null);
        setLoading(false);
      });
  }, [username]);

  // If the data is still loading, show a loading message
  if (loading) {
    return <div>Loading...</div>;
  }

  // If no user data is available, show an error message
  if (!userData) {
    return <div>User not found.</div>;
  }

  return (
    <div>
      <h1>{userData.username}'s Profile</h1>
      <p>Account created on: {userData.createdAt}</p>
    </div>
  );
};

// This function will fetch the username from the URL params
UserProfile.getInitialProps = ({ query }) => {
  return { username: query.username };
};

export default UserProfile;
