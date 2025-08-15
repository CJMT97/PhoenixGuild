import React, { useEffect, useState } from "react";
import { auth, db } from "./assets/firebase-config"; // your firebase initialized exports
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import "./assets/group.css";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [joinGroupName, setJoinGroupName] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    async function fetchGroups() {
      const groupsSnapshot = await getDocs(collection(db, "groups"));
      const allGroups = groupsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(allGroups);

      if (userId) {
        const myGroups = allGroups.filter((g) => g.members?.includes(userId));
        setUserGroups(myGroups);
      }
    }
    fetchGroups();
  }, [userId]);

  const fetchLeaderboard = async (groupId) => {
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) return;

    const membersIds = groupSnap.data().members || [];

    // Fetch each member's weeklyPoints
    const membersData = await Promise.all(
      membersIds.map(async (memberId) => {
        const memberRef = doc(db, "users", memberId);
        const memberSnap = await getDoc(memberRef);
        const data = memberSnap.exists() ? memberSnap.data() : {};
        return {
          id: memberId,
          name: data.name || "Anonymous",
          weeklyPoints: data.weeklyPoints || 0,
        };
      })
    );

    // Sort descending by weeklyPoints
    const sortedLeaderboard = membersData.sort(
      (a, b) => b.weeklyPoints - a.weeklyPoints
    );
    setLeaderboard(sortedLeaderboard);
  };

  const handleCreateGroup = async () => {
    if (!groupName || !userId) return;
    const groupRef = await addDoc(collection(db, "groups"), {
      name: groupName,
      members: [userId],
      createdAt: new Date(),
    });
    setGroups([
      ...groups,
      { id: groupRef.id, name: groupName, members: [userId] },
    ]);
    setGroupName("");
  };

  const handleJoinGroup = async (groupId) => {
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
    });
    const joinedGroup = groups.find((g) => g.id === groupId);
    if (joinedGroup && !userGroups.includes(joinedGroup)) {
      setUserGroups([...userGroups, joinedGroup]);
    }
  };

  const handleJoinByName = async () => {
    if (!joinGroupName) return;
    const q = query(
      collection(db, "groups"),
      where("name", "==", joinGroupName)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const groupDoc = querySnapshot.docs[0];
      await handleJoinGroup(groupDoc.id);
      setJoinGroupName("");
    } else {
      alert("Group not found!");
    }
  };

  return (
    <div className="groups-container">
      <h2>Groups</h2>

      {/* Create group */}
      <div className="group-create">
        <input
          type="text"
          placeholder="New Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button onClick={handleCreateGroup}>Create Group</button>
      </div>

      {/* Join group by name */}
      <div className="group-join-name">
        <input
          type="text"
          placeholder="Enter Group Name to Join"
          value={joinGroupName}
          onChange={(e) => setJoinGroupName(e.target.value)}
        />
        <button onClick={handleJoinByName}>Join Group</button>
      </div>

      {/* Join group from list */}
      <h3>Available Groups</h3>
      <ul>
        {groups
          .filter((g) => !g.members?.includes(userId))
          .map((g) => (
            <li key={g.id}>
              {g.name}{" "}
              <button onClick={() => handleJoinGroup(g.id)}>Join</button>
            </li>
          ))}
      </ul>

      {/* User's groups */}
      <h3>My Groups</h3>
      <ul>
        {userGroups.map((g) => (
          <li key={g.id}>
            {g.name}{" "}
            <button onClick={() => fetchLeaderboard(g.id)}>
              View Leaderboard
            </button>
          </li>
        ))}
      </ul>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="leaderboard">
          <h3>Leaderboard</h3>
          <ol>
            {leaderboard.map((m, idx) => (
              <li key={idx}>
                {m.name || "Anonymous"} - {m.weeklyPoints || 0} points
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
