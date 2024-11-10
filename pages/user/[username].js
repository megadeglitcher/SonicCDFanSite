import { useRouter } from 'next/router';

const UserProfile = () => {
  // Use Next.js's useRouter hook to get the dynamic part of the URL
  const router = useRouter();
  const { username } = router.query;  // username will be the dynamic part of the URL

  // You can now use `username` to fetch user data, for example, from Firebase, API, etc.
  
  if (!username) {
    return <p>Loading...</p>; // Show loading while the username is still being captured
  }

  return (
    <div>
      <h1>{username}'s Profile</h1>
      {/* Here you can display the user profile info */}
    </div>
  );
};

export default UserProfile;
