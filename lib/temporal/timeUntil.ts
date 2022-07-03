export const timeUntil = (stream: string): string => {
  const streamTime = new Date(stream).getTime();
  const currentTime = new Date(Date.now()).getTime();
  const diffTime = Math.abs(Number(streamTime) - Number(currentTime));
  const days = Math.floor(diffTime / (24 * 60 * 60 * 1000));
  const daysms = diffTime % (24 * 60 * 60 * 1000);
  const hours = Math.floor(daysms / (60 * 60 * 1000));
  const hoursms = diffTime % (60 * 60 * 1000);
  const minutes = Math.floor(hoursms / (60 * 1000));
  if (days > 5) {
    return `${days} days `;
  }
  if (days > 0) {
    return `${days} days ${hours} hours`;
  }
  if (hours > 0) {
    return `${hours} hours ${minutes} minutes`;
  }
  return `${minutes} minutes`;
};
