const users = [];
const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  //validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }
  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  // validate username
  if (existingUser) {
    console.log("ran")
    return {
      error: "Username is already taken",
    };
  }
  const user = { id, username, room };
  users.push(user);
  return { user };
};
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
const getUser=(id)=>{
  return users.find(user=>user.id===id)
  
}
const getUsersInRoom=(room)=>{
    return users.filter(user=>{
        return user.room===room
    })
     
}
module.exports={addUser,removeUser,getUser,getUsersInRoom}