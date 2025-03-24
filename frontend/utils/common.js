export const getConservationId = (users) => {
  const userIds = users.map((user) => user?.id);
  const roomId = userIds.join("-");
  return roomId;
};
