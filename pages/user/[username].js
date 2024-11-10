import { useRouter } from 'next/router';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-setup'; // Assuming you have Firebase set up

const UserProfile = () => {
  // Use Next.js's useRouter hook to get the dynamic part of the URL
  const router = useRouter();
  const { username } = router.query;  // username will be the dynamic part of the URL

  // State to hold user data
  const [userData, setUserData] = React.useState(null);

  // Fetch user data based on username
  React.useEffect(() => {
    if (username) {
      const fetchUserData = async () => {
        const userDocRef = doc(db, 'users', username);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data());
        }
      };
      fetchUserData();
    }
  }, [username]);

  if (!userData) {
    return <p>Loading...</p>; // Show loading while fetching user data
  }

  return (
    <div>
      <h1>{userData.username}'s Profile</h1>
      <p>Account created on: {userData.createdAt}</p> {/* Assuming createdAt is part of user data */}
      {/* Add more user profile details as needed */}
    </div>
  );
};

export default UserProfile;
